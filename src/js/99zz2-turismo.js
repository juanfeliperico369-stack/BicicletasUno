/* =====================================================================
   MODO TURISMO (3.11.0 · Claude, 26‑nov‑2026)
   El autor: «Agrega a El Metro y EnCicla un modo turismo de la ciudad y las estaciones para todos aquellos que no conozcan los
   sistemas del Valle de Aburrá».
   - Un botón en la portada: «🧭 Turismo por el valle».
   - Primero, cómo funciona EnCicla, con los mismos datos que el juego ya da en sus consejos (TIPS).
   - Después, 12 sitios para conocer. Cada uno trae su dato (LUGARES) y la estación EnCicla más cercana con la distancia a pie,
     marcada en el minimapa. Todo sale de los datos del juego.
   - «🚲 Ir en bici» abre el modo libre junto a esa estación, para llegar pedaleando.
   Aditivo: envuelve UI.init para sumar el botón.
   ===================================================================== */
(function () {
  if (typeof UI === 'undefined' || typeof LM === 'undefined') return;
  const IDS = ['botero', 'palacio', 'cerro', 'pies', 'explora', 'botanico', 'udea', 'mamm', 'lleras', 'comuna13', 'memoria', 'estadio'];
  const SISTEMA = [5, 6, 7, 8, 9, 10, 11];   /* los consejos de TIPS que explican EnCicla */
  const Tur = JE.turismo = {
    i: 0,
    paradas() {
      if (this._p) return this._p;
      return this._p = IDS.filter(id => LM[id]).map(id => { const L = LM[id], cx = (L.x + L.w / 2) * TS, cy = (L.y + L.h / 2) * TS; return { id, nombre: L.name, muni: L.muni, dato: L.fact, cx, cy, est: this.estacion(cx, cy) }; });
    },
    estacion(x, y) {
      let best = null; for (const s of (JE.map && JE.map.stations) || []) { const d = Math.hypot(s.x - x, s.y - y); if (!best || d < best.d) best = { d, s }; }
      return best ? { nombre: best.s.name, x: best.s.x, y: best.s.y, m: Math.round(best.d * M_PER_PX / 10) * 10 } : null;
    },
    abrir(i = 0) { this.i = i; this.pintar(); },
    pintar() {
      const P = this.paradas(), n = P.length, i = this.i; let h;
      if (i === 0) {
        const tips = SISTEMA.map(k => TIPS[k]).filter(Boolean);
        h = `<h2>🧭 Turismo por el valle</h2><p>¿Llegas por primera vez al Valle de Aburrá? EnCicla son las bicicletas públicas del valle: te registras, prestas una bici en una estación y la devuelves en otra. Así funciona:</p>` +
          `<div class="boxed" style="margin:8px 0">${tips.map(t => `<div style="margin:4px 0">🚲 ${esc(t)}</div>`).join('')}</div>` +
          `<p>Y aquí van ${n} sitios para conocer, con la estación EnCicla más cercana a cada uno.</p>`;
      } else {
        const p = P[i - 1], e = p.est;
        h = `<h2>🧭 ${i} de ${n} · ${esc(p.nombre)}</h2><div style="display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap"><canvas id="turMapa" width="150" height="190" style="border-radius:10px;flex:0 0 auto" aria-label="Dónde queda ${esc(p.nombre)}"></canvas>` +
          `<div style="flex:1 1 180px"><p><b>${esc(p.nombre)}</b> <small>· ${esc(p.muni || '')}</small></p><p>${esc(p.dato || '')}</p>` +
          (e ? `<p>Cómo llegar: estación EnCicla <b>${esc(e.nombre)}</b> <small>· a unos ${e.m} m</small></p>` : '') + `</div></div>`;
      }
      h += `<div class="row" style="justify-content:space-between;margin-top:10px;gap:8px"><button class="btn sm" id="turAnt" ${i === 0 ? 'disabled' : ''}>◀</button>` +
        (i > 0 ? `<button class="btn pri" id="turIr">🚲 Ir en bici</button>` : `<button class="btn pri" id="turEmp">Empezar el recorrido ▶</button>`) +
        `<button class="btn sm" id="turSig" ${i >= n ? 'disabled' : ''}>▶</button></div>`;
      UI.modal(h);
      const $i = id => document.getElementById(id), tap = () => { try { Snd.sfx('tap'); } catch (e) { /* sin sonido */ } };
      if ($i('turAnt')) $i('turAnt').onclick = () => { tap(); this.i = Math.max(0, this.i - 1); this.pintar(); };
      if ($i('turSig')) $i('turSig').onclick = () => { tap(); this.i = Math.min(n, this.i + 1); this.pintar(); };
      if ($i('turEmp')) $i('turEmp').onclick = () => { tap(); this.i = 1; this.pintar(); };
      if ($i('turIr')) $i('turIr').onclick = () => this.ir(P[i - 1]);
      if (i > 0) this.mapa(P[i - 1]);
    },
    mapa(p) {
      try {
        const cv = document.getElementById('turMapa'), M = JE.map, mi = M && M.mini; if (!cv || !mi) return; const g = cv.getContext('2d'), K = M.miniK || 1;
        const tx = p.cx / TS / K, ty = p.cy / TS / K, lado = Math.min(mi.width, 260), alto = lado * cv.height / cv.width, x0 = Math.max(0, Math.min(mi.width - lado, tx - lado / 2)), y0 = Math.max(0, Math.min(mi.height - alto, ty - alto * .55));
        g.imageSmoothingEnabled = true; g.fillStyle = '#0a2342'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(mi, x0, y0, lado, alto, 0, 0, cv.width, cv.height);
        const s = cv.width / lado, mk = (x, y, r, c) => { g.fillStyle = c; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc((x - x0) * s, (y - y0) * s, r, 0, Math.PI * 2); g.fill(); g.stroke(); };
        if (p.est) mk(p.est.x / TS / K, p.est.y / TS / K, 5, '#5e9a1e'); mk(tx, ty, 7, '#e63946');
      } catch (e) { /* sin minimapa: la tarjeta sigue */ }
    },
    /* al modo libre, junto a la estación EnCicla más cercana */
    ir(p) {
      UI.closeModal(); const play = document.getElementById('bPlay'); if (play && play.onclick) play.onclick(); else return;
      const R = Game.mode && Game.mode.ride; if (!R || !p.est) return;
      const o = JE.map.nearestOpen ? JE.map.nearestOpen(Math.floor(p.est.x / TS), Math.floor(p.est.y / TS), false) : null, x = o ? o.x * TS + TS / 2 : p.est.x, y = o ? o.y * TS + TS / 2 : p.est.y;
      R.p.x = x; R.p.y = y; R.p.v = 0; if (R.cam) { R.cam.x = x; R.cam.y = y; }
      UI.toast('🧭 ' + p.nombre + ' · estás en la estación EnCicla ' + p.est.nombre);
      this.visitas = (this.visitas || 0) + 1;
    }
  };
  const montar = () => {
    if (document.getElementById('bTurismo')) return; const ref = document.getElementById('bOficios') || document.getElementById('bPlay'); if (!ref) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'bTurismo'; b.setAttribute('aria-label', 'Turismo por el valle: sitios para conocer y la estación EnCicla de cada uno');
    b.innerHTML = '🧭 Turismo por el valle <small style="display:block;font-size:12px;font-weight:600;opacity:.85">Sitios para conocer y cómo llegar en EnCicla</small>';
    b.onclick = () => { try { Snd.sfx('tap'); } catch (e) { /* sin sonido */ } Tur.abrir(0); }; ref.insertAdjacentElement('afterend', b);
  };
  const init0 = UI.init; UI.init = function () { const r = init0.apply(this, arguments); try { montar(); } catch (e) { console.error(e); } return r; };
})();
