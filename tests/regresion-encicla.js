/* Regresiones de EnCicla (Claude, 21‑nov‑2026): los arreglos que Codex describió y no alcanzó a subir.
   Se llama desde tests/run.js con la página ya abierta: await require('./regresion-encicla')(p, ok) */
module.exports = async function (p, ok) {
  console.log('R) Regresiones de EnCicla (bici prestada, acceso sin bici, eléctrica, montar, hojas)');
  const r = await p.evaluate(async () => {
    const out = {}, espera = ms => new Promise(s => setTimeout(s, ms));
    /* hojas viejas de la trama → stats.leaves al importar */
    const d = JSON.parse(JSON.stringify(Save.data)); d.leaves = 7; const antes = Save.data.stats.leaves | 0;
    Save.importText(JSON.stringify({ save: d })); out.hojas = { migradas: (Save.data.stats.leaves | 0) - antes, quedan: Save.data.leaves | 0 };
    /* modo libre con bici de EnCicla a mediodía */
    const fecha = new Date(2026, 10, 18, 12, 0); const _now = Cal.now; Cal.now = () => new Date(fecha);
    JE.game.start('usuario', 1, { free: true, seed: 7, nov: NOVEDADES[0], bici: 'encicla' }); await espera(500); Cal.now = _now;
    const M = JE.game.mode, R = M.ride, P = R.p; out.ownBike = M.ownBike;
    /* acceso sin aparcamiento: a pie y sin bici parqueada, no hay «Ir a la bici» y nada se rompe */
    R.parked = null; P.veh = 'walk'; let roto = null; try { out.sinBici = M.actions().some(a => a.id === 'on'); } catch (e) { roto = String(e); } out.rotoSinBici = roto; P.veh = 'bike';
    /* bici prestada: cambia a monopatín, se aleja, no puede volver a montar la bici de lejos; de cerca sí */
    M.cambiarVehiculo('scooter'); out.parqueada = !!R.parked && R.parked.veh === 'bike'; const bx = R.parked && R.parked.x, by = R.parked && R.parked.y;
    P.x += 200 * WK; M.cambiarVehiculo('bike'); out.deLejos = P.veh;
    P.x = bx; P.y = by; M.cambiarVehiculo('bike'); out.deCerca = P.veh; out.parqueadaDespues = !!R.parked;
    /* gasto: la eléctrica gasta menos que la bici normal en la misma subida */
    const gasto = eb => { M.ebike = eb; R.ebike = eb; P.veh = 'bike'; M.energy = 100; R.sl = .05; const sv = M.tick.bind(M); for (let k = 0; k < 30; k++) { P.v = 8; R.sl = .05; sv(1 / 30); } return 100 - M.energy; };
    out.gastoBici = +gasto(0).toFixed(3); out.gastoElectrica = +gasto(1).toFixed(3); M.ebike = 0; R.ebike = 0;
    /* montar: subirse a pie avisa el evento «montar» */
    let ev = null; const _ev = Boleto.evento; Boleto.evento = (m, e) => { ev = e; return false; }; P.veh = 'bike'; R.getOff(); R.getOn(); Boleto.evento = _ev; out.montar = ev;
    JE.game.stop && JE.game.stop();
    return out;
  });
  ok(r.hojas.migradas === 7 && r.hojas.quedan === 0, 'las hojas viejas de la trama pasan a la tienda (' + JSON.stringify(r.hojas) + ')');
  ok(r.ownBike === false && r.sinBici === false && !r.rotoSinBici, 'a pie sin bici parqueada no hay «Ir a la bici» y nada se rompe');
  ok(r.parqueada && r.deLejos !== 'bike' && r.deCerca === 'bike' && !r.parqueadaDespues, 'la bici de EnCicla queda parqueada en la vía y solo se monta de cerca');
  ok(r.gastoElectrica < r.gastoBici * .6, 'la eléctrica gasta menos energía que la bici en subida (' + r.gastoElectrica + ' contra ' + r.gastoBici + ')');
  ok(r.montar === 'montar', 'subirse a pie avisa el evento «montar» de los boletos');
};
