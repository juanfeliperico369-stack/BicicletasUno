/* =====================================================================
   VEHÍCULOS DE PERFIL (piel del motor) · para la panorámica, las plataformas, la 3D oblicua y las postales
   (g, V, x, y, esc, dir, cuerpo): y es el suelo; esc, px por metro; dir 1 mira a la derecha.
   Cada juego pone los suyos con MC.arte.registrar(juego, { vehiculoLado(g, V, …) }).
   ===================================================================== */
MC.arte.pieles.motor.vehiculoLado = function (g, V, x, y, esc, dir = 1, C) {
  const k = esc, f = C ? C.fase : 0, col = V.color || '#7ab800', X = u => x + u * k * dir, Y = v => y - v * k;
  const rueda = (u, r, rayos = 4) => { g.fillStyle = '#1b1f27'; g.beginPath(); g.arc(X(u), Y(r), r * k, 0, TAU); g.fill(); g.fillStyle = '#9aa3ad'; g.beginPath(); g.arc(X(u), Y(r), r * k * .55, 0, TAU); g.fill(); g.strokeStyle = '#1b1f27'; g.lineWidth = Math.max(1, k * .04); for (let i = 0; i < rayos; i++) { const a = f * 2 * dir + i * Math.PI / rayos; g.beginPath(); g.moveTo(X(u) - Math.cos(a) * r * k * .5, Y(r) - Math.sin(a) * r * k * .5); g.lineTo(X(u) + Math.cos(a) * r * k * .5, Y(r) + Math.sin(a) * r * k * .5); g.stroke(); } };
  const tubo = (u1, v1, u2, v2, c, w = .06) => { g.strokeStyle = c; g.lineWidth = Math.max(1, w * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(X(u1), Y(v1)); g.lineTo(X(u2), Y(v2)); g.stroke(); };
  const caja = (u, v, w, h, c) => { g.fillStyle = c; g.fillRect(Math.min(X(u), X(u + w)), Y(v + h), Math.abs(w * k), h * k); };
  const base = V.de && !['bici', 'patinete', 'skate', 'patines', 'carro', 'camion', 'metro', 'buseta', 'avioneta', 'lancha'].includes(V.id) ? V.de : V.id;
  switch (V.clase === 'auto' ? 'carro' : V.clase === 'pesado' ? 'camion' : V.clase === 'riel' ? 'metro' : V.clase === 'aire' && V.id !== 'jetpack' ? 'avioneta' : V.clase === 'agua' ? (V.cuerpo === 'tabla' ? 'surf' : 'lancha') : base) {
    case 'bici': case 'bici_propia': case 'ebike': case 'bmx': case 'mtb': case 'ruta': case 'triciclo': {
      const r = V.id === 'bmx' ? .26 : .34; rueda(-.52, r, 6); rueda(.55, r, 6); if (V.id === 'triciclo') { caja(.35, .35, .7, .45, '#ffb300'); }
      tubo(-.52, r, -.05, r, col, .08); tubo(-.05, r, .32, .82, col, .08); tubo(-.52, r, -.12, .82, col, .08); tubo(-.12, .82, .32, .82, col, .07); tubo(.55, r, .36, 1.0, '#2b2f38', .06); tubo(.3, 1.0, .46, 1.02, '#2b2f38', .07); tubo(-.12, .82, -.16, .95, '#2b2f38', .06); tubo(-.25, .96, -.04, .96, '#1d1f24', .1);
      if (V.id === 'bici') { caja(.48, .7, .32, .22, '#7ab800'); }   // la canasta verde de EnCicla
      if (V.electrico) caja(-.36, .5, .32, .14, '#1d1f24');
      break;
    }
    case 'patinete': case 'scooter': case 'monopatin': { rueda(-.42, .1, 2); rueda(.42, .1, 2); caja(-.48, .1, .96, .07, col); tubo(.42, .14, .36, 1.0, '#2b2f38', .06); tubo(.26, 1.0, .46, 1.0, '#2b2f38', .07); break; }
    case 'monociclo': { rueda(0, .22, 3); caja(-.18, .3, .36, .06, col); break; }
    case 'skate': case 'longboard': { const L = V.largo / 2; rueda(-L * .7, .05, 1); rueda(L * .7, .05, 1); g.fillStyle = col; g.beginPath(); g.moveTo(X(-L), Y(.16)); g.lineTo(X(-L * .85), Y(.1)); g.lineTo(X(L * .85), Y(.1)); g.lineTo(X(L), Y(.16)); g.lineTo(X(L * .85), Y(.13)); g.lineTo(X(-L * .85), Y(.13)); g.fill(); break; }
    case 'patines': case 'quad': { for (const u of [-.12, .12]) { caja(u - .12, .02, .24, .1, col); for (const w of [-.08, 0, .08]) rueda(u + w, .03, 1); } break; }
    case 'jetpack': { caja(-.35, 1.0, .22, .45, '#ff7043'); if (C && C.z > .2) { g.fillStyle = 'rgba(255,170,60,.85)'; g.beginPath(); g.moveTo(X(-.3), Y(1.0)); g.lineTo(X(-.24 - Math.random() * .08), Y(.45)); g.lineTo(X(-.18), Y(1.0)); g.fill(); } break; }
    case 'moto': { rueda(-.65, .3, 5); rueda(.68, .3, 5); g.fillStyle = col; g.beginPath(); g.moveTo(X(-.6), Y(.55)); g.lineTo(X(.2), Y(.75)); g.lineTo(X(.6), Y(.6)); g.lineTo(X(.3), Y(.4)); g.lineTo(X(-.5), Y(.4)); g.fill(); tubo(.68, .3, .5, .95, '#2b2f38', .07); caja(-.6, .62, .5, .12, '#1d1f24'); break; }
    case 'carro': {
      const L = V.largo, Hc = 1.45; rueda(-L * .32, .32, 5); rueda(L * .32, .32, 5);
      g.fillStyle = col; g.beginPath(); g.moveTo(X(-L / 2), Y(.3)); g.lineTo(X(-L / 2), Y(.85)); g.lineTo(X(-L * .3), Y(.9)); g.lineTo(X(-L * .18), Y(Hc)); g.lineTo(X(L * .2), Y(Hc)); g.lineTo(X(L * .36), Y(.92)); g.lineTo(X(L / 2), Y(.8)); g.lineTo(X(L / 2), Y(.3)); g.fill();
      g.fillStyle = 'rgba(140,190,220,.9)'; g.beginPath(); g.moveTo(X(-L * .15), Y(Hc - .07)); g.lineTo(X(L * .17), Y(Hc - .07)); g.lineTo(X(L * .3), Y(.95)); g.lineTo(X(-L * .26), Y(.95)); g.fill();
      if (V.id === 'formula') { caja(-L / 2, .9, .3, .35, '#1d1f24'); } if (V.id === 'taxi') caja(-.3, Hc, .6, .15, '#1d1f24');
      break;
    }
    case 'camion': case 'buseta': case 'metroplus': { const L = V.largo; rueda(-L * .32, .45, 5); rueda(L * .33, .45, 5); caja(-L / 2, .45, L, 2.6, col); g.fillStyle = 'rgba(40,60,80,.85)'; for (let i = 0; i < Math.floor(L / 1.6); i++) caja(-L / 2 + .3 + i * 1.6, 1.8, 1, .8, 'rgba(40,60,80,.85)'); break; }
    case 'metro': case 'tranvia': { const n = V.id === 'tranvia' ? 2 : 3, Lc = Math.min(22, V.largo / n); for (let i = 0; i < n; i++) { const u = -i * (Lc + .6) - Lc / 2; caja(u - Lc / 2, .5, Lc, 3.1, '#e6e9ee'); caja(u - Lc / 2, 1.2, Lc, .35, V.color); for (let w = 0; w < 5; w++) caja(u - Lc / 2 + .8 + w * Lc / 5.4, 2.1, Lc / 8, .9, 'rgba(40,55,75,.85)'); rueda(u - Lc * .35, .35, 4); rueda(u + Lc * .35, .35, 4); } break; }
    case 'avioneta': case 'avion': { const L = V.largo; g.fillStyle = col; g.beginPath(); g.ellipse(X(0), Y(1.2), L / 2 * k, .55 * k, 0, 0, TAU); g.fill(); caja(-.6, 1.1, 1.6, .18, tono(col, -.15)); g.beginPath(); g.moveTo(X(-L / 2), Y(1.2)); g.lineTo(X(-L / 2 - .2), Y(2.4)); g.lineTo(X(-L / 2 + .8), Y(1.3)); g.fill(); g.fillStyle = 'rgba(140,190,220,.9)'; g.fillRect(Math.min(X(L * .15), X(L * .3)), Y(1.6), Math.abs(L * .15 * k), .3 * k); if (!C || C.z < .3) { rueda(-.4, .2, 2); rueda(L * .3, .2, 2); } break; }
    case 'lancha': { const L = V.largo; g.fillStyle = col; g.beginPath(); g.moveTo(X(-L / 2), Y(.9)); g.lineTo(X(L / 2), Y(.9)); g.lineTo(X(L / 2 - .6), Y(.1)); g.lineTo(X(-L / 2), Y(.2)); g.fill(); caja(-L * .1, .9, L * .25, .5, 'rgba(140,190,220,.9)'); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(Math.min(X(-L / 2 - 1.5), X(-L / 2)), Y(.15), 1.5 * k, .12 * k); break; }
    case 'surf': { caja(-1.1, .02, 2.2, .1, col); break; }
    default: break;
  }
};
