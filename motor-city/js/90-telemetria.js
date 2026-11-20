/* =====================================================================
   TELEMETRÍA · lo que hay que medir en un celular real (2.8; entrega maestra §13, §14 y R20)
   - Tiempos de cuadro en PERCENTILES (p50, p95, p99), no solo un promedio que esconde los tirones.
   - Tiempo de dibujo de la vista y FPS.
   - El estado físico del jugador para calibrar el peso: velocidad, aceleración, suelo y si está en el aire.
   - Sin datos personales: es solo para el reporte del autor y de las IAs.
   Uso: MC.Telemetria.registro(msDibujo, dtCuadro) en cada cuadro · MC.Telemetria.resumen() · MC.Telemetria.linea(E)
   ===================================================================== */
const Telemetria = {
  N: 360, cuadro: [], dibujo: [],
  registro(msDibujo, dt) {
    if (dt > 0 && dt < 1) { this.cuadro.push(dt * 1000); if (this.cuadro.length > this.N) this.cuadro.shift(); }
    if (msDibujo >= 0) { this.dibujo.push(msDibujo); if (this.dibujo.length > this.N) this.dibujo.shift(); }
  },
  percentil(L, p) { if (!L.length) return 0; const S = L.slice().sort((a, b) => a - b); return S[Math.min(S.length - 1, Math.floor(p * (S.length - 1) + .5))]; },
  resumen() {
    const c = this.cuadro, d = this.dibujo, r1 = v => Math.round(v * 10) / 10, p50 = this.percentil(c, .5);
    return { n: c.length, fps: p50 ? Math.round(1000 / p50) : 0, cuadro_p50: r1(p50), cuadro_p95: r1(this.percentil(c, .95)), cuadro_p99: r1(this.percentil(c, .99)), dibujo_p50: r1(this.percentil(d, .5)), dibujo_p95: r1(this.percentil(d, .95)), gpu: MC.GPU && MC.GPU.perfil ? (MC.GPU.perfil().nivel || '?') : '?' };
  },
  /* una línea corta para la pantalla: rendimiento + física del jugador */
  linea(E) {
    const R = this.resumen(), C = E && E.jugador && E.jugador.cuerpo; let f = '';
    if (C) { const s = MC.Vida && MC.Vida.suelo ? MC.Vida.suelo(E, C.x, C.y) : null; f = ' · ' + Math.round(Math.abs(C.v || 0) * 3.6) + ' km/h · a ' + (C._acel || 0).toFixed(1) + ' m/s²' + (C.enAire ? ' · en el aire' : '') + (s ? ' · ' + s : ''); }
    return '📈 ' + R.fps + ' fps · p95 ' + R.cuadro_p95 + ' ms · dibujo ' + R.dibujo_p95 + ' ms' + f;
  },
  limpiar() { this.cuadro.length = 0; this.dibujo.length = 0; }
};
MC.Telemetria = Telemetria;
