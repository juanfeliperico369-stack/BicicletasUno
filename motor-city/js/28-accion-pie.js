/* MOTOR CITY · accion a pie (C-M32): máquina de estados pura, sin control de armas, reusable.
   Los guardias sólo perciben a través de una línea de visión; jamás conocen la posición actual
   después de perder contacto. El sistema de cobertura reutiliza los edificios del mundo. */
const AccionPie = {
  ver(guardia, jugador, mundo, op = {}) {
    if (!guardia || !jugador || guardia.fuera) return false;
    const dx = jugador.x - guardia.x, dy = jugador.y - guardia.y, d = Math.hypot(dx,dy);
    const rango = op.rango ?? guardia.vista ?? 24, cono = op.cono ?? guardia.cono ?? 1.05;
    if (d > rango || d < .001) return d < .001;
    const ang = Math.atan2(dy, dx), dif = Math.atan2(Math.sin(ang - guardia.a), Math.cos(ang - guardia.a));
    if (Math.abs(dif) > cono) return false;
    return !this.ocluido(mundo, guardia, jugador);
  },
  ocluido(mundo, desde, hasta) {
    if (!mundo || typeof mundo.edificioEn !== 'function') return false;
    const d = Math.hypot(hasta.x - desde.x, hasta.y - desde.y);
    /* Muestreo <=1 m: paredes de 1–2 m no pueden quedar entre dos rayos. */
    if (mundo.edificioEn(hasta.x, hasta.y, 0)) return true;
    const n = Math.max(2, Math.min(96, Math.ceil(d)));
    for (let i = 1; i < n; i++) {
      const t = i / n, x = desde.x + (hasta.x-desde.x)*t, y = desde.y + (hasta.y-desde.y)*t;
      if (mundo.edificioEn(x,y,0)) return true;
    }
    return false;
  },
  /* Persecución en alarma: sólo acercarse si el jugador sigue visible. La búsqueda de
     la última posición vista ya la hace paso(). Nunca leer la posición actual a ciegas. */
  perseguir(q, jugador, mundo, dt, op = {}) {
    if (!q || !jugador || q.fuera || q.distraido > 0 || !(dt > 0))
      return { visible: false, golpe: false, movio: false };
    const radio = op.radio ?? q.vista ?? 24, alcance = op.alcance ?? 1.1, rapidez = op.rapidez ?? 4.6;
    const visible = this.ver(q, jugador, mundo, { rango: radio });
    if (!visible) return { visible: false, golpe: false, movio: false };
    q.ultima = { x: jugador.x, y: jugador.y };
    q.busquedaT = 5; q.estado = 'alerta';
    const dx = jugador.x - q.x, dy = jugador.y - q.y, d = Math.hypot(dx, dy);
    if (d <= alcance) return { visible: true, golpe: true, movio: false };
    const paso = Math.min(d-alcance, rapidez*Math.min(dt,.05));
    const nx = q.x + dx/d*paso, ny = q.y + dy/d*paso;
    if (mundo && typeof mundo.edificioEn === 'function' &&
       (mundo.edificioEn(nx,ny,0) || mundo.edificioEn((nx+q.x)/2,(ny+q.y)/2,0)))
      return { visible: true, golpe: false, movio: false };
    q.x = nx; q.y = ny; q.a = Math.atan2(dy,dx);
    return { visible: true, golpe: false, movio: true };
  },
  paso(q, dt, op = {}) {
    if (!q || q.fuera || !(dt > 0)) return { ve: false, estado: 'fuera' };
    dt = Math.min(dt, .05);
    const J = op.jugador, M = op.mundo, cebo = op.cebo, t = (q.fase = (q.fase || 0) + dt);
    const ve = !op.distraido && this.ver(q,J,M), vistaAntes = !!q.ve;
    q.ve = ve;
    if (ve) { q.ultima = {x:J.x,y:J.y}; q.busquedaT = 5; q.alerta = 1; q.estado='alerta'; }
    else if (q.busquedaT > 0) { q.busquedaT = Math.max(0,q.busquedaT-dt); q.estado='busqueda'; }
    else if (cebo && (q.distraido > 0)) q.estado='distraccion';
    else q.estado='patrulla';
    let meta=null, rapidez=0;
    if (q.estado==='alerta' && op.alarma && q.ultima) {meta=q.ultima; rapidez=2.4;}
    else if (q.estado==='busqueda' && q.ultima) {meta=q.ultima; rapidez=1.55;}
    else if (q.estado==='distraccion' && cebo) {meta=cebo; rapidez=1.25;}
    else if (q.estado==='patrulla' && q.origen) {
      const fase=Math.floor(t/5)%2;
      meta={x:q.origen.x+Math.cos(q.a0||0)*(fase?4:-4),y:q.origen.y+Math.sin(q.a0||0)*(fase?4:-4)};
      rapidez=.65;
    }
    if(meta) {
      const dx=meta.x-q.x,dy=meta.y-q.y,d=Math.hypot(dx,dy);
      if(d>.6) {
        const a=Math.atan2(dy,dx), paso=Math.min(d-.5,rapidez*dt);
        const nx=q.x+Math.cos(a)*paso,ny=q.y+Math.sin(a)*paso;
        /* comprobar punto final y punto intermedio: nadie atraviesa una fachada */
        if(!M || typeof M.edificioEn!=='function'||(!M.edificioEn(nx,ny,0)&&!M.edificioEn((nx+q.x)/2,(ny+q.y)/2,0))) {q.x=nx;q.y=ny;}
        q.a=a;
      } else if(q.estado==='busqueda') q.busquedaT=Math.min(q.busquedaT,.6);
    } else if (q.origen) q.a=(q.a0||0)+Math.sin(t*.6)*.4;
    return {ve, primeraVista:ve&&!vistaAntes, estado:q.estado, x:q.x, y:q.y};
  }
};
MC.AccionPie = AccionPie;