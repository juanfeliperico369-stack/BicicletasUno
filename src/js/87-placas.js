/* =====================================================================
   PLACAS DE LO POCO CONOCIDO (idea de la auditoría de El Metro): datos curiosos del valle, cada uno en su
   lugar real. En el modo libre de Usuario, al pasar cerca aparece la placa y queda en el álbum.
   Los datos vienen de fuentes públicas (ver docs/MEDELLIN-DESDE-EL-AIRE.md y docs/BITACORA.md, v1.6.0).
   ===================================================================== */
const PLACAS = [
  ['laplaya', 'La quebrada escondida', 6.24853, -75.56197, 'Bajo la avenida La Playa corre, cubierta, la quebrada Santa Elena: en el mapa se ve como una línea tenue sobre la calzada.'],
  ['nomen', 'Calles al norte, carreras al occidente', 6.24440, -75.56960, 'En Medellín las calles crecen de número hacia el norte y las carreras hacia el occidente: con eso se encuentra cualquier dirección.'],
  ['ferrobello', 'Los talleres del Ferrocarril', 6.33337, -75.55234, 'En Bello, junto al patio-taller del Metro, quedan los talleres del antiguo Ferrocarril de Antioquia.'],
  ['estacionfc', 'La estación que esperaba trenes', 6.24472, -75.57203, 'Frente a La Alpujarra sigue en pie el edificio de la antigua Estación Medellín del Ferrocarril de Antioquia.'],
  ['coltejer', 'Una aguja de 175 metros', 6.25015, -75.56606, 'El Coltejer (1972) mide 175 m y fue el primer rascacielos de Medellín; su punta recuerda una aguja de tejer: Coltejer era una empresa textil.'],
  ['catedral', 'Un millón de ladrillos', 6.25405, -75.56392, 'La Catedral Metropolitana se hizo con unos 1.120.000 ladrillos macizos y tardó unos 70 años en terminarse (1931); sus dos torres miden 51,8 m.'],
  ['palacio', 'Solo una cuarta parte', 6.25169, -75.56820, 'El Palacio de la Cultura, del belga Agustín Goovaerts, es ajedrezado en negro y verde grisáceo; se construyó poco más de la cuarta parte de lo proyectado.'],
  ['candelaria', 'La primera parroquia', 6.24996, -75.56738, 'La Candelaria, en el Parque Berrío, fue la primera parroquia de Medellín; sus dos torres terminan en cúpulas de teja.'],
  ['museo', 'Del Palacio Municipal al museo', 6.25239, -75.56909, 'El Museo de Antioquia ocupa el antiguo Palacio Municipal, art decó de 1937; abrió allí en el año 2000, frente a la Plaza Botero.'],
  ['teatro', 'Muros que suenan', 6.24297, -75.57749, 'Los grandes muros de ladrillo del Teatro Metropolitano (1987) están levemente inclinados: es por la acústica de la sala.'],
  ['epm', 'El edificio inteligente', 6.24528, -75.57786, 'El Edificio EPM (1993) tiene 14 pisos; desde la renovación de 2013 sus terrazas tienen techos verdes.'],
  ['bibepm', 'Vidrio sobre la plaza', 6.24641, -75.57313, 'La Biblioteca EPM (2005), de Felipe Uribe de Bedout, abre hacia la Plaza de Cisneros una gran fachada de vidrio inclinada.'],
  ['bibespana', 'Tres rocas en la montaña', 6.29473, -75.54413, 'Las tres «rocas» del Parque Biblioteca España (2007), de Giancarlo Mazzanti, están revestidas de pizarra oscura.'],
  ['metrocable', 'El cable que es metro', 6.29350, -75.54260, 'La línea K del Metrocable (2004) llevó el cable aéreo al transporte público de la ciudad, conectado con el metro.'],
  ['escaleras', 'Escaleras al aire libre', 6.25680, -75.62190, 'Las escaleras eléctricas de la Comuna 13 abrieron en 2011 y cambiaron la forma de subir la ladera.'],
  ['encicla', 'Así empezó EnCicla', 6.20017, -75.57858, 'EnCicla nació en 2011 como un piloto que conectaba universidades con el metro.']
];
const Placas = JE.placas = {
  pts: null,
  lista() { return this.pts || (this.pts = PLACAS.map(([id, t, la, lo, txt]) => { const g = geoP(la, lo); return { id, t, txt, x: g.x, y: g.y }; })); },
  vistas() { return Save.data.placas || (Save.data.placas = {}); },
  /* en el modo libre: al pasar a menos de 30 m aparece la placa */
  revisar(M) {
    if (!M.free || !M.ride || M.done) return; M._plT = (M._plT || 0) - 1; if (M._plT > 0) return; M._plT = 20;   // cada ~20 cuadros
    const P = M.ride.p, V = this.vistas(), r = 30 / M_PER_PX;
    for (const q of this.lista()) {
      if (V[q.id] || Math.abs(q.x - P.x) > r || Math.abs(q.y - P.y) > r || dist(q.x, q.y, P.x, P.y) > r) continue;
      V[q.id] = Cal.key(M.fecha || Cal.now()); const nw = Logros.check(); Save.save(); Snd.sfx('star');
      M.ride.stamp = { t: 3.2, title: 'PLACA ' + Object.keys(V).length + '/' + PLACAS.length, sub: q.t, bg: PAL.az };
      if (JE.ui) { JE.ui.toast('📜 ' + q.t + ': ' + q.txt); if (nw.length) JE.ui.toast('🏅 Logro: ' + nw.map(l => l.name).join(', ')); }
      break;
    }
  },
  /* el letrero en el mapa: poste y placa azul (las ya leídas, en gris) */
  dibujar(b, ox, oy, inV) {
    const V = this.vistas(), d3 = GFX() === '3d';
    for (const q of this.lista()) {
      if (!inV(q.x, q.y, 20)) continue; const x = q.x - ox, y = q.y - oy, leida = !!V[q.id];
      b.fillStyle = '#0a14262e'; b.beginPath(); b.ellipse(x + 2, y + 1, 4, 1.6, 0, 0, TAU); b.fill();
      b.fillStyle = '#59606c'; b.fillRect(x - .5, y - 8, 1, 8);
      b.fillStyle = leida ? '#8e98a6' : PAL.az; if (d3) { b.beginPath(); b.roundRect(x - 4.5, y - 13, 9, 6, 1.5); b.fill(); } else b.fillRect(x - 4, y - 13, 8, 6);
      b.fillStyle = '#ffffff'; b.fillRect(x - 2.5, y - 11, 5, .8); b.fillRect(x - 2.5, y - 9.4, 3.6, .8);
    }
  },
  html() {
    const V = this.vistas(), n = Object.keys(V).length;
    return `<div class="pag" style="margin-top:16px">Placas de lo poco conocido · ${n} de ${PLACAS.length}</div><p class="m">Pedalea en el modo libre cerca de los lugares del centro y del valle: cada placa cuenta algo que poca gente sabe.</p><div class="logros">` +
      PLACAS.map(([id, t, , , txt]) => { const ok = !!V[id]; return `<div class="logro ${ok ? 'ok' : ''}"><b>${ok ? '📜 ' + esc(t) : '📜 ???'}</b><small>${ok ? esc(txt) : 'Aún sin encontrar'}</small></div>`; }).join('') + '</div>';
  }
};
LOGROS.push(
  { id: 'placas5', name: 'Curioso del valle', desc: 'Encuentra 5 placas de lo poco conocido', icon: 'estrella', test: S => Object.keys(S.placas || {}).length >= 5 },
  { id: 'placastodas', name: 'Cronista de Medellín', desc: 'Encuentra todas las placas de lo poco conocido', icon: 'estrella', test: S => Object.keys(S.placas || {}).length >= PLACAS.length }
);
const _tick87 = ModeUsuarioR.prototype.tick;
ModeUsuarioR.prototype.tick = function (dt) { _tick87.call(this, dt); Placas.revisar(this); };
const _album87 = UI.renderAlbum;
UI.renderAlbum = function () { _album87.call(this); const el = $('#tab-album'); if (el) el.insertAdjacentHTML('beforeend', Placas.html()); };
