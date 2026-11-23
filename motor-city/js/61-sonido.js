/* =====================================================================
   PAISAJE SONORO · el ambiente que se oye (sin un solo archivo de audio)
   Como en Cities: Skylines y Los Sims, la ciudad suena según dónde y cuándo: zumbido de tráfico que crece con las
   avenidas y la hora pico, pájaros al amanecer, chicharras y grillos de noche, lluvia y truenos, viento en lo alto,
   agua cerca del embalse o del río, y gente en las plazas. Todo sintetizado con WebAudio (ruido filtrado y pulsos).
   - plan(ctx): PURO (se prueba en Node): qué capas suenan y con qué volumen.
   - tocar(ctx) / actualizar(ctx) / parar(): el sonido en el navegador (empieza con un toque del jugador).
   ===================================================================== */
const Paisaje = {
  /* ctx: { hora, clima, ruido (0–1, del lugar), agua (m al agua), verde (0–1), gente (0–1), altura (m), velocidad (m/s), adentro } */
  plan(c = {}) {
    const h = c.hora ?? 12, cl = c.clima || {}, dentro = c.adentro ? .35 : 1, pico = Math.exp(-((h - 7.5) ** 2) / 2) + Math.exp(-((h - 18) ** 2) / 2.5);
    const noche = h < 5.5 || h > 19.5 ? 1 : h < 6.5 ? (6.5 - h) : h > 18.5 ? (h - 18.5) : 0;
    const L = {
      trafico: clamp((c.ruido ?? .3) * (.45 + .55 * Math.min(1, pico)) * (1 - noche * .55), 0, 1) * dentro,
      pajaros: clamp((c.verde ?? .3) * (Math.exp(-((h - 6.3) ** 2) / 1.2) + .25 * (h > 6 && h < 17 ? 1 : 0)) * (1 - (cl.lluvia || 0)), 0, 1) * dentro,
      grillos: clamp(noche * (.4 + (c.verde ?? .3) * .6) * (1 - (cl.lluvia || 0) * .8), 0, 1) * dentro,
      lluvia: clamp((cl.lluvia || 0) * (c.adentro ? .55 : 1), 0, 1), truenos: clamp(cl.tormenta || 0, 0, 1),
      viento: clamp(((cl.viento && cl.viento.v) || 2) / 12 + Math.max(0, ((c.altura ?? 1500) - 2000) / 1500) + (c.velocidad || 0) / 30, 0, 1) * dentro,
      agua: clamp(1 - (c.agua ?? 1e4) / 120, 0, 1) * dentro, gente: clamp((c.gente ?? 0) * (1 - noche * .7), 0, 1) * dentro
    };
    for (const k in L) L[k] = +L[k].toFixed(3); return L;
  },
  _ac: null, _capas: null,
  tocar(c) {
    if (typeof window === 'undefined') return null; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    if (!this._ac) this._ac = new AC(); const ac = this._ac; if (ac.state === 'suspended') ac.resume();
    if (!this._capas) {
      const ruido = (tipo) => { const n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); let ult = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; ult = tipo === 'cafe' ? (ult + .02 * w) / 1.02 : w; d[i] = tipo === 'cafe' ? ult * 3.5 : w; } const s = ac.createBufferSource(); s.buffer = b; s.loop = true; s.start(); return s; };
      const capa = (fuente, tipo, f, q) => { const fl = ac.createBiquadFilter(); fl.type = tipo; fl.frequency.value = f; fl.Q.value = q || .7; const g = ac.createGain(); g.gain.value = 0; fuente.connect(fl).connect(g).connect(ac.destination); return { g, fl }; };
      this._capas = { trafico: capa(ruido('cafe'), 'lowpass', 380), lluvia: capa(ruido('blanco'), 'bandpass', 2600, .5), viento: capa(ruido('cafe'), 'bandpass', 520, .4), agua: capa(ruido('blanco'), 'bandpass', 900, 1.2), gente: capa(ruido('cafe'), 'bandpass', 700, 1.8) };
      this._pulsos = setInterval(() => this._eventos(), 180);
    }
    return this.actualizar(c);
  },
  actualizar(c) { if (!this._capas) return null; const L = this.plan(c), ac = this._ac, t = ac.currentTime, V = { trafico: .22, lluvia: .2, viento: .12, agua: .1, gente: .08 }; for (const k in this._capas) this._capas[k].g.gain.setTargetAtTime(L[k] * V[k], t, .8); this._L = L; return L; },
  /* pájaros (silbidos que suben), grillos (pulsos agudos) y truenos (ruido grave con caída) */
  _eventos() {
    const ac = this._ac, L = this._L; if (!ac || !L) return; const t = ac.currentTime;
    const tono = (f0, f1, dur, vol, tipo = 'sine') => { const o = ac.createOscillator(), g = ac.createGain(); o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .05); };
    if (Math.random() < L.pajaros * .35) { const f = 2400 + Math.random() * 2400; tono(f, f * (1.2 + Math.random() * .5), .08 + Math.random() * .12, .025 * L.pajaros); }
    if (Math.random() < L.grillos * .6) for (let k = 0; k < 3; k++) setTimeout(() => tono(4300, 4250, .03, .012 * L.grillos, 'square'), k * 45);
    if (Math.random() < L.truenos * .01) tono(70, 35, 2.2, .25 * L.truenos, 'sawtooth');
  },
  parar() { if (this._pulsos) clearInterval(this._pulsos); this._pulsos = null; if (this._ac) { try { this._ac.close(); } catch (e) { /* ya cerrado */ } } this._ac = null; this._capas = null; }
};
MC.Paisaje = Paisaje;


/* C-M36 · Percepción acústica espacial de persecución: pura, sin samples, compatible con todos los juegos.
   La oclusión se estima contra huellas del mundo; no afirma simular propagación acústica real. */
const PersecucionAudio = {
  plan(op = {}) {
    const d = Math.max(0, Number(op.distancia) || 0), vr = clamp(Number(op.velocidadRadial) || 0, -90, 90),
      factor = clamp(343 / (343 + vr), .8, 1.25), at = 1 / (1 + (d / 95) ** 2),
      obst = op.ocluido ? .38 : 1, int = op.interior ? .75 : 1;
    return { doppler: factor, volumen: clamp((op.intensidad ?? 1) * at * obst * int, 0, 1), corte: op.ocluido ? 650 : op.interior ? 1600 : 3200 };
  },
  motor(op = {}) {
    /* 5.0 · con rpm (MC.Dinamica): el pulso de encendido f = rpm/60 × cilindros/2 (4 cilindros: 28 Hz en mínimo, 200 Hz a 6.000) y su octava abajo */
    if (op.rpm > 0) { const f = op.rpm / 60 * (op.cilindros || 4) / 2, k = clamp(op.rpm / (op.rpmMax || 6500), 0, 1), c = clamp(op.carga ?? 0, 0, 1);
      return { agudo: f, grave: f / 2, corte: 380 + k * 1500 + c * 700, volumen: op.activo ? .028 + k * .03 + c * .025 : 0, rpm: op.rpm }; }
    const v = Math.max(0, Math.abs(Number(op.velocidad) || 0)), a = clamp(Number(op.aceleracion) || 0, -1, 1),
      marcha = Math.min(5, Math.floor(v / 9)), rpm = clamp(.25 + ((v - marcha * 9) / 9) * .75, .25, 1);
    return { agudo: 42 + rpm * 70 + marcha * 6, grave: (42 + rpm * 70 + marcha * 6) / 2,
      corte: 500 + rpm * 900 + a * 400, volumen: op.activo ? .035 + rpm * .03 + Math.max(0, a) * .02 : 0 };
  },
  ocluido(mundo, a, b) {
    if (!mundo || typeof mundo.edificioEn !== 'function' || !a || !b) return false;
    const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.min(12, Math.max(2, Math.ceil(d / 14)));
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (mundo.edificioEn(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 0)) return true;
    }
    return false;
  }
};
MC.PersecucionAudio = PersecucionAudio;
