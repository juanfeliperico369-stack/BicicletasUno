/* =====================================================================
   TURNO CERO · 5.4 · 🧰 GARAJE Y COLECCIÓN (la cápsula 3, solo la interfaz · renacimiento cenital, Fase 5 · Claude, 25‑nov‑2026)
   - Una pantalla aparte, en 2D pixel: cada vehículo en su ficha, con su dibujo de lado en pixel art (procedural, 64 × 28 y
     agrandado sin suavizar) y las cifras de MC.Taller.disenar: velocidad máxima, 0–100 km/h, frenada desde 100, potencia por
     peso y consumo, calculadas con su ficha real (masa, kW, N·m, Cd y área).
   - Las motos traen su perfil de MC.Dinamica (reparto del peso, centro de masa, agarre y marchas; se inclinan en las curvas desde la 5.2).
   - La pestaña «Capa aérea» lista lo que vuela (capa 2: el jetpack, la avioneta y el avión), con su techo y su velocidad mínima
     (las del motor; la pérdida no se inventa sin una ficha con alas reales):
     son los ganchos para cuando exista la cápsula del aire (G.Garaje.capaAerea()).
   - SIN CARGAR EL NÚCLEO: se abre desde la portada (🧰 Garaje) sin cargar ninguna ciudad, y ahí eliges con qué carro empiezas.
     En el mundo abierto se abre desde 🎮 Modos y cambias de carro ahí mismo.
   - La colección: los que tienes (G.tengo) y cuántos kilómetros llevas en cada uno (se cuentan mientras manejas).
   Archivo aditivo: suma «garaje» a Modos.DEF, un botón en la portada y un contador en EXTRAS.paso.
   ===================================================================== */
(function () {
  if (typeof Modos === 'undefined' || typeof MC === 'undefined' || !MC.Taller) return;
  const css = document.createElement('style');
  css.textContent = '#garaje{position:fixed;inset:0;z-index:46;display:flex;flex-direction:column;background:#120d0c;background-image:linear-gradient(#ffffff08 1px,transparent 1px),linear-gradient(90deg,#ffffff08 1px,transparent 1px);background-size:8px 8px;color:#f3e9dc;font:600 14px/1.3 ui-monospace,Menlo,Consolas,monospace}'
    + '#garaje[hidden]{display:none}#garaje header{display:flex;align-items:center;gap:8px;padding:max(10px,env(safe-area-inset-top)) 12px 8px}#garaje h2{margin:0;flex:1;font:800 18px ui-monospace,Menlo,monospace;letter-spacing:.04em;text-transform:uppercase}'
    + '#garaje .gx{width:44px;height:44px;border:3px solid #f3e9dc;background:#2a1d1a;color:#f3e9dc;font:800 18px system-ui;box-shadow:3px 3px 0 #000}'
    + '#garaje .tabs{display:flex;gap:8px;padding:0 12px 8px}#garaje .tabs button{flex:1;padding:9px 6px;border:3px solid #f3e9dc;background:#2a1d1a;color:#f3e9dc;font:800 13px ui-monospace,monospace;box-shadow:3px 3px 0 #000}#garaje .tabs button[aria-pressed="true"]{background:#e0a33a;color:#120d0c}'
    + '#garaje .rej{flex:1;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(178px,1fr));gap:12px;padding:4px 12px calc(16px + env(safe-area-inset-bottom))}'
    + '#garaje .gc{border:3px solid #f3e9dc;background:#201614;box-shadow:4px 4px 0 #000;padding:8px;display:grid;gap:6px;align-content:start}#garaje .gc.yo{border-color:#e0a33a}'
    + '#garaje canvas{width:100%;aspect-ratio:64/28;image-rendering:pixelated;image-rendering:crisp-edges;background:#2f2421;border:2px solid #000}'
    + '#garaje .gn{font:800 13px ui-monospace,monospace}#garaje .gb{display:flex;gap:4px;flex-wrap:wrap}#garaje .gb span{border:2px solid #f3e9dc55;padding:1px 5px;font-size:11px}'
    + '#garaje dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:1px 8px;font-size:12px}#garaje dt{opacity:.7}#garaje dd{margin:0;text-align:right}'
    + '#garaje .gu{padding:8px;border:3px solid #39ffb3;background:#102a22;color:#39ffb3;font:800 13px ui-monospace,monospace;box-shadow:3px 3px 0 #000}#garaje .gu:disabled{opacity:.45;border-color:#f3e9dc55;color:#f3e9dc}';
  document.head.appendChild(css);
  const kmh = v => Math.round(v * 3.6), r1 = v => Math.round(v * 10) / 10, VEHM = id => MC.Vehiculos && MC.Vehiculos.get ? MC.Vehiculos.get(id) : null;

  /* ---------- el dibujo en pixel art (de lado, mirando a la derecha) ---------- */
  function hexA(c, k) { const v = parseInt((c || '#888888').slice(1), 16), f = x => Math.max(0, Math.min(255, Math.round(x * k))); return 'rgb(' + f(v >> 16 & 255) + ',' + f(v >> 8 & 255) + ',' + f(v & 255) + ')'; }
  function pixel(forma, color) {
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 28; const g = cv.getContext('2d'), R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    const rueda = (x, y, r) => { R(x - r, y - r + 1, r * 2, r * 2 - 2, '#111'); R(x - r + 1, y - r, r * 2 - 2, r * 2, '#111'); R(x - 2, y - 2, 4, 4, '#9a9a9a'); };
    const c = color, osc = hexA(color, .62), cla = hexA(color, 1.25), vid = '#7fb2c9';
    R(0, 25, 64, 3, '#1a1311');   /* el piso */
    if (forma === 'moto') { rueda(15, 21, 5); rueda(48, 21, 5); R(18, 15, 26, 3, osc); R(24, 11, 14, 5, c); R(38, 10, 6, 3, cla); R(44, 13, 5, 2, '#ddd'); R(20, 12, 9, 2, '#222'); R(27, 4, 6, 6, '#1b1b1b'); R(26, 9, 8, 6, '#3a3a46'); R(31, 13, 4, 6, '#2b2b33'); R(48, 14, 2, 3, '#ffd34d'); }
    else if (forma === 'camion') { R(3, 3, 40, 17, cla); R(3, 3, 40, 2, osc); R(44, 7, 16, 13, c); R(48, 9, 9, 5, vid); R(59, 15, 2, 2, '#ffd34d'); R(3, 14, 2, 2, '#c0392b'); R(3, 19, 57, 2, osc); rueda(13, 21, 4); rueda(25, 21, 4); rueda(52, 21, 4); }
    else if (forma === 'jetpack') { R(28, 3, 6, 6, '#e0b48c'); R(27, 2, 8, 3, '#2b2b33'); R(27, 9, 8, 9, c); R(22, 9, 5, 10, '#6d7178'); R(28, 18, 3, 6, '#2b2b33'); R(32, 18, 3, 6, '#2b2b33'); R(22, 19, 5, 3, '#ff9d2e'); R(23, 22, 3, 3, '#ffd34d'); }
    else if (forma === 'avioneta') { R(6, 12, 50, 6, c); R(52, 13, 6, 4, cla); R(59, 8, 2, 14, '#444'); R(6, 5, 6, 8, osc); R(22, 10, 18, 3, osc); R(42, 13, 7, 3, vid); R(18, 21, 2, 3, '#333'); R(40, 21, 2, 3, '#333'); R(17, 23, 4, 2, '#111'); R(39, 23, 4, 2, '#111'); }
    else if (forma === 'avion') { R(4, 12, 52, 5, c); R(56, 13, 6, 3, cla); R(4, 4, 8, 9, osc); R(22, 9, 20, 3, osc); R(30, 16, 14, 3, osc); R(44, 11, 7, 3, vid); R(2, 13, 3, 3, '#ff9d2e'); }
    else {   /* carros: sedán, taxi y 4×4 */
      const alto = forma === 'cuatro' ? 2 : 0, rr = forma === 'cuatro' ? 6 : 5;
      R(4, 13 - alto, 56, 8, c); R(6, 12 - alto, 52, 1, c); R(18, 6 - alto, 26, 7, c); R(21, 8 - alto, 10, 4, vid); R(33, 8 - alto, 9, 4, vid); R(4, 19, 56, 2, osc); R(18, 6 - alto, 26, 1, cla);
      R(59, 15 - alto, 2, 2, '#ffd34d'); R(3, 15 - alto, 2, 2, '#c0392b');
      if (forma === 'taxi') { R(28, 2, 7, 4, '#ffd34d'); for (let x = 6; x < 58; x += 4) R(x, 16 - alto, 2, 1, '#111'); }
      rueda(15, 21, rr); rueda(49, 21, rr);
    }
    return cv;
  }
  const FORMA = { tc_mercury: 'taxi', tc_trocha: 'cuatro', tc_dockline: 'camion', tc_arrow: 'moto', jetpack: 'jetpack', avioneta: 'avioneta', avion: 'avion' };

  /* ---------- las fichas ---------- */
  function fichaTierra(v) {
    const d = MC.Taller.disenar({ id: v.id, n: v.n, tipo: v.tipo === 'camion' ? 'camion' : v.tipo === 'moto' ? 'moto' : 'carro', masa: v.masa, potenciaKW: v.potenciaKW, parNm: v.parNm, cd: v.cd, area: v.area });
    const filas = [['Vel. máx.', kmh(d.vmax) + ' km/h'], ['0–100', d.ceroCien ? r1(d.ceroCien) + ' s' : '—'], ['Frenada 100–0', Math.round(d.frenada100) + ' m'], ['Potencia/peso', r1(d.potenciaPeso) + ' kW/t'], ['Consumo', d.consumo ? r1(d.consumo) + ' L/100 km' : '—']];
    let perfil = null;
    if (v.tipo === 'moto' && MC.Dinamica && MC.Dinamica.hoja) { const V = VEHM(v.id), h = V ? MC.Dinamica.hoja(V) : null; if (h) perfil = [['Peso adelante', Math.round(h.pesoAdel * 100) + ' %'], ['Centro de masa', r1(h.cgAlto) + ' m'], ['Agarre μ', r1(h.mu)], ['Marchas', h.marchas.length + ' · corte ' + h.rpmMax + ' rpm'], ['En las curvas', 'se inclina']]; }
    return { id: v.id, n: v.n, icon: v.icon, color: v.color, forma: FORMA[v.id] || 'sedan', clase: v.tipo, filas, perfil, d: v.d };
  }
  function capaAerea() {
    const out = []; if (!MC.Vehiculos || !MC.Vehiculos.lista) return out;
    for (const [id, V] of MC.Vehiculos.lista) {
      if (!V.vuela) continue;   /* solo las cifras que el motor tiene de verdad: sin una ficha con alas reales, no se inventa la pérdida */
      out.push({ id, n: V.n, icon: V.icon || '✈️', color: V.color || '#78909c', forma: FORMA[id] || 'avioneta', clase: 'aire', capa: 2, filas: [['Vel. máx.', kmh(V.vmax || 0) + ' km/h'], ['Vel. mínima', V.vmin ? kmh(V.vmin) + ' km/h' : 'flota'], ['Techo', (V.techo || 0) + ' m'], ['Masa', V.masa ? V.masa + ' kg' : '—']], d: V.futuro ? 'De la capa aérea del motor (capa 2): ya vuela en el mundo abierto; su cápsula propia viene después.' : 'Capa aérea del motor (capa 2).' });
    }
    return out;
  }

  /* ---------- los kilómetros de cada uno (la colección) ---------- */
  let km = null, kmT = 0, ultimo = null;
  const kmDe = () => km || (km = Object.assign({}, leerG().km || {}));
  EXTRAS.paso.push(dt => {
    const C = G.cuerpo; if (!C || G.pausa || C.veh.clase === 'pie') { ultimo = null; return; }
    if (ultimo && ultimo.veh === C.veh.id) { const d = Math.hypot(C.x - ultimo.x, C.y - ultimo.y); if (d < 60) { const K = kmDe(); K[C.veh.id] = (K[C.veh.id] || 0) + d / 1000; } }
    ultimo = { x: C.x, y: C.y, veh: C.veh.id }; kmT += dt; if (kmT > 10) { kmT = 0; escribirG({ km: kmDe() }); }
  });

  /* ---------- la pantalla ---------- */
  const Garaje = G.Garaje = {
    abierto: false, capaAerea,
    abrir(op = {}) {
      let d = document.getElementById('garaje'); if (!d) { d = document.createElement('div'); d.id = 'garaje'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Garaje y colección'); document.body.appendChild(d); }
      const enMundo = !!(G.M && G.cuerpo), pestana = op.pestana || 'tierra'; this.abierto = true; this._portada = !enMundo; if (enMundo) G.pausa = true;
      d.innerHTML = '<header><h2>🧰 Garaje y colección</h2><button class="gx" aria-label="Cerrar">✕</button></header><div class="tabs"><button data-t="tierra">🚗 Tierra</button><button data-t="aire">✈️ Capa aérea</button></div><div class="rej"></div>';
      const lista = pestana === 'aire' ? capaAerea() : TC.VEHICULOS.map(fichaTierra), K = kmDe(), actual = enMundo ? G.cuerpo.veh.id : G.veh, rej = d.querySelector('.rej');
      for (const b of d.querySelectorAll('.tabs button')) { b.setAttribute('aria-pressed', String(b.dataset.t === pestana)); b.onclick = () => this.abrir({ pestana: b.dataset.t }); }
      for (const f of lista) {
        const tiene = f.capa === 2 || (G.tengo || []).includes(f.id), card = document.createElement('div'); card.className = 'gc' + (f.id === actual ? ' yo' : ''); card.dataset.id = f.id;
        card.appendChild(pixel(f.forma, f.color));
        const info = document.createElement('div'); info.innerHTML = '<div class="gn">' + f.icon + ' ' + f.n + '</div><div class="gb"><span>' + ({ carro: 'carro', camion: 'camión', moto: 'moto', aire: 'capa aérea' }[f.clase] || f.clase) + '</span>' + (f.clase !== 'aire' ? '<span>' + r1(K[f.id] || 0) + ' km</span>' : '') + (f.id === actual ? '<span>lo llevas</span>' : '') + '</div>'
          + '<dl>' + f.filas.concat(f.perfil || []).map(([a, b]) => '<dt>' + a + '</dt><dd>' + b + '</dd>').join('') + '</dl>' + (f.d ? '<div style="font-size:11px;opacity:.75">' + f.d + '</div>' : '');
        card.appendChild(info);
        const bt = document.createElement('button'); bt.className = 'gu'; bt.dataset.usar = f.id;
        bt.textContent = f.id === actual ? 'Es el tuyo ahora' : enMundo ? (f.capa === 2 ? '✈️ Usar en el mundo' : '🔑 Usar este') : (f.capa === 2 ? 'Solo en el mundo abierto' : '▶ Empezar con este');
        bt.disabled = f.id === actual || !tiene || (!enMundo && f.capa === 2); bt.onclick = () => this.usar(f.id, f.capa === 2); card.appendChild(bt); rej.appendChild(card);
      }
      d.querySelector('.gx').onclick = () => this.cerrar(); d.hidden = false; MC.emit('garaje:abre', { portada: !enMundo, pestana });
      return true;
    },
    usar(id, aire) {
      if (G.M && G.cuerpo) { const C = G.cuerpo; if (aire) { C.setVeh(id); C.estacionado = null; } else cambiarVeh(id); }
      else { G.veh = id; const L = leerG().libre; if (L) escribirG({ libre: Object.assign({}, L, { veh: id }) }); G.ui && G.ui.aviso && G.ui.aviso('🧰 Empiezas en el ' + (TC.VEHICULOS.find(v => v.id === id) || { n: id }).n, 2000, 'veh'); }
      MC.emit('garaje:usar', { id }); this.cerrar();
    },
    cerrar() { const d = document.getElementById('garaje'); if (d) d.hidden = true; if (this.abierto && !this._portada) G.pausa = false; this.abierto = false; if (typeof t0 !== 'undefined') t0 = performance.now(); }
  };

  /* en 🎮 Modos (en el mundo abierto) */
  Modos.DEF.garaje = { ico: '🧰', n: 'Garaje y colección', d: 'tus carros en fichas pixel con sus cifras reales (MC.Taller), la moto y la capa aérea' };
  const empezar0 = Modos.empezar;
  Modos.empezar = function (id) { if (id !== 'garaje') return empezar0.apply(this, arguments); if (this.m) this.terminar(null); return Garaje.abrir(); };
  /* en la portada, sin cargar ninguna ciudad */
  const enPortada = () => { const m = document.getElementById('bModos'); if (!m || document.getElementById('bGaraje')) return; const b = document.createElement('button'); b.id = 'bGaraje'; b.className = 'b2'; b.textContent = '🧰 Garaje y colección'; b.onclick = () => Garaje.abrir(); m.insertAdjacentElement('afterend', b); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enPortada); else enPortada();
})();
