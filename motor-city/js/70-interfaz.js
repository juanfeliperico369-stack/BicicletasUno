/* =====================================================================
   INTERFAZ INTEGRADA · las piezas de pantalla que todo juego necesita, con el tema de cada juego
   - Tema por tokens (colores, letra, radios) en variables CSS: EnCicla verde, El Metro con sus líneas, Motor City neón…
   - Piezas: barra superior de fichas, velocímetro, barras (energía, agua, gasolina), botones táctiles grandes (≥ 48 px),
     menú, diálogo con opciones, avisos, panel de misión, minimapa (con las losas del motor) y brújula.
   - Accesible: etiquetas aria, contraste alto, respeta «reducir movimiento», funciona con teclado y con el dedo.
   - DISTRIBUCIÓN (lo que no se negocia): el centro de la pantalla es del juego (la «zona libre» donde va el jugador);
     la información va en las esquinas de arriba, el movimiento abajo a la izquierda y las acciones abajo a la derecha,
     donde llega el pulgar. Nada tapa la zona libre (MC.UI.verificar lo comprueba en las pruebas).
   - HUD CONTEXTUAL: lo que no cambia se atenúa solo a los pocos segundos y vuelve al cambiar (menos ruido, más mundo);
     al ir rápido, solo queda lo vital (foco); en modo cine no queda nada.
   - AVISOS EN COLA: uno a la vez, cortos, arriba y al centro (nunca encima del jugador), sin robar el control.
   Uso: const ui = MC.UI.crear(document.body, { tema: 'motorcity' }); ui.ficha('hora', '🕐 8:00'); ui.boton({ id, icono, texto, al })
   ===================================================================== */
const TEMAS_UI = {
  motorcity: { fondo: 'rgba(11,16,32,.78)', tinta: '#f4f1e6', acento: '#39ffb3', acento2: '#ff2fb3', borde: 'rgba(255,255,255,.16)', letra: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", radio: '14px' },
  encicla: { fondo: 'rgba(10,35,66,.82)', tinta: '#ffffff', acento: '#9bd341', acento2: '#ffd84a', borde: 'rgba(255,255,255,.18)', letra: "'Nunito', system-ui, sans-serif", radio: '16px' },
  elmetro: { fondo: 'rgba(15,27,45,.85)', tinta: '#ffffff', acento: '#ffd84a', acento2: '#1C5C9C', borde: 'rgba(255,255,255,.15)', letra: "system-ui, sans-serif", radio: '12px' },
  runscooter: { fondo: 'rgba(14,99,120,.88)', tinta: '#e8e4c4', acento: '#ffc23a', acento2: '#c0191c', borde: 'rgba(232,228,196,.3)', letra: "system-ui, sans-serif", radio: '4px' }
};
const UI = {
  TEMAS: TEMAS_UI,
  crear(raiz, op = {}) {
    if (typeof document === 'undefined') return null;
    const T = Object.assign({}, TEMAS_UI[op.tema || 'motorcity'], op.colores || {}), id = 'mcui-' + Math.random().toString(36).slice(2, 7), capa = document.createElement('div'); capa.className = 'mcui'; capa.id = id; raiz.appendChild(capa);
    const css = document.createElement('style'); css.textContent = `#${id}{--f:${T.fondo};--t:${T.tinta};--a:${T.acento};--a2:${T.acento2};--b:${T.borde};--r:${T.radio};position:fixed;inset:0;pointer-events:none;font:14px/1.3 ${T.letra};color:var(--t);z-index:20}
#${id} [hidden]{display:none!important}#${id} .p{pointer-events:auto}#${id} .izq{position:absolute;top:max(10px,env(safe-area-inset-top));left:10px;right:84px;display:flex;flex-direction:column;align-items:flex-start;gap:6px}#${id} .fichas{display:flex;flex-wrap:wrap;gap:6px;max-height:76px;overflow:hidden}#${id} .ficha{max-width:52vw;overflow:hidden;text-overflow:ellipsis}#${id} .mision{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}#${id} .aviso.on{-webkit-line-clamp:3}
#${id} .ficha{padding:6px 10px;border-radius:999px;background:var(--f);border:1px solid var(--b);font-weight:700;white-space:nowrap;backdrop-filter:blur(6px)}
#${id} .botones{position:absolute;right:8px;top:max(10px,env(safe-area-inset-top));display:flex;flex-direction:column;flex-wrap:wrap-reverse;align-content:flex-start;max-height:calc(100vh - 170px);gap:6px}
#${id} button{min-width:48px;min-height:48px;border-radius:var(--r);border:1px solid var(--b);background:var(--f);color:var(--t);font:700 18px/1 ${T.letra};cursor:pointer}
#${id} button:focus-visible{outline:3px solid var(--a);outline-offset:2px}#${id} button small{display:block;font-size:10px;opacity:.85;margin-top:2px}
#${id} .vel{position:absolute;left:12px;bottom:calc(max(14px,env(safe-area-inset-bottom)) + 18px);text-shadow:0 2px 6px #000c}#${id} .vel b{font:900 34px/1 ${T.letra};color:var(--a)}
#${id} .barras{position:absolute;left:12px;bottom:calc(max(14px,env(safe-area-inset-bottom)) + 68px);display:grid;gap:4px;width:150px}
#${id} .barra{height:8px;border-radius:6px;background:#ffffff26;overflow:hidden}#${id} .barra i{display:block;height:100%;background:linear-gradient(90deg,var(--a),var(--a2));transition:width .3s}
#${id} .aviso{padding:8px 14px;border-radius:var(--r);background:var(--f);border:1px solid var(--b);border-left:4px solid var(--a2);font-weight:800;opacity:0;transition:opacity .3s;max-width:min(340px,72vw);max-height:0;overflow:hidden}#${id} .aviso.on{opacity:1;max-height:200px}
#${id} .mision{max-width:min(320px,70vw);padding:8px 12px;border-radius:var(--r);background:var(--f);border-left:4px solid var(--a)}
#${id} .dialogo{position:absolute;left:50%;bottom:16%;transform:translateX(-50%);width:min(520px,92vw);padding:14px;border-radius:var(--r);background:var(--f);border:1px solid var(--b)}#${id} .dialogo .opts{display:grid;gap:6px;margin-top:10px}#${id} .dialogo button{font-size:15px;text-align:left;padding:10px}
#${id} .menu{position:absolute;right:66px;top:max(10px,env(safe-area-inset-top));max-height:78vh;overflow:auto;width:min(300px,72vw);padding:8px;border-radius:var(--r);background:var(--f);border:1px solid var(--b);display:grid;gap:4px}#${id} .menu button{text-align:left;font-size:14px;padding:8px 10px}
#${id} canvas.mini{position:absolute;right:10px;bottom:calc(max(16px,env(safe-area-inset-bottom)) + 96px);width:120px;height:120px;border-radius:50%;border:2px solid var(--b);background:#0006}
#${id} .fichas>*,#${id} .botones>*,#${id} .mision,#${id} .vel,#${id} .barras{transition:opacity .6s}#${id} .dim{opacity:.38}#${id}.foco .fichas,#${id}.foco .botones,#${id}.foco .mision,#${id}.foco .barras{opacity:.18}#${id} .izq .aviso{pointer-events:none}#${id}.cine>*{opacity:0!important;pointer-events:none!important}
@media (orientation:landscape){#${id} .izq{right:auto;max-width:24vw}#${id} .fichas{max-height:58px}#${id} .ficha{max-width:23vw}#${id} .mision{-webkit-line-clamp:2}}@media (orientation:landscape) and (max-height:500px){#${id} .ficha{padding:4px 8px;font-size:12px}#${id} .mision,#${id} .aviso{font-size:12px}}
@media (prefers-reduced-motion:reduce){#${id} *{transition:none!important}}`;
    document.head.appendChild(css);
    const div = (cls, padre = capa) => { const d = document.createElement('div'); d.className = cls; padre.appendChild(d); return d; };
    const izq = div('izq'), fichas = div('fichas', izq), mision = div('mision', izq), aviso = div('aviso', izq), botones = div('botones p'), vel = div('vel'), barras = div('barras');   // arriba a la izquierda, en columna: nada se monta encima de nada mision.hidden = true; aviso.setAttribute('role', 'status'); aviso.setAttribute('aria-live', 'polite');
    const F = {}, Bs = {}, Ba = {};
    const ui = {
      capa, tema: T,
      ficha(clave, texto) { if (!F[clave]) { F[clave] = div('ficha', fichas); } const el = F[clave]; if (el.textContent !== texto) { el.textContent = texto; ui.contextual(el); } return el; },
      /* se atenúa sola si no cambia en «seg» segundos; vuelve a encenderse al cambiar */
      contextual(el, seg = ui.atenuar) { if (!el || !seg) return; el.classList.remove('dim'); clearTimeout(el._dim); el._dim = setTimeout(() => el.classList.add('dim'), seg * 1000); },
      atenuar: op.atenuar ?? 5,
      /* foco: al ir rápido o en tensión, solo queda lo vital (velocidad, aviso); cine: nada */
      foco(on) { capa.classList.toggle('foco', !!on); }, cine(on) { capa.classList.toggle('cine', !!on); },
      /* el rectángulo que la interfaz no debe tapar (en px de la ventana) */
      zonaLibre() { const W = innerWidth, H = innerHeight, v = H > W; return v ? { x0: W * .16, y0: H * .24, x1: W * .84, y1: H * .68 } : { x0: W * .26, y0: H * .2, x1: W * .74, y1: H * .74 }; },
      boton({ id: bid, icono = '', texto = '', al, padre }) { const b = document.createElement('button'); b.className = 'p'; b.innerHTML = icono + (texto ? '<small>' + texto + '</small>' : ''); b.setAttribute('aria-label', texto || bid); b.onclick = e => { e.stopPropagation(); al && al(e); }; (padre || botones).appendChild(b); Bs[bid] = b; return b; },
      velocidad(ms, extra = '') { vel.innerHTML = '<b>' + Math.round(Math.abs(ms) * 3.6) + '</b> km/h ' + extra; },
      barra(clave, etiqueta, v) { if (!Ba[clave]) { const w = div('', barras); w.innerHTML = '<small>' + etiqueta + '</small><div class="barra"><i></i></div>'; Ba[clave] = w.querySelector('i'); Ba[clave]._w = w; } Ba[clave].style.width = Math.round(clamp(v, 0, 1) * 100) + '%'; },
      /* avisos en cola: uno a la vez; si llega uno igual, no se repite */
      barraVisible(clave, v) { if (Ba[clave]) Ba[clave]._w.hidden = !v; },
      aviso(texto, ms = 2200) { const C = ui._cola || (ui._cola = []); if (C.some(q => q[0] === texto) || aviso.textContent === texto && aviso.classList.contains('on')) return; C.push([texto, ms]); if (!ui._av) ui._sig(); },
      _sig() { const q = (ui._cola || []).shift(); if (!q) { ui._av = false; return; } ui._av = true; aviso.textContent = q[0]; aviso.classList.add('on'); clearTimeout(ui._t); ui._t = setTimeout(() => { aviso.classList.remove('on'); setTimeout(() => ui._sig(), 320); }, q[1]); },
      mision(texto) { mision.hidden = !texto; mision.innerHTML = texto || ''; },
      /* diálogo con opciones: devuelve una promesa con la opción elegida */
      dialogo(titulo, texto, opciones = ['Listo']) { return new Promise(res => { const d = div('dialogo p'); d.setAttribute('role', 'dialog'); d.innerHTML = '<b>' + titulo + '</b><div>' + texto + '</div><div class="opts"></div>'; opciones.forEach((o, i) => { const b = document.createElement('button'); b.textContent = o; b.onclick = () => { d.remove(); res(i); }; d.querySelector('.opts').appendChild(b); if (!i) setTimeout(() => b.focus(), 50); }); }); },
      menu(titulo, items, al) { const m = div('menu p'); m.innerHTML = '<b style="padding:4px">' + titulo + '</b>'; for (const it of items) { const b = document.createElement('button'); b.innerHTML = it.texto; b.onclick = () => { m.remove(); al(it.id); }; m.appendChild(b); } const cerrar = () => m.remove(); setTimeout(() => document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', k); } }), 0); return m; },
      /* minimapa redondo con las losas del motor, girado con la cámara */
      minimapa(vistas) { const c = document.createElement('canvas'); c.className = 'mini'; c.width = c.height = 240; capa.appendChild(c); ui._mini = { c, vistas }; return c; },
      pintarMinimapa(x, y, yaw = 0, puntos = []) { const M = ui._mini; if (!M) return; const g = M.c.getContext('2d'), L = M.vistas.losas, z = .45, R = 120; g.save(); g.clearRect(0, 0, 240, 240); g.beginPath(); g.arc(R, R, R, 0, TAU); g.clip(); g.translate(R, R); g.rotate(-yaw); g.scale(z, z); g.translate(-x, -y); const s = L.L, gx0 = Math.floor((x - 300) / s), gy0 = Math.floor((y - 300) / s); for (let gy = gy0; gy <= gy0 + 4; gy++) for (let gx = gx0; gx <= gx0 + 4; gx++) { const t = L.losa(gx, gy, .5, true, false) || L.losa(gx, gy, .0625, false, false); if (t) g.drawImage(t, gx * s, gy * s, s, s); } for (const p of puntos) { g.fillStyle = p.color || '#ffc23a'; g.beginPath(); g.arc(p.x, p.y, 12, 0, TAU); g.fill(); } g.restore(); g.fillStyle = '#39ffb3'; g.beginPath(); g.moveTo(R, R - 9); g.lineTo(R + 6, R + 7); g.lineTo(R - 6, R + 7); g.fill(); },
      quitar() { capa.remove(); css.remove(); }
    };
    return ui;
  }
};
/* ¿algo de la interfaz tapa la zona libre? devuelve la lista de lo que estorba (para las pruebas y para el juego) */
UI.verificar = function (ui) {
  if (!ui || typeof document === 'undefined') return []; const Z = ui.zonaLibre(), malos = [];
  for (const el of ui.capa.querySelectorAll('.ficha, .botones button, .mision, .vel, .barras, canvas.mini, .p')) {
    if (el.hidden || el.closest('[hidden]') || el.classList.contains('dialogo') || el.classList.contains('menu')) continue; const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (r.right > Z.x0 && r.left < Z.x1 && r.bottom > Z.y0 && r.top < Z.y1) malos.push((el.className || el.tagName) + ' ' + Math.round(r.left) + ',' + Math.round(r.top));
  }
  return malos;
};
/* los principios de la interfaz del motor (resumen de docs/INVESTIGACION.md) */
UI.PRINCIPIOS = ['El centro es del juego', 'Arriba se informa, abajo se actúa', 'Los botones donde llega el pulgar (≥ 48 px)', 'Lo que no cambia se atenúa', 'Un aviso a la vez, corto', 'Se aprende jugando, no leyendo', 'Todo con el dedo, el teclado y el mando', 'Respetar «reducir movimiento» y el contraste'];
MC.UI = UI;
