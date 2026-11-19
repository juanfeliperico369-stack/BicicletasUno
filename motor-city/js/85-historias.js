/* =====================================================================
   HISTORIAS · trama procedural con tres pilares: DIVERSIÓN, REFLEXIÓN y CONCIENCIA
   - STORYLETS (Failbetter, Emily Short): pedacitos de historia autónomos con condición (cuándo pueden pasar),
     contenido (texto y opciones) y efecto (lo que cambian). El motor elige el más «saliente» para el momento:
     el que encaja con el lugar, la hora, el clima y lo que el jugador ha hecho, y que equilibra los tres pilares.
   - DIRECTOR DE RITMO (como el «AI Director» de Left 4 Dead): mide la intensidad (choques, persecuciones, prisa) y
     alterna tensión y respiro. Después de un pico, siempre hay calma; si todo está tranquilo mucho rato, propone un reto.
     También ajusta la dificultad según cómo le va al jugador (flujo: ni aburrido ni frustrado).
   - ENCARGOS PROCEDURALES: personaje + necesidad + lugar real + obstáculo (hora, clima, tráfico) + recompensa
     + (a veces) un dilema + una lección real. Salen MC.Mision listas para jugar.
   - OCURRENCIAS: lo que nadie previó (quedar atascado, salir del mapa, números rotos, plata que no cuadra, cuadros
     lentos) se detecta, se corrige solo (volver al último punto seguro) y se anota; y también los «momentos» buenos
     que el jugador inventa (saltos enormes, récords, visitas raras), para aprender de ellos y mejorar el motor.
   ===================================================================== */
const PILARES = ['diversion', 'reflexion', 'conciencia'];
const BASE_STORYLETS = [
  /* DIVERSIÓN: que quiera seguir jugando */
  { id: 'reto_ciclista', pilar: 'diversion', cuando: c => c.vehiculo && c.vehiculo.clase === 'rueda' && c.hora > 6 && c.hora < 19, texto: c => 'Un ciclista se te pone al lado, sonríe y señala la esquina: «¿Una carrerita hasta el parque?»', opciones: [{ texto: '¡Hágale!', efecto: c => ({ mision: 'carrera' }) }, { texto: 'Hoy no, gracias', efecto: () => ({}) }] },
  { id: 'perro_sigue', pilar: 'diversion', cuando: c => !c.banderas.perro && c.lugarTipo !== 'centro_comercial', una: true, texto: () => 'Un perro criollo te sigue moviendo la cola desde hace dos cuadras.', opciones: [{ texto: 'Darle agua y adoptarlo', efecto: c => ({ bandera: 'perro', companero: 'perro_criollo' }) }, { texto: 'Acariciarlo y seguir', efecto: () => ({}) }] },
  { id: 'domicilio_urgente', pilar: 'diversion', cuando: c => c.hora >= 11 && c.hora <= 14, texto: c => 'Suena el celular: «¡Se me quemó el arroz! ¿Me trae un almuerzo antes de la 1?»', opciones: [{ texto: 'Voy volando', efecto: () => ({ mision: 'domicilio' }) }, { texto: 'No alcanzo', efecto: () => ({}) }] },
  { id: 'tesoro_parque', pilar: 'diversion', cuando: c => c.lugarTipo === 'parque', texto: () => 'Debajo de una banca alguien dejó un mapa dibujado a mano con una X.', opciones: [{ texto: 'Seguir el mapa', efecto: () => ({ mision: 'tesoro' }) }, { texto: 'Dejarlo ahí', efecto: () => ({}) }] },
  /* REFLEXIÓN: que el mundo pese; contemplativa, sin sermones */
  { id: 'abuela_ventana', pilar: 'reflexion', cuando: c => c.hora >= 15 && c.hora <= 18, texto: () => 'Una señora te mira desde la ventana y dice: «Cuando yo era niña, esta calle era una quebrada. Uno oía el agua toda la noche.»', opciones: [{ texto: 'Quedarse a escucharla', efecto: () => ({ animo: .2, recuerdo: 'quebrada' }) }, { texto: 'Saludar y seguir', efecto: () => ({}) }] },
  { id: 'atardecer', pilar: 'reflexion', cuando: c => c.hora >= 17.4 && c.hora <= 18.4 && c.altura > 1550, texto: () => 'El sol se esconde detrás de la montaña y la ciudad empieza a encender sus luces, una por una, como si alguien la estuviera despertando.', opciones: [{ texto: 'Sentarse a mirar', efecto: () => ({ animo: .3, foto: true }) }] },
  { id: 'lluvia_alero', pilar: 'reflexion', cuando: c => c.clima && c.clima.lluvia > .5, texto: () => 'Te refugias bajo un alero. Un desconocido comparte el pedazo de techo y dice: «Lo bueno de la lluvia es que obliga a esperar.»', opciones: [{ texto: 'Esperar con él', efecto: () => ({ animo: .15, energia: .1 }) }, { texto: 'Mojarse y seguir', efecto: () => ({ hidratacion: .05 }) }] },
  { id: 'arbol_viejo', pilar: 'reflexion', cuando: c => c.lugarTipo === 'parque', texto: () => 'En el tronco del árbol más grande del parque alguien grabó dos iniciales y un año: 1974. El árbol siguió creciendo alrededor.', opciones: [{ texto: 'Tocar la corteza', efecto: () => ({ animo: .1 }) }] },
  { id: 'dilema_billetera', pilar: 'reflexion', una: true, cuando: c => c.dinero != null, texto: () => 'Encuentras una billetera en el andén. Tiene plata y la cédula de alguien que vive a tres cuadras.', opciones: [{ texto: 'Devolverla', efecto: () => ({ reputacion: 1, mision: 'devolver' }) }, { texto: 'Dejarla en la tienda de la esquina', efecto: () => ({ reputacion: .5 }) }] },
  /* CONCIENCIA: aprender algo real, rápido y jugando */
  { id: 'frenada_lluvia', pilar: 'conciencia', cuando: c => c.clima && c.clima.lluvia > .3 && c.vehiculo && c.vehiculo.clase !== 'pie', texto: () => 'Llueve: con el piso mojado necesitas casi el doble de distancia para frenar. Suelta antes el acelerador en las bajadas.', opciones: [{ texto: 'Entendido', efecto: () => ({ aprende: 'frenada_lluvia' }) }] },
  { id: 'agua_calor', pilar: 'conciencia', cuando: c => c.clima && c.clima.temp > 28, texto: () => 'Hace calor: el cuerpo suda para enfriarse y pierde agua. Un sorbo cada 15–20 minutos te mantiene rindiendo.', opciones: [{ texto: 'Buscar una tienda', efecto: () => ({ busca: 'tienda_barrio' }) }] },
  { id: 'altura_aire', pilar: 'conciencia', cuando: c => c.altura > 2000, texto: () => 'A esta altura el aire tiene menos oxígeno: el corazón late más rápido por el mismo esfuerzo. Ve con calma.', opciones: [{ texto: 'Ok', efecto: () => ({ aprende: 'altura' }) }] },
  { id: 'cultura_metro', pilar: 'conciencia', cuando: c => c.cercaDe === 'estacion', texto: () => 'En el metro se deja salir antes de entrar, y se cede la silla azul: así funciona la cultura metro.', opciones: [{ texto: 'Así lo haré', efecto: () => ({ aprende: 'cultura_metro', reputacion: .2 }) }] }
];
class Historias {
  constructor(op = {}) { this.lista = (op.storylets || []).concat(op.base === false ? [] : BASE_STORYLETS); this.vistos = new Map(); this.ultPilar = { diversion: -1e9, reflexion: -1e9, conciencia: -1e9 }; this.t = 0; this.r = mulberry32(op.semilla || 7); this.enfriamiento = op.enfriamiento ?? 90; this.director = new Director(op.director); this._ult = -1e9; }
  agregar(s) { this.lista.push(s); return this; }
  /* los que pueden pasar ahora */
  disponibles(c) { return this.lista.filter(s => { const v = this.vistos.get(s.id); if (s.una && v) return false; if (v && this.t - v < (s.enfriamiento ?? 600)) return false; try { return !s.cuando || s.cuando(c); } catch (e) { return false; } }); }
  /* elige el más saliente: peso propio × pilar que hace más falta × lo que pide el director × novedad */
  elegir(c, forzar) {
    c.banderas = c.banderas || {}; if (!forzar && this.t - this._ult < this.enfriamiento) return null;
    const D = this.disponibles(c); if (!D.length) return null; const quiere = this.director.quiere();
    let best = null, bs = -1; for (const s of D) { const falta = (this.t - this.ultPilar[s.pilar]) / 300, dir = quiere === 'respiro' ? (s.pilar === 'reflexion' ? 2 : .5) : quiere === 'reto' ? (s.pilar === 'diversion' ? 2 : .7) : 1, sc = (typeof s.peso === 'function' ? s.peso(c) : s.peso || 1) * (1 + Math.min(3, falta)) * dir * (.75 + this.r() * .5); if (sc > bs) { bs = sc; best = s; } }
    this.vistos.set(best.id, this.t); this.ultPilar[best.pilar] = this.t; this._ult = this.t; MC.emit('historia', { s: best, c });
    return { id: best.id, pilar: best.pilar, texto: typeof best.texto === 'function' ? best.texto(c) : best.texto, opciones: (best.opciones || []).map(o => ({ texto: o.texto, elegir: () => { const ef = o.efecto ? o.efecto(c) || {} : {}; if (ef.bandera) c.banderas[ef.bandera] = true; MC.emit('decision', { s: best, o, ef }); return ef; } })) };
  }
  paso(dt) { this.t += dt; this.director.paso(dt); }
  /* encargo procedural: personaje + necesidad + lugar real + obstáculo + recompensa (+ dilema y lección) */
  encargo(mundo, x, y, c = {}) {
    const r = mulberry32(hashTxt('enc' + Math.floor(this.t) + Math.round(x) + Math.round(y))), L = Lugares.cerca(mundo, x, y, 700).filter(q => q.tipo !== 'parque'), P = Lugares.cerca(mundo, x, y, 900, 'parque');
    if (L.length < 2) return null; const A = L[Math.floor(r() * L.length)]; let B = L[Math.floor(r() * L.length)]; if (B === A) B = L[(L.indexOf(A) + 1) % L.length];
    const nombres = ['Doña Rosa', 'Don Darío', 'Marta', 'Jhon Jairo', 'Luz Dary', 'Sebastián', 'Valentina', 'El profe Hernán', 'Doña Gilma', 'Camilo'], cosas = { tienda_barrio: 'un mercadito', taller_bici: 'un neumático', restaurante: 'un almuerzo', tienda_ropa: 'un vestido arreglado', taller_carro: 'una pieza del carro', centro_comercial: 'un regalo', biblioteca: 'un libro', museo: 'una carta', iglesia: 'unas velas' };
    const quien = nombres[Math.floor(r() * nombres.length)], que = cosas[A.tipo] || 'un paquete', dif = this.director.dificultad, d = Math.hypot(A.x - x, A.y - y) + Math.hypot(B.x - A.x, B.y - A.y), limite = Math.round((d / 3.2 + 60) * (1.4 - dif * .6));
    const dilema = r() < .25 ? 'En el camino, alguien te pide ayuda para cargar algo pesado. ¿Te detienes?' : null, leccion = DATOS_REALES[Math.floor(r() * DATOS_REALES.length)];
    return { titulo: quien + ' necesita ' + que, texto: quien + ' te pide recoger ' + que + ' en ' + A.nombre + ' y llevarlo a ' + B.nombre + '.' + (c.clima && c.clima.lluvia > .4 ? ' Ojo: está lloviendo.' : ''), pilar: 'diversion', dilema, leccion,
      def: { titulo: quien + ': ' + que, pasos: [{ tipo: 'ir', x: A.x, y: A.y, radio: 14, texto: 'Recoge ' + que + ' en ' + A.nombre }, { tipo: 'ir', x: B.x, y: B.y, radio: 14, texto: 'Llévalo a ' + B.nombre }], limite, premio: Math.round((d * 120 + 300000) * (1 + dif * .5) / 100) * 100 }, desde: A, hasta: B, parque: P[0] || null };
  }
}
/* el director de ritmo: intensidad que sube con lo que pasa y baja con el tiempo; fases de tensión y respiro */
class Director {
  constructor(op = {}) { this.intensidad = 0; this.fase = 'calma'; this.tFase = 0; this.dificultad = op.dificultad ?? .5; this.exitos = 0; this.fallas = 0; this.picoMax = op.pico ?? .75; this.respiroSeg = op.respiro ?? 45; this.aburrimiento = op.aburrimiento ?? 90; }
  sumar(tipo, k) { const K = { choque: .25, persecucion: .35, prisa: .12, caida: .3, logro: .1, peligro: .4 }; this.intensidad = clamp(this.intensidad + (k ?? K[tipo] ?? .1), 0, 1); }
  resultado(exito) { if (exito) this.exitos++; else this.fallas++; const n = this.exitos + this.fallas, tasa = n ? this.exitos / n : .5; this.dificultad = clamp(this.dificultad + (tasa > .7 ? .05 : tasa < .4 ? -.07 : 0), .1, .95); }
  paso(dt) {
    this.tFase += dt; this.intensidad = Math.max(0, this.intensidad - dt * (this.fase === 'respiro' ? .03 : .012));
    if (this.fase !== 'respiro' && this.intensidad >= this.picoMax) { this.fase = 'respiro'; this.tFase = 0; }
    else if (this.fase === 'respiro' && this.tFase > this.respiroSeg && this.intensidad < .3) { this.fase = 'calma'; this.tFase = 0; }
    else if (this.fase === 'calma' && this.intensidad > .35) { this.fase = 'crece'; this.tFase = 0; }
    else if (this.fase === 'crece' && this.intensidad < .2) { this.fase = 'calma'; this.tFase = 0; }
  }
  quiere() { if (this.fase === 'respiro') return 'respiro'; if (this.fase === 'calma' && this.tFase > this.aburrimiento) return 'reto'; return 'normal'; }
}
/* ---------- ocurrencias: lo imprevisto se detecta, se corrige y se anota ---------- */
class Ocurrencias {
  constructor(op = {}) { this.reg = []; this.max = op.max || 300; this.seguros = []; this.tSeg = 0; this.t = 0; this.quieto = 0; this.dentro = 0; this.lento = 0; this.nErr = MC.errores.length; this.record = { vel: 0, z: 0 }; this.juego = op.juego || MC.juego; }
  anotar(tipo, detalle = {}, C) { const e = { tipo, t: Math.round(this.t), detalle }; if (C) { e.x = Math.round(C.x / 50) * 50; e.y = Math.round(C.y / 50) * 50; } this.reg.push(e); if (this.reg.length > this.max) this.reg.shift(); MC.emit('ocurrencia', e); return e; }
  _volver(C, tipo) { const s = this.seguros[this.seguros.length - 1]; if (s) { C.x = s.x; C.y = s.y; C.a = s.a; } C.v = 0; C.z = 0; C.vz = 0; C.enAire = false; C.paso = null; C.zPaso = 0; this.anotar(tipo, { arreglo: s ? 'volvió al último punto seguro' : 'se detuvo' }, C); }
  /* llámalo cada cuadro: { cuerpo, mundo, libro, entrada, ms } */
  vigilar(dt, o = {}) {
    this.t += dt; const C = o.cuerpo, M = o.mundo; if (!C || !M) return;
    if (![C.x, C.y, C.v, C.z, C.a].every(Number.isFinite)) return this._volver(C, 'numero_invalido');
    if (!M.dentro(C.x, C.y)) return this._volver(C, 'fuera_del_mundo');
    if (C.z < -.5 && !C.nadando && !(C.paso && C.paso.tipo === 'tunel')) { C.z = 0; this.anotar('bajo_el_piso', { arreglo: 'subió al piso' }, C); }
    const vmax = C.vmax ? C.vmax() : 30; if (Math.abs(C.v) > vmax * 2.5 + 5) { C.v = Math.sign(C.v) * vmax; this.anotar('velocidad_imposible', { arreglo: 'limitada' }, C); }
    const libre = C.paso || C.veh.clase === 'aire' || C.puede(C.x, C.y); this.dentro = libre ? 0 : this.dentro + dt; if (this.dentro > .5) { this.dentro = 0; this._volver(C, 'atrapado'); }
    const quiere = o.entrada && ((o.entrada.stick && o.entrada.stick.m > .5) || Math.abs(o.entrada.acel || 0) > .5); if (quiere && Math.abs(C.v) < .15) this.quieto += dt; else this.quieto = 0; if (this.quieto > 4) { this.quieto = 0; this.anotar('atascado', { sugerencia: 'botón «salir de aquí»' }, C); MC.emit('atascado', C); }
    if (o.libro && this.t % 5 < dt && !o.libro.cuadra()) this.anotar('libro_descuadrado', {});
    if (o.ms != null) { this.lento = o.ms > 50 ? this.lento + dt : 0; if (this.lento > 5) { this.lento = 0; this.anotar('cuadros_lentos', { ms: Math.round(o.ms), sugerencia: 'bajar la calidad' }); } }
    if (MC.errores.length > this.nErr) { for (const m of MC.errores.slice(this.nErr)) this.anotar('error', { m: String(m).slice(0, 160) }); this.nErr = MC.errores.length; }
    /* puntos seguros: cada segundo, si está en un lugar válido y en el piso */
    this.tSeg += dt; if (this.tSeg > 1 && libre && !C.enAire) { this.tSeg = 0; this.seguros.push({ x: C.x, y: C.y, a: C.a }); if (this.seguros.length > 12) this.seguros.shift(); }
    /* momentos que nadie diseñó pero valen la pena (retroalimentación para mejorar el juego) */
    if (Math.abs(C.v) > this.record.vel + 3 && Math.abs(C.v) > 12) { this.record.vel = Math.abs(C.v); this.anotar('momento', { que: 'récord de velocidad', kmh: Math.round(this.record.vel * 3.6) }, C); }
    if (C.z > Math.max(2.5, this.record.z + 1) && C.veh.clase !== 'aire') { this.record.z = C.z; this.anotar('momento', { que: 'salto enorme', m: +C.z.toFixed(1) }, C); }
  }
  /* «sácame de aquí»: a la vía más cercana (el botón de emergencia que todo mundo abierto necesita) */
  rescatar(C, M) { const v = M.viaCercana(C.x, C.y, 300); if (v) { C.x = v.x; C.y = v.y; C.a = v.ang; } C.v = 0; C.z = 0; C.paso = null; C.zPaso = 0; this.anotar('rescate', {}, C); }
  resumen() { const n = {}; for (const e of this.reg) n[e.tipo] = (n[e.tipo] || 0) + 1; return n; }
  /* reporte para mejorar el motor: sin datos personales (posiciones redondeadas a 50 m, sin direcciones ni nombres) */
  exportar() { return { motor: MC.version, juego: this.juego, dia: new Date().toISOString().slice(0, 10), resumen: this.resumen(), eventos: this.reg.slice(-150) }; }
}
Object.assign(MC, { Historias, Director, Ocurrencias, PILARES });
