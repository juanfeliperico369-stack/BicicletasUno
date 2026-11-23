#!/usr/bin/env node
/* OpenAI GPT-6 · rendimiento de terreno frío a lo largo de 2 km reales en mapa.
 * node tests/benchmark-2km-gpt6.mjs [--cpu=4] [--km=2] [--step=12] [--assert]
 * NOTA: es un recorrido automatizado de cámara sobre una vía real, NO mide
 * habilidad del jugador ni movimiento con joystick ni un Android físico.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const args = process.argv.slice(2);
const arg = (k, def) => {
  const v = args.find(x => x.startsWith('--' + k + '='));
  return v ? +v.slice(k.length + 3) : def;
};
const cpu = arg('cpu', 4), km = arg('km', 2), stepM = arg('step', 12);
const exigir = args.includes('--assert');
const file = resolve('dist/juega-encicla.html'), outPath = resolve('tests/out/benchmark-2km-gpt6.json');
if (!(cpu >= 1 && cpu <= 12 && km > 0 && stepM >= 2 && stepM <= 40)) throw Error('Argumentos inválidos');
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 412, height: 860 }, deviceScaleFactor: 1,
  isMobile: true, hasTouch: true
});
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
page.on('console', msg => { if (msg.type() === 'error') pageErrors.push(msg.text().slice(0, 250)); });
const pct = (arr, q) => {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return +(s[Math.ceil(s.length * q) - 1]).toFixed(1);
};
const report = {
  autor: 'OpenAI GPT-6', fecha: new Date().toISOString(),
  escenario: 'Barrido de cámara y personaje por vía real de 2 km, mapa cargado y caché fría; vista cenital con terreno 3D Canvas2D',
  equipo: 'GitHub Actions / Chromium virtual, CPU emulada por CDP; NO es teléfono físico',
  cpu, km, stepM, viewport: '412×860', pasos: [], errores: []
};
try {
  await page.goto('file://' + file);
  await page.waitForFunction(() => window.JE && JE.ready, null, { timeout: 60000 });
  report.version = await page.evaluate(() => JE.version);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  for (const via of ['Carrera 43A', 'Avenida de Las Palmas']) {
    const result = await page.evaluate(async ({ via, km, stepM }) => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      if (JE.game.mode) JE.game.stop();
      Save.data.settings.gfx = '3d';
      Save.data.settings.vista = 'cenital';
      if (typeof Mundo3D !== 'undefined' && Mundo3D.poner) Mundo3D.poner(null);
      JE.game.start('usuario', 1, { seed: 1256, nov: NOVEDADES[0], free: true, bici: 'propia' });
      await sleep(350);
      const M = JE.game.mode, R = M && M.ride;
      if (!R) return { via, error: 'No hay personaje en modo libre' };
      const distancia = km * 1000;
      const routes = JE.map.lanes.filter(l => l.name === via && l.len * M_PER_PX > distancia + 100);
      const ruta = routes.sort((a, b) => b.len - a.len)[0];
      if (!ruta) return { via, error: 'Ruta de al menos ' + distancia + ' m no encontrada' };
      const inicio = 40 / M_PER_PX, tope = distancia / M_PER_PX;
      /* Desactivar precalientamiento de chunks del entorno inicial, no tráfico ni vida. */
      JE.map.chunks2.clear();
      const profiler = JE.chunksGPT6;
      const p0 = profiler ? { creados: profiler.creados, terminados: profiler.terminados,
        cancelados: profiler.cancelados, errores: profiler.errores, maxEtapa: profiler.maxEtapaMs } : null;
      let ultimo = performance.now(), inicial = ultimo;
      const cuadros = [], max = Math.ceil(distancia / stepM), e0 = JE.errors.length;
      for (let i = 0; i <= max; i++) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const ahora = performance.now();
        if (i > 1) cuadros.push(ahora - ultimo);
        ultimo = ahora;
        const pos = JE.map.at(ruta, Math.min(ruta.len, inicio + i / max * tope));
        R.p.x = pos.x; R.p.y = pos.y; R.p.a = pos.a;
        R.p.v = 0; R.p.w = 0;
        R.cam.x = pos.x; R.cam.y = pos.y;
        if (R.libre) R.libre.on = false;
      }
      /* Dar 15 cuadros a los sectores que se generaron al final. */
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const ahora = performance.now(); cuadros.push(ahora - ultimo); ultimo = ahora;
      }
      const s = cuadros.slice().sort((a, b) => a - b), p95 = s[Math.ceil(s.length * .95) - 1],
        mediana = s[Math.floor(s.length / 2)], maxMs = s[s.length - 1],
        evento50 = cuadros.filter(v => v > 50).length,
        evento120 = cuadros.filter(v => v > 120).length,
        creados = profiler ? profiler.creados - p0.creados : null,
        terminados = profiler ? profiler.terminados - p0.terminados : null,
        errs = JE.errors.slice(e0);
      const longitud = Math.round(Math.min(tope, ruta.len - inicio) * M_PER_PX);
      return { via, distanciaM: longitud, cuadros: cuadros.length,
        medianaMs: +mediana.toFixed(1), p95Ms: +p95.toFixed(1),
        maxMs: +maxMs.toFixed(1), fps: +(cuadros.length * 1000 / (ultimo - inicial)).toFixed(1),
        cuadrosSobre50: evento50, cuadrosSobre120: evento120,
        chunks: { creados, terminados, pendientes: profiler?.pendientes ?? null,
          cancelados: profiler ? profiler.cancelados - p0.cancelados : null,
          errores: profiler ? profiler.errores - p0.errores : null,
          maxEtapaMs: profiler?.maxEtapaMs ?? null, p95EtapaMs: profiler?.percentil95() ?? null },
        errores: errs.slice(0, 8), ok: longitud >= distancia - 5 && p95 < 50 && maxMs < 120 &&
          !(profiler && profiler.errores > p0.errores) && !errs.length };
    }, { via, km, stepM });
    report.pasos.push(result);
    console.log('2KM', JSON.stringify(result));
  }
  report.errores = pageErrors;
  report.aprobado = report.pasos.length === 2 && report.pasos.every(r => r.ok) && !pageErrors.length;
} finally {
  mkdirSync(join(resolve(), 'tests/out'), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
console.log('Informe:', outPath);
console.log('Resultado 2 km CPU×' + cpu + ':', report.aprobado ? 'META CUMPLIDA' : 'META AÚN NO DEMOSTRADA');
if (exigir && !report.aprobado) process.exitCode = 1;
