/* =====================================================================
   ROTOS (4.5) · lo que un vehículo se lleva por delante: con lógica, no todo es pared
   - Una caneca, un cono, una valla, una banca, un hidrante, un paradero o un poste no frenan en seco al carro: si va lo bastante
     rápido para tumbarlo, lo tumba, pierde algo de velocidad (según la masa de lo que golpea) y sigue. Despacio, sí lo para.
   - Un arbusto se aplasta; un árbol grande, una roca grande, un muro y un edificio no se rompen nunca.
   - A pie y en bici no se rompe nada (se choca). La moto solo tumba lo liviano.
   - Lo roto queda registrado en el mundo (M._rotos): no se vuelve a dibujar de pie ni a chocar, y MC.Efectos dibuja los restos
     (el poste caído, la caneca regada, el chorro del hidrante). Evento: MC.on('rompe', { o, cuerpo, v }).
   ===================================================================== */
const ROMPE_V = { cono: 1, caneca: 2.5, arbusto: 1.5, valla: 3, banca: 4, hidrante: 5, paradero: 8, poste: 8.5 };   /* m/s mínimos para tumbarlo en carro */
const ROMPE_FRENA = { cono: .98, caneca: .93, arbusto: .9, valla: .86, banca: .8, hidrante: .7, paradero: .62, poste: .55 };   /* velocidad que queda */
const ROMPE_MOTO = new Set(['cono', 'caneca', 'arbusto', 'valla']);
const Rotos = {
  V: ROMPE_V,
  clave(p) { return p.t + ':' + Math.round(p.x * 2) + ',' + Math.round(p.y * 2); },
  esta(M, p) { return !!(M && M._rotos && p && p.t && M._rotos.has(Rotos.clave(p))); },
  /* ¿este cuerpo, a esta velocidad, tumba ese objeto? */
  puede(o, C) {
    const lim = o && ROMPE_V[o.t], cl = C.veh.clase; if (lim == null || cl === 'pie' || cl === 'rueda' || cl === 'agua') return false;
    if (cl === 'moto' && !ROMPE_MOTO.has(o.t)) return false;
    /* 4.7: el carro (o el camión) se lleva por delante lo liviano a cualquier velocidad, como en GTA; antes, parado frente a una caneca no
       podía pasar (necesitaba 2,5 m/s y no los alcanzaba porque la caneca lo frenaba). Lo anclado (hidrante, banca, paradero, poste) sigue pidiendo velocidad. */
    if ((cl === 'auto' || cl === 'pesado') && ROMPE_MOTO.has(o.t)) return Math.abs(C.v) >= .3 || Math.abs(C._vPedida || 0) > .3;
    return Math.abs(C.v) >= lim * (cl === 'pesado' ? .55 : 1);
  },
  romper(M, o, C) {
    if (!M || Rotos.esta(M, o)) return null; const v = Math.abs(C.v), r = { t: o.t, x: o.x, y: o.y, a: C.a, v, t0: MC.ahora ? MC.ahora() : Date.now(), dir: C.v >= 0 ? C.a : C.a + Math.PI };
    (M._rotos || (M._rotos = new Map())).set(Rotos.clave(o), r);
    const k = ROMPE_FRENA[o.t] ?? .8, masa = C.veh.masa || 1200; C.v *= 1 - (1 - k) * Math.min(1.4, 1500 / masa);
    if (C.eventos) C.eventos.push('rompe');
    MC.emit('rompe', { o: r, cuerpo: C, v });
    /* que no se acumule sin fin en una partida larga: los más viejos se olvidan (vuelven a aparecer de pie, como en GTA) */
    if (M._rotos.size > 400) M._rotos.delete(M._rotos.keys().next().value);
    return r;
  },
  lista(M) { return M && M._rotos ? [...M._rotos.values()] : []; },
  reparar(M) { if (M) M._rotos = null; }
};
MC.Rotos = Rotos;
