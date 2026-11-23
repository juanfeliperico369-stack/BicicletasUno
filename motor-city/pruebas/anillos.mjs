#!/usr/bin/env node
/* 5.0 · G5-02 · Anillos de recoger y entregar en Mandados y EnCicla + controles de vuelo (jetpack y avioneta):
   - en Mandados: anillo proyectado de recoger (r = 22 m, #ffc23a) con progreso radial y cambio a entregar (r = 22 m, #3fae5a);
   - en EnCicla: anillo proyectado de tomar cicla (r = 16 m, #3fae5a) y devolver cicla (r = 14 m, #2dd4bf);
   - en vuelo (jetpack y avioneta): botones táctiles 🔼 Subir y 🔽 Bajar (≥ 48×48 px, ocultos en carro), ascenso/descenso real
     y cero solapamientos de HUD ni invasión de zona libre a 412×860. */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/home/antigravity/.cache/pw-node/node_modules/playwright'); }
const { chromium } = playwright;

const tc = path.join(RAIZ, 'dist/juegos/getaway.html');
if (!fs.existsSync(tc)) {
  console.log('· falta dist/juegos/getaway.html (node herramientas/construir.mjs)');
  process.exit(0);
}

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true });
const errs = [], red = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message));
p.on('request', r => {
  if (!r.isNavigationRequest() && !/^(file|data|blob):/.test(r.url())) red.push(r.url());
});

await p.goto((process.env.MC_PRUEBAS_URL ? new URL('dist/juegos/getaway.html', process.env.MC_PRUEBAS_URL).href : pathToFileURL(tc).href) + '?portada');
await p.waitForFunction(() => window.TURNO_LISTO);
await p.click('#bAbierto');
await p.waitForFunction(() => window.TURNO && TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
for (let i = 0; i < 8; i++) {
  const d = await p.$('.mcui .dialogo button');
  if (!d) break;
  await d.click().catch(() => {});
  await p.waitForTimeout(150);
}

const dirCap = process.env.MC_CAPTURAS_G502 || '';
if (dirCap) fs.mkdirSync(dirCap, { recursive: true });

/* 1. Verificar que en carro los botones de vuelo están ocultos */
const enCarro = await p.evaluate(() => {
  for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo, .mcui .aviso')) m.remove();
  const G = TURNO;
  G.cuerpo.setVeh(G.veh);
  if (G.AnillosVuelo) G.AnillosVuelo.actualizarHUD();
  const bS = document.getElementById('bSube'), bB = document.getElementById('bBaja');
  return {
    existeUI: !!(bS && bB),
    ocultosEnCarro: !!(bS && bB && (bS.hidden || bS.closest('[hidden]')) && (bB.hidden || bB.closest('[hidden]')))
  };
});

/* 2. Probar anillos de recoger y entregar en 📦 Mandados */
const mandados = await p.evaluate(async () => {
  const G = TURNO, M = G.Modos, espera = ms => new Promise(q => setTimeout(q, ms));
  if (!M.empezar('mandados')) return { ok: false };
  const m = M.m;
  /* Acercarse al anillo de recoger (fase 0) y medir vértices proyectados y progreso */
  Object.assign(G.cuerpo, { x: m.o.x + 3, y: m.o.y, v: 0 });
  G.camara.x = m.o.x; G.camara.y = m.o.y;
  await espera(450);
  const recoger = Object.assign({}, G.AnillosVuelo.estado);
  /* Completar la recogida para pasar a entregar (fase 1) */
  Object.assign(G.cuerpo, { x: m.o.x, y: m.o.y, v: 0 });
  await espera(1100);
  Object.assign(G.cuerpo, { x: m.d.x + 4, y: m.d.y, v: 0 });
  G.camara.x = m.d.x; G.camara.y = m.d.y;
  await espera(450);
  const entregar = Object.assign({}, G.AnillosVuelo.estado);
  return { ok: true, recoger, entregar };
});
if (dirCap) await p.screenshot({ path: path.join(dirCap, 'anillo_mandados_412x860.png') });

/* 3. Probar anillos de recoger y entregar en 🚲 EnCicla */
const encicla = await p.evaluate(async () => {
  const G = TURNO, M = G.Modos, espera = ms => new Promise(q => setTimeout(q, ms));
  if (!M.empezar('encicla')) return { ok: false };
  const m = M.m;
  Object.assign(G.cuerpo, { x: m.o.x + 2, y: m.o.y, v: 0 });
  G.camara.x = m.o.x; G.camara.y = m.o.y;
  await espera(260);
  const recoger = Object.assign({}, G.AnillosVuelo.estado);
  while (M.m === m && m.fase === 0) await espera(60);
  Object.assign(G.cuerpo, { x: m.d.x + 2, y: m.d.y, v: 0 });
  G.camara.x = m.d.x; G.camara.y = m.d.y;
  await espera(240);
  const entregar = Object.assign({}, G.AnillosVuelo.estado);
  M.terminar(null);
  return { ok: true, recoger, entregar };
});

/* 4. Probar botones 🔼 Subir y 🔽 Bajar con el 🚀 Jetpack y la 🛩️ Avioneta */
const vuelo = await p.evaluate(async () => {
  const G = TURNO, C = G.cuerpo, espera = ms => new Promise(q => setTimeout(q, ms));
  for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo, .mcui .aviso')) m.remove();

  /* Verificar que avioneta y avion están en el catálogo del motor y el menú de Laboratorio */
  const tieneAvioneta = !!MC.Vehiculos.get('avioneta') && !!MC.Vehiculos.get('avion');

  /* Equipar jetpack */
  C.setVeh('jetpack');
  C.z = 0; C.vz = 0; C.v = 0;
  G.AnillosVuelo.actualizarHUD();
  await espera(120);

  const bS = document.getElementById('bSube'), bB = document.getElementById('bBaja');
  const rS = bS.getBoundingClientRect(), rB = bB.getBoundingClientRect();
  const visibleJetpack = !bS.hidden && !bB.hidden && !bS.closest('[hidden]') && rS.width >= 48 && rS.height >= 48 && rB.width >= 48 && rB.height >= 48;

  /* Verificar zona libre y cero solapamientos de HUD a 412×860 con los botones de vuelo visibles */
  const invadeZonaLibre = MC.UI.verificar(G.ui);
  const cajas = [...document.querySelectorAll('.mcui button:not([hidden]), .mcui canvas.mini:not([hidden])')]
    .filter(el => !el.closest('[hidden]'))
    .map(el => el.getBoundingClientRect())
    .filter(r => r.width > 4 && r.height > 4);
  let solapa = 0;
  for (let i = 0; i < cajas.length; i++) {
    for (let j = i + 1; j < cajas.length; j++) {
      const a = cajas[i], b = cajas[j];
      const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      if (ix * iy > 16) solapa++;
    }
  }

  /* Mantener oprimido 🔼 Subir en jetpack */
  bS.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await espera(900);
  const zJetpackSube = +C.z.toFixed(2);
  bS.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

  /* Mantener oprimido 🔽 Bajar en jetpack */
  bB.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await espera(550);
  const zJetpackBaja = +C.z.toFixed(2);
  bB.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

  /* Equipar avioneta y mantener oprimido 🔼 Subir (debe despegar y ganar altitud) */
  C.setVeh('avioneta');
  C.z = 0; C.vz = 0; C.v = 0;
  G.AnillosVuelo.actualizarHUD();
  bS.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await espera(1100);
  const zAvionetaSube = +C.z.toFixed(2), vAvioneta = +C.v.toFixed(1);
  bS.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

  bB.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await espera(500);
  const zAvionetaBaja = +C.z.toFixed(2);
  bB.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

  return {
    tieneAvioneta,
    visibleJetpack,
    invadeZonaLibre: invadeZonaLibre.length,
    hudSolapa: solapa,
    zJetpackSube,
    zJetpackBaja,
    zAvionetaSube,
    vAvioneta,
    zAvionetaBaja
  };
});
if (dirCap) await p.screenshot({ path: path.join(dirCap, 'controles_vuelo_412x860.png') });

errs.push(...await p.evaluate(() => MC.errores.map(e => String(e.msg || e))));
await b.close();

const ok = enCarro.existeUI && enCarro.ocultosEnCarro
  && mandados.ok
  && mandados.recoger.activo && mandados.recoger.tipo === 'recoger' && mandados.recoger.dentro && mandados.recoger.verticesProyectados >= 20 && mandados.recoger.progreso > 0
  && mandados.entregar.activo && mandados.entregar.tipo === 'entregar' && mandados.entregar.dentro && mandados.entregar.verticesProyectados >= 20
  && encicla.ok
  && encicla.recoger.activo && encicla.recoger.tipo === 'recoger' && encicla.recoger.dentro && encicla.recoger.verticesProyectados >= 20
  && encicla.entregar.activo && encicla.entregar.tipo === 'entregar' && encicla.entregar.dentro && encicla.entregar.verticesProyectados >= 20
  && vuelo.tieneAvioneta && vuelo.visibleJetpack
  && vuelo.invadeZonaLibre === 0 && vuelo.hudSolapa === 0
  && vuelo.zJetpackSube > 2 && vuelo.zJetpackBaja < vuelo.zJetpackSube
  && vuelo.vAvioneta >= 22 && vuelo.zAvionetaSube > 1 && vuelo.zAvionetaBaja < vuelo.zAvionetaSube
  && !red.length && !errs.length;

console.log((ok ? '✓' : '✗') + ' 🎯 G5-02 Anillos de recoger/entregar (Mandados y EnCicla) y controles de vuelo (jetpack y avioneta) · ' + JSON.stringify({ enCarro, mandados, encicla, vuelo, red: red.length }) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
