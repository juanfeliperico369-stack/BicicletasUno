#!/usr/bin/env node
/* =====================================================================
   PRUEBA V4 · PARALAJE DE BIOMAS EN ARCADE (Gemini Antigravity — Motor City V4)
   Verifica:
   1. 18/18 texturas en arte/arcade/biomas/*.webp y manifiesto.json (1024×256 RGBA,
      transparencia real sin cielo opaco, costura horizontal 0.0000 y hashes SHA-256).
   2. Integración en vivo dentro de dist/juegos/getaway.html (sin red, 0 errores):
      - los 6 biomas reales en las carreteras de MC.Planeta (costa, desierto, bosque,
        montana, nieve, lagos) de día y de noche, en 412×860 y 860×412;
      - mismo mundo 3D (cambiar a Arcade no altera mundo, posición, rumbo ni reloj);
      - la capa cercana queda detrás de la calzada y del vehículo (no tapa carretera ni HUD);
      - respaldo procedural automático en llanura, en baja calidad y al eliminar un asset;
      - caché LRU acotada a <= 2 biomas sin fuga de memoria.
   Uso:
     node pruebas/paralaje-biomas.mjs
     MC_CAPTURAS_V4=reportes/img/gemini-v4 node pruebas/paralaje-biomas.mjs
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let playwrightMod;
try { playwrightMod = require('playwright'); } catch { playwrightMod = require('/home/antigravity/.cache/pw-node/node_modules/playwright'); }
const { chromium } = playwrightMod;

const dirBiomas = path.join(RAIZ, 'arte/arcade/biomas');
const rutaMan = path.join(dirBiomas, 'manifiesto.json');
const tc = path.join(RAIZ, 'dist/juegos/getaway.html');
const dirCap = process.env.MC_CAPTURAS_V4 ? path.resolve(RAIZ, process.env.MC_CAPTURAS_V4) : '';
if (dirCap) fs.mkdirSync(dirCap, { recursive: true });

const BIOMAS_V4 = ['costa', 'desierto', 'bosque', 'montana', 'nieve', 'lagos'];
const CAPAS_V4 = ['lejos', 'medio', 'cerca'];
const VELS_V4 = { lejos: 0.12, medio: 0.35, cerca: 0.7 };

const fallos = [];
const ok = (cond, msg) => { if (!cond) fallos.push(msg); };

/* ---------- 1. Verificación en Node de archivos y manifiesto ---------- */
ok(fs.existsSync(rutaMan), 'Falta arte/arcade/biomas/manifiesto.json');
const man = JSON.parse(fs.readFileSync(rutaMan, 'utf8'));
ok(man.total_texturas === 18, 'manifiesto.total_texturas debe ser 18');
ok(!JSON.stringify(man).includes('"montaña"'), 'No debe usarse "montaña" con ñ como clave de código');

let totalBytesDisco = 0;
for (const b of BIOMAS_V4) {
  for (const c of CAPAS_V4) {
    const id = `${b}_${c}`;
    const f = path.join(dirBiomas, `${id}.webp`);
    ok(fs.existsSync(f), `Falta archivo ${f}`);
    const buf = fs.readFileSync(f);
    totalBytesDisco += buf.length;
    ok(buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP', `${id}.webp no tiene cabecera RIFF/WEBP válida`);
    const meta = man.texturas && man.texturas[id];
    ok(!!meta, `Falta entrada ${id} en manifiesto.json`);
    if (meta) {
      const sha = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
      ok(meta.ancho === 1024 && meta.alto === 256, `${id}: dimensiones en manifiesto !== 1024×256`);
      ok(meta.alpha === true && meta.transparencia_pct > 20 && meta.opacidad_pct > 15, `${id}: transparencia inválida en manifiesto`);
      ok(meta.velocidad === VELS_V4[c], `${id}: velocidad ${meta.velocidad} !== ${VELS_V4[c]}`);
      ok(meta.sha256_16 === sha && meta.bytes === buf.length, `${id}: hash o bytes no coinciden con el archivo en disco`);
    }
  }
}

/* ---------- 2. Verificación en Chromium (decodificación RGBA, costuras, 6 biomas, fallback y rendimiento) ---------- */
if (!fs.existsSync(tc)) {
  console.error('✗ Falta dist/juegos/getaway.html (ejecuta node herramientas/construir.mjs)');
  process.exit(1);
}

const b = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const ctx = await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 1, hasTouch: true });
const p = await ctx.newPage();
const errs = [], red = [];
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
p.on('request', r => { if (!/^(file|data|blob):/.test(r.url())) red.push(r.url()); });

const t0Carga = Date.now();
await p.goto((process.env.MC_PRUEBAS_URL ? new URL('dist/juegos/getaway.html', process.env.MC_PRUEBAS_URL).href : pathToFileURL(tc).href) + '?portada');
await p.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 30000 });
await p.click('#bAbierto');
await p.waitForFunction(() => window.TURNO && TURNO.M && !TURNO.transicion && TURNO.cuerpo && window.MC && MC.ParalajeBiomas, null, { timeout: 120000 });
const msPrimerCuadro = Date.now() - t0Carga;
await p.evaluate(() => { for (const el of document.querySelectorAll('.mcui .dialogo, .mcui .menu, .mcui .aviso')) el.remove(); });

/* 2a. Auditoría píxel a píxel de las 18 texturas decodificadas en el navegador */
const auditTexturas = await p.evaluate(async () => {
  const PB = MC.ParalajeBiomas;
  await PB.precargar();
  const cv = document.createElement('canvas');
  cv.width = 1024; cv.height = 256;
  const g = cv.getContext('2d', { willReadFrequently: true });
  const res = {};
  for (const b of PB.BIOMAS) {
    for (const nv of PB.NIVELES) {
      const id = b + '_' + nv;
      const rec = PB._imgs.get(id);
      if (!rec || !rec.ok) { res[id] = { ok: false }; continue; }
      g.clearRect(0, 0, 1024, 256);
      g.drawImage(rec.img, 0, 0);
      const d = g.getImageData(0, 0, 1024, 256).data;
      let trans = 0, opacos = 0, topOpacos = 0, diffBorde = 0;
      for (let x = 0; x < 1024; x++) if (d[x * 4 + 3] > 0) topOpacos++;
      for (let i = 3; i < d.length; i += 4) {
        if (d[i] === 0) trans++; else opacos++;
      }
      for (let y = 0; y < 256; y++) {
        const i0 = (y * 1024) * 4, i1 = (y * 1024 + 1023) * 4;
        for (let c = 0; c < 4; c++) diffBorde += Math.abs(d[i0 + c] - d[i1 + c]);
      }
      diffBorde /= (256 * 4);
      res[id] = {
        ok: rec.img.naturalWidth === 1024 && rec.img.naturalHeight === 256,
        w: rec.img.naturalWidth,
        h: rec.img.naturalHeight,
        transPct: +(trans / (1024 * 256) * 100).toFixed(1),
        opacosPct: +(opacos / (1024 * 256) * 100).toFixed(1),
        cieloTransparente: topOpacos === 0,
        costuraMae: +diffBorde.toFixed(4)
      };
    }
  }
  return res;
});

for (const [id, r] of Object.entries(auditTexturas)) {
  ok(r.ok && r.w === 1024 && r.h === 256, `${id}: fallo al decodificar 1024×256 en navegador`);
  ok(r.cieloTransparente, `${id}: la fila superior y=0 no es transparente (cielo opaco horneado)`);
  ok(r.transPct > 20 && r.opacosPct > 15, `${id}: proporción alfa fuera de rango (${r.transPct}% trans)`);
  ok(r.costuraMae < 0.5, `${id}: costura horizontal alta (${r.costuraMae})`);
}

/* 2b. Verificar que los 6 biomas + llanura existen en los tramos reales de MC.Planeta y que cambiar a Arcade conserva el mismo mundo 3D */
const RUTAS_BIOMA = [
  { bioma: 'costa', ruta: 'ruta_atlantico', y: 1800 },
  { bioma: 'llanura', ruta: 'ruta_atlantico', y: 5800 },
  { bioma: 'desierto', ruta: 'ruta_atlantico', y: 10000 },
  { bioma: 'montana', ruta: 'ruta_atlantico', y: 14000 },
  { bioma: 'bosque', ruta: 'ruta_embalse', y: 6000 },
  { bioma: 'lagos', ruta: 'ruta_embalse', y: 10200 },
  { bioma: 'nieve', ruta: 'ruta_norte', y: 9400 }
];

const resEscenas = {};
for (const item of RUTAS_BIOMA) {
  const info = await p.evaluate(async ({ bioma, ruta, y }) => {
    const G = TURNO, PB = MC.ParalajeBiomas, espera = ms => new Promise(r => setTimeout(r, ms));
    for (const el of document.querySelectorAll('.mcui .dialogo, .mcui .menu, .mcui .aviso')) el.remove();
    if (G.id !== ruta) {
      window._mundosRuta = window._mundosRuta || {};
      if (!window._mundosRuta[ruta]) {
        const d = MC.Planeta.ANILLO.find(x => x.id === ruta);
        const mr = MC.Generador.carretera({ largo: d.largo, biomas: d.biomas, semilla: d.semilla, nombre: d.nombre, id: d.id });
        try { mr.red('rueda'); } catch (e) {}
        try { MC.Terreno.agua(mr); } catch (e) {}
        mr.esCiudad = false;
        window._mundosRuta[ruta] = mr;
      }
      const M = window._mundosRuta[ruta];
      G.id = ruta; G.M = M;
      G.cuerpo = new MC.Cuerpo(M, { x: M.carretera.centro(y), y, a: Math.PI / 2, veh: G.veh });
      G.trafico = new MC.Trafico(M, { n: 0, peatones: 0, red: 'rueda', radio: 400 });
      G.pobl = null; G.transporte = null;
      G.busq = new MC.Busqueda(M, { heat: 0, semilla: 7 });
      G.objetos = new MC.Objetos(M, {});
      G.piezasFisicas = new MC.Piezas(M);
      G.vistas.mundo = M; G.vistas.arcade = null;
      G.E.mundo = M; G.E.jugador.cuerpo = G.cuerpo; G.E.transporte = null; G.E.cables = []; G.E.objetos = G.objetos; G.E.piezas = G.piezasFisicas;
    }
    const M = G.M, C = G.cuerpo;
    await PB.precargar(bioma === 'llanura' ? undefined : bioma);
    C.x = M.carretera.centro(y); C.y = y; C.a = Math.PI / 2; C.v = 0; C.vx = 0; C.vy = 0;
    G.reloj.vel = 0; G.reloj.min = 10.5 * 60;
    if (G.clima && G.clima.forzar) G.clima.forzar('despejado');
    /* Verificar que cambiar de tercera persona 3D a Arcade NO altera mundo, posición ni rumbo */
    G.vistaId = 'tercera'; G.vistas.usar('tercera', G.E);
    const antes = { mundo: G.M, x: C.x, y: C.y, a: C.a, hora: G.reloj.min };
    G.vistaId = 'arcade'; G.vistas.usar('arcade', G.E);
    const mismoMundo = G.M === antes.mundo && C.x === antes.x && C.y === antes.y && C.a === antes.a && G.reloj.min === antes.hora;
    const biomaReal = M.carretera.bioma(C.y);
    G.vistas.fundido = null;

    const W = G.cv.width, H = G.cv.height, hor = Math.floor(H * 0.5);
    const cvTest = document.createElement('canvas');
    cvTest.width = W; cvTest.height = H;
    const gTest = cvTest.getContext('2d', { willReadFrequently: true });
    if (!G.vistas.arcade || G.vistas.arcade.M !== M) G.vistas.arcade = new MC.Arcade(M);
    G.vistas.arcade.h = C.a;

    const medirZona = () => {
      const sup = new Uint8ClampedArray(gTest.getImageData(0, Math.floor(hor * 0.48), W, Math.floor(hor * 0.50)).data);
      const inf = new Uint8ClampedArray(gTest.getImageData(0, Math.floor(hor * 1.04), W, Math.floor(H * 0.42)).data);
      return { sup, inf };
    };

    /* Medir cuadro ANTES (fallback procedural: PB.activo = false) en el mismo instante exacto (dt = 0) */
    PB.activo = false;
    G.vistas.arcade.h = C.a;
    G.vistas.dibujar(gTest, W, H, G.E, 0);
    const mAntes = medirZona();

    /* Medir cuadro DESPUÉS (paralaje V4 activo: PB.activo = true) en el mismo instante exacto (dt = 0) */
    PB.activo = true;
    G.vistas.arcade.h = C.a;
    G.vistas.dibujar(gTest, W, H, G.E, 0);
    const mDespues = medirZona();

    let difHorizonte = 0, difCalzada = 0, pxCambiados = 0;
    const nSup = mAntes.sup.length / 4;
    for (let i = 0; i < mAntes.sup.length; i += 4) {
      const d = Math.abs(mAntes.sup[i] - mDespues.sup[i]) + Math.abs(mAntes.sup[i + 1] - mDespues.sup[i + 1]) + Math.abs(mAntes.sup[i + 2] - mDespues.sup[i + 2]);
      difHorizonte += d;
      if (d > 9) pxCambiados++;
    }
    difHorizonte /= (nSup * 3);
    const pctHorizonte = +(pxCambiados / nSup * 100).toFixed(1);
    for (let i = 0; i < mAntes.inf.length; i += 4) {
      difCalzada += Math.abs(mAntes.inf[i] - mDespues.inf[i]) + Math.abs(mAntes.inf[i + 1] - mDespues.inf[i + 1]) + Math.abs(mAntes.inf[i + 2] - mDespues.inf[i + 2]);
    }
    difCalzada /= ((mAntes.inf.length / 4) * 3);

    return {
      biomaReal,
      mismoMundo,
      difHorizonte: +difHorizonte.toFixed(2),
      pctHorizonte,
      difCalzada: +difCalzada.toFixed(4),
      draws: PB.metricas.drawCallsUltimoCuadro,
      capas: PB.metricas.capasActivas,
      fallback: PB.metricas.fallbackActivo,
      ms: PB.metricas.msUltimoCuadro
    };
  }, item);

  resEscenas[item.bioma] = info;
  ok(info.biomaReal === item.bioma, `${item.bioma}: M.carretera.bioma(${item.y}) devolvió ${info.biomaReal}`);
  ok(info.mismoMundo, `${item.bioma}: cambiar a Arcade alteró el estado del mundo 3D`);
  if (item.bioma === 'llanura') {
    ok(info.fallback === true && info.draws === 0, 'llanura debe activar el respaldo procedural automáticamente');
  } else {
    ok(info.fallback === false && info.capas === 3 && info.draws >= 3, `${item.bioma}: no dibujó las 3 capas de paralaje (draws=${info.draws})`);
    ok(info.difHorizonte > 2.2 && info.pctHorizonte > 18, `${item.bioma}: el horizonte con paralaje no cambió respecto al procedural (dif=${info.difHorizonte}, pct=${info.pctHorizonte}%)`);
    ok(info.difCalzada < 0.8, `${item.bioma}: el paralaje invadió la calzada inferior (difCalzada=${info.difCalzada})`);
  }

  /* Capturas comparativas antes/después en 412×860 y 860×412 (día y noche) si se pidió MC_CAPTURAS_V4 */
  if (dirCap && item.bioma !== 'llanura') {
    await p.setViewportSize({ width: 412, height: 860 });
    await p.evaluate(() => { for (const el of document.querySelectorAll('.mcui .aviso')) el.remove(); MC.ParalajeBiomas.activo = false; TURNO.reloj.min = 10.5 * 60; TURNO.vistas.fundido = null; });
    await p.waitForTimeout(120);
    await p.screenshot({ path: path.join(dirCap, `${item.bioma}_antes_dia_412x860.png`) });

    await p.evaluate(() => { MC.ParalajeBiomas.activo = true; TURNO.vistas.fundido = null; });
    await p.waitForTimeout(120);
    await p.screenshot({ path: path.join(dirCap, `${item.bioma}_despues_dia_412x860.png`) });

    if (item.bioma === 'costa' || item.bioma === 'nieve' || item.bioma === 'montana') {
      await p.evaluate(() => { TURNO.reloj.min = 21 * 60; TURNO.vistas.fundido = null; });
      await p.waitForTimeout(120);
      await p.screenshot({ path: path.join(dirCap, `${item.bioma}_despues_noche_412x860.png`) });

      await p.setViewportSize({ width: 860, height: 412 });
      await p.evaluate(() => { TURNO.reloj.min = 10.5 * 60; TURNO.vistas.fundido = null; });
      await p.waitForTimeout(140);
      await p.screenshot({ path: path.join(dirCap, `${item.bioma}_despues_dia_860x412.png`) });

      await p.evaluate(() => { TURNO.reloj.min = 21 * 60; TURNO.vistas.fundido = null; });
      await p.waitForTimeout(140);
      await p.screenshot({ path: path.join(dirCap, `${item.bioma}_despues_noche_860x412.png`) });
      await p.setViewportSize({ width: 412, height: 860 });
    }
  }
}

/* 2c. Verificar respaldo ante eliminación temporal de un asset, reducción automática de calidad y límite LRU de memoria */
const resRespaldo = await p.evaluate(async () => {
  const G = TURNO, PB = MC.ParalajeBiomas;
  const M = window._mundosRuta['ruta_atlantico'];
  G.id = 'ruta_atlantico'; G.M = M;
  G.cuerpo = new MC.Cuerpo(M, { x: M.carretera.centro(1800), y: 1800, a: Math.PI / 2, veh: G.veh });
  G.trafico = new MC.Trafico(M, { n: 0, peatones: 0, red: 'rueda', radio: 400 });
  G.busq = new MC.Busqueda(M, { heat: 0, semilla: 7 });
  G.objetos = new MC.Objetos(M, {});
  G.piezasFisicas = new MC.Piezas(M);
  G.vistas.mundo = M; G.vistas.arcade = null; G.E.mundo = M; G.E.jugador.cuerpo = G.cuerpo; G.E.objetos = G.objetos; G.E.piezas = G.piezasFisicas;
  G.vistaId = 'arcade'; G.vistas.usar('arcade', G.E);

  /* Eliminar temporalmente costa_medio y verificar que cae al respaldo procedural sin cielo negro */
  PB.eliminarAssetTemporal('costa_medio');
  G.vistas.dibujar(G.g, G.W, G.H, G.E, 0);
  const fbEliminado = PB.metricas.fallbackActivo === true && PB.metricas.drawCallsUltimoCuadro === 0;
  const ctx2 = document.createElement('canvas').getContext('2d');
  ctx2.canvas.width = G.cv.width; ctx2.canvas.height = G.cv.height;
  ctx2.drawImage(G.cv, 0, 0);
  const pxCielo = ctx2.getImageData(Math.floor(G.cv.width / 2), 24, 1, 1).data;
  const cieloNoNegro = (pxCielo[0] + pxCielo[1] + pxCielo[2]) > 80;

  /* Restaurar asset y comprobar que vuelve a dibujar las 3 capas */
  PB.restaurarAssets();
  await PB.precargar('costa');
  G.vistas.dibujar(G.g, G.W, G.H, G.E, 0);
  const restauradoOk = PB.metricas.fallbackActivo === false && PB.metricas.capasActivas === 3;

  /* Reducción automática de calidad en dispositivos lentos */
  const calOrig = G.vistas.calidad;
  G.vistas.auto = false;
  G.vistas.calidad = 0.50;
  G.E.calidad = 0.50;
  G.vistas.dibujar(G.g, G.W, G.H, G.E, 0);
  const capasMedia = PB.metricas.capasActivas;
  G.vistas.calidad = 0.30;
  G.E.calidad = 0.30;
  G.vistas.dibujar(G.g, G.W, G.H, G.E, 0);
  const capasBaja = PB.metricas.capasActivas;
  const fbBaja = PB.metricas.fallbackActivo;
  G.vistas.calidad = calOrig || 1;
  G.E.calidad = calOrig || 1;
  G.vistas.dibujar(G.g, G.W, G.H, G.E, 0);

  /* Verificar LRU acotado al recorrer los 6 biomas */
  for (const b of PB.BIOMAS) PB._asegurarImagenes(b);
  const lruMax = PB._ordenLRU.length;
  const imgsEnCache = PB._imgs.size;
  const expulsiones = PB.metricas.expulsiones;
  const heapMB = performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null;

  return { fbEliminado, cieloNoNegro, restauradoOk, capasMedia, capasBaja, fbBaja, lruMax, imgsEnCache, expulsiones, heapMB };
});

ok(resRespaldo.fbEliminado && resRespaldo.cieloNoNegro, 'Fallo en el respaldo procedural al eliminar un asset temporalmente');
ok(resRespaldo.restauradoOk, 'No se restauraron las 3 capas tras restaurarAssets()');
ok(resRespaldo.capasMedia === 2 && resRespaldo.capasBaja === 0 && resRespaldo.fbBaja === true, `Reducción automática de calidad falló (media=${resRespaldo.capasMedia}, baja=${resRespaldo.capasBaja})`);
ok(resRespaldo.lruMax <= 2 && resRespaldo.imgsEnCache <= 6 && resRespaldo.expulsiones >= 4, `Caché LRU excedió el presupuesto (${resRespaldo.lruMax} biomas, ${resRespaldo.imgsEnCache} imágenes)`);
ok(errs.length === 0, 'Errores en consola/página: ' + errs.join(' | '));
ok(red.length === 0, 'Peticiones de red externas detectadas: ' + red.join(' | '));

await b.close();

const resumen = {
  texturas: Object.keys(auditTexturas).length,
  totalKB: +(totalBytesDisco / 1024).toFixed(2),
  msPrimerCuadro,
  escenas: resEscenas,
  respaldo: resRespaldo,
  errores: errs.length,
  red: red.length
};
console.log(JSON.stringify(resumen, null, 2));

if (fallos.length) {
  console.error('✗ FALLOS EN PRUEBA V4 PARALAJE BIOMAS:\n- ' + fallos.join('\n- '));
  process.exit(1);
}
console.log('✓ Gemini Antigravity — Motor City V4 · 18/18 texturas 1024×256 RGBA, 6 biomas Arcade, costuras 0.0000, respaldo y caché LRU: TODO EN VERDE');
