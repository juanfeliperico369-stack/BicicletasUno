/* =====================================================================
   MÚSICA PROCEDURAL · electrónica, techno, synthwave, rock, jazz y lo‑fi, más clásicos de dominio público adaptados
   - COMPOSITOR (puro y determinista, se prueba en Node): armonía por estilo (progresiones reales: I‑V‑vi‑IV, ii‑V‑I…),
     bajo (contratiempo electrónico, corcheas de rock, walking bass de jazz, notas largas de lo‑fi), batería por patrón
     de 16 pasos, voces de acordes (power chords, séptimas, novenas) y melodía.
   - CLÁSICOS (obras de dominio público, transcripción propia): Himno a la alegría y Para Elisa (Beethoven), Minueto en
     Sol (Petzold, del cuaderno de Ana Magdalena Bach), Canon (Pachelbel), Gimnopedia n.º 1 (Satie), En la gruta del
     rey de la montaña (Grieg) y La primavera (Vivaldi). El arreglista los reharmoniza y los lleva a cada estilo.
   - SINTETIZADOR (WebAudio, sin muestras ni internet): piano, pad, lead, bajo, guitarra distorsionada, órgano,
     batería sintetizada; lo‑fi con filtro, polvo de vinilo y vaivén; electrónica con «sidechain».
   - ADAPTATIVO: MC.Musica.adaptar({ velocidad, hora, clima, tension }) cambia estilo y energía según el juego.
   ===================================================================== */
const NOTA = n => { const m = n.match(/^([A-G])(#|b)?(-?\d)$/); return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
const ESCALA = { mayor: [0, 2, 4, 5, 7, 9, 11], menor: [0, 2, 3, 5, 7, 8, 10], dorica: [0, 2, 3, 5, 7, 9, 10], mixolidia: [0, 2, 4, 5, 7, 9, 10], pentatonica: [0, 3, 5, 7, 10], blues: [0, 3, 5, 6, 7, 10] };
/* clásicos: [nota MIDI | null (silencio), duración en tiempos] en compás 4/4 salvo que diga otra cosa */
const CLASICOS = {
  himno_alegria: { n: 'Himno a la alegría', autor: 'L. van Beethoven (1824)', tono: 60, modo: 'mayor', notas: [[64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [64, 1.5], [62, .5], [62, 2], [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [62, 1.5], [60, .5], [60, 2]] },
  para_elisa: { n: 'Para Elisa', autor: 'L. van Beethoven (1810)', tono: 57, modo: 'menor', notas: [[76, .5], [75, .5], [76, .5], [75, .5], [76, .5], [71, .5], [74, .5], [72, .5], [69, 1.5], [60, .5], [64, .5], [69, .5], [71, 1.5], [64, .5], [68, .5], [71, .5], [72, 1.5], [64, .5], [76, .5], [75, .5], [76, .5], [75, .5], [76, .5], [71, .5], [74, .5], [72, .5], [69, 1.5], [60, .5], [64, .5], [69, .5], [71, 1.5], [64, .5], [72, .5], [71, .5], [69, 2]] },
  minueto_sol: { n: 'Minueto en Sol', autor: 'C. Petzold (c. 1725)', tono: 55, modo: 'mayor', notas: [[74, 1], [67, .5], [69, .5], [71, .5], [72, .5], [74, 1], [67, 1], [67, 1], [76, 1], [72, .5], [74, .5], [76, .5], [78, .5], [79, 1], [67, 1], [67, 1], [72, 1], [74, .5], [72, .5], [71, .5], [69, .5], [71, 1], [72, .5], [71, .5], [69, .5], [67, .5], [66, 1], [67, .5], [69, .5], [71, .5], [67, .5], [69, 3]] },
  canon: { n: 'Canon', autor: 'J. Pachelbel (c. 1680)', tono: 62, modo: 'mayor', grados: [0, 4, 5, 2, 3, 0, 3, 4], notas: [[78, 2], [76, 2], [74, 2], [73, 2], [71, 2], [69, 2], [71, 2], [73, 2]] },
  gimnopedia: { n: 'Gimnopedia n.º 1', autor: 'E. Satie (1888)', tono: 62, modo: 'mayor', metro: 3, grados: [3, 0], notas: [[null, 3], [null, 3], [78, 1], [81, 1], [79, 1], [78, 1], [73, 1], [71, 1], [73, 1], [74, 1], [69, 3], [66, 3]] },
  rey_montana: { n: 'En la gruta del rey de la montaña', autor: 'E. Grieg (1875)', tono: 59, modo: 'menor', notas: [[71, .5], [73, .5], [74, .5], [76, .5], [78, .5], [74, .5], [78, 1], [77, .5], [73, .5], [77, 1], [76, .5], [72, .5], [76, 1], [71, .5], [73, .5], [74, .5], [76, .5], [78, .5], [74, .5], [78, .5], [83, .5], [81, .5], [78, .5], [74, .5], [78, .5], [81, 2]] },
  primavera: { n: 'La primavera', autor: 'A. Vivaldi (1725)', tono: 64, modo: 'mayor', notas: [[64, .5], [68, .5], [68, .5], [68, .5], [66, .25], [64, .25], [71, 1.5], [71, .25], [69, .25], [68, .5], [68, .5], [68, .5], [66, .25], [64, .25], [71, 1.5], [71, .25], [69, .25], [68, .5], [69, .25], [71, .25], [69, .5], [68, .5], [66, 2]] }
};
const ESTILOS = {
  electronica: { bpm: 124, swing: 0, modo: 'menor', prog: [[0, 'm7'], [5, 'maj7'], [3, 'maj7'], [4, '7']], bateria: { bombo: 'x...x...x...x...', caja: '....x.......x...', plato: '..x...x...x...x.', abierto: '' }, bajo: 'contra', acordes: 'pad', lead: 'lead', sidechain: true },
  techno: { bpm: 132, swing: 0, modo: 'menor', prog: [[0, 'm'], [0, 'm'], [6, 'maj'], [5, 'maj']], bateria: { bombo: 'x...x...x...x...', caja: '....x.......x...', plato: 'xxxxxxxxxxxxxxxx', abierto: '..x...x...x...x.' }, bajo: 'pulso', acordes: 'stab', lead: 'lead', sidechain: true },
  synthwave: { bpm: 100, swing: 0, modo: 'menor', prog: [[0, 'm'], [5, 'maj'], [2, 'maj'], [6, 'maj']], bateria: { bombo: 'x.......x.......', caja: '....x.......x...', plato: 'x.x.x.x.x.x.x.x.', abierto: '' }, bajo: 'octavas', acordes: 'pad', lead: 'lead' },
  rock: { bpm: 140, swing: 0, modo: 'mayor', prog: [[0, '5'], [4, '5'], [5, '5'], [3, '5']], bateria: { bombo: 'x.....x.x.......', caja: '....x.......x...', plato: 'x.x.x.x.x.x.x.x.', abierto: '' }, bajo: 'corcheas', acordes: 'guitarra', lead: 'guitarra_lead' },
  jazz: { bpm: 118, swing: .62, modo: 'mayor', prog: [[1, 'm7'], [4, '7'], [0, 'maj7'], [5, '7']], bateria: { bombo: 'x.........x.....', caja: '......x.......x.', plato: 'x..xx..xx..xx..x', abierto: '' }, bajo: 'walking', acordes: 'piano', lead: 'piano' },
  lofi: { bpm: 78, swing: .58, modo: 'mayor', prog: [[3, 'maj7'], [2, 'm7'], [1, 'm7'], [4, '7']], bateria: { bombo: 'x.....x...x.....', caja: '....x.......x...', plato: 'x.x.x.x.x.x.x.x.', abierto: '' }, bajo: 'largo', acordes: 'piano', lead: 'piano', lofi: true },
  clasica: { bpm: 84, swing: 0, modo: 'mayor', prog: [[0, 'maj'], [3, 'maj'], [4, 'maj'], [0, 'maj']], bateria: null, bajo: 'largo', acordes: 'cuerdas', lead: 'piano' }
};
const ACORDE = { maj: [0, 4, 7], m: [0, 3, 7], '5': [0, 7, 12], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], '7': [0, 4, 7, 10], m7b5: [0, 3, 6, 10], sus: [0, 5, 7] };
const Musica = {
  NOTA, ESCALA, CLASICOS, ESTILOS, ACORDE,
  /* acorde diatónico del grado (0..6) en la tonalidad: tríada o séptima según el modo */
  diatonico(tono, modo, grado, tipo) { const E = ESCALA[modo] || ESCALA.mayor, raiz = tono + E[grado % 7] + 12 * Math.floor(grado / 7); if (tipo) return { raiz, tipo }; const t = [0, 2, 4].map(i => E[(grado + i) % 7] + 12 * Math.floor((grado + i) / 7) - E[grado % 7]); return { raiz, tipo: t[1] === 3 && t[2] === 6 ? 'm7b5' : t[1] === 3 ? 'm' : 'maj' }; },
  /* armoniza un tema: por compás, el acorde diatónico que más notas del compás contiene */
  armonizar(tema, metro = 4) {
    if (tema.grados) return tema.grados.map(g => Musica.diatonico(tema.tono, tema.modo, g));
    const comp = [], E = ESCALA[tema.modo]; let t = 0, c = [];
    for (const [n, d] of tema.notas) { if (n != null) c.push(n); t += d; while (t >= metro - 1e-6) { comp.push(c); c = []; t -= metro; } }
    if (c.length) comp.push(c);
    return comp.map((notas, i) => { let best = 0, bv = -1; for (let gr = 0; gr < 7; gr++) { const A = Musica.diatonico(tema.tono, tema.modo, gr), set = ACORDE[A.tipo].map(x => (A.raiz + x) % 12), v = notas.filter(n => set.includes(n % 12)).length + (gr === 0 || gr === 4 ? .5 : 0) + (i === comp.length - 1 && gr === 0 ? 2 : 0); if (v > bv) { bv = v; best = gr; } } return Musica.diatonico(tema.tono, tema.modo, best); });
  },
  /* COMPONE: { estilo, tema (id de CLASICOS o null), compases, energia (0–1), semilla, tono } → { bpm, swing, eventos: [{ t, d, n, inst, v }] } (t y d en tiempos) */
  componer(op = {}) {
    const S = ESTILOS[op.estilo] || ESTILOS.electronica, r = mulberry32(op.semilla ?? 5), en = clamp(op.energia ?? .6, 0, 1), T = op.tema ? CLASICOS[op.tema] : null, metro = (T && T.metro) || 4;
    const tono = op.tono ?? (T ? T.tono : 57 + ((op.semilla ?? 5) % 7)), modo = T ? T.modo : S.modo;
    const acordes = T ? Musica.armonizar(T, metro) : S.prog.map(([g, tipo]) => Musica.diatonico(tono, modo, g, tipo)), compases = op.compases || Math.max(8, acordes.length * 2), ev = [];
    const pon = (t, d, n, inst, v) => { if (n == null || n < 24 || n > 108) return; ev.push({ t, d, n, inst, v: clamp(v, 0, 1) }); };
    for (let c = 0; c < compases; c++) {
      const A = acordes[c % acordes.length], base = c * metro, raiz = A.raiz % 12 + 36, voz = ACORDE[op.estilo === 'rock' ? '5' : A.tipo] || ACORDE.maj;
      /* acordes */
      if (S.acordes === 'pad' || S.acordes === 'cuerdas') for (const x of voz) pon(base, metro, A.raiz % 12 + 60 + x, S.acordes, .35 + en * .2);
      else if (S.acordes === 'stab') for (let s = 0; s < 4; s++) if (s % 2 || en > .5) for (const x of voz) pon(base + s + .5, .25, A.raiz % 12 + 60 + x, 'stab', .4);
      else if (S.acordes === 'guitarra') for (let s = 0; s < metro * 2; s++) for (const x of [0, 7, 12]) pon(base + s / 2, .45, raiz + 12 + x, 'guitarra', .5 + (s % 2 ? 0 : .15));
      else if (S.acordes === 'piano') { const ritmo = op.estilo === 'jazz' ? [0, 1.5, 2.5] : [0, 2.5]; for (const s of ritmo) for (const x of voz.concat(A.tipo.includes('7') ? [14] : [])) pon(base + s, op.estilo === 'lofi' ? 1.8 : .9, A.raiz % 12 + 60 + x, 'piano', .3 + en * .15); }
      /* bajo */
      const B = S.bajo;
      if (B === 'contra') for (let s = 0; s < 4; s++) pon(base + s + .5, .45, raiz, 'bajo', .7);
      else if (B === 'pulso') for (let s = 0; s < 16; s++) if (s % 4 !== 0) pon(base + s / 4, .2, raiz, 'bajo', .6);
      else if (B === 'octavas') for (let s = 0; s < 8; s++) pon(base + s / 2, .45, raiz + (s % 2 ? 12 : 0), 'bajo', .6);
      else if (B === 'corcheas') for (let s = 0; s < 8; s++) pon(base + s / 2, .45, raiz, 'bajo', .7);
      else if (B === 'walking') { const sig = acordes[(c + 1) % acordes.length].raiz % 12 + 36, E2 = ESCALA[modo]; for (let s = 0; s < metro; s++) { const n = s === 0 ? raiz : s === metro - 1 ? sig + (r() < .5 ? -1 : 1) : raiz + E2[(s * 2 + (r() * 2 | 0)) % E2.length]; pon(base + s, .9, n, 'bajo', .6); } }
      else pon(base, metro * .95, raiz, 'bajo', .55);
      /* batería (16 pasos por compás de 4; en 3/4, 12) */
      if (S.bateria && !(T && op.estilo === 'clasica')) { const pasos = metro * 4; for (const [pz, pat] of Object.entries(S.bateria)) for (let s = 0; s < pasos; s++) { if (pat[s % pat.length] !== 'x') continue; if (pz === 'plato' && en < .25 && s % 2) continue; if (pz === 'caja' && c % 8 === 7 && s > pasos - 4) continue; pon(base + s / 4, .1, { bombo: 36, caja: 38, plato: 42, abierto: 46 }[pz], pz, pz === 'bombo' ? .9 : .5 + r() * .15); } if (c % 8 === 7) for (let s = pasos - 4; s < pasos; s++) pon(base + s / 4, .1, 38, 'caja', .45 + s * .02); }
    }
    /* melodía: el tema clásico (repetido) o una melodía generada sobre la escala con motivos que se repiten */
    if (T) { const largo = T.notas.reduce((a, q) => a + q[1], 0), vueltas = Math.max(1, Math.floor(compases * metro / largo)); for (let k = 0; k < vueltas; k++) { let t = k * largo; for (const [n, d] of T.notas) { const nn = n == null ? null : n + (op.estilo === 'rock' || op.estilo === 'electronica' || op.estilo === 'techno' ? 0 : 0) + (tono - T.tono); pon(t, d * .92, nn, S.lead, .6 + en * .2); t += d; } } }
    else { const E2 = ESCALA[S.modo === 'menor' ? 'pentatonica' : 'mayor'], motivo = []; for (let i = 0; i < 8; i++) motivo.push([E2[(r() * E2.length) | 0] + (r() < .3 ? 12 : 0), r() < .3 ? 1 : .5]); for (let c = 0; c < compases; c++) { if (en < .35 && c % 2) continue; let t = c * metro; const var2 = c % 4 === 3; for (const [g, d] of motivo) { if (t >= (c + 1) * metro) break; if (r() < .25 + (1 - en) * .3) { t += d; continue; } pon(t, d * .9, tono + 12 + g + (var2 ? 2 : 0), S.lead, .55 + en * .2); t += d; } } }
    return { bpm: Math.round(S.bpm * (op.tempo || 1) * (T && op.estilo === 'clasica' ? .85 : 1)), swing: S.swing, lofi: !!S.lofi, sidechain: !!S.sidechain, metro, compases, eventos: ev.sort((a, b) => a.t - b.t), titulo: (T ? T.n + ' · ' : '') + op.estilo };
  },
  /* elige estilo y energía según el juego */
  adaptar({ velocidad = 0, hora = 12, clima = null, tension = 0, zona = '' } = {}) {
    const noche = hora < 6 || hora >= 20, lluvia = clima && clima.lluvia > .2, v = velocidad * 3.6;
    let estilo = tension > .6 ? (v > 60 ? 'techno' : 'rock') : v > 70 ? 'electronica' : v > 30 ? (noche ? 'synthwave' : 'electronica') : lluvia ? 'jazz' : noche ? 'lofi' : zona === 'centro' ? 'jazz' : 'lofi';
    return { estilo, energia: clamp(.25 + v / 120 + tension * .5, 0, 1) };
  },
  /* ---------- sintetizador (navegador) ---------- */
  ctx: null, sonando: null,
  _ctx() { if (!this.ctx) { const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext); if (!AC) return null; this.ctx = new AC(); this.salida = this.ctx.createGain(); this.salida.gain.value = .5; this.salida.connect(this.ctx.destination); } if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; },
  volumen(v) { if (this.salida) this.salida.gain.value = clamp(v, 0, 1); },
  /* toca una pieza compuesta en bucle; devuelve { parar } */
  tocar(op = {}) {
    const ac = this._ctx(); if (!ac) return null; this.parar(); const P = op.eventos ? op : Musica.componer(op), spb = 60 / P.bpm, largo = P.compases * P.metro, bus = ac.createGain(), filtro = ac.createBiquadFilter();
    filtro.type = 'lowpass'; filtro.frequency.value = P.lofi ? 2600 : 18000; bus.connect(filtro); filtro.connect(this.salida); let ruido = null;
    if (P.lofi) { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() < .0008 ? (Math.random() - .5) * .8 : (Math.random() - .5) * .015; ruido = ac.createBufferSource(); ruido.buffer = b; ruido.loop = true; const gr = ac.createGain(); gr.gain.value = .5; ruido.connect(gr); gr.connect(this.salida); ruido.start(); }
    const t0 = ac.currentTime + .1, est = { P, bus, filtro, ruido, vuelta: 0, idx: 0, t0, activo: true };
    const tiempo = t => { const b = Math.floor(t * 2) / 2, f = t * 2 - Math.floor(t * 2); return (b + (f >= .5 - 1e-6 && P.swing ? (P.swing - .5) * 1 + .5 : f) / 2) * spb; };
    const programar = () => { if (!est.activo) return; const ahora = ac.currentTime, hasta = ahora + .25;
      while (true) { const e = P.eventos[est.idx]; if (!e) { est.idx = 0; est.vuelta++; continue; } const tt = t0 + est.vuelta * largo * spb + (P.swing ? tiempo(e.t) : e.t * spb); if (tt > hasta) break; if (tt >= ahora - .05) this._nota(ac, bus, e, tt, e.d * spb, P); est.idx++; if (est.idx >= P.eventos.length) { est.idx = 0; est.vuelta++; } }
      est.timer = setTimeout(programar, 90); };
    programar(); this.sonando = est; MC.emit('musica', { titulo: P.titulo });
    return { parar: () => this.parar(), pieza: P };
  },
  parar() { const s = this.sonando; if (!s) return; s.activo = false; clearTimeout(s.timer); try { s.bus.disconnect(); if (s.ruido) s.ruido.stop(); } catch (e) { /* ya estaba */ } this.sonando = null; },
  _nota(ac, bus, e, t, d, P) {
    const hz = 440 * Math.pow(2, (e.n - 69) / 12), g = ac.createGain(), v = e.v * .5; g.connect(bus);
    const env = (a, dec, sus, rel) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.linearRampToValueAtTime(v * sus, t + a + dec); g.gain.setValueAtTime(v * sus, t + Math.max(a + dec, d)); g.gain.linearRampToValueAtTime(0, t + Math.max(a + dec, d) + rel); };
    const osc = (tipo, f, det = 0) => { const o = ac.createOscillator(); o.type = tipo; o.frequency.value = f; o.detune.value = det; o.start(t); o.stop(t + d + .6); return o; };
    const ruido = () => { const b = ac.createBuffer(1, ac.sampleRate * .3, ac.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = b; s.start(t); return s; };
    switch (e.inst) {
      case 'bombo': { const o = osc('sine', 150); o.frequency.exponentialRampToValueAtTime(42, t + .12); o.connect(g); g.gain.setValueAtTime(v * 1.6, t); g.gain.exponentialRampToValueAtTime(.001, t + .35); if (P.sidechain && bus.gain) { bus.gain.setValueAtTime(.35, t); bus.gain.linearRampToValueAtTime(1, t + .22); } break; }
      case 'caja': { const s = ruido(), f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; s.connect(f); f.connect(g); const o = osc('triangle', 190); o.connect(g); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .18); break; }
      case 'plato': case 'abierto': { const s = ruido(), f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000; s.connect(f); f.connect(g); g.gain.setValueAtTime(v * .35, t); g.gain.exponentialRampToValueAtTime(.001, t + (e.inst === 'abierto' ? .3 : .05)); break; }
      case 'bajo': { const o = osc(P.lofi ? 'sine' : 'sawtooth', hz), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; o.connect(f); f.connect(g); env(.005, .1, .7, .08); break; }
      case 'guitarra': case 'guitarra_lead': { const ws = ac.createWaveShaper(), cv = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; cv[i] = Math.tanh(x * 6); } ws.curve = cv; const o = osc('sawtooth', hz), o2 = osc('sawtooth', hz, 9), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3200; o.connect(ws); o2.connect(ws); ws.connect(f); f.connect(g); env(.005, .15, .6, .1); break; }
      case 'piano': { const o = osc('triangle', hz), o2 = osc('sine', hz * 2); const g2 = ac.createGain(); g2.gain.value = .25; o2.connect(g2); g2.connect(g); o.connect(g); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(v * .25, t + .4); g.gain.exponentialRampToValueAtTime(.001, t + d + .5); break; }
      case 'pad': case 'cuerdas': { for (const det of [-8, 0, 8]) osc('sawtooth', hz, det).connect((() => { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = e.inst === 'cuerdas' ? 2400 : 1400; f.connect(g); return f; })()); env(e.inst === 'cuerdas' ? .25 : .4, .3, .7, .6); g.gain.value = 0; break; }
      case 'stab': { osc('square', hz).connect(g); env(.003, .08, .2, .05); break; }
      default: { const o = osc('square', hz), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2600; o.connect(f); f.connect(g); env(.01, .1, .6, .12); }
    }
  }
};
MC.Musica = Musica;
