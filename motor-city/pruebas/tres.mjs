#!/usr/bin/env node
/* 4.9 · el 3D realista (three.js incrustado, MC.VistaTres) en Turno Cero, en Chromium con WebGL por software:
   - se usa cuando hay WebGL2 y ⚙️ Gráficos no pide los clásicos; arma regiones, pone sol con sombras y proyecta a pantalla;
   - los colores no se tiñen de azul (prueba de regresión: scene.environment teñía todo lo que mira hacia arriba);
   - de noche las ventanas encendidas brillan; ⚙️ Gráficos → clásicos vuelve a VistaGL en caliente, y de vuelta;
   - three.js va dentro del archivo (sin internet) con su licencia MIT. Uso: node pruebas/tres.mjs */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const tc = path.join(RAIZ, 'dist/juegos/getaway.html'); if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html (node herramientas/construir.mjs)'); process.exit(0); }
const html = fs.readFileSync(tc, 'utf8'), licencia = /Copyright 2010-2024 Three\.js Authors/.test(html) && /SPDX-License-Identifier: MIT/.test(html);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }), p = await b.newPage({ viewport: { width: 860, height: 412 } }), errs = [], red = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('request', r => { if (!/^(file|data|blob):/.test(r.url())) red.push(r.url()); });
await p.goto((process.env.MC_PRUEBAS_URL ? new URL('dist/juegos/getaway.html', process.env.MC_PRUEBAS_URL).href : pathToFileURL(tc).href) + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO);
await p.click('#bAbierto'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
for (let i = 0; i < 8; i++) { const d = await p.$('.mcui .dialogo button'); if (!d) break; await d.click().catch(() => {}); await p.waitForTimeout(150); }
const poner = (modo, hora, vista) => p.evaluate(([modo, hora, vista]) => { for (const m of document.querySelectorAll('.mcui .menu, .mcui .aviso')) m.remove(); const G = TURNO; MC.opciones.graficos = modo; G.vistas.motor3d = 'gl'; G.vistas.auto = false; G.vistas.calidad = 1; G.vistas.reiniciarGL(); G.reloj.min = hora * 60; G.reloj.vel = 0; G.cuerpo.setVeh(G.veh); G.cuerpo.v = 0; G.vistaId = vista; G.vistas.usar(vista, G.E); }, [modo, hora, vista]);
const medir = () => p.evaluate(() => { const G = TURNO, g = G.vistas.gl, C = G.cuerpo; if (!g) return null; const c = document.createElement('canvas'); c.width = g.cv.width; c.height = g.cv.height; const x = c.getContext('2d'); x.drawImage(g.cv, 0, 0); const d = x.getImageData(0, Math.floor(c.height * .55), c.width, Math.floor(c.height * .45)).data; let r = 0, gg = 0, bb = 0, n = 0, brillo = 0; for (let i = 0; i < d.length; i += 16) { r += d[i]; gg += d[i + 1]; bb += d[i + 2]; n++; if (d[i] > 200 && d[i + 1] > 140 && d[i + 2] < 150) brillo++; }
  const q = G.vistas.aPantalla(G.E, C.x, C.y, G.M.cota(C.x, C.y) + 1); return { tres: !!g.tres, regiones: g.regiones.size, sombra: !!(g.sol && g.sol.castShadow), mvp: !!g.mvp, proy: q ? [Math.round(q[0]), Math.round(q[1])] : null, W: g.cv.width, H: g.cv.height, rgb: [r / n, gg / n, bb / n].map(Math.round), calidos: brillo, recorte: g.recorte }; });
const R = {};
await poner('auto', 10, 'tercera'); await p.waitForTimeout(8000); R.dia = await medir();
await p.evaluate(() => { TURNO.vistaId = 'dron'; TURNO.vistas.usar('dron', TURNO.E); }); await p.waitForTimeout(5000); R.dron = await medir();
await poner('realistas', 20.5, 'tercera'); await p.waitForTimeout(8000); R.noche = await medir();
/* ⚙️ Gráficos → clásicos y de vuelta, por el panel de Flexibilidad */
R.clasico = await p.evaluate(async () => { const G = TURNO, espera = ms => new Promise(q => setTimeout(q, ms)); G.flex = MC.Flex.aplicar(Object.assign({}, G.flex, { graficos: 'clasicos' }), { vistas: G.vistas }); await espera(2500); const a = G.vistas.gl && !G.vistas.gl.tres; G.flex = MC.Flex.aplicar(Object.assign({}, G.flex, { graficos: 'realistas' }), { vistas: G.vistas }); await espera(2500); return { clasico: a, vuelve: !!(G.vistas.gl && G.vistas.gl.tres) }; });
errs.push(...await p.evaluate(() => MC.errores.map(e => String(e.msg || e)))); await b.close();
const D = R.dia || {}, ok = licencia && !red.length && D.tres && D.regiones > 20 && D.sombra && D.mvp && D.proy && D.proy[0] > 0 && D.proy[0] < D.W && D.proy[1] > 0 && D.proy[1] < D.H
  && D.rgb[2] - D.rgb[0] < 45 && R.dron && R.dron.tres && R.dron.rgb[2] - R.dron.rgb[0] < 45 && R.noche && R.noche.tres && !R.noche.sombra && R.noche.rgb[0] < D.rgb[0] && R.clasico.clasico && R.clasico.vuelve && !errs.length;
console.log((ok ? '✓' : '✗') + ' 🖼️ 3D realista (three.js incrustado): regiones, sol con sombras, proyección, sin tinte azul, noche con ventanas y cambio a clásicos en caliente · ' + JSON.stringify({ licencia, red: red.length, ...R }) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
