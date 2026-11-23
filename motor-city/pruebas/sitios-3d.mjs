#!/usr/bin/env node
/* 5.3 · Los sitios icónicos de Medellín en el 3D realista (C5-02, primera versión con las fichas G5-07 de Gemini).
   En Node, con el mundo real:
   - se incrustan las 30 fichas (MC_SITIOS) y MC.Sitios.lista arma los que tienen forma, con su orientación;
   - cada sitio que es un edificio tapa al menos un genérico y SOLO los que caen dentro de su planta (los vecinos se quedan);
   - las plazas y parques no tapan nada;
   - el presupuesto de triángulos (como lo pide la ficha: menos de 35.000 en total) se cumple con detalle alto.
   En el navegador (Turno Cero, 3D realista): la región del Coltejer lleva la malla del sitio y se ve; capturas de varios sitios.
   Uso: node pruebas/sitios-3d.mjs [--sin-navegador] */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url);
let bien = 0, mal = 0; const ok = (c, msg, extra) => { (c ? bien++ : mal++); console.log((c ? '  ✓ ' : '  ✗ ') + msg + (extra !== undefined ? ' ' + JSON.stringify(extra) : '')); };
const ctx = { console, require, process, Buffer, TextDecoder, TextEncoder, performance, setTimeout }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dist/motor.js'), 'utf8'), ctx);
const MC = ctx.MC, S = MC.Sitios, M = new MC.Mundo(new Uint8Array(fs.readFileSync(path.join(RAIZ, 'datos/medellin/mundo.mc4'))), JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades/medellin.json'), 'utf8')));
console.log('1) Los datos');
const fichas = JSON.parse(fs.readFileSync(path.join(RAIZ, 'docs/sitios/sitios.json'), 'utf8')).sitios;
const L = S.lista(M);
ok(fichas.length === 30 && fichas.filter(f => L.some(s => s.id === f.id)).length === L.length && L.every(s => s.n && s.planta && s.alto), 'las fichas de Gemini van incrustadas (MC_SITIOS) con nombre, planta y alto', { fichas: fichas.length, conForma: L.length });
ok(L.length >= 28, 'los sitios con forma, en Medellín', L.length);
ok(S.lista({ cfg: { id: 'guatape' } }).length === 0, 'en otro mundo no hay sitios de Medellín');
console.log('2) Qué reemplazan');
/* un sitio-edificio no queda encimado con un genérico: todo genérico (no mucho más alto) con el centro en el 80 % central de
   su planta queda tapado (en el Coltejer y el Planetario no había ninguno: el 3D no dibujaba la capa de hitos y faltaban) */
const encimados = []; for (const s of L.filter(s => s.tapa.size || ['aguja', 'iglesia', 'catedral', 'cupula', 'rocas', 'estadio', 'piramide_inv', 'palacio', 'deco', 'teatro', 'republicano', 'estacion'].includes(s.forma))) { const ca = Math.cos(s.a), sa = Math.sin(s.a);
  for (const e of M.edificiosEn(s.x - s.planta[0], s.y - s.planta[1], s.x + s.planta[0], s.y + s.planta[1])) { const u = (e.x - s.x) * ca + (e.y - s.y) * sa, v = -(e.x - s.x) * sa + (e.y - s.y) * ca; if (Math.abs(u) < s.planta[0] * .4 && Math.abs(v) < s.planta[1] * .4 && e.h <= s.alto * 1.6 + 8 && !s.tapa.has(e)) encimados.push(s.id); } }
ok(!encimados.length, 'ningún edificio genérico queda encimado dentro de un sitio-edificio', encimados);
ok(['candelaria', 'catedral_metropolitana', 'estadio_atanasio', 'biblioteca_espana'].every(id => L.find(s => s.id === id).tapa.size >= 1), 'la Candelaria, la Catedral, el estadio y la Biblioteca España reemplazan su edificio genérico', L.filter(s => s.tapa.size).map(s => s.id + ':' + s.tapa.size));
const fuera = []; for (const s of L) { const ca = Math.cos(s.a), sa = Math.sin(s.a); for (const e of s.tapa) { const u = (e.x - s.x) * ca + (e.y - s.y) * sa, v = -(e.x - s.x) * sa + (e.y - s.y) * ca; if (Math.abs(u) > s.planta[0] / 2 || Math.abs(v) > s.planta[1] / 2) fuera.push(s.id); } }
ok(!fuera.length, 'solo se tapan edificios con el centro dentro de la planta del sitio (los vecinos quedan)', fuera);
ok(L.filter(s => ['botero', 'raza', 'pueblito', 'flores', 'deseos', 'bambu', 'luces'].includes(s.forma)).every(s => s.tapa.size === 0), 'las plazas y parques no tapan nada');
console.log('3) Las formas y el presupuesto');
let tris = 0; const porSitio = {};
const malla = { n: 0, tri() { this.n++; }, triF() { this.n++; }, quadF() { this.n += 2; }, quad() { this.n += 2; }, cajaF() { this.n += 12; }, cil(x, y, z, r, h, n, c, rT = r) { this.n += n * (rT > 1e-3 ? 2 : 1) + (rT > 1e-3 ? n - 2 : 0); }, esfera() { this.n += 20; } };
for (const s of L) { malla.n = 0; try { S.armar(malla, s, [0, 0, 0], 0, 3); } catch (e) { porSitio[s.id] = 'ERROR ' + e.message; continue; } porSitio[s.id] = malla.n; tris += malla.n; }
ok(Object.values(porSitio).every(n => typeof n === 'number' && n > 10), 'cada forma se arma sin errores', Object.entries(porSitio).filter(([, n]) => typeof n !== 'number' || n <= 10));
ok(tris < 35000, 'el total de triángulos con detalle alto cabe en el presupuesto de las fichas (< 35.000)', tris);
if (!process.argv.includes('--sin-navegador')) {
  console.log('4) En el navegador (Turno Cero, 3D realista)');
  const { chromium } = require('playwright');
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }), p = await b.newPage({ viewport: { width: 860, height: 412 } }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(RAIZ, 'dist/juegos/getaway.html')).href + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 120000 });
  await p.click('#bAbierto'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
  for (let i = 0; i < 8; i++) { const d = await p.$('.mcui .dialogo button'); if (!d) break; await d.click().catch(() => {}); await p.waitForTimeout(150); }
  const fotos = [];
  for (const [id, hora, zoom] of [['coltejer', 16.5, 90], ['catedral_metropolitana', 9, 80], ['estadio_atanasio', 17, 140], ['biblioteca_espana', 10, 70], ['parque_luces', 20.5, 80], ['planetario', 11, 55]]) {
    const r = await p.evaluate(async ([id, hora, zoom]) => { const G = TURNO, M = G.M, C = G.cuerpo, espera = ms => new Promise(q => setTimeout(q, ms));
      for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo, .mcui .aviso')) m.remove();
      const s = MC.Sitios.lista(M).find(q => q.id === id); if (!s) return { id, falta: true };
      const q = M.viaCercana(s.x, s.y, 220); Object.assign(C, { x: q.x, y: q.y, a: Math.atan2(s.y - q.y, s.x - q.x), v: 0 }); C.actualizar = function () { this.v = 0; return this; };
      G.reloj.min = hora * 60; G.reloj.vel = 0; MC.opciones.graficos = 'realistas'; G.vistas.motor3d = 'gl'; G.vistas.reiniciarGL(); G.vistaId = 'dron'; G.vistas.usar('dron', G.E);
      G.camara.x = s.x; G.camara.y = s.y; if (G.camara.d) G.camara.d.dist = zoom;
      let reg = null; for (let i = 0; i < 40 && !reg; i++) { await espera(400); const g = G.vistas.gl; if (g && g.regiones) for (const rg of g.regiones.values()) if (rg.sitios && rg.sitios.includes(id)) reg = rg; }
      await espera(1500); return { id, region: !!reg, forma: s.forma, tapa: s.tapa.size }; }, [id, hora, zoom]);
    const f = path.join(RAIZ, 'reportes', 'sitio-' + id + '.png'); await p.screenshot({ path: f }); fotos.push(f);
    ok(r.region, 'el sitio «' + id + '» se arma en su región del 3D', r);
  }
  await b.close();
  ok(!errs.length, 'sin errores en la página', errs.slice(0, 3));
  for (const f of fotos) fs.unlinkSync(f);   /* las tomas del reporte (reportes/sitios-3d-5.3.webp) se hacen con cámara libre aparte */
}
console.log(`\n${mal ? '✗' : '✓'} Sitios icónicos en 3D: ${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
