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
#${id} [hidden]{display:none!important}#${id} .p{pointer-events:auto}#${id} .izq{position:absolute;top:max(10px,env(safe-area-inset-top));left:10px;right:84px;display:flex;flex-direction:column;align-items:flex-start;gap:6px}#${id} .fichas{display:flex;flex-wrap:wrap;gap:6px;max-height:76px;overflow:hidden}#${id} .ficha{max-width:52vw;overflow:hidden;text-overflow:ellipsis}#${id} .mision{overflow:hidden}#${id} .mision .t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#${id} .mision .d{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#${id} .aviso.on{-webkit-line-clamp:3}
#${id} .ficha{padding:6px 10px;border-radius:999px;background:var(--f);border:1px solid var(--b);font-weight:700;white-space:nowrap;backdrop-filter:blur(6px)}
#${id} .botones{position:absolute;right:8px;top:max(10px,env(safe-area-inset-top));display:flex;flex-direction:column;flex-wrap:wrap-reverse;align-content:flex-start;max-height:calc(100vh - 170px);gap:6px}
#${id} button{min-width:48px;min-height:48px;border-radius:var(--r);border:1px solid var(--b);background:var(--f);color:var(--t);font:700 18px/1 ${T.letra};cursor:pointer}
#${id} button:focus-visible{outline:3px solid var(--a);outline-offset:2px}#${id} button small{display:block;font-size:10px;opacity:.85;margin-top:2px}
#${id} .vel{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(max(14px,env(safe-area-inset-bottom)) + 8px);text-shadow:0 2px 6px #000c;white-space:nowrap}#${id} .vel b{font:900 30px/1 ${T.letra};color:var(--a)}
#${id} .barras{display:flex;flex-wrap:wrap;gap:4px 10px;max-width:100%}#${id} .barras>div{display:flex;align-items:center;gap:4px;font-size:12px;text-shadow:0 1px 3px #000c;background:var(--f);padding:1px 8px;border-radius:999px}@media (orientation:portrait) and (max-width:560px){#${id} .barras span{display:none}}#${id} .leyenda{display:flex;flex-wrap:wrap;align-items:center;gap:3px 9px;padding:5px 10px;border-radius:var(--r);background:var(--f);font-size:12px;max-width:min(320px,70vw)}#${id} .leyenda b{margin-right:2px}#${id} .leyenda i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}#${id} .barras small{font-size:12px}#${id} .barras .barra{width:46px;height:7px}
#${id} .barra{height:8px;border-radius:6px;background:#ffffff26;overflow:hidden}#${id} .barra i{display:block;height:100%;background:linear-gradient(90deg,var(--a),var(--a2));transition:width .3s}
#${id} .aviso{padding:8px 14px;border-radius:var(--r);background:var(--f);border:1px solid var(--b);border-left:4px solid var(--a2);font-weight:800;opacity:0;transition:opacity .3s;max-width:min(340px,72vw);max-height:0;overflow:hidden}#${id} .aviso.on{opacity:1;max-height:200px}
#${id} .mision{max-width:min(320px,70vw);padding:8px 12px;border-radius:var(--r);background:var(--f);border-left:4px solid var(--a)}
#${id} .dialogo{position:absolute;left:50%;bottom:16%;transform:translateX(-50%);width:min(520px,92vw);padding:14px;border-radius:var(--r);background:var(--f);border:1px solid var(--b)}#${id} .dialogo .opts{display:grid;gap:6px;margin-top:10px}#${id} .dialogo button{font-size:15px;text-align:left;padding:10px}
#${id} .menu{position:absolute;right:66px;top:max(10px,env(safe-area-inset-top));max-height:78vh;overflow:auto;width:min(300px,72vw);padding:8px;border-radius:var(--r);background:var(--f);border:1px solid var(--b);display:grid;gap:4px}#${id} .menu button{text-align:left;font-size:14px;padding:8px 10px}
#${id} canvas.mini{position:absolute;right:10px;bottom:calc(max(16px,env(safe-area-inset-bottom)) + 96px);width:120px;height:120px;border-radius:50%;border:2px solid var(--b);background:#0006}
#${id} .fichas>*,#${id} .botones>*,#${id} .mision,#${id} .vel,#${id} .barras{transition:opacity .6s}#${id} .dim{opacity:.38}#${id}.foco .fichas,#${id}.foco .botones,#${id}.foco .mision,#${id}.foco .barras{opacity:.18}#${id} .izq .aviso{pointer-events:none}#${id}.cine>*{opacity:0!important;pointer-events:none!important}
@media (orientation:landscape){#${id} .izq{right:auto;max-width:24vw}#${id} .fichas{max-height:66px}#${id} .ficha{max-width:23vw}#${id} .mision .d{-webkit-line-clamp:1}}@media (orientation:landscape) and (max-height:500px){#${id} .ficha{padding:4px 8px;font-size:12px}#${id} .mision,#${id} .aviso{font-size:12px}}
#${id} .joy{position:absolute;left:0;top:0;width:124px;height:124px;margin:-62px 0 0 -62px;border-radius:50%;border:3px solid rgba(255,255,255,.45);background:radial-gradient(circle,rgba(255,255,255,.10),rgba(255,255,255,.03));transition:opacity .3s;will-change:transform}
#${id} .joy i{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:var(--a);opacity:.85;box-shadow:0 2px 10px #0006;will-change:transform}
#${id} .joy small{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:6px;white-space:nowrap;font-weight:800;text-shadow:0 1px 4px #000c}
#${id} .acciones{position:absolute;right:12px;bottom:max(14px,env(safe-area-inset-bottom));display:flex;gap:10px;align-items:flex-end}
#${id} .acciones button{width:66px;height:66px;border-radius:50%;font-size:26px;background:var(--f);border:2px solid var(--b)}#${id} .acciones button.on{background:var(--a);color:#000}
#${id} canvas.mini{bottom:calc(max(16px,env(safe-area-inset-bottom)) + 86px)}
@media (prefers-reduced-motion:reduce){#${id} *{transition:none!important}}`;
    document.head.appendChild(css);
    const div = (cls, padre = capa) => { const d = document.createElement('div'); d.className = cls; padre.appendChild(d); return d; };
    const izq = div('izq'), fichas = div('fichas', izq), barras = div('barras', izq), leyenda = div('leyenda', izq), mision = div('mision', izq), aviso = div('aviso', izq), botones = div('botones p'), vel = div('vel');   /* arriba se informa (fichas, barras, leyenda, misión, avisos), en columna y sin montarse; abajo a la izquierda solo va el pulgar */ mision.hidden = true; leyenda.hidden = true; aviso.setAttribute('role', 'status'); aviso.setAttribute('aria-live', 'polite');
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
      zonaLibre() { const W = innerWidth, H = innerHeight, v = H > W; return v ? { x0: W * .16, y0: H * .24, x1: W * .8, y1: H * .68 } : { x0: W * .26, y0: H * .2, x1: W * .74, y1: H * .74 }; },
      boton({ id: bid, icono = '', texto = '', al, padre }) { const b = document.createElement('button'); b.className = 'p'; b.innerHTML = icono + (texto ? '<small>' + texto + '</small>' : ''); b.setAttribute('aria-label', texto || bid); b.onclick = e => { e.stopPropagation(); al && al(e); }; (padre || botones).appendChild(b); Bs[bid] = b; return b; },
      velocidad(ms, extra = '') { vel.innerHTML = '<b>' + Math.round(Math.abs(ms) * 3.6) + '</b> km/h ' + extra; },
      barra(clave, etiqueta, v) { if (!Ba[clave]) { const w = div('', barras), [ico, ...txt] = String(etiqueta).split(' '); w.title = etiqueta; w.innerHTML = '<small>' + (txt.length ? ico + '<span> ' + txt.join(' ') + '</span>' : etiqueta) + '</small><div class="barra"><i></i></div>';   /* en celular vertical solo el ícono: las barras caben en una fila */ Ba[clave] = w.querySelector('i'); Ba[clave]._w = w; } Ba[clave].style.width = Math.round(clamp(v, 0, 1) * 100) + '%'; },
      /* avisos en cola: uno a la vez; si llega uno igual, no se repite */
      barraVisible(clave, v) { if (Ba[clave]) Ba[clave]._w.hidden = !v; },
      aviso(texto, ms = 2200, clave) { const C = ui._cola || (ui._cola = []); if (clave) { for (let i = C.length - 1; i >= 0; i--) if (C[i][2] === clave) C.splice(i, 1); if (ui._av && ui._avClave === clave) { aviso.textContent = texto; clearTimeout(ui._t); ui._t = setTimeout(() => { aviso.classList.remove('on'); setTimeout(() => ui._sig(), 320); }, ms); return; } } if (C.some(q => q[0] === texto) || aviso.textContent === texto && aviso.classList.contains('on')) return; C.push([texto, ms, clave]); if (!ui._av) ui._sig(); },   // 2.8: con «clave», el aviso nuevo reemplaza al viejo del mismo tipo (la vista nunca queda desfasada)
      _sig() { const q = (ui._cola || []).shift(); if (!q) { ui._av = false; ui._avClave = null; return; } ui._av = true; ui._avClave = q[2] || null; aviso.textContent = q[0]; aviso.classList.add('on'); clearTimeout(ui._t); ui._t = setTimeout(() => { aviso.classList.remove('on'); setTimeout(() => ui._sig(), 320); }, q[1]); },
      leyenda(L) { leyenda.hidden = !L; if (!L) return; leyenda.innerHTML = '<b>' + (L.titulo || '') + '</b>' + (L.items || []).map(([c, t]) => '<span><i style="background:' + c + '"></i>' + t + '</span>').join(''); },   // qué significa cada color de una capa de datos
      mision(texto) { mision.hidden = !texto; const [t, ...d] = String(texto || '').split('<br>'); mision.innerHTML = '<div class="t">' + t + '</div>' + (d.length ? '<div class="d">' + d.join(' ') + '</div>' : ''); },   // título en una línea; el detalle, en dos como mucho (nunca medio renglón cortado)
      /* diálogo con opciones: devuelve una promesa con la opción elegida */
      dialogo(titulo, texto, opciones = ['Listo']) { return new Promise(res => { const d = div('dialogo p'); d.setAttribute('role', 'dialog'); d.innerHTML = '<b>' + titulo + '</b><div>' + texto + '</div><div class="opts"></div>'; opciones.forEach((o, i) => { const b = document.createElement('button'); b.textContent = o; b.onclick = () => { d.remove(); res(i); }; d.querySelector('.opts').appendChild(b); if (!i) setTimeout(() => b.focus(), 50); }); }); },
      menu(titulo, items, al) { const m = div('menu p'); m.innerHTML = '<b style="padding:4px">' + titulo + '</b>'; for (const it of items) { const b = document.createElement('button'); b.innerHTML = it.texto; b.onclick = () => { m.remove(); al(it.id); }; m.appendChild(b); } const cerrar = () => m.remove(); setTimeout(() => document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', k); } }), 0); return m; },
      /* minimapa redondo con las losas del motor, girado con la cámara */
      minimapa(vistas) { const c = document.createElement('canvas'); c.className = 'mini'; c.width = c.height = 240; capa.appendChild(c); ui._mini = { c, vistas }; return c; },
      pintarMinimapa(x, y, yaw = 0, puntos = []) { const M = ui._mini; if (!M) return; const g = M.c.getContext('2d'), L = M.vistas.losas, z = .45, R = 120; g.save(); g.clearRect(0, 0, 240, 240); g.beginPath(); g.arc(R, R, R, 0, TAU); g.clip(); g.translate(R, R); g.rotate(-yaw); g.scale(z, z); g.translate(-x, -y); const s = L.L, gx0 = Math.floor((x - 300) / s), gy0 = Math.floor((y - 300) / s); for (let gy = gy0; gy <= gy0 + 4; gy++) for (let gx = gx0; gx <= gx0 + 4; gx++) { const t = L.losa(gx, gy, .5, true, false) || L.losa(gx, gy, .0625, false, false); if (t) g.drawImage(t, gx * s, gy * s, s, s); } for (const p of puntos) { g.fillStyle = p.color || '#ffc23a'; g.beginPath(); g.arc(p.x, p.y, 12, 0, TAU); g.fill(); } g.restore(); g.fillStyle = '#39ffb3'; g.beginPath(); g.moveTo(R, R - 9); g.lineTo(R + 6, R + 7); g.lineTo(R - 6, R + 7); g.fill(); },
      /* joystick visible: donde se pone el dedo aparece la base y la perilla; quieto, una guía abajo a la izquierda */
      joystick(ctl, op = {}) { const j = div('joy'), k = document.createElement('i'), t = document.createElement('small'); j.appendChild(k); j.appendChild(t); t.textContent = op.texto ?? 'Arrastra para moverte'; ui._joy = { j, k, t, ctl, usado: false, t0: Date.now() }; return j; },
      pintarJoystick() { const J = ui._joy; if (!J) return; const S = J.ctl.stick, r = J.ctl.el.getBoundingClientRect();
        if (S.activo) { J.usado = true; J.j.style.opacity = 1; J.j.style.transform = 'translate(' + (r.left + S.ox) + 'px,' + (r.top + S.oy) + 'px)'; const dx = clamp(S.px - S.ox, -52, 52), dy = clamp(S.py - S.oy, -52, 52); J.k.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; J.t.hidden = true; }
        else { const x = r.left + Math.min(110, r.width * .2), y = r.top + r.height - Math.max(150, r.height * .2); J.j.style.transform = 'translate(' + x + 'px,' + y + 'px)'; J.k.style.transform = 'translate(0,0)'; J.j.style.opacity = J.usado ? .22 : .7; J.t.hidden = J.usado; } },
      /* botones de acción grandes abajo a la derecha (donde llega el pulgar); mantener = mientras está oprimido */
      accion({ id: aid, icono = '', texto = '', mantener = false, ctl, al }) {
        if (!ui._acc) ui._acc = div('acciones p'); const b = document.createElement('button'); b.innerHTML = icono; b.setAttribute('aria-label', texto || aid); b.title = texto; ui._acc.appendChild(b);
        const on = e => { e.preventDefault(); e.stopPropagation(); b.classList.add('on'); if (ctl) ctl.boton(aid, true); if (al && !mantener) al(e); }, off = e => { b.classList.remove('on'); if (ctl) ctl.boton(aid, false); if (al && mantener && e && e.type === 'pointerup') al(e); };
        b.addEventListener('pointerdown', on); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, off); return b; },
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
/* indicador del objetivo sobre el lienzo: si se ve, un pin que rebota; si no, una flecha en el borde que apunta hacia él */
UI.indicador = function (g, W, H, sx, sy, op = {}) {
  const k = op.escala || 1, m = 46 * k, t = (op.t || 0), col = op.color || '#ffc23a', R = op.rect || [m, m * 1.8, W - m, H - m * 2.2], dentro = sx > R[0] && sy > R[1] && sx < R[2] && sy < R[3];
  g.save(); g.font = '800 ' + Math.round(13 * k) + 'px system-ui, sans-serif'; g.textAlign = 'center';
  if (dentro) { const b = Math.abs(Math.sin(t * 3)) * 8 * k, y = sy - 20 * k - b; g.fillStyle = col; g.strokeStyle = '#1a1a1a'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(sx, y + 14 * k); g.arc(sx, y, 10 * k, Math.PI * .8, Math.PI * .2); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(sx, y, 4 * k, 0, TAU); g.fill(); if (op.texto) { g.fillStyle = '#fff'; g.strokeStyle = '#000a'; g.lineWidth = 4 * k; g.strokeText(op.texto, sx, y - 16 * k); g.fillText(op.texto, sx, y - 16 * k); } }
  else { const cx = (R[0] + R[2]) / 2, cy = (R[1] + R[3]) / 2, a = Math.atan2(sy - cy, sx - cx), hx = (R[2] - R[0]) / 2, hy = (R[3] - R[1]) / 2, f = Math.min(hx / Math.max(1e-6, Math.abs(Math.cos(a))), hy / Math.max(1e-6, Math.abs(Math.sin(a)))), ex = cx + Math.cos(a) * f, ey = cy + Math.sin(a) * f, s2 = 1 + .08 * Math.sin(t * 5);   /* en el borde de la zona libre, nunca encima de la interfaz */
    g.translate(ex, ey); g.save(); g.rotate(a); g.scale(s2, s2); g.fillStyle = col; g.strokeStyle = '#1a1a1a'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(18 * k, 0); g.lineTo(-10 * k, -13 * k); g.lineTo(-4 * k, 0); g.lineTo(-10 * k, 13 * k); g.closePath(); g.fill(); g.stroke(); g.restore();
    if (op.texto) { g.fillStyle = '#fff'; g.strokeStyle = '#000a'; g.lineWidth = 4 * k; const ty = ey > H / 2 ? -22 * k : 30 * k; g.strokeText(op.texto, 0, ty); g.fillText(op.texto, 0, ty); } }
  g.restore();
};
MC.UI = UI;
