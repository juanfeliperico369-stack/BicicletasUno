/* =====================================================================
   TRAMA DEL MUNDO LIBRE: «RUEDAS Y RIELES DEL ABURRÁ» (v1.8 · M6)
   Unifica en el mundo abierto de Juega EnCicla:
   - Los 15 personajes compartidos de Juega EnCicla y El Metro ubicados en sus
     barrios y estaciones reales del Valle de Aburrá, con retrato, saludo en
     bocadillo flotante y diálogo al acercarse.
   - Los 6 capítulos del arco jugable «Ruedas y Rieles del Aburrá», que combinan
     los oficios de EnCicla, los nuevos vehículos de M5 (bici eléctrica, skate,
     monopatín eléctrico) y los corredores en 3D de M4 (MGRunner3D).
   - Los 4 fragmentos cruzados con El Metro (Tiquete Edmonson de 1929, Silbato de
     La Quiebra, Polea del Metrocable K y Plano Maestro Ruedas y Rieles).
   ===================================================================== */

const Trama = JE.trama = {
  guion() { return (typeof GUION !== 'undefined' && GUION && GUION.trama_valle) || { personajesEnCicla: [], capitulos: [] }; },
  metro() { return (typeof GUION !== 'undefined' && GUION && GUION.metro) || { personajesMetro: [], fragmentos: [] }; },

  /* Todos los personajes de ambos juegos posicionados en coordenadas de píxel sobre la calle/andén abierto más cercano */
  personajes() {
    if (this._pers) return this._pers;
    const G = this.guion(), M = this.metro(), list = [];
    const all = (G.personajesEnCicla || []).map(p => Object.assign({ juego: 'EnCicla' }, p))
      .concat((M.personajesMetro || []).map(p => Object.assign({ juego: 'El Metro' }, p)));
    for (const p of all) {
      const o = JE.map ? JE.map.nearestOpen(p.tx | 0, p.ty | 0, false) : { x: p.tx, y: p.ty };
      list.push(Object.assign({}, p, { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2 }));
    }
    this._pers = list;
    return list;
  },

  fragmentos() {
    if (this._frags) return this._frags;
    const M = this.metro(), list = [];
    for (const f of (M.fragmentos || [])) {
      const o = JE.map ? JE.map.nearestOpen(f.tx | 0, f.ty | 0, false) : { x: f.tx, y: f.ty };
      list.push(Object.assign({}, f, { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2 }));
    }
    this._frags = list;
    return list;
  },

  estado() {
    const S = Save.data;
    if (Array.isArray(S.trama)) { S.tramaHechas = (S.tramaHechas || []).concat(S.trama); S.trama = null; }   // la v1.7.2 guardaba ahí las misiones de misiones.json
    if (!S.trama || typeof S.trama !== 'object') S.trama = { cap: 0, done: [], frags: [], charlas: [] };
    return S.trama;
  },

  capActual() {
    const E = this.estado(), caps = this.guion().capitulos || [];
    return caps.find(c => !E.done.includes(c.id)) || null;
  },

  /* Inicia o continúa un capítulo de la trama en el mundo libre sin encerrar al jugador */
  iniciarCap(M, capId) {
    if (!M || !M.free || !M.ride) return;
    const caps = this.guion().capitulos || [];
    const C = (capId && caps.find(c => c.id === capId)) || this.capActual() || caps[0];
    if (!C) return;
    this.limpiar(M);
    const o1 = JE.map.nearestOpen(C.tx1 | 0, C.ty1 | 0, false);
    const dx = o1.x * TS + TS / 2, dy = o1.y * TS + TS / 2;
    if (C.veh && M.cambiarVehiculo) M.cambiarVehiculo(C.veh);
    M.tramaAct = {
      cap: C,
      m: M.ride.marker({
        x: dx, y: dy, r: 22 * WK, col: '#ff2fb3', label: '📖 ' + C.titulo, num: C.n,
        enter: () => this.llegarCap(M, C)
      })
    };
    M.ride.target = M.tramaAct.m;
    M.ride.calcGps();
    Snd.sfx('ok');
    if (JE.ui) JE.ui.toast('📖 Cap. ' + C.n + ' · ' + C.titulo + ': ' + C.intro);
  },

  llegarCap(M, C) {
    if (!M.tramaAct || M.tramaAct.cap !== C) return;
    this.limpiar(M);
    const finalizar = () => {
      const E = this.estado();
      if (!E.done.includes(C.id)) E.done.push(C.id);
      const premio = C.hojas || 15;
      Save.data.stats.leaves = (Save.data.stats.leaves | 0) + premio;
      M.score += premio * 2;
      if (E.done.length >= (this.guion().capitulos || []).length) {
        Save.data.flags = Save.data.flags || {};
        Save.data.flags.trama_valle = 1;
      }
      const nw = Logros.check();
      Save.save();
      M.ride.stamp = { t: 3.2, title: 'CAP. ' + C.n + ' COMPLETADO', sub: C.titulo + ' · +' + premio + ' 🍃', bg: '#c4ec7c' };
      Snd.sfx('win');
      if (JE.ui) JE.ui.toast('📖 ' + C.cierre + (nw.length ? ' · 🏅 ' + nw.map(x => x.name).join(', ') : ''));
    };
    if (C.runner != null && typeof MGRunner3D !== 'undefined' && !M.sub) {
      const veh = (M.ride.p.veh === 'bike' && M.ebike) ? 'ebike' : M.ride.p.veh;
      M.runSub(new MGRunner3D(M, { corredor: C.runner, veh, metaM: 420, dur: 40 }), () => finalizar());
    } else {
      finalizar();
    }
  },

  limpiar(M) {
    if (M && M.tramaAct) {
      if (M.tramaAct.m && M.ride) M.ride.removeMarker(M.tramaAct.m);
      M.tramaAct = null;
    }
  },

  /* Descubre un fragmento cruzado de El Metro al pasar cerca en modo libre */
  recogerFrag(M, f) {
    const E = this.estado();
    if (E.frags.includes(f.id)) return;
    E.frags.push(f.id);
    Save.data.stats.leaves = (Save.data.stats.leaves | 0) + 10;
    if (E.frags.length >= this.fragmentos().length) {
      Save.data.flags = Save.data.flags || {};
      Save.data.flags.rieles_ruedas = 1;
    }
    Logros.check(); Save.save();
    Snd.sfx('star');
    M.ride.stamp = { t: 3, title: '🚇 RECUERDO DEL METRO', sub: f.name + ' · +10 🍃', bg: '#bfe3f7' };
    if (JE.ui) JE.ui.toast('🚇 ' + f.name + ' (' + f.quien + '): ' + f.texto);
  },

  /* Personaje cercano al jugador (< 36 m) */
  cerca(M) {
    if (!M || !M.ride) return null;
    const P = M.ride.p;
    let best = null, bd = 36 * WK;
    for (const p of this.personajes()) {
      const d = dist(P.x, P.y, p.x, p.y);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  },

  hablar(M, p) {
    p = p || this.cerca(M);
    if (!p) return;
    const E = this.estado();
    if (!E.charlas.includes(p.id)) {
      E.charlas.push(p.id);
      Save.data.stats.leaves = (Save.data.stats.leaves | 0) + 3;
      if (E.charlas.length >= 8) { Save.data.flags = Save.data.flags || {}; Save.data.flags.vecinos_valle = 1; }
      Logros.check(); Save.save();
    }
    Snd.sfx('ok');
    if (JE.ui) JE.ui.toast('💬 ' + p.name + ' (' + p.rol + '): «' + p.saludo + '»');
  }
};

/* Ventana de la trama «Ruedas y Rieles del Aburrá»: capítulos, personajes de ambos juegos y fragmentos de El Metro */
UI.tramaValle = function (M) {
  const E = Trama.estado(), G = Trama.guion(), caps = G.capitulos || [], frags = Trama.fragmentos(), pers = Trama.personajes();
  const act = M && M.tramaAct && M.tramaAct.cap;
  this.modal(`<h2>📖 ${G.titulo || 'Ruedas y Rieles del Aburrá'}</h2>
    <p class="m" style="margin:4px 0 10px">${G.subtitulo || ''} · Capítulos: <strong>${E.done.length}/${caps.length}</strong> · Recuerdos del Metro: <strong>${E.frags.length}/${frags.length}</strong> · Vecinos saludados: <strong>${E.charlas.length}/${pers.length}</strong></p>
    <div class="col" style="gap:8px;max-height:46vh;overflow-y:auto;padding-right:4px">
      ${caps.map(c => {
        const ok = E.done.includes(c.id), on = act && act.id === c.id;
        return `<div class="card" style="padding:10px 12px;border-left:4px solid ${ok ? PAL.vd : on ? '#ff2fb3' : PAL.cie}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span><strong>${ok ? '✓ ' : 'Cap. ' + c.n + ' · '}${c.titulo}</strong><br><small class="m">${c.quien} · ${c.origen} → ${c.destino}</small></span>
            ${M && M.free ? `<button class="btn sm ${on ? 'pri' : ''}" data-cap="${c.id}">${on ? '◎ En curso' : ok ? '↻ Repetir' : '▶ Rodar'}</button>` : ''}
          </div>
          <p class="m" style="font-size:12.5px;margin:6px 0 0">${ok ? c.cierre : c.intro}</p>
        </div>`;
      }).join('')}
      <p class="pag" style="margin-top:8px">🚇 Fragmentos cruzados con El Metro</p>
      ${frags.map(f => {
        const ok = E.frags.includes(f.id);
        return `<div class="opt" style="padding:8px 10px"><span><strong>${ok ? '🚇 ' + f.name : '🔒 Recuerdo en ' + f.lugar}</strong><br><small class="m">${ok ? f.texto : 'Pasa pedaleando cerca de ' + f.lugar + ' (' + f.quien + ') para descubrirlo.'}</small></span></div>`;
      }).join('')}
    </div>
    <div class="col" style="margin-top:10px"><button class="btn pri" id="mClose">▶ Volver al valle</button></div>`, () => {
    $$('[data-cap]').forEach(b => b.onclick = () => {
      Trama.iniciarCap(M, b.dataset.cap);
      this.closeModal();
      if (Game.paused) Game.resume();
    });
    const cl = $('#mClose'); if (cl) cl.onclick = () => { this.closeModal(); if (Game.paused) Game.resume(); };
  });
};

/* Dibujo de los 15 personajes compartidos y los 4 fragmentos del Metro en el mapa y HUD del Modo Libre */
const _tick93 = ModeUsuarioR.prototype.tick;
ModeUsuarioR.prototype.tick = function (dt) {
  _tick93.call(this, dt);
  if (!this.free || !this.ride) return;
  const P = this.ride.p, E = Trama.estado();
  for (const f of Trama.fragmentos()) {
    if (!E.frags.includes(f.id) && dist(P.x, P.y, f.x, f.y) < 26 * WK) Trama.recogerFrag(this, f);
  }
  const nearP = Trama.cerca(this);
  if (nearP && this._lastNearP !== nearP.id) {
    this._lastNearP = nearP.id;
    Trama.hablar(this, nearP);
  } else if (!nearP) {
    this._lastNearP = null;
  }
};

const _hudLife93 = Ride.prototype.hudLife;
Ride.prototype.hudLife = function (V, sx, sy, W) {
  _hudLife93.call(this, V, sx, sy, W);
  if (!this.mode || !this.mode.free) return;
  const c = V.ctx, P = this.p, E = Trama.estado();
  /* Marcadores de fragmentos de El Metro cercanos */
  for (const f of Trama.fragmentos()) {
    if (E.frags.includes(f.id)) continue;
    const d = dist(P.x, P.y, f.x, f.y); if (d > 260 * WK) continue;
    const q = W(f.x, f.y); if (q.x < -30 || q.x > V.w + 30 || q.y < 40 || q.y > V.h - 40) continue;
    c.save(); c.fillStyle = '#1c5c9c'; c.strokeStyle = '#fff'; c.lineWidth = 2;
    c.beginPath(); c.arc(q.x, q.y, 8, 0, TAU); c.fill(); c.stroke();
    V.text('🚇', q.x, q.y + 4, { size: 11, align: 'center' });
    c.restore();
  }
  /* Personajes compartidos de EnCicla y El Metro con etiqueta y bocadillo de saludo al acercarse */
  for (const p of Trama.personajes()) {
    const d = dist(P.x, P.y, p.x, p.y); if (d > 220 * WK) continue;
    const q = W(p.x, p.y); if (q.x < -50 || q.x > V.w + 50 || q.y < 45 || q.y > V.h - 45) continue;
    c.save();
    c.fillStyle = p.shirt || PAL.vd; c.strokeStyle = '#0a2342'; c.lineWidth = 2;
    c.beginPath(); c.arc(q.x, q.y - 4, 6, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = SKINS[p.skin | 0] || '#f0c090';
    c.beginPath(); c.arc(q.x, q.y - 11, 4.2, 0, TAU); c.fill(); c.stroke();
    c.restore();
    const tag = (p.juego === 'El Metro' ? '🚇 ' : '🚲 ') + p.name;
    V.text(tag, q.x, q.y - 20, { size: 11, align: 'center', color: '#fff', bg: p.juego === 'El Metro' ? '#1c5c9cdd' : '#0a2342dd', pad: 2 });
    if (d < 55 * WK) {
      const short = p.saludo.length > 54 ? p.saludo.slice(0, 52) + '…' : p.saludo;
      V.text('«' + short + '»', q.x, q.y - 36, { size: 11, align: 'center', color: '#0a2342', bg: '#fff8dc', pad: 3, border: '#0a2342', body: true });
    }
  }
};

const _act93 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act93.call(this);
  if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
  a.push({ id: 'trama', icon: 'estrella', label: this.tramaAct ? '📖 Cap. ' + this.tramaAct.cap.n : '📖 Trama', fn: () => UI.tramaValle(this) });
  return a;
};

LOGROS.push(
  { id: 'trama_valle', name: 'Cronista del Aburrá', desc: 'Completa los 6 capítulos de la trama abierta «Ruedas y Rieles del Aburrá»', icon: 'estrella', test: S => !!(S.flags && S.flags.trama_valle) },
  { id: 'rieles_ruedas', name: 'Ruedas y Rieles', desc: 'Descubre los 4 fragmentos ferroviarios cruzados con El Metro en el modo libre', icon: 'metro', test: S => !!(S.flags && S.flags.rieles_ruedas) },
  { id: 'vecinos_valle', name: 'Amigo del valle', desc: 'Conversa con 8 personajes de EnCicla y El Metro por las calles del valle', icon: 'anfitrion', test: S => !!(S.flags && S.flags.vecinos_valle) }
);
