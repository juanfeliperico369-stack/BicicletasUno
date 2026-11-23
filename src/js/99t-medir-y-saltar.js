/* =====================================================================
   📏 MEDIR ESTE CELULAR Y 🚀 LLEGAR YA (ronda 3.5, Claude) · de Motor City: la página de medición de la 5.2 (`?medir`) y el
   🚀 Ir del mapa grande de la 4.8.
   1) 📏 MEDIR: lo que más falta es probar en un celular real (el autor tiene el suyo; las IA solo un Chromium con la CPU 4×
      lenta). En Más → «📏 Medir este celular» (o abriendo el juego con ?medir al final de la dirección), el juego pedalea
      solo 10 s por una avenida en la cenital y, si hay WebGL, 10 s en el mundo 3D; luego muestra un informe para copiar y
      mandarle a las IA: cuadros por segundo, la mediana y el p95 de cada cuadro, los cuadros lentos, la pantalla, los núcleos,
      la memoria y la tarjeta gráfica. No sale nada de este celular: el informe solo se copia si tú lo copias.
   2) 🚀 LLEGAR YA: en el mapa grande del modo libre, con un destino marcado, te lleva de una vez (para explorar el valle sin
      pedalear 20 km). La ciudad del destino se dibuja por adelantado.
   ===================================================================== */
const Medir = JE.medir = {
  corriendo: false,
  async correr(seg = 10) {
    if (this.corriendo) return null; this.corriendo = true; const espera = ms => new Promise(s => setTimeout(s, ms)), out = { version: JE.version, fecha: new Date().toISOString().slice(0, 10) };
    try {
      if (JE.game.mode) JE.game.stop(); UI.closeModal && UI.closeModal();
      JE.game.start('usuario', 1, { seed: 5, nov: NOVEDADES[0], free: true, bici: 'propia' }); await espera(700);
      const M = JE.game.mode, R = M.ride; if (!R) throw new Error('sin recorrido');
      let best = null; for (const L of JE.map.lanes) { if (L.len < 900 || L.cls === 't') continue; const a = L.pts[0], z = L.pts[L.pts.length - 1]; if (Math.hypot(z.x - a.x, z.y - a.y) / L.len > .97 && (!best || L.len > best.len)) best = L; }
      const pon = () => { const q = JE.map.at(best, 30, 0); R.p.x = q.x; R.p.y = q.y; R.p.a = q.a; R.p.v = 0; R.cam.x = q.x; R.cam.y = q.y; R.traffic = .6; M.energy = 100; return q.a; };
      const tramo = async (seg, nombre) => {
        const a = pon(); Input.botDir = { x: Math.cos(a), y: Math.sin(a), m: 1 }; const d = []; let last = performance.now(); const t0 = last;
        while (performance.now() - t0 < seg * 1000) { await new Promise(r => requestAnimationFrame(r)); const n = performance.now(); d.push(n - last); last = n; M.energy = 100; }
        Input.botDir = null; d.shift(); d.sort((x, y) => x - y); const med = d[d.length >> 1], p95 = d[Math.floor(d.length * .95)];
        out[nombre] = { fps: Math.round(d.length / seg), mediana: +med.toFixed(1), p95: +p95.toFixed(1), lentos: +(100 * d.filter(x => x > 50).length / d.length).toFixed(1) };
      };
      if (JE.ui) JE.ui.toast('📏 Midiendo: ' + seg + ' s en la cenital…'); await tramo(seg, 'cenital');
      if (typeof Mundo3D !== 'undefined' && Mundo3D.ok()) { Mundo3D.poner('tercera'); if (JE.ui) JE.ui.toast('📏 Ahora ' + seg + ' s en el mundo 3D…'); await tramo(seg, 'mundo3d'); Mundo3D.poner(null); }
      out.equipo = this.equipo(); JE.game.stop(); UI.go('sHome');
    } catch (e) { out.error = e.message; try { JE.game.stop(); UI.go('sHome'); } catch (e2) { } }
    this.corriendo = false; this.ultimo = out; return out;
  },
  equipo() {
    const e = { pantalla: Math.round(innerWidth) + '×' + Math.round(innerHeight) + ' a ' + (devicePixelRatio || 1) + 'x', nucleos: navigator.hardwareConcurrency || null, memoria: navigator.deviceMemory || null, calidad: View.calidad || 1 };
    try { const c = document.createElement('canvas'), g = c.getContext('webgl'), x = g && g.getExtension('WEBGL_debug_renderer_info'); e.webgl = !!g; if (x) e.grafica = String(g.getParameter(x.UNMASKED_RENDERER_WEBGL)).slice(0, 80); } catch (err) { e.webgl = false; }
    const ua = navigator.userAgent || ''; e.sistema = /Android [\d.]+/.exec(ua)?.[0] || /iPhone OS [\d_]+/.exec(ua)?.[0]?.replace(/_/g, '.') || /Windows NT [\d.]+|Mac OS X [\d_]+|Linux/.exec(ua)?.[0] || '';
    return e;
  },
  informe(r) {
    if (!r) return ''; const f = (n, o) => o ? `${n}: ${o.fps} cuadros/s · mediana ${o.mediana} ms · p95 ${o.p95} ms · lentos ${o.lentos} %` : `${n}: no medido`;
    return [f('Cenital', r.cenital), f('Mundo 3D', r.mundo3d)].join('\n');
  },
  mostrar(r) {
    const json = JSON.stringify(r, null, 1), bien = r.cenital && r.cenital.mediana <= 34 && r.cenital.p95 <= 60;
    UI.modal(`<h2>📏 Este celular</h2><p class="m">${bien ? '✅ El juego va fluido en este equipo.' : '⚠️ Hay tirones: comparte el informe para que lo arreglemos.'}</p><pre style="white-space:pre-wrap;font:13px var(--fm);background:#ffffff14;padding:8px;border-radius:8px">${esc(this.informe(r))}</pre>
      <p class="pag">Para mandarle a las IA</p><textarea id="medirJSON" readonly style="width:100%;height:150px;font:12px var(--fm);border-radius:8px;padding:6px;box-sizing:border-box">${esc(json)}</textarea>
      <div class="col" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"><button class="btn pri" id="medirCopiar">📋 Copiar</button><button class="btn" id="mClose">Listo</button></div>`, () => {
      $('#medirCopiar').onclick = async () => { try { await navigator.clipboard.writeText(json); UI.toast('📋 Copiado'); } catch (e) { const t = $('#medirJSON'); t.select(); try { document.execCommand('copy'); UI.toast('📋 Copiado'); } catch (e2) { UI.toast('Selecciona el texto y cópialo'); } } };
    });
  },
  async empezar() { if (JE.ui) JE.ui.toast('📏 Suelta el celular 20 s: el juego pedalea solo'); const r = await this.correr(); if (r) this.mostrar(r); }
};
(function () {
  /* en Más, junto al 🧪 modo prueba */
  const _mas = UI.renderMas;
  UI.renderMas = function () {
    _mas.apply(this, arguments); const ancla = $('#tab-mas [data-tamopt]'); if (!ancla || $('#tab-mas [data-medir]')) return; const d = document.createElement('div'); d.className = 'opt';
    d.innerHTML = `<span>📏 Medir este celular<br><small class="m">20 s pedaleando solo; da un informe para mandarle a las IA</small></span><button class="btn sm" data-medir="1">Medir</button>`;
    (ancla.closest('.opt') || ancla).after(d); d.querySelector('[data-medir]').onclick = () => { Snd.sfx('tap'); Medir.empezar(); };
  };
  /* ?medir en la dirección: mide al cargar */
  if (/[?&]medir\b/.test(location.search)) { const go = () => setTimeout(() => Medir.empezar(), 1500); if (JE.ready) go(); else addEventListener('load', go); }
  /* 🚀 en el mapa grande del modo libre */
  if (typeof MapView !== 'undefined') {
    const _draw = MapView.draw;
    MapView.draw = function (V, ready) {
      const r = _draw.apply(this, arguments), R = this.ride, M = R && R.mode; if (!R || !R.way || !M || !M.free || M.net || M.sub) return r;
      const c = V.ctx, w = 120, h = 44, x = V.w - 132, y = V.h - 140;   /* encima de «▶ Ir», sin tapar el nombre del destino */ c.fillStyle = '#b0651aee'; c.beginPath(); c.roundRect(x, y, w, h, 12); c.fill(); c.strokeStyle = '#ffffff55'; c.lineWidth = 1.5; c.stroke();
      V.text('🚀 Llegar ya', x + w / 2, y + h / 2 + 6, { size: 15, align: 'center', color: '#fff' });
      this.btns.push({ x, y, w, h, fn: () => { const W0 = R.way; if (!W0) return; if (typeof Precalentar !== 'undefined') Precalentar.pedir(W0.x, W0.y, 1); R.p.x = W0.x; R.p.y = W0.y; R.p.v = 0; R.cam.x = W0.x; R.cam.y = W0.y; R.way = null; R.gpsT = 0; this.route = null; this.hide(); Snd.sfx('star'); if (JE.ui) JE.ui.toast('🚀 Llegaste a ' + W0.label); if (JE.diario) JE.diario.anotar('Saltaste a ' + W0.label, '🚀'); } });
      return r;
    };
  }
})();
