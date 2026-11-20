#!/usr/bin/env node
/* MOTOR CITY · público simulado (MC.Publico, 2.10)
   node motor.mjs publico [--seg 45] [--perfiles nina,abuelo,gamer,turista] [--juego dist/juegos/mandados.html]
   Cada perfil juega solo Mandados en un celular simulado (412×860, pantalla táctil, densidad 2) y el informe queda en
   dist/publico.md y dist/publico.json: si llegó, cuánto se atascó, cuántas veces chocó, los cuadros por segundo y su veredicto.
   No reemplaza a la gente de verdad: sirve para ver antes de publicar si algo bloquea a un niño, a un abuelo o a un turista. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), args = process.argv.slice(2), val = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SEG = +val('--seg', 45), ARCH = path.resolve(RAIZ, val('--juego', 'dist/juegos/mandados.html')), PERF = val('--perfiles', 'nina,abuelo,gamer,turista').split(',');
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch (e) { console.error('✗ Falta Playwright (npm i playwright).'); process.exit(1); }
if (!fs.existsSync(ARCH)) { console.error('✗ No existe ' + ARCH + ' (corre node motor.mjs construir).'); process.exit(1); }
const exe = process.env.MC_CHROMIUM && fs.existsSync(process.env.MC_CHROMIUM) ? { executablePath: process.env.MC_CHROMIUM } : {};
const b = await chromium.launch(exe), res = [];
for (const id of PERF) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p = await ctx.newPage(), errores = [];
  p.on('pageerror', e => errores.push(e.message)); p.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  await p.goto('file://' + ARCH); await p.tap('#jugar'); await p.waitForFunction(() => window.MANDADOS && window.MANDADOS.mision, null, { timeout: 120000 }); await p.waitForTimeout(800);
  const d = await p.$('.dialogo button'); if (d) await d.tap();
  await p.evaluate(id => {
    const G = window.MANDADOS, objetivo = () => { const m = G.mision; if (!m || m.estado !== 'activa') return null; const P = m.actual; return P && P.x != null ? { x: P.x, y: P.y, radio: P.radio, quieto: P.tipo === 'esperar' } : null; };
    const pi = MC.Publico.piloto(id, { cuerpo: G.cuerpo, camara: G.camara, objetivo, ruta: (de, a) => MC.Manejo.rutaA(G.mundo, de, a, 'rueda') }); G.piloto = pi; window._publico = pi; window._fps = [];
    MC.on('mision', ev => { if (ev.estado === 'paso') pi.paso(); });
    let t0 = performance.now(); const medir = () => { const t = performance.now(); window._fps.push(t - t0); t0 = t; if (window._publico) requestAnimationFrame(medir); }; requestAnimationFrame(medir);
  }, id);
  await p.waitForTimeout(SEG * 1000);
  const r = await p.evaluate(() => { const pi = window._publico; window._publico = null; window.MANDADOS.piloto = null; pi.soltar(); const F = window._fps.slice(10).sort((a, b) => a - b), med = F[F.length >> 1] || 16.7; return { M: pi.medidas, fps: 1000 / med }; });
  const inf = await p.evaluate(([M, fps, err]) => MC.Publico.informe(M, { fps, errores: err }), [r.M, r.fps, errores.length]);
  inf.fps = +r.fps.toFixed(1); inf.errores = errores.slice(0, 3); res.push(inf);
  console.log((inf.veredicto === 'bien' ? '✓ ' : inf.veredicto === 'revisar' ? '• ' : '✗ ') + inf.icono + ' ' + inf.n + ' (' + inf.veredicto + '): ' + inf.frases.join(' '));
  await ctx.close();
}
await b.close();
const md = ['# Público simulado · ' + path.basename(ARCH), '', '> `node motor.mjs publico` (Motor City, MC.Publico). Cada perfil juega solo ' + SEG + ' s en un celular simulado. Es una prueba de humo: no reemplaza a la gente de verdad.', '',
  '| Perfil | Veredicto | Llegadas (s) | Metros | Atascado | Choques | FPS | Lo que «diría» |', '|---|---|---|---|---|---|---|---|',
  ...res.map(r => `| ${r.icono} ${r.n} | ${r.veredicto} | ${r.medidas.llegadas.join(', ') || '—'} | ${Math.round(r.medidas.metros)} | ${Math.round(r.medidas.atascado)} s | ${r.medidas.choques} | ${r.fps} | ${r.frases.join(' ')} |`), ''];
fs.mkdirSync(path.join(RAIZ, 'dist'), { recursive: true }); fs.writeFileSync(path.join(RAIZ, 'dist', 'publico.md'), md.join('\n')); fs.writeFileSync(path.join(RAIZ, 'dist', 'publico.json'), JSON.stringify(res, null, 1));
console.log('Informe: dist/publico.md'); process.exit(res.some(r => r.medidas.errores) ? 1 : 0);
