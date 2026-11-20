/* =====================================================================
   PIELES · un paquete de arte en sprites (de Gemini, ChatGPT o un artista) se vuelve una piel de MC.arte, con respaldo procedural en CADA gancho
   - El paquete trae atlas (imagen + mapa de cuadros, en metros reales), íconos SVG, hitos, paletas…: MC.Pieles.instalar(id, paquete, op).
   - Cada gancho dibuja su sprite y, si no está o todavía no cargó, dibuja el del motor. El arte nuevo nunca deja un hueco.
   - Tamaños proporcionados: árboles, rocas y personas se dibujan a la medida del mundo (la sombra calculada coincide con el dibujo).
   - Partes: se elige qué usa cada juego ('prop', 'naturaleza', 'fachada', 'personaje', 'vehiculo', 'animal', 'mueble'). Lo que no se elige sigue procedural.
   Uso: MC.Pieles.instalar('gemini', MC_ARTE.gemini, { partes: ['prop', 'naturaleza', 'personaje'], pixel: () => vistas.pixel });
        MC.arte.usar('gemini') · MC.arte.usar('motor') · MC.Pieles.icono('vista_cenital', 20) → <svg>
   El paquete de Gemini (G‑M0…G‑M15) vive en arte/gemini/ y se compila en el HTML del juego con "arte": ["gemini"] en su juego.json.
   ===================================================================== */
const Pieles = {
  paquetes: {},
  PARTES: ['prop', 'naturaleza', 'fachada', 'personaje', 'vehiculo', 'animal', 'mueble', 'arbol'],
  /* registra los atlas y la piel; devuelve una promesa que se cumple cuando las imágenes cargaron */
  instalar(id, pack, op = {}) {
    if (!pack || !pack.atlases) throw new Error('Pieles: el paquete ' + id + ' no trae atlas');
    const ids = Object.keys(pack.atlases), partes = new Set(op.partes || this.PARTES), px = () => !!(op.pixel && op.pixel()), M = () => MC.arte.pieles.motor;
    for (const aid of ids) { const a = pack.atlases[aid]; Sprites.atlas(aid, { imagen: a.imagen, cuadros: a.cuadros, anim: a.anim, metros: a.metros, magenta: a.magenta === true }); }
    const de = sufijo => ids.find(a => a.endsWith('_' + sufijo)) || null, AP = de('p'), AV = de('v'), AA = de('a'), AM = de('m'), AU = de('u'), AW = de('w');
    const tiene = ref => { const [aid, n] = ref.split('/'), A = Sprites.atlases.get(aid); return !!(A && A.listo && (A.cuadros[n] || A.anim[n])); };
    const S = (ref, g, x, y, pxm, o = {}) => tiene(ref) && Sprites.dibujar(g, ref, x, y, pxm, Object.assign({ pixel: px() }, o));
    /* de noche: una copia oscurecida del atlas, hecha una sola vez (los sprites no reciben la luz de la hora como lo procedural) */
    const nocturno = aid => { const A = Sprites.atlases.get(aid); if (!A || !A.listo || typeof document === 'undefined') return; try { const c = lienzo(A.img.width, A.img.height), g = c.getContext('2d'); g.drawImage(A.img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(12,22,52,.58)'; g.fillRect(0, 0, c.width, c.height); Sprites.atlas(aid + '_noche', { imagen: c, cuadros: A.cuadros, anim: A.anim, metros: A.metros, magenta: false }); } catch (e) { MC.falla('pieles', e); } };
    const N = (aid, D) => D && D.noche > .4 && Sprites.atlases.get(aid + '_noche') ? aid + '_noche' : aid;
    const sinTilde = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
    const ARBOLES = op.arboles || ['arbol_guayacan_amarillo', 'arbol_guayacan_rosado', 'arbol_ceiba', 'arbol_palma', 'arbol_mango'];
    const piel = {};
    if (partes.has('prop') && AU) piel.prop = (g, p, x, y, z, D) => {
      if (p.t === 'cebra' || (p.t === 'arbol' && op.arboles === false)) return false; const cen = D && D.modo === 'cenital', noche = D && D.noche > .3, v = p.v || 0;
      const U = N(AU, D); if (p.t === 'arbol') { const alto = 5 + v * 4, copa = 3.2 + v * 2.4; return S(U + '/' + ARBOLES[Math.floor(v * 5) % ARBOLES.length] + (cen ? '_cen' : ''), g, x, y, z, { metros: cen ? copa : alto * 1.12 }); }   // a la medida del árbol del motor
      if (p.t === 'poste') return S(AU + '/' + (cen ? 'poste_cen' : noche ? 'poste_noche' : 'poste_dia'), g, x, y, z);   // el poste encendido no se oscurece
      if (cen) return S(U + '/' + p.t + '_cen', g, x, y, z);   // sin vista de arriba: el del motor
      return S(U + '/' + p.t, g, x, y, z);
    };
    if (partes.has('naturaleza') && AU) piel.naturaleza = (g, p, x, y, z, D) => {
      const cen = D && D.modo === 'cenital', s = p.s || 1, U = N(AU, D);
      if (p.t === 'roca') return S(U + '/roca_' + (s < .6 ? 0 : s < 1.1 ? 1 : s < 1.8 ? 2 : s < 2.5 ? 3 : 4), g, x, y, z, { metros: Math.max(.3, s * (cen ? 1.1 : .9)) });
      if (cen) return false;   // palmas, frailejones y juncos de lado no sirven desde arriba
      if (p.t === 'palma') return S(U + '/' + (s > 1.1 ? 'palma_cera' : 'palma_coco'), g, x, y, z, { metros: s > 1.1 ? 10 + s * 3 : 6 + s * 2 });
      return S(U + '/' + p.t, g, x, y, z);
    };
    if (partes.has('fachada') && AW) piel.fachadaModulo = (g, tipo, x, y, w, h, lit, D) => {
      const zona = (D && D.zona) || op.zona || 'pueblo', n = AW + '/' + zona + '_' + tipo + '_v' + (Math.abs(Math.round(x * .37 + y * .61)) % 3) + '_' + (lit ? 'noche' : 'dia');
      if (!tiene(n)) return false; const [sx, sy, sw, sh] = Sprites.atlases.get(AW).cuadros[n.split('/')[1]], A = Sprites.atlases.get(AW), r = op.recorte || [.18, .12, .64, .62];   // solo el vano (ventana, puerta o vitrina), no el muro del módulo
      g.drawImage(A.img, sx + sw * r[0], sy + sh * r[1], sw * r[2], sh * r[3], x, y, w, h); return true;
    };
    if (partes.has('personaje') && AP) {
      piel.personajeLado = (g, J, A, x, y, esc, dir) => (op.respetarAspecto && A && A.propio) || !S(AP + '/persona_' + ((J && J.estado) || 'quieto'), g, x, y, esc, { fase: J && J.fase, espejo: dir < 0, metros: (A && A.alto) || 1.68 }) ? M().personajeLado(g, J, A, x, y, esc, dir) : true;
      piel.personajeArriba = (g, J, A, x, y, z, ang) => (op.respetarAspecto && A && A.propio) || !S(AP + '/persona_cen_' + ((J && J.estado) || 'quieto') + '_der', g, x, y, z, { rot: ang || 0 }) ? M().personajeArriba(g, J, A, x, y, z, ang) : true;   // un solo cuadro que gira con el cuerpo, no 4 saltos
    }
    if (partes.has('vehiculo') && AV) piel.vehiculoLado = (g, V, x, y, esc, dir, C) => S(AV + '/' + ((V && V.id) || 'bici') + '_lado', g, x, y, esc, { espejo: dir < 0 }) || (M().vehiculoLado ? M().vehiculoLado(g, V, x, y, esc, dir, C) : false);
    if (partes.has('animal') && AA) piel.animalLado = (g, a, x, y, esc, dir, t, v) => S(AA + '/' + ((a && a.id) || 'perro_criollo') + '_lado', g, x, y, esc, { espejo: dir < 0 }) || M().animalLado(g, a, x, y, esc, dir, t, v);
    /* árboles (2.6): arbol_<especie>_lado|arriba[_v1|_v2] en cualquier atlas del paquete; si no está, el árbol procedural de MC.Arboleda */
    const AT = partes.has('arbol') ? ids.find(a => Object.keys(pack.atlases[a].cuadros || {}).some(n => /^arbol_[a-z_]+_(lado|arriba)/.test(n))) : null;
    if (AT) piel.arbol = (g, t, vista, x, y, pxm) => { const b = AT + '/arbol_' + t.e + '_' + vista, ref = t.v && tiene(b + '_v' + t.v) ? b + '_v' + t.v : tiene(b) ? b : null; if (!ref) return false; const E = MC.Arboleda && MC.Arboleda.ESPECIES[t.e]; return Sprites.dibujar(g, ref, x, y, pxm, { metros: vista === 'lado' ? t.h : t.r * 2 * (E ? E.ancho : 1), espejo: t.espejo, pixel: px() }); };
    if (partes.has('mueble') && AM) piel.mueble = (g, m, estilo) => {
      const n = sinTilde(m.tipo) + '_' + (estilo || 'paisa'), A = Sprites.atlases.get(AM); if (!A || !A.listo || !A.cuadros[n]) return false;
      const [sx, sy, sw, sh] = A.cuadros[n]; g.drawImage(A.img, sx, sy, sw, sh, m.x, m.y, m.w, m.h); return true;
    };
    MC.arte.registrar(id, piel); this.paquetes[id] = { pack, ids, partes: [...partes] };
    const listo = new Promise(res => { const ver = () => ids.every(a => Sprites.atlases.get(a) && Sprites.atlases.get(a).listo) ? res(ids) : setTimeout(ver, 30); ver(); }).then(L => { if (AU && op.noche !== false) nocturno(AU); return L; });
    if (op.usar) listo.then(() => MC.arte.usar(id));
    return listo;
  },
  /* un ícono SVG del paquete (24 × 24, del color del texto) o '' si no está */
  icono(id, px = 20, paquete) {
    for (const k of paquete ? [paquete] : Object.keys(this.paquetes)) { const I = this.paquetes[k] && this.paquetes[k].pack.iconos, d = I && I[id]; if (d) return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (d.viewBox || '0 0 24 24') + '" width="' + px + '" height="' + px + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d.pathSvg + '</svg>'; }
    return '';
  },
  /* cuántos sprites pidió el juego que no estaban (para la auditoría de la IA de arte) */
  faltan() { return [...Sprites.faltan]; }
};
MC.Pieles = Pieles;
