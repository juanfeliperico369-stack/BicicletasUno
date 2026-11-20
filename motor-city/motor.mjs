#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · la línea de comandos del motor (fuente de verdad: juanfeliperico369-stack/motorcity).
   Vive igual en motorcity/ y, copiado con herramientas/sincronizar.mjs, en <juego>/motor-city/.
   Mundo 2.0 (nuevo):
     node motor.mjs mundo [--encicla RUTA] [--elmetro RUTA]   junta los datos de los dos juegos en datos/<ciudad>/mundo.mc4 (F1)
     node motor.mjs construir                                 dist/motor.js, dist/mundo-<ciudad>.js y el banco de pruebas dist/motor-city.html
     node motor.mjs run [--run ../RunRunZero]                 vuelve a importar Run Scooter (run/run-scooter.js) con sus parches
     node motor.mjs prueba                                    las pruebas del motor (pruebas/prueba.mjs)
     node motor.mjs sincronizar RUTA_JUEGO [--verificar]      copia el motor a RUTA_JUEGO/motor-city (o solo compara)
     node motor.mjs nuevo juego|modulo NOMBRE                  arma un juego o un módulo nuevo desde plantillas
     node motor.mjs reporte "título"                           abre un reporte de cambios para la IA del motor
     node motor.mjs documento                                  arma dist/MOTOR-CITY-TODO.md (el documento único + anexos)
     node motor.mjs capturas [--web]                           las fotos estándar de Mandados en dist/capturas/ (revisión visual)
     node motor.mjs revisar-arte arte/ID                       revisa un paquete de arte contra las reglas (§10)
     node motor.mjs exportar ID [--centro x,y --lado m]       el mundo en glTF (GLB), alturas RAW 16 y escena JSON (Godot, Unity, Unreal…)
     python3 geo/territorio.py --id ID --bbox=lon0,latS,lon1,latN   craquea cualquier lugar del mundo a datos/ID/mundo.mc4
   Mapa 1.x (sigue igual, para los datos que hoy leen los juegos):
   ---------------------------------------------------------------------
   (Tubería 1.x) el mapa que hoy leen Juega EnCicla y El Metro.
   Una sola tubería (motor-valle/geo) y unas mismas fuentes abiertas; cada juego recibe el mapa en su resolución:
     node motor-valle/motor.mjs encicla                  casillas de 10 m → src/data de Juega EnCicla
     node motor-valle/motor.mjs elmetro RUTA_A_ELMETRO    casillas de 20 m → RUTA/src/data/valle.js (formato v3 de El Metro)
     node motor-valle/motor.mjs fuentes                  descarga o actualiza las fuentes (Overture/OSM, relieve y capas oficiales) → motor-valle/geo/cache
     node motor-valle/motor.mjs version                  versión del motor y huella (sha1) de cada archivo de datos
   Opciones: --prueba (deja la salida en motor-valle/salida/ sin tocar los juegos).
   El contrato (coordenadas, capas y reglas) está en motor-valle/MOTOR.md.
   ===================================================================== */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const MOTOR = path.dirname(fileURLToPath(import.meta.url)), GEO = path.join(MOTOR, 'geo'), ROOT = path.join(MOTOR, '..');
const VERSION = JSON.parse(fs.readFileSync(path.join(MOTOR, 'VERSION.json'), 'utf8'));
const args = process.argv.slice(2), cmd = args[0], prueba = args.includes('--prueba');
const py = (script, env = {}, extra = []) => { console.log('▶', script, Object.entries(env).map(([k, v]) => k + '=' + v).join(' ')); const r = spawnSync('python3', [path.join(GEO, script), ...extra], { stdio: 'inherit', env: { ...process.env, ...env } }); if (r.status !== 0) { console.error('✗ falló', script); process.exit(r.status || 1); } };
const sha = f => crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex').slice(0, 12);
const salida = n => { const d = path.join(MOTOR, 'salida', n); fs.mkdirSync(d, { recursive: true }); return d; };

/* El Metro lee el mismo binario v3 (casillas, relieve, municipios, comunas, barrios, pisos y lotes); su cargador pide la marca ba
   para la capa de barrios y no usa los vectores de calles de Juega EnCicla (tiene los suyos en vias.js) */
function exportarElMetro(dir, destino) {
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'valle.json'), 'utf8')), bin = fs.readFileSync(path.join(dir, 'valle.bin'));
  for (const k of ['calles', 'vias', 'viasB', 'vq']) delete meta[k];
  if (meta.barrios) meta.ba = 1;
  meta.motor = VERSION.version;
  const cab = `/* Mapa real del Valle de Aburrá, formato v3 (casillas de ${meta.tile} m, relieve de 80 m, y por celda de ${meta.tile * 8} m: barrio, pisos y lotes).
   Generado por el MOTOR DEL VALLE ${VERSION.version} (motor-valle/, el mismo de Juega EnCicla: node motor-valle/motor.mjs elmetro). No editar a mano.
   © colaboradores de OpenStreetMap (ODbL) vía Overture Maps, con huellas de edificios de Overture (OSM, Microsoft y Google); capas oficiales de Medellín; relieve SRTM/NASA. */\n`;
  fs.writeFileSync(destino, cab + 'const VALLE_META = ' + JSON.stringify(meta) + ';\nconst VALLE_BIN = \'' + bin.toString('base64') + '\';\n');
  console.log('✓ El Metro:', destino, (fs.statSync(destino).size / 1048576).toFixed(2), 'MB ·', meta.W + '×' + meta.H, 'casillas de', meta.tile, 'm');
}

const nodo = (script, extra = []) => { const r = spawnSync(process.execPath, [path.join(MOTOR, script), ...extra], { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status || 1); };
if (cmd === 'mundo') nodo('herramientas/fusionar.mjs', args.slice(1));
else if (cmd === 'construir') nodo('herramientas/construir.mjs', args.slice(1));
else if (cmd === 'run') nodo('herramientas/importar-run.mjs', args.slice(1));
else if (cmd === 'prueba') nodo('pruebas/prueba.mjs', args.slice(1));
else if (cmd === 'sincronizar') nodo('herramientas/sincronizar.mjs', args.slice(1));
else if (cmd === 'nuevo') nodo('herramientas/nuevo.mjs', args.slice(1));
else if (cmd === 'reporte') nodo('herramientas/reporte.mjs', args.slice(1));
else if (cmd === 'documento') nodo('herramientas/documento.mjs', args.slice(1));
else if (cmd === 'capturas') nodo('herramientas/capturas.mjs', args.slice(1));
else if (cmd === 'revisar-arte') nodo('herramientas/revisar-arte.mjs', args.slice(1));
else if (cmd === 'exportar') nodo('herramientas/exportar.mjs', args.slice(1));
else if (cmd === 'fuentes') { py('fetch.py'); py('oficial.py'); }
else if (cmd === 'encicla') {
  const out = prueba ? salida('encicla') : path.join(ROOT, 'src', 'data');
  py('build.py', { TILE: '10', OUT: out });
  if (!prueba) { py('sitios.py'); py('alturas.py'); const em = args[1] && !args[1].startsWith('--') ? args[1] : null; if (em) py('metroplus_elmetro.py', {}, [em]); }
  console.log('✓ Juega EnCicla: datos del mapa en', out);
}
else if (cmd === 'elmetro') {
  const em = args[1] && !args[1].startsWith('--') ? args[1] : null; if (!em && !prueba) { console.error('Uso: node motor-valle/motor.mjs elmetro RUTA_A_ELMETRO [--prueba]'); process.exit(1); }
  const tmp = salida('elmetro-20m'); py('build.py', { TILE: '20', OUT: tmp });
  exportarElMetro(tmp, prueba ? path.join(salida('elmetro'), 'valle.js') : path.join(em, 'src', 'data', 'valle.js'));
}
else if (cmd === 'version') {
  console.log('Motor City', VERSION.version, '·', VERSION.fecha);
  for (const f of ['valle.json', 'valle.bin', 'vias.bin', 'sitios.bin', 'sitios.json', 'alturas.json', 'metroplus.json', 'valle.js', 'ciudad.js', 'vias.js', 'puentes.js', 'edificios.js', 'hitos.js', 'metroplus.js', 'metroplus_andenes.js', 'rieles.js', 'rutas_calles.js', 'ajustes.js']) {   /* los datos de los dos juegos (EnCicla y El Metro) */ const p = path.join(ROOT, 'src', 'data', f); if (fs.existsSync(p)) console.log('  ' + f.padEnd(15), sha(p), (fs.statSync(p).size / 1024).toFixed(0) + ' KB'); }
}
else { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 22).join('\n')); }
