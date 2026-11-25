/* =====================================================================
   TURNO CERO · 5.2 · 📏 MEDIR EL RENDIMIENTO EN EL CELULAR DEL AUTOR (G5-12 del plan 5.0, retomado por Claude)
   Cómo se usa (sin herramientas ni cables):
   - en la página publicada, agregar ?medir a la dirección (…/getaway.html?medir), o
   - en el juego (también en la APK): ⏸ Menú → 📏 Medir el rendimiento.
   Qué hace: un bot maneja solo 60 s por calles reales de Medellín (20 s en cada acercamiento de la cámara única: de lejos, de cerca y casi tercera persona; 5.5.0),
   sin policía ni historia. Mide cada cuadro con su propio reloj (requestAnimationFrame) y el tiempo de dibujo de la vista, y
   al final muestra: cuadros por segundo, p50, p95 y p99 del cuadro, tirones (cuadros de más de 50 ms), dibujo p50 y p95,
   memoria de JavaScript (si el navegador la da), la GPU (nivel, nombre, WebGL), la pantalla y los gráficos que se usaron.
   El botón «📋 Copiar resultados» copia todo como texto para pegarlo en el chat de las IA. No se envía nada a ningún lado.
   ===================================================================== */
const Medir = {
  activo: null, TRAMOS: [['lejos', 'Cenital de lejos', 6], ['cerca', 'Cenital de cerca', 20], ['tercera', 'Casi tercera persona', 52]], SEG: 20,   /* 5.5.0: la cámara única con tres acercamientos (px por metro) */
  /* empieza: el mundo abierto (si hace falta), la calle y la primera cámara */
  async empezar() {
    if (this.activo) return; const portada = () => { const P = document.getElementById('portada'); return !!P && !P.hidden; }, listo = () => !portada() && G.M && G.cuerpo && G.E && !G.transicion;
    if (!listo()) { if (portada() && G.abrirMundo) G.abrirMundo(); for (let i = 0; i < 900 && !listo(); i++) await new Promise(r => setTimeout(r, 100)); await new Promise(r => setTimeout(r, 1500)); }   /* desde la portada: el mundo abierto (el mundo se precarga detrás) */
    if (!listo()) return; if (G.Modos && G.Modos.m) G.Modos.terminar('Medición del rendimiento');
    for (const d of document.querySelectorAll('.mcui .dialogo, .mcui .menu')) d.remove(); G.pausa = false;
    const C = G.cuerpo, M = G.M; if (C.veh.clase === 'pie' || C.veh.clase === 'rueda') { C.setVeh(G.veh && G.veh !== 'pie' ? G.veh : 'tc_vega'); C.estacionado = null; }
    if (G.busq && G.busq.ponerNivel) G.busq.ponerNivel(0);
    const ruta = this.ruta(); if (!ruta) { G.ui.aviso('📏 No encontré una calle larga para medir aquí', 2400, 'medir'); return; }
    const q = ruta.punto(0); Object.assign(C, { x: q.x, y: q.y, a: q.a, v: 0 });
    this.activo = { ruta, s: 0, dist: 0, t0: performance.now(), tramo: -1, cuadros: [], dib: [], mem: [], vistaAntes: G.vistaId, zoomAntes: G.camara.zoom, antes: { acelFijo: G.acelFijo } };
    this.cambiarTramo(0); this._rafUlt = 0; requestAnimationFrame(t => this.cuadro(t));
    G.ui.aviso('📏 Midiendo 60 s: el bot maneja solo. No toques nada', 3000, 'medir');
  },
  /* una ruta larga por calles de carro: del centro hacia un sitio lejano (2 a 4 km) */
  ruta() {
    const M = G.M, C = G.cuerpo, o = M.buscar('parque berrio') || M.buscar('coltejer') || { x: C.x, y: C.y }, ini = M.viaCercana(o.x, o.y, 200, deCarro); if (!ini) return null;
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, fin = M.viaCercana(o.x + Math.cos(a) * 2600, o.y + Math.sin(a) * 2600, 300, deCarro); if (!fin) continue; const Q = rutaTC(M, [ini, fin], false); if (Q && Q.length >= 12) { const p = new PistaTC(Q, false); if (p.L > 1500) return p; } }
    return null;
  },
  cambiarTramo(i) {
    const A = this.activo; A.tramo = i; A.tramos = A.tramos || []; A.tramos[i] = { id: this.TRAMOS[i][0], n: this.TRAMOS[i][1], cuadros: [], dib: [] };
    const Tr = this.TRAMOS[i]; G.vistaId = 'cenital'; G.vistas.usar('cenital', G.E); if (Tr[2]) G.camara.zoom = Tr[2] * (G.dEf || 1);
  },
  /* el reloj propio: el tiempo entre cuadros de verdad (lo que ve el jugador) y lo que tardó en dibujar la vista */
  cuadro(t) {
    const A = this.activo; if (!A) return; if (this._rafUlt) { const ms = t - this._rafUlt, T = A.tramos[A.tramo]; if (ms > 0 && ms < 2000) { T.cuadros.push(ms); A.cuadros.push(ms); const d = G.vistas.ms; if (d >= 0) { T.dib.push(d); A.dib.push(d); } } }
    this._rafUlt = t; { const C = G.cuerpo; if (A._px != null) A.dist += Math.min(40, Math.hypot(C.x - A._px, C.y - A._py)); A._px = C.x; A._py = C.y; } const seg = Math.max(0, (t - A.t0) / 1000), i = Math.min(this.TRAMOS.length - 1, Math.floor(seg / this.SEG));   /* 5.4.1: el sello del cuadro (rAF) puede ser anterior a A.t0: sin el tope, i = −1 y TRAMOS[−1][0] rompía (la carrera intermitente de pruebas/medir.mjs) */
    if (performance.memory && (!A._mt || t - A._mt > 1000)) { A._mt = t; A.mem.push(performance.memory.usedJSHeapSize / 1048576); }
    if (seg >= this.SEG * this.TRAMOS.length) return this.terminar();
    if (i !== A.tramo) this.cambiarTramo(i);
    if (!A._av || t - A._av > 1000) { A._av = t; G.ui.aviso('📏 Midiendo… ' + Math.floor(seg) + ' s de ' + this.SEG * this.TRAMOS.length + ' · ' + this.TRAMOS[i][1], 1200, 'medir'); }
    requestAnimationFrame(t2 => this.cuadro(t2));
  },
  /* el bot: sigue la ruta mirando 16 m adelante (persecución pura), con el acelerador a 85 % */
  entrada(e) {
    const A = this.activo; if (!A) return; const C = G.cuerpo, p = A.ruta, pr = p.proyectar(C.x, C.y, A.s); if (pr.s > A.s) A.s = pr.s;
    if (A.s > p.L - 30) { const n = this.ruta(); if (n) { A.ruta = n; A.s = 0; const q = n.punto(0); Object.assign(C, { x: q.x, y: q.y, a: q.a, v: 0 }); } }
    const q = p.punto(A.s + 16), dx = q.x - C.x, dy = q.y - C.y, L = Math.hypot(dx, dy) || 1;
    e.dir = { x: dx / L, y: dy / L, m: 1 }; e.acel = .85; e.giro = 0; e.derrape = false; e.turbo = false;
  },
  pct(L, p) { if (!L.length) return 0; const S = L.slice().sort((a, b) => a - b); return S[Math.min(S.length - 1, Math.floor(p * (S.length - 1) + .5))]; },
  resumen(L, D) { const r1 = v => Math.round(v * 10) / 10, p50 = this.pct(L, .5); return { cuadros: L.length, fps: p50 ? Math.round(1000 / p50) : 0, p50: r1(p50), p95: r1(this.pct(L, .95)), p99: r1(this.pct(L, .99)), tirones: L.filter(v => v > 50).length, dibujo_p50: r1(this.pct(D, .5)), dibujo_p95: r1(this.pct(D, .95)) }; },
  terminar() {
    const A = this.activo; if (!A) return; this.activo = null; G.cuerpo.v = 0; G.vistaId = A.vistaAntes || 'cenital'; G.vistas.usar(G.vistaId, G.E); if (A.zoomAntes) G.camara.zoom = A.zoomAntes;
    const P = MC.GPU.perfil(), r1 = v => Math.round(v * 10) / 10, mem = A.mem.length ? { inicio_MB: r1(A.mem[0]), fin_MB: r1(A.mem[A.mem.length - 1]), pico_MB: r1(Math.max(...A.mem)) } : 'el navegador no la da';
    const R = this.res = { version: MC.version || '', fecha: new Date().toISOString().slice(0, 16).replace('T', ' '), segundos: this.SEG * this.TRAMOS.length, recorrido_m: Math.round(A.dist), total: this.resumen(A.cuadros, A.dib),
      tramos: A.tramos.map(T => Object.assign({ camara: T.n }, this.resumen(T.cuadros, T.dib))), memoria: mem,
      gpu: { nivel: P.nivel, nombre: P.renderer || '(oculto)', webgl: P.webgl, textura_max: P.maxTex, memoria_GB: P.memoria || '?', nucleos: P.nucleos, movil: P.movil },
      pantalla: { css: innerWidth + '×' + innerHeight, lienzo: G.W + '×' + G.H, dpr: devicePixelRatio || 1 },
      graficos: { opcion: MC.opciones.graficos || 'automaticos', motor3d: G.vistas.motor3d, raster: !!(G.vistas.usaRaster && G.vistas.usaRaster()), calidad: Math.round((G.E && G.E.calidad || 0) * 100) / 100 },
      navegador: (navigator.userAgent || '').replace(/\s+/g, ' ').slice(0, 160) };
    MC.emit('medir:fin', R); this.mostrar(R); return R;
  },
  texto(R) {
    const T = R.total, l = ['📏 Turno Cero ' + R.version + ' · ' + R.fecha, 'Total ' + R.segundos + ' s (el bot recorrió ' + R.recorrido_m + ' m): ' + T.fps + ' fps · cuadro p50 ' + T.p50 + ' ms · p95 ' + T.p95 + ' ms · p99 ' + T.p99 + ' ms · tirones (>50 ms) ' + T.tirones + ' · dibujo p50 ' + T.dibujo_p50 + ' / p95 ' + T.dibujo_p95 + ' ms'];
    for (const t of R.tramos) l.push('· ' + t.camara + ': ' + t.fps + ' fps · p50 ' + t.p50 + ' · p95 ' + t.p95 + ' · p99 ' + t.p99 + ' ms · tirones ' + t.tirones + ' · dibujo p95 ' + t.dibujo_p95 + ' ms');
    l.push('Memoria JS: ' + (typeof R.memoria === 'string' ? R.memoria : R.memoria.inicio_MB + ' → ' + R.memoria.fin_MB + ' MB (pico ' + R.memoria.pico_MB + ')'));
    l.push('GPU: ' + R.gpu.nivel + ' · ' + R.gpu.nombre + ' · WebGL ' + R.gpu.webgl + ' · ' + R.gpu.memoria_GB + ' GB · ' + R.gpu.nucleos + ' núcleos');
    l.push('Pantalla: ' + R.pantalla.css + ' (lienzo ' + R.pantalla.lienzo + ', dpr ' + R.pantalla.dpr + ') · gráficos ' + R.graficos.opcion + ' · calidad ' + R.graficos.calidad + (R.graficos.raster ? ' · por software' : ''));
    l.push('Navegador: ' + R.navegador, '', JSON.stringify(R)); return l.join('\n');
  },
  /* el panel de resultados, con 📋 Copiar resultados */
  mostrar(R) {
    const T = R.total, td = 'padding:1px 6px', fila = t => '<tr><td style="text-align:left;' + td + '">' + t.camara + '</td><td style="' + td + '">' + t.fps + '</td><td style="' + td + '">' + t.p50 + '</td><td style="' + td + '">' + t.p95 + '</td><td style="' + td + '">' + t.p99 + '</td><td style="' + td + '">' + t.tirones + '</td></tr>';
    /* compacto: cabe en 860 × 412 con los tres botones */
    const html = '<table style="width:100%;font-size:.8em;text-align:right;border-collapse:collapse"><tr><th style="text-align:left;' + td + '">Cámara</th><th style="' + td + '">fps</th><th style="' + td + '">p50</th><th style="' + td + '">p95</th><th style="' + td + '">p99</th><th style="' + td + '">tirones</th></tr>' + R.tramos.map(fila).join('') + '<tr style="font-weight:700">' + fila(Object.assign({}, T, { camara: 'Total' })).slice(4) + '</table><div style="font-size:.72em;opacity:.85;margin-top:2px">ms por cuadro · memoria ' + (typeof R.memoria === 'string' ? R.memoria : R.memoria.fin_MB + ' MB (pico ' + R.memoria.pico_MB + ')') + ' · GPU ' + R.gpu.nivel + ' · ' + R.pantalla.css + ' · dpr ' + R.pantalla.dpr + '</div>';
    G.pausa = true; G.ui.dialogo('📏 Resultados de la medición', html, ['📋 Copiar resultados', '↻ Otra vez', 'Listo']).then(async i => {
      G.pausa = false; if (i === 0) { const ok = await this.copiar(this.texto(R)); G.ui.aviso(ok ? '📋 Copiado: pégalo en el chat de la IA' : '📋 No se pudo copiar solo: mantén presionado el texto para copiarlo', 3200, 'medir'); if (!ok) this.mostrarTexto(R); else this.mostrar(R); }
      else if (i === 1) this.empezar(); });
  },
  async copiar(txt) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(txt); return true; } } catch (e) { /* sigue con el respaldo */ }
    try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'position:fixed;left:0;top:0;opacity:0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; }
  },
  mostrarTexto(R) { G.pausa = true; G.ui.dialogo('📏 Resultados (texto)', '<textarea readonly style="width:100%;height:12em;font-size:.75em">' + this.texto(R).replace(/</g, '&lt;') + '</textarea>', ['Listo']).then(() => { G.pausa = false; }); }
};
G.Medir = Medir;
EXTRAS.entrada.push(e => Medir.entrada(e));
/* ?medir en la dirección: empieza solo cuando el juego esté listo */
if (/[?&]medir\b/.test(location.search)) { const n = location.search.match(/[?&]medir=(\d+)/); if (n) Medir.SEG = Math.max(3, Math.min(60, +n[1]));   /* ?medir=N: N segundos por cámara (las pruebas usan pocos) */ const ir = () => { if (window.TURNO_LISTO) Medir.empezar(); else setTimeout(ir, 300); }; setTimeout(ir, 300); }
