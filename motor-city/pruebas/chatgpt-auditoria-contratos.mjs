#!/usr/bin/env node
/**
 * ChatGPT · Motor City 4.7 · Auditoría estática de contratos arcade.
 *
 * Objetivo: levantar señales verificables de deuda de jugabilidad sin modificar
 * los archivos centrales que Claude mantiene en otra rama. No sustituye
 * Playwright ni una partida de una persona: la inspección textual no prueba la
 * semántica completa de los modos.
 *
 * node pruebas/chatgpt-auditoria-contratos.mjs
 * node pruebas/chatgpt-auditoria-contratos.mjs --json
 * node pruebas/chatgpt-auditoria-contratos.mjs --estricto   # exit 1 si hay deuda P0/P1
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARCHIVOS = {
  run: 'js/50-run.js',
  seguir: 'js/47-seguir.js',
  modos: 'juegos/getaway/60-modos.js',
  abierto: 'juegos/getaway/56-abierto.js',
  inicio: 'juegos/getaway/90-inicio.js',
  juego: 'juegos/getaway/20-juego.js',
  controles: 'js/33-controles.js',
  pruebas: 'pruebas/humano.mjs'   // 4.8 (Claude): el E2E solo con entradas; pruebas/modos.mjs sigue como banco lógico
};
const leer = nombre => fs.readFileSync(path.join(RAIZ, ARCHIVOS[nombre]), 'utf8');
const A = Object.fromEntries(Object.keys(ARCHIVOS).map(n => [n, leer(n)]));
const corte = (t, inicio, fin) => {
  const i = t.indexOf(inicio);
  if (i < 0) return '';
  const j = fin ? t.indexOf(fin, i + inicio.length) : -1;
  return t.slice(i, j < 0 ? undefined : j);
};
const linea = (s, indice) => indice < 0 ? null : s.slice(0, indice).split('\n').length;
const resultados = [];
const evaluar = (id, prioridad, titulo, ruta, comprobacion, ok, descripcion, recomendacion) => {
  const f = path.join(RAIZ, ruta), texto = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
  const lugar = linea(texto, texto.indexOf(comprobacion));
  resultados.push({ id, prioridad, titulo, estado: ok ? 'CONTRATO_DETECTADO' : 'REVISAR',
    ruta, linea: lugar, detalle: descripcion, accion: recomendacion });
};

// 1. Run: la restricción de entrada debe acompañar a la RUTA completa.
const ctor = corte(A.run, 'const seguir = new SeguirRuta(', 'const ESC ='); // puede variar si Claude reestructura
const puerta = /esCiclovia\s*\(/.test(A.run);
const segFiltro = /new SeguirRuta\([\s\S]{0,250}?filtro\s*:/.test(ctor) ||
                  /new SeguirRuta\([\s\S]{0,250}?filtro\s*:/.test(A.run);
evaluar('TC-P0-02', 'P0', 'Run restringe todos los segmentos a ciclovía',
  ARCHIVOS.run, 'new SeguirRuta', puerta && segFiltro,
  'Se detectó comprobación de entrada, pero se requiere filtrar las aristas que seguirá la ruta.',
  "Pasar filtro: arista => arista.k === VIA.CICLO en SeguirRuta; probar fin de grafo.");

// 2. Una intersección debe ofrecer únicamente ramas autorizadas.
// Se considera contrato presente si se filtran las opciones antes de calcular giros.
const esquina = corte(A.run, 'V.esquina =', 'V.gira =');
const filtradas = /\.filter\(\s*o\s*=>\s*o\.k\s*===\s*VIA\.CICLO/.test(esquina) ||
  /c\.opciones\.filter\([\s\S]{0,130}VIA\.CICLO/.test(esquina) ||
  /opcionesCiclovia/.test(esquina);
evaluar('TC-P0-03', 'P0', 'Run filtra giros a ramas ciclistas',
  ARCHIVOS.run, 'V.esquina =', filtradas,
  'Filtrar visualmente el cruce y filtrar físicamente el recorrido son requisitos distintos.',
  'Filtrar las opciones antes de mostrarlas y verificar que el giro retorna arista CICLO.');

// 3. API EnCicla segura cuando no hay estaciones.
const encicla = corte(A.modos, 'armarEnCicla(desde)', 'luces()');
const primerAccesoO = encicla.search(/o\.x|o\.y/);
const guardiaO = encicla.search(/if\s*\(\s*!o(?:\s*\|\|[^)]*)?\)\s*return\s+(?:false|null|\{)/);
const safeStations = /S\?\.length|S\.length\s*[<=>]|Array\.isArray\(S\)/.test(encicla);
// 4.8 (Claude): la guardia del módulo 61 se integró en 60-modos y el 61 se retiró.
const guardiaIntegrada = /Array\.isArray\(S\)/.test(encicla) && /S\.length\s*<\s*2/.test(encicla) &&
  /S\.includes\(desde\)/.test(encicla) && /return\s+false/.test(encicla);
evaluar('TC-P1-05', 'P1', 'EnCicla valida estación de origen y cantidad de estaciones',
  ARCHIVOS.modos, 'armarEnCicla(desde)', guardiaIntegrada || (primerAccesoO >= 0 && guardiaO >= 0 && guardiaO < primerAccesoO && safeStations),
  'La guardia del módulo 61 intercepta el modo sin estaciones antes de la función original 60; no debe llegar a o.x.',
  'Si Claude integra el parche en 60-modos, preservar guardia y retirar 61 con el E2E en verde.');

// 4. Test E2E humano no debe fingir progreso.
const test = A.pruebas;
const testTeleport = /Object\.assign\(\s*G\.cuerpo\s*,\s*\{\s*x\s*:|Object\.assign\(\s*G\.cuerpo\s*,\s*\{\s*x\s*:|m\.s\s*=\s*E\.s|G\.cuerpo\.(?:x|y)\s*=/.test(test);
evaluar('TC-P0-01', 'P0', 'La prueba de modos completa recorridos sin manipular progreso',
  ARCHIVOS.pruebas, 'Object.assign(G.cuerpo', !testTeleport,
  'La suite lógica actual puede forzar coordenadas, progreso o posición para probar resultados.',
  'Mantener suite lógica y añadir E2E táctil/teclado separados que nunca alteren x,y,v,s desde el bot.');

// 5. Acceso espacial compartido a actividades.
// 4.8 (Claude): las marcas de actividad viven en 60-modos (Actividades: celdas, capas y mapa), junto a las de historia de 56-abierto.
const hayMarcadoresActividad = /(?:Modos\.|G\.Modos|ActivityDefinition|ActividadEspacial|actividad_id|activity_id)/.test(A.abierto) ||
  (/const\s+Actividades\s*=/.test(A.modos) && /capas\s*\(/.test(A.modos) && /Modos\.empezar\(a\.t,\s*\{\s*centro/.test(A.modos));
const hayMarcaHistoria = /Abierto\.marca|marca\(\)/.test(A.abierto);
evaluar('TC-P0-04', 'P0', 'El mundo abierto incorpora actividades espaciales además de historia',
  ARCHIVOS.abierto, 'marca()', hayMarcadoresActividad && hayMarcaHistoria,
  'Los marcadores de historia no reemplazan los puntos de entrada de cada actividad.',
  'Dar ancla estable y mismo activity_id/seed a la actividad activada por menú o calle.');

// 6. Inicio de carrera: distinguir teletransporte no solicitado del viaje explícito.
const initCarrera = corte(A.modos, 'armarCarrera(extremo)', '  extremoVias(x0, y0, R, signo) {');
const teleport = /Object\.assign\(\s*C\s*,\s*\{\s*x\s*:\s*q0\.x/.test(initCarrera) ||
  !(/Llevarme ya/.test(initCarrera) && /Ir manejando/.test(initCarrera));   // 4.8: lejos de la salida se pregunta
evaluar('TC-P1-08', 'P1', 'La carrera ofrece traslado al ancla de forma explícita',
  ARCHIVOS.modos, 'Object.assign(C', !teleport,
  'Cambiar coordenadas al iniciar está permitido solo cuando el usuario acepta traslado o la ruta lo requiere claramente.',
  'Usar anchor de ActivityDefinition; mostrar “Ir al inicio” y diferenciar preparación de carrera.');

// 7. Elegibilidad por geografía no es un candado por progreso.
const hayCandado = /🔒/.test(corte(A.modos, 'menu() {', 'empezar(id)'));
const distingueGeografia = /no existe|otra ciudad|infraestructura|cambiar de ciudad/i.test(corte(A.modos, 'menu() {', 'empezar(id)'));
evaluar('TC-P1-07', 'P1', 'Menú distingue infraestructura ausente de progreso bloqueado',
  ARCHIVOS.modos, 'menu() {', !hayCandado || distingueGeografia,
  'Sin estaciones reales, no se debe afirmar que la actividad está bloqueada por historia.',
  'Mostrar “Solo en Medellín / Ir allí” y reservar candado para bloqueos reales.');

// 8. El teclado SI controla el metro: Controles.leer convierte teclas a stick.
const tren = corte(A.modos, 'manejarTren(dt, ent) {', '  finTren() {');
const tecladoSeTransforma = /if\s*\(ax\s*\|\|\s*ay\)[\s\S]{0,150}?sy\s*=\s*ay\s*\/\s*L/.test(A.controles);
const trenConsumeStick = (/ent\.stick\.y/.test(tren) && /ent\.stick\.m/.test(tren)) ||
  (/st\s*=\s*ent\.stick/.test(tren) && /st\.m/.test(tren) && /ent\.teclado/.test(tren));   // 4.8: alias st y palanca con teclado
evaluar('TC-OK-04', 'control', 'Metro mapea teclado a eje de joystick',
  ARCHIVOS.modos, 'manejarTren(dt, ent) {', tecladoSeTransforma && trenConsumeStick,
  'Teclas W/S y flechas generan ent.stick.y por Controles.leer(); se verificó en Chromium.',
  'Mantener pruebas de freno por teclado en CI y medir su respuesta frente a no pulsar tecla.');

// 9. Control principal / historia no obligatoria: señales positivas presentes.
// 9. Control principal / historia no obligatoria: señales positivas presentes.

evaluar('TC-OK-01', 'control', 'Aceleración fija disponible en el bucle',
  ARCHIVOS.juego, 'acelFijo:', /MC\.Manejo\.aplicar[\s\S]{0,300}acelFijo\s*:/.test(A.juego),
  'Comprobación textual de integración del acelerador persistente.',
  'Validar con pulsaciones reales, aceleración y parada en pista sin teletransporte.');
evaluar('TC-OK-02', 'control', 'Turbo táctil se traduce a correr a pie',
  ARCHIVOS.controles, "B.has('turbo')", /correr\s*:[^\n]*B\.has\('turbo'\)/.test(A.controles),
  'Evita resucitar un fallo histórico de tecla Shift exclusivo.',
  'Medir distancia de carrera a pie en táctil y teclado.');
evaluar('TC-OK-03', 'control', 'Existe acceso libre sin historia obligatoria',
  ARCHIVOS.inicio, 'bAbierto', /bAbierto/.test(A.inicio) && /mundo abierto|abierto\(\)/i.test(A.inicio),
  'Hay señales de portada libre; no certifica todos los estados de arranque.',
  'Probar primera partida y partida guardada en dispositivo real.');

const pendientes = resultados.filter(r => r.estado === 'REVISAR');
const salida = {
  autor: 'ChatGPT', fecha: '2026-11-22',
  tipo: 'heuristica_estatica_no_es_test_e2e',
  analizados: Object.values(ARCHIVOS).map(s => s),
  contratos: resultados,
  resumen: { total: resultados.length, detectados: resultados.length - pendientes.length,
    revisar: pendientes.length, urgentes: pendientes.filter(r => r.prioridad === 'P0').length }
};
if (process.argv.includes('--json')) console.log(JSON.stringify(salida, null, 2));
else {
  console.log('# CHATGPT · AUDITORÍA ESTÁTICA · Motor City / Turno Cero 4.7');
  for (const r of resultados) {
    console.log((r.estado === 'REVISAR' ? '⚠ ' : '✓ ') +
      r.id + ' ' + r.titulo + ' (' + r.ruta + (r.linea ? ':' + r.linea : '') + ')');
    if (r.estado === 'REVISAR') console.log('   ' + r.accion);
  }
  console.log('\nDetectados: ' + salida.resumen.detectados + '/' + salida.resumen.total +
    ' | Revisar: ' + salida.resumen.revisar + ' | P0: ' + salida.resumen.urgentes);
  console.log('No es verificación de jugabilidad ni test en GPU real.');
}
if (process.argv.includes('--estricto') && pendientes.some(r => r.prioridad === 'P0' || r.prioridad === 'P1'))
  process.exitCode = 1;
