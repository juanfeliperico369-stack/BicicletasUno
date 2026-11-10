/* =====================================================================
   BOT DE PRUEBAS: juega partidas automáticas y busca errores
   (excepciones, NaN, bicis que aparecen o desaparecen, partidas que no terminan)
   ===================================================================== */
const Bot = JE.bot = {
  async run(o = {}) {
    const n = o.n || 27, err = o.err != null ? o.err : .08, dt = 1 / 30, maxT = o.maxT || 600;
    const rep = { games: [], errs0: JE.errors.length, t0: performance.now() }, backup = JSON.stringify(Save.data), wasHeadless = JE.headless;
    JE.headless = true; const roles = o.roles || ROLES.map(r => r.id).concat(['carrera']);
    for (let i = 0; i < n; i++) {
      const roleId = roles[i % roles.length], turno = o.turno || (1 + Math.floor(i / roles.length) % 3), seed = ((o.seed || 20261104) + i * 7919) >>> 0, NOVS = NOVEDADES.concat(NOV_EXTRA), nov = NOVS[i % NOVS.length];
      const g = { roleId, turno, seed, nov: nov.id, issues: [] };
      try {
        const perks = i % 4 === 1 ? ['llantas', 'sonrisa', 'llave'] : i % 4 === 3 ? ['tinto', 'camion', 'chaleco'] : [];
        const M = new MODE_CLASS[roleId](ROLE[roleId], turno, { seed, nov, perks, wet: i % 3 === 0 });
        const tot0 = M.sim ? M.sim.count() : null; let acc = 0, steps = 0, lastStation = null;
        while (!M.done && M.t < maxT) {
          if (M.ride && !M.sub) M.bot(err); else if ((acc += dt) >= .3) { acc = 0; M.bot(err); }
          M.update(dt); steps++;
          if (steps % 30 === 0) {
            if (!isFinite(M.score)) g.issues.push('puntaje no finito');
            if (M.ride) { const P = M.ride.p; if (!isFinite(P.x) || !isFinite(P.y)) g.issues.push('posición NaN'); if (P.x < 0 || P.y < 0 || P.x > MW * TS || P.y > MH * TS) g.issues.push('fuera del mapa'); }
            if (M.sim) { const c = M.sim.count(); if (c !== tot0) { g.issues.push('bicis ' + tot0 + '→' + c + ' en t=' + Math.round(M.t)); break; } if (M.sim.st.some(s => s.bikes < 0 || s.bikes > s.cap + 30)) g.issues.push('estación con bicis imposibles'); }
            if (o.render && steps % 90 === 0) this.renderFrame(M);
          }
          if (g.issues.length > 3) break;
        }
        if (!M.done) g.issues.push('no terminó en ' + maxT + ' s');
        const res = M.result();
        if (!isFinite(res.score) || res.stars < 0 || res.stars > 3 || res.goals.length !== 3) g.issues.push('resultado inválido');
        Object.assign(g, { score: res.score, stars: res.stars, pass: res.pass, t: Math.round(M.t), goals: res.goals.map(x => x.ok ? 1 : 0).join('') });
      } catch (e) { g.issues.push('EXCEPCIÓN: ' + e.message + ' · ' + String(e.stack || '').split('\n').slice(1, 3).join(' | ')); }
      rep.games.push(g); if (o.onProgress) o.onProgress(i + 1, n);
      await new Promise(r => setTimeout(r, 0));
    }
    rep.ms = Math.round(performance.now() - rep.t0); rep.jsErrors = JE.errors.slice(rep.errs0);
    Save.data = JSON.parse(backup); JE.headless = wasHeadless; Input.botDir = null;
    rep.okAll = rep.games.every(g => !g.issues.length) && !rep.jsErrors.length;
    return rep;
  },
  renderFrame(M) {
    const a = M.sub || M, v = a.view || { kind: 'map' }; View.setMode(v.kind, v.dw, v.dh);
    a.render(View); View.present(); View.ctx.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
    if (M.sub && M.ride) a.hud(View); else M.hud(View);
  },
  summary(rep) {
    const by = {};
    for (const g of rep.games) { const b = by[g.roleId] || (by[g.roleId] = { n: 0, pass: 0, stars: 0, score: 0, issues: 0, t: 0 }); b.n++; b.pass += g.pass ? 1 : 0; b.stars += g.stars || 0; b.score += g.score || 0; b.issues += g.issues.length; b.t += g.t || 0; }
    return by;
  },
  format(rep) {
    const by = this.summary(rep); let s = (rep.okAll ? '✓ SIN ERRORES' : '✗ HAY PROBLEMAS') + ' · ' + rep.games.length + ' partidas en ' + (rep.ms / 1000).toFixed(1) + ' s\n\n';
    for (const id in by) { const b = by[id]; s += ROLE[id].name.padEnd(11) + ' aprobó ' + b.pass + '/' + b.n + ' · ★ prom ' + (b.stars / b.n).toFixed(1) + ' · pts ' + Math.round(b.score / b.n) + ' · ' + Math.round(b.t / b.n) + ' s' + (b.issues ? ' · ' + b.issues + ' fallas' : '') + '\n'; }
    const bad = rep.games.filter(g => g.issues.length); if (bad.length) { s += '\nFALLAS:\n'; for (const g of bad) s += '· ' + g.roleId + ' T' + g.turno + ' (' + g.seed + '): ' + g.issues.join('; ') + '\n'; }
    if (rep.jsErrors.length) s += '\nERRORES JS:\n' + rep.jsErrors.join('\n');
    return s;
  }
};
