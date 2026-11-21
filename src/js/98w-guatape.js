/* =====================================================================
   RUTA A GUATAPÉ EN BICI (v2.1 · encargo C‑E40 de Motor City 4.0) · un reto de cicloturismo opcional, para todo público.
   «12 km de montaña, bosque y lagos, con paradas para hidratarse, el letrero con los km y la llegada al malecón de Guatapé.»
   Se hizo con la manera A del informe 4.5 (leer y portar): la carretera pseudo‑3D por segmentos de Pole Position y OutRun
   que Motor City rehízo como MC.Arcade (js/47-clasicos.js), escrita otra vez para este juego, sin el motor entero (0 KB extra
   de mundo MC4): curvas, lomas, berma para la bici, el embalse a los lados, pinos, guaduas, fincas, vacas y chivas.
   - TRES TRAMOS de 4 km (niveles): El Peñol → Mirador del embalse (mañana) · Mirador → La Piedra (mediodía: más sed) ·
     La Piedra → Malecón de Guatapé (tarde, con más carros). La Piedra crece en el horizonte del tramo 2.
   - MANEJO: arrastra el dedo (o flechas / inclinar): a los lados giras; arriba pedaleas más fuerte; abajo frenas. Sin tocar
     nada la bici pedalea suave sola (cicloturismo): un niño solo tiene que girar.
   - FÍSICA DE VERDAD (unidades SI): potencia de ~180 W para 85 kg, rodadura 0,006 y aire 0,4 m²: 30 km/h en plano,
     ~11 km/h en una subida del 6 % y ~55 km/h bajando. El paisaje corre K = 4 veces (como el reloj de los oficios).
   - EL AGUA: se gasta pedaleando, más en subida y al mediodía. En cada parada (💧) se toma agua y se aprende algo:
     «Lo que todos saben» y «Lo poco conocido» del embalse, la Piedra y Guatapé (datos con fuente, en la bitácora).
   - LA ORILLA: los carros deben dejar 1,5 m al adelantar a un ciclista (Ley 1811 de 2016). Si vas por la berma pasan;
     si vas por la mitad del carril, esperan, pitan y te adelantan por el otro carril.
   Sin búsqueda, sin violencia: un carro que te roza solo te asusta (la bici se tambalea).
   ===================================================================== */
const GUA = JE.guatape = {
  SEG: 5, LARGO: 4000, VIS: 150, K: 4, CAM_H: 3.1, CAM_D: 6.5,
  TRAMOS: [
    { id: 1, n: 'El Peñol → Mirador', meta: 'el Mirador del embalse', km0: 12, hora: 7 * 60 + 10, sem: 1101, calor: 1, carros: [11, 17], lagos: [[250, 950, -1], [1500, 2350, 1], [2950, 4000, -1]], paradas: [1300, 2700], fin: 'mirador', loma: [-.02, .05] },
    { id: 2, n: 'Mirador → La Piedra', meta: 'La Piedra', km0: 8, hora: 12 * 60, sem: 2202, calor: 1.35, carros: [10, 15], lagos: [[150, 900, 1], [1650, 2450, -1], [2950, 3600, 1]], paradas: [1250, 2650], fin: 'piedra', loma: [-.01, .065] },
    { id: 3, n: 'La Piedra → Guatapé', meta: 'el malecón de Guatapé', km0: 4, hora: 17 * 60 + 5, sem: 3303, calor: 1, carros: [7, 11], lagos: [[350, 1150, -1], [1750, 2400, 1], [3250, 4000, -1]], paradas: [1300, 2600], fin: 'malecon', loma: [-.055, .03] }
  ],
  /* lo que se aprende en las paradas (verificado; fuentes en docs/BITACORA.md, v2.1) */
  DATOS: [
    { id: 'embalse', t: 1, quien: 'Don Aurelio', rol: 'Fonda La Curva', sabe: 'El agua que ves es un embalse: un lago que se hizo para producir energía.', poco: 'Debajo quedó el pueblo viejo de El Peñol: la inundación empezó en 1978 y miles de personas se mudaron al pueblo nuevo.' },
    { id: 'replica', t: 1, quien: 'Doña Gilma', rol: 'Tienda El Mirador', sabe: 'En el pueblo nuevo de El Peñol hay una réplica del pueblo viejo, con su iglesia, su plaza y su quiosco.', poco: 'Cuando hay una sequía fuerte el agua baja y se vuelven a asomar restos del pueblo viejo.' },
    { id: 'piedra', t: 2, quien: 'Don Aurelio', rol: 'Fonda La Curva', sabe: 'La Piedra es una sola roca de granito de unos 200 metros de alto; arriba se llega por una escalera de más de 700 escalones.', poco: 'La primera subida conocida fue en julio de 1954: Luis Eduardo Villegas, Pedro Nel Ramírez y Ramón Díaz tardaron cinco días, clavando palos en una grieta.' },
    { id: 'gi', t: 2, quien: 'Profe Nubia', rol: 'Guía del embalse', sabe: 'La roca tiene dos nombres: Piedra del Peñol y Peñón de Guatapé. Cada pueblo la llama a su modo.', poco: 'En la roca se ven una G y una I enormes. Lo que más se cuenta: empezaron a escribir GUATAPÉ y no lo terminaron.' },
    { id: 'zocalos', t: 3, quien: 'Profe Nubia', rol: 'Guía del embalse', sabe: 'Guatapé es el «pueblo de zócalos y colores»: las casas tienen abajo figuras en relieve pintadas.', poco: 'Se dice que al principio los zócalos protegían la pared de la humedad y de los golpes de los animales; con el tiempo se volvieron arte.' },
    { id: 'orilla', t: 3, quien: 'Doña Gilma', rol: 'Tienda El Mirador', sabe: 'En Colombia, al adelantar a un ciclista un carro debe dejarle al menos 1,5 metros (Ley 1811 de 2016).', poco: 'Cada zócalo cuenta algo de la familia de la casa: su oficio, sus animales o lo que le gusta.' }
  ],
  CARAS: { 'Don Aurelio': { piel: '#c68a5e', pelo: '#8a8580', ojos: '#3b2414', peinado: 'canoso', edad: .7, ropa: '#f2f2f2', barba: 'bigote', acc: ['sombrero'] }, 'Doña Gilma': { piel: '#e0ac7e', pelo: '#2b1d14', ojos: '#4a2f1a', peinado: 'moño', fem: true, edad: .55, ropa: '#c8201f', labios: '#b5645a' }, 'Profe Nubia': { piel: '#a86a3d', pelo: '#16110d', ojos: '#3b2414', peinado: 'rizado', fem: true, edad: .35, ropa: '#2f5d45', acc: ['gafas'], labios: '#9a4a48' } },
  activo() { const M = Game.mode, s = M && M.sub; return s instanceof MGGuatape ? s : null; },
  /* el dedo: arrastrar en cualquier parte (a los lados gira, arriba pedalea, abajo frena) */
  bind() {
    if (this._bind) return; this._bind = true; const cv = $('#cv'); if (!cv) return;
    cv.addEventListener('pointerdown', e => { const m = this.activo(); if (!m || Game.paused || m._boton) { if (m) m._boton = false; return; } m.dedo = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY }; });
    cv.addEventListener('pointermove', e => { const m = this.activo(); if (m && m.dedo && m.dedo.id === e.pointerId) { m.dedo.x = e.clientX; m.dedo.y = e.clientY; } });
    const up = e => { const m = this.activo(); if (m && m.dedo && m.dedo.id === e.pointerId) m.dedo = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  },
  estado() { const S = Save.data; if (!S.guatape || typeof S.guatape !== 'object' || Array.isArray(S.guatape)) S.guatape = { mejor: {}, hechos: [], datos: [] }; const G = S.guatape; G.mejor = G.mejor || {}; G.hechos = G.hechos || []; G.datos = G.datos || []; return G; }
};
for (const k in GUA.CARAS) if (typeof CARAS21 !== 'undefined') CARAS21[k] = GUA.CARAS[k];

class MGGuatape extends MG {
  constructor(parent, o = {}) {
    super(parent, o); this.view = { kind: 'px', dw: 200, dh: 150 }; this.hideGoals = true; GUA.bind();
    this.T = GUA.TRAMOS[clamp((o.tramo | 0) - 1, 0, 2)]; this.rng = new RNG(this.T.sem); this.min0 = this.T.hora; this.reloj = this.min0;   // su propio reloj: en el modo libre no cambia la hora del valle
    this.pos = 0; this.x = 3.8; this.v = 4; this.agua = 100; this.hojas = 0; this.pitos = 0; this.sustos = 0; this.huecos = 0; this.paradas = []; this.llego = false; this.fin = 0;
    this.carros = []; this.tCarro = 3; this.tOpuesto = 6; this.bgX = 0; this.fase = 0; this.temblor = 0; this.parado = null; this.dedo = null; this.coach = 'Arrastra a los lados para ir por la berma; arriba pedaleas más fuerte.';
    this.construir();
  }
  /* ---------- la carretera: curvas, lomas, el embalse y lo que hay a los lados (siempre igual en cada tramo) ---------- */
  construir() {
    const T = this.T, S = GUA.SEG, N = GUA.LARGO / S + GUA.VIS + 4, r = this.rng, segs = this.segs = new Array(N);
    let c = 0, g = 0, y = 0, cT = 0, gT = 0, quedan = 0;
    for (let i = 0; i < N; i++) {
      const z = i * S;
      if (quedan-- <= 0) { quedan = r.i(24, 70); const fin = z > GUA.LARGO - 350; cT = fin ? 0 : r.f() < .35 ? 0 : (r.f() < .5 ? -1 : 1) * r.range(.03, .17); /* c = S²/R: de R ≈ 830 m a R ≈ 150 m */ gT = fin ? 0 : r.range(T.loma[0], T.loma[1]) * (r.f() < .25 ? .2 : 1); }
      c += (cT - c) * .045; g += (gT - g) * .03; y += g * S;
      const lado = (T.lagos.find(L => z >= L[0] && z < L[1]) || [0, 0, 0])[2];
      segs[i] = { i, c, y, g, lago: lado, spr: [], col: Math.floor(z / 15) % 2 };
    }
    /* lo de los lados */
    const pone = (z, k, o, ex) => { const s = segs[Math.floor(z / S)]; if (s) s.spr.push(Object.assign({ k, o }, ex || {})); };
    for (let z = 20; z < GUA.LARGO + GUA.VIS * S; z += r.range(14, 34)) {
      const s = segs[Math.floor(z / S)]; if (!s) break; const malecon = T.fin === 'malecon' && z > GUA.LARGO - 450 && z < GUA.LARGO + 200;
      for (const lado of [-1, 1]) {
        if (s.lago === lado || (malecon && lado < 0)) { if (r.f() < .18) pone(z, 'lancha', lado * r.range(25, 90), { v: r.range(.6, 1.4) }); if (r.f() < .1) pone(z, 'isla', lado * r.range(60, 140)); continue; }
        if (malecon && lado > 0) { pone(z, 'casa', lado * r.range(7.5, 9), { col: r.pick(['#ff6b5a', '#ffc93c', '#56c7ff', '#9bd341', '#ff8fc7', '#b07cff', '#f08a4b']), zoc: r.pick(['#ffc93c', '#56c7ff', '#ff6b5a', '#ffffff', '#9bd341']) }); continue; }
        if (r.f() < .55) { const k = r.pick(['pino', 'pino', 'eucalipto', 'guadua', 'finca', 'vaca', 'pino', 'arbusto']); pone(z, k, lado * (k === 'finca' ? r.range(16, 30) : k === 'vaca' ? r.range(9, 16) : r.range(7, 22))); }
      }
    }
    for (const s of segs) if (s.lago && s.i % 2 === 0) s.spr.push({ k: 'baranda', o: s.lago * 5.6 });
    for (let km = 0; km < 4; km++) { const z = km * 1000 + 8, sg = segs[Math.floor(z / S)]; pone(z, 'letrero', sg && sg.lago > 0 ? -6.4 : 6.2, { km: T.km0 - km }); }
    this.paradasZ = T.paradas.slice();
    for (const zp of this.paradasZ) { pone(zp - 120, 'aviso', 6, { txt: '💧 Parada' }); pone(zp, 'fonda', 8.5); }
    /* hojas en la berma y algunos huecos */
    this.hojasL = []; this.huecosL = [];
    for (let z = 90; z < GUA.LARGO - 80; z += r.range(110, 190)) { const x0 = r.range(3.5, 4.2), n = r.i(3, 5); for (let k = 0; k < n; k++) this.hojasL.push({ z: z + k * 3, x: x0 + Math.sin(k) * .25, ok: false }); }
    for (let z = 260; z < GUA.LARGO - 200; z += r.range(320, 520)) if (!this.paradasZ.some(zp => Math.abs(zp - z) < 60)) this.huecosL.push({ z, x: r.range(3.5, 4.3), ok: false });
    /* el final de cada tramo */
    const zf = GUA.LARGO;
    if (T.fin === 'mirador') { pone(zf - 10, 'mirador', -7.5); pone(zf + 6, 'arco', 0, { txt: 'Mirador del embalse' }); }
    if (T.fin === 'piedra') { pone(zf + 6, 'arco', 0, { txt: 'La Piedra' }); }
    if (T.fin === 'malecon') { pone(zf + 6, 'arco', 0, { txt: 'GUATAPÉ' }); }
    this.perfil = []; for (let i = 0; i < GUA.LARGO / S; i += 8) this.perfil.push(segs[i].y);
  }
  seg(z) { return this.segs[clamp(Math.floor(z / GUA.SEG), 0, this.segs.length - 1)]; }
  alto(z) { const S = GUA.SEG, i = clamp(Math.floor(z / S), 0, this.segs.length - 2), f = (z - i * S) / S, a = this.segs[i], b = this.segs[i + 1]; return a.y + (b.y - a.y) * f; }
  pend(z) { return (this.alto(z + 6) - this.alto(z - 6)) / 12; }
  /* ---------- entrada ---------- */
  mando() {
    const d = Input.dir(); let gx = d.x * d.m, arriba = Math.max(0, -d.y) * d.m, abajo = Math.max(0, d.y) * d.m;
    if (this.dedo) { const D = this.dedo; gx = clamp((D.x - D.x0) / 55, -1, 1); arriba = clamp(-(D.y - D.y0) / 70, 0, 1); abajo = clamp((D.y - D.y0) / 70, 0, 1); }
    if (this.botM) ({ gx, arriba, abajo } = this.botM);
    return { gx, arriba, abajo };
  }
  key(e) { if (e.code === 'Space' || e.code === 'KeyE') { const zp = this.paradaCerca(); if (zp != null) this.parar(zp); } }
  paradaCerca() { for (const zp of this.paradasZ) if (!this.paradas.includes(zp) && this.pos > zp - 70 && this.pos < zp + 12) return zp; return null; }
  parar(zp) { if (this.parado || this.paradas.includes(zp)) return; this.parado = { zp, t: 0, frenando: true }; Snd.sfx('tap'); }
  /* ---------- simulación ---------- */
  update(dt) {
    this.tick(dt); const T = this.T, K = GUA.K;
    if (this.fin) { this.fin += dt; this.v = Math.max(0, this.v - 3 * dt); this.pos += this.v * K * dt; this.fase += this.v * dt * 1.7; if (this.fin > 2.6) this.done = true; return; }
    this.reloj += dt * K / 60;   // el reloj del día corre con el paisaje
    const m = this.mando(), sl = this.pend(this.pos), s = this.seg(this.pos);
    /* la parada: frena sola hasta la fonda, toma agua y cuenta lo que sabe la gente */
    if (this.parado) {
      const Q = this.parado; Q.t += dt; this.x += (4.4 - this.x) * Math.min(1, dt * 3);
      if (Q.frenando) { this.v = Math.max(0, this.v - 6 * dt); this.pos += this.v * K * dt; if (this.v <= .3 || this.pos > Q.zp + 6) { Q.frenando = false; this.v = 0; this.llegaParada(Q); } }
      else { this.agua = Math.min(100, this.agua + 45 * dt); if (Q.t > (JE.headless ? .2 : 12) || Q.seguir) { this.parado = null; this.cerrarParada(); } }
      return;
    }
    let pedal = m.abajo > .25 ? 0 : .55 + .45 * m.arriba; if (this.agua <= 0) pedal *= .5;
    const Pw = 2.12 * pedal, roce = .059 + .00282 * this.v * this.v, fuera = this.x > 5.1 || this.x < -4.4;
    let a = Pw / Math.max(this.v, 2) - roce - 9.81 * sl - m.abajo * 4.2 - (fuera ? .8 + .03 * this.v * this.v : 0);
    if (this.temblor > 0) a -= 1.5;
    this.v = clamp(this.v + a * dt, 0, 22);
    /* las curvas empujan hacia afuera; el dedo corrige (más ágil con algo de velocidad) */
    this.x += (m.gx * (1.3 + this.v * .32) - s.c / 25 * (this.v * K) ** 2 * .15) * dt;   // v²/R con la velocidad del paisaje
    if (s.lago > 0 && this.x > 5.3) { this.x = 5.3; this.v *= .97; if (!(this._tB > 0)) { this._tB = .5; Snd.sfx('bordillo'); this.pop('Baranda', 110, 300, '#fff'); } }
    if (s.lago < 0 && this.x < -4.9) { this.x = -4.9; this.v *= .97; }
    this.x = clamp(this.x, -9, 9); this._tB = (this._tB || 0) - dt; this.temblor = Math.max(0, this.temblor - dt);
    this.pos += this.v * K * dt; this.fase += this.v * dt * 1.7; this.bgX += s.c * this.v * dt * .04;
    /* el agua: pedalear, la subida y el calor */
    this.agua = Math.max(0, this.agua - (.08 + .5 * pedal * pedal + Math.max(0, sl) * 7) * T.calor * dt * 1.15);
    if (this.agua < 18 && !this._avisoAgua) { this._avisoAgua = 1; this.coach = '💧 ¡Te estás quedando sin agua! Para en la próxima fonda.'; Snd.sfx('bad'); }
    if (this.agua <= 0 && this._avisoAgua < 2) { this._avisoAgua = 2; this.coach = 'Sin agua pedaleas con la mitad de fuerza: para en la fonda (💧).'; }
    /* hojas y huecos */
    for (const h of this.hojasL) if (!h.ok && Math.abs(h.z - this.pos) < 1.6 && Math.abs(h.x - this.x) < .55) { h.ok = true; this.hojas++; this.score += 5; Snd.sfx('leaf'); Snd.note && Snd.note(this.hojas % 8); }
    for (const h of this.huecosL) if (!h.ok && Math.abs(h.z - this.pos) < 1.2 && Math.abs(h.x - this.x) < .45) { h.ok = true; this.huecos++; this.v *= .72; this.temblor = .35; Snd.sfx('bordillo'); vib(25); this.pop('¡Hueco!', 100, 260, PAL.amb); }
    this.carrosTick(dt);
    /* la parada: tocar «Parar» o frenar en la fonda */
    const zp = this.paradaCerca(); if (zp != null && (this.v < 1.2 && m.abajo > .3 || this.botParar)) this.parar(zp);
    if (this.pos >= GUA.LARGO) this.llegar();
    this.score = Math.max(0, Math.round(Math.min(this.pos, GUA.LARGO) / 10 + this.hojas * 5 + this.paradas.length * 40 - this.sustos * 20));
  }
  llegaParada(Q) {
    this.paradas.push(Q.zp); Snd.sfx('coin'); const D = GUA.DATOS.filter(d => d.t === this.T.id)[this.T.paradas.indexOf(Q.zp)] || GUA.DATOS[0]; this.dato = D;
    if (!JE.headless) { const G = GUA.estado(); if (!G.datos.includes(D.id)) G.datos.push(D.id); }
    this.mostrarParada(D);
  }
  mostrarParada(D) {
    if (JE.headless) return; let el = $('#parada21'); if (!el) { el = document.createElement('div'); el.id = 'parada21'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-live', 'polite'); $('#sGame').appendChild(el); }
    el.innerHTML = `<div class="pr-q"><img src="${typeof Caras !== 'undefined' ? Caras.url(D.quien, 96) : ''}" alt=""><div><b>${esc(D.quien)}</b><small>${esc(D.rol)} · 💧 agua para seguir</small></div></div><p class="pr-s"><b>✅ Lo que todos saben</b>${esc(D.sabe)}</p><p class="pr-p"><b>💡 Lo poco conocido</b>${esc(D.poco)}</p><button class="btn pri" id="prSeguir">▶ Seguir rodando</button>`;
    el.hidden = false; const b = $('#prSeguir'); if (b) b.onclick = () => { Snd.sfx('tap'); if (this.parado) this.parado.seguir = true; };
  }
  cerrarParada() { const el = $('#parada21'); if (el) el.hidden = true; this.coach = ''; }
  llegar() {
    if (this.llego) return; this.llego = true; this.fin = .01; Snd.fanfare ? Snd.fanfare() : Snd.sfx('win'); this.cerrarParada();
    const T = this.T; this.sello = { t: 2.6, title: T.fin === 'malecon' ? '¡LLEGASTE A GUATAPÉ!' : T.fin === 'piedra' ? '¡LLEGASTE A LA PIEDRA!' : '¡LLEGASTE AL MIRADOR!', sub: T.n + ' · ' + this.hojas + ' hojas · ' + this.paradas.length + ' paradas' };
    if (!JE.headless) { const G = GUA.estado(), k = String(T.id); if (!G.hechos.includes(T.id)) G.hechos.push(T.id); if (!G.mejor[k] || this.t < G.mejor[k]) G.mejor[k] = Math.round(this.t); Save.save(); }
  }
  /* ---------- el tráfico: carros del mismo sentido (adelantan con 1,5 m) y del sentido contrario ---------- */
  carrosTick(dt) {
    const K = GUA.K, T = this.T, r = this.rng;
    if ((this.tCarro -= dt) <= 0) { this.tCarro = r.range(T.carros[0], T.carros[1]); const ch = r.f() < .22; this.carros.push({ z: this.pos - 70, x: 1.7, v: r.range(12.5, 15.5), dir: 1, k: ch ? 'chiva' : r.f() < .2 ? 'moto' : 'carro', col: r.pick(['#e9eef3', '#c43a26', '#2a5a92', '#1d1f24', '#9aa7b8', '#f5c400', '#3d6b3a']), espera: 0, pito: false }); }
    if ((this.tOpuesto -= dt) <= 0) { this.tOpuesto = r.range(T.carros[0] * .7, T.carros[1] * .8); this.carros.push({ z: this.pos + 620, x: -1.7, v: r.range(12, 15), dir: -1, k: r.f() < .25 ? 'chiva' : 'carro', col: r.pick(['#e9eef3', '#c43a26', '#2a5a92', '#7a3b3b', '#9aa7b8']) }); }
    const opuestoCerca = this.carros.some(o => o.dir < 0 && o.z > this.pos - 10 && o.z < this.pos + 160);
    for (const c of this.carros) {
      if (c.dir > 0) {
        /* el carro se pega a la línea del centro (eje en 1,1 m, medio ancho 0,9 m): cabe si quedan 1,5 m hasta la bici (medio ancho 0,3 m) */
        const atras = this.pos - c.z, cabe = (this.x - .3) - (1.1 + .9) >= 1.5;
        if (atras > 0 && atras < 22 && !cabe && !c.adelanta) {
          c.v = Math.min(c.v, this.v * 1.02 + .3); c.espera += dt;
          if (c.espera > 1.6 && !c.pito) { c.pito = true; this.pitos++; Snd.sfx('honk'); this.pop('📯 ¡Pi pi! Ve por la orilla', 100, 240, PAL.amb); }
          if (c.espera > 2.4 && !opuestoCerca) c.adelanta = true;
        }
        const xObj = c.adelanta && atras > -14 ? -1.7 : Math.abs(atras) < 26 && cabe ? 1.1 : atras < -14 || atras > 26 ? 1.7 : c.x; c.x += clamp(xObj - c.x, -dt * 2.2, dt * 2.2);
        if (c.adelanta && atras < -14) c.v = Math.max(c.v, 14);
        c.z += c.v * K * dt;
      } else c.z -= c.v * K * dt;
      if (Math.abs(c.z - this.pos) < 2.6 && Math.abs(c.x - this.x) < (c.k === 'moto' ? .8 : 1.25) && !c.toco) { c.toco = true; this.sustos++; this.v *= .4; this.temblor = .6; Snd.sfx('bad'); vib(50); this.pop('¡Uy! Casi', 100, 260, PAL.cor); }
    }
    this.carros = this.carros.filter(c => c.z > this.pos - 90 && c.z < this.pos + 900);
  }
  /* ---------- dibujo (búfer pixelado; el HUD va nítido) ---------- */
  colores() {
    const min = this.reloj, [cie, hor] = Art.sky(min), tarde = clamp((min - 16.5 * 60) / 90, 0, 1), medio = clamp(1 - Math.abs(min - 12 * 60) / 120, 0, 1);
    return { cie, hor, bruma: mixHex(hor, '#b9c9cf', .35), pasto: [mixHex('#6aa84f', '#c79a52', tarde * .25), mixHex('#609c47', '#b98d4a', tarde * .25)], agua: mixHex('#3f86c8', '#e07a4a', tarde * .35), aguaL: mixHex('#7fb6e6', '#ffc28a', tarde * .4), sol: tarde > .05 ? '#ffd27a' : medio > .3 ? '#fff6d0' : '#ffe9b0', tarde, medio };
  }
  render(V) {
    const b = V.b, W = V.vw, H = V.vh, C = this.colores(), hz = Math.round(H * .44), F = W * .86, S = GUA.SEG, t = this.t;
    /* cielo, sol, montañas lejanas y el embalse en el horizonte */
    const gr = b.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, C.cie); gr.addColorStop(1, C.hor); b.fillStyle = gr; b.fillRect(0, 0, W, hz + 1);
    const sx = W * (.72 - C.tarde * .2) - this.bgX * 30, sy = hz * (.28 + C.tarde * .5); b.fillStyle = C.sol; b.beginPath(); b.arc(((sx % (W * 1.4)) + W * 1.4) % (W * 1.4) - W * .2, sy, W * .045, 0, TAU); b.fill();
    b.fillStyle = '#ffffffb0'; for (let k = 0; k < 4; k++) { const cx = ((k * 97 - this.bgX * 60 + t * 2) % (W + 80) + W + 80) % (W + 80) - 40, cy = hz * (.18 + k * .13); b.beginPath(); b.ellipse(cx, cy, 18, 5, 0, 0, TAU); b.ellipse(cx + 10, cy - 3, 11, 5, 0, 0, TAU); b.fill(); }
    const sierra = (par, alto, col, sem) => { b.fillStyle = col; b.beginPath(); b.moveTo(0, hz + 1); for (let x = 0; x <= W + 4; x += 4) { const u = (x + this.bgX * par * 400) / W * 3; b.lineTo(x, hz - (Math.sin(u * 2.1 + sem) * .45 + Math.sin(u * 5.3 + sem * 2) * .3 + Math.sin(u * 11.7 + sem) * .12 + .75) * alto); } b.lineTo(W, hz + 1); b.fill(); };
    sierra(.3, H * .1, mixHex(C.bruma, '#4f6f8a', .35), 1); sierra(.6, H * .065, mixHex(C.bruma, '#3e6b4a', .55), 4);
    const ag = b.createLinearGradient(0, hz - H * .03, 0, hz + 3); ag.addColorStop(0, mixHex(C.agua, C.bruma, .45)); ag.addColorStop(1, mixHex(C.aguaL, C.bruma, .25)); b.fillStyle = ag; b.fillRect(0, hz - H * .03, W, H * .03 + 4);
    b.fillStyle = '#ffffff55'; for (let k = 0; k < 14; k++) { const ix = ((k * 37 + t * 6 - this.bgX * 70) % W + W) % W; b.fillRect(ix, hz - H * .015 + (k % 3), 3, .7); }
    b.fillStyle = mixHex(C.bruma, '#3e6b4a', .45); for (let k = 0; k < 6; k++) { const ix = ((k * 71 + 20 - this.bgX * 90) % (W + 60) + W + 60) % (W + 60) - 30; b.beginPath(); b.ellipse(ix, hz - H * .012, 7 + k * 2.5, 2.6 + (k % 2), 0, Math.PI, 0); b.fill(); }
    b.fillStyle = C.pasto[1]; b.fillRect(0, hz + 2, W, H - hz);
    /* la carretera: primero se proyecta (la Piedra necesita saber hacia dónde va la vía a lo lejos) y luego se dibuja
       de cerca a lejos con el recorte de las lomas; lo de los lados va después, de lejos a cerca */
    const camZ = this.pos - GUA.CAM_D, i0 = Math.max(0, Math.floor(camZ / S)), fr = (camZ - i0 * S) / S, camY = this.alto(Math.max(0, this.pos)) + GUA.CAM_H, camX = this.x * .78;
    const proy = (wx, wy, z) => { const k = F / z; return { X: W / 2 + (wx - camX) * k, Y: hz - (wy - camY) * k, k }; };
    const cuadro = this._cuadro = (this._cuadro | 0) + 1, filas = []; let x = 0, dx = -this.segs[i0].c * fr, zLejos = 1, xLejos = 0, dxLejos = 0;
    for (let n = 0; n < GUA.VIS; n++) {
      const s = this.segs[i0 + n]; if (!s) break; const z1 = (i0 + n) * S - camZ, z2 = z1 + S, sn = this.segs[i0 + n + 1] || s;
      if (z2 <= .6) { x += dx; dx += s.c; continue; }
      filas.push([s, proy(x, s.y, Math.max(z1, .6)), proy(x + dx, sn.y, z2), x, z1]); x += dx; dx += s.c; zLejos = z2; xLejos = x; dxLejos = dx;
    }
    /* La Piedra en el horizonte (tramos 1 y 2): crece al acercarse, sobre la prolongación de la vía */
    if (this.T.fin !== 'malecon') this.dibPiedra(b, W, hz, F, camX, camY, zLejos, xLejos, dxLejos, filas);
    let maxy = H; const vis = [];
    for (const [s, p1, p2, x1, z1] of filas) {
      s.p1 = p1; s.x1 = x1; s.z1 = z1; s.clip = maxy; s.cuadro = cuadro;
      vis.push(s); if (p2.Y >= maxy) continue;
      const niebla = clamp(z1 / (GUA.VIS * S), 0, 1) ** 1.5 * .85, col = h => mixHex(h, C.bruma, niebla), alt = s.col;
      b.fillStyle = col(C.pasto[alt]); b.fillRect(0, p2.Y, W, Math.max(0, p1.Y - p2.Y));
      const banda = (a1, a2, color) => { b.fillStyle = color; b.beginPath(); b.moveTo(p1.X + a1 * p1.k, p1.Y + .6); b.lineTo(p1.X + a2 * p1.k, p1.Y + .6); b.lineTo(p2.X + a2 * p2.k, p2.Y); b.lineTo(p2.X + a1 * p2.k, p2.Y); b.closePath(); b.fill(); };
      if (s.lago) { const L = s.lago; banda(L * 6.2, L * 9000, col(alt ? C.agua : mixHex(C.agua, C.aguaL, .12))); banda(L * 4.9, L * 6.4, col('#8a8f6a')); }
      banda(-4.6, 5.3, col(alt ? '#9a958a' : '#8f8a80'));   // berma y orillas de tierra
      banda(-3.5, 3.5, col(alt ? '#5b5f66' : '#575b62'));   // los dos carriles
      banda(3.5, 4.9, col(alt ? '#62666c' : '#5e6268'));   // la berma de la bici
      banda(3.38, 3.52, col('#eeeeee')); banda(-3.52, -3.38, col('#eeeeee'));
      if (alt) { banda(-.16, -.04, col('#f2c230')); banda(.04, .16, col('#f2c230')); }
      maxy = p2.Y;
    }
    /* lo de los lados, las hojas, los huecos y los carros: de lejos a cerca */
    const objs = [];
    for (const s of vis) { for (const o of s.spr) objs.push({ s, o, z: s.z1 }); }
    for (const h of this.hojasL) if (!h.ok && h.z > this.pos - 3 && h.z < this.pos + 300) objs.push({ z: h.z - camZ, hoja: h });
    for (const h of this.huecosL) if (h.z > this.pos - 3 && h.z < this.pos + 300) objs.push({ z: h.z - camZ, hueco: h });
    for (const c of this.carros) objs.push({ z: c.z - camZ, carro: c });
    objs.sort((a, b2) => b2.z - a.z);
    for (const O of objs) {
      if (O.z < 1) continue; const s = O.s || this.seg(O.z + camZ); if (!s || s.cuadro !== cuadro) continue; const k = F / Math.max(O.z, .6), base = hz - (this.alto(O.z + camZ) - camY) * k, xc = W / 2 + (s.x1 - camX) * k;
      b.save(); b.beginPath(); b.rect(0, 0, W, s.clip + 1); b.clip();
      if (O.o) GUAdib.cosa(b, O.o, xc + O.o.o * k, base, k, C, t);
      else if (O.hoja) GUAdib.hoja(b, xc + O.hoja.x * k, base, k, t);
      else if (O.hueco) GUAdib.hueco(b, xc + O.hueco.x * k, base, k);
      else if (O.carro) GUAdib.carro(b, O.carro, xc + O.carro.x * k, base, k);
      b.restore();
    }
    /* la bici, de espaldas, abajo al centro */
    const pb = proy(this.x, this.alto(this.pos), GUA.CAM_D), giro = this.mando().gx;
    GUAdib.ciclista(b, pb.X + (this.temblor > 0 ? Math.sin(t * 50) * 1.5 : 0), pb.Y, pb.k, this.fase, giro, this.v);
    if (C.tarde > .6) { b.fillStyle = 'rgba(255,140,60,' + ((C.tarde - .6) * .25).toFixed(3) + ')'; b.fillRect(0, 0, W, H); }
    this.pb = pb;
  }
  dibPiedra(b, W, hz, F, camX, camY, zL, xL, dxL, filas) {
    const d = (this.T.fin === 'piedra' ? GUA.LARGO + 380 : GUA.LARGO + 4400) - this.pos; if (d < 60) return;
    /* lejos de lo dibujado, la vía sigue derecha con el último rumbo; la roca queda 110 m a la derecha de ella */
    const fl = d <= zL && filas.find(q => q[4] + GUA.SEG > d), k = F / d, h = 200 * k, w = h * .62, xr = fl ? fl[3] : xL + dxL / GUA.SEG * (d - zL), cx = W / 2 + (xr - camX + 110) * k, y0 = fl ? fl[2].Y + 1 : hz + 1;
    if (h < 2) return; b.fillStyle = '#8a8d8f'; b.beginPath(); b.moveTo(cx - w * .55, y0); b.bezierCurveTo(cx - w * .6, y0 - h * .7, cx - w * .35, y0 - h * 1.02, cx, y0 - h); b.bezierCurveTo(cx + w * .38, y0 - h * 1.0, cx + w * .62, y0 - h * .62, cx + w * .5, y0); b.closePath(); b.fill();
    b.fillStyle = '#6f7375'; b.beginPath(); b.moveTo(cx + w * .1, y0 - h * .98); b.bezierCurveTo(cx + w * .45, y0 - h * .9, cx + w * .6, y0 - h * .55, cx + w * .5, y0); b.lineTo(cx + w * .22, y0); b.closePath(); b.fill();
    if (h > 14) { b.strokeStyle = '#f4f4f0'; b.lineWidth = Math.max(.6, h * .012); b.beginPath(); for (let i = 0; i <= 10; i++) { const yy = y0 - h * (.08 + i * .088), xx = cx + w * .16 + (i % 2 ? w * .05 : -w * .05); i ? b.lineTo(xx, yy) : b.moveTo(xx, yy); } b.stroke(); }
    if (h > 22) { b.fillStyle = '#f2f2ee'; const gx = cx - w * .3, gy = y0 - h * .55, gs = h * .13; b.fillRect(gx, gy, gs * .7, gs * .16); b.fillRect(gx, gy, gs * .16, gs); b.fillRect(gx, gy + gs * .84, gs * .7, gs * .16); b.fillRect(gx + gs * .54, gy + gs * .5, gs * .16, gs * .5); b.fillRect(gx + gs * .95, gy, gs * .16, gs); }
    if (h > 30) { b.fillStyle = '#c9c4b8'; b.fillRect(cx - w * .05, y0 - h * 1.04, w * .1, h * .05); }
  }
  hud(V) {
    this.btns = []; const c = V.ctx, top = (View.top || 60) + 4, w = V.w, s = V.s;
    /* el letrero verde de la vía: cuántos km faltan */
    const falta = Math.max(0, (GUA.LARGO - this.pos) / 1000) + this.T.km0 - 4, txt = 'GUATAPÉ ' + falta.toFixed(1).replace('.', ',') + ' km';
    c.fillStyle = '#0b6b3a'; c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.roundRect(10, top, 168, 34, 6); c.fill(); c.stroke(); V.text(txt, 94, top + 23, { size: 15, align: 'center', color: '#fff' });
    /* agua y velocidad */
    const ax = 188, aw = Math.min(120, w - ax - 14); c.fillStyle = '#0a2342cc'; c.beginPath(); c.roundRect(ax, top, aw, 34, 8); c.fill();
    c.fillStyle = '#ffffff33'; c.fillRect(ax + 24, top + 13, aw - 32, 9); c.fillStyle = this.agua < 20 ? '#ff6b5a' : this.agua < 45 ? '#ffc93c' : '#56c7ff'; c.fillRect(ax + 24, top + 13, (aw - 32) * this.agua / 100, 9); V.text('💧', ax + 12, top + 23, { size: 13, align: 'center' });
    V.text(Math.round(this.v * 3.6) + ' km/h', 10, top + 54, { size: 13, color: '#fff', stroke: '#0a2342', sw: 3 });
    const sl = Math.round(this.pend(this.pos) * 100); if (Math.abs(sl) >= 2) V.text((sl > 0 ? '▲ ' : '▼ ') + Math.abs(sl) + ' %', 84, top + 54, { size: 13, color: sl > 0 ? PAL.amb : '#bfe6ff', stroke: '#0a2342', sw: 3 });
    /* el perfil de la ruta (lomas, paradas y dónde vas) */
    const px0 = 10, pw = w - 20, py = V.h - 38, ph = 22, P = this.perfil, mn = Math.min(...P), mx = Math.max(...P) + 1;
    c.fillStyle = '#0a2342aa'; c.beginPath(); c.roundRect(px0 - 4, py - ph - 6, pw + 8, ph + 14, 8); c.fill(); c.strokeStyle = '#c4ec7c'; c.lineWidth = 1.5; c.beginPath();
    P.forEach((y, i) => { const X = px0 + i / (P.length - 1) * pw, Y = py - (y - mn) / (mx - mn) * ph; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke();
    for (const zp of this.paradasZ) { const X = px0 + zp / GUA.LARGO * pw; V.text(this.paradas.includes(zp) ? '✓' : '💧', X, py + 6, { size: 10, align: 'center', color: '#fff' }); }
    const X = px0 + clamp(this.pos / GUA.LARGO, 0, 1) * pw; c.fillStyle = '#ffc93c'; c.beginPath(); c.arc(X, py - (this.alto(this.pos) - mn) / (mx - mn) * ph, 4, 0, TAU); c.fill();
    /* parada cerca: el botón para parar */
    const zp = this.paradaCerca(); if (zp != null && !this.parado) { const bw = Math.min(260, w - 40); this.button(V, (w - bw) / 2, py - ph - 70, bw, 48, '💧 Parar a tomar agua', () => { this._boton = true; this.parar(zp); }, { size: 16, bg: '#0b6b3a' }); }
    /* las letras del letrero de km y del arco, nítidas sobre su sitio */
    if (this.sello) { const k = this.sello; k.t -= 1 / 60; if (k.t > 0) { c.save(); c.translate(w / 2, V.h * .34); c.rotate(-.06); const bw = Math.min(w - 40, 330); c.fillStyle = '#0008'; c.fillRect(-bw / 2 + 6, -36, bw, 78); c.fillStyle = PAL.amb; c.fillRect(-bw / 2, -42, bw, 78); V.text(k.title, 0, -6, { size: 24, align: 'center', color: PAL.az }); V.text(k.sub, 0, 22, { size: 12, align: 'center', color: PAL.az }); c.restore(); } }
    if (this.dedo && !JE.headless) { const r = cv => cv.getBoundingClientRect(), R = r($('#cv')), x0 = this.dedo.x0 - R.left, y0 = this.dedo.y0 - R.top; c.globalAlpha = .35; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(x0, y0, 40, 0, TAU); c.stroke(); c.globalAlpha = .6; c.fillStyle = PAL.vd; c.beginPath(); c.arc(x0 + clamp(this.dedo.x - this.dedo.x0, -40, 40), y0 + clamp(this.dedo.y - this.dedo.y0, -40, 40), 14, 0, TAU); c.fill(); c.globalAlpha = 1; }
    this.drawPops(V);
  }
  /* el bot (pruebas): va por la berma, pedalea y para en cada fonda */
  bot() { const zp = this.paradaCerca(); this.botParar = zp != null; this.botM = { gx: clamp((3.9 - this.x) * .9 + this.seg(this.pos).c / 25 * (this.v * GUA.K) ** 2 * .15 / (1.3 + this.v * .32), -1, 1), arriba: .6, abajo: 0 }; }
}
/* ---------- el dibujo de lo que hay en la vía (formas sencillas, escaladas por la distancia: k px por metro) ---------- */
const GUAdib = {
  cosa(b, o, x, y, k, C, t) {
    const m = v => v * k; if (m(1) < .25) return;
    switch (o.k) {
      case 'pino': b.fillStyle = '#5b3a1e'; b.fillRect(x - m(.25), y - m(2.2), m(.5), m(2.2)); for (let i = 0; i < 3; i++) { b.fillStyle = i % 2 ? '#2f6a33' : '#285d2c'; b.beginPath(); b.moveTo(x, y - m(5.6 + i * 2)); b.lineTo(x - m(2.6 - i * .5), y - m(2 + i * 2)); b.lineTo(x + m(2.6 - i * .5), y - m(2 + i * 2)); b.closePath(); b.fill(); } break;
      case 'eucalipto': b.fillStyle = '#c9c2b5'; b.fillRect(x - m(.22), y - m(7), m(.44), m(7)); b.fillStyle = '#7fa36a'; b.beginPath(); b.ellipse(x, y - m(9), m(2.4), m(3.4), 0, 0, TAU); b.fill(); break;
      case 'guadua': b.strokeStyle = '#7fae3a'; b.lineWidth = Math.max(.5, m(.18)); for (let i = -2; i <= 2; i++) { b.beginPath(); b.moveTo(x + m(i * .35), y); b.quadraticCurveTo(x + m(i * .9), y - m(6), x + m(i * 2.2), y - m(9)); b.stroke(); } break;
      case 'arbusto': b.fillStyle = '#4e8a3a'; b.beginPath(); b.ellipse(x, y - m(.7), m(1.3), m(.9), 0, 0, TAU); b.fill(); break;
      case 'finca': b.fillStyle = '#f4f1e8'; b.fillRect(x - m(4), y - m(3), m(8), m(3)); b.fillStyle = '#b5543a'; b.beginPath(); b.moveTo(x - m(4.6), y - m(3)); b.lineTo(x, y - m(5.2)); b.lineTo(x + m(4.6), y - m(3)); b.closePath(); b.fill(); b.fillStyle = '#7a4a22'; b.fillRect(x - m(.6), y - m(2), m(1.2), m(2)); b.fillStyle = '#2a5a92'; b.fillRect(x - m(3), y - m(2.2), m(1.2), m(1)); b.fillRect(x + m(1.8), y - m(2.2), m(1.2), m(1)); break;
      case 'vaca': b.fillStyle = '#f4f4f0'; b.fillRect(x - m(1), y - m(1.3), m(2), m(.8)); b.fillStyle = '#1d1f24'; b.fillRect(x - m(.5), y - m(1.3), m(.5), m(.4)); b.fillRect(x + m(.9), y - m(1.5), m(.4), m(.5)); b.fillStyle = '#3d3f44'; b.fillRect(x - m(.9), y - m(.5), m(.18), m(.5)); b.fillRect(x + m(.7), y - m(.5), m(.18), m(.5)); break;
      case 'baranda': b.fillStyle = '#d9d9d4'; b.fillRect(x - m(.08), y - m(.9), Math.max(.6, m(.16)), m(.9)); b.fillRect(x - m(2.5), y - m(.75), m(5), Math.max(.6, m(.12))); break;
      case 'letrero': { b.fillStyle = '#6b7078'; b.fillRect(x - m(.08), y - m(2.6), Math.max(.6, m(.16)), m(2.6)); b.fillStyle = '#0b6b3a'; b.fillRect(x - m(1.3), y - m(3.4), m(2.6), m(1.1)); b.strokeStyle = '#fff'; b.lineWidth = Math.max(.4, m(.06)); b.strokeRect(x - m(1.2), y - m(3.3), m(2.4), m(.9)); if (m(1) > 3) { b.fillStyle = '#fff'; b.font = '700 ' + Math.max(4, m(.6)) + 'px Cuerpo,sans-serif'; b.textAlign = 'center'; b.fillText(o.km + ' km', x, y - m(2.65)); } break; }
      case 'aviso': b.fillStyle = '#6b7078'; b.fillRect(x - m(.07), y - m(2.2), Math.max(.6, m(.14)), m(2.2)); b.fillStyle = '#1f6fb2'; b.beginPath(); b.arc(x, y - m(2.5), m(.55), 0, TAU); b.fill(); b.fillStyle = '#fff'; b.beginPath(); b.moveTo(x, y - m(2.85)); b.quadraticCurveTo(x + m(.3), y - m(2.4), x, y - m(2.2)); b.quadraticCurveTo(x - m(.3), y - m(2.4), x, y - m(2.85)); b.fill(); break;
      case 'fonda': b.fillStyle = '#fff3df'; b.fillRect(x - m(3), y - m(3), m(6), m(3)); b.fillStyle = '#c43a26'; for (let i = 0; i < 6; i++) { b.fillStyle = i % 2 ? '#ffffff' : '#c43a26'; b.fillRect(x - m(3.3) + i * m(1.1), y - m(3.4), m(1.1), m(.6)); } b.fillStyle = '#5b3a1e'; b.fillRect(x - m(2.4), y - m(1), m(1.8), m(.2)); b.fillStyle = '#1f6fb2'; b.beginPath(); b.arc(x + m(1.6), y - m(4.3), m(.7), 0, TAU); b.fill(); b.fillStyle = '#fff'; b.fillRect(x + m(1.45), y - m(4.6), m(.3), m(.6)); break;
      case 'lancha': { const dx = Math.sin(t * .2 * o.v + o.o) * m(4); b.fillStyle = '#ffffff'; b.beginPath(); b.moveTo(x + dx - m(2.4), y - m(.2)); b.lineTo(x + dx + m(2.4), y - m(.2)); b.lineTo(x + dx + m(1.6), y + m(.4)); b.lineTo(x + dx - m(1.8), y + m(.4)); b.closePath(); b.fill(); b.fillStyle = '#ff6b5a'; b.fillRect(x + dx - m(.6), y - m(.9), m(1.2), m(.7)); break; }
      case 'isla': b.fillStyle = '#3e6b4a'; b.beginPath(); b.ellipse(x, y, m(14), m(5), 0, Math.PI, 0); b.fill(); b.fillStyle = '#2f5a3a'; b.beginPath(); b.ellipse(x - m(4), y - m(3), m(5), m(3), 0, 0, TAU); b.fill(); break;
      case 'casa': { b.fillStyle = o.col; b.fillRect(x - m(3.2), y - m(5), m(6.4), m(5)); b.fillStyle = '#b5543a'; b.fillRect(x - m(3.6), y - m(5.6), m(7.2), m(.7)); b.fillStyle = '#ffffff'; b.fillRect(x - m(2.4), y - m(4.2), m(1.4), m(1.6)); b.fillRect(x + m(1), y - m(4.2), m(1.4), m(1.6)); b.fillStyle = o.zoc; b.fillRect(x - m(3.2), y - m(1.4), m(6.4), m(1.4)); b.fillStyle = shade(o.zoc, -.3); for (let i = 0; i < 4; i++) b.fillRect(x - m(2.8) + i * m(1.6), y - m(1.1), m(.9), m(.8)); b.fillStyle = '#5b3a1e'; b.fillRect(x - m(.5), y - m(2.6), m(1), m(2.6)); break; }
      case 'mirador': b.fillStyle = '#8a5a32'; b.fillRect(x - m(4), y - m(1.2), m(8), m(.3)); for (let i = -4; i <= 4; i += 2) b.fillRect(x + m(i), y - m(1.2), m(.2), m(1.2)); b.fillStyle = '#56c7ff'; b.fillRect(x - m(1.5), y - m(2.6), m(.6), m(1.4)); b.fillStyle = '#ff6b5a'; b.fillRect(x + m(1), y - m(2.4), m(.6), m(1.2)); break;
      case 'arco': { b.fillStyle = '#0a2342'; b.fillRect(x - m(5.6), y - m(5.6), m(.45), m(5.6)); b.fillRect(x + m(5.15), y - m(5.6), m(.45), m(5.6)); b.fillStyle = '#9bd341'; b.fillRect(x - m(5.8), y - m(6.6), m(11.6), m(1.3)); if (m(1) > 2) { b.fillStyle = '#0a2342'; b.font = '800 ' + Math.max(5, m(.8)) + 'px Titulos,sans-serif'; b.textAlign = 'center'; b.fillText(o.txt, x, y - m(5.7)); } break; }
    }
  },
  hoja(b, x, y, k, t) { const m = v => v * k; if (m(1) < .4) return; b.fillStyle = '#9bd341'; b.beginPath(); b.ellipse(x, y - m(.5 + Math.sin(t * 4 + x) * .1), m(.3), m(.18), .6, 0, TAU); b.fill(); },
  hueco(b, x, y, k) { const m = v => v * k; b.fillStyle = '#2b2d31'; b.beginPath(); b.ellipse(x, y, m(.5), m(.16), 0, 0, TAU); b.fill(); },
  carro(b, c, x, y, k) {
    const m = v => v * k, chiva = c.k === 'chiva', moto = c.k === 'moto', w = chiva ? 2.5 : moto ? .7 : 1.8, h = chiva ? 3.1 : moto ? 1.4 : 1.45;
    b.fillStyle = 'rgba(0,0,0,.25)'; b.fillRect(x - m(w / 2 + .1), y - m(.15), m(w + .2), m(.3));
    if (chiva) { const fr = ['#ffc93c', '#ff6b5a', '#56c7ff', '#9bd341']; for (let i = 0; i < 4; i++) { b.fillStyle = fr[i]; b.fillRect(x - m(w / 2), y - m(h) + i * m(h / 4), m(w), m(h / 4) + .5); } b.fillStyle = '#7a4a22'; b.fillRect(x - m(w / 2 + .1), y - m(h + .4), m(w + .2), m(.45)); b.fillStyle = '#cfe6fa'; b.fillRect(x - m(w / 2 - .2), y - m(h * .78), m(w - .4), m(.7)); }
    else if (moto) { b.fillStyle = '#1d1f24'; b.fillRect(x - m(.12), y - m(.7), m(.24), m(.7)); b.fillStyle = c.col; b.fillRect(x - m(.3), y - m(1.3), m(.6), m(.7)); b.fillStyle = '#f5c400'; b.beginPath(); b.arc(x, y - m(1.45), m(.2), 0, TAU); b.fill(); }
    else { b.fillStyle = c.col; b.fillRect(x - m(w / 2), y - m(h * .62), m(w), m(h * .62)); b.fillRect(x - m(w * .38), y - m(h), m(w * .76), m(h * .42)); b.fillStyle = '#2b3442'; b.fillRect(x - m(w * .32), y - m(h * .93), m(w * .64), m(h * .3)); b.fillStyle = c.dir > 0 ? '#c0392b' : '#fff3a0'; b.fillRect(x - m(w / 2 - .05), y - m(h * .45), m(.3), m(.16)); b.fillRect(x + m(w / 2 - .35), y - m(h * .45), m(.3), m(.16)); }
  },
  /* la bici de espaldas: rueda de atrás, cuadro, piernas que pedalean, la espalda con la camiseta y el casco */
  ciclista(b, x, y, k, fase, giro, v) {
    const m = q => q * k, me = Art.me(), cas = me.cap || '#ffffff', lean = giro * .12;
    b.save(); b.translate(x, y); b.rotate(lean);
    b.fillStyle = 'rgba(0,0,0,.28)'; b.beginPath(); b.ellipse(0, 0, m(.5), m(.14), 0, 0, TAU); b.fill();
    b.fillStyle = '#1b1f27'; b.fillRect(-m(.06), -m(.66), m(.12), m(.66));
    b.fillStyle = PAL.vd; b.fillRect(-m(.05), -m(.95), m(.1), m(.35));
    const p1 = Math.sin(fase), p2 = -p1; b.fillStyle = me.pants || '#2a3b5c';
    b.fillRect(-m(.2), -m(1.12) + m(.12) * p1, m(.13), m(.5)); b.fillRect(m(.07), -m(1.12) + m(.12) * p2, m(.13), m(.5));
    b.fillStyle = me.shoes || '#111'; b.fillRect(-m(.21), -m(.66) + m(.12) * p1, m(.15), m(.09)); b.fillRect(m(.06), -m(.66) + m(.12) * p2, m(.15), m(.09));
    b.fillStyle = me.shirt || PAL.vd; b.beginPath(); b.roundRect(-m(.26), -m(1.68), m(.52), m(.62), m(.1)); b.fill();
    b.fillStyle = me.skin || '#e0ac83'; b.fillRect(-m(.36), -m(1.62), m(.1), m(.3)); b.fillRect(m(.26), -m(1.62), m(.1), m(.3));
    b.fillStyle = '#30343c'; b.fillRect(-m(.42), -m(1.36), m(.84), m(.05));
    b.fillStyle = me.skin || '#e0ac83'; b.fillRect(-m(.07), -m(1.76), m(.14), m(.1));
    b.fillStyle = cas; b.beginPath(); b.ellipse(0, -m(1.9), m(.16), m(.14), 0, 0, TAU); b.fill(); b.fillStyle = '#ffffff66'; b.fillRect(-m(.04), -m(2.02), m(.08), m(.1));
    b.fillStyle = '#ff3b2f'; b.fillRect(-m(.05), -m(.98), m(.1), m(.06));   // la luz de atrás
    if (v > 12) { b.strokeStyle = '#ffffff55'; b.lineWidth = 1; for (const s of [-1, 1]) { b.beginPath(); b.moveTo(s * m(.7), -m(1.2)); b.lineTo(s * m(1.1), -m(.9)); b.stroke(); } }
    b.restore();
  }
};
/* ---------- el modo en el menú (tres tramos) y el registro de lo hecho ---------- */
class ModoGuatape extends ModeSub {
  constructor(role, turno, opt) {
    super(role, turno, opt); const T = GUA.TRAMOS[clamp(turno - 1, 0, 2)]; this.clock = T.hora; this.sub = new MGGuatape(this, { tramo: turno }); this.view = this.sub.view;
    this.goal('Llega a ' + T.meta, true, () => this.sub.llego, () => this.sub.llego ? '✓' : (Math.max(0, GUA.LARGO - this.sub.pos) / 1000).toFixed(1).replace('.', ',') + ' km');
    this.goal('Hidrátate en las 2 paradas', false, () => this.sub.paradas.length >= 2, () => this.sub.paradas.length + '/2');
    this.goal('Por la orilla: 2 pitos o menos', false, () => this.sub.llego && this.sub.pitos <= 2, () => this.sub.pitos + ' pitos');
  }
  update(dt) { super.update(dt); this.clock = this.sub.reloj; }
  end() { const el = $('#parada21'); if (el) el.hidden = true; return super.end(); }
}
JE.modos.registrar({ id: 'guatape', name: 'Ruta a Guatapé en bici', cls: ModoGuatape, emoji: '🏔️', icon: 'usuario', niveles: ['El Peñol → Mirador', 'Mirador → La Piedra', 'La Piedra → Guatapé'],
  desc: 'Cicloturismo por el embalse: 12 km de montaña, bosque y lagos en 3 tramos. Para en las fondas a tomar agua y aprende lo poco conocido de la Piedra y Guatapé.',
  how: ['Arrastra el dedo a los lados (o flechas) para ir por la berma, a la derecha de la línea blanca.', 'Arriba pedaleas más fuerte (y te da más sed); abajo frenas. Sin tocar nada, la bici pedalea suave sola.', 'En cada fonda (💧) toca «Parar a tomar agua»: sin agua pedaleas con la mitad de fuerza.', 'Ve por la orilla: los carros deben dejarte 1,5 m al adelantarte. Si vas por la mitad, pitan.'] });
LOGROS.push(
  { id: 'guatape', name: 'Cicloturista del embalse', desc: 'Llega en bici al malecón de Guatapé', icon: 'estrella', test: S => !!(S.guatape && Array.isArray(S.guatape.hechos) && S.guatape.hechos.includes(3)) },
  { id: 'guatape_datos', name: 'Lo poco conocido del embalse', desc: 'Para en las 6 fondas de la Ruta a Guatapé y escucha lo que saben', icon: 'estrella', test: S => !!(S.guatape && Array.isArray(S.guatape.datos) && S.guatape.datos.length >= 6) }
);
/* en el modo libre: el Taller también lleva a la ruta (como las carreras sin fin), y al volver sigues donde estabas */
(function () {
  const _abrir = Taller.abrir;
  Taller.abrir = function (M, res) {
    _abrir.call(this, M, res); const cic = $('#tlCic'); if (!cic || $('#tlGua')) return; const G = GUA.estado(), sig = clamp((Math.max(0, ...G.hechos) | 0) + 1, 1, 3), T = GUA.TRAMOS[sig - 1];
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'tlGua'; b.textContent = '🏔️ Ruta a Guatapé · ' + T.n; cic.after(b);
    b.onclick = () => { UI.closeModal(); if (Game.paused) Game.resume(); M.runSub(new MGGuatape(M, { tramo: sig }), fin => { const el = $('#parada21'); if (el) el.hidden = true; M.score += fin.score; Taller.abrir(M, (fin.llego ? '🏔️ ¡Llegaste a ' + fin.T.meta + '!' : '🏔️ Ruta a Guatapé') + ' · ' + fin.hojas + ' hojas · ' + fin.paradas.length + ' paradas · ' + fin.score + ' puntos'); }); };
  };
  const _dom = Game.dom; Game.dom = function (dt) { _dom.call(this, dt); document.body.classList.toggle('gua21', !!GUA.activo()); };
  /* la tarjeta de la parada no queda abierta al salir */
  for (const k of ['stop', 'finish', 'start']) { const f = Game[k]; Game[k] = function () { const el = $('#parada21'); if (el) el.hidden = true; return f.apply(this, arguments); }; }
})();
