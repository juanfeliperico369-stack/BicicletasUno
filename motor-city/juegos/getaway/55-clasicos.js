/* =====================================================================
   TURNO CERO · 4.1 · lo de los motores clásicos dentro del juego (MC.Sigilo, MC.Arcade, MC.VoxelSpace del motor)
   - Sigilo a lo Thief (Looking Glass, 1998):
       · la GEMA de luz: en lo oscuro, a la sombra de un edificio o lejos de los postes, los guardias te ven solo de cerca;
       · el RUIDO viaja por los callejones y dobla las esquinas: correr a pie o un motor cerca hace que un guardia vaya a mirar.
   - Dos cámaras nuevas en 🎥: 🏁 Arcade (la carretera pseudo-3D de OutRun) y ⛰️ Vuelo (el Voxel Space de Comanche).
   Archivo aditivo: envuelve Historia.sigilo sin reescribirlo. Las cámaras se suman en CAMARAS (90-inicio.js).
   ===================================================================== */
(function () {
  const css = document.createElement('style'); css.id = 'clasicosTC';
  css.textContent = '#gema{position:fixed;left:50%;bottom:calc(max(14px,env(safe-area-inset-bottom)) + 184px);width:26px;height:26px;margin-left:-13px;transform:rotate(45deg);border-radius:5px;z-index:19;pointer-events:none;'
    + 'background:radial-gradient(circle at 35% 35%,hsl(calc(215 - var(--g,1) * 167) 90% calc(18% + var(--g,1) * 56%)),hsl(calc(220 - var(--g,1) * 180) 80% calc(8% + var(--g,1) * 36%)));box-shadow:0 0 calc(var(--g,1) * 18px) hsl(45 100% 60% / calc(var(--g,1) * .9)),inset 0 0 0 2px #0009;transition:background .25s,box-shadow .25s}'
    + '#gema[hidden]{display:none}';
  document.head.appendChild(css);
  const gema = () => { let el = document.getElementById('gema'); if (!el) { el = document.createElement('div'); el.id = 'gema'; el.setAttribute('role', 'img'); el.hidden = true; document.body.appendChild(el); } return el; };
  let tGema = 0, tRuido = 0;
  const _sigilo = Historia.sigilo;
  Historia.sigilo = function (dt, d) {
    const C = G.cuerpo, E = this.est, pie = C.veh.clase === 'pie', v = Math.abs(C.v);
    /* la gema: luz del lugar (hora, sombra, postes, faros de los carros cercanos) y cómo te mueves */
    if ((tGema -= dt) <= 0) { tGema = .25;
      /* 4.3 (auditoría G-H26): los faros solo cuentan de noche y no atraviesan muros (DDA de Wolfenstein) */
      const noche = typeof MC.Cielo !== 'undefined' && G.reloj ? MC.Cielo.en(G.reloj.fecha, G.reloj.hora, G.clima).noche : (G.reloj && (G.reloj.hora < 6 || G.reloj.hora > 18.5) ? 1 : 0);
      const fuentes = noche < .05 ? [] : ((G.E && G.E.trafico) || []).filter(q => Math.hypot(q.x - C.x, q.y - C.y) < 40 && !MC.DDA.bloqueado(G.M, C.x, C.y, q.x, q.y)).map(q => ({ x: q.x + Math.cos(q.a || 0) * 8, y: q.y + Math.sin(q.a || 0) * 8, r: 14, k: .45 * noche }));
      G.luzAqui = MC.Sigilo.luz(G.M, C.x, C.y, { reloj: G.reloj, clima: G.clima, fuentes });
      G.gema = MC.Sigilo.gema(G.luzAqui, { vel: v, agachado: pie && v < 1 }); }   /* agachada = casi quieta (antes, caminar normal ya contaba como agachada) */
    for (const q of G.guardias) { if (q.vista0 == null) q.vista0 = q.vista || 24; q.vista = MC.Sigilo.alcance(q.vista0, G.gema ?? 1, E.alarma || q.estado === 'alerta'); }
    /* el ruido: pasos al correr, el motor del carro; viaja por donde hay paso */
    const fuerza = pie ? ((C.corriendo && v > 2.8) || v > 4.2 ? 16 : 0) : (v > .5 ? 22 + v * 1.5 : 10);   /* correr suena también en pasto o andén (auditoría G-H26) */
    if ((tRuido -= dt) <= 0 && fuerza > 0 && !E.alarma) { tRuido = .7;
      const R = MC.Sigilo.ruido(G.M, C.x, C.y, fuerza, { celda: 4 }); let oyo = false;
      for (const q of G.guardias) { if (q.fuera || q.estado === 'alerta' || R.oye(q.x, q.y) < .12) continue; q.ultima = { x: C.x, y: C.y }; q.busquedaT = 4; oyo = true; }
      if (oyo && !(E.oyoT > 0)) { E.oyoT = 3; G.ui.aviso(pie ? '👂 Un guardia oyó tus pasos: va a mirar' : '👂 Un guardia oyó el motor: va a mirar', 1300, 'oido'); } }
    if (E.oyoT > 0) E.oyoT -= dt;
    const r = _sigilo.call(this, dt, d);
    const el = gema(); el.hidden = false; el.style.setProperty('--g', (G.gema ?? 1).toFixed(2)); el.setAttribute('aria-label', 'Visibilidad ' + Math.round((G.gema ?? 1) * 100) + ' %');
    if (!leerG().gemaVista) { escribirG({ gemaVista: true }); G.ui.aviso('◆ La gema de luz: azul y apagada = no te ven; amarilla y brillante = te ven de lejos. Corre con ⚡ y te oyen', 4200, 'gema'); }
    return r;
  };
  /* 4.1 · mundo abierto desde el principio: el botón 📖 abre la historia cuando uno quiera (menuHistoria está en 90-inicio.js) */
  EXTRAS.ui.push(b => { b('historia', '📖', 'Historia', () => menuHistoria()); BOT.historia.hidden = true; });
  EXTRAS.hud.push(() => { if (BOT.historia) BOT.historia.hidden = G.modo !== 'libre' || !!G.contrato; });
  /* la gema solo se ve en las misiones de sigilo */
  EXTRAS.hud.push(() => { const el = document.getElementById('gema'); if (el && !(Historia.p && Historia.p.tipo === 'sigilo' && G.guardias.some(q => !q.fuera))) el.hidden = true; });
})();
