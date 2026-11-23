#!/usr/bin/env node
/* =====================================================================
   PRUEBA G5-05 · Guía sin flecha en 🎬 Modo cine (Ghost of Tsushima)
   Verifica en Chromium móvil (412×860):
   - Al activar G.cine con un destino (G.destinoLibre / G.objetivo):
     · el minimapa y la flecha HUD están ocultos (body.cine);
     · G.GuiaCine emite hojas en MC.Vida, hebras de brisa y palomas guía
       en MC.Vida.aves orientadas hacia el rumbo real del destino (< 0.45 rad);
     · funciona en carro y a pie;
     · al apagar Modo cine, deja de emitir y retira bandadas guía sin errores.
   Con MC_CAPTURAS_G505=<dir> guarda capturas antes (sin cine) y después (con guía cine).
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/home/antigravity/.cache/pw-node/node_modules/playwright'); }
const { chromium } = playwright;

const tc = path.join(RAIZ, 'dist/juegos/getaway.html');
if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html'); process.exit(1); }

const dirCap = process.env.MC_CAPTURAS_G505 || '';
if (dirCap) fs.mkdirSync(dirCap, { recursive: true });

const b = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
});
const p = await b.newPage({ viewport: { width: 412, height: 860 } });
const errs = [], red = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message));
p.on('request', r => { if (!r.isNavigationRequest() && !/^(file|data|blob):/.test(r.url())) red.push(r.url()); });

await p.goto(pathToFileURL(tc).href + '?portada');
await p.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 120000 });
await p.click('#bAbierto');
await p.waitForFunction(() => window.TURNO && TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
for (let i = 0; i < 8; i++) {
  const d = await p.$('.mcui .dialogo button');
  if (!d) break;
  await d.click().catch(() => {});
  await p.waitForTimeout(120);
}
/* Cuando se solicitan capturas, ubicar en el Centro de Medellín y esperar a que las regiones 3D estén listas (sin subir presupuesto) */
if (dirCap) {
  await p.evaluate(() => {
    const G = TURNO, C = G.cuerpo, M = G.M;
    if (M && typeof M.geoAMetros === 'function') {
      const p0 = M.geoAMetros(6.24921, -75.56502);
      const v = M.viaCercana ? M.viaCercana(p0.x, p0.y, 120) : p0;
      if (v) { C.x = v.x; C.y = v.y; C.a = v.ang ?? .45; C.v = 0; }
    }
    G.vistas.motor3d = 'gl';
    G.vistas.auto = false;
    G.vistas.reiniciarGL();
    G.vistaId = 'cenital';
    G.vistas.usar('cenital', G.E);
    for (let i = 0; i < 30; i++) G.camara.actualizar(1 / 60, C);
  });
  await p.waitForTimeout(4500);
}

/* Captura ANTES (modo normal con minimapa y flecha) si se pidió */
await p.evaluate(() => {
  const G = TURNO, C = G.cuerpo;
  for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo, .mcui .aviso')) m.remove();
  G.pausa = false;
  G.reloj.min = 10 * 60 + 30; G.reloj.vel = 0;
  G.cine = false;
  document.body.classList.remove('cine');
  G.destinoLibre = { x: C.x + Math.cos(C.a) * 160 + Math.sin(C.a) * 35, y: C.y + Math.sin(C.a) * 160 - Math.cos(C.a) * 35, nombre: 'Parque Berrío' };
});
await p.waitForTimeout(350);
if (dirCap) {
  await p.screenshot({ path: path.join(dirCap, 'guia_cine_antes_412x860.png') });
}

/* Activar Modo cine y verificar guía en carro */
const r = await p.evaluate(async () => {
  const G = TURNO, C = G.cuerpo;
  const cuadros = n => new Promise(q => { let i = 0; const f = () => (++i >= n ? q() : requestAnimationFrame(f)); requestAnimationFrame(f); });
  G.cine = true;
  document.body.classList.add('cine');
  const rumboReal = Math.atan2(G.destinoLibre.y - C.y, G.destinoLibre.x - C.x);
  G.GuiaCine.rafaga(true);
  await cuadros(4);
  const miniVis = getComputedStyle(document.querySelector('.mcui canvas.mini')).visibility;
  const palomaGuia = (MC.Vida.aves || []).find(a => a.guiaCine);
  const errRumboPaloma = palomaGuia ? Math.abs(Math.atan2(Math.sin(palomaGuia.a - rumboReal), Math.cos(palomaGuia.a - rumboReal))) : 99;
  const mCarro = Object.assign({}, G.GuiaCine.metricas);
  const posAntes = palomaGuia ? { x: palomaGuia.x, y: palomaGuia.y } : null;
  await cuadros(6);
  const avanzoPaloma = (palomaGuia && posAntes) ? Math.hypot(palomaGuia.x - posAntes.x, palomaGuia.y - posAntes.y) : 0;
  return {
    existe: !!G.GuiaCine,
    miniOculto: miniVis === 'hidden',
    hojasCarro: mCarro.hojasEmitidas,
    palomasCarro: mCarro.palomasEmitidas,
    hebrasCarro: mCarro.hebrasActivas,
    palomasActivas: mCarro.palomasActivas,
    errRumboPaloma: +errRumboPaloma.toFixed(3),
    avanzoPaloma: +avanzoPaloma.toFixed(2)
  };
});

/* Capturas DESPUÉS (Modo cine cenital 3D y ciudad3d) */
if (dirCap) {
  await p.evaluate(() => {
    TURNO.GuiaCine.rafaga(true);
    TURNO.GuiaCine.rafaga(false);
  });
  await p.waitForTimeout(260);
  await p.screenshot({ path: path.join(dirCap, 'guia_cine_despues_412x860.png') });
  await p.evaluate(() => {
    TURNO.vistaId = 'ciudad3d';
    TURNO.vistas.usar('ciudad3d', TURNO.E);
    for (let i = 0; i < 30; i++) TURNO.camara.actualizar(1 / 60, TURNO.cuerpo);
    TURNO.GuiaCine.rafaga(true);
    TURNO.GuiaCine.rafaga(false);
  });
  await p.waitForTimeout(450);
  await p.screenshot({ path: path.join(dirCap, 'guia_cine_ciudad3d_412x860.png') });
}

/* Probar también a pie y luego apagar Modo cine */
const extra = await p.evaluate(async () => {
  const G = TURNO, C = G.cuerpo;
  const cuadros = n => new Promise(q => { let i = 0; const f = () => (++i >= n ? q() : requestAnimationFrame(f)); requestAnimationFrame(f); });
  const antesPie = G.GuiaCine.metricas.hojasEmitidas;
  C.bajarse && C.bajarse('prueba');
  G.GuiaCine.rafaga(true);
  await cuadros(4);
  const pieActivo = G.GuiaCine.metricas.activo;
  const hojasPie = G.GuiaCine.metricas.hojasEmitidas;

  G.cine = false;
  document.body.classList.remove('cine');
  await cuadros(4);
  const apagado = !G.GuiaCine.metricas.activo && G.GuiaCine.metricas.palomasActivas === 0;
  return { pieActivo, hojasPie, antesPie, apagado };
});

errs.push(...await p.evaluate(() => (MC.errores || []).map(e => String(e.msg || e))));
await b.close();

const ok = r.existe && r.miniOculto && r.hojasCarro >= 2 && r.palomasCarro >= 3 && r.hebrasCarro >= 3 && r.palomasActivas >= 3 && r.errRumboPaloma < .45 && r.avanzoPaloma > .5 && extra.pieActivo && extra.hojasPie > extra.antesPie && extra.apagado && !red.length && !errs.length;
console.log((ok ? '✓' : '✗') + ' 🍃 G5-05 Guía sin flecha en Modo cine (hojas y palomas hacia el destino) · ' + JSON.stringify({ ...r, ...extra, red: red.length }) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
