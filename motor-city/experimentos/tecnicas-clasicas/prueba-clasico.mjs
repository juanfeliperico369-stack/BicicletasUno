import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const C = require('./mc-clasico.js');

/* 0. Verificar disciplina del motor: cero comentarios // de una linea */
const src = fs.readFileSync(new URL('./mc-clasico.js', import.meta.url), 'utf8');
const slashLines = src.split('\n').filter(l => /(^|[^:'"\\])\/\//.test(l) && !/https?:\/\//.test(l));
assert.equal(slashLines.length, 0, 'mc-clasico.js no debe tener comentarios //');

/* 1. RenderWare / GOAL StreamAnillo: presupuesto estricto y liberacion entre ciudades */
const stream = new C.StreamAnillo({ tamSector: 1000, presupuestoKB: 8192, radio: 1, ciudad: 'nueva_york' });
for (let km = 0; km < 40; km++) {
  const st = stream.actualizar(km * 420, km * 150, 28, 10, () => ({ kb: 1024, datos: true }));
  assert.ok(st.usadoKB <= 8192, `Supero presupuesto: ${st.usadoKB} KB`);
}
assert.ok(stream.stats.expulsiones > 0, 'Debe expulsar sectores viejos por LRU');
const liberado = stream.cambiarCiudad('medellin');
assert.ok(liberado > 0 && stream.usadoKB === 0, 'Cambiar de ciudad debe evacuar 100% de la previa');
console.log('✓ 1) RenderWare/GOAL StreamAnillo:', stream.stats, 'liberadoAlCambiarKB=', liberado);

/* 2. Silent Hill + Build Engine CulleoUrbano: recorte fuerte en canon de Manhattan */
const edificios = [];
for (let gx = -8; gx <= 8; gx++) {
  for (let gy = -8; gy <= 8; gy++) {
    if (gx === 0 && gy === 0) continue;
    edificios.push({ x: gx * 32, y: gy * 32, w: 22, l: 22, r: 14, h: 18 + ((Math.abs(gx * 7 + gy * 13)) % 55) });
  }
}
const culleo = new C.CulleoUrbano(96);
const sinCulleo = culleo.filtrar({ x: 0, y: 0, a: 0, z: 2.2 }, edificios, { frustum: false, niebla: false, oclusion: false });
const conCulleo = culleo.filtrar({ x: 0, y: 0, a: 0, z: 2.2 }, edificios, { frustum: true, niebla: true, oclusion: true, fogEnd: 210 });
assert.ok(conCulleo.descartadosPct >= 75, `Esperaba >=75% descartados, dio ${conCulleo.descartadosPct}%`);
assert.ok(conCulleo.dibujados < sinCulleo.dibujados, 'Oclusion + niebla debe reducir edificios dibujados');
console.log('✓ 2) Build + Silent Hill CulleoUrbano:', { total: conCulleo.total, enFrustum: conCulleo.enFrustum, dibujados: conCulleo.dibujados, descartadosPct: conCulleo.descartadosPct });

/* 3. Quake / id Tech PVSRejilla + RLE + LuzHorneada */
const W = 12, H = 12;
const blq = new Uint8Array(W * H);
for (let y = 2; y <= 9; y++) blq[y * W + 6] = 1; /* muro en medio */
const pvs = new C.PVSRejilla(W, H).construirDesdeBloqueo(blq, 10);
assert.equal(pvs.visible(5 * W + 2, 5 * W + 9), false, 'Un muro completo debe bloquear PVS');
assert.equal(pvs.visible(5 * W + 2, 5 * W + 4), true, 'Celdas abiertas deben verse en PVS');
const rle = pvs.comprimirFila(5 * W + 2);
const rec = pvs.descomprimirFila(rle);
const origBase = (5 * W + 2) * pvs.palabras;
for (let k = 0; k < pvs.palabras; k++) assert.equal(rec[k], pvs.bits[origBase + k], 'RLE debe ser exacto bit a bit');
const ao = C.hornearAOUrbano(edificios, 45);
assert.equal(ao.length, edificios.length);
assert.ok(ao.every(v => Number.isFinite(v) && v >= 0.34 && v <= 1.0), 'AO horneado debe quedar en [0.34, 1]');
console.log('✓ 3) Quake PVS + RLE + AO Horneado:', { rleBytes: rle.length, rawBytes: pvs.palabras * 4, aoMin: +Math.min(...ao).toFixed(2), aoMax: +Math.max(...ao).toFixed(2) });

/* 4. Comanche / Outcast VoxelTerreno (procedural + SRTM real MC4) */
const vt = new C.VoxelTerreno(128);
const buf = new Uint32Array(160 * 90);
const resV = vt.renderizar(buf, 160, 90, { x: 40, y: 40, z: 120, a: 0.4 });
assert.ok(resV.columnasPintadas > 200, 'VoxelTerreno debe proyectar columnas visibles');
const snapPath = new URL('./datos-reales-mc4.js', import.meta.url);
if (fs.existsSync(snapPath)) {
  const txt = fs.readFileSync(snapPath, 'utf8');
  const jsonStart = txt.indexOf('{');
  const parsed = JSON.parse(txt.slice(jsonStart, txt.lastIndexOf('}') + 1));
  vt.cargarDesdeSnapshot(parsed.relieves.guatape);
  const resReal = vt.renderizar(buf, 160, 90, { x: 52, y: 64, z: 170, a: 0.35 });
  assert.ok(resReal.columnasPintadas > 200, 'VoxelTerreno debe proyectar relieve SRTM real de Guatape');
  resV.srtmGuatapeCols = resReal.columnasPintadas;
}
console.log('✓ 4) Comanche/Outcast VoxelTerreno:', resV);

/* 5. Driver PS1 FisicaDriver + Burnout 3 PoolParticulas */
const fd = new C.FisicaDriver();
let maxPitch = 0, maxRoll = 0, maxDerrape = 0;
for (let i = 0; i < 60; i++) {
  const vel = i < 30 ? i * 0.9 : 27 - (i - 30) * 0.85;
  const ang = i * 0.06;
  const s = fd.paso(1 / 60, vel, ang, 0.8, i % 10 === 0 ? 0.5 : 0);
  assert.ok(Number.isFinite(s.pitch) && Number.isFinite(s.roll) && Number.isFinite(s.heave));
  maxPitch = Math.max(maxPitch, Math.abs(s.pitch));
  maxRoll = Math.max(maxRoll, Math.abs(s.roll));
  maxDerrape = Math.max(maxDerrape, s.derrape);
}
assert.ok(maxPitch > 0.02 && maxRoll > 0.02, 'Debe registrar cabeceo y balanceo');
const pool = new C.PoolParticulas(64);
for (let i = 0; i < 120; i++) pool.emitir(1, 0, 0, 1, 3, 2, 4, 0.5);
const act = pool.paso(0.1);
assert.equal(act, 64, 'El pool circular no debe exceder su capacidad fija');
console.log('✓ 5) Driver PS1 + Burnout Pool:', { maxPitch: +maxPitch.toFixed(3), maxRoll: +maxRoll.toFixed(3), maxDerrape: +maxDerrape.toFixed(2), activasPool: act });

/* 6. Shadow of the Colossus EscaladorDinamico */
const esc = new C.EscaladorDinamico({ metaMs: 16.6, inicial: 1.0 });
for (let i = 0; i < 20; i++) esc.medir(30); /* dispositivo lento */
const bajo = esc.medir(30);
assert.ok(bajo.escala < 0.9 && bajo.fog < 220, 'Debe reducir escala y niebla cuando sube el tiempo de cuadro');
for (let i = 0; i < 60; i++) esc.medir(9); /* dispositivo rapido */
const alto = esc.medir(9);
assert.ok(alto.escala > bajo.escala, 'Debe recuperar escala cuando sobra margen');
console.log('✓ 6) Shadow of the Colossus EscaladorDinamico:', { bajo, alto });

console.log('✓ TODAS LAS PRUEBAS DE TECNICAS CLASICAS PASARON · 6/6');
