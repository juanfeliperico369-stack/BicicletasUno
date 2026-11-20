#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · CAPTURAS · las fotos estándar del minijuego para revisar el arte y la interfaz (tarea fácil de Gemini, G‑H1)
     node motor.mjs capturas            → dist/capturas/<vista>-<hora>.png (celular 412 × 860, ×2) y dist/capturas/LEEME.md
     node motor.mjs capturas --web      → lo mismo sobre la página publicada (GitHub Pages)
   Vistas: cenital, maqueta, lateral y ciudad3d · Horas: 10 h (día), 17 h (tarde) y 20:30 h (noche) · más Mi casa y una capa de datos.
   Necesita Playwright (o el Chromium del sistema: MC_CHROMIUM=/ruta).
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), web = process.argv.includes('--web');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.error('✗ Falta Playwright: npm i -g playwright'); process.exit(1); }
const URL = web ? 'https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html' : process.env.MC_PRUEBAS_URL ? new globalThis.URL('dist/juegos/mandados.html', process.env.MC_PRUEBAS_URL).href : 'file://' + path.join(RAIZ, 'dist/juegos/mandados.html'), OUT = path.join(RAIZ, 'dist/capturas'); fs.mkdirSync(OUT, { recursive: true });
const op = process.env.MC_CHROMIUM ? { executablePath: process.env.MC_CHROMIUM } : {}; let b; try { b = await chromium.launch(op); } catch (e) { const x = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'].find(f => fs.existsSync(f)); if (!x) throw e; b = await chromium.launch({ executablePath: x }); }
const ctx = await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p = await ctx.newPage(), errs = [];
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(URL); await p.tap('#jugar'); await p.waitForFunction(() => window.MANDADOS && window.MANDADOS.mision, null, { timeout: 120000 }); await p.waitForTimeout(1500);
const lista = [];
for (const [h, n] of [[10, '10h'], [17, '17h'], [20.5, '20h30']]) for (const v of ['cenital', 'maqueta', 'lateral', 'ciudad3d']) {
  await p.evaluate(([h, v]) => { MANDADOS.reloj.min = h * 60; MANDADOS.ponVista(v); }, [h, v]); await p.waitForTimeout(1400); const f = v + '-' + n + '.png'; await p.screenshot({ path: path.join(OUT, f) }); lista.push(f);
}
await p.evaluate(() => { MANDADOS.reloj.min = 11 * 60; MANDADOS.ponVista('cenital'); MANDADOS.darUrbe(); MANDADOS.ponCapa('valor'); }); await p.waitForTimeout(1200); await p.screenshot({ path: path.join(OUT, 'capa-valor.png') }); lista.push('capa-valor.png');
await p.evaluate(() => { MANDADOS.ponCapa(null); const G = MANDADOS; G.ponHogar('Calle 31 # 28-15'); G.cuerpo.x = G.hogar.d.x; G.cuerpo.y = G.hogar.d.y + 3; G.abrirCasa(); }); await p.waitForTimeout(1000); await p.screenshot({ path: path.join(OUT, 'mi-casa.png') }); lista.push('mi-casa.png');
const info = await p.evaluate(() => ({ version: MC.version, estilo: MC.estilo, arte: MC.arte.activa, tapa: MC.UI.verificar(MANDADOS.ui), faltan: MC.Sprites.faltan.size, gpu: MC.GPU && MC.GPU.perfil ? MC.GPU.perfil().nivel : '?' }));
fs.writeFileSync(path.join(OUT, 'LEEME.md'), '# Capturas de Mandados\n\n- Página: ' + URL + '\n- Motor City ' + info.version + ' · estilo ' + info.estilo + ' · arte ' + info.arte + ' · GPU ' + info.gpu + '\n- La interfaz tapa el centro: ' + (info.tapa.length ? info.tapa.join(', ') : 'no') + ' · sprites que faltan: ' + info.faltan + ' · errores: ' + (errs.length ? errs.slice(0, 5).join(' | ') : 'ninguno') + '\n\n' + lista.map(f => '- `' + f + '`').join('\n') + '\n');
console.log('✓ ' + lista.length + ' capturas en dist/capturas/ · errores: ' + errs.length); await b.close();
