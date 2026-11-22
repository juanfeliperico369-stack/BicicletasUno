/* OpenAI GPT-6 · Regresión geométrica aislada, sin navegador ni datos privados.
 * Ejecutar: node tests/prueba-gpt6-ciclorrutas.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/js/92-ciclovia.js', import.meta.url), 'utf8');
const patch = fs.readFileSync(new URL('../src/js/99r-ciclo-geometria-gpt6.js', import.meta.url), 'utf8');
const clase = source.slice(source.indexOf('class TramoCiclista'), source.indexOf('class CarreraCiclovia'));
assert.ok(clase.includes('class TramoCiclista'), 'No se encontró clase original: el test requiere revisión');
const avisos = [];
const ctx = {
  Math, Number, M_PER_PX: 0.625, NOMB: x => x,
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  JE: { ui: { toast: s => avisos.push(s) }, map: { vias: [] } },
  TT: { CICLO: 7, AVE: 5, AUTO: 14 },
  CarreraCiclovia: class {},
  Mode: class { runSub() { this.pasadas = (this.pasadas || 0) + 1; return 'sub'; } },
  ModeUsuarioR: class {
    iniciarRunner3D() { this.llamadas = (this.llamadas || 0) + 1; return 'iniciado'; }
  }
};
vm.createContext(ctx);
vm.runInContext(clase + '\nglobalThis.TramoCiclista = TramoCiclista;', ctx);
vm.runInContext(patch, ctx);

const larga = { k: 5, n: 'Ruta real', p: [0, 0, 1000, 0] };
const falsaCerca = { k: 5, n: 'Ruta paralela', p: [798, 55, 1100, 55] };
const corta = { k: 5, n: 'Tramo demasiado corto', p: [800, 0, 810, 0] };
const mapa = { vias: [falsaCerca, corta, larga] };
const pos = { x: 800, y: 2 };
const q = ctx.JE.cicloGeoGPT6.cercana(mapa, pos);
assert.equal(q.via, larga, 'Debe elegir el segmento cercano, no el primer vértice');
assert.ok(Math.abs(q.inicioMetros - 500) < 0.001, 'Progresiva sobre el segmento correcta');
assert.ok(Math.abs(q.distanciaMetros - 1.25) < 0.001, 'Distancia en metros');
assert.equal(ctx.JE.cicloGeoGPT6.acceso(mapa, { x: 800, y: 60 }, 12).via, falsaCerca);
assert.equal(ctx.JE.cicloGeoGPT6.acceso(mapa, { x: 800, y: 100 }, 12), null, 'No debe habilitar una zona fuera del corredor');

const tramo = ctx.TramoCiclista.cercana(mapa, pos);
assert.ok(Math.abs(tramo.punto(0).x - 800) < 0.001, 'Entrada en la posición geográfica proyectada');
assert.ok(Math.abs(tramo.punto(12).x - 819.2) < 0.001, 'La progresiva conserva metros');
assert.ok(Number.isFinite(tramo.punto(-5).x), 'No debe sufrir por progresiva negativa');
assert.equal(ctx.JE.cicloGeoGPT6.proyectar({ p: [0, 0, 0, 0] }, pos), null, 'Polilínea degenerada');

ctx.JE.map = mapa;
const jugador = new ctx.ModeUsuarioR();
jugador.free = true; jugador.sub = null; jugador.ride = { p: { ...pos, veh: 'bike' }, tileAt: () => 4 };
jugador.mods = { ciclovia: false };
assert.equal(jugador.iniciarRunner3D(), 'iniciado');
jugador.ride.p.x = 800; jugador.ride.p.y = 100;
assert.equal(jugador.iniciarRunner3D(), false, 'Fuera de corredor: no activa runner');
assert.equal(jugador.llamadas, 1, 'El rechazo no debe tocar el modo previo');
jugador.ride.p.veh = 'truck'; jugador.ride.p.y = 0;
assert.equal(jugador.iniciarRunner3D(), false, 'Camión incompatible con ciclorruta');
jugador.ride.p.veh = 'bike'; jugador.ride.tileAt = () => ctx.TT.CICLO;
assert.equal(jugador.iniciarRunner3D(), 'iniciado', 'Los tiles de ciclorruta también habilitan');
jugador.ride.tileAt = () => ctx.TT.AVE; jugador.mods.ciclovia = true;
ctx.JE.map = { vias: [] };
assert.equal(jugador.iniciarRunner3D(), 'iniciado', 'Ciclovía temporal del evento está habilitada');
assert.ok(avisos.length >= 2, 'Debe explicar por qué se bloquea');

const libre = new ctx.Mode();
libre.free = true; libre.ride = { p: { x: 800, y: 100 } };
ctx.JE.map = mapa;
assert.equal(libre.runSub(new ctx.CarreraCiclovia()), false, 'El Taller no puede saltar de una calle lejana a otra ciclorruta');
libre.ride.p.y = 0;
assert.equal(libre.runSub(new ctx.CarreraCiclovia()), 'sub', 'El Taller sí abre en una ciclorruta');
const cerrado = new ctx.Mode(); cerrado.free = false;
assert.equal(cerrado.runSub(new ctx.CarreraCiclovia()), 'sub', 'El menú de niveles sigue libre');

console.log('OK OpenAI GPT-6: proyección a segmentos, progresiva, radio, carriles y runner contextual');
