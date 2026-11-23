#!/usr/bin/env node
/* 5.0 · G5-01 · Vista «Historieta» (Chinatown Wars, Gemini Antigravity):
   - perfil de cámara 'historieta' en js/34-camara.js (~55° = 0.96 rad desde arriba, gira suave con el rumbo del carro);
   - opción 'historieta' en ⚙️ Flexibilidad → 🖼️ Gráficos (js/37-flexibilidad.js);
   - casco invertido 3D (THREE.BackSide con sesgo de profundidad) en VistaTres + colores planos (cel-shading)
     y contorno negro (#0c0e14) legible a 412×860;
   - cambio en caliente 'realistas' ⇄ 'historieta' sin destruir regiones 3D y cero solapamientos de HUD a 412×860. */
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

const b = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
});
const p = await b.newPage({ viewport: { width: 412, height: 860 } });
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

/* 1. Verificar perfil de cámara 'historieta' (~55°, giraRumbo: true) y rotación suave con el rumbo del carro */
const camInfo = await p.evaluate(() => {
  const P = MC.CAM_PERFIL && MC.CAM_PERFIL.historieta;
  if (!P) return { existe: false };
  const pitchGrados = Math.round(P.pitch * 180 / Math.PI);
  const cam = new MC.Camara({ x: 0, y: 0, zoom: 3.2 });
  cam.pantalla = [412, 860];
  cam.usarPerfil('historieta');
  const obj = { x: 100, y: 100, z: 0, a: 0, v: 14 };
  cam.actualizar(1 / 60, obj);
  const yaw0 = cam.yaw;
  obj.a = Math.PI / 2;
  for (let i = 0; i < 90; i++) cam.actualizar(1 / 60, obj);
  const yaw1 = cam.yaw;
  const difFinal = Math.abs(Math.atan2(Math.sin(yaw1 - (-(Math.PI / 2 + Math.PI / 2))), Math.cos(yaw1 - (-(Math.PI / 2 + Math.PI / 2)))));
  return {
    existe: true,
    pitchGrados,
    giraRumbo: !!P.giraRumbo,
    yaw0: +yaw0.toFixed(3),
    yaw1: +yaw1.toFixed(3),
    difFinal: +difFinal.toFixed(3)
  };
});

/* 2. Ubicar el vehículo en una calle rodeada de edificios 3D de Medellín y precalentar regiones de VistaTres */
const dirCap = process.env.MC_CAPTURAS_G501 || '';
if (dirCap) fs.mkdirSync(dirCap, { recursive: true });

await p.evaluate(() => {
  for (const m of document.querySelectorAll('.mcui .menu, .mcui .aviso')) m.remove();
  const G = TURNO, M = G.M;
  if (M && typeof M.geoAMetros === 'function') {
    const p0 = M.geoAMetros(6.24921, -75.56502);
    const q = M.viaCercana ? M.viaCercana(p0.x, p0.y, 120) : p0;
    if (q) {
      G.cuerpo.x = q.x;
      G.cuerpo.y = q.y;
      G.cuerpo.a = q.ang ?? .45;
    }
  }
  G.cuerpo.setVeh('taxi');
  G.cuerpo.v = 0;
  G.reloj.min = 10.5 * 60;
  G.reloj.vel = 0;
  G.camara.zoom = 2.6;
  MC.opciones.graficos = 'realistas';
  G.vistas.motor3d = 'gl';
  G.vistas.auto = false;
  G.vistas.calidad = 1;
  G.vistas.reiniciarGL();
  G.vistaId = 'cenital';
  G.vistas.usar('cenital', G.E);
  for (let i = 0; i < 30; i++) G.camara.actualizar(1 / 60, G.cuerpo);
});
await p.waitForTimeout(4500);
if (dirCap) await p.screenshot({ path: path.join(dirCap, 'historieta_antes_412x860.png') });

/* 3. Activar 'historieta' desde MC.Flex (⚙️ Gráficos → historieta) en caliente (sin destruir regiones 3D) */
const resHist = await p.evaluate(async () => {
  const G = TURNO, espera = ms => new Promise(q => setTimeout(q, ms));
  const defGraf = MC.Flex.DEF.find(d => d[0] === 'graficos');
  const tieneOpcion = !!(defGraf && defGraf[2].some(o => o[0] === 'historieta'));
  G.flex = MC.Flex.aplicar(Object.assign({}, G.flex, { graficos: 'historieta', calidad: 1 }), { vistas: G.vistas });
  G.vistas.motor3d = 'gl';
  for (let i = 0; i < 40; i++) G.camara.actualizar(1 / 60, G.cuerpo);
  await espera(1200);

  const M = MC.Historieta ? MC.Historieta.metricas : {};
  const C = G.E.camara;
  const dz = C.ojo[2] - C.blanco[2], dxy = Math.hypot(C.ojo[0] - C.blanco[0], C.ojo[1] - C.blanco[1]);
  const angCamGrados = Math.round(Math.atan2(dz, Math.max(1e-3, dxy)) * 180 / Math.PI);
  const cv = document.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const d = ctx.getImageData(0, Math.floor(h * .15), w, Math.floor(h * .7)).data;
  let tintaNegra = 0, total = 0;
  for (let i = 0; i < d.length; i += 16) {
    total++;
    if (d[i] <= 26 && d[i + 1] <= 28 && d[i + 2] <= 36) tintaNegra++;
  }
  const pctTintaLienzo = +(tintaNegra / Math.max(1, total) * 100).toFixed(2);

  /* Verificar cero solapamientos de HUD a 412×860 */
  const cajas = [...document.querySelectorAll('.mcui button:not([hidden]), .mcui .pildora:not([hidden])')]
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

  return {
    tieneOpcion,
    graficos: MC.opciones.graficos,
    angCamGrados,
    regiones3D: G.vistas.gl ? G.vistas.gl.regiones.size : 0,
    activo: !!M.activo,
    cascoTres: !!M.cascoTres,
    cascosRegiones: M.cascosRegiones || 0,
    gpu: !!M.gpu,
    pctContorno: M.pctContorno || 0,
    pixelesContorno: M.pixelesContorno || 0,
    coloresPlanos: M.coloresPlanos || 0,
    ms: M.msUltimoCuadro || 0,
    pctTintaLienzo,
    hudSolapa: solapa
  };
});

if (dirCap) {
  await p.screenshot({ path: path.join(dirCap, 'historieta_despues_dia_412x860.png') });
  await p.evaluate(() => { TURNO.reloj.min = 21 * 60; });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(dirCap, 'historieta_despues_noche_412x860.png') });
  await p.setViewportSize({ width: 860, height: 412 });
  await p.evaluate(() => { TURNO.reloj.min = 16.5 * 60; });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(dirCap, 'historieta_despues_dia_860x412.png') });
  await p.setViewportSize({ width: 412, height: 860 });
}

/* 4. Volver en caliente a 'realistas' y verificar que el efecto y los cascos se apagan limpiamente */
const vuelta = await p.evaluate(async () => {
  const G = TURNO, espera = ms => new Promise(q => setTimeout(q, ms));
  G.flex = MC.Flex.aplicar(Object.assign({}, G.flex, { graficos: 'realistas' }), { vistas: G.vistas });
  G.vistas.motor3d = 'gl';
  for (let i = 0; i < 30; i++) G.camara.actualizar(1 / 60, G.cuerpo);
  await espera(600);
  return {
    activo: !!(MC.Historieta && MC.Historieta.metricas.activo),
    cascoVis: !!(G.vistas.gl && G.vistas.gl._cascoDyn && G.vistas.gl._cascoDyn.visible)
  };
});

errs.push(...await p.evaluate(() => MC.errores.map(e => String(e.msg || e))));
await b.close();

const ok = camInfo.existe
  && camInfo.pitchGrados >= 52 && camInfo.pitchGrados <= 58
  && camInfo.giraRumbo
  && camInfo.difFinal < .08
  && resHist.tieneOpcion
  && resHist.graficos === 'historieta'
  && resHist.angCamGrados >= 46 && resHist.angCamGrados <= 58
  && resHist.activo
  && resHist.cascoTres
  /* 5.1: con el 3D realista el contorno va en la GPU (se mide la tinta en el lienzo); en la CPU, sus contadores */
  && (resHist.gpu ? resHist.pctTintaLienzo > .4 && resHist.ms < 12 : resHist.pctContorno > 1.2 && resHist.coloresPlanos > 10000)
  && resHist.hudSolapa === 0
  && !vuelta.activo
  && !vuelta.cascoVis
  && !red.length
  && !errs.length;

console.log((ok ? '✓' : '✗') + ' 🗯️ G5-01 Vista Historieta (Chinatown Wars): cámara 55° que gira con el carro, colores planos, casco invertido 3D y contorno negro a 412×860 · ' + JSON.stringify({ camInfo, resHist, vuelta, red: red.length }) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
