/* =====================================================================
   MOTOR CITY · 4.6 · el MAPA GRANDE, como el de EnCicla
   El autor: «el mapa ni se deja elegir en la brújula y cuando se abre el juego deja de funcionar; el de EnCicla acerca,
   aleja y no se ralentiza». Antes se repintaban TODAS las losas visibles en cada movimiento del dedo (Medellín, alejado,
   son más de mil): el juego se congelaba. Ahora, como en EnCicla (78-ciudad-viva.js · MapView):
   - una VISTA GENERAL del mundo entero (una imagen de ~1 200 px) que se arma de a poco (unos ms por cuadro) y se guarda
     en el mundo: la segunda vez abre al instante;
   - de cerca, las losas de detalle llegan con presupuesto (diferidas, unas pocas por cuadro) y, mientras, se ve la general;
   - el juego se pausa mientras el mapa está abierto (op.pausa) y se retoma al cerrarlo;
   - botones ✕ · + · − · ◎ (volver a mí) · 🧭 (norte arriba o rumbo arriba), arrastrar, pellizcar y la rueda;
   - tocar = poner el destino (se pega al lugar, la estación o el punto más cercano); tocarlo otra vez lo quita;
   - nombres según el acercamiento (municipios lejos, barrios y estaciones cerca) y la línea hasta el destino.
   - 4.8 · con op.alIr, poner un punto muestra «🚀 Ir» (el juego te lleva allá); con op.planeta, 🌍 y alejar más allá de la
     ciudad pasan al planeta: un solo mapa de la calle al mundo.
   Uso: ui.abrirMapa(vistas, M, puntos, yo, { pausa: v => …, alDestino: (p | null) => …, destino, ruta: () => [x,y,…], alIr: p => bool, planeta: () => … })
   `puntos` y `yo` pueden ser funciones (se leen en cada cuadro).
   ===================================================================== */
const RANGO_VIA = { [VIA.SENDERO]: .5, [VIA.PEATONAL]: .8, [VIA.ESCALAS]: .8, [VIA.CICLO]: 1.5, [VIA.CALLE]: 2, [VIA.CARRERA]: 3, [VIA.AVENIDA]: 4, [VIA.AUTOPISTA]: 5 };
const TRAZO_VIA = { [VIA.SENDERO]: ['rgba(214,200,170,.45)', .6], [VIA.PEATONAL]: ['rgba(226,218,200,.55)', .7], [VIA.ESCALAS]: ['rgba(226,218,200,.55)', .7], [VIA.CICLO]: ['#3fae5a', 1], [VIA.CALLE]: ['rgba(236,232,222,.8)', 1], [VIA.CARRERA]: ['#f4efe2', 1.4], [VIA.AVENIDA]: ['#f7e3a1', 2], [VIA.AUTOPISTA]: ['#f2c94c', 2.6] };
const MapaGrande = {
  /* la vista general: un píxel = M.ancho / W metros; se arma por filas y luego las vías, con presupuesto */
  general(M) {
    if (M._vistaGeneral) return M._vistaGeneral;
    const alta = GPU.perfil().nivel === 'alta', lado = alta ? 1600 : 1200, k = Math.min(lado / M.ancho, lado / M.alto), W = Math.max(8, Math.round(M.ancho * k)), H = Math.max(8, Math.round(M.alto * k));
    const cv = lienzo(W, H); if (!cv) return null; const g = cv.getContext('2d'); g.fillStyle = '#1d3b4f'; g.fillRect(0, 0, W, H);
    const V = { cv, g, k, W, H, fila: 0, fase: 'suelo', i: 0, listo: false, vias: null, img: g.createImageData(W, 8), ver: 0 };
    return (M._vistaGeneral = V);
  },
  /* trabaja unos milisegundos en la vista general; devuelve true si cambió algo */
  trabajar(M, ms = 6) {
    const V = MapaGrande.general(M); if (!V || V.listo) return false; const t0 = MC.ahora(), S = MC.arte.dato('suelo', PAL_SUELO), C = S.map(c => hex3(c || '#888'));
    while (MC.ahora() - t0 < ms) {
      if (V.fase === 'suelo') {
        const f0 = V.fila, n = Math.min(8, V.H - f0), D = V.img.data, px = 1 / V.k, Z = V.z || (V.z = new Float32Array(V.W).fill(NaN));   /* una cota por píxel: el relieve sale de la fila de arriba y del vecino */
        for (let j = 0; j < n; j++) { const wy = (f0 + j + .5) * px; let izq = NaN; for (let i = 0; i < V.W; i++) { const wx = (i + .5) * px, tt = M.suelo(wx, wy), c = C[tt] || C[0], h = M.cota(wx, wy), arriba = Z[i], dz = ((h - (izq === izq ? izq : h)) + (h - (arriba === arriba ? arriba : h))) / px; Z[i] = h; izq = h; const sh = clamp(1 - dz * .9, .7, 1.22), o = (j * V.W + i) * 4; D[o] = clamp(c[0] * sh * 255, 0, 255); D[o + 1] = clamp(c[1] * sh * 255, 0, 255); D[o + 2] = clamp(c[2] * sh * 255, 0, 255); D[o + 3] = 255; } }
        V.g.putImageData(V.img, 0, f0, 0, 0, V.W, n); V.fila += n; if (V.fila >= V.H) { V.fase = 'vias'; V.img = null; V.z = null; V.vias = M.vias().slice().sort((a, b) => (RANGO_VIA[a.k] || 1) - (RANGO_VIA[b.k] || 1)); }   // lo menor primero; las autopistas, encima
      } else if (V.fase === 'vias') {
        const g = V.g, L = V.vias, fin = Math.min(L.length, V.i + 1500); g.save(); g.scale(V.k, V.k); g.lineCap = g.lineJoin = 'round';
        for (; V.i < fin; V.i++) { const v = L[V.i], p = v.p, kk = v.k || 0; if (!p || p.length < 4) continue; const T = TRAZO_VIA[kk] || TRAZO_VIA[1]; g.strokeStyle = T[0]; g.lineWidth = T[1] / V.k; g.beginPath(); g.moveTo(p[0], p[1]); for (let q = 2; q < p.length; q += 2) g.lineTo(p[q], p[q + 1]); g.stroke(); }
        g.restore(); if (V.i >= L.length) V.fase = 'lineas';
      } else {
        const g = V.g; g.save(); g.scale(V.k, V.k); g.lineCap = g.lineJoin = 'round';
        try { for (const l of (M.transporte && M.transporte.lineas) || []) { const E = l.estaciones || []; if (E.length < 2) continue; g.strokeStyle = l.color || '#00a3e0'; g.lineWidth = 3 / V.k; g.beginPath(); g.moveTo(E[0][1], E[0][2]); for (const s of E) g.lineTo(s[1], s[2]); g.stroke(); } } catch (e) { /* mundo sin transporte */ }
        g.restore(); V.listo = true; V.vias = null; break;
      }
    }
    V.ver++; return true;
  },
  /* armar la vista general en los ratos libres mientras se juega (así el mapa abre al instante) */
  precalentar(M) { if (!M || (M._vistaGeneral && M._vistaGeneral.listo) || M._precal) return; M._precal = true; const pedir = typeof requestIdleCallback === 'function' ? f => requestIdleCallback(f, { timeout: 400 }) : f => setTimeout(f, 60);
    const paso = dl => { if (MapaGrande.trabajar(M, dl && dl.timeRemaining ? clamp(dl.timeRemaining() - 1, 1, 4) : 3) || !M._vistaGeneral.listo) { if (!M._vistaGeneral.listo) pedir(paso); else M._precal = false; } else M._precal = false; }; pedir(paso); },
  abrir(ui, capa, div, vistas, M, puntos = [], yo = null, op = {}) {
    if (ui._mapa) return ui._mapa;
    const o = div('mapaG'), c = document.createElement('canvas'), barra = document.createElement('div'), pie = document.createElement('small'), d = Math.min(2, devicePixelRatio || 1);
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Mapa'); barra.className = 'mapaB';
    const boton = (txt, et, al) => { const b = document.createElement('button'); b.textContent = txt; b.setAttribute('aria-label', et); b.title = et; b.addEventListener('pointerdown', e => e.stopPropagation()); b.onclick = e => { e.stopPropagation(); al(); }; barra.appendChild(b); return b; };
    o.append(c, barra, pie); capa.appendChild(o);
    const leerYo = () => (typeof yo === 'function' ? yo() : yo), leerPts = () => { const p = typeof puntos === 'function' ? puntos() : puntos; return Array.isArray(p) ? p : []; };
    const Y0 = leerYo(); let k = clamp(Math.min(innerWidth / M.ancho, innerHeight / M.alto) * 6, .004, 4), cx = Y0 ? Y0.x : M.ancho / 2, cy = Y0 ? Y0.y : M.alto / 2, giro = 0, rumboArriba = !!MapaGrande.rumboArriba, sucio = true, abierto = true, destino = op.destino || null;
    const Lc = vistas && vistas.losas, Ll = vistas && (vistas.losasLejos || vistas.losas), RES = [.0625, .125, .25, .5, 1, 2], kMin = Math.min(innerWidth / M.ancho, innerHeight / M.alto) * .8, kMax = 4;
    const zoom = (f, px, py) => { if (f < 1 && op.planeta && k <= kMin * 1.01) { if ((MapaGrande._tope = (MapaGrande._tope || 0) + 1) >= 3) { MapaGrande._tope = 0; cerrar(); op.planeta(); return; } } else MapaGrande._tope = 0;   /* 4.8: alejar más allá de la ciudad lleva al planeta */
      const k2 = clamp(k * f, kMin, kMax); if (px != null) { const [wx, wy] = aMundo(px, py); k = k2; const [wx2, wy2] = aMundo(px, py); cx += wx - wx2; cy += wy - wy2; } else k = k2; sucio = true; };
    const aMundo = (px, py) => { const W = innerWidth, H = innerHeight, dx = (px - W / 2) / k, dy = (py - H / 2) / k, cs = Math.cos(-giro), sn = Math.sin(-giro); return [cx + dx * cs - dy * sn, cy + dx * sn + dy * cs]; };
    const brujula = boton('🧭', 'Brújula: norte arriba o rumbo arriba', () => { rumboArriba = MapaGrande.rumboArriba = !rumboArriba; ui.aviso(rumboArriba ? '🧭 El mapa gira con tu rumbo' : '🧭 Norte arriba', 1400, 'brujula'); sucio = true; });
    boton('◎', 'Volver a mí', () => { const Y = leerYo(); if (Y) { cx = Y.x; cy = Y.y; } sucio = true; });
    boton('+', 'Acercar', () => zoom(1.6)); boton('−', 'Alejar', () => zoom(1 / 1.6));
    const cerrarB = boton('✕', 'Cerrar el mapa', () => cerrar()); cerrarB.className = 'x';
    if (op.planeta) boton('🌍', 'Ver el planeta', () => { cerrar(); op.planeta(); });
    const irB = boton('🚀 Ir', 'Ir al punto marcado', () => { if (destino && op.alIr && op.alIr(destino) !== false) cerrar(); }); irB.className = 'ir'; irB.hidden = !(destino && op.alIr);   /* 4.8 */
    const fijarDestino = p => { destino = p; irB.hidden = !(p && op.alIr); if (op.alDestino) op.alDestino(p); sucio = true; ui.aviso(p ? '📍 Destino: ' + (p.nombre || 'aquí') : '📍 Sin destino', 1600, 'destino'); };
    /* tocar: el lugar o la estación más cercana en 28 px; si no, el punto */
    const elegir = (px, py) => { const [wx, wy] = aMundo(px, py), r = 28 / k; if (destino && Math.hypot(destino.x - wx, destino.y - wy) < r) return fijarDestino(null); let mejor = null, bd = r;
      const mirar = (x, y, nombre, tipo) => { const dd = Math.hypot(x - wx, y - wy); if (dd < bd) { bd = dd; mejor = { x, y, nombre, tipo }; } };
      for (const p of leerPts()) mirar(p.x, p.y, p.texto || p.nombre || '', 'punto');
      try { for (const l of M.transporte.lineas || []) for (const s of l.estaciones || []) mirar(s[1], s[2], s[0], 'estacion'); for (const s of M.transporte.encicla || []) mirar(s.x, s.y, s.nombre, 'encicla'); } catch (e) { /* sin transporte */ }
      try { for (const L of M.lugares || []) mirar(L.x, L.y, L.nombre, 'lugar'); } catch (e) { /* sin lugares */ }
      if (!mejor) { const b = M.barrio ? (() => { try { return M.lugarTexto(wx, wy); } catch (e) { return ''; } })() : ''; mejor = { x: wx, y: wy, nombre: b, tipo: 'punto' }; }
      fijarDestino(mejor); };
    const dedos = new Map(); let base = null, tocado = null;
    c.addEventListener('pointerdown', e => { c.setPointerCapture(e.pointerId); dedos.set(e.pointerId, [e.clientX, e.clientY]); base = dedos.size === 2 ? [...dedos.values()] : null; tocado = dedos.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now(), mov: 0 } : null; });
    c.addEventListener('pointermove', e => { const a = dedos.get(e.pointerId); if (!a) return; if (dedos.size === 1) { const dx = (e.clientX - a[0]) / k, dy = (e.clientY - a[1]) / k, cs = Math.cos(-giro), sn = Math.sin(-giro); cx -= dx * cs - dy * sn; cy -= dx * sn + dy * cs; if (tocado) tocado.mov += Math.hypot(e.clientX - a[0], e.clientY - a[1]); } dedos.set(e.pointerId, [e.clientX, e.clientY]); if (dedos.size === 2 && base) { const v = [...dedos.values()], d0 = Math.hypot(base[0][0] - base[1][0], base[0][1] - base[1][1]), d1 = Math.hypot(v[0][0] - v[1][0], v[0][1] - v[1][1]); if (d0 > 10) zoom(d1 / d0, (v[0][0] + v[1][0]) / 2, (v[0][1] + v[1][1]) / 2); base = v; tocado = null; } cx = clamp(cx, 0, M.ancho); cy = clamp(cy, 0, M.alto); sucio = true; });
    const fin = e => { if (tocado && dedos.size === 1 && tocado.mov < 10 && performance.now() - tocado.t < 450) elegir(e.clientX, e.clientY); dedos.delete(e.pointerId); base = null; tocado = null; };
    c.addEventListener('pointerup', fin); c.addEventListener('pointercancel', e => { dedos.delete(e.pointerId); base = null; tocado = null; });
    c.addEventListener('wheel', e => { e.preventDefault(); zoom(Math.exp(-e.deltaY * .0015), e.clientX, e.clientY); }, { passive: false });
    const tecla = e => { if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') { e.preventDefault(); cerrar(); } else if (e.key === '+' || e.key === '=') zoom(1.6); else if (e.key === '-') zoom(1 / 1.6); }; document.addEventListener('keydown', tecla);
    /* pintar: la general siempre; el detalle encima solo si hay pocas losas a la vista (las que falten llegan con presupuesto) */
    let ultVer = -1, ultYo = '', faltan = 0, detalle = null;
    const pintar = () => {
      const W = Math.round(innerWidth * d), H = Math.round(innerHeight * d); if (c.width !== W || c.height !== H) { c.width = W; c.height = H; sucio = true; }
      const V = MapaGrande.general(M), Y = leerYo(), cY = Y ? Math.round(Y.x) + ',' + Math.round(Y.y) + ',' + ((Y.a || 0) * 20 | 0) : '';
      if (V && V.ver !== ultVer) { ultVer = V.ver; sucio = true; } if (cY !== ultYo) { ultYo = cY; sucio = true; }
      const gObj = rumboArriba && Y ? -(Y.a || 0) - Math.PI / 2 : 0; if (Math.abs(angDif(giro, gObj)) > .002) { giro += angDif(giro, gObj) * .25; sucio = true; } else giro = gObj;
      if (!sucio && !faltan) return; sucio = false;
      const g = c.getContext('2d'), z = k * d; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#10202c'; g.fillRect(0, 0, W, H);
      const cs = Math.cos(giro), sn = Math.sin(giro); g.setTransform(z * cs, z * sn, -z * sn, z * cs, W / 2 - (cx * cs - cy * sn) * z, H / 2 - (cx * sn + cy * cs) * z); g.imageSmoothingEnabled = true;
      if (V) g.drawImage(V.cv, 0, 0, V.W / V.k, V.H / V.k);
      /* el detalle: solo cuando la general ya se ve borrosa y caben pocas losas */
      faltan = 0; detalle = null; const hx = (Math.abs(cs) * W + Math.abs(sn) * H) / 2 / z, hy = (Math.abs(sn) * W + Math.abs(cs) * H) / 2 / z;   /* la caja que cubre la pantalla (girada o no) */
      if (V && z > V.k * 1.4) { const rango = Ls => { const s = Ls.L; return [Math.floor(Math.max(0, cx - hx) / s), Math.floor(Math.min(M.ancho - 1, cx + hx) / s), Math.floor(Math.max(0, cy - hy) / s), Math.floor(Math.min(M.alto - 1, cy + hy) / s)]; }, cuenta = r => (r[1] - r[0] + 1) * (r[3] - r[2] + 1);
        let Ls = null, r = null; if (Lc && z > .2) { r = rango(Lc); if (cuenta(r) <= Math.min(Lc.max - 10, 90)) Ls = Lc; } if (!Ls && Ll) { r = rango(Ll); if (cuenta(r) <= Math.min(Ll.max - 4, 30)) Ls = Ll; }
        if (Ls) { detalle = Ls; const s = Ls.L, res = RES.find(q => q >= z * .8) || 2; for (let gy = r[2]; gy <= r[3]; gy++) for (let gx = r[0]; gx <= r[1]; gx++) { const q = Ls.losa(gx, gy, res, true, 0); if (q) g.drawImage(q, gx * s, gy * s, s + .6 / z, s + .6 / z); else faltan++; } if (Ls.pend.length > 120) Ls.pend.splice(0, Ls.pend.length - 120); } }   /* lo que falta llega con presupuesto; mientras, se ve la general */
      /* la línea al destino: la ruta del juego si la da, si no una recta punteada */
      if (destino && Y) { const P = op.ruta ? op.ruta() : null; g.lineWidth = 4 / z; g.strokeStyle = '#ffc23a'; g.setLineDash(P ? [] : [10 / z, 8 / z]); g.beginPath(); if (P && P.length >= 4) { g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); } else { g.moveTo(Y.x, Y.y); g.lineTo(destino.x, destino.y); } g.stroke(); g.setLineDash([]); }
      /* de aquí en adelante, en píxeles de la pantalla */
      g.setTransform(1, 0, 0, 1, 0, 0); const P = (wx, wy) => { const dx = (wx - cx) * z, dy = (wy - cy) * z; return [W / 2 + dx * cs - dy * sn, H / 2 + dx * sn + dy * cs]; }, fuera = (x, y) => x < -40 || y < -40 || x > W + 40 || y > H + 40;
      g.textAlign = 'center'; g.lineJoin = 'round'; const ocup = [];
      /* 4.6: los nombres no se montan: cada uno reserva su caja y el que choque no se pinta (primero lo más importante) */
      const nombre = (x, y, t, col = '#fff', tam = 12) => { if (!t) return false; g.font = '700 ' + Math.round(tam * d) + 'px system-ui, sans-serif'; const w = g.measureText(t).width / 2 + 3 * d, h = tam * d * .62 + 2 * d, R0 = [x - w, y - h * 1.6, x + w, y + h * .5]; if (R0[0] < 2 || R0[2] > W - 2 || R0[1] < 2 || R0[3] > H - 2) return false; for (const q of ocup) if (R0[0] < q[2] && R0[2] > q[0] && R0[1] < q[3] && R0[3] > q[1]) return false; ocup.push(R0); g.lineWidth = 3.5 * d; g.strokeStyle = '#000c'; g.strokeText(t, x, y); g.fillStyle = col; g.fillText(t, x, y); return true; };
      const marca = (x, y, col, r) => { g.fillStyle = col; g.strokeStyle = '#000'; g.lineWidth = 2 * d; g.beginPath(); g.arc(x, y, r * d, 0, TAU); g.fill(); g.stroke(); };
      /* el destino y los puntos del juego primero; luego las estaciones (cerca) y los lugares, hasta donde quepan */
      let dP = null; if (destino) { dP = P(destino.x, destino.y); ocup.push([dP[0] - 12 * d, dP[1] - 28 * d, dP[0] + 12 * d, dP[1] + 2 * d]); if (destino.nombre) nombre(dP[0], dP[1] - 30 * d, destino.nombre, '#ffe9a8', 13); }
      const Pts = leerPts().map(p => [p, P(p.x, p.y)]).filter(q => !fuera(q[1][0], q[1][1])); for (const [p, [px, py]] of Pts) { marca(px, py, p.color || '#ffc23a', 7); if (p.texto) nombre(px, py - 12 * d, p.texto, '#fff', 12); }
      if (k > .06) try { const Es = []; for (const l of M.transporte.lineas || []) for (const s of l.estaciones || []) { const [x, y] = P(s[1], s[2]); if (!fuera(x, y)) { marca(x, y, l.color || '#00a3e0', 4.5); Es.push([x, y, s[0]]); } } if (k > .16) for (const [x, y, t] of Es) nombre(x, y - 9 * d, t, '#cfeeff', 11); } catch (e) { /* sin transporte */ }
      try { let n = 0; for (const L of M.lugares || []) { if (n >= 60) break; const [x, y] = P(L.x, L.y); if (fuera(x, y)) continue; if (nombre(x, y, L.nombre, '#fff', k > .2 ? 13 : 11.5)) n++; } } catch (e) { /* sin lugares */ }
      if (dP) { const [px, py] = dP; g.fillStyle = '#ffc23a'; g.strokeStyle = '#1a1a1a'; g.lineWidth = 2 * d; g.beginPath(); g.moveTo(px, py); g.arc(px, py - 16 * d, 9 * d, Math.PI * .8, Math.PI * .2); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(px, py - 16 * d, 3.5 * d, 0, TAU); g.fill(); }
      if (Y) { const [px, py] = P(Y.x, Y.y); g.save(); g.translate(px, py); g.rotate((Y.a || 0) + Math.PI / 2 + giro); g.fillStyle = '#2ee6a6'; g.strokeStyle = '#06261c'; g.lineWidth = 2 * d; g.beginPath(); g.moveTo(0, -12 * d); g.lineTo(9 * d, 10 * d); g.lineTo(0, 5 * d); g.lineTo(-9 * d, 10 * d); g.closePath(); g.fill(); g.stroke(); g.restore(); }
      /* la brújula marca el norte; el pie, lo que hay en el centro y la escala */
      brujula.style.transform = 'rotate(' + giro + 'rad)';
      const m = 110 / k, esc = m >= 1000 ? (m / 1000).toFixed(m > 9000 ? 0 : 1) + ' km' : Math.round(m) + ' m', lugar = (() => { try { return M.lugarTexto(cx, cy); } catch (e) { return ''; } })();
      pie.textContent = (V && !V.listo ? '⏳ Armando el mapa… · ' : '') + (lugar ? lugar + ' · ' : '') + '▬ ' + esc + (destino ? ' · 📍 ' + (Y ? (Math.hypot(destino.x - Y.x, destino.y - Y.y) / 1000).toFixed(1) + ' km' : '') : ' · toca para marcar destino');
    };
    let raf = 0; const ciclo = () => { if (!abierto) return; raf = requestAnimationFrame(ciclo); const V = MapaGrande.general(M); MapaGrande.trabajar(M, V && !V.listo ? 10 : 0); if (faltan && detalle) detalle.trabajar(8); pintar(); };
    const cerrar = () => { if (!abierto) return; abierto = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', tecla); o.remove(); ui._mapa = null; if (op.pausa) op.pausa(false); MC.emit('mapa', false); if (op.alCerrar) op.alCerrar(destino); };
    if (op.pausa) op.pausa(true); MC.emit('mapa', true); ciclo();
    return (ui._mapa = { o, pintar: () => { sucio = true; }, cerrar, destino: () => destino });
  }
};
MC.MapaGrande = MapaGrande;
