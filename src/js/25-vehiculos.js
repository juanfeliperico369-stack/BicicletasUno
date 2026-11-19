/* ---------- Vehículos: un solo registro para los de siempre y los que vienen ----------
   Los de siempre (la bici EnCicla, a pie y el camión de Balance) están aquí con sus cifras exactas.
   Uno nuevo (scooter, bici eléctrica, skate, patines, monopatín…) se suma con JE.vehiculos.registrar(id, def):
   lo que no diga lo toma de su base (la bici, salvo base: 'walk' o 'truck').
   def:
     n, corto, icon   nombre ('Scooter eléctrico'), nombre corto ('scooter') y emoji para avisos y botones
     fis              { max, acc, brk, coast }: velocidad máxima, arranque, frenada y rodada libre, en px/s del diseño de 8 px
                      (se multiplican por WK y por la velocidad elegida); { w0, w1 }: giro en rad/s parado y a toda marcha;
                      tw: inercia del giro en s; r: radio del choque en px. La bici: max 60, acc 30, brk 72, coast 40, w0 5, w1 2,7
     suelo(t)         multiplicador de la velocidad según la casilla (TT); por defecto el de su base (la bici: SURF)
     loma             [k, mín, máx]: en una pendiente p la velocidad se multiplica por clamp(1 − k·p, mín, máx)
     asist            1: no se frena en las subidas (motor eléctrico)
     solido(t)        true si no puede entrar a la casilla t; por defecto el de su base (SOLID; el camión: solo vías)
     via              1: solo por calles (las rutas y las salidas van por la vía, como el camión)
     spr(R)           lienzo visto desde arriba, con su conductor, mirando al norte y centrado (16 px por casilla, 1 m = 1,6 px)
     lado(b, x, y, R, yo, fase)   dibujo de lado en la vista panorámica; y es el suelo
     timbre           1: tiene timbre (botón y barra espaciadora)
     bajar            1: se puede bajar y dejar parqueado en el modo libre
     libre            1: se puede elegir en el modo libre (aparece el botón «Vehículo»)
     gasto            energía por segundo al moverse en el modo libre (la bici: 0,35 más la loma; a pie: 0,12)
   Guía completa: docs/INTEGRAR.md */
const VEHICULOS = {
  bike: { id: 'bike', n: 'Bici EnCicla', corto: 'bici', icon: '🚲', base: 1, fis: { max: 60, acc: 30, brk: 72, coast: 40, w0: 5, w1: 2.7, tw: .09, r: 2.5 }, suelo: t => SURF[t] || .5, loma: [2.2, .5, 1.32], timbre: 1, bajar: 1, libre: 1, spr: R => Art.rider(R.mode.shirt) },
  walk: { id: 'walk', n: 'A pie', corto: 'a pie', icon: '🚶', base: 1, fis: { max: 26, acc: 90, brk: 170, coast: 120, w0: 7.5, w1: 6, tw: .05, r: 2 }, suelo: t => WSURF[t] || .8, loma: [1.1, .6, 1.15], spr: R => Art.walker((R.stepT | 0) % 2) },
  truck: { id: 'truck', n: 'Camión de Balance', corto: 'camión', icon: '🚚', base: 1, fis: { max: 50, acc: 24, brk: 62, coast: 22, w0: 2.4, w1: 1.2, tw: .2, r: 3.4 * 1.4 }, suelo: () => 1, loma: [.9, .7, 1.12], solido: t => !TRUCK_OK[t], via: 1, spr: R => Art.truckTop(R.p.load, R.p.cap) }
};
const vehDef = id => VEHICULOS[id] || VEHICULOS.bike;   // uno desconocido se maneja como la bici, igual que antes
const vehVia = id => !!vehDef(id).via;
function vehStats(id, f) { const F = vehDef(id).fis; return { max: F.max * WK * f, acc: F.acc * WK * f, brk: F.brk * WK * f, coast: F.coast * WK * f, w0: F.w0, w1: F.w1, tw: F.tw, r: F.r }; }
JE.vehiculos = {
  lista: VEHICULOS, def: vehDef,
  registrar(id, def = {}) {
    if (!/^[a-z][a-z0-9_-]{1,23}$/.test(id || '')) throw new Error('vehículo: id inválido «' + id + '» (minúsculas, de 2 a 24)');
    if (VEHICULOS[id] && VEHICULOS[id].base) throw new Error('vehículo: «' + id + '» es de los de siempre; para su arte usa JE.vehiculos.mejorar');
    const b = VEHICULOS[def.base] || VEHICULOS.bike;
    const v = Object.assign({}, b, { timbre: 0, bajar: 1, libre: 0, corto: def.n || id }, def, { id, base: 0, de: b.id, fis: Object.assign({}, b.fis, def.fis) });
    if (!Array.isArray(v.loma) || v.loma.length !== 3) v.loma = b.loma;
    VEHICULOS[id] = v; return v;
  },
  /* el arte nuevo de uno de siempre (spr, lado, icon…) sin tocar su física: sus cifras están probadas */
  mejorar(id, parts = {}) { const v = VEHICULOS[id]; if (!v) throw new Error('vehículo: no existe «' + id + '»'); for (const k in parts) if (k !== 'fis' && k !== 'id' && k !== 'base') v[k] = parts[k]; return v; },
  usar(id, R) { R = R || (Game.mode && Game.mode.ride); if (!R || !VEHICULOS[id]) return false; R.setVeh(id); return true; },
  libres() { return Object.values(VEHICULOS).filter(v => v.libre); }
};
