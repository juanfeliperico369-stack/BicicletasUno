# Integrar lo nuevo en Juega EnCicla

**Para Gemini con Antigravity, ChatGPT con Codex y cualquier agente que entregue código o arte para EnCicla · v1.7.2 · 19‑nov‑2026.**

Esta guía dice **dónde y cómo** entra cada cosa del [plan único](PLAN-UNICO-IA.md):
- un vehículo;
- un modo de juego (la carrera sin fin de Run Scooter);
- una misión de la trama;
- el arte;
- un cambio del mapa;
- sus pruebas.

Si lo entregado sigue esta guía, entra sin tocar el resto del juego.

## 0. Reglas que no se negocian
- **Un solo HTML**, sin librerías externas (nada de Three.js, Phaser ni CDN) y sin internet. WebGL o Canvas 2D a mano.
- **Español de Colombia, todo público.** Sin datos personales.
- **Fluido en un celular modesto.** En la prueba con la CPU 4 veces más lenta, la mediana debe quedar por debajo de 40 ms por cuadro.
- **No romper el guardado** (`localStorage` `juegaencicla.v1`, objeto `Save.data`):
  - campos nuevos con valor por defecto (`S.x || (S.x = …)`);
  - nunca renombrar ni borrar los que ya existen.
- **El arte va como código de dibujo**, con respaldo procedural: si falta un dibujo nuevo, el juego usa el de siempre.
- **El mapa solo se cambia en `motor-valle/`** (ver [MOTOR.md](../motor-valle/MOTOR.md)).
- **Pruebas en verde:** `node tools/build.js` y `node tests/run.js` deben terminar en `✓ TODAS LAS PRUEBAS PASARON`.

## 1. Dónde va cada archivo
Los archivos de `src/js/` se juntan **en orden alfabético** en `dist/juega-encicla.html`. El número del nombre decide el orden.

| Qué | Archivo nuevo | Por qué ahí |
|---|---|---|
| Arte (funciones de dibujo) | `src/js/11-arte-<tema>.js` | Después de `10-art.js` (`Art`, `PAL`, `prect`…) |
| Vehículos | `src/js/26-veh-<id>.js` | Después del registro `25-vehiculos.js` |
| Modos y juegos | `src/js/94-<id>.js` (ya están `91-runner.js`, `92-vehiculos.js` y `93-trama.js`) | Después del registro `91-modos.js` y antes de `95-promo.js` y `99-boot.js` |
| Trama y textos | `contenido/guion/<nombre>.json` | `tools/build.js` lo embebe como `GUION.<nombre>` |
| Datos del mapa | `motor-valle/` | Nunca a mano en `src/data/` |
| Pruebas | una sección `3x)` en `tests/run.js` | Antes de `4) Rendimiento` |

## 2. Un vehículo nuevo (M5: scooter, bici eléctrica, skate, patines, monopatín)
**Registro:** `src/js/25-vehiculos.js`. Ahí también están las cifras exactas de los tres de siempre: la bici EnCicla, a pie y el camión de Balance.

```js
/* src/js/26-veh-scooter.js */
const _scooterCache = {};
function scooterTop(col) {   // visto desde arriba, mirando al norte y centrado · 16 px por casilla (1 m = 1,6 px)
  if (_scooterCache[col]) return _scooterCache[col];
  const c = document.createElement('canvas'); c.width = 8; c.height = 16; const b = c.getContext('2d');
  prect(b, 3, 1, 2, 14, '#23272f');      // tabla (1,0 m × 0,15 m)
  prect(b, 1, 2, 6, 1, '#d6dde6');       // manubrio
  prect(b, 2, 6, 4, 5, col);             // conductor (hombros)
  pdisc(b, 4, 8, 2, SKINS[1]);           // cabeza
  return (_scooterCache[col] = c);
}
JE.vehiculos.registrar('scooter', {
  n: 'Scooter eléctrico', corto: 'scooter', icon: '🛴',
  fis: { max: 70, acc: 45, brk: 80, coast: 30, w0: 4.2, w1: 2.2, tw: .08, r: 2.2 },   // px/s del diseño de 8 px (la bici: 60/30/72/40)
  asist: 1,                                   // motor: no se frena en las subidas
  suelo: t => t === TT.STEPS ? 0 : t === TT.GRASS ? .35 : (SURF[t] || .5),   // no sube escaleras, en el pasto casi no anda
  timbre: 1, bajar: 1, libre: 1,              // con timbre, se parquea y sale en el selector «Vehículo» del modo libre
  gasto: .05,                                 // energía por segundo en el modo libre (la bici gasta 0,35)
  spr: R => scooterTop(R.mode.shirt || PAL.vd),
  lado: (b, x, y, R, yo, fase) => { prect(b, x - 6, y - 3, 12, 2, '#23272f'); prect(b, x + 4, y - 14, 2, 11, '#d6dde6'); Art.person(b, x - 1, y - 3, yo, 0, 1); }   // vista panorámica
});
```

**Campos:**

| Campo | Qué es | Si falta |
|---|---|---|
| `n`, `corto`, `icon` | Nombre, nombre corto y emoji para avisos y botones | `n` = id |
| `base` | De quién hereda: `'bike'`, `'walk'` o `'truck'` | `'bike'` |
| `fis` | `max`, `acc`, `brk` y `coast` en px/s del diseño de 8 px (×`WK` y ×la velocidad elegida); `w0` y `w1` giro en rad/s parado y a toda marcha; `tw` inercia del giro en s; `r` radio de choque en px | Los de la base |
| `suelo(t)` | Multiplicador de la velocidad por tipo de casilla (`TT`) | El de la base |
| `loma` | `[k, mín, máx]`: en la pendiente `p`, la velocidad se multiplica por `clamp(1 − k·p, mín, máx)` | El de la base (bici `[2.2, .5, 1.32]`) |
| `asist` | `1`: no se frena en subida | No |
| `solido(t)` | `true` si no puede entrar a la casilla `t` | El de la base (`SOLID`) |
| `via` | `1`: solo por calles; el GPS y las salidas van por la vía | No |
| `spr(R)` | Lienzo visto desde arriba, mirando al norte | El de la base |
| `lado(b, x, y, R, yo, fase)` | Dibujo de lado en la vista panorámica | El de la bici |
| `timbre`, `bajar`, `libre`, `gasto` | Timbre, parquear, salir en el selector «Vehículo» del modo libre (`92-vehiculos.js`) y energía | `0`, `1`, `0`, la de la bici |

**API:**
- `JE.vehiculos.usar('scooter')`: súbete ya, en la partida actual.
- `JE.vehiculos.libres()`: los que se eligen en el modo libre.
- `JE.vehiculos.mejorar('bike', { spr, lado })`: arte nuevo para uno de siempre. Su física no se cambia: está probada.

## 3. Un modo nuevo (M4: la carrera sin fin)
**Registro:** `src/js/91-modos.js`. El modo sale solo en la pestaña **Ruta**, debajo de la carrera de postales, con un botón por nivel. Antes de empezar se ven sus metas y sus reglas. Gana estrellas por nivel, pero no toca la racha, las mejoras ni los logros del escalafón.

```js
/* src/js/92-sinfin.js */
class ModoSinFin extends Mode {
  constructor(role, turno, opt) {
    super(role, turno, opt);                        // this.t, this.score, this.rng (semilla), this.mods, this.goals…
    this.view = { kind: 'px', dw: 320, dh: 180 };   // búfer de 320×180 px que se escala a la pantalla ('fit': sin pixelar)
    this.vel = [9, 12, 15][turno - 1];              // m/s según el nivel; turno = nivel (1, 2, 3)
    this.dist = 0; this.carril = 1;
    this.goal('Recorre 800 m', true, () => this.dist >= 800, () => Math.round(this.dist) + ' m');
    this.goal('Recoge 20 hojas', false, () => this.hojas >= 20, () => (this.hojas | 0) + '/20');
  }
  update(dt) {                                      // dt en segundos (máx. 0,05)
    this.t += dt; const d = Input.dir();            // joystick o teclado: { x, y, m } (m de 0 a 1)
    if (d && d.m > .5 && !this.giro) { this.carril = clamp(this.carril + Math.sign(d.x), 0, 2); this.giro = 1; } else if (!d || d.m < .3) this.giro = 0;
    this.dist += this.vel * dt; this.score = Math.round(this.dist / 10);
    if (this.choco) this.end();                     // end(): termina y muestra el resultado
  }
  render(V) { const b = V.b; b.fillStyle = '#7ec8ff'; b.fillRect(0, 0, 320, 180); /* … el camino en 3D … */ }
  hud(V) { this.btns = []; V.text(Math.round(this.dist) + ' m', 12, 40, { size: 18, color: '#fff', bg: '#0a2342cc', pad: 4 }); }
  pointer(type, vx, vy, cx, cy) { if (type === 'down') { this.carril = clamp(this.carril + (cx < V_W() / 2 ? -1 : 1), 0, 2); return true; } return super.pointer(type, vx, vy, cx, cy); }
  bot() { /* lo que haría un jugador: para las pruebas */ }
}
const V_W = () => View.w;
JE.modos.registrar({
  id: 'sinfin', name: 'Carrera sin fin', cls: ModoSinFin, emoji: '🛴',
  niveles: ['Fácil', 'Rápida', 'Turbo'],
  desc: 'Por la ciclorruta: esquiva huecos y conos, salta y recoge hojas.',
  how: ['Desliza a los lados para cambiar de carril.', 'Arriba para saltar los huecos.', 'Cada 200 m va más rápido.']
});
```

**Lo que el juego llama en el modo:**

| Método | Cuándo |
|---|---|
| `update(dt)` | Cada cuadro, sin pausa |
| `render(V)` | Dibujar en `V.b` (Canvas 2D del búfer, en px de `view`) |
| `renderTop(V)` (opcional) | Capa nítida en `V.ctx`, la pantalla |
| `hud(V)` | Textos y botones del lienzo: `V.text(t, x, y, { size, color, bg, pad, align, body })` y `this.button(…)` |
| `info()` | Lo de arriba: `{ clock, score, chips: [{ t, c }] }` |
| `actions()` | Botones redondos de la derecha: `[{ id, icon, label, fn }]` |
| `pointer(type, vx, vy, cx, cy)` y `key(e)` | Toque y teclado |
| `result()` | Por defecto sale de las metas: las obligatorias (`main`) aprueban y cada meta cumplida es una estrella |

**Vistas (`this.view.kind`):**
- `'px'`: búfer pixelado de `dw × dh`;
- `'fit'`: el mismo búfer, suave;
- `'map'`: la ciudad, con `MapMode` y `this.setupRide({ start: { x, y } })`, como los oficios.

Para **WebGL**, crea tu propio `<canvas>` encima de `#cv` en el constructor y quítalo cuando termine el modo.

**El mapa real para la carrera:**

| Llamada | Devuelve |
|---|---|
| `JE.map.lanes` | Ciclorrutas: polilíneas con `len` en px; `cv` es la ciclovía |
| `JE.map.at(L, s)` | `{ x, y, a }` a `s` px del inicio |
| `JE.map.project(L, x, y)` | `{ s, d }` |
| `JE.map.slope(x, y, a)` | La pendiente real |
| `JE.map.get(tx, ty)` | El tipo de casilla (`TT`) |
| `JE.map.lanesNear` | Las ciclorrutas cercanas |
| `JE.map.district` | El barrio |

Unidades: `TS = 16` px por casilla de 10 m (1 m = 1,6 px).

**Utilidades:**
- **Sonido:** `Snd.sfx('tap' | 'coin' | 'ok' | 'bad' | 'win' | 'star' | 'bell')` y `Snd.note(n, { type, v })`.
- **Avisos:** `JE.ui.toast(texto)`.
- **Guardar lo propio:** `const J = Save.data.juegos || (Save.data.juegos = {});` y luego `Save.save()`.
- **Para probar sin el menú:** `Game.start('sinfin', 1, { seed: 1, nov: NOVEDADES[0] })`.

## 4. Una misión de la trama (M6)
**Archivo:** `contenido/guion/misiones.json`. Son misiones del modo libre. Salen una o dos por día, las mismas todo el día, antes de las misiones menores. El lector está en `src/js/83-guion.js` (`guionMisiones`).

```json
{
  "id": "efrain-1",
  "txt": "Saluda a don Efraín, que cuida la red del Metro, en el Parque Norte",
  "lugar": "parquenorte",
  "nombre": "Don Efraín",
  "dias": "sabado|domingo|festivo",
  "desde": "8:00 a. m.",
  "hasta": "5:00 p. m.",
  "req": ["rosalba-1"],
  "h": 10,
  "xp": 25,
  "despues": "🔧 Don Efraín: «La red no es de hierro: es de la gente que la cuida.»",
  "huevo": "metro-efrain"
}
```

**Campos:**

| Campo | Qué es |
|---|---|
| `lugar` | Un id de `LUGARES` (`src/js/19-lugares.js`: `botero`, `pies`, `parquenorte`, `comuna13`…) o `[lat, lon]` |
| `dias` | `semana`, `sabado`, `domingo` y `festivo`, separados con `|`, o `todos` |
| `desde` y `hasta` | La hora, con el formato `7:00 a. m.` |
| `req` | Misiones de la trama que ya se deben haber hecho |
| `repite` | `true`: se puede repetir |
| `h` y `xp` | Hojas y experiencia |
| `despues` | Una frase o una lista, al cumplirla |
| `huevo` | El fragmento escondido (Easter egg) que queda en `Save.data.huevos` |

Lo hecho queda en `Save.data.tramaHechas`. (`Save.data.trama` es el estado de la trama «Ruedas y Rieles» de `93-trama.js`.)

**Los otros guiones** son JSON en la misma carpeta:
- `dia_del_valle.json`: la campaña, con un capítulo por turno;
- `ciudad.json`: lo que dice la ciudad por momento;
- `tutor.json`: los consejos por oficio;
- `fiestas.json`: los saludos de fiesta;
- `metro.json`: los huevos de pascua de El Metro, con Rosalba, su nieta y don Efraín.

## 5. El arte (M2, M3, M4 y M5)
- **Siempre código de dibujo:** Canvas 2D (o WebGL) que pinta en un lienzo propio, guardado en caché por clave (`color`, `fase`). Nada de imágenes externas.
- **Escala:** 16 px por casilla de 10 m, es decir 1 m = 1,6 px. Las vistas desde arriba miran al norte y van centradas. En la ciudad 3D, la altura se da en pisos (1 piso ≈ 3 m).
- **Paleta base** (`PAL` en `10-art.js`):

  | Nombre | Color |
  |---|---|
  | azul | `#0a2342` |
  | verde EnCicla | `#9bd341` |
  | crema | `#f4efd8` |
  | ámbar | `#ffc93c` |
  | coral | `#ff6b5a` |
  | cielo | `#56c7ff` |

  También están `SKINS`, `SHIRTS`, `HELMETS` y `BIKES`.
- **Ayudas:**
  - `prect(b, x, y, w, h, col)`, `pdisc(b, x, y, r, col)` y `pline(b, x0, y0, x1, y1, col)`;
  - `shade(col, k)` aclara u oscurece;
  - `Art.night(min)`: de 0 (día) a 1 (noche), para las luces y las ventanas encendidas.
- **El sistema Metro** se dibuja con `SisSpr` (`74-sistema.js`), que es el diseño de El Metro: no se duplica.
- **Arte nuevo para algo que ya existe:** se cambia la función y se deja la anterior como respaldo. En los vehículos se usa `JE.vehiculos.mejorar`.

## 6. Un cambio del mapa (M2: túneles, deprimidos, cuadrícula de dos niveles)
- Va en `motor-valle/`: `geo/build.py` y `geo/alturas.py`, o una capa nueva en `motor-valle/capas/`. Hay que subir la versión en `VERSION.json`.
- Se genera con `node motor-valle/motor.mjs encicla` y se copia a El Metro con `node motor-valle/sincronizar.mjs ../MetroZero`.
- **Cómo lo lee el juego:** los puentes y el viaducto llegan por `alturas.json` y `76-altura.js`. Un túnel puede seguir el mismo camino, con un nivel `-1`: va debajo de la calle, sin dibujarse encima.

## 7. Pruebas
1. `node tools/build.js`: compila `dist/juega-encicla.html` y `dist/ENCICLA-TODO.md`.
2. `node tests/run.js`: autotest, minijuegos, 54 partidas del bot, interfaz sin encimados, cada versión (3k, 3l, 3m…) y rendimiento.
3. **Una sección nueva** por cada cosa entregada, como la `3m` (registro de vehículos, modos y trama):
   - registra lo nuevo;
   - juégalo unos segundos;
   - comprueba que no deja errores (`JE.errors`);
   - limpia lo que creó.
4. **Juégalo de verdad:**
   - en un celular de 412 × 915 y acostado (915 × 412);
   - en un computador;
   - de día y de noche, con lluvia;
   - en 3D, en pixel y en la vista panorámica.

## 8. La entrega
Según el plan único, **todo en un solo documento**:
- el código completo de cada archivo nuevo o cambiado, con su ruta;
- el arte como código;
- cómo se probó.

Claude lo arma en el juego, corre las pruebas y lo publica.
