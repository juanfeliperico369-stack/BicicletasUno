#!/usr/bin/env node
/* 5.0 · MC.Dinamica: el manejo real del carro con números conocidos (Node, sin navegador).
   - 0 a 100 km/h y cambios de marcha; rpm dentro del motor; frenada de 100 a 0 ≈ v²/(2·μ·g) con la trompa que se hunde;
   - curva sostenida sin pasar del agarre (≤ μ·g); con el freno de mano la cola se suelta (ángulo de deriva grande);
   - con el joystick sobre una calle real: arranca, sigue la vía y da una curva de 90°;
   - choque contra un edificio: evento, rebote y sin quedar metido; golpe a un carro del tráfico: reparte el impulso;
   - en arcade no se usa; el tono del motor sale de las rpm (f = rpm/60 × cilindros/2).
   Uso: node pruebas/dinamica.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url);
let bien = 0, mal = 0; const ok = (c, msg, extra) => { (c ? bien++ : mal++); console.log((c ? '  ✓ ' : '  ✗ ') + msg + (extra !== undefined ? ' ' + JSON.stringify(extra) : '')); };
const ctx = { console, require, process, Buffer, TextDecoder, TextEncoder, performance, setTimeout }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dist/motor.js'), 'utf8'), ctx);
const MC = ctx.MC, cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades/medellin.json'), 'utf8')), M = new MC.Mundo(new Uint8Array(fs.readFileSync(path.join(RAIZ, 'datos/medellin/mundo.mc4'))), cfg);
const r1 = x => Math.round(x * 10) / 10;
/* el sedán de Turno Cero (Vega S4: 1.450 kg, 105 kW, 190 N·m), registrado como lo hace el juego */
const d = MC.Taller.disenar({ id: 'prueba_vega', n: 'Vega', tipo: 'carro', masa: 1450, potenciaKW: 105, parNm: 190, cd: .31, area: 2.1, mu: .95 });
const V = MC.Taller.registrar(d, { vmax: 32, acc: 4, largo: 4.65, ancho: 1.82 }) || MC.Vehiculos.get('prueba_vega');
const H = MC.Dinamica.hoja(MC.Vehiculos.get('prueba_vega'));
console.log('1) Hoja de manejo');
ok(H.masa > 1400 && H.kW === 105 && H.batalla > 2.5 && H.batalla < 3 && H.Iz > 2000 && H.Iz < 3500, 'masa, potencia, batalla e inercia de un sedán', { masa: H.masa, kW: H.kW, batalla: r1(H.batalla), Iz: Math.round(H.Iz) });
ok(H.final > 3 && H.final < 12, 'el desarrollo pone el tope en la última marcha cerca del corte', r1(H.final));

console.log('2) Recta: arranque, marchas y frenada (paso puro)');
const A0 = { mu: 1, crrExtra: 0, pend: 0, vlim: 32, potencia: 1 };
let D = MC.Dinamica.estado(), t = 0, cien = null, marchas = new Set(), rpmOk = true; const h = 1 / 240;
while (t < 25) { MC.Dinamica.paso(D, H, { thr: 1, freno: 0, rev: 0, delta: 0 }, A0, h); t += h; marchas.add(D.marcha); if (D.rpm < H.ralenti - 1 || D.rpm > H.rpmMax * 1.03) rpmOk = false; if (cien === null && D.u >= 27.78) cien = t; }
ok(cien !== null && cien > 3.5 && cien < 12, '0 a 100 km/h en un tiempo de sedán de juego (3,5 a 12 s)', cien && r1(cien));
ok(marchas.size >= 4 && rpmOk, 'cambia de marcha solo y las rpm quedan dentro del motor', [...marchas]);
ok(Math.abs(D.u - 32) < 1.5, 'llega a su tope (32 m/s) sin pasarse', r1(D.u));
D = MC.Dinamica.estado(); D.u = 27.78; let x = 0, cabMin = 0, frente = 0; t = 0;
while (D.u > 0 && t < 10) { const u0 = D.u; MC.Dinamica.paso(D, H, { thr: 0, freno: 1, rev: 0, delta: 0 }, A0, h); MC.Dinamica.resortes(D, H, h, false); x += (u0 + D.u) / 2 * h; t += h; cabMin = Math.min(cabMin, D.cab); if (D.ax < -5) frente++; }
const muJ = H.mu * MC.Dinamica.agarreJuego, teo = 27.78 ** 2 / (2 * Math.min(muJ, H.frenoG) * 9.81);
ok(x > teo * .85 && x < teo * 1.35, 'frena de 100 a 0 en ≈ v²/(2·μ·g)', { metros: r1(x), teoria: r1(teo) });
ok(cabMin < -.02 && frente > 50, 'al frenar el peso pasa adelante: la trompa se hunde', r1(cabMin * 57.3) + '°');

console.log('3) Curvas, agarre y freno de mano');
const curva = (mano, s = 2.2) => { const E = MC.Dinamica.estado(); E.u = 16; let ayMax = 0, der = 0; for (let i = 0; i < 240 * 3; i++) { MC.Dinamica.paso(E, H, { thr: .35, freno: 0, rev: 0, delta: .25, mano }, A0, h); der = Math.max(der, E.deriva); if (i > 240) ayMax = Math.max(ayMax, Math.abs(E.u * E.r)); } return { ay: r1(ayMax), deriva: r1(der * 57.3), u: r1(E.u) }; };
const c1 = curva(false), c2 = curva(true);
ok(c1.ay <= muJ * 9.81 * 1.15 && c1.deriva < 12, 'curva sostenida sin pasar del agarre (μ de juego ' + muJ.toFixed(2) + ')', c1);
ok(c2.deriva > 20, 'con el freno de mano la cola se suelta (derrape)', c2);
/* aceleración lateral real del cuerpo (D.ay), con poco acelerador: seco contra mojado o tierra (μ × 0,55) */
const lateral = mu => { const E = MC.Dinamica.estado(); E.u = 14; let ay = 0; for (let i = 0; i < 240 * 3; i++) { MC.Dinamica.paso(E, H, { thr: .15, delta: .2 }, Object.assign({}, A0, { mu }), h); if (i > 240) ay = Math.max(ay, Math.abs(E.ay)); } return r1(ay); };
const seco = lateral(1), mojado = lateral(.55);
ok(mojado < seco * .75, 'en piso mojado o tierra agarra menos de lado', { seco, mojado });

console.log('4) Con el joystick sobre una calle real (Medellín)');
MC.opciones.manejo = 'real';
const col = M.buscar('coltejer'); let via = null;
for (let k = 0; k < 400 && !via; k++) { const q = M.viaCercana(col.x + (k % 20 - 10) * 60, col.y + Math.floor(k / 20 - 10) * 60, 40, null); if (!q) continue; const C0 = new MC.Cuerpo(M, { x: q.x, y: q.y, a: q.ang, veh: 'prueba_vega' }); let libre = true; for (let s = 5; s <= 70 && libre; s += 5) libre = C0.puede(q.x + Math.cos(q.ang) * s, q.y + Math.sin(q.ang) * s); if (libre) via = q; }
ok(!!via, 'hay una calle recta y libre de 70 m cerca del Coltejer');
const C = new MC.Cuerpo(M, { x: via.x, y: via.y, a: via.ang, veh: 'prueba_vega' }); let cambios = 0;
for (let i = 0; i < 90; i++) { C.actualizar(1 / 30, { dir: { x: Math.cos(via.ang), y: Math.sin(via.ang), m: 1 } }); if (C.eventos.includes('cambio')) cambios++; }
ok(!!C._din && C.v > 8 && Math.abs(MC.angDif ? MC.angDif(C.a, via.ang) : 0) < .3, 'arranca con el joystick y va derecho por la vía (dinámica real)', { v: r1(C.v), marcha: C.marcha, rpm: Math.round(C.rpm) });
const a0 = C.a, obj = a0 + Math.PI / 2; let t90 = null;
for (let i = 0; i < 150; i++) { C.actualizar(1 / 30, { dir: { x: Math.cos(obj), y: Math.sin(obj), m: .7 } }); if (t90 === null && Math.abs(Math.atan2(Math.sin(C.a - obj), Math.cos(C.a - obj))) < .15) t90 = (i + 1) / 30; }
ok(t90 !== null && t90 < 3.5, 'da una curva de 90° cuando se le pide', t90 && r1(t90));

console.log('5) Choques');
const ed = M.edificiosEn(col.x - 300, col.y - 300, col.x + 300, col.y + 300).filter(e => e.h > 8);
let prueba = null; for (const e of ed) { const q = M.viaCercana(e.x, e.y, 30); if (!q) continue; const ang = Math.atan2(e.y - q.y, e.x - q.x), C1 = new MC.Cuerpo(M, { x: q.x, y: q.y, a: ang, veh: 'prueba_vega' }); if (C1.puede(q.x, q.y)) { prueba = { C1, ang }; break; } }
if (prueba) {
  const { C1, ang } = prueba; C1.v = 15; let choco = false, maxImp = 0;
  for (let i = 0; i < 90; i++) { C1.actualizar(1 / 30, { acel: .6 }); if (C1.eventos.includes('choque')) { choco = true; maxImp = Math.max(maxImp, C1.impacto); } }
  ok(choco && maxImp > 4, 'contra un edificio: choque con su golpe', r1(maxImp));
  ok(C1.puede(C1.x, C1.y), 'no queda metido en el edificio');
}
const C2 = new MC.Cuerpo(M, { x: via.x, y: via.y, a: via.ang, veh: 'prueba_vega' }), ag = { x: via.x + Math.cos(via.ang) * 14, y: via.y + Math.sin(via.ang) * 14, a: via.ang + Math.PI / 2, v: 0, tipo: 'carro' };
C2.obstaculos = () => [{ x: ag.x, y: ag.y, r: 1.2, motivo: 'un vehículo', ag }]; C2.v = 14; let golpe = false;
for (let i = 0; i < 45 && !golpe; i++) { C2.actualizar(1 / 30, { acel: .5 }); golpe = !!ag.golpe; }
ok(golpe && Math.hypot(ag.golpe.vx, ag.golpe.vy) > 3 && C2.v < 12, 'golpe a un carro del tráfico: lo corre y el jugador pierde velocidad', golpe ? { otro: r1(Math.hypot(ag.golpe.vx, ag.golpe.vy)), yo: r1(C2.v) } : null);

console.log('6) Arcade y sonido');
MC.opciones.manejo = 'arcade'; const C3 = new MC.Cuerpo(M, { x: via.x, y: via.y, a: via.ang, veh: 'prueba_vega' }); for (let i = 0; i < 30; i++) C3.actualizar(1 / 30, { acel: 1 });
ok(!C3._din && C3.v > 3, 'en arcade la dinámica real no se usa');
const S = MC.PersecucionAudio.motor({ rpm: 3000, cilindros: 4, activo: true, carga: 1 });
ok(Math.abs(S.agudo - 100) < .01 && S.volumen > .05, 'el tono del motor sale de las rpm (3.000 rpm, 4 cilindros → 100 Hz)', S);
const F = MC.Flex.valores({}); ok(F.manejo === 'real', 'en ⚙️ Flexibilidad, el manejo real es lo de fábrica');
console.log((mal ? '✗ ' : '✓ ') + 'Dinámica real: ' + bien + ' bien, ' + mal + ' mal');
process.exit(mal ? 1 : 0);
