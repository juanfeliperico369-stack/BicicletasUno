/* =====================================================================
   SOMBRAS Y LUZ · el sol de verdad sobre la ciudad (lo que hace que una ciudad «se vea viva»)
   - SOMBRA PROYECTADA: cada edificio (y cada emblemático) proyecta su sombra en el piso según el sol de esa hora y
     ese lugar (MC.Cielo): largas y rojizas al amanecer y al atardecer, cortas al mediodía (en Medellín casi bajo los
     pies), débiles con nubes, ninguna de noche. La sombra es el casco convexo de la base y de la base corrida
     h·cot(altura del sol) en la dirección contraria al sol. En la vista cenital la sombra no oscurece su propio techo.
   - OCLUSIÓN DE CONTACTO: una sombra corta y suave pegada a la base de todo (edificios, árboles, gente, carros):
     es lo que «sienta» las cosas en el piso (la usan Townscaper, Los Sims y Cities: Skylines).
   - LUZ DE NOCHE: los postes encienden charcos de luz cálida sobre el andén y la calle (MC.Mobiliario).
   Todo es barato: un solo trazo para todas las sombras, recortado por calidad y por zoom.
   ===================================================================== */
const Sombras = {
  /* vector de la sombra en el piso por metro de altura { dx, dy, L (largo por metro), fuerza, alt } o null */
  vector(cielo) {
    const s = cielo && cielo.sol; if (!s || s.alt <= .03) return null;
    const hl = Math.hypot(s.x, s.y) || 1e-6, L = Math.min(9, 1 / Math.tan(Math.max(.07, s.alt)));
    const fuerza = clamp(cielo.luzSol ?? .6, 0, 1) * clamp((s.alt - .03) / .14, 0, 1);
    return { dx: -s.x / hl * L, dy: -s.y / hl * L, L, fuerza, alt: s.alt, calida: clamp(1 - s.alt / .45, 0, 1) };
  },
  /* casco convexo (cadena monótona) de una lista de puntos [[x, y], …] */
  casco(pts) {
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (P.length < 3) return P; const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = []; for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    const up = []; for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  },
  /* polígono de la sombra (metros del mundo) de un prisma de base P (plano [x,y,…]) y altura h */
  poligono(P, h, v) { const pts = []; for (let i = 0; i + 1 < P.length; i += 2) { pts.push([P[i], P[i + 1]]); pts.push([P[i] + v.dx * h, P[i + 1] + v.dy * h]); } return Sombras.casco(pts); },
  _cv: null, _cache: new WeakMap(),
  /* capa de sombras de las vistas 2D. objs: [{ P, h }] · pr: mundo → pantalla · cenital: recorta los techos */
  dibujar2D(g, W, H, objs, pr, v, op = {}) {
    if (!v || !objs.length || v.fuerza < .03) return 0; const ES = MC.Estilo && MC.Estilo.p, a = (ES && ES.sombra ? ES.sombra[3] / .34 : 1) * (op.alfa ?? .34) * v.fuerza, col = ES && ES.sombra ? ES.sombra.slice(0, 3).join(',') : v.calida > .3 ? '38,22,40' : '22,30,52';   /* 2.7: el color de la sombra según el estilo */
    let dst = g; if (op.cenital) { if (!this._cv || this._cv.width !== W || this._cv.height !== H) this._cv = lienzo(W, H); if (!this._cv) return 0; dst = this._cv.getContext('2d'); dst.setTransform(1, 0, 0, 1, 0, 0); dst.clearRect(0, 0, W, H); }
    dst.save(); dst.fillStyle = op.cenital ? '#000' : 'rgba(' + col + ',' + a.toFixed(3) + ')'; dst.beginPath();
    const kv = Math.round(v.dx * 25) + ',' + Math.round(v.dy * 25);   // el sol se mueve despacio: la sombra de cada edificio se guarda mientras no cambie
    for (const o of objs) { let S; if (o.q) { const c = Sombras._cache.get(o.q); if (c && c.k === kv) S = c.S; else { S = Sombras.poligono(o.P, o.h, v); Sombras._cache.set(o.q, { k: kv, S }); } } else S = Sombras.poligono(o.P, o.h, v); if (S.length < 3) continue; const p0 = pr(S[0][0], S[0][1], 0); dst.moveTo(p0[0], p0[1]); for (let i = 1; i < S.length; i++) { const p = pr(S[i][0], S[i][1], 0); dst.lineTo(p[0], p[1]); } dst.closePath(); }
    dst.fill('nonzero');
    if (op.cenital) {   // el techo propio (y los más altos que la sombra no alcanza) no se oscurece
      dst.globalCompositeOperation = 'destination-out'; dst.beginPath();
      for (const o of objs) { const P = o.P, p0 = pr(P[0], P[1], 0); dst.moveTo(p0[0], p0[1]); for (let i = 2; i < P.length; i += 2) { const p = pr(P[i], P[i + 1], 0); dst.lineTo(p[0], p[1]); } dst.closePath(); }
      dst.fill(); dst.restore(); g.save(); g.globalAlpha = a; g.drawImage(this._cv, 0, 0); g.restore(); return objs.length;
    }
    dst.restore(); return objs.length;
  },
  /* oclusión de contacto: elipse suave bajo algo de radio r (m) en (x, y) */
  contacto(g, sx, sy, rx, ry, a = .28) { g.fillStyle = 'rgba(10,14,26,' + a + ')'; g.beginPath(); g.ellipse(sx, sy, Math.max(1, rx), Math.max(.6, ry), 0, 0, TAU); g.fill(); },
  /* luz de noche: charcos cálidos (se suman con «lighter») en puntos de pantalla [[x, y, radioPx], …] */
  luces(g, L, noche) {
    if (noche < .15 || !L.length) return; g.save(); g.globalCompositeOperation = 'lighter';
    for (const [x, y, r] of L) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,196,110,' + (.32 * noche).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    g.restore();
  }
};
MC.Sombras = Sombras;
