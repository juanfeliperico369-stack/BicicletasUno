/* =====================================================================
   TRANSPORTE CON HORARIO · metro, tranvía, Metroplús, alimentadores y Metrocables
   Determinista: la posición de cada tren sale solo de la fecha y la hora (segundos desde la medianoche),
   así que El Metro, Juega EnCicla y cualquier juego ven el mismo tren en el mismo lugar a la misma hora.
   Horario real: lunes a sábado 4:30 a. m. – 11 p. m.; domingos y festivos 5 a. m. – 10 p. m.
   ===================================================================== */
class Transporte {
  constructor(mundo, cfg) {
    this.mundo = mundo; this.cfg = (cfg && cfg.transporte) || {}; this.lineas = []; this._dia = null;
    const CL = this.cfg.clases || {};
    for (const l of mundo.transporte.lineas) {
      if (l.estado && !/operativa/i.test(l.estado)) continue; const C = CL[l.clase]; if (!C) continue;
      let eje = l.eje && l.eje.length >= 4 ? l.eje : null;
      if (l.clase === 'cable' || !eje) eje = l.estaciones.flatMap(s => [s[1], s[2]]);   // cables: en línea recta de estación a estación
      if (eje.length < 4) continue;
      const T = new Trazo(Float32Array.from(eje)), est = l.estaciones.map(s => ({ nombre: s[0], s: T.proyectar(s[1], s[2]).s })).sort((a, b) => a.s - b.s);
      const L = { id: l.id, nombre: l.nombre, clase: l.clase, color: l.color, T, est, C };
      if (l.clase !== 'cable') {   // perfil de tiempo de un viaje en cada sentido: marcha de crucero con arranque y frenado, y parada en cada estación
        L.perfil = {};
        for (const dir of [1, -1]) {
          const u = (dir > 0 ? est.map(e => e.s) : est.map(e => T.largo - e.s).reverse()), tiempos = [0], nombres = dir > 0 ? est.map(e => e.nombre) : est.map(e => e.nombre).reverse(); let t = 0;
          for (let i = 1; i < u.length; i++) { t += C.parada_s + (u[i] - u[i - 1]) / C.vel_ms + 12; tiempos.push(t); }
          L.perfil[dir] = { u, tiempos, nombres, viaje: t + C.parada_s };
        }
        L.viaje = Math.max(L.perfil[1].viaje, L.perfil[-1].viaje);
      }
      this.lineas.push(L);
    }
  }
  /* ventana de servicio y frecuencia (segundos) para el día y la hora */
  servicio(fecha) { const dom = Calendario.domingoOFestivo(fecha), V = this.cfg.servicio || { habil: [270, 1380], domingo: [300, 1320] }; return (dom ? V.domingo : V.habil).map(m => m * 60); }
  frecuencia(L, seg, fecha) { const C = L.C, m = seg / 60; if (Calendario.domingoOFestivo(fecha)) return C.frec_domingo_s; return (this.cfg.pico || []).some(([a, b]) => m >= a && m < b) ? C.frec_pico_s : C.frec_valle_s; }
  /* salidas del día desde cada punta (caché por día) */
  _salidas(L, fecha) {
    const k = fecha.toDateString(); if (this._dia !== k) { this._dia = k; this._sal = new Map(); }
    let S = this._sal.get(L.id); if (S) return S; const [a, b] = this.servicio(fecha); S = [];
    for (let t = a; t <= b - L.viaje * .5; t += this.frecuencia(L, t, fecha)) S.push(t);
    this._sal.set(L.id, S); return S;
  }
  /* dónde va un tren t segundos después de salir de su punta: { u (metros desde la punta), parado, i (estación) } */
  _pos(Pf, C, dt) {
    const T = Pf.tiempos, U = Pf.u; if (dt >= Pf.viaje) return null;
    let i = 0; while (i < T.length - 1 && T[i + 1] <= dt) i++;
    const q = dt - T[i]; if (q < C.parada_s || i === U.length - 1) return { u: U[i], parado: true, i };
    const dur = T[i + 1] - T[i] - C.parada_s, f = clamp((q - C.parada_s) / dur, 0, 1), g = f < .15 ? (f * f) / (.15 * 2 * .85) : f > .85 ? 1 - ((1 - f) * (1 - f)) / (.15 * 2 * .85) : (f - .075) / .85;
    return { u: lerp(U[i], U[i + 1], clamp(g, 0, 1)), parado: false, i };
  }
  /* todos los vehículos en servicio ahora (o solo los que caen en la caja [x0,y0,x1,y1]) */
  vehiculos(fecha, seg, caja) {
    const out = [], [a, b] = this.servicio(fecha);
    for (const L of this.lineas) {
      if (caja && (L.T.p.length && !this._toca(L, caja))) continue;
      if (L.clase === 'cable') { if (seg < a || seg > b + 1800) continue; this._cabinas(L, seg, out, caja); continue; }
      const S = this._salidas(L, fecha);
      for (const dir of [1, -1]) for (let k = S.length - 1; k >= 0; k--) {
        const Pf = L.perfil[dir], dep = S[k] + (dir < 0 ? L.C.parada_s * .5 : 0), dt = seg - dep; if (dt < 0) continue; if (dt >= L.viaje) break;
        const p = this._pos(Pf, L.C, dt); if (!p) continue; const s = dir > 0 ? p.u : L.T.largo - p.u, q = L.T.at(s), a2 = dir > 0 ? q.a : q.a + Math.PI;
        if (caja && (q.x < caja[0] || q.x > caja[2] || q.y < caja[1] || q.y > caja[3])) continue;
        const nv = this.mundo.nivel(q.x, q.y);
        out.push({ id: L.id + (dir > 0 ? '+' : '-') + k, linea: L.id, clase: L.clase, color: L.color, x: q.x, y: q.y, a: a2, z: L.clase === 'metro' && nv > 0 ? nv * NIVEL_M + 1 : 0, s, dir, largo: L.C.largo_m || 12, parado: p.parado, estacion: p.parado ? Pf.nombres[p.i] : null });
      }
    }
    return out;
  }
  _toca(L, c) { if (!L._caja) L._caja = caja([L.T.p]); const k = L._caja; return k[2] >= c[0] - 200 && k[0] <= c[2] + 200 && k[3] >= c[1] - 200 && k[1] <= c[3] + 200; }
  /* Metrocable: cabinas cada `cabina_cada_s` en los dos sentidos, a la altura del cable (baja en las estaciones) */
  _cabinas(L, seg, out, cj) {
    const C = L.C, paso = C.vel_ms * C.cabina_cada_s, len = L.T.largo, H = C.altura_m || 28;
    for (const dir of [1, -1]) {
      const fase = (seg * C.vel_ms + (dir < 0 ? paso / 2 : 0)) % paso;
      for (let s0 = fase; s0 < len; s0 += paso) {
        const s = dir > 0 ? s0 : len - s0, q = L.T.at(s, dir * 4); if (cj && (q.x < cj[0] || q.x > cj[2] || q.y < cj[1] || q.y > cj[3])) continue;
        let dEst = 1e9; for (const e of L.est) dEst = Math.min(dEst, Math.abs(e.s - s));
        const z = 6 + (H - 6) * suave(clamp(dEst / 120, 0, 1));
        out.push({ id: L.id + (dir > 0 ? '+' : '-') + Math.round(s0 / paso), linea: L.id, clase: 'cable', color: L.color, x: q.x, y: q.y, a: q.a + (dir < 0 ? Math.PI : 0), z, s, dir, largo: 3, parado: dEst < 6, estacion: null });
      }
    }
  }
  /* segundos para el próximo tren de la línea en la estación (sentido 1 = hacia la última estación) */
  proximo(lineaId, estacion, fecha, seg, dir = 1) {
    const L = this.lineas.find(l => l.id === lineaId); if (!L || !L.perfil) return null; const Pf = L.perfil[dir > 0 ? 1 : -1], i = Pf.nombres.indexOf(estacion); if (i < 0) return null;
    const S = this._salidas(L, fecha);
    for (const dep of S) { const lleg = dep + (dir < 0 ? L.C.parada_s * .5 : 0) + Pf.tiempos[i]; if (lleg >= seg) return lleg - seg; }
    return null;
  }
  enServicio(fecha, seg) { const [a, b] = this.servicio(fecha); return seg >= a && seg <= b; }
}
MC.Transporte = Transporte;
