/* =====================================================================
   INTERIORES PROCEDURALES · cualquier edificio del mundo se puede abrir por dentro
   - El plano sale de la huella del edificio (su rectángulo orientado) y de su uso: casa (con el patio de las casas
     paisas), apartamentos, local comercial, oficina, iglesia, colegio, bodega.
   - Partición binaria (BSP) guiada por un programa de cuartos con áreas reales; puertas entre cuartos vecinos de modo
     que todo queda conectado desde la entrada (árbol de expansión); ventanas en los muros de afuera.
   - Muebles con medidas reales contra los muros y con espacio para pasar (cama 1,4×1,9 m, nevera 0,7×0,7 m…).
   - Choques para caminar adentro (`solido`), y dibujo de planta para la vista cenital y el pixel.
   Determinista: el mismo edificio tiene siempre el mismo interior.
   ===================================================================== */
const PROGRAMAS = {
  casa: [['sala', 18], ['comedor', 10], ['cocina', 8], ['alcoba', 11], ['alcoba', 9], ['bano', 4], ['patio', 9], ['alcoba', 9], ['ropas', 4]],
  apartamento: [['sala', 16], ['cocina', 7], ['alcoba', 10], ['alcoba', 8], ['bano', 4], ['balcon', 4]],
  comercio: [['local', 45], ['bodega', 12], ['bano', 3], ['oficina', 8]],
  oficina: [['recepcion', 14], ['oficina', 12], ['oficina', 12], ['sala_juntas', 16], ['cocineta', 6], ['bano', 4], ['bano', 4]],
  iglesia: [['nave', 160], ['altar', 30], ['sacristia', 14], ['bano', 4]],
  colegio: [['aula', 48], ['aula', 48], ['aula', 48], ['rectoria', 14], ['bano', 8], ['patio', 60]],
  bodega: [['bodega', 200], ['oficina', 12], ['bano', 4]],
  /* lugares jugables (MC.Lugares): talleres, tiendas, centros comerciales, bibliotecas y restaurantes */
  taller: [['taller', 60], ['repuestos', 14], ['mostrador_taller', 10], ['bano', 3]],
  tienda: [['tienda', 40], ['probador', 4], ['probador', 4], ['caja', 6], ['bodega', 10]],
  centro_comercial: [['pasillo_cc', 140], ['local', 40], ['local', 40], ['local', 36], ['local', 36], ['comidas', 70], ['bano', 10], ['bano', 10]],
  biblioteca: [['lectura', 80], ['estanteria', 60], ['infantil', 30], ['computadores', 24], ['recepcion', 12], ['bano', 5]],
  restaurante: [['comedor_r', 50], ['cocina', 18], ['caja', 5], ['bano', 4], ['bano', 4]]
};
/* cuartos que pueden aparecer o no (cada casa es distinta aunque salga del mismo programa) */
const OPCIONALES = { casa: [['estudio', 8], ['terraza', 9], ['alcoba', 9], ['bano', 3.5], ['sala_tv', 10]], apartamento: [['estudio', 7], ['alcoba', 9], ['bano', 3.5], ['ropas', 3]] };
const PISO_DE = { taller: '#9ea3a8', repuestos: '#b9b4a8', mostrador_taller: '#c9c1b0', tienda: '#efe9dc', probador: '#d9cfe0', caja: '#e6e0d2', pasillo_cc: '#f1eee6', comidas: '#e9dcc5', lectura: '#c9a77c', estanteria: '#b88e62', infantil: '#bfe0c8', computadores: '#d4d7dc', comedor_r: '#c49a6c', estudio: '#c9a77c', terraza: '#c8b9a0', sala_tv: '#d6b48a', sala: '#d6b48a', comedor: '#d6b48a', alcoba: '#c49a6c', cocina: '#e8e2d4', bano: '#cfe3ea', patio: '#a8b89a', ropas: '#e0dbcf', balcon: '#cfc6b5', local: '#e6e0d2', bodega: '#bdb8ad', oficina: '#d0c8b8', recepcion: '#e8e2d4', sala_juntas: '#c9b391', cocineta: '#e8e2d4', nave: '#d9c9a8', altar: '#b5542f', sacristia: '#c9b391', aula: '#d8d0bc', rectoria: '#c9b391', pasillo: '#d9d2c2' };
const MUEBLES = { taller: [['banco_trabajo', 2.2, .8], ['elevador', 2.6, 1.6], ['herramientas', 1.6, .5], ['compresor', .6, .6], ['soporte_bici', 1.2, .5]], repuestos: [['estante', 2, .5], ['estante', 2, .5], ['llantas', 1, 1]], mostrador_taller: [['mostrador', 2, .6]], tienda: [['perchero', 1.6, .5], ['perchero', 1.6, .5], ['vitrina', 1.4, .6], ['espejo', .8, .2], ['exhibidor', 1.2, 1.2]], probador: [['espejo', .6, .15]], caja: [['mostrador', 1.8, .6]], pasillo_cc: [['banca', 1.6, .5], ['matera', .8, .8], ['fuente', 2.4, 2.4], ['banca', 1.6, .5]], comidas: [['mesa_cc', 1.2, 1.2], ['mesa_cc', 1.2, 1.2], ['mesa_cc', 1.2, 1.2], ['mesa_cc', 1.2, 1.2]], lectura: [['mesa_lectura', 2.4, 1.2], ['mesa_lectura', 2.4, 1.2], ['estante', 2.4, .4], ['sillon', .9, .9]], estanteria: [['estante', 2.4, .4], ['estante', 2.4, .4], ['estante', 2.4, .4], ['estante', 2.4, .4]], infantil: [['tapete', 2.4, 1.8], ['estante', 1.6, .4], ['puff', .6, .6]], computadores: [['escritorio', 1.4, .7], ['escritorio', 1.4, .7], ['escritorio', 1.4, .7]], comedor_r: [['mesa_r', 1, 1], ['mesa_r', 1, 1], ['mesa_r', 1, 1], ['mesa_r', 1, 1], ['mesa_r', 1, 1]], estudio: [['escritorio', 1.3, .65], ['biblioteca', 1.6, .4], ['silla', .5, .5]], terraza: [['hamaca', 2.6, .9], ['matera', .6, .6], ['matera', .6, .6]], sala_tv: [['sofa', 2, .9], ['tv', 1.4, .4], ['puff', .6, .6]], sala: [['sofa', 2.1, .9], ['mesa_centro', 1, .6], ['tv', 1.4, .4], ['matera', .5, .5]], comedor: [['comedor', 1.6, .9]], cocina: [['estufa', .6, .6], ['nevera', .7, .7], ['lavaplatos', 1.2, .6], ['mesón', 1.6, .6]], alcoba: [['cama', 1.4, 1.9], ['closet', 1.6, .6], ['mesa_noche', .45, .45]], bano: [['inodoro', .4, .65], ['lavamanos', .5, .45], ['ducha', .9, .9]], patio: [['matera', .5, .5], ['matera', .5, .5], ['lavadero', .8, .6]], ropas: [['lavadora', .6, .6]], balcon: [['matera', .5, .5]], local: [['mostrador', 2.4, .7], ['estante', 2, .5], ['estante', 2, .5], ['nevera', .8, .7]], bodega: [['estante', 2.4, .8], ['estante', 2.4, .8], ['estiba', 1.2, 1]], oficina: [['escritorio', 1.4, .7], ['silla', .55, .55], ['archivador', .9, .5]], recepcion: [['mostrador', 2, .7], ['sofa', 1.8, .8]], sala_juntas: [['mesa_juntas', 3, 1.2]], cocineta: [['mesón', 1.6, .6], ['nevera', .7, .7]], nave: [['banca', 3, .5], ['banca', 3, .5], ['banca', 3, .5], ['banca', 3, .5], ['banca', 3, .5], ['banca', 3, .5]], altar: [['altar', 2.4, 1]], sacristia: [['closet', 1.6, .6]], aula: [['tablero', 3, .15], ['pupitre', .7, .5], ['pupitre', .7, .5], ['pupitre', .7, .5], ['pupitre', .7, .5], ['pupitre', .7, .5], ['pupitre', .7, .5]], rectoria: [['escritorio', 1.4, .7]] };
const Interiores = {
  PROGRAMAS, PISO_DE, MUEBLES,
  programaDe(e) { const k = e.clase || ''; if (k === 'iglesia') return 'iglesia'; if (k === 'educativo') return 'colegio'; if (k === 'nave' || k === 'parqueadero' || k === 'techo') return 'bodega'; if (k === 'comercio') return 'comercio'; if (k === 'civico' || k === 'salud' || k === 'transporte') return 'oficina'; if (k === 'edificio' || k === 'torre') return 'apartamento'; return 'casa'; },
  /* plano local (metros, origen en una esquina, x a lo largo del edificio) */
  generar(e, op = {}) {
    const r = mulberry32(op.semilla ?? ((e.s || .5) * 1e9 | 0)), W = Math.max(5, (e.hw || 4) * 2), D = Math.max(5, (e.hd || 4) * 2), prog = op.programa || Interiores.programaDe(e), lista = Interiores.variar(PROGRAMAS[prog].slice(), prog, r, W * D);
    const areaT = W * D, sumaP = lista.reduce((a, q) => a + q[1], 0), escala = areaT / sumaP, cuartos = [];
    /* BSP: parte el rectángulo en dos con una proporción que respeta el área pedida de cada lado */
    const partir = (x, y, w, h, items) => {
      if (items.length === 1 || w * h < 8) { cuartos.push({ tipo: items[0][0], x, y, w, h }); for (const extra of items.slice(1)) cuartos.push({ tipo: extra[0], x, y, w: 0, h: 0, sinEspacio: true }); return; }
      const A = items.reduce((a, q) => a + q[1], 0); let mejor = 1, bd = 1e9, acum = 0; for (let i = 1; i < items.length; i++) { acum += items[i - 1][1]; const d = Math.abs(acum / A - .5); if (d < bd) { bd = d; mejor = i; } }
      const izq = items.slice(0, mejor), der = items.slice(mejor), f = izq.reduce((a, q) => a + q[1], 0) / A, porAncho = w >= h ? true : w * 1.2 > h && r() < .3;
      if (porAncho) { const c = Math.max(1.6, Math.min(w - 1.6, w * f)); partir(x, y, c, h, izq); partir(x + c, y, w - c, h, der); }
      else { const c = Math.max(1.6, Math.min(h - 1.6, h * f)); partir(x, y, w, c, izq); partir(x, y + c, w, h - c, der); }
    };
    partir(0, 0, W, D, lista.map(q => [q[0], q[1] * escala]));
    const C2 = cuartos.filter(c => !c.sinEspacio);
    /* vecinos: comparten un muro de al menos 0,9 m (cabe una puerta) */
    const muro = (a, b) => { const e2 = .01; if (Math.abs(a.x + a.w - b.x) < e2 || Math.abs(b.x + b.w - a.x) < e2) { const y0 = Math.max(a.y, b.y), y1 = Math.min(a.y + a.h, b.y + b.h); if (y1 - y0 >= .9) return { x: Math.abs(a.x + a.w - b.x) < e2 ? a.x + a.w : a.x, y: (y0 + y1) / 2, vertical: true, largo: y1 - y0 }; } if (Math.abs(a.y + a.h - b.y) < e2 || Math.abs(b.y + b.h - a.y) < e2) { const x0 = Math.max(a.x, b.x), x1 = Math.min(a.x + a.w, b.x + b.w); if (x1 - x0 >= .9) return { x: (x0 + x1) / 2, y: Math.abs(a.y + a.h - b.y) < e2 ? a.y + a.h : a.y, vertical: false, largo: x1 - x0 }; } return null; };
    /* entrada: el cuarto público más cercano a la fachada (y = 0); puertas por un árbol de expansión desde ahí */
    const pub = ['sala', 'local', 'recepcion', 'nave', 'aula', 'bodega', 'pasillo'], ent = C2.slice().sort((a, b) => (a.y - b.y) || (pub.includes(b.tipo) - pub.includes(a.tipo)))[0], puertas = [{ x: ent.x + ent.w / 2, y: 0, vertical: false, ancho: prog === 'iglesia' ? 2.4 : 1.1, entrada: true }], dentro = new Set([ent]);
    while (dentro.size < C2.length) { let par = null; for (const a of dentro) { for (const b of C2) { if (dentro.has(b)) continue; const m2 = muro(a, b); if (m2 && (!par || (b.tipo === 'bano') < (par.b.tipo === 'bano'))) par = { a, b, m: m2 }; } } if (!par) break; dentro.add(par.b); puertas.push({ x: par.m.x, y: par.m.y, vertical: par.m.vertical, ancho: .9 }); }
    /* ventanas en los muros de afuera de cuartos con luz (no en baños ni bodegas) */
    const ventanas = []; for (const c of C2) { if (['bano', 'bodega', 'ropas'].includes(c.tipo)) continue; if (c.y < .01 && c !== ent) ventanas.push({ x: c.x + c.w / 2, y: 0, vertical: false, ancho: Math.min(1.8, c.w * .5) }); if (c.y + c.h > D - .01) ventanas.push({ x: c.x + c.w / 2, y: D, vertical: false, ancho: Math.min(1.8, c.w * .5) }); if (c.x < .01) ventanas.push({ x: 0, y: c.y + c.h / 2, vertical: true, ancho: Math.min(1.5, c.h * .4) }); if (c.x + c.w > W - .01) ventanas.push({ x: W, y: c.y + c.h / 2, vertical: true, ancho: Math.min(1.5, c.h * .4) }); }
    /* muebles contra los muros, sin tapar puertas, con 0,6 m para pasar */
    const muebles = [], libreDePuerta = (x, y, w, h) => puertas.every(p => Math.hypot(clamp(p.x, x, x + w) - p.x, clamp(p.y, y, y + h) - p.y) > 1.1);
    for (const c of C2) { const L = (MUEBLES[c.tipo] || []).slice(); let i = 0;
      for (const [tipo, mw, mh] of L) { let puesto = false; for (let intento = 0; intento < 12 && !puesto; intento++, i++) { const lado = i % 4, rot = lado % 2 === 1, w2 = rot ? mh : mw, h2b = rot ? mw : mh; if (w2 > c.w - .3 || h2b > c.h - .3) continue; const t = r(); let x, y; if (lado === 0) { x = c.x + .1 + t * (c.w - w2 - .2); y = c.y + .1; } else if (lado === 1) { x = c.x + c.w - w2 - .1; y = c.y + .1 + t * (c.h - h2b - .2); } else if (lado === 2) { x = c.x + .1 + t * (c.w - w2 - .2); y = c.y + c.h - h2b - .1; } else { x = c.x + .1; y = c.y + .1 + t * (c.h - h2b - .2); }
          if (tipo === 'banca' || tipo === 'pupitre' || tipo === 'mesa_centro' || tipo === 'comedor' || tipo === 'mesa_juntas' || tipo === 'estiba') { x = c.x + (c.w - w2) / 2 + (r() - .5) * Math.max(0, c.w - w2 - 1.2); y = c.y + .8 + r() * Math.max(0, c.h - h2b - 1.6); }
          const choca = muebles.some(m => x < m.x + m.w + .6 && x + w2 + .6 > m.x && y < m.y + m.h + .6 && y + h2b + .6 > m.y); if (!choca && libreDePuerta(x, y, w2, h2b)) { muebles.push({ tipo, x, y, w: w2, h: h2b, cuarto: c.tipo }); puesto = true; } } } }
    const pisos = Math.max(1, e.pis || 1), plano = { programa: prog, ancho: W, fondo: D, pisos, cuartos: C2, puertas, ventanas, muebles, escaleras: pisos > 1 ? { x: W - 1.3, y: D - 3.2, w: 1.1, h: 3 } : null, edificio: e };
    plano.solido = (x, y) => { if (x < .15 || y < .15 || x > W - .15 || y > D - .15) return !puertas.some(p => p.entrada && Math.abs(p.x - x) < p.ancho / 2 && y < .3); if (muebles.some(m => x > m.x && x < m.x + m.w && y > m.y && y < m.y + m.h && !['tapete', 'ducha'].includes(m.tipo))) return true; for (const c of C2) for (const b of [[c.x, c.y, c.x + c.w, c.y], [c.x, c.y, c.x, c.y + c.h]]) { const vert = b[0] === b[2]; if (vert ? Math.abs(x - b[0]) < .08 && y > b[1] && y < b[3] : Math.abs(y - b[1]) < .08 && x > b[0] && x < b[2]) { if (!puertas.some(p => p.vertical === vert && (vert ? Math.abs(p.x - b[0]) < .1 && Math.abs(p.y - y) < p.ancho / 2 : Math.abs(p.y - b[1]) < .1 && Math.abs(p.x - x) < p.ancho / 2))) return true; } } return false; };
    plano.cuartoEn = (x, y) => C2.find(c => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) || null;
    plano.estilo = Interiores.estiloPara(e, op.estilo, r); Interiores.decorar(plano, r);
    return plano;
  },
  /* planta vista desde arriba: (x, y) esquina en pantalla, esc px por metro */
  dibujar(g, P, x, y, esc, op = {}) {
    g.save(); g.translate(x, y); g.scale(esc, esc); g.lineJoin = 'round';
    g.fillStyle = '#2b2f38'; g.fillRect(-.25, -.25, P.ancho + .5, P.fondo + .5);
    for (const c of P.cuartos) { g.fillStyle = Interiores.pisoDe(P, c.tipo); g.fillRect(c.x + .06, c.y + .06, c.w - .12, c.h - .12); Interiores.patron(g, P, c); if (c.tipo === 'bano' || c.tipo === 'cocina') { g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = .03; for (let q = .3; q < c.w; q += .3) { g.beginPath(); g.moveTo(c.x + q, c.y); g.lineTo(c.x + q, c.y + c.h); g.stroke(); } } }
    g.strokeStyle = '#2b2f38'; g.lineWidth = .14; for (const c of P.cuartos) g.strokeRect(c.x, c.y, c.w, c.h);
    for (const p of P.puertas) { g.fillStyle = PISO_DE.pasillo; if (p.vertical) g.fillRect(p.x - .1, p.y - p.ancho / 2, .2, p.ancho); else g.fillRect(p.x - p.ancho / 2, p.y - .1, p.ancho, .2); g.strokeStyle = 'rgba(43,47,56,.5)'; g.lineWidth = .04; g.beginPath(); if (p.vertical) g.arc(p.x, p.y - p.ancho / 2, p.ancho, 0, Math.PI / 2); else g.arc(p.x - p.ancho / 2, p.y, p.ancho, 0, Math.PI / 2); g.stroke(); }
    for (const v of P.ventanas) { g.fillStyle = '#8cbedc'; if (v.vertical) g.fillRect(v.x - .1, v.y - v.ancho / 2, .2, v.ancho); else g.fillRect(v.x - v.ancho / 2, v.y - .1, v.ancho, .2); }
    const COL = { cama: '#f2efe8', sofa: '#6d8fb3', closet: '#8d6e63', estufa: '#3b3d42', nevera: '#e9eef3', inodoro: '#ffffff', ducha: '#b7d7e6', lavamanos: '#ffffff', mostrador: '#a1887f', estante: '#8d6e63', banca: '#8d6e63', altar: '#efe8d8', escritorio: '#a1887f', comedor: '#8d6e63', tv: '#1d1f24', matera: '#4a9444', pupitre: '#a1887f', tablero: '#2e5d3a' };
    const EST = (P.estilo && ESTILOS_INT[P.estilo]) || ESTILOS_INT.paisa;
    for (const m of P.muebles) { if (m.tipo === 'tapete') { Interiores.tapete(g, m, EST); continue; } g.fillStyle = m.color || (EST.muebles[m.tipo]) || COL[m.tipo] || EST.madera; g.fillRect(m.x, m.y, m.w, m.h); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .03; g.strokeRect(m.x, m.y, m.w, m.h); if (m.tipo === 'cama') { g.fillStyle = '#c43a26'; g.fillRect(m.x + m.w * .08, m.y + m.h * .3, m.w * .84, m.h * .62); } }
    if (P.escaleras) { const s2 = P.escaleras; g.fillStyle = '#bdb8ad'; g.fillRect(s2.x, s2.y, s2.w, s2.h); g.strokeStyle = '#7d7f84'; g.lineWidth = .04; for (let q = 0; q < s2.h; q += .28) { g.beginPath(); g.moveTo(s2.x, s2.y + q); g.lineTo(s2.x + s2.w, s2.y + q); g.stroke(); } }
    if (op.etiquetas !== false && esc > 14) { g.fillStyle = 'rgba(20,24,32,.55)'; g.font = '600 ' + (.42) + 'px system-ui'; g.textAlign = 'center'; for (const c of P.cuartos) if (c.w > 1.8) g.fillText({ bano: 'baño', sala_juntas: 'juntas', recepcion: 'recepción', balcon: 'balcón', rectoria: 'rectoría', sacristia: 'sacristía' }[c.tipo] || c.tipo, c.x + c.w / 2, c.y + c.h / 2); }
    g.restore();
  }
};
/* ---------- estilos: la misma casa genérica se ve distinta en cada hogar ---------- */
const ESTILOS_INT = {
  paisa: { n: 'Paisa tradicional', piso: 'hidraulica', pisos: ['#b5542f', '#d8c3a5', '#7a8a6a'], muro: '#f3ead8', madera: '#7b4a2e', acento: '#c43a26', muebles: { sofa: '#8a3b2a', comedor: '#6d4126' }, deco: ['matera', 'matera', 'cuadro', 'hamaca', 'tapete'] },
  moderno: { n: 'Moderno', piso: 'porcelanato', pisos: ['#e7e4de', '#d9d6cf'], muro: '#fafafa', madera: '#c8b79c', acento: '#2f80ed', muebles: { sofa: '#4a5568', comedor: '#d9cbb3' }, deco: ['lampara', 'cuadro', 'matera', 'tapete'] },
  minimalista: { n: 'Minimalista', piso: 'cemento', pisos: ['#cfcfcc', '#bdbdb9'], muro: '#ffffff', madera: '#e3d5bf', acento: '#111111', muebles: { sofa: '#e8e6e1', comedor: '#f2efe9' }, deco: ['matera', 'lampara'] },
  bohemio: { n: 'Bohemio', piso: 'madera', pisos: ['#a0703f', '#8c5f33'], muro: '#f6e3c8', madera: '#6b4423', acento: '#d9822b', muebles: { sofa: '#b0413e', comedor: '#7a4a28' }, deco: ['tapete', 'tapete', 'matera', 'matera', 'cuadro', 'cojines', 'lampara'] },
  campestre: { n: 'Campestre', piso: 'madera', pisos: ['#b38b5d', '#a17c50'], muro: '#efe6d2', madera: '#5d3d24', acento: '#4a7c3a', muebles: { sofa: '#7d8f5b', comedor: '#5d3d24' }, deco: ['matera', 'matera', 'matera', 'hamaca', 'cuadro'] },
  industrial: { n: 'Industrial', piso: 'cemento', pisos: ['#8e8e8b', '#7d7d7a'], muro: '#b8b2a8', madera: '#3f3a36', acento: '#d35400', muebles: { sofa: '#5b4636', comedor: '#2f2f2f' }, deco: ['lampara', 'cuadro', 'matera'] },
  juvenil: { n: 'Juvenil', piso: 'madera', pisos: ['#d2b48c', '#c4a57c'], muro: '#e8f4ff', madera: '#c9a77c', acento: '#ff2fb3', muebles: { sofa: '#39a0ff', comedor: '#ffcc33' }, deco: ['tapete', 'cuadro', 'cuadro', 'lampara', 'puff'] },
  clasico: { n: 'Clásico', piso: 'madera', pisos: ['#7a4f2a', '#6b4423'], muro: '#efe4cf', madera: '#4e2f1a', acento: '#8e1b1b', muebles: { sofa: '#6e1f1f', comedor: '#4e2f1a' }, deco: ['tapete', 'cuadro', 'cuadro', 'lampara', 'matera'] }
};
/* catálogo para diseñar la casa (medidas reales; precio en centavos de peso) */
const CATALOGO = [
  ['sofa', 'Sofá de tres puestos', 2.1, .9, 120000000, 'sala'], ['sofa_l', 'Sofá en L', 2.6, 1.6, 210000000, 'sala'], ['sillon', 'Sillón', .9, .9, 45000000, 'sala'], ['mesa_centro', 'Mesa de centro', 1, .6, 25000000, 'sala'],
  ['tv', 'Televisor 55"', 1.25, .3, 180000000, 'sala'], ['comedor', 'Comedor de 4 puestos', 1.6, .9, 90000000, 'comedor'], ['cama', 'Cama doble', 1.4, 1.9, 110000000, 'alcoba'], ['cama_sencilla', 'Cama sencilla', 1, 1.9, 60000000, 'alcoba'],
  ['closet', 'Clóset', 1.6, .6, 80000000, 'alcoba'], ['escritorio', 'Escritorio', 1.3, .65, 40000000, 'estudio'], ['biblioteca', 'Biblioteca', 1.6, .4, 50000000, 'estudio'], ['nevera', 'Nevera', .7, .7, 190000000, 'cocina'],
  ['estufa', 'Estufa', .6, .6, 90000000, 'cocina'], ['matera', 'Matera con planta', .5, .5, 6000000, ''], ['tapete', 'Tapete', 2, 1.4, 20000000, ''], ['lampara', 'Lámpara de pie', .4, .4, 15000000, ''],
  ['cuadro', 'Cuadro', .9, .06, 12000000, ''], ['hamaca', 'Hamaca', 2.6, .9, 18000000, ''], ['puff', 'Puf', .6, .6, 9000000, ''], ['consola', 'Consola de videojuegos', .5, .3, 250000000, 'sala'],
  ['soporte_bici', 'Soporte para la bici', 1.2, .5, 15000000, ''], ['acuario', 'Acuario', 1, .45, 40000000, '']
].map(([id, n, w, h, precio, cuarto]) => ({ id, n, w, h, precio, cuarto }));
Object.assign(Interiores, {
  ESTILOS: ESTILOS_INT, CATALOGO, OPCIONALES,
  /* agrega o quita cuartos opcionales según el área: dos casas del mismo tamaño casi nunca quedan iguales */
  variar(lista, prog, r, area) {
    lista = lista.map(q => q.slice()); const op = OPCIONALES[prog] || []; const base = lista.reduce((a, q) => a + q[1], 0); let extra = 0;
    for (const q of op) if (r() < .45 && base + extra + q[1] < area * 1.05) { lista.splice(1 + Math.floor(r() * (lista.length - 1)), 0, q.slice()); extra += q[1]; }
    if (r() < .3 && lista.length > 5) { const i = lista.findIndex(q => q[0] === 'ropas' || q[0] === 'balcon'); if (i > 0) lista.splice(i, 1); }
    for (const q of lista) q[1] *= .8 + r() * .4;   // proporciones distintas
    return lista;
  },
  estiloPara(e, pedido, r) { if (pedido && ESTILOS_INT[pedido]) return pedido; const L = Object.keys(ESTILOS_INT), z = e && e.zona; if (z === 'ladera' || z === 'pueblo') return r() < .6 ? 'paisa' : L[Math.floor(r() * L.length)]; if (z === 'poblado') return r() < .5 ? 'moderno' : 'minimalista'; return L[Math.floor(r() * L.length)]; },
  pisoDe(P, tipo) { const E = ESTILOS_INT[P.estilo]; if (!E || ['bano', 'cocina', 'cocineta', 'patio', 'taller', 'bodega', 'pasillo_cc'].includes(tipo) || P.programa !== 'casa' && P.programa !== 'apartamento') return PISO_DE[tipo] || '#d9d2c2'; return E.pisos[(tipo.length + (P.cuartos.findIndex(c => c.tipo === tipo))) % E.pisos.length]; },
  /* textura del piso por estilo: tablas de madera, baldosa hidráulica o porcelanato */
  patron(g, P, c) {
    const E = ESTILOS_INT[P.estilo]; if (!E || ['bano', 'cocina', 'patio', 'taller'].includes(c.tipo)) return; g.save(); g.beginPath(); g.rect(c.x, c.y, c.w, c.h); g.clip();
    if (E.piso === 'madera') { g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = .02; for (let q = c.y; q < c.y + c.h; q += .18) { g.beginPath(); g.moveTo(c.x, q); g.lineTo(c.x + c.w, q); g.stroke(); } }
    else if (E.piso === 'hidraulica') { g.fillStyle = 'rgba(255,255,255,.18)'; for (let yy = c.y; yy < c.y + c.h; yy += .4) for (let xx = c.x + ((yy - c.y) / .4 % 2) * .2; xx < c.x + c.w; xx += .4) { g.beginPath(); g.moveTo(xx + .2, yy); g.lineTo(xx + .4, yy + .2); g.lineTo(xx + .2, yy + .4); g.lineTo(xx, yy + .2); g.fill(); } }
    else if (E.piso === 'porcelanato') { g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = .015; for (let q = c.x; q < c.x + c.w; q += .6) { g.beginPath(); g.moveTo(q, c.y); g.lineTo(q, c.y + c.h); g.stroke(); } for (let q = c.y; q < c.y + c.h; q += .6) { g.beginPath(); g.moveTo(c.x, q); g.lineTo(c.x + c.w, q); g.stroke(); } }
    g.restore();
  },
  tapete(g, m, E) { g.fillStyle = E.acento; g.fillRect(m.x, m.y, m.w, m.h); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .05; g.strokeRect(m.x + .12, m.y + .12, m.w - .24, m.h - .24); g.strokeRect(m.x + .25, m.y + .25, m.w - .5, m.h - .5); },
  /* decoración del estilo: tapetes, materas, cuadros y lámparas donde quepan (sin tapar puertas ni el paso) */
  decorar(P, r) {
    const E = ESTILOS_INT[P.estilo]; if (!E || !['casa', 'apartamento'].includes(P.programa)) return;
    for (const c of P.cuartos) { if (!['sala', 'alcoba', 'comedor', 'estudio', 'terraza', 'sala_tv', 'balcon'].includes(c.tipo)) continue;
      for (const d of E.deco) { if (r() < .45) continue; const dim = d === 'tapete' ? [Math.min(2.2, c.w * .5), Math.min(1.6, c.h * .4)] : d === 'cuadro' ? [.8, .06] : d === 'hamaca' ? [2.6, .9] : [.45, .45];
        for (let k = 0; k < 6; k++) { const x = d === 'tapete' ? c.x + (c.w - dim[0]) / 2 + (r() - .5) * .4 : c.x + .1 + r() * Math.max(0, c.w - dim[0] - .2), y = d === 'cuadro' ? c.y + .02 : d === 'tapete' ? c.y + (c.h - dim[1]) / 2 + (r() - .5) * .4 : c.y + .1 + r() * Math.max(0, c.h - dim[1] - .2), m = { tipo: d, x, y, w: dim[0], h: dim[1], cuarto: c.tipo, deco: true };
          if (Interiores.cabe(P, m, d === 'tapete' || d === 'cuadro')) { if (d === 'tapete') P.muebles.unshift(m); else P.muebles.push(m); break; } } } }
  },
  /* ¿cabe el mueble ahí? dentro del cuarto, sin tapar puertas y con 0,6 m para pasar (los tapetes van debajo de todo) */
  cabe(P, m, encima) {
    const c = P.cuartoEn(m.x + m.w / 2, m.y + m.h / 2); if (!c || m.x < c.x - .01 || m.y < c.y - .01 || m.x + m.w > c.x + c.w + .01 || m.y + m.h > c.y + c.h + .01) return false;
    if (P.puertas.some(p => Math.hypot(clamp(p.x, m.x, m.x + m.w) - p.x, clamp(p.y, m.y, m.y + m.h) - p.y) < (encima ? .3 : .9))) return false;
    /* paso libre: 0,5 m entre muebles grandes; las cosas pequeñas (materas, lámparas) pueden ir más juntas */
    if (encima) return true; const paso = clamp(Math.min(m.w, m.h) * .6, .2, .5); return !P.muebles.some(o => o !== m && o.tipo !== 'tapete' && o.tipo !== 'cuadro' && m.x < o.x + o.w + paso && m.x + m.w + paso > o.x && m.y < o.y + o.h + paso && m.y + m.h + paso > o.y);
  }
});
MC.Interiores = Interiores;
