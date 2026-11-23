/* =====================================================================
   CIUDAD VIVA (5.2 · fase 2 del plan) · la gente oye, ve y reacciona; la calle tiene escenas; la gente habla
   Ideas tomadas en sala limpia (nada de su código):
   - los «escenarios» de la calle de los juegos de mundo abierto de hoy: puntos del mapa donde la gente hace algo (sentarse en
     una banca, esperar el bus en el paradero);
   - las «reglas de respuesta» de los diálogos de Valve (Left 4 Dead 2): cada frase trae condiciones y se dice la que mejor
     encaja con lo que acaba de pasar (la más específica), sin repetir lo dicho hace poco.
   Qué hace:
   - EVENTOS con radio de oído: choque, atropello, explosión, disparo, sirena, derrape, bocina, servicio (llegó la ambulancia)…
     `MC.CiudadViva.emitir(tipo, x, y, op)`; el juego decide cuáles emite (los de familia no emiten disparos).
   - REACCIONES de cada persona que lo oye (según el evento, la distancia y su «valor», que sale de su semilla): MIRA (se
     detiene y voltea), HUYE (corre alejándose), LLAMA (se queda con el celular: a los 3 s avisa → evento 'ciudad:testigo'),
     AYUDA (camina hacia el herido) o nada. La rutina de la persona se pausa y, al terminar, vuelve caminando a ella.
   - ESCENAS: gente sentada en las bancas y esperando en los paraderos del mobiliario real, según la hora (de día más, de
     noche poca), estables (la misma persona en la misma banca) y que también reaccionan.
   - FRASES con condiciones (`datos/frases/ciudad.json`, incrustado al construir como MC_FRASES): por evento, lugar, hora y
     lluvia; tono 'familia' o 'adulto' (Turno Cero, 18+). Lo que se dice sale en `CiudadViva.dichos` y en 'ciudad:dicho'.
   Puro en lo posible (se prueba en Node con un mundo real; ver pruebas/ciudad-viva.mjs).
   ===================================================================== */
const CIUDAD_OIDO = { choque: 45, atropello: 70, explosion: 180, disparo: 150, sirena: 90, derrape: 28, bocina: 22, servicio: 40, mirar: 10 };
const CIUDAD_DUR = { mira: [2, 4], huye: [4, 7], llama: [5, 8], ayuda: [6, 10] };
const CiudadViva = {
  t: 0, _id: 0, eventos: [], dichos: [], _dicho: new Map(), _ultDicho: -99, _escenas: new Map(), tono: 'familia',
  /* las frases: las del juego (MC_FRASES, del constructor) o unas pocas de respaldo */
  frases() { if (this._fr) return this._fr; const F = typeof MC_FRASES !== 'undefined' && MC_FRASES && MC_FRASES.familia ? MC_FRASES : { familia: [{ t: '¡Uy, qué susto!', ev: ['choque', 'explosion', 'disparo', 'atropello'] }, { t: 'Buenas.', ev: ['ambiente'] }], adulto: [] }; return (this._fr = F); },
  reiniciar() { this.t = 0; this.eventos.length = 0; this.dichos.length = 0; this._dicho.clear(); this._escenas.clear(); this._ultDicho = -99; },
  /* un evento en el mundo: lo oyen los que estén dentro de su radio */
  emitir(tipo, x, y, op = {}) {
    const ev = { tipo, x, y, r: op.r || CIUDAD_OIDO[tipo] || 40, t: this.t, fuerza: op.fuerza || 1, quien: op.quien || 'jugador', id: ++this._id, grave: !!op.grave };
    this.eventos.push(ev); if (this.eventos.length > 24) this.eventos.shift(); MC.emit('ciudad:evento', ev); return ev;
  },
  /* cómo es cada persona: valor (0 asustadiza … 1 valiente) y si es de hablar (sale de su semilla, siempre lo mismo) */
  _caracter(p) { if (p._car) return p._car; const s = (p.semilla ?? p.id ?? 7) * 2654435761 >>> 0, a = (s % 1000) / 1000, b = ((s >>> 10) % 1000) / 1000; return (p._car = { valor: a, habla: b }); },
  /* qué hace una persona ante un evento a la distancia d */
  _reaccion(ev, p, d) {
    const c = this._caracter(p), h = ((p.id ?? 1) * 97 + ev.id * 131) % 100 / 100;   /* determinista por persona y evento */
    switch (ev.tipo) {
      case 'disparo': case 'explosion': return d < ev.r * .6 || c.valor < .7 ? 'huye' : 'llama';
      case 'atropello': return d < 25 && c.valor > .55 ? 'ayuda' : h < .5 ? 'llama' : 'mira';
      case 'choque': return d < 7 && c.valor < .3 ? 'huye' : h < .6 ? 'mira' : h < .85 ? 'llama' : null;
      case 'sirena': case 'servicio': return h < .5 ? 'mira' : null;
      case 'derrape': case 'bocina': case 'mirar': return h < .45 ? 'mira' : null;
      default: return h < .3 ? 'mira' : null;
    }
  },
  /* el paso: gente = lo que el juego dibuja (rutinas de MC.Poblacion y escenas); op: { dt, reloj, lluvia, cerca: {x,y} } */
  paso(gente, op = {}) {
    const dt = op.dt || 1 / 60; this.t += dt;
    /* eventos nuevos → reacciones */
    for (const ev of this.eventos) { if (ev._rep) continue; ev._rep = true;
      for (const p of gente) { if (p._caido) continue; const d = Math.hypot(p.x - ev.x, p.y - ev.y); if (d > ev.r) continue; if (p.reac && p.reac.prio >= this._prio(ev.tipo)) continue;
        const tipo = this._reaccion(ev, p, d); if (!tipo) continue; const [a, b] = CIUDAD_DUR[tipo], h = ((p.id ?? 3) * 13 + ev.id) % 10 / 10;
        if (!p.reac && p.v > 0) p._v0 = p.v; if (p.v > 0) p.v = 0;   /* la rutina se pausa */
        p.reac = { tipo, ev, t: a + (b - a) * h, prio: this._prio(ev.tipo), llamo: false };
        /* alguien lo dice (no todos: los que son de hablar y, a lo sumo, uno cada 1,2 s) */
        if (this._caracter(p).habla > .45 && this.t - this._ultDicho > 1.2) this.decir(p, tipo === 'llama' ? 'llamada' : ev.tipo, op);
      } }
    while (this.eventos.length && this.t - this.eventos[0].t > 10) this.eventos.shift();
    /* las reacciones en curso */
    for (const p of gente) {
      const R = p.reac;
      if (R) { R.t -= dt; const ex = R.ev.x - p.x, ey = R.ev.y - p.y, d = Math.hypot(ex, ey) || 1;
        if (R.tipo === 'huye') { const v = 3.6; p.a = Math.atan2(-ey, -ex); this._mover(p, -ex / d * v * dt, -ey / d * v * dt, op); p.fase = (p.fase || 0) + dt * v * 2.4; p.pose = null; }
        else if (R.tipo === 'ayuda' && d > 2.5) { const v = 1.7; p.a = Math.atan2(ey, ex); this._mover(p, ex / d * v * dt, ey / d * v * dt, op); p.fase = (p.fase || 0) + dt * v * 1.8; p.pose = null; }
        else { p.a = Math.atan2(ey, ex); p.pose = R.tipo === 'llama' ? 'celular' : p.pose === 'sentado' ? 'sentado' : null; }
        if (R.tipo === 'llama' && !R.llamo && R.t < CIUDAD_DUR.llama[0] - 3) { R.llamo = true; MC.emit('ciudad:testigo', { ev: R.ev, p }); }
        if (R.t <= 0) { p.reac = null; if (p.pose === 'celular') p.pose = null; if (p._v0) { p.v = p._v0; p._v0 = 0; } } }
      /* volver despacio a la rutina (el desplazamiento se deshace caminando) */
      else if (p._ox || p._oy) { const L = Math.hypot(p._ox, p._oy), v = Math.min(L, 1.3 * dt); if (L < .05) { p._ox = p._oy = 0; } else { p._ox -= p._ox / L * v; p._oy -= p._oy / L * v; p.a = Math.atan2(-p._oy, -p._ox); p.fase = (p.fase || 0) + dt * 2.2; } }
      /* la posición: la de su rutina más el desplazamiento de la reacción. Si va caminando su ruta, MC.Poblacion acaba de
         recalcular x, y (la base es esa); si está quieta (o es de una escena), x, y traen el desplazamiento del cuadro anterior */
      if (p._ox || p._oy || p._oxA || p._oyA) { const bx = p.ruta ? p.x : p.x - (p._oxA || 0), by = p.ruta ? p.y : p.y - (p._oyA || 0); p.x = bx + (p._ox || 0); p.y = by + (p._oy || 0); p._oxA = p._ox || 0; p._oyA = p._oy || 0; }
    }
    /* charla del ambiente: alguien cerca del jugador, despacio, de vez en cuando */
    if (op.cerca && this.t - this._ultDicho > 9) { let best = null, bd = 9; for (const p of gente) { if (p.reac || p._caido) continue; const d = Math.hypot(p.x - op.cerca.x, p.y - op.cerca.y); if (d < bd && this._caracter(p).habla > .3) { bd = d; best = p; } } if (best && (op.cerca.v ?? 0) < 4) this.decir(best, 'ambiente', op); }
    /* lo dicho se borra solo */
    for (let i = this.dichos.length - 1; i >= 0; i--) if ((this.dichos[i].t -= dt) <= 0) this.dichos.splice(i, 1);
  },
  _prio(tipo) { return tipo === 'disparo' || tipo === 'explosion' ? 3 : tipo === 'atropello' ? 2 : tipo === 'choque' ? 1 : 0; },
  /* mover a alguien sin meterlo en un edificio (si choca, prueba de lado) */
  _mover(p, dx, dy, op) {
    const M = op.mundo, prueba = (x, y) => !M || !M.edificioEn || !M.edificioEn(x, y, .2);
    let nx = p.x + dx, ny = p.y + dy; if (!prueba(nx, ny)) { const l = Math.hypot(dx, dy) || 1, tx = -dy / l, ty = dx / l; nx = p.x + tx * l; ny = p.y + ty * l; if (!prueba(nx, ny)) { nx = p.x - tx * l; ny = p.y - ty * l; if (!prueba(nx, ny)) return; } }
    p._ox = (p._ox || 0) + (nx - p.x); p._oy = (p._oy || 0) + (ny - p.y); if (Math.hypot(p._ox, p._oy) > 60) { const k = 60 / Math.hypot(p._ox, p._oy); p._ox *= k; p._oy *= k; }
  },
  /* la frase que mejor encaja (reglas de respuesta): las que cumplen todo; gana la más específica; sin repetir en 90 s */
  frase(ctx = {}) {
    const F = this.frases(), L = (F.familia || []).concat(ctx.tono === 'adulto' ? (F.adulto || []) : []), min = ctx.min ?? 720; let mejor = [], mp = -1;
    for (const f of L) { let pts = 0;
      if (f.ev) { if (!f.ev.includes(ctx.evento)) continue; pts += 1; }
      if (f.lugar) { if (f.lugar !== ctx.lugar) continue; pts += 3; }   /* el sitio pesa más que la hora o el clima */
      if (f.hora) { if (!(min >= f.hora[0] && min < f.hora[1])) continue; pts += 1; }
      if (f.lluvia != null) { if (!!f.lluvia !== !!ctx.lluvia) continue; pts += 1; }
      if (f.quien) { if (f.quien !== ctx.quien) continue; pts += .5; }
      if (this.t - (this._dicho.get(f.t) ?? -1e9) < 90) continue;
      if (pts > mp) { mp = pts; mejor = [f]; } else if (pts === mp) mejor.push(f); }
    if (!mejor.length) return null; const f = mejor[(Math.abs(Math.round(this.t * 7.3 + (ctx.semilla || 0))) % mejor.length)]; this._dicho.set(f.t, this.t); return f.t;
  },
  decir(p, evento, op = {}) {
    const lugar = p.escena || 'calle', texto = this.frase({ evento, lugar, min: op.reloj ? op.reloj.min : 720, lluvia: !!op.lluvia, quien: p.escena ? 'escena' : 'peaton', tono: op.tono || this.tono, semilla: p.id || 0 });
    if (!texto) return null; this._ultDicho = this.t; const d = { p, texto, t: 3.2, evento }; this.dichos.push(d); if (this.dichos.length > 4) this.dichos.shift(); MC.emit('ciudad:dicho', d); return d;
  },
  /* las escenas de la calle alrededor de (cx, cy): gente en las bancas y los paraderos del mobiliario real */
  escenas(M, cx, cy, op = {}) {
    if (!MC.Mobiliario || !M) return []; const R = op.radio || 110, min = op.reloj ? op.reloj.min : 720, noche = min < 330 || min > 1290, lluvia = !!op.lluvia, out = [], vivos = new Set();
    const props = MC.Mobiliario.en(M, cx - R, cy - R, cx + R, cy + R, 400);
    for (const q of props) { if (q.t !== 'banca' && q.t !== 'paradero') continue;
      const s = (Math.round(q.x * 7) * 73856093 ^ Math.round(q.y * 7) * 19349663) >>> 0, prob = q.t === 'paradero' ? (noche ? .2 : .8) : (noche ? .08 : lluvia ? .15 : .55); if ((s % 1000) / 1000 > prob) continue;
      const n = q.t === 'paradero' ? 1 + (s >>> 12) % 3 : 1 + ((s >>> 12) % 4 === 0 ? 1 : 0);
      for (let i = 0; i < n; i++) { const id = 'e' + s + ':' + i; vivos.add(id); let p = this._escenas.get(id);
        if (!p) { const ang = (q.a ?? 0), lado = (i - (n - 1) / 2) * .8, sem = (s >>> 3) + i * 977; p = { id: 1e6 + ((s + i * 31) % 1e6), semilla: sem, escena: q.t, x: q.x + Math.cos(ang) * lado, y: q.y + Math.sin(ang) * lado, a: ang + (q.t === 'banca' ? Math.PI / 2 : -Math.PI / 2), pose: q.t === 'banca' ? 'sentado' : null, fase: 0, v: 0 }; this._escenas.set(id, p); }
        if (!p._caido) out.push(p); }
      if (out.length >= (op.max || 24)) break; }
    /* las de lejos se olvidan (vuelven iguales si el jugador regresa: salen de la misma semilla) */
    if (this._escenas.size > 120) for (const k of [...this._escenas.keys()]) if (!vivos.has(k)) this._escenas.delete(k);
    return out;
  }
};
MC.CiudadViva = CiudadViva;
