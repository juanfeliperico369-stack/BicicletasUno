/* R1: verifica archivos, selección de materiales, escala y ruta real de VistaTres. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(RAIZ);
const require = createRequire(import.meta.url), { chromium } = require('playwright');
const dir = 'arte/fachadas/medellin', manifiesto = JSON.parse(fs.readFileSync(dir + '/manifiesto.json'));
assert.equal(manifiesto.fachadas.length, 6);
for (const f of manifiesto.fachadas) for (const [campo, hash] of [['day', 'albedo_sha256'], ['emission', 'emission_sha256']]) {
  const archivo = fs.readFileSync(path.join(dir, path.basename(f[campo])));
  assert.equal(crypto.createHash('sha256').update(archivo).digest('hex'), f[hash]);
}
/* sin servidor: el HTML único se abre como archivo (como lo abre la gente); MC_PRUEBAS_URL y MC_CHROMIUM siguen sirviendo */
const url = new URL('dist/juegos/getaway.html?portada', process.env.MC_PRUEBAS_URL || pathToFileURL(RAIZ + '/').href);
const browser = await chromium.launch({ ...(process.env.MC_CHROMIUM ? { executablePath: process.env.MC_CHROMIUM } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 860, height: 600 } });
  const errores = [], externos = [];
  page.on('pageerror', e => errores.push(e.message));
  page.on('request', r => { if (!r.isNavigationRequest() && !/^(data|blob|file):/.test(r.url())) externos.push(r.url()); });
  await page.goto(url.href);
  await page.waitForFunction(() => window.TURNO_LISTO);
  await page.click('#bAbierto');
  await page.waitForFunction(() => TURNO.M && !TURNO.transicion, null, { timeout: 120000 });
  await page.evaluate(() => {
    const G = TURNO, punto = G.M.geoAMetros(6.2087, -75.5677);
    const b = G.M.edificiosEn(punto.x - 500, punto.y - 500, punto.x + 500, punto.y + 500).find(e => e.h > 10 && G.M.viaCercana(e.x, e.y, 35));
    const via = G.M.viaCercana(b.x, b.y, 35), a = Math.atan2(b.y - via.y, b.x - via.x);
    Object.assign(G.cuerpo, { x: via.x, y: via.y, a, v: 0 });
    Object.assign(G.camara, { x: via.x, y: via.y, yaw: a });
    MC.opciones.graficos = 'realistas'; G.vistas.motor3d = 'gl'; G.vistas.auto = false;
    G.vistas.reiniciarGL(); G.vistaId = 'tercera'; G.vistas.usar('tercera', G.E); G.reloj.vel = 0; G.reloj.min = 600;
  });
  await page.waitForFunction(() => {
    const g = TURNO.vistas.gl;
    return g?.tres && Object.values(g._fachadas || {}).filter(f => f.listo).length === 6 &&
      [...g.regiones.values()].some(r => r.grupo.children.some(o => o.userData.fachadaR1));
  }, null, { timeout: 120000 });
  const estado = await page.evaluate(() => {
    const g = TURNO.vistas.gl, f = g._fachadas, P = [];
    for (const r of g.regiones.values()) r.grupo.traverse(o => { if (o.userData.fachadaR1) P.push(o); });
    const seleccion = ['torre', 'comercio', 'iglesia'].map(clase => g._tipoFachada({ clase, h: 9 }, { plano: true }, { nombre: 'Centro' }));
    return { texturas: Object.keys(f).filter(k => f[k].listo).length, paredes: P.length, seleccion,
      superficie: [f.concreto.albedo.image.width, f.concreto.emision.image.height],
      emision: f.concreto.material.emissiveIntensity, uv: P.every(o => !!o.geometry.attributes.uv) };
  });
  assert.equal(estado.texturas, 6); assert(estado.paredes > 0 && estado.uv);
  const respaldo = await page.evaluate(() => {
    const g = TURNO.vistas.gl, f = g._fachadas.revoque_colores, llamadas = [];
    const m = { edificio3d(...args) { llamadas.push(args); } }, P = [0,0,10,0,10,8,0,8];
    g._paredesR1 = {};
    f.listo = false;
    g._edificio(m, P, [0,0,0], 0, { clase: 'casa', h: 6 }, { plano: true }, 3, { nombre: 'Centro' });
    const sinAtlas = Object.keys(g._paredesR1).length === 0 && llamadas[0][8] !== true;
    f.listo = true;
    g._edificio(m, P, [0,0,0], 0, { clase: 'casa', h: 6 }, { plano: true }, 3, { nombre: 'Centro' });
    const conAtlas = llamadas[1][8] === true && g._paredesR1.revoque_colores.uv.length > 0;
    g._paredesR1 = null;
    return sinAtlas && conAtlas;
  });
  assert(respaldo, 'Una imagen ausente conserva la geometría procedural');
  assert.deepEqual(estado.seleccion, ['vidrio_torre', 'local_persiana', null]);
  assert.deepEqual(estado.superficie, [1024, 512]); assert.equal(estado.emision, 0);
  await page.evaluate(() => { TURNO.reloj.min = 1230; });
  await page.waitForFunction(() => TURNO.vistas.gl._fachadas.concreto.material.emissiveIntensity > 0);
  assert.deepEqual(errores, []); assert.deepEqual(externos, []);
  console.log('✓ 12 hashes, seis materiales, UV, noche y funcionamiento autocontenido', JSON.stringify(estado));
} finally { await browser.close(); }
