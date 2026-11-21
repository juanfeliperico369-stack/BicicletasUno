/* =====================================================================
   MOTOR CITY 3.1 · Persecución optativa sin violencia gráfica (C-M26).
   Conductores sobre calles reales, rutas A* y cuerpos físicos compartidos
   con el resto del motor. Sin nuevos assets, dependencias ni azar global.
   ===================================================================== */
class Persecucion {
  constructor(mundo, op = {}) {
    this.mundo = mundo;
    this.nivel = clamp(op.nivel || 1, 1, 5);
    this.duracion = op.duracion || 90;
    this.estado = 'inactiva'; this.rivales = []; this.t = 0;
    this.puntos = 0; this.turbo = 0; this.evento = null;
    this.rozados = new Set(); this.alcance = 0; this.motivo = '';
  }
  iniciar(jugador) {
    if (!jugador || !Number.isFinite(jugador.x) || !Number.isFinite(jugador.y)) return false;
    if (this.estado === 'activa') return false;
    const M = this.mundo, n = Math.min(4, 2 + Math.floor(this.nivel / 2));
    const ca = Math.cos(jugador.a || 0), sa = Math.sin(jugador.a || 0), rivales = [];
    for (let i = 0; i < n; i++) {
      /* Nacen fuera del radio inmediato, por detrás o a un costado.
         Nunca teletransportarlos delante de la cámara a mitad de partida. */
      const atras = 38 + i * 23, lado = i % 2 ? 17 : -17;
      const x = jugador.x - ca * atras - sa * lado, y = jugador.y - sa * atras + ca * lado;
      const q = M.viaCercana(x, y, 110);
      if (!q || Math.hypot(q.x - jugador.x, q.y - jugador.y) < 20) continue;
      const c = new MC.Cuerpo(M, { x: q.x, y: q.y, a: q.ang, veh: 'carro' });
      rivales.push({ id: 'patrulla-' + i, cuerpo: c, ruta: null, tiempoRuta: 0,
        tactica: i % 2 === 0 ? 'seguir' : 'cerrar', contacto: 0 });
    }
    if (!rivales.length) return false;
    this.rivales = rivales; this.estado = 'activa'; this.motivo = '';
    this.t = 0; this.puntos = 0; this.turbo = 0; this.alcance = 0;
    this.evento = '🚨 ¡Te persiguen! Mantén distancia durante ' + this.duracion + ' s';
    this.rozados.clear();
    return true;
  }
  parar(motivo = 'cancelada') {
    if (this.estado !== 'activa') return false;
    this.estado = 'inactiva'; this.motivo = motivo; this.rivales = [];
    this.turbo = 0;
    this.evento = motivo === 'escapaste' ? '🏁 ¡Escapaste! · ' + this.puntos + ' puntos' :
      motivo === 'alcanzado' ? '🚔 Te alcanzaron. Inténtalo de nuevo' : 'Persecución terminada';
    return true;
  }
  /* Un casi choque puntúa solo con velocidad y separación real, nunca con contacto.
     El identificador del tráfico impide farmear el mismo vehículo por cuadro. */
  casiChoques(jugador, trafico = []) {
    if (this.estado !== 'activa' || Math.abs(jugador.v || 0) < 7) return 0;
    const ancho = jugador.veh && jugador.veh.ancho || 1.8;
    let cuantos = 0;
    for (const o of trafico) {
      if (o.id == null || this.rozados.has(o.id) || !Number.isFinite(o.x) || !Number.isFinite(o.y)) continue;
      const distancia = Math.hypot(jugador.x - o.x, jugador.y - o.y);
      const contacto = (ancho + (o.ancho || 1.8)) / 2 + .25;
      if (distancia > contacto + .35 && distancia < contacto + 1.5) {
        this.rozados.add(o.id); cuantos++; this.puntos += 100; this.turbo = Math.max(this.turbo, 1.25);
      }
    }
    if (cuantos) {
      this.evento = '⚡ Casi choque +' + 100 * cuantos + ' · turbo';
      MC._pausaImpacto = Math.max(MC._pausaImpacto || 0, .03);
    }
    return cuantos;
  }
  actualizar(dt, jugador, trafico = []) {
    if (this.estado !== 'activa' || !Number.isFinite(dt) || dt <= 0) return;
    if (dt > .051) { const n = Math.min(4, Math.ceil(dt / .05)); let r; for (let i = 0; i < n; i++) r = this.actualizar(Math.min(.05, dt / n), jugador, trafico); return r; } /* 4.6: subpasos */
    this.t += dt; this.turbo = Math.max(0, this.turbo - dt);
    this.casiChoques(jugador, trafico);
    let mejor = Infinity;
    for (const p of this.rivales) {
      const C = p.cuerpo, dx = jugador.x - C.x, dy = jugador.y - C.y;
      const d = Math.hypot(dx, dy);
      mejor = Math.min(mejor, d);
      p.tiempoRuta -= dt;
      if (p.tiempoRuta <= 0) {
        /* El perseguidor que cierra calcula una intercepción corta por calles,
           no una línea recta a través de casas. Replanificar con presupuesto. */
        const adelante = p.tactica === 'cerrar' ? clamp(Math.abs(jugador.v || 0) * 1.1, 5, 25) : 0;
        const meta = { x: jugador.x + Math.cos(jugador.a || 0) * adelante,
          y: jugador.y + Math.sin(jugador.a || 0) * adelante };
        const propuesta = MC.Manejo.rutaA(this.mundo, C, meta, 'rueda');
        /* rutaA devuelve un único punto cuando la red está desconectada.
           Ese respaldo sirve para «tocar para ir», pero una patrulla no debe atravesar manzanas. */
        p.ruta = Array.isArray(propuesta) && propuesta.length >= 4 ? propuesta : null;
        p.tiempoRuta = 1.5 + (p.id.charCodeAt(p.id.length - 1) % 3) * .25;
      }
      if (!p.ruta) {
        C.actualizar(dt, { acel: -.4, giro: 0 });   // sin ruta, frenar y volver a calcular
        continue;
      }
      const m = MC.Manejo.seguirRuta(C, p.ruta, { radio: 4 });
      if (!m || !m.dir) {
        C.actualizar(dt, { acel: -.4, giro: 0 });
        continue;
      }
      const meta = [C.x + m.dir.x * 8, C.y + m.dir.y * 8];
      const fuerza = MC.IA.llegar([C.x, C.y], meta, 1, 4);
      C.actualizar(dt, { dir: { x: fuerza[0], y: fuerza[1], m: clamp(Math.hypot(...fuerza), .35, 1) } });
    }
    /* Hay que detenerse y dejarse alcanzar: rozar a otro carro no es captura. */
    this.alcance = mejor < 3.6 && Math.abs(jugador.v || 0) < 3 ? this.alcance + dt : 0;
    if (this.alcance > 2) this.parar('alcanzado');
    else if (this.t >= this.duracion) this.parar('escapaste');
  }
  vehiculos() {
    if (this.estado !== 'activa') return [];
    return this.rivales.map(p => { const c = p.cuerpo; return {
      id: p.id, tipo: 'carro', clase: 'auto', x: c.x, y: c.y, a: c.a,
      v: c.v, largo: 4.4, ancho: 1.8, color: '#376878', frena: 0
    }; });
  }
}
MC.Persecucion = Persecucion;
