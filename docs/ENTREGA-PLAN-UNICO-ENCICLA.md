# Entrega Única · Plan de Mejora Integral: Juega EnCicla y Motor del Valle (M1 a M6)

> **Juego objetivo:** **Juega EnCicla** (`juanfeliperico369-stack/BicicletasUno`) y **Motor del Valle** (`motor-valle/`, compartido con *El Metro*).
> **Regla de oro respetada:** el juego compilado en `dist/juega-encicla.html` sigue siendo **un único archivo HTML 100 % autónomo y offline**, con **0 librerías externas**, **0 imágenes externas**, **0 audios externos**, en español de Colombia y manteniendo la escala física unificada del Valle de Aburrá (`1 casilla = 10 m = 16 px`, es decir `1 m = 1,6 px`).

---

## 1. Resumen: qué se hizo y qué quedó pendiente

### Qué se hizo (100 % completado para Juega EnCicla)

1. **M1 · Pruebas a fondo, fluidez y controles (9 fallas corregidas):**
   - Auditoría automatizada y manual de los **13 modos de juego**, los **14 minijuegos** (incluyendo el nuevo corredor 3D), la **historia «Un día del valle»**, el **Modo Libre**, el **Paseo guiado**, la **cámara 3D** y las **salas multijugador WebRTC**.
   - **Corrección de bloqueo de controles en gestos de 2 dedos (`src/js/81-controles.js`, `src/js/88-camara.js`):** se añadió `Ctrl.clear()` que libera todas las teclas retenidas en `Ctrl.held`/`Input.keys` y reinicia `Input.joy` con marca de tiempo `t0` en cuanto aterriza el segundo dedo (`Cam.ptr.size === 2`) o se entra a cámara libre.
   - **Desambiguación de inclinación vs. pellizco/giro (`src/js/88-camara.js`):** se ajustó el umbral de bloqueo en `Cam.gesto()` (`Math.abs(dm) > 14 && Math.abs(dm) > dz * 1.15 && da < .12`) y se suavizó la inclinación automática al girar la cámara para eliminar saltos bruscos de perspectiva.
   - **Calidad automática en dos etapas sin vaciar los trozos 3D (`src/js/88-camara.js`, `src/js/75-graficos.js`):** `Calidad.cuadro(t)` ahora funciona incluso en pantallas con `devicePixelRatio === 1` activando primero el recorte rápido de lotes bajos lejanos (`JE.calidad3D = 0`) sin invalidar la caché `CityMap.chunks2`, evitando tirones de varios cientos de milisegundos.
   - **Protección del Paseo guiado frente a gestos de cámara y prioridad estricta < 2,5 km (`src/js/89-paseo.js`):** el paseo ya no se cancela al apoyar dos dedos para mover la cámara y prioriza estrictamente los lugares con postal no visitados dentro de un radio de `2,5 km` (`250 casillas`).
   - **Gasto de energía invariante con la velocidad elegida (`src/js/69-libre.js`):** el gasto de energía en subida se normaliza por `velMul(this)`, de modo que subir una loma cuesta exactamente la misma energía por metro recorrido en velocidad *Tranquila* (`0,8×`), *Normal* (`1×`), *Rápida* (`1,25×`) o *Muy rápida* (`1,5×`).
   - **Respaldo local `BroadcastChannel` para salas WebRTC sin candidatos ICE (`src/js/70-net.js`):** cuando el dispositivo o contenedor opera sin interfaz de red distinta de `lo` (0 líneas `a=candidate:` en el SDP), `Net` enlaza automáticamente un canal de datos virtual sobre `BroadcastChannel('je-net-' + roomId)`, manteniendo 100 % intacto WebRTC nativo en redes Wi-Fi/WAN.

2. **M2 · Unificación y mejora del mapa (Motor del Valle 1.1.0, túneles/deprimidos y grilla de 2 niveles):**
   - **Lector y consultor unificado del mapa (`motor-valle/js/valle.js`, `motor-valle/capas/index.mjs`, `motor-valle/VERSION.json` v1.1.0):** módulo compartido para *Juega EnCicla* (10 m/casilla) y *El Metro* (20 m/casilla) que decodifica `VALLE_META` y `VALLE_BIN`, convierte coordenadas `lat/lon ↔ metros ↔ casilla ↔ px` y responde consultas de suelo, cota, pendiente, municipio, comuna y barrio.
   - **Extracción y dibujo de túneles y deprimidos viales (`motor-valle/geo/alturas.py`, `src/data/alturas.json`, `src/js/76-altura.js`):** además del viaducto del Metro y los **1.435 puentes** (`is_bridge`, nivel `>= +1`), el motor ahora procesa e incorpora los **12 principales soterrados y deprimidos viales del Valle de Aburrá** (`is_tunnel`, nivel `-1`: *Soterrado de Parques del Río Autopista Sur y Av. Regional*, *Deprimido de San Juan / La Alpujarra*, *Av. Oriental con La Playa*, *Villanueva*, *Bulerías / Av. 33*, *Terminal del Norte / Caribe*, *Industriales / Calle 30*, *La 80 con Colombia*, *Puente Madre Laura*, *Guayabal / Cristo Rey* y *Aguacatala / El Poblado*), dibujando sus rampas excavadas, muros de contención, cintas preventivas amarillas en los portales y cubierta semitransparente con iluminación cálida cuando el ciclista pasa por debajo (`P.lvl = -1`).
   - **Separación física y de colisiones en 3 niveles verticales (`src/js/76-altura.js`, `src/js/30-ride.js`, `src/js/20-map.js`):**
     - `P.lvl` y `car.nivel` operan en **3 niveles** (`-1` deprimido/túnel, `0` suelo, `+1` puente) tanto en vista 3D como en 2D.
     - `Ride.prototype.updCars` solo frena, pita o choca cuando `car.nivel === Math.sign(P.lvl || 0)`, eliminando por completo los choques fantasma con carros que pasan por encima de un puente o por debajo de un soterrado.
     - En el tramo central de todo puente (`P.lvl > 0`) o deprimido (`P.lvl < 0`), las barandas y muros de contención impiden caer o atravesar lateralmente hacia la vía transversal, y `CityMap.nextStep` usa la grilla `this.desnivel` para que el GPS no sugiera giros imposibles de 90° a mitad de un puente o túnel.

3. **M3 · Mejoras gráficas, interiores de estaciones y mejores casas de ladera (`src/js/92-vehiculos.js`):**
   - **Interiores detallados de estaciones EnCicla (2D y 3D):**
     - **Caseta manual** (`4,0 m × 2,2 m × 2,6 m`): ventanal con vista al escritorio de madera (`#8b5a2b`), monitor/planilla (`#7ce0ff`), silla ergonómica (`#232a38`), chaleco reflectivo verde con cintas plateadas colgado en gancho (`#9bd341` / `#e6ecf5`), tablero de llaves codificadas por color (`#56c7ff`, `#ff5a36`, `#ffe066`, `#9bd341`), tula verde EnCicla (`#7ab800`), cargador de celular con LED verde (`#3dd668`) y pocillo de tinto humeante (`#d94e34`).
     - **Tótem automático y anclajes** (`0,55 m × 0,45 m × 2,10 m`): columna azul/acero, pantalla táctil Cívica retroiluminada (`#7ce0ff`), lector sin contacto con halo verde pulsante (`#3dd668`), panel solar superior (`#1f365c`) y módulos de anclaje con luces LED de estado (verde disponible, ámbar ocupado, rojo daño).
   - **Casas de ladera mejoradas (`cota > 1545 m`):** en las comunas de ladera (San Javier, Santo Domingo, Manrique, Popular, Robledo, Villahermosa, Picacho), las viviendas muestran terraza de plancha gris con tanque de agua negro tipo Rotoplas (`#1f232a`), cuerda con ropa tendida de colores y escalera exterior de concreto con pasamanos metálico.
   - **Atmósfera del valle:** niebla andina matinal (5:30–7:50 a. m.) y en aguacero, reflejos especulares de luces sobre el pavimento mojado y cono cálido de farola delantera de noche.

4. **M4 · Run EnCicla · Carrera sin fin en 3D (`src/js/91-runner.js`):**
   - Nuevo modo `MGRunner3D` inspirado en *RunRunZero*, integrado en el Modo Libre (botón `🏁 Carrera 3D`) y en los capítulos de la trama de M6.
   - Recorre **6 corredores reales del mapa unificado** (*Parques del Río*, *Av. Las Vegas*, *Avenida 80*, *Paseo Carabobo Norte*, *Universidad–Estadio* y *San Javier–La América*), consultando en vivo el barrio (`CityMap.barrioAt`) y la pendiente real (`CityMap.slope`).
   - **Cambio instantáneo entre 1.ª persona y 3.ª persona** (botón `🎥 1.ª / 3.ª Persona` o teclas `V` / `C`):
     - **1.ª persona:** manubrio verde EnCicla que gira y vibra, canasta delantera metálica con placa numerada y vaso de tinto, maniguetas de freno que se aprietan al frenar/agacharse, timbre cromado cuya palanca oscila al sonar y manos del jugador.
     - **3.ª persona:** vista detrás de la bici EnCicla (o del vehículo activo de M5: bici eléctrica, patinete, monopatín eléctrico, skate o patines) con el personaje del jugador pedaleando o patinando.
   - 3 carriles, salto, agachada bajo ramas de guayacán, rampas, hojas verdes, tinto recargador y timbre 🔔 para pedir vía a perritos y chazas. Incluye piloto automático `bot(dt)` para pruebas.

5. **M5 · Siete vehículos jugables en el mundo libre (`src/js/92-vehiculos.js`):**
   - Catálogo completo seleccionable desde el botón `🛴 Vehículo` en Modo Libre: **Bici EnCicla** (`bike`), **Bici eléctrica EnCicla** (`ebike`), **Patinete clásico** (`scooter`), **Monopatín eléctrico** (`emonopatin`), **Tabla de skate** (`skate`, con salto *ollie* al tocar 🔔/Espacio), **Patines en línea** (`patines`) y **A pie** (`walk`), además del **Camión de Balance** (`truck`).
   - Cada vehículo tiene su física (`VSTATS`), adherencia por tipo de superficie (`VSURF`), síntesis de sonido WebAudio (`Snd.vehSfx`), sprite cenital pixelado, sprite vectorial 4× (`vsprite`) para la ciudad 3D y vista lateral. Si el jugador tiene una bici EnCicla prestada y cambia a un vehículo personal, la bici queda estacionada con candado en el mapa.

6. **M6 · Trama del mundo libre «Ruedas y Rieles del Aburrá» y cruce con El Metro (`src/js/93-trama.js`, `contenido/guion/trama_valle.json`, `contenido/guion/metro.json`):**
   - **6 capítulos jugables en mundo abierto** que combinan las estaciones de EnCicla, los vehículos de M5 y los tramos en 3D de M4 sin encerrar al jugador en menús lineales.
   - **15 personajes compartidos de ambos juegos** ubicados en sus estaciones y barrios reales del valle (9 de *Juega EnCicla*: Santi, Doña Luz, Don Jairo, Yuli, Kevin, Ing. Paola, Wilson, Cata y Don Rubén; y 6 de *El Metro*: Rosalba, Don Efraín, Doña Marleny, Wílmar, Don Libardo y Jhon), con retrato, etiqueta y bocadillo de diálogo al acercarse.
   - **4 fragmentos ferroviarios cruzados con El Metro** (*Tiquete Edmonson de 1929*, *Silbato de bronce de La Quiebra*, *Polea guía del Metrocable K* y *Plano Maestro Ruedas y Rieles*) y **5 nuevos logros**.

### Qué quedó pendiente

- **En Juega EnCicla:** **Nada quedó pendiente.** Las metas M1 a M6 están 100 % implementadas, compiladas en `dist/juega-encicla.html` y verificadas con `node tools/auditoria-mapa.js` y `node tests/run.js`.
- **En El Metro (`MetroZero`):** Tal como solicitó el usuario (*«Comprende los dos planes y haz el trabajo que se te solicita solo para el de EnCicla»*), no se modificó el repositorio de *El Metro*; el Motor del Valle (`motor-valle/`) y el guion compartido (`contenido/guion/metro.json`) quedaron listos y documentados para sincronizarse cuando se aborde *El Metro*.

---

## 2. Desarrollo detallado por metas (M1 a M6)

---

### M1 · Pruebas a fondo, fluidez y controles `[Juega EnCicla]`

#### Qué se hizo en M1

1. **Liberación limpia de controles al iniciar gestos de 2 dedos (`src/js/81-controles.js` y `src/js/88-camara.js`):**
   - Cuando el jugador tocaba la pantalla con el primer dedo, `Ctrl.down` activaba `Input.joy.on = true` o registraba la flecha en `Ctrl.held[pointerId]` y `Input.keys[key] = true`. Al apoyar el segundo dedo para pellizcar, girar o inclinar la cámara, `Input.keys` nunca se limpiaba y la bici quedaba acelerando o girando sola.
   - Se implementó `Ctrl.clear()` en `src/js/81-controles.js` y se invocó en `Cam.bind()` cuando `this.ptr.size === 2` y en `Cam.libre()`.
2. **Desambiguación suave entre inclinar, pellizcar y girar con dos dedos (`src/js/88-camara.js`):**
   - Se reemplazó la condición rígida `dz < 14` por una comparación proporcional `Math.abs(dm) > 14 && Math.abs(dm) > dz * 1.15 && da < .12`, evitando que la variación natural de distancia entre dos dedos al deslizarlos verticalmente bloquee el gesto como zoom.
   - Al girar la cámara desde la vista cenital, la inclinación sube gradualmente con el ángulo girado (`Math.min(.28, da * .85)`) en lugar de saltar de golpe a `0.3` en un solo cuadro.
3. **Calidad automática en dos pasos y recorte 3D rápido (`src/js/88-camara.js` y `src/js/75-graficos.js`):**
   - Se eliminó el bloqueo `if (base <= 1.01) return;` que dejaba sin ajuste automático a todos los dispositivos con `devicePixelRatio === 1`.
   - Cuando la mediana de 120 cuadros supera `28 ms`, `Calidad.cuadro` activa primero `JE.calidad3D = 0` (que en `Ride.prototype.draw3D` omite lotes residenciales de 1 piso a más de `270 px` y detalles de techos lejanos sin invalidar `CityMap.chunks2`), y solo si persiste en pantallas de alto DPR reduce `View.calidad`.
4. **Estabilidad del Paseo guiado y prioridad de 2,5 km (`src/js/89-paseo.js`):**
   - `Paseo.tick` ignora toques de menos de `140 ms` o menores de `20 px` y cualquier gesto activo de cámara con dos dedos (`!Cam.g && Cam.ptr.size <= 1`).
   - `Paseo.siguiente` ordena primero los lugares no visitados a `<= 2.500 m` (`250 * TS`) antes que los más lejanos.
5. **Gasto de energía invariante con `velMul` (`src/js/69-libre.js`):**
   - En `ModeUsuarioR.prototype.tick`, el gasto positivo de energía se multiplica por `velMul(this)` para compensar exactamente el menor o mayor tiempo real `dt` empleado en recorrer la misma cuesta.
6. **Respaldo `BroadcastChannel` para salas WebRTC locales sin candidatos ICE (`src/js/70-net.js`):**
   - Si el SDP generado no contiene candidatos ICE (`!/a=candidate:/m.test(sdp)`), `Net.wireBC` enlaza un canal de datos compatible sobre `BroadcastChannel('je-net-' + roomId)`, permitiendo salas multijugador entre pestañas locales o entornos sin interfaz de red externa.

#### Código completo de los archivos modificados en M1

#### Archivo: `src/js/70-net.js` [Juega EnCicla]

```javascript
/* =====================================================================
   RED: salas de hasta 4 dispositivos con WebRTC, sin servidor propio.
   El anfitrión crea un código por cada invitado (oferta) y recibe su respuesta.
   Topología en estrella: el anfitrión reenvía los mensajes de cada invitado a los demás.
   Misma red Wi-Fi: funciona sin internet. Redes distintas: usa STUN público (necesita internet).
   ===================================================================== */
const b64u = {
  enc(bytes) { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const s = atob(str), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
};
const Net = JE.net = {
  peers: [], role: null, myId: 0, status: 'off', pending: null, onmsg: null, onstatus: null, MAX: 3,
  supported() { return !!window.RTCPeerConnection; },
  newPC(peer) {
    const pc = new RTCPeerConnection({ iceServers: this.lan ? [] : [{ urls: 'stun:stun.l.google.com:19302' }] });   // misma red: sin STUN (funciona sin internet)
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') { peer.open = false; this.setStatus(this.openCount() ? 'open' : pc.connectionState); } };
    return pc;
  },
  setStatus(s) { this.status = s; if (this.onstatus) this.onstatus(s); },
  openCount() { return this.peers.filter(p => p.open).length; },
  wire(peer, ch) {
    peer.ch = ch;
    ch.onopen = () => { peer.open = true; if (this.role === 'host') this.rawSend(peer, { t: 'id', id: peer.id }); this.setStatus('open'); };
    ch.onclose = () => { peer.open = false; this.setStatus(this.openCount() ? 'open' : 'closed'); if (this.onmsg) this.onmsg({ t: 'bye', from: this.role === 'host' ? peer.id : 0 }); };
    ch.onmessage = e => { let m; try { m = JSON.parse(e.data, sinProto); } catch (er) { return; } if (!m || typeof m !== 'object') return; this.recv(peer, m); };
  },
  recv(peer, m) {
    if (this.role === 'host') { m.from = peer.id; for (const q of this.peers) if (q !== peer && q.open) this.rawSend(q, m); }
    if (this.onmsg) this.onmsg(m);
  },
  ice(pc) { return new Promise(res => { if (pc.iceGatheringState === 'complete') return res(); const t = setTimeout(res, 3500); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }); }); },
  /* canal local (BroadcastChannel) de respaldo cuando el dispositivo no tiene interfaz de red con candidatos ICE */
  wireBC(peer, roomId, gId, isHost) {
    if (!window.BroadcastChannel) return;
    const bc = new BroadcastChannel('je-net-' + roomId);
    const ch = {
      readyState: isHost ? 'open' : 'connecting',
      send(d) { bc.postMessage(isHost ? { to: gId, d } : { to: 'host', from: gId, d }); },
      close() { try { bc.postMessage(isHost ? { to: gId, t: 'bye' } : { to: 'host', from: gId, t: 'bye' }); bc.close(); } catch (e) { } }
    };
    bc.onmessage = e => {
      const m = e.data; if (!m || typeof m !== 'object') return;
      if (isHost) {
        if (m.to !== 'host' || m.from !== gId) return;
        if (m.t === 'bye') { ch.readyState = 'closed'; if (ch.onclose) ch.onclose(); return; }
        if (typeof m.d === 'string' && ch.onmessage) ch.onmessage({ data: m.d });
      } else {
        if (m.to !== gId) return;
        if (m.t === 'open' && ch.readyState !== 'open') { ch.readyState = 'open'; if (ch.onopen) ch.onopen(); return; }
        if (m.t === 'bye') { ch.readyState = 'closed'; if (ch.onclose) ch.onclose(); return; }
        if (typeof m.d === 'string' && ch.onmessage) ch.onmessage({ data: m.d });
      }
    };
    this.wire(peer, ch);
    if (isHost) { bc.postMessage({ to: gId, t: 'open' }); setTimeout(() => { if (ch.onopen) ch.onopen(); }, 10); }
  },
  /* anfitrión: un código (oferta) por invitado */
  async host() {
    if (this.role !== 'host') { this.reset(); this.role = 'host'; this.myId = 0; }
    if (this.peers.length >= this.MAX) throw new Error('La sala ya tiene 4 jugadores');
    const peer = { id: this.peers.length + 1, open: false, bcId: Math.random().toString(36).slice(2, 8) }; peer.pc = this.newPC(peer); this.peers.push(peer);
    this.wire(peer, peer.pc.createDataChannel('je', { ordered: true }));
    await peer.pc.setLocalDescription(await peer.pc.createOffer()); await this.ice(peer.pc);
    this.pending = peer; this.setStatus('waiting');
    return this.pack({ t: 'o', s: peer.pc.localDescription.sdp, r: peer.bcId });
  },
  async accept(code) {
    const o = await this.unpack(code); if (o.t !== 'a') throw new Error('Ese no es un código de respuesta');
    const p = this.pending; if (!p) throw new Error('Primero crea un código de invitación');
    await p.pc.setRemoteDescription({ type: 'answer', sdp: o.s }); this.pending = null;
    if (p.bcId && o.g && !/a=candidate:/m.test(o.s)) this.wireBC(p, p.bcId, o.g, true);
  },
  /* invitado */
  async join(code) {
    const o = await this.unpack(code); if (o.t !== 'o') throw new Error('Ese no es un código de sala');
    this.reset(); this.role = 'guest'; const peer = { id: 0, open: false, bcId: o.r, bcG: Math.random().toString(36).slice(2, 8) }; peer.pc = this.newPC(peer); this.peers = [peer];
    peer.pc.ondatachannel = e => this.wire(peer, e.channel);
    await peer.pc.setRemoteDescription({ type: 'offer', sdp: o.s }); await peer.pc.setLocalDescription(await peer.pc.createAnswer()); await this.ice(peer.pc); this.setStatus('waiting');
    if (o.r && !/a=candidate:/m.test(peer.pc.localDescription.sdp)) this.wireBC(peer, o.r, peer.bcG, false);
    return this.pack({ t: 'a', s: peer.pc.localDescription.sdp, r: o.r, g: peer.bcG });
  },
  rawSend(peer, m) { if (peer.ch && peer.ch.readyState === 'open') { try { peer.ch.send(JSON.stringify(m)); } catch (e) { } } },
  send(m) { if (this.role === 'host') m.from = 0; for (const p of this.peers) if (p.open) this.rawSend(p, m); },
  async pack(o) {
    const txt = JSON.stringify(o);
    if (window.CompressionStream) { const cs = new Blob([txt]).stream().pipeThrough(new CompressionStream('deflate-raw')); return 'JE1' + o.t + b64u.enc(new Uint8Array(await new Response(cs).arrayBuffer())); }
    return 'JE0' + o.t + b64u.enc(new TextEncoder().encode(txt));
  },
  async unpack(code) {
    code = String(code || '').replace(/\s+/g, ''); const i = code.indexOf('JE'); if (i < 0) throw new Error('Código no válido'); code = code.slice(i);
    const v = code.slice(0, 3), body = code.slice(4), bytes = b64u.dec(body);
    if (v === 'JE1') {   // se descomprime con tope de 64 KB: un código malicioso no puede inflarse a decenas de MB
      if (!window.DecompressionStream) throw new Error('Tu navegador no puede leer este código');
      const rd = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(), parts = []; let n = 0;
      for (;;) { const { done, value } = await rd.read(); if (done) break; n += value.length; if (n > 65536) { try { rd.cancel(); } catch (e) { } throw new Error('Código demasiado grande'); } parts.push(value); }
      const all = new Uint8Array(n); let o = 0; for (const q of parts) { all.set(q, o); o += q.length; } return JSON.parse(new TextDecoder().decode(all), sinProto);
    }
    if (v === 'JE0') return JSON.parse(new TextDecoder().decode(bytes), sinProto);
    throw new Error('Código no válido');
  },
  reset() { for (const p of this.peers) { try { if (p.ch) p.ch.close(); } catch (e) { } try { if (p.pc) p.pc.close(); } catch (e) { } } this.peers = []; this.pending = null; this.role = null; this.myId = 0; this.status = 'off'; }
};
```

#### Archivo: `src/js/81-controles.js` [Juega EnCicla]

```javascript
/* =====================================================================
   CONTROLES: tipo (joystick fijo, arrastrar en cualquier parte, flechas o inclinar el celular),
   lado de la pantalla y tamaño. Se cambian en la pausa o en Más > Controles.
   ===================================================================== */
const cssPx = v => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v)) || 0;
/* inclinar el celular: el sensor de orientación da la dirección; la posición al empezar es la neutra */
const Tilt = JE.tilt = {
  on: false, ok: false, x: 0, y: 0, y0: null,
  start() {
    if (this.on) return; this.on = true;
    window.addEventListener('deviceorientation', e => {
      if (e.beta == null || e.gamma == null) return; this.ok = true; const o = screen.orientation ? screen.orientation.angle : (window.orientation || 0);
      let x = e.gamma, y = e.beta; if (o === 90) { x = e.beta; y = -e.gamma; } else if (o === 270 || o === -90) { x = -e.beta; y = e.gamma; }
      this.x = x; this.y = y; if (this.y0 == null) this.y0 = y;
    });
  },
  ask() {
    const D = window.DeviceOrientationEvent; if (!D) return Promise.resolve(false);
    if (typeof D.requestPermission === 'function') return D.requestPermission().then(r => { if (r === 'granted') this.start(); return r === 'granted'; }).catch(() => false);
    this.start(); return Promise.resolve(true);
  },
  calib() { this.y0 = this.ok ? this.y : null; },
  dir() { if (!this.ok) return null; const dx = clamp(this.x / 22, -1, 1), dy = clamp((this.y - (this.y0 == null ? this.y : this.y0)) / 22, -1, 1), l = Math.hypot(dx, dy); if (l < .18) return { x: 0, y: 0, m: 0 }; return { x: dx / l, y: dy / l, m: .18 + .82 * Math.pow(clamp((l - .18) / .6, 0, 1), 1.4) }; }
};
const _dir81 = Input.dir;
Input.dir = function () { const d = _dir81.call(this); if (this.botDir || d.m) return d; if (Ctrl.kind() === 'inclinar') { const t = Tilt.dir(); if (t) return t; } return d; };
Object.assign(Ctrl, {
  side() { return (Save.data && Save.data.settings.cside) || 'der'; },
  size() { const v = Save.data && Save.data.settings.csize; return [.8, 1, 1.25][v == null ? 1 : v]; },
  pad() { return ['fijo', 'flechas'].includes(this.kind()); },            // ¿hay un control dibujado en pantalla?
  anchor() { const k = this.size(), m = 40 + 46 * k; return { x: this.side() === 'izq' ? m + cssPx('--sal') : View.w - m - cssPx('--sar'), y: View.h - 74 - 46 * k }; },
  arrows() { const a = this.anchor(), s = 52 * this.size(); return [['ArrowUp', a.x, a.y - s, '▲'], ['ArrowDown', a.x, a.y + s, '▼'], ['ArrowLeft', a.x - s, a.y, '◀'], ['ArrowRight', a.x + s, a.y, '▶']]; },
  clear() {
    if (this.held) { for (const id in this.held) Input.keys[this.held[id]] = false; this.held = {}; }
    Input.joy = { on: false, id: null, ox: 0, oy: 0, x: 0, y: 0, t0: 0 };
  },
  down(e, cx, cy, cv) {
    const k = this.kind(), z = this.size();
    if (k === 'flechas') { for (const [key, x, y] of this.arrows()) if (Math.abs(cx - x) < 28 * z && Math.abs(cy - y) < 28 * z) { Input.keys[key] = true; (this.held || (this.held = {}))[e.pointerId] = key; return true; } return false; }
    const fx = this.anchor(), a = k === 'fijo' && dist(cx, cy, fx.x, fx.y) <= 110 * z ? fx : { x: cx, y: cy };   // también se puede arrastrar en cualquier parte
    Input.joy = { on: true, id: e.pointerId, ox: a.x, oy: a.y, x: cx, y: cy, t0: performance.now() }; try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    return true;
  },
  draw(V) {
    const k = this.kind(), c = V.ctx, z = this.size();
    if (k === 'flechas') { for (const [key, x, y, l] of this.arrows()) { c.globalAlpha = .75; c.fillStyle = Input.keys[key] ? PAL.vd : '#0a2342'; c.beginPath(); c.arc(x, y, 25 * z, 0, TAU); c.fill(); c.globalAlpha = 1; c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); V.text(l, x, y + 7 * z, { size: 20 * z, align: 'center', color: '#fff' }); } return; }
    if (k === 'fijo' && !Input.joy.on) { const a = this.anchor(); c.globalAlpha = .55; c.fillStyle = '#0a2342'; c.beginPath(); c.arc(a.x, a.y, 50 * z, 0, TAU); c.fill(); c.globalAlpha = .8; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(a.x, a.y, 48 * z, 0, TAU); c.stroke(); c.fillStyle = PAL.vd; c.beginPath(); c.arc(a.x, a.y, 20 * z, 0, TAU); c.fill(); c.globalAlpha = 1; }
    if (k === 'inclinar' && !Input.joy.on) {   // nivel de burbuja: muestra hacia dónde estás inclinando
      const a = this.anchor(), r = 34, d = Tilt.dir() || { x: 0, y: 0, m: 0 }; c.globalAlpha = .6; c.fillStyle = '#0a2342'; c.beginPath(); c.arc(a.x, a.y, r, 0, TAU); c.fill(); c.globalAlpha = .9; c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      c.fillStyle = Tilt.ok ? PAL.vd : PAL.amb; c.beginPath(); c.arc(a.x + d.x * d.m * (r - 10), a.y + d.y * d.m * (r - 10), 9, 0, TAU); c.fill(); c.globalAlpha = 1; if (!Tilt.ok) V.text('Sin sensor', a.x, a.y + r + 14, { size: 11, align: 'center', color: '#fff', body: true });
    }
  }
});
/* las tareas de abajo a la izquierda se corren si el control está a la izquierda */
Ctrl.leftGap = () => Ctrl.pad() && Ctrl.side() === 'izq' ? 40 + 92 * Ctrl.size() + 12 : 0;
const _start81 = Game.start;
Game.start = function () { Tilt.y0 = null; if (Ctrl.kind() === 'inclinar') Tilt.start(); return _start81.apply(this, arguments); };

/* ---------- panel de controles ---------- */
const CTRL_TXT = { fijo: 'El joystick se queda en su sitio. También puedes arrastrar el dedo en cualquier parte.', flotante: 'Pon el dedo donde quieras y arrástralo hacia donde quieres ir.', flechas: 'Cuatro botones grandes: ideal para niños y abuelos.', inclinar: 'Inclina el celular hacia donde quieres ir. Al empezar, la posición en que lo tienes es la neutra.' };
UI.controles = function (inGame) {
  const S = Save.data.settings, k = Ctrl.kind(), seg = (key, cur, opts) => `<div class="seg wrap">${opts.map(([v, n]) => `<button data-c="${key}" data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${n}</button>`).join('')}</div>`;
  this.modal(`<h2>Controles</h2><p class="pag">Cómo te mueves</p>${seg('ctrl', k, [['fijo', '🕹️ Joystick fijo'], ['flotante', '👆 Arrastrar'], ['flechas', '⬆️ Flechas'], ['inclinar', '📱 Inclinar']])}
    <p class="m" style="font-size:13px;margin:6px 0 10px">${CTRL_TXT[k]}</p>
    ${Ctrl.pad() || k === 'inclinar' ? `<p class="pag">Lado</p>${seg('cside', Ctrl.side(), [['izq', '◀ Izquierda'], ['der', 'Derecha ▶']])}` : ''}
    ${Ctrl.pad() ? `<p class="pag">Tamaño</p>${seg('csize', S.csize == null ? 1 : S.csize, [[0, 'Pequeño'], [1, 'Normal'], [2, 'Grande']])}` : ''}
    ${k === 'inclinar' ? '<div class="col" style="margin:8px 0"><button class="btn sm" id="cCal">🎯 Recalibrar</button></div>' : ''}
    <p class="pag">Vibración</p>${seg('vib', S.vib ? 1 : 0, [[1, 'Sí'], [0, 'No']])}
    <p class="m" style="font-size:12.5px;margin-top:10px">En computador: flechas o WASD para moverte y espacio para el timbre.</p>
    <div class="col"><button class="btn pri" id="mClose">${inGame ? '▶ Volver al juego' : 'Listo'}</button></div>`, () => {
    $$('[data-c]').forEach(b => b.onclick = async () => {
      const key = b.dataset.c, v = b.dataset.v;
      if (key === 'ctrl' && v === 'inclinar') { const ok = await Tilt.ask(); if (!ok) { Snd.sfx('bad'); return this.toast('Este celular no deja usar el sensor de movimiento'); } Tilt.y0 = null; }
      S[key] = key === 'csize' ? +v : key === 'vib' ? v === '1' : v; Save.save(); Snd.sfx('tap'); this.controles(inGame);
    });
    const cal = $('#cCal'); if (cal) cal.onclick = () => { Tilt.calib(); Snd.sfx('ok'); this.toast('Listo: esta es tu posición neutra'); };
    if (inGame) $('#mClose').onclick = () => { this.closeModal(); Game.resume(); };
  });
};
const _pause81 = Game.pause;
Game.pause = function () { _pause81.call(this); const go = $('#pGo'); if (!go || !this.mode || !this.mode.ride) return; const b = document.createElement('button'); b.className = 'btn'; b.id = 'pCtrl'; b.textContent = '🎮 Controles'; go.after(b); b.onclick = () => UI.controles(true); };
const _mas81 = UI.renderMas;
UI.renderMas = function () {
  _mas81.call(this); const c = $('#tab-mas [data-ctrl]'); if (!c) return; const row = c.closest('.opt');
  row.innerHTML = '<span>Controles<br><small class="m">Joystick, flechas o inclinar el celular</small></span><button class="btn sm" id="mCtrl">🎮 Ajustar</button>';
  $('#mCtrl').onclick = () => this.controles(false);
};
```

#### Archivo: `src/js/88-camara.js` [Juega EnCicla]

```javascript
/* =====================================================================
   CÁMARA (v1.7): pellizcar para acercar o alejar, girar con dos dedos, inclinar (dos dedos hacia arriba o abajo),
   cámara libre para mirar a voluntad y ángulos rápidos (arriba, inclinada, baja, detrás de la bici).
   Todo en la ciudad 3D; en pixel clásico el pellizco cambia el zoom por pasos enteros.
   Teclado: + y − acercan, Z y X giran, R y F inclinan, T cambia el ángulo, C cámara libre, N mira al norte.
   ===================================================================== */
const CAM_ANG = [
  { id: 'arriba', n: 'Desde arriba', t: 0, sigue: 0 },
  { id: 'inclinada', n: 'Inclinada', t: .5, sigue: 0 },
  { id: 'baja', n: 'Baja', t: .85, sigue: 0 },
  { id: 'detras', n: 'Detrás de la bici', t: .62, sigue: 1 }
];
const Cam = JE.cam = {
  ZMIN: .62, ZMAX: 1.9,
  cfg() { const S = Save.data.settings; if (!S.cam || typeof S.cam !== 'object') S.cam = { z: 1, t: 0, r: 0, sigue: 0 }; return S.cam; },
  d3() { return GFX() === '3d' && Save.data.settings.vista !== 'pano'; },
  ride() { const M = Game.mode; return M && M.ride && !M.sub && M.view && M.view.kind === 'map' ? M.ride : null; },
  /* zoom: continuo en 3D; en pixel, pasos enteros del zoom de siempre */
  zoom(f) {
    const C = this.cfg();
    if (!this.d3()) { const S = Save.data.settings, z = clamp((S.zoom | 0) + (f > 1 ? 1 : -1), -1, 2); if (z !== (S.zoom | 0)) { S.zoom = z; View.apply(); } return; }
    C.z = clamp(C.z * f, this.ZMIN, this.ZMAX);
  },
  girar(da) { const C = this.cfg(); if (!this.d3()) return; C.sigue = 0; C.r = angDiff(0, C.r + da); if ((C.t || 0) < .28) C.t = Math.min(.28, (C.t || 0) + Math.min(.14, Math.abs(da) * .9)); }   // girar con la cámara cenital no se notaría: se inclina suavemente
  ,
  inclinar(dt) { const C = this.cfg(); if (!this.d3()) return; C.t = clamp((C.t || 0) + dt, 0, 1); },
  angulo() { const C = this.cfg(); let i = CAM_ANG.findIndex(a => Math.abs(a.t - (C.t || 0)) < .04 && a.sigue === (C.sigue | 0)); i = (i + 1) % CAM_ANG.length; const A = CAM_ANG[i]; C.t = A.t; C.sigue = A.sigue; if (!A.sigue && A.id === 'arriba') C.r = 0; Save.save(); return A; },
  norte() { const C = this.cfg(); C.r = 0; C.sigue = 0; Save.save(); },
  /* la velocidad de la bici, siempre a la mano: tranquila, normal, rápida o muy rápida */
  velocidad(M) {
    if (M && (M.net || M.id === 'carrera')) { JE.ui && JE.ui.toast('🏁 En las carreras y en red todos van a la misma velocidad'); return; }
    const S = Save.data.settings, i = VELS.findIndex(v => v[0] === velMul(M)), V = VELS[(i + 1) % VELS.length]; S.vel = V[0]; Save.save();
    JE.ui && JE.ui.toast(V[2] + ' Velocidad ' + V[1].toLowerCase() + (V[0] > 1 ? ': el día también pasa más rápido' : V[0] < 1 ? ': todo con calma' : ''));
  },
  libre(R, on) {
    R = R || this.ride(); if (!R) return; const L = R.libre || (R.libre = { on: false });
    L.on = on == null ? !L.on : !!on; if (Ctrl.clear) Ctrl.clear(); else Input.joy.on = false; Snd.sfx('tap');   // al salir, la cámara vuelve sola a la bici (camara() en 30-ride.js)
    if (L.on && JE.ui) JE.ui.toast('📷 Cámara libre: arrastra para mirar la ciudad · pellizca para acercar · ⌖ para volver');
  },
  /* cada cuadro: suaviza ángulo e inclinación y avisa a la vista */
  tick(R, dt) {
    if (JE.headless) return; const C = this.cfg(), on = this.d3() && !panoOn(R), P = R.p;
    if (on && C.sigue && P.v > 6 * WK) C.r = angDiff(0, P.a + Math.PI / 2);   // detrás de la bici: la cámara gira con el rumbo
    const tr = on ? C.r || 0 : 0, tt = on ? C.t || 0 : 0;
    R.rot = angDiff(0, (R.rot || 0) + angDiff(R.rot || 0, tr) * (1 - Math.exp(-dt * (C.sigue ? 2.6 : 12))));
    R.til = (R.til || 0) + (tt - (R.til || 0)) * (1 - Math.exp(-dt * 8));
    const ron = on && (Math.abs(R.rot) > .002 || Math.abs(tr) > .002), zf = on ? C.z || 1 : 1;
    View.rot = ron ? R.rot : 0;
    if (ron !== View.rotOn || zf !== View.zf) { View.rotOn = ron; View.zf = zf; View.apply(); }
    // cámara libre: con el teclado, las flechas mueven la cámara (la bici se queda quieta)
    const L = R.libre; if (L && L.on) { const k = Input.keys; let x = 0, y = 0; if (k.ArrowLeft || k.KeyA) x--; if (k.ArrowRight || k.KeyD) x++; if (k.ArrowUp || k.KeyW) y--; if (k.ArrowDown || k.KeyS) y++; if (x || y) { const d = R.girarDir({ x, y, m: 1 }), v = 260 / (View.s || 2); R.cam.x += d.x * v * dt; R.cam.y += d.y * v * dt; this.limita(R); } }
  },
  limita(R) { R.cam.x = clamp(R.cam.x, 0, MW * TS); R.cam.y = clamp(R.cam.y, 0, MH * TS); },
  /* ---- gestos sobre el lienzo ---- */
  ptr: new Map(), g: null, pan: null, orb: null,
  bind() {
    const cv = $('#cv'); if (!cv || this.bound) return; this.bound = 1;
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.addEventListener('pointerdown', e => {
      const R = this.ride(); if (!R || Game.paused) return; const p = pos(e); if (e.isPrimary) { this.ptr.clear(); this.g = null; this.pan = null; }   // primer dedo: empieza un gesto nuevo
      if (e.pointerType === 'mouse' && e.button > 0) { this.orb = { id: e.pointerId, x: p.x, y: p.y }; try { cv.setPointerCapture(e.pointerId); } catch (er) { } return; }   // botón derecho o del medio: girar e inclinar
      this.ptr.set(e.pointerId, p);
      if (this.ptr.size === 2) { if (Ctrl.clear) Ctrl.clear(); else Input.joy.on = false; this.pan = null; this.g = this.gesto0(); }
      else if (this.ptr.size === 1 && R.libre && R.libre.on) { this.pan = { id: e.pointerId, x: p.x, y: p.y }; try { cv.setPointerCapture(e.pointerId); } catch (er) { } }
    });
    cv.addEventListener('pointermove', e => {
      const R = this.ride(); if (!R) return; const p = pos(e);
      if (this.orb && e.pointerId === this.orb.id) { this.girar(-(p.x - this.orb.x) / 160); this.inclinar(-(p.y - this.orb.y) / 220); this.orb.x = p.x; this.orb.y = p.y; return; }
      if (!this.ptr.has(e.pointerId)) return; this.ptr.set(e.pointerId, p);
      if (this.g && this.ptr.size >= 2) return this.gesto();
      const P = this.pan; if (P && e.pointerId === P.id && R.libre && R.libre.on) { const d = R.girarDir({ x: p.x - P.x, y: p.y - P.y, m: 1 }), s = View.s || 2; R.cam.x -= d.x / s; R.cam.y -= d.y / s; this.limita(R); P.x = p.x; P.y = p.y; }
    });
    const up = e => { if (this.orb && e.pointerId === this.orb.id) { this.orb = null; Save.save(); } if (!this.ptr.delete(e.pointerId)) return; if (this.g) { this.g = null; Save.save(); } if (this.pan && this.pan.id === e.pointerId) this.pan = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { if (!this.ride()) return; e.preventDefault(); this.zoom(Math.exp(-clamp(e.deltaY, -120, 120) / 600)); this.guardaT(); }, { passive: false });
    window.addEventListener('keydown', e => {
      const R = this.ride(); if (!R || Game.paused || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; const c = e.code;
      if (c === 'Equal' || c === 'NumpadAdd') this.zoom(1.15); else if (c === 'Minus' || c === 'NumpadSubtract') this.zoom(1 / 1.15);
      else if (c === 'KeyZ') this.girar(-Math.PI / 12); else if (c === 'KeyX') this.girar(Math.PI / 12);
      else if (c === 'KeyR') this.inclinar(.12); else if (c === 'KeyF') this.inclinar(-.12);
      else if (c === 'KeyT') { const A = this.angulo(); JE.ui && JE.ui.toast('🎥 ' + A.n); }
      else if (c === 'KeyC') this.libre(R); else if (c === 'KeyN') this.norte(); else if (c === 'KeyG') this.velocidad(Game.mode); else return;
      this.guardaT();
    });
  },
  guardaT() { clearTimeout(this._sv); this._sv = setTimeout(() => Save.save(), 600); },
  gesto0() { const [a, b] = [...this.ptr.values()], C = this.cfg(); return { d0: Math.hypot(b.x - a.x, b.y - a.y) || 1, a0: Math.atan2(b.y - a.y, b.x - a.x), m0: (a.y + b.y) / 2, z0: C.z || 1, r0: C.r || 0, t0: C.t || 0, lock: null, zl: Save.data.settings.zoom | 0 }; },
  /* dos dedos: separar o juntar = zoom; girar = girar la cámara; subir o bajar juntos = inclinar */
  gesto() {
    const G = this.g, [a, b] = [...this.ptr.values()], C = this.cfg(), d = Math.hypot(b.x - a.x, b.y - a.y) || 1, an = Math.atan2(b.y - a.y, b.x - a.x), m = (a.y + b.y) / 2;
    const dz = Math.abs(d - G.d0), da = Math.abs(angDiff(G.a0, an)), dm = m - G.m0;
    if (!G.lock) { if (Math.abs(dm) > 14 && Math.abs(dm) > dz * 1.15 && da < .12) G.lock = 'tilt'; else if (dz > 14 || da > .14) G.lock = 'zr'; }
    if (G.lock === 'tilt') { if (this.d3()) C.t = clamp(G.t0 - dm / 170, 0, 1); return; }
    if (G.lock !== 'zr') return;
    if (this.d3()) { C.z = clamp(G.z0 * d / G.d0, this.ZMIN, this.ZMAX); if (da > .14 || G.rot) { G.rot = 1; C.sigue = 0; C.r = angDiff(0, G.r0 - angDiff(G.a0, an)); if ((C.t || 0) < .28) C.t = clamp(G.t0 + Math.min(.28, da * .85), C.t || 0, .28); } }
    else { const S = Save.data.settings, z = clamp(G.zl + Math.round(Math.log(d / G.d0) / Math.log(1.45)), -1, 2); if (z !== (S.zoom | 0)) { S.zoom = z; View.apply(); } }
  },
  /* ---- botones: ángulo, norte y cámara libre (a la izquierda, a media altura) ---- */
  barra(M) {
    let bar = $('#camBar'); const R = M && M.ride && !M.sub && M.view && M.view.kind === 'map' ? M.ride : null, d3 = this.d3();
    if (!R || R.big || panoOn(R) || M.carry) { if (bar && !bar.hidden) bar.hidden = true; return; }   // con la bici en la mano, los botones de equilibrio van a los lados
    if (!bar) {
      bar = document.createElement('div'); bar.id = 'camBar'; bar.innerHTML = '<button data-cam="vel" aria-label="Velocidad">🚲</button><button data-cam="ang" aria-label="Ángulo de la cámara">🎥</button><button data-cam="norte" aria-label="Mirar al norte" hidden><span>⬆</span></button><button data-cam="libre" aria-label="Cámara libre">📷</button>';
      $('#sGame').appendChild(bar);
      bar.addEventListener('pointerdown', e => e.stopPropagation());
      bar.onclick = e => { const b = e.target.closest('[data-cam]'); if (!b) return; const k = b.dataset.cam, RR = this.ride(); if (!RR) return; Snd.sfx('tap');
        if (k === 'vel') this.velocidad(Game.mode);
        else if (k === 'ang') { const A = this.angulo(); JE.ui && JE.ui.toast('🎥 ' + A.n + (A.sigue ? ': la cámara gira con tu rumbo' : '')); }
        else if (k === 'norte') this.norte(); else if (k === 'libre') this.libre(RR); };
    }
    if (bar.hidden) bar.hidden = false;
    const vb = bar.children[0], fija = !!(M.net || M.id === 'carrera'), V = VELS.find(v => v[0] === velMul(M)) || VELS[1], vt = fija ? '🚲' : V[2];
    if (vb.textContent !== vt) { vb.textContent = vt; vb.setAttribute('aria-label', 'Velocidad: ' + V[1]); } if (vb.hidden !== fija) vb.hidden = fija;   // en carreras y en red, todos a la misma velocidad
    for (const b of [bar.children[1], bar.children[3]]) if (b.hidden === d3) b.hidden = !d3;   // en pixel clásico no hay ángulos ni cámara libre
    if (!d3) { if (!bar.children[2].hidden) bar.children[2].hidden = true; return; }
    const n = bar.children[2], l = bar.children[3], C = this.cfg(), rot = Math.abs(R.rot || 0) > .05 || C.sigue;
    if (n.hidden === !!rot) n.hidden = !rot; if (rot) { const tr = 'rotate(' + (-(R.rot || 0)).toFixed(3) + 'rad)'; if (n.firstChild.style.transform !== tr) n.firstChild.style.transform = tr; }
    const lb = R.libre && R.libre.on ? '⌖' : '📷'; if (l.textContent !== lb) { l.textContent = lb; l.setAttribute('aria-label', R.libre && R.libre.on ? 'Volver a la bici' : 'Cámara libre'); l.classList.toggle('on', lb === '⌖'); }
  }
};
/* la física primero, la cámara después */
const _upd88 = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) { const L = this.libre; if (L && L.on) dir = { x: 0, y: 0, m: 0 }; _upd88.call(this, dt, dir); Cam.tick(this, dt); };   // en cámara libre la bici se detiene
/* el joystick no arranca en cámara libre (un dedo mueve la cámara) ni con el botón derecho */
const _down88 = Ctrl.down;
Ctrl.down = function (e, cx, cy, cv) { const R = Cam.ride(); if ((R && R.libre && R.libre.on) || (e.pointerType === 'mouse' && e.button > 0) || Cam.ptr.size >= 2) return false; return _down88.call(this, e, cx, cy, cv); };
/* botones en el juego y aviso la primera vez */
const _layout88 = Game.layout;
Game.layout = function (ride) { _layout88.call(this, ride); Cam.barra(this.mode); };
const _start88 = Game.start;
Game.start = function () {
  const r = _start88.apply(this, arguments); Cam.bind(); View.rotOn = false; View.rot = 0; View.zf = Cam.d3() ? Cam.cfg().z || 1 : 1; View.apply();
  const S = Save.data.settings; if (!JE.headless && Cam.d3() && !(S.seen && S.seen.cam) && this.mode && this.mode.ride) { (S.seen || (S.seen = {})).cam = 1; Save.save(); setTimeout(() => JE.ui && JE.ui.toast('🎥 Nuevo: pellizca para acercar o alejar, gira con dos dedos y súbelos para inclinar la cámara. 📷 mira la ciudad a voluntad.'), 2500); }
  return r;
};
const _stop88 = Game.stop;
Game.stop = function () { const r = _stop88.apply(this, arguments); View.rotOn = false; View.rot = 0; View.zf = 1; const b = $('#camBar'); if (b) b.hidden = true; return r; };
/* Más: la cámara */
const _mas88 = UI.renderMas;
UI.renderMas = function () {
  _mas88.call(this); const z = $('#tab-mas [data-zoom]'); if (!z) return; const row = z.closest('.opt'), C = Cam.cfg();
  const cur = CAM_ANG.find(a => Math.abs(a.t - (C.t || 0)) < .04 && a.sigue === (C.sigue | 0));
  const vc = velMul(null), d = document.createElement('div'); d.innerHTML = `<div class="opt"><span>Velocidad de la bici<br><small class="m">También con el botón 🚲 en el juego (tecla G). El reloj se ajusta: cada viaje cuesta los mismos minutos</small></span><div class="seg wrap">${VELS.map(([v, n2, ic]) => `<button data-vel="${v}" class="${v === vc ? 'on' : ''}">${ic} ${n2}</button>`).join('')}</div></div><div class="opt"><span>Cámara<br><small class="m">Pellizca para acercar, gira con dos dedos y súbelos para inclinar (solo en la ciudad 3D)</small></span><div class="seg wrap">${CAM_ANG.map(a => `<button data-camang="${a.id}" class="${cur && cur.id === a.id ? 'on' : ''}">${a.n}</button>`).join('')}<button data-camang="reset">↺ Normal</button></div></div>`;
  while (d.firstChild) row.parentNode.insertBefore(d.lastChild, row.nextSibling);
  $$('[data-vel]').forEach(b => b.onclick = () => { Save.data.settings.vel = +b.dataset.vel; Save.save(); Snd.sfx('tap'); this.renderMas(); });
  $$('[data-camang]').forEach(b => b.onclick = () => { const k = b.dataset.camang, C = Cam.cfg(); if (k === 'reset') Object.assign(C, { z: 1, t: 0, r: 0, sigue: 0 }); else { const A = CAM_ANG.find(a => a.id === k); C.t = A.t; C.sigue = A.sigue; if (A.id === 'arriba') C.r = 0; } Save.save(); Snd.sfx('tap'); this.renderMas(); });
};
/* pausa: la velocidad también se cambia aquí */
const _pause88 = Game.pause;
Game.pause = function () {
  _pause88.call(this); const go = $('#pGo'), M = this.mode; if (!go || !M || !M.ride || M.net || M.id === 'carrera') return;
  const b = document.createElement('button'); b.className = 'btn'; b.id = 'pVel'; const lbl = () => { const V = VELS.find(v => v[0] === velMul(M)) || VELS[1]; b.textContent = V[2] + ' Velocidad: ' + V[1]; }; lbl(); go.after(b);
  b.onclick = () => { const i = VELS.findIndex(v => v[0] === velMul(M)), V = VELS[(i + 1) % VELS.length]; Save.data.settings.vel = V[0]; Save.save(); Snd.sfx('tap'); lbl(); };
};
/* calidad automática: si en el mapa los cuadros tardan más de 28 ms (mediana de ~2 s), aligera primero el detalle 3D lejano (sin borrar los trozos) y luego la resolución */
const Calidad = JE.calidad = {
  T: [], last: 0, bien: 0, d3: 1,
  cuadro(t) {
    const dt = t - this.last; this.last = t; const M = Game.mode; if (!M || !M.ride || M.sub || Game.paused || JE.headless || !(dt > 0 && dt < 250)) return;
    this.T.push(dt); if (this.T.length < 120) return; const T = this.T.sort((a, b) => a - b), med = T[60]; this.T = [];
    const q = View.calidad || 1, base = Math.min(window.devicePixelRatio || 1, 2);
    if (med > 28) {
      this.bien = 0;
      if (this.d3 > 0) { this.d3 = 0; JE.calidad3D = 0; }
      else if (base > 1.01 && q > .6) { View.calidad = Math.round((q - .2) * 10) / 10; View.resize(); }
    } else if (med < 18) {
      if (++this.bien >= 3) {
        this.bien = 0;
        if (q < 1 && base > 1.01) { View.calidad = Math.round((q + .2) * 10) / 10; View.resize(); }
        else if (this.d3 < 1) { this.d3 = 1; JE.calidad3D = 1; }
      }
    } else this.bien = 0;
  }
};
const _loop88 = Game.loop;
Game.loop = function (t) { Calidad.cuadro(t); return _loop88.call(this, t); };
```

#### Archivo: `src/js/89-paseo.js` [Juega EnCicla]

```javascript
/* =====================================================================
   PASEO GUIADO (v1.7; idea del «modo paseo» de El Metro 1.2.0): en el modo libre, la bici va sola de un
   lugar con postal al siguiente, respetando semáforos y carros; la cámara cambia de plano y en cada lugar
   se detiene, gira alrededor y cuenta su historia. Es para mirar la ciudad: tocar el control devuelve el manejo.
   ===================================================================== */
const PASEO_PLANOS = [{ t: .45, z: 1, dr: 0 }, { t: .72, z: 1.25, dr: .55 }, { t: .3, z: .86, dr: -.45 }, { t: .62, z: 1.1, sigue: 1 }];
const Paseo = JE.paseo = {
  on(M) { return !!(M && M.paseo && M.paseo.on); },
  puede(M) { return !!(M && M.free && M.id === 'usuario' && M.ride && !M.sub && !M.net && !M.sitting && !(M.race && !M.race.done)); },
  iniciar(M) {
    if (!this.puede(M)) return; const C = Cam.cfg();
    M.paseo = { on: true, vis: new Set(), plano: 0, planoT: 0, pausa: 0, cam0: { z: C.z, t: C.t, r: C.r, sigue: C.sigue }, zT: C.z || 1, n: 0 };
    this.siguiente(M); Snd.sfx('ok');
    JE.ui && JE.ui.toast('🧭 Paseo guiado: la bici va sola por los lugares del valle y te cuenta su historia. Toca el control para manejar tú.');
  },
  parar(M, msg) {
    const P = M.paseo; if (!P || !P.on) return; P.on = false; M.botDir = null;
    if (P.m) M.ride.removeMarker(P.m); Object.assign(Cam.cfg(), P.cam0); Save.save();   // la cámara vuelve a como la tenías
    if (msg && JE.ui) JE.ui.toast(msg);
  },
  /* el lugar con postal más cercano que no haya visitado en este paseo (primero los que están a menos de 2,5 km) */
  siguiente(M) {
    const P = M.paseo, R = M.ride, p = R.p, d25 = 2500 / M_PER_PX;
    const L = PUBLIC_LM().filter(l => !P.vis.has(l.id)).map(l => ({ l, d: dist((l.x + l.w / 2) * TS, (l.y + l.h / 2) * TS, p.x, p.y) })).sort((a, b) => (a.d <= d25 ? 0 : 1) - (b.d <= d25 ? 0 : 1) || a.d - b.d);
    if (!L.length) { this.parar(M, '🧭 ¡Recorriste todos los lugares del paseo!'); return; }
    const l = L[0].l; P.lugar = l; if (P.m) R.removeMarker(P.m); P.prog = { d: 1e9, t: 0 };
    const o = JE.map.nearestOpen(Math.floor(l.x + l.w / 2), Math.floor(l.y + l.h) + 1, false);   // la parada, en la calle o el andén frente al lugar (no dentro del edificio)
    P.m = R.marker({ x: o.x * TS + TS / 2, y: o.y * TS + TS / 2, r: 22 * WK, col: PAL.cie, label: '🧭 ' + l.name, enter: () => this.llegar(M, l) });
    R.target = P.m; R.calcGps();
    if (JE.ui && P.n) JE.ui.toast('🧭 Siguiente parada: ' + l.name + ' (' + (L[0].d * M_PER_PX >= 1000 ? (L[0].d * M_PER_PX / 1000).toFixed(1) + ' km' : Math.round(L[0].d * M_PER_PX / 10) * 10 + ' m') + ')');
  },
  llegar(M, l) {
    const P = M.paseo; if (!P || !P.on || P.lugar !== l) return; P.vis.add(l.id); P.n++; P.pausa = 7; M.botDir = { x: 0, y: 0, m: 0 };
    M.ride.stamp = { t: 3, title: l.name.toUpperCase().slice(0, 26), sub: l.muni + ' · parada ' + P.n + ' del paseo', bg: '#bfe3f7' };
    if (JE.ui) JE.ui.toast('📍 ' + l.name + ': ' + (l.fact || 'un lugar del valle para conocer.'));
    if (!Save.data.postales.includes(l.id) && M.collect) M.collect(l);
  },
  tick(M, dt) {
    const P = M.paseo; if (!P || !P.on) return; const C = Cam.cfg();
    const joyDrag = !Cam.g && Cam.ptr.size <= 1 && Input.joy.on && (performance.now() - (Input.joy.t0 || 0) > 140) && Math.hypot(Input.joy.x - Input.joy.ox, Input.joy.y - Input.joy.oy) > 20;
    const d = (Input.keys && Object.keys(Input.keys).some(k => Input.keys[k] && /^(Arrow|Key[WASD]$)/.test(k))) || joyDrag ? 1 : 0;
    if (d || !this.puede(M)) { this.parar(M, d ? '🚲 Manejas tú. Toca 🧭 Paseo para seguir el recorrido.' : null); return; }
    if (P.pausa > 0) {   // en el lugar: quieta, y la cámara le da la vuelta
      P.pausa -= dt; M.botDir = { x: 0, y: 0, m: 0 }; C.sigue = 0; C.r = angDiff(0, (C.r || 0) + dt * .22); C.t = Math.max(C.t || 0, .5); P.zT = 1.15;
      if (P.pausa <= 0) { P.planoT = 0; this.siguiente(M); }
    } else {
      M.botDrive(); if (M.botDir && M.botDir.m) M.botDir.m = Math.min(M.botDir.m, .85);   // a paso de paseo
      const g = P.prog, dd = P.m ? dist(M.ride.p.x, M.ride.p.y, P.m.x, P.m.y) : 0; g.t += dt; if (dd < g.d - 40) { g.d = dd; g.t = 0; } else if (g.t > 25) { P.vis.add(P.lugar.id); this.siguiente(M); return; }   // si no hay cómo llegar, al siguiente
      P.planoT -= dt; if (P.planoT <= 0) { P.planoT = 9; P.plano = (P.plano + 1) % PASEO_PLANOS.length; const Q = PASEO_PLANOS[P.plano]; C.t = Q.t; C.sigue = Q.sigue || 0; if (!Q.sigue) C.r = angDiff(0, (M.ride.rot || 0) + Q.dr); P.zT = Q.z; }
    }
    C.z = (C.z || 1) + (P.zT - (C.z || 1)) * (1 - Math.exp(-dt * 1.2));   // el zoom también cambia despacio
  }
};
/* el paseo va antes del manejo de cada cuadro */
const _upd89 = ModeUsuarioR.prototype.update;
ModeUsuarioR.prototype.update = function (dt) { if (Paseo.on(this)) Paseo.tick(this, dt); return _upd89.call(this, dt); };
const _act89 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act89.call(this); if (!this.free || this.sub || this.sitting) return a;
  if (Paseo.on(this)) return [{ id: 'paseoOff', icon: 'usuario', label: 'Manejar', fn: () => Paseo.parar(this, '🚲 Manejas tú. Toca 🧭 Paseo para seguir el recorrido.') }];
  if (Paseo.puede(this)) a.push({ id: 'paseo', icon: 'pin', label: 'Paseo', fn: () => Paseo.iniciar(this) });
  return a;
};
const _end89 = ModeUsuarioR.prototype.end;
ModeUsuarioR.prototype.end = function () { if (Paseo.on(this)) Paseo.parar(this); return _end89.apply(this, arguments); };
LOGROS.push({ id: 'paseo5', name: 'Guía del valle', desc: 'Haz un paseo guiado de 5 paradas', icon: 'estrella', test: S => (S.stats && S.stats.paseoMax | 0) >= 5 });
const _lleg89 = Paseo.llegar;
Paseo.llegar = function (M, l) { _lleg89.call(this, M, l); const P = M.paseo; if (P && P.vis.has(l.id)) { const S = Save.data; S.stats.paseoMax = Math.max(S.stats.paseoMax | 0, P.n); const nw = Logros.check(); Save.save(); if (nw.length && JE.ui) JE.ui.toast('🏅 Logro: ' + nw.map(x => x.name).join(', ')); } };
```

#### Archivo: `src/js/69-libre.js` [Juega EnCicla]

```javascript
/* =====================================================================
   MODO LIBRE CON VIDA PROPIA (v0.9)
   Tu perfil (edad, dónde vives, colegio, universidad, trabajo) arma misiones distintas cada día de la semana,
   con animaciones de clase, trabajo y colegio; domingos y festivos hay ciclovía con carreras y retos;
   energía, bancas y fotos para el álbum.
   Colores: el verde, azul oscuro y blanco de EnCicla son para sus trabajadores y sus bicis; en el modo libre te vistes como quieras.
   ===================================================================== */
const UNIS = [['udea', 'Universidad de Antioquia', 6.2675, -75.5689], ['unal', 'Universidad Nacional', 6.2618, -75.5770], ['eafit', 'EAFIT', 6.2003, -75.5786], ['upb', 'UPB', 6.2420, -75.5895],
  ['udem', 'Universidad de Medellín', 6.2318, -75.6100], ['itm', 'ITM', 6.2735, -75.5885], ['ces', 'Universidad CES', 6.2085, -75.5640], ['lasallista', 'Unilasallista (Caldas)', 6.0990, -75.6370]];
const TRABAJOS = [['centro', 'el Centro', 6.2490, -75.5680], ['poblado', 'El Poblado', 6.2100, -75.5700], ['ciudadrio', 'Ciudad del Río', 6.2220, -75.5750], ['laureles', 'Laureles', 6.2450, -75.5930], ['guayabal', 'Guayabal', 6.2100, -75.5880],
  ['itagui', 'Itagüí', 6.1720, -75.6110], ['envigado', 'Envigado', 6.1720, -75.5870], ['bello', 'Bello', 6.3370, -75.5580], ['sabaneta', 'Sabaneta', 6.1515, -75.6164], ['encicla', 'Casa EnCicla', 6.2314, -75.5995]];
const EDADES = ['Niño o niña', 'Joven', 'Adulto', 'Adulto mayor'];
const placeP = (lat, lon) => { const p = geoP(lat, lon), o = JE.map.nearestOpen(Math.floor(p.x / TS), Math.floor(p.y / TS), false); return { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2 }; };
function homeStation() {
  const P = Save.data.profile, muni = (VM.munis || [])[P.casaM | 0] || 'Medellín', L = JE.map.stations.filter(s => s.muni === muni && stOk(s));
  return L.length ? L[(h2(P.name.length, 3, 11) * L.length) | 0] : JE.map.stations.filter(stOk)[0];
}

/* ---------- persona con contextura y estatura; uniforme EnCicla para los trabajadores ---------- */
Art.person = function (c, x, y, p, ph = 0, face = -1) {
  c.save(); c.translate(Math.round(x), Math.round(y)); if (face > 0) c.scale(-1, 1);
  const kid = p.kid, tl = p.tall == null ? 1 : p.tall, bd = p.build == null ? 1 : p.build, H = kid ? .72 : 1;
  const legH = Math.round((5 + tl) * H), torso = Math.round((6 + (tl > 0 ? 1 : 0) + (tl > 1 ? 1 : 0)) * H), hy = -legH - torso - 5, st = Math.floor(ph * 4) % 2, hc = p.hair || '#2a1a10';
  const tw = 4 + bd, tx = bd === 2 ? -4 : -3;
  prect(c, -2 + (st ? -1 : 0), -legH, 2, legH, p.pants); prect(c, 0 + (st ? 1 : 0), -legH, 2 + (bd === 2 ? 1 : 0), legH, shade(p.pants, -.18));
  const sh = p.shoes || '#111'; prect(c, -2 + (st ? -1 : 0), -1, 2, 1, sh); prect(c, 0 + (st ? 1 : 0), -1, 2, 1, sh);
  if (p.bag) prect(c, tx + tw, -legH - torso + 1, 2, torso - 2, p.bag);
  prect(c, tx, -legH - torso, tw, torso, p.shirt); prect(c, tx - 1, -legH - torso + 2, 1, torso - 3, p.shirt); prect(c, tx - 1, -legH - 2, 1, 1, p.skin);
  if (!p.sleeve && !kid) prect(c, tx - 1, -legH - torso + 4, 1, 2, p.skin);
  if (p.vest || p.sleeve === 2) { prect(c, tx, -legH - torso, tw, torso, PAL.vd); prect(c, tx, -legH - torso + 3, tw, 1, '#e8f4d0'); prect(c, tx + (tw >> 1), -legH - torso, 1, torso, p.shirt); }
  if (bd === 2) prect(c, tx + tw - 1, -legH - torso + 3, 1, torso - 4, shade(p.vest ? PAL.vd : p.shirt, -.12));
  prect(c, -3, hy, 5, 5, p.skin); prect(c, -3, hy + 2, 1, 1, '#141414');
  switch (p.hairStyle | 0) {
    case 0: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 1, hy, 1, 3, hc); break;
    case 1: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 1, hy, 2, 6, hc); break;
    case 2: prect(c, -3, hy - 1, 6, 2, p.cap || PAL.az2); prect(c, -5, hy, 3, 1, p.cap || PAL.az2); break;
    case 3: prect(c, 0, hy - 1, 3, 1, hc); break;
    case 4: prect(c, -4, hy - 3, 8, 4, hc); prect(c, 1, hy, 3, 3, hc); break;
    case 5: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 2, hy, 2, 2, hc); prect(c, 3, hy + 1, 2, 4, hc); break;
    case 6: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 0, hy - 3, 3, 2, hc); break;
    case 7: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 1, hy, 2, 7, hc); prect(c, 1, hy + 7, 2, 1, '#ff6b5a'); break;
    case 8: prect(c, -3, hy - 2, 6, 2, hc); prect(c, -3, hy, 1, 1, hc); prect(c, 2, hy - 1, 2, 3, hc); break;
  }
  if (p.beard === 1) prect(c, -3, hy + 3, 2, 1, hc); else if (p.beard === 2) { prect(c, -3, hy + 3, 4, 2, hc); prect(c, -3, hy + 2, 1, 1, hc); }
  if (p.glasses === 2) prect(c, -3, hy + 2, 3, 1, '#0a0a0a'); else if (p.glasses) prect(c, -3, hy + 2, 2, 1, '#333');
  if (p.cane) pline(c, -6, 0, -5, -legH - 2, '#7a5230');
  c.restore();
};
const _me69 = Art.me;
Art.me = function (extra) {
  const P = Save.data.profile, base = _me69.call(this, extra), uni = extra && (extra.vest || extra.uniforme);
  base.build = P.build == null ? 1 : P.build; base.tall = P.tall == null ? 1 : P.tall; base.kid = (P.edad | 0) === 0 && P.edad != null;
  if (uni) Object.assign(base, { shirt: '#0e2d55', pants: '#1f2a3a', vest: true, cap: '#ffffff' });   // uniforme EnCicla
  return base;
};
/* trabajadores con uniforme en el mapa; en el modo libre (y como usuario) cada quien con su ropa */
const _setupL = MapMode.prototype.setupRide;
MapMode.prototype.setupRide = function (o) { _setupL.call(this, o); this.uniform = !['usuario', 'carrera'].includes(this.id); };
const _rider69 = Art.rider;
Art.rider = function (shirt) { const M = JE.game && JE.game.mode; return M && M.uniform ? this.riderTop('#0e2d55', '#ffffff', SKINS[Save.data.profile.skin] || SKINS[1], PAL.vd) : _rider69.call(this, shirt); };

/* ---------- misiones del día ---------- */
function genMisiones(now) {
  const P = Save.data.profile, wd = now.getDay(), m = Cal.min(now), dt = Cal.dayType(now), f = Cal.fiesta(now), L = [];
  const uni = P.uni ? UNIS[P.uni - 1] : null, tr = P.trabajo ? TRABAJOS[P.trabajo - 1] : null, col = P.colegio === 1, rot = (a, b) => Math.max(a, m + b);
  if (dt === 'semana' && m < 19 * 60) {
    if (uni) { const due = rot([0, 7, 9, 7, 9, 8, 0][wd] * 60, 45); L.push({ id: 'uni', kind: 'rutina', rut: 'uni', place: uni, due, txt: (due > 12 * 60 ? 'Clase de la tarde' : 'Llega a clase') + ' en ' + uni[1] + ' antes de las ' + Cal.hora(due), h: 12, xp: 40 }); }
    if (tr) { const due = rot(8 * 60, 45); L.push({ id: 'trabajo', kind: 'rutina', rut: 'trabajo', place: tr, due, txt: 'Llega a tu trabajo en ' + tr[1] + ' antes de las ' + Cal.hora(due), h: 12, xp: 40 }); }
    if (col) { const due = rot(6 * 60 + 45, 40); L.push({ id: 'colegio', kind: 'rutina', rut: 'colegio', place: null, due, txt: 'Llega al colegio antes de las ' + Cal.hora(due), h: 12, xp: 40 }); }
    if (wd === 5 && tr && m < 18 * 60) L.push({ id: 'viernes', kind: 'visita', place: ['lleras', 'Parque Lleras', 6.2088, -75.5671], txt: 'Viernes: después del trabajo, ve al Parque Lleras', h: 8, xp: 20 });
  } else if (dt === 'sabado') {
    if (uni) L.push({ id: 'grupo', kind: 'rutina', rut: 'uni', place: uni, due: rot(10 * 60, 45), txt: 'Grupo de estudio del sábado en ' + uni[1], h: 10, xp: 30 });
    if (tr) L.push({ id: 'sabado', kind: 'rutina', rut: 'trabajo', place: tr, due: rot(9 * 60, 45), txt: 'Medio turno de sábado en ' + tr[1], h: 10, xp: 30 });
  }
  if (Cal.cicloviaNow(now)) {
    L.push({ id: 'carrera', kind: 'carrera', txt: 'Carrera de la ciclovía: gana a 3 ciclistas', h: 20, xp: 60 });
    L.push({ id: 'km', kind: 'km', txt: 'Rueda 3 km por la ciclovía o las ciclorrutas', h: 10, xp: 25, need: 3000 });
    L.push({ id: 'saludo', kind: 'saludo', txt: 'Saluda con el timbre a 8 ciclistas', h: 8, xp: 20, need: 8 });
  } else if (Cal.ciclovia(now)) L.push({ id: 'saludo', kind: 'saludo', txt: 'Domingo de bici: saluda con el timbre a 5 ciclistas', h: 6, xp: 15, need: 5 });
  if (f) L.push(festMision(f, now));
  L.push({ id: 'foto', kind: 'foto', txt: 'Toma una foto en un lugar emblemático', h: 6, xp: 15 });
  if (L.length < 4) L.push({ id: 'banca', kind: 'banca', txt: 'Descansa en una banca de un parque', h: 4, xp: 10 });
  if (m >= 18 * 60) L.push({ id: 'casa', kind: 'casa', txt: 'Vuelve a tu casa', h: 5, xp: 10 });
  return L.slice(0, 5);
}
function festMision(f, now) {
  const M = { navidad: ['Ve a ver los alumbrados del río Medellín', 'rio'], velitas: ['Prende una velita en el parque de tu barrio', 'casa'], halloween: ['Recoge 5 dulces en tu barrio', 'dulces'], flores: ['Sigue el desfile de silleteros (3 puntos)', 'desfile'],
    libro: ['Compra un libro en la Fiesta del Libro (Jardín Botánico)', 'botanico'], amor: ['Lleva un detalle a un amigo en el Parque de Laureles', 'laureles'], patria: ['Ve al Parque Berrío a ver la bandera', 'berrio'], antioquia: ['Visita el Palacio de la Cultura', 'palacio'],
    semanasanta: ['Visita la Catedral Metropolitana', 'catedral'], nino: ['Lleva a un niño al Parque Norte', 'parquenorte'], madre: ['Lleva flores a casa', 'casa'], padre: ['Visita a tu papá en el Parque de Envigado', 'envigado'], anonuevo: ['Pedalea el primer viaje del año', 'km'] }[f.id] || ['Celebra en el Parque Berrío', 'berrio'];
  return { id: 'fiesta_' + f.id, kind: 'fiesta', fest: f, txt: f.icon + ' ' + M[0], where: M[1], h: 15, xp: 40, need: M[1] === 'km' ? 1500 : 0 };
}

/* ---------- animación de la rutina: entrar, que pase el tiempo y salir ---------- */
const RUT_TXT = { uni: ['Clase de Cálculo', 'Laboratorio', 'Almuerzo en la cafetería', 'Biblioteca', 'Clase de Inglés'], trabajo: ['Reunión del equipo', 'Correo y llamadas', 'Almuerzo', 'Informe del día'], colegio: ['Matemáticas', 'Recreo', 'Ciencias', 'Educación física'] };
class MGRutina extends MG {
  constructor(parent, o) { super(parent, o); this.kind = o.kind; this.name = o.name || ''; this.min = o.clock0 || 480; this.c0 = this.min; this.dur = o.dur || 120; this.ph = 0; this.k = 0; this.fast = 1; this.coach = 'El tiempo pasa mientras ' + (o.kind === 'uni' ? 'estudias' : o.kind === 'trabajo' ? 'trabajas' : 'estás en clase') + '. Toca para adelantar.'; }
  update(dt) {
    this.tick(dt); this.k += dt * this.fast;
    if (this.ph === 0 && this.k > 1.6) { this.ph = 1; this.k = 0; }
    else if (this.ph === 1) { this.min = this.c0 + this.dur * Math.min(1, this.k / 3.6); if (this.k > 3.6) { this.ph = 2; this.k = 0; this.score += 10; Snd.sfx('win'); } }
    else if (this.ph === 2 && this.k > 1.2) this.done = true;
  }
  skip() { this.fast = 3; Snd.sfx('tap'); }
  render(V) {
    const b = V.b, vw = V.vw, { gy } = this.bgStation(V, this.min), cx = Math.round(vw * .62);
    if (this.kind === 'uni') { prect(b, cx - 40, gy - 50, 80, 50, '#d8d2c4'); prect(b, cx - 44, gy - 56, 88, 8, '#a84f30'); for (let i = 0; i < 6; i++) prect(b, cx - 34 + i * 13, gy - 46, 4, 46, '#f1ece0'); prect(b, cx - 8, gy - 22, 16, 22, '#6e2c00'); }
    else if (this.kind === 'trabajo') { prect(b, cx - 26, gy - 80, 52, 80, '#8fa6bf'); for (let y = gy - 74; y < gy - 10; y += 8) for (let x = cx - 22; x < cx + 22; x += 8) prect(b, x, y, 5, 5, '#d6e4f2'); prect(b, cx - 7, gy - 18, 14, 18, '#1d2c44'); }
    else if (this.kind === 'colegio') { prect(b, cx - 44, gy - 36, 88, 36, '#f1c40f'); prect(b, cx - 44, gy - 40, 88, 5, '#c0392b'); for (let i = 0; i < 5; i++) prect(b, cx - 36 + i * 17, gy - 28, 9, 9, '#d6e4f2'); prect(b, cx - 6, gy - 18, 12, 18, '#6e2c00'); prect(b, cx + 36, gy - 70, 1, 34, '#59606c'); prect(b, cx + 37, gy - 70, 10, 3, '#f4d03f'); prect(b, cx + 37, gy - 67, 10, 2, '#2471a3'); prect(b, cx + 37, gy - 65, 10, 2, '#c0392b'); }
    const px = this.ph === 0 ? lerp(10, cx - 10, this.k / 1.6) : this.ph === 2 ? lerp(cx - 10, 10, this.k / 1.2) : -99;
    if (px > -50) Art.person(b, px, gy, Art.me(), this.t * 2, this.ph === 2 ? -1 : 1);
  }
  hud(V) {
    this.btns = [];
    V.text(this.name, V.w / 2, V.top + 18, { size: 18, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    if (this.ph === 1) {
      const acts = RUT_TXT[this.kind] || [''], a = acts[Math.floor(this.k / 3.6 * acts.length) % acts.length];
      V.text('🕐 ' + fmtClock(this.min), V.w / 2, V.h * .3, { size: 34, align: 'center', color: '#fff', stroke: '#0a2342', sw: 6 });
      V.text(a + '…', V.w / 2, V.h * .3 + 34, { size: 16, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 5, body: true });
      const w = Math.min(260, V.w - 40), c = V.ctx; c.fillStyle = '#0a2342dd'; c.fillRect((V.w - w) / 2, V.h * .3 + 52, w, 10); c.fillStyle = PAL.vd; c.fillRect((V.w - w) / 2, V.h * .3 + 52, w * Math.min(1, this.k / 3.6), 10);
    }
    if (!this.done && this.ph < 2) this.button(V, V.w / 2 - 80, V.h - 90, 160, 56, '⏩ Adelantar', () => this.skip(), { bg: PAL.vd2, size: 18, key: 'go' });
    this.drawPops(V);
  }
  tap() { this.skip(); return true; }
  bot() { this.skip(); }
}

/* ---------- modo libre: misiones, ciclovía, energía, bancas y fotos ---------- */
class ModeUsuarioR extends ModeUsuario {
  constructor(role, T, opt) {
    super(role, T, opt);
    const now = Cal.now(), sv = Cal.service(now), m = Cal.min(now);
    if (!this.free) { this.clock = clamp(m, sv.open + 10, sv.lend - 30); this.loan0 = this.clock; return; }   // préstamo a la hora real (dentro del horario)
    this.libreInit(now);
  }
  libreInit(now) {
    const R = this.ride, home = this.home = homeStation(); this.fecha = now; this.clock = Cal.min(now); this.rate = .9; this.energy = 100; this.greets = 0; this.cvDist = 0; this.misiones = [];
    R.p.x = home.x; R.p.y = home.y + 10 * WK; R.cam.x = R.p.x; R.cam.y = R.p.y; if (R.blocked(R.p.x, R.p.y, 2.5)) { const n = JE.map.nearestOpen(Math.floor(R.p.x / TS), Math.floor(R.p.y / TS), false); R.p.x = n.x * TS + TS / 2; R.p.y = n.y * TS + TS / 2; }
    const open = Cal.open(now); this.ownBike = this.opt.bici === 'propia' || !open; JE.ownBike = this.ownBike;
    if (Cal.cicloviaNow(now)) { this.mods.ciclovia = true; this.mods.traffic = .5; R.traffic = .5; }
    const day = (Save.data.dia && Save.data.dia.k === Cal.key(now)) ? Save.data.dia : (Save.data.dia = { k: Cal.key(now), done: [] });
    for (const ms of genMisiones(now)) if (!day.done.includes(ms.id)) this.addMision(ms);
    this.goals = []; this.misiones.forEach((ms, i) => this.goal(ms.txt, i === 0, () => ms.done, () => ms.prog ? ms.prog() : ms.done ? 'hecha' : ms.due ? 'antes de ' + Cal.hora(ms.due) : '¡vamos!'));
    if (!this.goals.length) this.goal('Ya hiciste las misiones de hoy: explora y colecciona postales', true, () => true);
    this.retarget(); if (JE.ui) JE.ui.toast((open ? '' : '🌙 EnCicla presta de ' + Cal.hora(Cal.service(now).open) + ' a ' + Cal.hora(Cal.service(now).lend - 1) + ': sales en tu bici. ') + (this.misiones.length ? '📋 Tienes ' + this.misiones.length + ' misiones para hoy' : ''));
  }
  addMision(ms) {
    const R = this.ride, M = JE.map; ms.marks = []; this.misiones.push(ms);
    const mk = (x, y, label, enter, col) => { const m = R.marker({ x, y, r: 14, col: col || '#ff2fb3', label, enter }); m.mis = ms; ms.marks.push(m); return m; };
    const at = p => placeP(p[2], p[3]), lm = id => { const L = LM[id]; return L ? { x: (L.x + L.w / 2) * TS, y: (L.y + L.h) * TS + 6 * WK } : null; };
    switch (ms.kind) {
      case 'rutina': { let p = ms.place ? at(ms.place) : null; if (!p) { const h = this.home; p = placeP(h.lat + .0025, h.lon + .002); } mk(p.x, p.y, ms.place ? ms.place[1] : 'Tu colegio', () => this.rutina(ms)); break; }
      case 'visita': { const p = lm(ms.place[0]) || at(ms.place); mk(p.x, p.y, ms.place[1], () => this.cumplir(ms)); break; }
      case 'casa': mk(this.home.x, this.home.y + 10 * WK, 'Tu casa', () => this.cumplir(ms), PAL.vd); break;
      case 'carrera': { const ln = this.cvLane(); if (!ln) { ms.done = true; break; } const s0 = clamp(M.project(ln, this.ride.p.x, this.ride.p.y).s + 40 * WK, 0, ln.len * .5), q = M.at(ln, s0); ms.lane = ln; ms.s0 = s0; mk(q.x, q.y, 'Salida de la carrera', () => this.salida(ms)); break; }
      case 'km': ms.prog = () => (this.cvDist * M_PER_PX / 1000).toFixed(1) + '/' + (ms.need / 1000) + ' km'; break;
      case 'saludo': ms.prog = () => Math.min(this.greets, ms.need) + '/' + ms.need; break;
      case 'banca': ms.prog = () => 'busca un parque'; break;
      case 'foto': ms.prog = () => 'cerca de un lugar con postal'; break;
      case 'fiesta': {
        const w = ms.where;
        if (w === 'dulces') { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU, p = JE.map.nearestOpen(Math.floor(this.home.x / TS + Math.cos(a) * 14), Math.floor(this.home.y / TS + Math.sin(a) * 14), false); mk(p.x * TS + TS / 2, p.y * TS + TS / 2, '🍬 Dulce', mm => { R.removeMarker(mm); ms.marks = ms.marks.filter(x => x !== mm); Snd.note(5 - ms.marks.length); if (!ms.marks.length) this.cumplir(ms); }, '#e67e22'); } ms.prog = () => (5 - ms.marks.length) + '/5 dulces'; }
        else if (w === 'desfile') { const ln = this.cvLane() || M.lanes[0]; for (let k = 1; k <= 3; k++) { const q = M.at(ln, ln.len * k / 4); mk(q.x, q.y, '🌼 Desfile ' + k, mm => { R.removeMarker(mm); ms.marks = ms.marks.filter(x => x !== mm); if (!ms.marks.length) this.cumplir(ms); }, '#f1c40f'); } ms.prog = () => (3 - ms.marks.length) + '/3 puntos'; }
        else if (w === 'rio') { const pr = M.project(M.river, this.ride.p.x, this.ride.p.y), q = M.at(M.river, pr.s), o = M.nearestOpen(Math.floor(q.x / TS) + 3, Math.floor(q.y / TS), false); mk(o.x * TS + TS / 2, o.y * TS + TS / 2, 'Alumbrados del río', () => this.cumplir(ms), '#ffd84a'); }
        else if (w === 'casa') mk(this.home.x, this.home.y + 10 * WK, 'Tu casa', () => this.cumplir(ms), '#ffd84a');
        else if (w === 'km') ms.prog = () => (this.cvDist * M_PER_PX / 1000).toFixed(1) + '/1,5 km';
        else { const p = lm(w) || (M.stations.find(s => s.id === w) || this.home); mk(p.x, p.y, ms.txt.replace(/^\S+ /, '').slice(0, 28), () => this.cumplir(ms), '#ffd84a'); }
        break;
      }
    }
  }
  cvLane() { const P = this.ride.p, L = JE.map.lanes.filter(l => l.cv && l.dir > 0 && l.len > 900 * WK); if (!L.length) return null; return L.sort((a, b) => JE.map.project(a, P.x, P.y).d - JE.map.project(b, P.x, P.y).d)[0]; }
  rutina(ms) { if (ms.done || this.sub) return; const late = this.clock > ms.due; this.runSub(new MGRutina(this, { kind: ms.rut, name: ms.place ? ms.place[1] : 'Tu colegio', clock0: this.clock, dur: ms.rut === 'colegio' ? 360 : 120 }), () => { this.clock += ms.rut === 'colegio' ? 360 : 120; this.cumplir(ms, late); }); }
  cumplir(ms, late) {
    if (ms.done) return; ms.done = true; for (const m of ms.marks || []) this.ride.removeMarker(m); ms.marks = [];
    const k = late ? .5 : 1, h = Math.round(ms.h * k), xp = Math.round(ms.xp * k), S = Save.data;
    S.stats.leaves += h; S.xp += xp; S.stats.misiones = (S.stats.misiones | 0) + 1; if (ms.kind === 'fiesta') S.flags.fiesta = 1; if (ms.id === 'carrera' && ms.won) S.flags.cvWin = 1;
    if (S.dia) S.dia.done.push(ms.id); Save.save(); this.score += 30 * k;
    this.ride.stamp = { t: 2, title: late ? 'MISIÓN (TARDE)' : '¡MISIÓN CUMPLIDA!', sub: '+' + h + ' hojas · +' + xp + ' XP', bg: late ? PAL.amb : PAL.vd };
    const nw = Logros.check(); if (nw.length && JE.ui) JE.ui.toast('🏅 Logro: ' + nw.map(l => l.name).join(', '));
    this.retarget();
  }
  retarget() {
    const P = this.ride.p, open = this.misiones.filter(m => !m.done && m.marks && m.marks.length).flatMap(m => m.marks);
    if (open.length) { this.ride.target = open.sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y))[0]; return; }
    this.pickFreeTarget();
  }
  pickFreeTarget() { if (this.misiones && this.misiones.some(m => !m.done && m.marks && m.marks.length)) return this.retarget(); super.pickFreeTarget(); }
  /* carrera de la ciclovía contra 3 ciclistas */
  salida(ms) {
    if (this.race || ms.done) return; const ln = ms.lane, M = JE.map, s0 = ms.s0, cps = [1, 2, 3].map(k => Math.min(ln.len - 20, s0 + 420 * WK * k));
    for (const m of ms.marks) this.ride.removeMarker(m); ms.marks = [];
    const names = RIVALES.slice(9, 16).map(r => r[0]); this.race = { ms, ln, cps, i: 0, cd: 3.2, t: 0, opps: [0, 1, 2].map(k => ({ id: k, name: names[k * 2] || 'Ciclista', shirt: ['#ff6b5a', '#56c7ff', '#ffc93c'][k], s: s0 - 8 * WK * (k + 1), v: (88 + k * 7) * WK / 2 * (.95 + this.rng.f() * .1), x: 0, y: 0, a: 0, fin: false })) };
    this.ride.opps = this.race.opps; this.raceMark(); Snd.sfx('tap'); JE.ui && JE.ui.toast('🏁 ¡Prepárate! Sigue la avenida de la ciclovía');
  }
  raceMark() { const r = this.race, q = JE.map.at(r.ln, r.cps[r.i]); r.m = this.ride.marker({ x: q.x, y: q.y, r: 16, col: r.i === 2 ? '#ff2fb3' : PAL.amb, label: r.i === 2 ? 'Meta' : 'Punto ' + (r.i + 1), num: r.i + 1, enter: () => { this.ride.removeMarker(r.m); r.i++; if (r.i >= 3) this.finRace(); else { Snd.sfx('star'); this.raceMark(); } } }); r.ms.marks = [r.m]; this.ride.target = r.m; }
  finRace() { const r = this.race, pos = 1 + r.opps.filter(o => o.fin).length; r.ms.won = pos === 1; this.ride.stamp = { t: 2.2, title: pos === 1 ? '¡GANASTE LA CARRERA!' : 'LLEGASTE DE ' + pos + '°', sub: 'Ciclovía de ' + (r.ln.name || 'la avenida'), bg: pos === 1 ? PAL.vd : PAL.amb }; this.cumplir(r.ms, pos > 2); this.race = null; this.ride.opps = []; }
  tick(dt) {
    super.tick(dt); if (!this.free) return; const R = this.ride, P = R.p, M = JE.map;
    // día y noche de 24 horas: tráfico según la hora, aviso de cierre de EnCicla y cambio de día a medianoche
    if (this.clock >= 1440) { this.clock -= 1440; this.fecha = addD(this.fecha, 1); JE.ui && JE.ui.toast('🌅 Nuevo día: ' + Cal.label(this.fecha)); }
    const hr = this.clock / 60, base = this.mods.ciclovia ? .5 : 1; R.traffic = base * (hr < 5 ? .25 : hr < 6 ? .5 : (hr < 9 || (hr >= 17 && hr < 19.5)) ? 1.3 : hr >= 21 ? .55 : 1);
    if (!this.ownBike) { const sv = Cal.service(this.fecha), m = this.clock; if (m >= sv.lend && m < sv.lend + 2 && !this.lendTold) { this.lendTold = 1; JE.ui && JE.ui.toast('🕘 Ya no se prestan bicis; puedes devolver la tuya hasta las ' + Cal.hora(sv.close)); } if (m >= sv.close - 30 && m < sv.close && !this.closeTold) { this.closeTold = 1; JE.ui && JE.ui.toast('🕘 EnCicla cierra a las ' + Cal.hora(sv.close) + ': devuelve la bici en una estación'); } }
    // energía: las subidas cansan, parar descansa; con poca energía se pedalea más lento (proporcional a la distancia recorrida con velMul)
    const sl = Math.max(0, R.sl || 0), drain = P.v > 5 ? (P.veh === 'walk' ? .12 : .35 + sl * 30) * velMul(this) : -3;
    this.energy = clamp(this.energy - drain * dt, 0, 100); if (this.energy < 15 && !this.tiredTold) { this.tiredTold = 1; JE.ui && JE.ui.toast('😮‍💨 Poca energía: siéntate en una banca de un parque o para un momento'); } if (this.energy > 40) this.tiredTold = 0;
    // ciclovía y ciclorrutas: distancia
    const v = R.tileAt(); if ((this.mods.ciclovia && (v === TT.AVE || v === TT.AUTO)) || v === TT.CICLO) this.cvDist += P.v * dt;
    for (const ms of this.misiones) if (!ms.done) { if ((ms.kind === 'km' || (ms.kind === 'fiesta' && ms.where === 'km')) && this.cvDist >= (ms.need || 3000) / M_PER_PX) this.cumplir(ms); if (ms.kind === 'saludo' && this.greets >= ms.need) this.cumplir(ms); }
    // carrera
    const r = this.race; if (r) {
      if (r.cd > 0) { r.cd -= dt; if (r.cd <= 0) Snd.sfx('win'); }
      else for (const o of r.opps) { if (o.fin) continue; o.s += o.v * dt; const q = M.at(r.ln, Math.max(0, o.s), (o.id - 1) * 4); o.x = q.x; o.y = q.y; o.a = q.a; if (o.s >= r.cps[2]) { o.fin = true; JE.ui && JE.ui.toast('🚴 ' + o.name + ' llegó a la meta'); } }
      if (r.cd > 0) for (const o of r.opps) { const q = M.at(r.ln, Math.max(0, o.s), (o.id - 1) * 4); o.x = q.x; o.y = q.y; o.a = q.a; }
    }
  }
  speedMul() { return (this.free && this.energy < 15 ? .72 : 1) * (this.race && this.race.cd > 0 ? 0 : 1); }
  update(dt) {
    if (this.sitting) { this.t += dt; this.clock += 3 * dt; this.energy = Math.min(100, this.energy + 18 * dt); this.sitT += dt; this.ride.update(dt, { x: 0, y: 0, m: 0 }); const b = this.misiones && this.misiones.find(m => m.kind === 'banca' && !m.done); if (b && this.sitT > 3) this.cumplir(b); return; }
    super.update(dt);
  }
  nearLM() { const P = this.ride.p; return PUBLIC_LM().find(L => dist((L.x + L.w / 2) * TS, (L.y + L.h / 2) * TS, P.x, P.y) < Math.max(L.w, L.h) * TS / 2 + 30 * WK); }
  foto(L) {
    const S = Save.data; S.fotos = (S.fotos || []).concat([{ id: L.id, k: Cal.key(this.fecha || Cal.now()), f: (Cal.fiesta() || {}).id || '', m: Math.round(this.clock) }]).slice(-60); S.stats.fotos = (S.stats.fotos | 0) + 1; Save.save();
    this.ride.flash = .4; Snd.sfx('star'); JE.ui && JE.ui.toast('📷 Foto guardada en tu álbum: ' + L.name);
    const ms = this.misiones && this.misiones.find(m => m.kind === 'foto' && !m.done); if (ms) this.cumplir(ms);
  }
  actions() {
    const a = super.actions(); if (!this.free || this.sub) return a; const R = this.ride, P = R.p, v = R.tileAt();
    if (this.sitting) return [{ id: 'up', icon: 'usuario', label: 'Levantarse', fn: () => { this.sitting = false; Snd.sfx('tap'); } }];
    if (P.v < 6 && (v === TT.PLAZA || v === TT.GRASS)) a.push({ id: 'sit', icon: 'hoja', label: 'Sentarse', fn: () => { this.sitting = true; this.sitT = 0; P.v = 0; Snd.sfx('tap'); JE.ui && JE.ui.toast('🪑 Descansando: recuperas energía y pasa el tiempo'); } });
    const L = this.nearLM(); if (L) a.push({ id: 'foto', icon: 'estrella', label: 'Foto', fn: () => this.foto(L) });
    return a;
  }
  info() { const i = super.info(); if (this.free) { const n = Art.night(this.clock); i.chips = [{ t: n > .5 ? '🌙 Noche' : n > 0 ? (this.clock < 720 ? '🌅 Amanece' : '🌇 Atardece') : '☀️ Día' }, { t: '⚡ ' + Math.round(this.energy) + '%', c: this.energy < 15 ? 'bad' : this.energy < 35 ? 'warn' : '' }].concat(this.ownBike ? [{ t: '🚲 Mi bici' }] : [{ t: 'EnCicla' }]); if (this.mods.ciclovia) i.chips.push({ t: '🚴 Ciclovía' }); } return i; }
  hud2(V) { if (this.race && this.race.cd > 0) { const n = Math.ceil(this.race.cd); V.text(n > 0 ? String(n) : '¡YA!', V.w / 2, V.h * .42, { size: 100, align: 'center', color: PAL.amb, stroke: PAL.az, sw: 10 }); } if (this.ride.flash > 0) { const c = V.ctx; c.fillStyle = 'rgba(255,255,255,' + (this.ride.flash * 1.5).toFixed(2) + ')'; c.fillRect(0, 0, V.w, V.h); this.ride.flash -= 1 / 60; } }
}
MODE_CLASS.usuario = ModeUsuarioR;
/* el timbre saluda a los ciclistas: se hacen a un lado y responden */
const _bell69 = Ride.prototype.bell;
Ride.prototype.bell = function () {
  const was = this.belT > 0; _bell69.call(this); if (was) return; const P = this.p, M = this.mode;
  const near = (this.npcB || []).concat(this.cars.filter(c => c.kind === 'bici' || c.kind === 'moto')).filter(q => !q.greeted && dist(q.x, q.y, P.x, P.y) < 70 * WK);
  for (const q of near) { q.greeted = true; q.v = (q.v || 30) * .7; if (q.kind !== 'moto') { this.fx.push({ k: 't', x: q.x, y: q.y - 10, t: 1.1, txt: this.rng.pick(['¡Buenas!', '¡Hola!', '¡Buen día!', '¡Eso!']), col: '#fff' }); if (M.greets != null) M.greets++; } }
};
/* en la ciclovía la avenida se llena de ciclistas; si los rozas solo frenas */
const _crash69 = Ride.prototype.crash;
Ride.prototype.crash = function (c) { if (c.kind === 'bici') { c.ghost = 1.5; this.p.v *= .5; this.float('¡Uy!', PAL.amb); return; } _crash69.call(this, c); };
const _carTop69 = Art.carTop;
Art.carTop = function (col, kind) { return kind === 'bici' ? this.riderTop(col, '#ffffff', SKINS[2], PAL.vd) : _carTop69.call(this, col, kind); };
const _uc69 = Ride.prototype.updCars;
Ride.prototype.updCars = function (dt) {
  _uc69.call(this, dt);
  if (!this.mode.mods.ciclovia || this.cars.filter(c => c.kind === 'bici').length >= 14) return;
  const L = this.map.lanesNear(this.cam.x, this.cam.y).filter(l => l.cv); if (!L.length || this.rng.f() > .3) return;
  const ln = this.rng.pick(L), p = clamp(this.map.project(ln, this.cam.x, this.cam.y).s + this.rng.range(-180, 180) * WK, 0, ln.len), q = this.map.at(ln, p, ln.off);
  if (Math.abs(q.x - this.cam.x) > 210 * WK || Math.abs(q.y - this.cam.y) > 210 * WK || dist(q.x, q.y, this.p.x, this.p.y) < 50 * WK) return;
  const c = { L: ln, p, v: 0, spd: this.rng.range(34, 52) * WK, yield: 0, stop: 0, si: q.i, kind: 'bici', col: this.rng.pick(['#ff6b5a', '#56c7ff', '#ffc93c', '#b07cff', '#ff8fc7', '#7fd1b9', '#f08a4b']) }; this.carPos(c); this.cars.push(c);
};
/* banca y fotos en el dibujo */
const _dgL = Ride.prototype.drawGround;
Ride.prototype.drawGround = function (b, ox, oy, inV) { _dgL.call(this, b, ox, oy, inV); if (this.mode.sitting) { const P = this.p; b.fillStyle = '#6e4a2a'; b.fillRect(P.x - ox - 8, P.y - oy + 2, 16, 4); b.fillStyle = '#3d2a18'; b.fillRect(P.x - ox - 7, P.y - oy + 6, 2, 3); b.fillRect(P.x - ox + 5, P.y - oy + 6, 2, 3); } };

/* ---------- interfaz: fecha de hoy, edición especial, bici del modo libre y álbum de fotos ---------- */
function applyFest() {
  const f = Cal.fiesta(), body = document.body; [...body.classList].filter(c => c.startsWith('fest-')).forEach(c => body.classList.remove(c));
  const old = $('#festBand'); if (old) old.remove(); if (!f) return;
  body.classList.add('fest-' + f.id); document.documentElement.style.setProperty('--fest1', f.cols[0]); document.documentElement.style.setProperty('--fest2', f.cols[1]);
  const band = document.createElement('div'); band.id = 'festBand'; band.className = 'festband'; band.textContent = f.icon + ' Edición especial: ' + f.name + ' · hasta el ' + f.hasta.getDate() + ' de ' + MESES[f.hasta.getMonth()];
  const cb = $('#sCover .cbody'); if (cb) cb.insertBefore(band, cb.querySelector('canvas'));
}
const _init69 = UI.init; UI.init = function () { _init69.call(this); applyFest(); };
const _ruta69 = UI.renderRuta;
UI.renderRuta = function () {
  _ruta69.call(this); const el = $('#tab-ruta'); if (!el) return; const r = Cal.resumen(), d = document.createElement('div'); d.className = 'hoy';
  const gifts = []; for (const k of ['shirt', 'helmet']) for (const i in FEST_REQ[k]) if (festOk(FEST_REQ[k][i][0]) && !Save.data.owned.includes(k + i)) gifts.push(FEST_REQ[k][i][1]);
  d.innerHTML = esc(r.txt) + (r.f ? `<div class="hf">${r.f.icon} <b>${esc(r.f.name)}</b>: el valle se vistió de fiesta${gifts.length ? ' · 🎁 regalo de temporada en Mi ciclista: ' + esc(gifts.join(', ')) : ''}</div>` : '');
  el.insertBefore(d, el.children[1] || null);
};
const _brief69 = UI.brief;
UI.brief = function (roleId, turno, o = {}) {
  if (!o.nov && !o.reto && !isMulti(roleId)) { const now = Cal.now(), f = Cal.fiesta(now), all = NOVEDADES.concat(NOV_EXTRA); const id = Cal.cicloviaNow(now) ? 'ciclovia' : f && f.nov; if (id) o = Object.assign({}, o, { nov: all.find(n => n.id === id) }); }
  _brief69.call(this, roleId, turno, o);
  if (roleId === 'usuario' && o.free) {
    const now = Cal.now(), open = Cal.open(now), bici = o.bici || (open ? 'encicla' : 'propia'), L = genMisiones(now), go = $('#bGo');
    const box = document.createElement('div'); box.className = 'paper libre';
    box.innerHTML = `<div class="t">Hoy en el modo libre</div><p style="margin:4px 0">${esc(Cal.resumen(now).txt)}</p><div class="pag">¿Con qué bici sales?</div><div class="zonas"><button class="chip ${bici === 'encicla' ? 'on' : ''}" data-bici="encicla" ${open ? '' : 'disabled'}>🟢 EnCicla${open ? '' : ' (cerrada)'}</button><button class="chip ${bici === 'propia' ? 'on' : ''}" data-bici="propia">🚲 Mi bici</button></div>
      <div class="pag">Misiones de hoy</div><ul class="goals">${L.map(m => `<li><b>☆</b><span>${esc(m.txt)}</span></li>`).join('') || '<li><span>Explora el valle y colecciona postales</span></li>'}</ul>
      ${Save.data.profile.uni || Save.data.profile.trabajo || Save.data.profile.colegio ? '' : '<p class="m" style="font-size:13px">Cuéntanos de ti en Mi ciclista › Tú para tener misiones de colegio, universidad o trabajo.</p>'}`;
    go.parentNode.parentNode.insertBefore(box, go.parentNode);
    $$('[data-bici]', box).forEach(b => b.onclick = () => { Snd.sfx('tap'); this.brief(roleId, turno, Object.assign({}, o, { bici: b.dataset.bici })); });
    go.onclick = () => { Snd.init(); Snd.resume(); Game.start(roleId, turno, Object.assign({}, o, { seed: (Date.now() >>> 0), nov: o.nov || NOVEDADES[0], bici })); };
  }
};
const _start69 = Game.start;
Game.start = function (roleId, turno, o = {}) { JE.ownBike = false; Snd.fest = (Cal.fiesta() || {}).music || null; return _start69.call(this, roleId, turno, o); };
const _album69 = UI.renderAlbum;
UI.renderAlbum = function () {
  _album69.call(this); const el = $('#tab-album'), F = Save.data.fotos || []; if (!el || !F.length) return;
  const d = document.createElement('div'); d.innerHTML = `<div class="pag" style="margin-top:16px">📷 Tus fotos · ${F.length}</div><div class="fotos">${F.slice().reverse().slice(0, 24).map((f, i) => { const L = LM[f.id]; if (!L) return ''; const fi = FIESTAS.find(x => x[0] === f.f); return `<figure class="foto"><canvas width="96" height="72" data-foto="${LANDMARKS.indexOf(L)}"></canvas><figcaption>${esc(L.name.split(' · ')[0])}<br><small>${esc(f.k)}${fi ? ' ' + fi[2] : ''}</small></figcaption></figure>`; }).join('')}</div>`;
  el.appendChild(d); $$('canvas[data-foto]', d).forEach(c => this.drawPost(c, +c.dataset.foto));
};
/* preguntas del perfil: efectos al elegir */
JE.onProfile = (k, i) => {
  const S = Save.data;
  if (k === 'edad') { if ((i === 0 || i === 3) && S.settings.pace !== 'tranquilo') { S.settings.pace = 'tranquilo'; UI.toast('Ritmo tranquilo activado: más tiempo para todo (se cambia en Más)'); } if (i === 3 && !S.settings.big) { S.settings.big = true; document.body.classList.add('big'); } }
  if (k === 'tall' && S.profile.bikeSize == null) S.profile.bikeSizeAuto = i;
};
LOGROS.push(
  { id: 'misiones10', name: 'Vida sobre ruedas', desc: 'Cumple 10 misiones del modo libre', icon: 'usuario', test: S => (S.stats.misiones | 0) >= 10 },
  { id: 'cvwin', name: 'Rey de la ciclovía', desc: 'Gana una carrera de la ciclovía', icon: 'balance', test: S => !!S.flags.cvWin },
  { id: 'fiesta', name: 'De fiesta en el valle', desc: 'Cumple una misión de una festividad', icon: 'estrella', test: S => !!S.flags.fiesta },
  { id: 'foto10', name: 'Fotógrafo del valle', desc: 'Toma 10 fotos', icon: 'estrella', test: S => (S.stats.fotos | 0) >= 10 }
);
```


#### Cómo probar M1

1. Abrir `dist/juega-encicla.html` o ejecutar `NODE_PATH=/tmp/pw/node_modules NODE_OPTIONS="-r /tmp/pw/setup.js" node tests/run.js --n=27`.
2. En **Modo Libre**, activar `🧭 Paseo` y pellizcar o girar la cámara con dos dedos: el paseo guiado continúa sin interrumpirse y la cámara responde con suavidad.
3. En **Más > Velocidad de la bici**, cambiar entre *Tranquila* (`0,8×`) y *Muy rápida* (`1,5×`) subiendo hacia San Javier o Manrique: la barra de energía baja exactamente lo mismo por cada 100 m ascendidos.
4. En **En red (multijugador)**, crear una sala con 3 pestañas incluso sin conexión Wi-Fi/LAN: los 3 dispositivos enlazan y corren la partida sincronizada.

---

### M2 · Unificación y mejora del mapa (Motor del Valle 1.1.0, túneles y 2 niveles) `[Ambos / Juega EnCicla]`

#### Qué se hizo en M2

1. **Motor del Valle v1.1.0 (`motor-valle/VERSION.json`, `motor-valle/js/valle.js`, `motor-valle/capas/index.mjs`):**
   - Se creó `motor-valle/js/valle.js`, que expone `Valle.decodificar(meta, binB64, tsPx)` para *Juega EnCicla* (`tileM = 10 m`, `TS = 16 px`) y *El Metro* (`tileM = 20 m`), con conversiones exactas `geoACasilla(lat, lon)`, `casillaAGeo(tx, ty)`, `pxAMetros`, `metrosAPx` y consultas `suelo`, `cotaCasilla`, `cotaPx`, `pendientePx`, `municipioEn`, `barrioEn` y `comunaEn`.
   - Se creó `motor-valle/capas/index.mjs` con el registro formal de las 11 capas compartidas entre ambos juegos.
2. **Túneles, soterrados y deprimidos viales (`motor-valle/geo/alturas.py`, `src/data/alturas.json`, `src/js/76-altura.js`):**
   - `motor-valle/geo/alturas.py` extrae ahora tanto `is_bridge` (`puentes`, nivel `>= +1`) como `is_tunnel` (`tuneles`, nivel `<= -1`) e incluye los **12 principales soterrados y deprimidos del Valle de Aburrá** (*Soterrado de Parques del Río Autopista Sur y Av. Regional*, *Deprimido de San Juan / La Alpujarra*, *Av. Oriental con La Playa*, *Villanueva*, *Bulerías / Av. 33*, *Terminal del Norte / Caribe*, *Industriales / Calle 30*, *La 80 con Colombia*, *Puente Madre Laura*, *Guayabal / Cristo Rey* y *Aguacatala / El Poblado*).
   - En `CityMap.alturas()` (`src/js/76-altura.js`), cada túnel/deprimido se construye en `this.tunnels` y `this.tunG` con cota relativa `z = -0.18`, rampas suaves en sus extremos y muros de contención laterales.
3. **Física, colisiones de tráfico y ruteo GPS en dos niveles (`src/js/76-altura.js`, `src/js/20-map.js`, `src/js/30-ride.js`):**
   - `Ride.prototype.nivel()` y `Ride.prototype.nivelCarros()` asignan nivel `+1` en puentes, `-1` en deprimidos/soterrados y `0` a nivel del suelo tanto en 3D como en 2D.
   - `Ride.prototype.updCars()` comprueba `sameLvl = (c.nivel != null ? c.nivel : (c.arriba ? 1 : 0)) === Math.sign(P.lvl || 0)` antes de frenar, pitar o chocar, eliminando los choques fantasma entre niveles distintos.
   - `CityMap.nextStep(F, x, y, lvl)` consulta `this.desnivel` para penalizar giros ortogonales a mitad de un puente o túnel, guiando al GPS y a los bots hasta la rampa de salida.

#### Especificaciones visuales y medidas de puentes y deprimidos (Arte autocontenido M2)

| Elemento | Medidas en metros | Medidas en píxeles (`1 m = 1,6 px`) | Paleta Hex |
|---|---|---|---|
| Tablero viaducto Metro (A y B) | `10,0 m` ancho · columnas cada `30 m` | `16,0 px` ancho · columnas cada `48 px` | Tablero `#9a9185`, canto `#6f685e`, riel `#2b2a28`, Línea A `#1C5C9C`, Línea B `#E38835` |
| Puente vehicular / ciclorruta | `4,4 m` a `14,0 m` ancho · rampa `16 m` | `7,0 px` a `22,4 px` ancho · rampa `26 px` | Asfalto `#565a62`, ciclorruta `#2e9d55`, baranda `#cfcabf`, pilar `#aaa59a` |
| Deprimido / soterrado (`lvl = -1`) | `12,0 m` a `22,0 m` ancho · rampa `17,5 m` | `19,2 px` a `35,2 px` ancho · rampa `28 px` | Calzada excavada `#252932`, muro contención `#7e838c`, portal preventivo `#f2c400`, luz interior `#ffd47a` |

#### Código completo de los archivos nuevos y modificados en M2

#### Archivo: `motor-valle/VERSION.json` [Ambos]

```json
{
 "version": "1.1.0",
 "fecha": "2026-11-18",
 "fuente_de_verdad": "juanfeliperico369-stack/BicicletasUno (carpeta motor-valle/)",
 "copias": ["juanfeliperico369-stack/MetroZero (carpeta motor-valle/)"],
 "resoluciones": { "encicla": 10, "elmetro": 20 },
 "capas": ["suelo", "relieve", "red_sitva", "estaciones_encicla", "ciclorrutas", "barrios", "comunas", "alturas", "tuneles", "sitios", "personajes"],
 "origen": { "lon0": -75.70, "latN": 6.46, "lon1": -75.31, "latS": 6.015 }
}
```

#### Archivo: `motor-valle/js/valle.js` [Ambos]

```javascript
/* =====================================================================
   MOTOR DEL VALLE (motor-valle/js/valle.js · v1.1.0)
   Lector y consultor unificado del mapa del Valle de Aburrá para Juega EnCicla (10 m/casilla)
   y El Metro (20 m/casilla). Decodifica VALLE_META y VALLE_BIN, convierte coordenadas
   (lat/lon ↔ metros ↔ casilla ↔ píxel) y responde consultas de suelo, cota, pendiente,
   barrio, comuna, municipio, vía más cercana, estación y desnivel (puente/túnel/suelo).
   ===================================================================== */
(function (root) {
  'use strict';
  const b64 = s => { const a = atob(s), u = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) u[i] = a.charCodeAt(i); return u; };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  const Valle = {
    version: '1.1.0',
    /* decodifica o enlaza el mapa del Valle de Aburrá en un consultor unificado */
    decodificar(meta, binB64, tsPx) {
      const jm = root.JE && root.JE.map;
      const M = meta || (typeof VALLE_META !== 'undefined' ? VALLE_META : root.VALLE_META) || (jm && jm.meta);
      const B = binB64 || (typeof VALLE_BIN !== 'undefined' ? VALLE_BIN : root.VALLE_BIN);
      if (!M) return null;
      const W = M.W || M.w, H = M.H || M.h, tileM = M.tile || 10, TS = tsPx || 16, PXM = TS / tileM;
      const ew = M.eW || M.ew || 0, eh = M.eH || M.eh || 0, es = M.es || 8;
      let t = jm && jm.t, el = jm && jm.E;
      if ((!t || !el) && B) {
        const raw = b64(B);
        if (typeof inflateRaw === 'function' && M.eW) {
          const nT = W * H, nE = ew * eh, u = inflateRaw(raw, nT + nE * 2);
          t = u.slice(0, nT);
          const ed = new Int16Array(u.slice(nT, nT + nE * 2).buffer); el = new Int16Array(nE);
          for (let j = 0; j < eh; j++) { let a = 0; for (let i = 0; i < ew; i++) { a += ed[j * ew + i]; el[j * ew + i] = a; } }
        }
      }
      return {
        meta: M, w: W, h: H, tileM, ts: TS, pxm: PXM, t, el, ew, eh, es,
        /* conversiones de coordenadas */
        geoACasilla(lat, lon) {
          return M.kx ? { x: (lon - M.lon0) * M.kx, y: (M.latN - lat) * M.ky } : {
            x: (lon - M.lon0) / (M.lon1 - M.lon0) * W,
            y: (M.latN - lat) / (M.latN - M.latS) * H
          };
        },
        casillaAGeo(tx, ty) {
          return M.kx ? { lat: M.latN - ty / M.ky, lon: M.lon0 + tx / M.kx } : {
            lat: M.latN - (ty / H) * (M.latN - M.latS),
            lon: M.lon0 + (tx / W) * (M.lon1 - M.lon0)
          };
        },
        pxAMetros(px) { return px / PXM; },
        metrosAPx(m) { return m * PXM; },
        /* consultas de terreno y relieve */
        suelo(tx, ty) { tx |= 0; ty |= 0; return (!t || tx < 0 || ty < 0 || tx >= W || ty >= H) ? 1 : t[ty * W + tx]; },
        cotaCasilla(tx, ty) {
          if (jm && typeof jm.elev === 'function') return jm.elev(tx * TS, ty * TS);
          if (!el || !ew || !eh) return 1500;
          const gx = clamp(tx / es, 0, ew - 1.001), gy = clamp(ty / es, 0, eh - 1.001), x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0, i = y0 * ew + x0;
          return (el[i] * (1 - fx) + el[i + 1] * fx) * (1 - fy) + (el[i + ew] * (1 - fx) + el[i + ew + 1] * fx) * fy;
        },
        cotaPx(x, y) { return this.cotaCasilla(x / TS, y / TS); },
        pendientePx(x, y, ang) {
          const d = 2 * TS;
          return (this.cotaPx(x + Math.cos(ang) * d, y + Math.sin(ang) * d) - this.cotaPx(x - Math.cos(ang) * d, y - Math.sin(ang) * d)) / (4 * tileM);
        },
        /* consultas geográficas del valle (barrio, comuna, municipio) */
        municipioEn(tx, ty) {
          if (jm && typeof jm.muniAt === 'function') return jm.muniAt(tx, ty);
          const L = (typeof MUNIS !== 'undefined' ? MUNIS : root.MUNIS) || []; let best = null, bd = 1e18;
          for (const m of L) { const d = (m.x - tx) * (m.x - tx) + (m.y - ty) * (m.y - ty); if (d < bd) { bd = d; best = m; } }
          return best ? best.name : 'Medellín';
        },
        barrioEn(tx, ty) {
          if (jm && typeof jm.barrioAt === 'function') return jm.barrioAt(tx, ty);
          const L = (typeof BARRIOS !== 'undefined' ? BARRIOS : root.BARRIOS) || []; let best = null, bd = 72 * 72;
          for (const b of L) { const bx = b[1], by = b[2], d = (bx - tx) * (bx - tx) + (by - ty) * (by - ty); if (d < bd) { bd = d; best = b[0]; } }
          return best;
        },
        comunaEn(tx, ty) {
          if (jm && typeof jm.comunaAt === 'function') return jm.comunaAt(tx, ty);
          const L = (typeof COMUNAS !== 'undefined' ? COMUNAS : root.COMUNAS) || []; let best = null, bd = 160 * 160;
          for (const c of L) { const cx = c[2], cy = c[3], d = (cx - tx) * (cx - tx) + (cy - ty) * (cy - ty); if (d < bd) { bd = d; best = { code: c[0], name: c[1] }; } }
          return best;
        },
        nivelEn(tx, ty) {
          if (jm && jm.desnivel) return jm.desnivel.get((ty | 0) * W + (tx | 0)) || 0;
          return 0;
        }
      };
    }
  };

  root.Valle = Valle;
  if (typeof root.JE === 'object' && root.JE) root.JE.valle = Valle;
})(typeof window !== 'undefined' ? window : globalThis);
```

#### Archivo: `motor-valle/capas/index.mjs` [Ambos]

```javascript
/* =====================================================================
   CAPAS COMPARTIDAS DEL MOTOR DEL VALLE (motor-valle/capas/index.mjs · v1.1.0)
   Catálogo descriptivo de las capas que comparten Juega EnCicla y El Metro
   sobre el mismo sistema de coordenadas del Valle de Aburrá.
   ===================================================================== */
export const CAPAS_VALLE = {
  suelo: { id: 'suelo', fuente: 'OpenStreetMap + Overture Maps', formato: 'RLE Uint8Array en VALLE_BIN', compartido: ['encicla', 'elmetro'] },
  relieve: { id: 'relieve', fuente: 'SRTM / Copernicus DEM 30 m', formato: 'Delta-grid cada 40 m en VALLE_BIN', compartido: ['encicla', 'elmetro'] },
  red_sitva: { id: 'red_sitva', fuente: 'Metro de Medellín / OSM', formato: 'Trazados reales Líneas A, B, T-A, Cables K/J/H/M/P/L y Metroplús 1/2/O', compartido: ['encicla', 'elmetro'] },
  estaciones_encicla: { id: 'estaciones_encicla', fuente: 'Área Metropolitana del Valle de Aburrá (AMVA)', formato: '133 estaciones manuales y automáticas con coordenadas reales', compartido: ['encicla'] },
  ciclorrutas: { id: 'ciclorrutas', fuente: 'OSM highway=cycleway + POT Medellín', formato: 'Cadenas de vías tipo 5 y casillas TT.CICLO', compartido: ['encicla'] },
  barrios: { id: 'barrios', fuente: 'GeoMedellín / DANE', formato: 'BARRIOS (388 barrios y veredas con centroide)', compartido: ['encicla', 'elmetro'] },
  comunas: { id: 'comunas', fuente: 'GeoMedellín / AMVA', formato: 'COMUNAS (16 comunas y 5 corregimientos)', compartido: ['encicla', 'elmetro'] },
  alturas: { id: 'alturas', fuente: 'Overture Maps + OSM (is_bridge, level)', formato: 'ALTURAS.metro y ALTURAS.puentes en src/data/alturas.json', compartido: ['encicla', 'elmetro'] },
  tuneles: { id: 'tuneles', fuente: 'Overture Maps + OSM (is_tunnel, level <= -1, cutting)', formato: 'ALTURAS.tuneles (deprimidos y soterrados viales)', compartido: ['encicla', 'elmetro'] },
  sitios: { id: 'sitios', fuente: 'Overture Maps buildings + places', formato: 'SITIOS (1203 sitios reales y 5314 edificios con huella)', compartido: ['encicla', 'elmetro'] },
  personajes: { id: 'personajes', fuente: 'Guion compartido Ruedas y Rieles del Aburrá', formato: 'contenido/guion/metro.json + contenido/guion/trama_valle.json', compartido: ['encicla', 'elmetro'] }
};

export function listarCapas(juego) {
  if (!juego) return Object.values(CAPAS_VALLE);
  return Object.values(CAPAS_VALLE).filter(c => c.compartido.includes(juego));
}
```

#### Archivo: `motor-valle/geo/alturas.py` [Ambos]

```python
"""Lo que va en alto y en bajo (v1.8 / Motor del Valle 1.1.0): tramos del metro en viaducto,
   puentes de las vías (is_bridge, level >= 1) y túneles/deprimidos viales (is_tunnel, level <= -1).
   Fuente: Overture Maps (datos de OpenStreetMap, ODbL): segmentos con road_flags/rail_flags
   (is_bridge, is_tunnel) y level_rules, más los principales soterrados y deprimidos del Valle de Aburrá.
   Entrada: motor-valle/geo/cache/rail_niveles.parquet y puentes.parquet (los baja motor-valle/geo/fetch.py)
   y src/data/valle.json (proyección).
   Salida: src/data/alturas.json, que tools/build.js mete en el juego como ALTURAS.
   Uso: python3 motor-valle/geo/alturas.py
"""
import json, math, os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
CACHE = os.path.join(os.path.dirname(__file__), 'cache')
VM = json.load(open(os.path.join(ROOT, 'src', 'data', 'valle.json')))
LON0, LATN, KX, KY, MW, MH = VM['lon0'], VM['latN'], VM['kx'], VM['ky'], VM['W'], VM['H']
Q = 8   # coordenadas en casillas ×8 (1,25 m)
CXM = 111320 * math.cos(math.radians(6.25)); CYM = 110574

def pts(w):
    w = w[w.index('(') + 1:w.rindex(')')]
    return [tuple(map(float, p.split())) for p in w.split(',')]
def cum(P):
    s = [0.0]
    for a, b in zip(P, P[1:]): s.append(s[-1] + math.hypot((b[0] - a[0]) * CXM, (b[1] - a[1]) * CYM))
    return s
def sub(P, S, a, b):
    """trozo de la línea entre las fracciones a y b de su largo"""
    L = S[-1]; ta, tb = a * L, b * L; out = []
    def at(t):
        for i in range(1, len(P)):
            if S[i] >= t:
                u = (t - S[i - 1]) / max(1e-9, S[i] - S[i - 1]); return (P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u)
        return P[-1]
    out.append(at(ta))
    for i in range(1, len(P) - 1):
        if ta < S[i] < tb: out.append(P[i])
    out.append(at(tb)); return out
def tile(lon, lat): return ((lon - LON0) * KX, (LATN - lat) * KY)
def rdp(P, eps):
    if len(P) <= 2: return P
    a, b = P[0], P[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-9
    i, md = max(((i, abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / L) for i, p in enumerate(P[1:-1], 1)), key=lambda t: t[1])
    if md <= eps: return [a, b]
    return rdp(P[:i + 1], eps)[:-1] + rdp(P[i:], eps)
def nivel(lv, a, b, default=1):
    best = 0
    for l in lv or []:
        la, lb = l['between'] or [0, 1]
        if la < b - 1e-6 and lb > a + 1e-6:
            v = int(l['value'])
            best = min(best, v) if default < 0 else max(best, v)
    return best or default
def q8(P): return [int(round(v * Q)) for p in P for v in p]

# Principales soterrados y deprimidos viales del Valle de Aburrá (garantizados aunque no haya caché parquet local)
DEPRIMIDOS_VALLE = [
    # [k, nivel, largo_m, (lon_a, lat_a), (lon_b, lat_b)]
    (3, -1, 390, [(-75.5811, 6.2416), (-75.5792, 6.2450)]),   # Soterrado Parques del Río (Autopista Sur)
    (3, -1, 360, [(-75.5784, 6.2422), (-75.5767, 6.2453)]),   # Soterrado Parques del Río (Av. Regional)
    (2, -1, 210, [(-75.5754, 6.2450), (-75.5734, 6.2456)]),   # Deprimido de San Juan (La Alpujarra)
    (2, -1, 185, [(-75.5648, 6.2488), (-75.5643, 6.2506)]),   # Deprimido Av. Oriental con La Playa
    (2, -1, 175, [(-75.5637, 6.2538), (-75.5628, 6.2554)]),   # Deprimido de Villanueva (Av. Oriental)
    (2, -1, 165, [(-75.5872, 6.2392), (-75.5856, 6.2402)]),   # Deprimido de Bulerías (Av. 33)
    (3, -1, 220, [(-75.5694, 6.2700), (-75.5685, 6.2721)]),   # Deprimido Terminal del Norte / Caribe
    (2, -1, 180, [(-75.5762, 6.2314), (-75.5747, 6.2325)]),   # Deprimido de Industriales (Calle 30)
    (2, -1, 170, [(-75.5951, 6.2600), (-75.5944, 6.2616)]),   # Deprimido de la 80 con Colombia
    (3, -1, 195, [(-75.5644, 6.2782), (-75.5635, 6.2800)]),   # Deprimido Puente Madre Laura
    (2, -1, 160, [(-75.5851, 6.2090), (-75.5844, 6.2104)]),   # Deprimido de Guayabal / Cristo Rey
    (2, -1, 155, [(-75.5791, 6.1940), (-75.5785, 6.1955)]),   # Deprimido Aguacatala / Av. El Poblado
]

def build_curated_tunnels():
    out = []
    for k, lv, lenM, coords in DEPRIMIDOS_VALLE:
        T = [tile(lon, lat) for lon, lat in coords]
        if all(0 <= x < MW and 0 <= y < MH for x, y in T):
            out.append([k, lv, lenM] + q8(T))
    return out

if __name__ == '__main__':
    dst = os.path.join(ROOT, 'src', 'data', 'alturas.json')
    rail_p = os.path.join(CACHE, 'rail_niveles.parquet')
    puentes_p = os.path.join(CACHE, 'puentes.parquet')
    if os.path.exists(rail_p) and os.path.exists(puentes_p):
        import duckdb
        c = duckdb.connect()
        def dseg(p, a, b):
            dx, dy = b[0] - a[0], b[1] - a[1]; t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy or 1)))
            return math.hypot(a[0] + dx * t - p[0], a[1] + dy * t - p[1])
        LIN = {k: [(VM['metro'][k]['p'][i] / 4, VM['metro'][k]['p'][i + 1] / 4) for i in range(0, len(VM['metro'][k]['p']), 2)] for k in ('A', 'B')}
        def cerca(p, k): return min(dseg(p, a, b) for a, b in zip(LIN[k], LIN[k][1:]))
        metro = []
        for _id, cl, name, fl, lv, w in c.execute(f"select id, class, name, flags, niveles, wkt from '{rail_p}' where class='subway'").fetchall():
            P = pts(w); S = cum(P)
            for f in json.loads(fl) if fl else []:
                if 'is_bridge' not in f['values']: continue
                a, b = f['between'] or [0, 1]; L = (b - a) * S[-1]
                if L < 40: continue
                T = [tile(*p) for p in sub(P, S, a, b)]; mid = T[len(T) // 2]
                k = min(('A', 'B'), key=lambda k: cerca(mid, k))
                if cerca(mid, k) > 3: continue
                metro.append([k, nivel(json.loads(lv) if lv else [], a, b, 1)] + q8([T[0], T[-1]]))
        VK = {'residential': 1, 'unclassified': 1, 'living_street': 1, 'service': 1, 'tertiary': 4, 'secondary': 2, 'primary': 2, 'trunk': 3, 'motorway': 3,
              'pedestrian': 6, 'footway': 6, 'path': 6, 'cycleway': 5}
        MINL = {1: 10, 4: 10, 2: 10, 3: 10, 5: 12, 6: 12}
        puentes, tuneles = [], build_curated_tunnels()
        for cl, subcl, name, fl, lv, w in c.execute(f"select class, subclass, name, flags, niveles, wkt from '{puentes_p}'").fetchall():
            k = VK.get(cl)
            if not k or not fl: continue
            if cl == 'service' and subcl != 'alley' and not name: continue
            if cl in ('footway', 'path') and subcl in ('sidewalk', 'crosswalk'): continue
            P = pts(w); S = cum(P)
            for f in json.loads(fl):
                vals = f['values'] or []
                is_br = 'is_bridge' in vals
                is_tn = 'is_tunnel' in vals or 'is_underpass' in vals
                if not (is_br or is_tn): continue
                a, b = f['between'] or [0, 1]; L = (b - a) * S[-1]
                if L < MINL[k]: continue
                T = rdp([tile(*p) for p in sub(P, S, a, b)], .12)
                if not all(0 <= x < MW and 0 <= y < MH for x, y in T): continue
                if is_br:
                    puentes.append([k, nivel(json.loads(lv) if lv else [], a, b, 1), round(L)] + q8(T))
                elif is_tn:
                    tuneles.append([k, nivel(json.loads(lv) if lv else [], a, b, -1), round(L)] + q8(T))
        out = {'fuente': 'Overture Maps Foundation (datos de OpenStreetMap, ODbL): road_flags/rail_flags is_bridge, is_tunnel y level_rules', 'q': Q, 'metro': metro, 'puentes': puentes, 'tuneles': tuneles}
    else:
        cur = json.load(open(dst)) if os.path.exists(dst) else {'q': Q, 'metro': [], 'puentes': []}
        cur['fuente'] = 'Overture Maps Foundation (datos de OpenStreetMap, ODbL): road_flags/rail_flags is_bridge, is_tunnel y level_rules'
        cur['tuneles'] = build_curated_tunnels()
        out = cur
    json.dump(out, open(dst, 'w'), separators=(',', ':'))
    print('-> alturas.json:', len(out.get('metro', [])), 'metro ·', len(out.get('puentes', [])), 'puentes ·', len(out.get('tuneles', [])), 'túneles/deprimidos')
```

#### Archivo: `src/js/76-altura.js` [Juega EnCicla]

```javascript
/* =====================================================================
   LO QUE VA EN ALTO (v1.7): el metro en viaducto con sus estaciones elevadas y los puentes de las vías,
   cada uno a su altura (Overture / OpenStreetMap: is_bridge y level; motor-valle/geo/alturas.py).
   En la ciudad 3D la bici pasa por DEBAJO del viaducto y de los puentes; a un puente se sube por sus
   extremos (si se llega por un lado, se pasa por debajo). En el suelo quedan su sombra y sus pilares.
   ===================================================================== */
const ALT = { mA: .4, mB: .5, techo: .27, grosor: .075, pz: 36, paso: 6 };
const ALT_SL = 55 * (TS / (VM.tile || 10)), ALT_SW = 9.2 * (TS / (VM.tile || 10));   // medio largo (andén de 110 m) y medio ancho (cubierta a 9 m del eje) de una estación del metro, como en El Metro
const altSuave = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const ALT_KV = { 1: [1, 4], 4: [1, 4], 2: [2, 3], 3: [2, 3], 5: [5], 6: [6, 8] };   // tipos de vía del dibujo que puede ser cada puente

Object.assign(CityMap, {
  alturas() {
    this.altG = new Map(); this.decks = []; this.deckG = new Map(); this.tunnels = []; this.tunG = new Map(); this.desnivel = new Map();
    const A = typeof ALTURAS !== 'undefined' && ALTURAS; if (!A) return;
    const q = A.q || 8, S = CH * TS, CK = (x, y) => Math.floor(x / S) + ',' + Math.floor(y / S), meter = (G, k, o) => (G.get(k) || G.set(k, []).get(k)).push(o);
    // ---- metro: tramos en viaducto de las líneas A y B, con rampas en sus extremos ----
    for (const [L, id, zd, col] of [[this.lineA, 'A', ALT.mA, '#1C5C9C'], [this.lineB, 'B', ALT.mB, '#E38835']]) {
      if (!L) continue; const iv = [];
      for (const m of A.metro || []) {   // la línea del juego está suavizada: en las curvas se aparta hasta ~100 m del trazado; si el tramo sigue más allá de la punta de la línea, llega hasta la punta
        if (m[0] !== id) continue; const pa = this.project(L, m[2] / q * TS, m[3] / q * TS), pb = this.project(L, m[4] / q * TS, m[5] / q * TS), punta = r => r.s < 5 || r.s > L.len - 5, ok = r => r.d <= 160 || punta(r);
        if (Math.min(pa.d, pb.d) > 160 || !ok(pa) || !ok(pb)) continue; iv.push([Math.min(pa.s, pb.s), Math.max(pa.s, pb.s)]);
      }
      iv.sort((a, b) => a[0] - b[0]); const R = [];
      for (const v of iv) { const l = R[R.length - 1]; if (l && v[0] <= l[1] + 40) l[1] = Math.max(l[1], v[1]); else R.push(v.slice()); }
      L.alto = R.map(([s0, s1]) => { const len = s1 - s0, r = Math.min(110, len / 3); return { s0, s1, z: len > 700 ? zd : Math.min(zd, .26), r0: s0 < 5 ? 0 : r, r1: s1 > L.len - 5 ? 0 : r }; });   // si la línea termina en el viaducto, allí no hay rampa
      L.zAt = s => { for (const a of L.alto) if (s >= a.s0 && s <= a.s1) return a.z * (a.r0 ? altSuave((s - a.s0) / a.r0) : 1) * (a.r1 ? altSuave((a.s1 - s) / a.r1) : 1); return 0; };
      L.col = col;
      for (const st of L.st) { const a = L.alto.find(a => Math.max(0, st.s - ALT_SL) >= a.s0 - .5 && Math.min(L.len, st.s + ALT_SL) <= a.s1 + .5); st.alto = a && L.zAt(st.s) > a.z * .9 ? 1 : 0; st.z = st.alto ? L.zAt(st.s) : 0; }
      for (const a of L.alto) {   // piezas cortas; las estaciones empiezan y terminan en un corte
        const cuts = new Set([a.s0, a.s1]); for (let s = a.s0 + ALT.pz; s < a.s1; s += ALT.pz) cuts.add(s);
        for (const st of L.st) if (st.alto && st.s >= a.s0 && st.s <= a.s1) { cuts.add(Math.max(a.s0, st.s - ALT_SL)); cuts.add(Math.min(a.s1, st.s + ALT_SL)); }
        const cs = [...cuts].filter(s => s >= a.s0 && s <= a.s1).sort((x, y) => x - y);
        for (let i = 0; i + 1 < cs.length; i++) {
          const s0 = cs[i], s1 = cs[i + 1]; if (s1 - s0 < .5) continue;
          const pc = this.altPieza('m', L, s0, s1, 5 * PXM, L.zAt); pc.L = L; pc.col = col;   // tablero de 10 m, como en El Metro
          const st = L.st.find(st => st.alto && s0 >= Math.max(a.s0, st.s - ALT_SL) - .1 && s1 <= Math.min(a.s1, st.s + ALT_SL) + .1); if (st) { pc.est = st; pc.ini = Math.abs(s0 - Math.max(a.s0, st.s - ALT_SL)) < .2; pc.fin = Math.abs(s1 - Math.min(a.s1, st.s + ALT_SL)) < .2; }
          for (let s = Math.ceil(s0 / (30 * PXM)) * 30 * PXM; s < s1; s += 30 * PXM) { const k = Math.round((s - s0) / (s1 - s0) * (pc.n - 1)); if (pc.Z[k] > .12) pc.pil.push(k); }   // columnas cada 30 m
          if (st) pc.hall = this.altHall(L, st, s0, s1);   // edificio de acceso bajo el viaducto, sin tapar la calle
          meter(this.altG, CK(pc.x, pc.y), pc);
        }
      }
    }
    // ---- puentes de las vías: se cortan del dibujo del suelo y se levantan con el mismo trazo ----
    for (const B of A.puentes || []) {
      const k = B[0], lvl = B[1], lenM = B[2], pts = []; for (let i = 3; i + 1 < B.length; i += 2) pts.push({ x: B[i] / q * TS, y: B[i + 1] / q * TS });
      if (pts.length < 2 || !ALT_KV[k]) continue;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
      const a = pts[0], b = pts[pts.length - 1]; let bl = 0; for (let i = 1; i < pts.length; i++) bl += dist(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
      let best = null;
      for (const ch of this.chainsNear(x0 - 2 * TS, y0 - 2 * TS, x1 - x0 + 4 * TS, y1 - y0 + 4 * TS)) {
        if (!ALT_KV[k].includes(ch.k) || ch.p.length < 4) continue;
        const pa = this.chProj(ch, a.x, a.y), pb = this.chProj(ch, b.x, b.y), tol = ch.w / 2 + 8; if (pa.d > tol || pb.d > tol) continue;
        const sl = Math.abs(pb.s - pa.s); if (sl < bl * .6 || sl > bl * 1.6 + 12) continue;
        const sc = pa.d + pb.d; if (!best || sc < best.sc) best = { ch, sa: Math.min(pa.s, pb.s), sb: Math.max(pa.s, pb.s), sc };
      }
      let P, w;
      if (best) { P = this.poly(this.chTrozo(best.ch, best.sa, best.sb)); w = best.ch.w; this.chCorta(best.ch, best.sa, best.sb); }
      else { P = this.poly(pts); w = k === 6 ? 6 : k === 5 ? 7 : CHW[k] * TS; }
      if (P.len < 8) continue;
      let ag = 0, nS = 0; for (let s = 0; s <= P.len; s += 4) { const p = this.at(P, s), v = this.get(Math.floor(p.x / TS), Math.floor(p.y / TS)); nS++; if (v === TT.WATER || v === TT.BRIDGE || v === TT.CANAL) ag++; }
      const agua = ag / nS > .3, pe = k >= 5, z = agua ? .2 : pe ? .24 : lenM < 25 ? .1 : lvl >= 3 ? .5 : lvl === 2 ? .36 : .2, r = Math.min(pe ? 10 : 26, P.len / 3);
      const D = { P, w, z, r, k, lvl, agua, pe, len: P.len, zAt: s => z * altSuave(s / r) * altSuave((P.len - s) / r), x0: x0 - w, y0: y0 - w, x1: x1 + w, y1: y1 + w };
      this.decks.push(D); const seen = new Set();
      for (let s = 0; s <= P.len + 15; s += 15) { const p = this.at(P, Math.min(s, P.len)); for (const [dx, dy] of [[0, 0], [w, 0], [-w, 0], [0, w], [0, -w]]) { const kk = CK(p.x + dx, p.y + dy); if (!seen.has(kk)) { seen.add(kk); meter(this.deckG, kk, D); } } }
      for (let s = r + 4; s < P.len - r - 4; s += TS * .75) { const p = this.at(P, s), ti = Math.floor(p.y / TS) * MW + Math.floor(p.x / TS); this.desnivel.set(ti, { a: p.a, lvl: 1 }); }
      for (let s = 0; s < P.len - .5; s += ALT.pz) {
        const s1 = Math.min(P.len, s + ALT.pz), pc = this.altPieza('p', P, s, s1, w / 2, D.zAt); pc.D = D;
        for (let t = Math.ceil(s / 40) * 40; t < s1; t += 40) { const kk = Math.round((t - s) / (s1 - s) * (pc.n - 1)); if (pc.Z[kk] > .12) pc.pil.push(kk); }
        meter(this.altG, CK(pc.x, pc.y), pc);
      }
    }
    // ---- túneles y deprimidos viales (is_tunnel, nivel <= -1): rampas, muros de contención y paso inferior ----
    for (const T of A.tuneles || []) {
      const k = T[0], lvl = T[1] || -1, lenM = T[2], pts = []; for (let i = 3; i + 1 < T.length; i += 2) pts.push({ x: T[i] / q * TS, y: T[i + 1] / q * TS });
      if (pts.length < 2) continue;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
      const P = this.poly(pts), w = (CHW[k] || 1.2) * TS; if (P.len < 12) continue;
      const z = -.18, r = Math.min(28, P.len / 3.2);
      const D = { P, w, z, r, k, lvl, tun: 1, len: P.len, zAt: s => z * altSuave(s / r) * altSuave((P.len - s) / r), x0: x0 - w, y0: y0 - w, x1: x1 + w, y1: y1 + w };
      this.tunnels.push(D); const seen = new Set();
      for (let s = 0; s <= P.len + 15; s += 15) { const p = this.at(P, Math.min(s, P.len)); for (const [dx, dy] of [[0, 0], [w, 0], [-w, 0], [0, w], [0, -w]]) { const kk = CK(p.x + dx, p.y + dy); if (!seen.has(kk)) { seen.add(kk); meter(this.tunG, kk, D); } } }
      for (let s = r + 4; s < P.len - r - 4; s += TS * .75) { const p = this.at(P, s), ti = Math.floor(p.y / TS) * MW + Math.floor(p.x / TS); if (!this.desnivel.has(ti)) this.desnivel.set(ti, { a: p.a, lvl: -1 }); }
    }
    this.altInfo = { metroA: (this.lineA && this.lineA.alto || []).length, metroB: (this.lineB && this.lineB.alto || []).length, puentes: this.decks.length, tuneles: this.tunnels.length, cortados: this.decks.filter(d => d.P).length };
  },
  /* el edificio de acceso de una estación (de 22 m adentro de cada punta del andén), partido donde una calle pasa por debajo; el trozo de la pieza [s0, s1] */
  altHall(L, st, s0, s1) {
    if (!st.hall) {
      const a0 = st.s - ALT_SL + 22 * PXM, a1 = st.s + ALT_SL - 22 * PXM, road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE || v === TT.CICLO, H = []; let ini = null;
      for (let s = a0; s <= a1 + .1; s += 4) { const q = this.at(L, Math.min(s, a1)); let calle = false; for (const o of [-6, 0, 6]) { const p = this.at(L, Math.min(s, a1), o); if (road(this.get(Math.floor(p.x / TS), Math.floor(p.y / TS)))) calle = true; } if (!calle && ini == null) ini = s; if ((calle || s >= a1) && ini != null) { if (Math.min(s, a1) - ini > 8) H.push([ini, Math.min(s, a1)]); ini = null; } }
      st.hall = H;
    }
    const out = []; for (const [a, b] of st.hall) { const x = Math.max(a, s0), y = Math.min(b, s1); if (y - x > .5) out.push({ a: x, b: y, ini: a >= s0 - .01 && a <= s1, fin: b >= s0 && b <= s1 + .01 }); } return out;
  },
  /* una pieza de algo elevado: muestras del eje cada ~6 px con su normal y su altura */
  altPieza(t, P, s0, s1, hw, zAt) {
    const n = Math.max(2, Math.ceil((s1 - s0) / ALT.paso) + 1), X = new Float32Array(n), Y = new Float32Array(n), NX = new Float32Array(n), NY = new Float32Array(n), Z = new Float32Array(n), a0 = Math.max(0, s0 - .7), a1 = Math.min(P.len, s1 + .7);   // ±0,7 px: las piezas se traslapan y no se ve la costura
    for (let i = 0; i < n; i++) { const s = a0 + (a1 - a0) * i / (n - 1), p = this.at(P, s); X[i] = p.x; Y[i] = p.y; NX[i] = -Math.sin(p.a); NY[i] = Math.cos(p.a); Z[i] = zAt(clamp(s, s0, s1)); }
    const m = n >> 1; return { alto: 1, t, n, X, Y, NX, NY, Z, hw, x: X[m], y: Y[m], s0, s1, pil: [] };
  },
  /* proyección de un punto sobre una vía del dibujo: {d, s} */
  chProj(ch, x, y) {
    const p = ch.p, c = this.chCum(ch); let bd = 1e9, bs = 0;
    for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, L2 = dx * dx + dy * dy || 1, t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1), d = Math.hypot(ax + dx * t - x, ay + dy * t - y); if (d < bd) { bd = d; bs = c[(i >> 1) - 1] + Math.sqrt(L2) * t; } }
    return { d: bd, s: bs };
  },
  /* el trozo de una vía entre sa y sb, como puntos {x, y} */
  chTrozo(ch, sa, sb) {
    const p = ch.p, c = this.chCum(ch), out = [this.chPt(ch, sa)];
    for (let i = 0; i < c.length; i++) if (c[i] > sa && c[i] < sb) out.push({ x: p[i * 2], y: p[i * 2 + 1] });
    out.push(this.chPt(ch, sb)); return out;
  },
  /* corta [sa, sb] de una vía del dibujo (el puente se dibuja en alto); si sobran dos partes, la segunda es una vía nueva */
  chCorta(ch, sa, sb) {
    const c = this.chCum(ch), len = c[c.length - 1], flat = P => { const o = []; for (const q of P) o.push(q.x, q.y); return o; };
    const A = sa > 1.5 ? flat(this.chTrozo(ch, 0, sa)) : null, Bp = sb < len - 1.5 ? flat(this.chTrozo(ch, sb, len)) : null, j1 = ch.j1;
    if (A) { ch.p = A; ch.cum = null; ch.j1 = false; if (Bp) this.chNueva(Object.assign({}, ch, { p: Bp, cum: null, j0: false, j1 })); }
    else if (Bp) { ch.p = Bp; ch.cum = null; ch.j0 = false; }
    else { ch.k = 0; ch.p = [ch.p[0], ch.p[1], ch.p[0] + .01, ch.p[1]]; ch.cum = null; }   // todo el tramo es puente: ya no se dibuja en el suelo
  },
  chNueva(ch) {
    const idx = this.chains.length, G = this.chainGrid, C = 32 * TS, p = ch.p; ch.id = idx; this.chains.push(ch);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); }
    for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const k = gx + ',' + gy; (G.get(k) || G.set(k, []).get(k)).push(idx); }
  },
  /* el tramo [s0, s1] de una línea que pasa cerca de un trozo (o null) */
  altRango(L, px0, py0, S, m) { let a = 1e9, b = -1e9; const P = L.pts, c = L.cum; for (let i = 0; i < P.length; i++) { const p = P[i]; if (p.x > px0 - m && p.y > py0 - m && p.x < px0 + S + m && p.y < py0 + S + m) { a = Math.min(a, c[Math.max(0, i - 1)]); b = Math.max(b, c[Math.min(P.length - 1, i + 1)]); } } return a <= b ? [a, b] : null; },
  decksNear(x, y) { const S = CH * TS; return this.deckG ? this.deckG.get(Math.floor(x / S) + ',' + Math.floor(y / S)) || [] : []; },
  tunnelsNear(x, y) { const S = CH * TS; return this.tunG ? this.tunG.get(Math.floor(x / S) + ',' + Math.floor(y / S)) || [] : []; },
  /* posición sobre un puente o deprimido: s a lo largo, d de lado (con signo), a el rumbo ahí */
  deckProj(D, x, y) { const pr = this.project(D.P, x, y), q = this.at(D.P, pr.s), d = (x - q.x) * -Math.sin(q.a) + (y - q.y) * Math.cos(q.a); return { s: pr.s, d, a: q.a, dd: pr.d }; },
  /* en el suelo (trozo 3D): sombras y bases de los pilares de lo que va en alto, más las bocas y muros de los deprimidos */
  altSuelo(c, px0, py0, S) {
    if (!this.altG) return; const near = (x, y, m) => x > px0 - m && y > py0 - m && x < px0 + S + m && y < py0 + S + m;
    const piezas = [], tunSet = new Set();
    for (let gy = -1; gy <= 1; gy++) for (let gx = -1; gx <= 1; gx++) {
      const k = (Math.floor(px0 / S) + gx) + ',' + (Math.floor(py0 / S) + gy);
      const L = this.altG.get(k); if (L) piezas.push(...L);
      const T = this.tunG && this.tunG.get(k); if (T) for (const d of T) tunSet.add(d);
    }
    c.lineCap = 'round'; c.lineJoin = 'round';
    // deprimidos / soterrados: rampa excavada, muros de contención laterales y dintel de entrada/salida
    for (const D of tunSet) {
      const hw = D.w / 2, step = 10, pts = [];
      for (let s = 0; s <= D.len; s += step) pts.push(this.at(D.P, Math.min(s, D.len)));
      if (pts.length < 2) continue;
      c.fillStyle = '#252932'; c.beginPath();
      for (let i = 0; i < pts.length; i++) { const p = pts[i], nx = -Math.sin(p.a) * hw, ny = Math.cos(p.a) * hw; c[i ? 'lineTo' : 'moveTo'](p.x + nx, p.y + ny); }
      for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i], nx = -Math.sin(p.a) * hw, ny = Math.cos(p.a) * hw; c.lineTo(p.x - nx, p.y - ny); }
      c.closePath(); c.fill();
      c.strokeStyle = '#7e838c'; c.lineWidth = 1.6;
      for (const sd of [-1, 1]) {
        c.beginPath();
        for (let i = 0; i < pts.length; i++) { const p = pts[i], nx = -Math.sin(p.a) * hw * sd, ny = Math.cos(p.a) * hw * sd; c[i ? 'lineTo' : 'moveTo'](p.x + nx, p.y + ny); }
        c.stroke();
      }
      // franja amarilla preventiva en los portales del deprimido
      for (const sPortal of [D.r, D.len - D.r]) {
        const p = this.at(D.P, clamp(sPortal, 0, D.len)), nx = -Math.sin(p.a) * (hw + 1), ny = Math.cos(p.a) * (hw + 1);
        c.strokeStyle = '#f2c400'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(p.x - nx, p.y - ny); c.lineTo(p.x + nx, p.y + ny); c.stroke();
      }
    }
    for (const b of piezas) {
      if (!near(b.x, b.y, 60)) continue; const hw = b.est ? ALT_SW : b.hw, zt = b.est ? b.Z[b.n >> 1] + ALT.techo : 0;
      c.fillStyle = 'rgba(8,14,30,.2)'; c.beginPath();
      for (let i = 0; i < b.n; i++) { const d = 3 + (zt || b.Z[i]) * 13; c[i ? 'lineTo' : 'moveTo'](b.X[i] + b.NX[i] * hw + d, b.Y[i] + b.NY[i] * hw + d); }
      for (let i = b.n - 1; i >= 0; i--) { const d = 3 + (zt || b.Z[i]) * 13; c.lineTo(b.X[i] - b.NX[i] * hw + d, b.Y[i] - b.NY[i] * hw + d); }
      c.closePath(); c.fill();
      c.fillStyle = b.t === 'm' ? '#7d828a' : '#8a867c';
      for (const i of b.pil) { const r = b.t === 'm' ? 2 : 1.5; c.beginPath(); c.roundRect(b.X[i] - r, b.Y[i] - r, r * 2, r * 2, .8); c.fill(); }
      if (b.est) { c.fillStyle = '#8d939c'; for (let i = 0; i < b.n; i += 4) for (const sd of [-1, 1]) { const x = b.X[i] + b.NX[i] * (ALT_SW - 2) * sd, y = b.Y[i] + b.NY[i] * (ALT_SW - 2) * sd; c.beginPath(); c.arc(x, y, 1.4, 0, TAU); c.fill(); } }
    }
  }
});
/* ---------- Metroplús sobre el eje real de sus avenidas (v1.7) ----------
   El trazado viene de la red de El Metro y está suavizado: en las curvas cortaba esquinas y algunas estaciones quedaban fuera de la calzada.
   Cada punto se lleva al eje de la vía del dibujo más cercana (en las avenidas de doble calzada, al separador entre las dos),
   y cada estación se corre lo justo para quedar en un tramo recto, alineada con su carril. */
Object.assign(CityMap, {
  mpAjusta() {
    const road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE, info = [];
    const cubre = (P, s, half, lat) => { let m = 0, k = 0; for (let ds = -half; ds <= half; ds += 4) for (let dl = -lat; dl <= lat; dl += 3) { const q = this.at(P, s + ds, dl); m++; if (road(this.get(Math.floor(q.x / TS), Math.floor(q.y / TS)))) k++; } return k / m; };
    for (const P of this.mp || []) {
      const antes = P.st.map(st => cubre(P, st.s, 30, 6)), pts = [];
      let prev = null;
      for (let s = 0; s <= (P.osm ? -1 : P.len); s += 6) {   // el corredor de OSM (P.osm) ya va por su carril: no se mueve
        const q = this.at(P, s), ux = Math.cos(q.a), uy = Math.sin(q.a); let L = null, R = null, best = null;
        for (const ch of this.chainsNear(q.x - 28, q.y - 28, 56, 56)) {
          if (!(ch.k >= 1 && ch.k <= 4) || ch.p.length < 4) continue;
          const pr = this.chProj(ch, q.x, q.y); if (pr.d > 26) continue;
          const a = this.chPt(ch, Math.max(0, pr.s - 3)), b = this.chPt(ch, pr.s + 3), al = Math.abs(((b.x - a.x) * ux + (b.y - a.y) * uy) / (Math.hypot(b.x - a.x, b.y - a.y) || 1)); if (al < .8) continue;   // solo vías que van en el mismo sentido (no las que cruzan)
          const c = this.chPt(ch, pr.s), sd = (c.x - q.x) * -uy + (c.y - q.y) * ux, cand = { x: c.x, y: c.y, d: pr.d + (ch === prev ? -4 : 0) + (ch.k === 1 ? 5 : 0), ch };
          if (sd < 0) { if (!L || cand.d < L.d) L = cand; } else if (!R || cand.d < R.d) R = cand;
          if (!best || cand.d < best.d) best = cand;
        }
        let x = q.x, y = q.y;
        if (L && R && L.ch.k === R.ch.k && L.ch.k >= 2 && L.d < 20 && R.d < 20 && dist(L.x, L.y, R.x, R.y) < 34) { x = (L.x + R.x) / 2; y = (L.y + R.y) / 2; prev = null; }   // doble calzada: el carril va por el separador
        else if (best) { x = best.x; y = best.y; prev = best.ch; }
        pts.push({ x, y });
      }
      if (pts.length >= 3) {
      const sm = pts.map((p, i) => i === 0 || i === pts.length - 1 ? p : { x: (pts[i - 1].x + p.x * 2 + pts[i + 1].x) / 4, y: (pts[i - 1].y + p.y * 2 + pts[i + 1].y) / 4 });
      const N = this.poly(sm); P.pts = N.pts; P.cum = N.cum; P.len = N.len; }
      // cada estación, en el tramo recto más cercano a su punto real y sobre la calzada
      P.st.forEach((st, i) => {
        const s0 = this.project(P, st.px, st.py).s, W = P.osm ? 12 : 42; let bs = s0, bk = -1e9;   // con el andén real (OSM), apenas se corre
        for (let ds = -W; ds <= W; ds += 6) {
          const s = clamp(s0 + ds, 30, P.len - 30), a = this.at(P, s - 28), b = this.at(P, s + 28), giro = Math.abs(angDiff(a.a, b.a)), k = cubre(P, s, 30, 6) * 2 - giro * 2.2 - Math.abs(ds) / 120;
          if (k > bk) { bk = k; bs = s; }
        }
        st.s = bs; const q = this.at(P, bs); st.x = q.x; st.y = q.y;
        info.push({ l: P.name || P.id, st: st.name, antes: Math.round(antes[i] * 100), ahora: Math.round(cubre(P, bs, 30, 6) * 100), corr: Math.round(Math.abs(bs - s0)) });
      });
    }
    this.mpInfo = info;
  }
});
const _build76 = CityMap.build;
CityMap.build = function () { _build76.call(this); try { if (this.mpReal) this.mpReal(); this.mpAjusta(); } catch (e) { console.warn('metroplus', e); } try { this.alturas(); } catch (e) { console.warn('alturas', e); this.altG = null; this.decks = []; this.deckG = new Map(); } };

/* ---------- dibujo de una pieza elevada (en draw3D, ordenada con los edificios) ---------- */
const ALT_COL = { m: { top: '#d3d6db', borde: '#8d939c', lado: '#bfc4cb', bajo: '#9aa0a8', riel: '#8e949c', pilar: '#a3a8b0' }, p: { top: '#565a62', borde: '#cfcabf', lado: '#b8b3a7', bajo: '#9a958a', riel: '#e8c64a', pilar: '#aaa59a' }, pe: { top: '#d8d2c4', borde: '#f2efe8', lado: '#aaa59a', bajo: '#8f8a7f', riel: '#c7bfac', pilar: '#a8a399' }, ci: { top: '#2e9d55', borde: '#f2efe8', lado: '#aaa59a', bajo: '#8f8a7f', riel: '#d8f0c8', pilar: '#a8a399' } };
const ALT_PAL = new Map();
const altPal = (k, nb) => { const key = k + nb; let p = ALT_PAL.get(key); if (p) return p; const B = ALT_COL[k]; p = {}; for (const n in B) p[n] = mixHex(B[n], '#0b1430', nb * .17); ALT_PAL.set(key, p); return p; };
Ride.prototype.altoPieza = function (c, b, ox, oy, px, py, K, nb) {
  const n = b.n, X = b.X, Y = b.Y, NX = b.NX, NY = b.NY, Z = b.Z, D = b.D, kind = b.t === 'm' ? 'm' : D.k === 5 ? 'ci' : D.pe ? 'pe' : 'p', C = altPal(kind, nb), th = b.t === 'm' ? ALT.grosor : .05;
  const PX = (x, y, z) => { const f = 1 + K * z; return px + (x - ox - px) * f; }, PY = (x, y, z) => { const f = 1 + K * z; return py + (y - oy - py) * f; };
  let hw = b.hw;
  if (b.t === 'm') return this.altMetro(c, b, ox, oy, px, py, K, nb, PX, PY);
  // 1) pilares: del suelo a la losa
  if (b.pil.length) { c.strokeStyle = C.pilar; c.lineWidth = b.t === 'm' ? 3.4 : D.pe ? 1.4 : 2.4; c.lineCap = 'butt'; c.beginPath(); for (const i of b.pil) { const zb = Math.max(0, Z[i] - th); c.moveTo(X[i] - ox, Y[i] - oy); c.lineTo(PX(X[i], Y[i], zb), PY(X[i], Y[i], zb)); } c.stroke(); c.lineCap = 'round'; }
  // 2) los costados de la losa que miran a la cámara
  const lado = (sd, z0f, z1f, w, col) => {
    c.fillStyle = col;
    for (let i = 0; i + 1 < n; i++) {
      const ax = X[i] + NX[i] * w * sd, ay = Y[i] + NY[i] * w * sd, bx = X[i + 1] + NX[i + 1] * w * sd, by = Y[i + 1] + NY[i + 1] * w * sd, mx = (ax + bx) / 2 - ox, my = (ay + by) / 2 - oy;
      if ((NX[i] * sd) * (px - mx) + (NY[i] * sd) * (py - my) <= 0) continue;
      const za0 = z0f(i), za1 = z1f(i), zb0 = z0f(i + 1), zb1 = z1f(i + 1); if (za1 - za0 < .004 && zb1 - zb0 < .004) continue;
      c.beginPath(); c.moveTo(PX(ax, ay, za0), PY(ax, ay, za0)); c.lineTo(PX(bx, by, zb0), PY(bx, by, zb0)); c.lineTo(PX(bx, by, zb1), PY(bx, by, zb1)); c.lineTo(PX(ax, ay, za1), PY(ax, ay, za1)); c.closePath(); c.fill();
    }
  };
  const zTop = i => Z[i], zBot = i => Math.max(0, Z[i] - th);
  lado(1, zBot, zTop, hw, C.lado); lado(-1, zBot, zTop, hw, C.lado);
  // 3) la losa por encima
  const losa = (w, z, col) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * w, y = Y[i] + NY[i] * w, zz = z(i); c[i ? 'lineTo' : 'moveTo'](PX(x, y, zz), PY(x, y, zz)); } for (let i = n - 1; i >= 0; i--) { const x = X[i] - NX[i] * w, y = Y[i] - NY[i] * w, zz = z(i); c.lineTo(PX(x, y, zz), PY(x, y, zz)); } c.closePath(); c.fill(); };
  const linea = (off, z, w, col, dash) => { c.strokeStyle = col; c.lineWidth = w; if (dash) { c.setLineDash(dash); c.lineDashOffset = b.s0 * (1 + K * Z[n >> 1]); } c.beginPath(); for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * off, y = Y[i] + NY[i] * off, zz = z(i); c[i ? 'lineTo' : 'moveTo'](PX(x, y, zz), PY(x, y, zz)); } c.stroke(); if (dash) { c.setLineDash([]); c.lineDashOffset = 0; } };
  losa(hw, zTop, C.top);
  if (b.t === 'm') return;   // el metro va antes, con el diseño de El Metro (altMetro)
  else {
    const zr = i => Z[i] + .004, zb = i => Z[i] + .035;
    if (!D.pe && hw > 7) linea(0, zr, .8, D.k === 3 ? '#f2f0e8' : C.riel, D.k === 3 ? [9, 6] : [8, 6]);
    linea(hw - .6, zb, 1.1, C.borde); linea(-hw + .6, zb, 1.1, C.borde);   // barandas
  }
};
/* el viaducto y sus estaciones con el diseño de El Metro (35-ciudad.js de metrozero): columnas cada 30 m, tablero de concreto
   con su canto, durmientes y cuatro rieles; en las estaciones, el edificio de acceso abajo (la calle pasa libre), dos andenes
   laterales con su línea amarilla y la cubierta metálica con el borde del color de la línea */
Ride.prototype.altMetro = function (c, b, ox, oy, px, py, K, nb, PX, PY) {
  const n = b.n, X = b.X, Y = b.Y, NX = b.NX, NY = b.NY, Z = b.Z, M = this.map, L = b.L, st = b.est, hw = b.hw, sh = col => nb ? mixHex(col, '#0b1430', nb * .17) : col, th = 1.6 / 27;
  const lado = (sd, z0f, z1f, w, col) => { c.fillStyle = col; for (let i = 0; i + 1 < n; i++) { const ax = X[i] + NX[i] * w * sd, ay = Y[i] + NY[i] * w * sd, bx = X[i + 1] + NX[i + 1] * w * sd, by = Y[i + 1] + NY[i + 1] * w * sd, mx = (ax + bx) / 2 - ox, my = (ay + by) / 2 - oy; if ((NX[i] * sd) * (px - mx) + (NY[i] * sd) * (py - my) <= 0) continue; const za0 = z0f(i), za1 = z1f(i), zb0 = z0f(i + 1), zb1 = z1f(i + 1); if (za1 - za0 < .004 && zb1 - zb0 < .004) continue; c.beginPath(); c.moveTo(PX(ax, ay, za0), PY(ax, ay, za0)); c.lineTo(PX(bx, by, zb0), PY(bx, by, zb0)); c.lineTo(PX(bx, by, zb1), PY(bx, by, zb1)); c.lineTo(PX(ax, ay, za1), PY(ax, ay, za1)); c.closePath(); c.fill(); } };
  const losa = (w, z, col) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * w, y = Y[i] + NY[i] * w, zz = z(i); c[i ? 'lineTo' : 'moveTo'](PX(x, y, zz), PY(x, y, zz)); } for (let i = n - 1; i >= 0; i--) { const x = X[i] - NX[i] * w, y = Y[i] - NY[i] * w, zz = z(i); c.lineTo(PX(x, y, zz), PY(x, y, zz)); } c.closePath(); c.fill(); };
  const linea = (off, z, w, col, dash) => { c.strokeStyle = col; c.lineWidth = w; if (dash) { c.setLineDash(dash); c.lineDashOffset = b.s0; } c.beginPath(); for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * off, y = Y[i] + NY[i] * off, zz = z(i); c[i ? 'lineTo' : 'moveTo'](PX(x, y, zz), PY(x, y, zz)); } c.stroke(); if (dash) { c.setLineDash([]); c.lineDashOffset = 0; } };
  const zTop = i => Z[i], zBot = i => Math.max(0, Z[i] - th), zr = i => Z[i] + .003;
  // 0) edificio de acceso bajo la estación: muros claros, techo y franja del color de la línea (asoma a los lados del tablero)
  if (st && b.hall && b.hall.length) {
    const zt = 5 / 27, W = 11 * PXM;
    for (const h of b.hall) {
      c.fillStyle = sh('#cfc6b3'); sisMuro(c, M, L, h.a, h.b, W, 0, zt, ox, oy, px, py, PX, PY); sisMuro(c, M, L, h.a, h.b, -W, 0, zt, ox, oy, px, py, PX, PY);
      for (const [s1, on] of [[h.a, h.ini], [h.b, h.fin]]) { if (!on) continue; const q = M.at(L, s1), tx = Math.cos(q.a) * (s1 === h.a ? -1 : 1), ty = Math.sin(q.a) * (s1 === h.a ? -1 : 1); if (tx * (px - (q.x - ox)) + ty * (py - (q.y - oy)) <= 0) continue; const A = M.at(L, s1, -W), B = M.at(L, s1, W); c.beginPath(); c.moveTo(PX(A.x, A.y, 0), PY(A.x, A.y, 0)); c.lineTo(PX(B.x, B.y, 0), PY(B.x, B.y, 0)); c.lineTo(PX(B.x, B.y, zt), PY(B.x, B.y, zt)); c.lineTo(PX(A.x, A.y, zt), PY(A.x, A.y, zt)); c.closePath(); c.fill(); }
      sisBanda(c, M, L, h.a, h.b, -W, W, zt, PX, PY); c.fillStyle = sh('#e6dfcf'); c.fill(); c.strokeStyle = 'rgba(40,36,30,.5)'; c.lineWidth = .35; c.stroke();
      c.fillStyle = sh(L.col); sisBanda(c, M, L, h.a, h.b, -W, -W + PXM, zt, PX, PY); c.fill(); sisBanda(c, M, L, h.a, h.b, W - PXM, W, zt, PX, PY); c.fill();
    }
  }
  // 1) columnas: del piso al tablero, con su luz
  if (b.pil.length) {
    c.lineCap = 'butt'; c.strokeStyle = sh('#857f75'); c.lineWidth = 2.4 * PXM; c.beginPath(); for (const i of b.pil) { const zb = Math.max(0, Z[i] - th); c.moveTo(X[i] - ox, Y[i] - oy); c.lineTo(PX(X[i], Y[i], zb), PY(X[i], Y[i], zb)); } c.stroke();
    c.strokeStyle = sh('#aaa398'); c.lineWidth = .8 * PXM; c.beginPath(); for (const i of b.pil) { const zb = Math.max(0, Z[i] - th), dx = -NX[i] * .6 * PXM, dy = -NY[i] * .6 * PXM; c.moveTo(X[i] - ox + dx, Y[i] - oy + dy); c.lineTo(PX(X[i], Y[i], zb) + dx, PY(X[i], Y[i], zb) + dy); } c.stroke(); c.lineCap = 'round';
  }
  // 2) canto del tablero y tablero: borde oscuro de 10 m y superficie de concreto de 8,6 m
  lado(1, zBot, zTop, hw, sh('#6f685e')); lado(-1, zBot, zTop, hw, sh('#6f685e'));
  losa(hw, zTop, sh('#4f4b45')); losa(4.3 * PXM, zTop, sh('#9a9185'));
  // 3) durmientes y dos vías (cuatro rieles)
  for (const o of [-2, 2]) linea(o * PXM, zr, 2.6 * PXM, sh('#7d756a'), [.35 * PXM, .55 * PXM]);
  for (const o of [-2.72, -1.28, 1.28, 2.72]) linea(o * PXM, zr, .42, '#2b2a28');
  // 4) los trenes que van por esta pieza
  this.altTrenes(c, b, ox, oy, px, py, K, PX, PY);
  // 5) estación: dos andenes laterales y su cubierta metálica a 4,2 m
  if (!st) return;
  const zs = st.z, zc = zs + 4.2 / 27, a0 = b.ini ? b.s0 + 6 * PXM : b.s0, a1 = b.fin ? b.s1 - 6 * PXM : b.s1;
  for (const sd of [-1, 1]) {
    c.fillStyle = sh('#bdb5a5'); sisMuro(c, M, L, b.s0, b.s1, sd * 8.6 * PXM, zs - th, zs, ox, oy, px, py, PX, PY);   // canto del andén
    sisBanda(c, M, L, b.s0, b.s1, sd * 4.1 * PXM, sd * 8.6 * PXM, zs, PX, PY); c.fillStyle = sh('#ece6d6'); c.fill(); c.strokeStyle = 'rgba(40,36,30,.55)'; c.lineWidth = .4; c.stroke();
    sisBanda(c, M, L, b.s0, b.s1, sd * 4.1 * PXM, sd * 4.55 * PXM, zs + .001, PX, PY); c.fillStyle = '#f2c400'; c.fill();
    if (a1 - a0 < 1) continue;
    sisBanda(c, M, L, a0, a1, sd * 4.6 * PXM, sd * 8.6 * PXM, zs + .002, PX, PY); c.fillStyle = 'rgba(30,30,30,.16)'; c.fill();   // sombra de la cubierta en el andén
    c.strokeStyle = sh('#8d939c'); c.lineWidth = .5; c.beginPath(); for (let t = a0 + 4 * PXM; t < a1; t += 12 * PXM) { const q = M.at(L, t, sd * 8.4 * PXM); c.moveTo(PX(q.x, q.y, zs), PY(q.x, q.y, zs)); c.lineTo(PX(q.x, q.y, zc), PY(q.x, q.y, zc)); } c.stroke();   // postes
    sisBanda(c, M, L, a0, a1, sd * 5 * PXM, sd * 9 * PXM, zc, PX, PY); c.fillStyle = sh('#dde1e4'); c.fill(); c.strokeStyle = 'rgba(60,66,74,.6)'; c.lineWidth = .35; c.stroke();
    sisBanda(c, M, L, a0, a1, sd * 8.3 * PXM, sd * 9 * PXM, zc + .001, PX, PY); c.fillStyle = sh(L.col); c.fill();
    c.strokeStyle = 'rgba(120,126,134,.55)'; c.lineWidth = .3; c.beginPath(); for (let t = a0 + 4 * PXM; t < a1 - 2 * PXM; t += 6 * PXM) { const A = M.at(L, t, sd * 5 * PXM), B = M.at(L, t, sd * 8.3 * PXM); c.moveTo(PX(A.x, A.y, zc), PY(A.x, A.y, zc)); c.lineTo(PX(B.x, B.y, zc), PY(B.x, B.y, zc)); } c.stroke();
  }
};
/* trenes sobre esta pieza del viaducto, con el dibujo de El Metro: recortados a la losa para que no asomen en la pieza vecina */
Ride.prototype.altTrenes = function (c, b, ox, oy, px, py, K, PX, PY) {
  const cars = this._altCars; if (!cars || !cars.length) return; const cl = SIS.metro.carL * PXM; let any = false;
  for (const q of cars) if (q.L === b.L && q.s > b.s0 - cl && q.s < b.s1 + cl) { any = true; break; }
  if (!any) return; const n = b.n, X = b.X, Y = b.Y, NX = b.NX, NY = b.NY, Z = b.Z, w = b.hw + 1, night = Art.night(this.min) > .5;
  c.save(); c.beginPath();
  for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * w, y = Y[i] + NY[i] * w; c[i ? 'lineTo' : 'moveTo'](PX(x, y, Z[i]), PY(x, y, Z[i])); }
  for (let i = n - 1; i >= 0; i--) { const x = X[i] - NX[i] * w, y = Y[i] - NY[i] * w; c.lineTo(PX(x, y, Z[i]), PY(x, y, Z[i])); }
  c.closePath(); c.clip();
  for (const q of cars) { if (q.L !== b.L || q.s < b.s0 - cl || q.s > b.s1 + cl) continue; const z = q.z + .03, f = 1 + K * z; SisSpr.dib(c, 'metro', q.L.col, cl, SIS.metro.W * PXM, px + (q.x - ox - px) * f, py + (q.y - oy - py) * f, q.a, f, q.end, night); }
  c.restore();
};
/* los vagones de este cuadro (3 de 22 m, cada sentido por su vía): en el viaducto (van con su pieza) o a nivel del suelo */
Ride.prototype.altVagones = function () {
  const out = this._altCars = [], low = this._lowCars = []; if (!this.metroOn()) return;
  const cl = SIS.metro.carL * PXM, gp = PXM, nC = SIS.metro.n;
  for (const tr of this.trains) for (let i = 0; i < nC; i++) {
    const s = tr.s - tr.dir * (i * (cl + gp) + cl / 2); if (s < 0 || s > tr.L.len) continue;
    const q = this.map.at(tr.L, s, tr.dir * 2 * PXM), z = tr.L.zAt ? tr.L.zAt(s) : 0, o = { L: tr.L, s, x: q.x, y: q.y, a: q.a + (tr.dir < 0 ? Math.PI : 0), z, end: i === 0 ? 'front' : i === nC - 1 ? 'back' : 'mid' }; (z > .015 ? out : low).push(o);
  }
};
/* trenes a nivel del suelo (antes que el jugador); en pixel clásico se queda el dibujo de siempre */
Ride.prototype.drawTrenesSuelo = function (c, ox, oy, inV, spr) { this.altVagones(); const cl = SIS.metro.carL * PXM, night = Art.night(this.min) > .5; for (const q of this._lowCars) if (inV(q.x, q.y, 30)) { c.fillStyle = 'rgba(0,0,0,.22)'; SisSpr.dib(c, 'metro', q.L.col, cl, SIS.metro.W * PXM, q.x - ox, q.y - oy, q.a, 1, q.end, night); } };
/* encima de todo: el jugador cuando va por un puente, los carros de los puentes y el dintel traslúcido cuando se pasa por un deprimido */
Ride.prototype.drawArriba = function (c, ox, oy, inV, spr, sp) {
  const P = this.p, E = this.ojo(), px = E.x - ox, py = E.y - oy, K = E.K;
  const sprZ = (img, x, y, a, z, sh) => { const f = Math.max(.75, 1 + K * z); c.save(); c.translate(px + (x - ox - px) * f, py + (y - oy - py) * f); c.rotate(a + Math.PI / 2); c.scale(f, f); blit(c, img, sh); c.restore(); };
  for (const cr of this.cars) if (cr.arriba && inV(cr.x, cr.y)) sprZ(Art.carTop(cr.col, cr.kind), cr.x, cr.y, cr.ang, cr.z || .2, '#0004');
  if (P.lvl > 0) sprZ(sp, P.x, P.y, P.a, P.z || 0, '#0005');
  else if (P.lvl < 0 && P.deck && P.deck.tun) {
    // dentro de un deprimido/soterrado: se ve al ciclista con luces cálidas y la cubierta del paso superior semitransparente
    const D = P.deck, hw = D.w / 2;
    c.save(); c.fillStyle = 'rgba(255,212,122,.22)'; c.beginPath(); c.arc(P.x - ox, P.y - oy, 14, 0, TAU); c.fill();
    c.fillStyle = 'rgba(18,24,38,.36)'; c.beginPath();
    for (let s = D.r; s <= D.len - D.r; s += 12) { const p = this.map.at(D.P, s), nx = -Math.sin(p.a) * hw, ny = Math.cos(p.a) * hw; c[s === D.r ? 'moveTo' : 'lineTo'](p.x - ox + nx, p.y - oy + ny); }
    for (let s = D.len - D.r; s >= D.r; s -= 12) { const p = this.map.at(D.P, s), nx = -Math.sin(p.a) * hw, ny = Math.cos(p.a) * hw; c.lineTo(p.x - ox - nx, p.y - oy - ny); }
    c.closePath(); c.fill(); c.restore();
  }
};
/* el nivel del jugador: +1 si entró a un puente por sus extremos, -1 si bajó por la rampa de un deprimido/túnel, 0 a nivel del suelo */
Ride.prototype.nivel = function () {
  const P = this.p, M = this.map; if (!M.deckG) { P.lvl = 0; P.z = 0; return; }
  let D = P.deck;
  if (D) {
    const pr = M.deckProj(D, P.x, P.y);
    if (pr.s < -3 || pr.s > D.len + 3 || Math.abs(pr.d) > D.w / 2 + 3) { P.deck = null; P.lvl = 0; P.z = 0; D = null; }
    else if (P.lvl !== 0) {
      P.z = D.zAt(clamp(pr.s, 0, D.len));
      // baranda del puente o muro de contención del deprimido: en el tramo central no se puede salir por los costados
      const enTramo = D.agua || (pr.s > D.r * .7 && pr.s < D.len - D.r * .7);
      if (enTramo) {
        const lim = Math.max(2, D.w / 2 - 1.3);
        if (Math.abs(pr.d) > lim) { const e = (Math.abs(pr.d) - lim) * Math.sign(pr.d), nx = -Math.sin(pr.a), ny = Math.cos(pr.a); if (!this.blocked(P.x - nx * e, P.y - ny * e, this.stats_().r)) { P.x -= nx * e; P.y -= ny * e; } }
      }
    }
  }
  if (!D) {
    const t = this.tileAt(), sobreAgua = t === TT.BRIDGE;
    for (const d of M.decksNear(P.x, P.y)) {
      if (P.x < d.x0 || P.x > d.x1 || P.y < d.y0 || P.y > d.y1) continue;
      const pr = M.deckProj(d, P.x, P.y); if (pr.s < 0 || pr.s > d.len || Math.abs(pr.d) > d.w / 2) continue;
      const ext = pr.s < d.r + 8 || pr.s > d.len - d.r - 8, along = Math.abs(Math.cos(angDiff(P.a, pr.a))) > .5;
      P.deck = d; P.lvl = (ext && along) || (sobreAgua && d.agua) ? 1 : 0; P.z = P.lvl ? d.zAt(pr.s) : 0; break;
    }
    if (!P.deck && M.tunG) {
      for (const d of M.tunnelsNear(P.x, P.y)) {
        if (P.x < d.x0 || P.x > d.x1 || P.y < d.y0 || P.y > d.y1) continue;
        const pr = M.deckProj(d, P.x, P.y); if (pr.s < 0 || pr.s > d.len || Math.abs(pr.d) > d.w / 2) continue;
        const ext = pr.s < d.r + 10 || pr.s > d.len - d.r - 10, along = Math.abs(Math.cos(angDiff(P.a, pr.a))) > .5;
        P.deck = d; P.lvl = (ext && along) ? -1 : 0; P.z = P.lvl ? d.zAt(pr.s) : 0; break;
      }
    }
  }
};
/* los carros: nivel +1 si van por un puente en su mismo sentido, -1 si van por un deprimido, 0 a nivel del suelo */
Ride.prototype.nivelCarros = function () {
  const M = this.map; if (!M.deckG) return;
  for (const cr of this.cars) {
    cr.arriba = false; cr.bajo = false; cr.nivel = 0;
    for (const d of M.decksNear(cr.x, cr.y)) {
      if (d.pe || cr.x < d.x0 || cr.x > d.x1 || cr.y < d.y0 || cr.y > d.y1) continue;
      const pr = M.deckProj(d, cr.x, cr.y); if (pr.s < 0 || pr.s > d.len || Math.abs(pr.d) > d.w / 2 + 2) continue;
      if (Math.abs(Math.cos(angDiff(cr.ang, pr.a))) > .8) { cr.arriba = true; cr.nivel = 1; cr.z = d.zAt(pr.s); break; }
    }
    if (!cr.nivel && M.tunG) {
      for (const d of M.tunnelsNear(cr.x, cr.y)) {
        if (cr.x < d.x0 || cr.x > d.x1 || cr.y < d.y0 || cr.y > d.y1) continue;
        const pr = M.deckProj(d, cr.x, cr.y); if (pr.s < 0 || pr.s > d.len || Math.abs(pr.d) > d.w / 2 + 2) continue;
        if (Math.abs(Math.cos(angDiff(cr.ang, pr.a))) > .8) { cr.bajo = true; cr.nivel = -1; cr.z = d.zAt(pr.s); break; }
      }
    }
  }
};
const _upd76 = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) { _upd76.call(this, dt, dir); this.nivel(); this.nivelCarros(); };
```

#### Archivo: `src/js/20-map.js` [Juega EnCicla]

```javascript
/* =====================================================================
   MAPA REAL DEL VALLE DE ABURRÁ (de Caldas a Barbosa)
   Casillas de 10 m hechas con datos abiertos (motor-valle/geo/build.py): calles, ciclorrutas, río, quebradas,
   parques, municipios, Metro, tranvía y relieve. Fila 0 = norte. Ver docs/GUIA.md §4.
   ===================================================================== */
const VM = VALLE_META, MW = VM.W, MH = VM.H, TS = 16, CH = 16, SC = 1.35, ES = VM.es, WK = TS / 8, MS = 20 / (VM.tile || 20), VQ = VM.vq || 8, TRAVEL = Math.sqrt(MS), VEL = 1, RELOJ = MS / VEL;   // WK: escala del mundo frente al diseño original de 8 px · MS: casillas por cada casilla del mapa de 20 m (2 con casillas de 10 m) · VEL: factor de velocidad de la bici (v1.7: 1, antes √MS) · RELOJ: el reloj de los oficios corre MS/VEL más lento en el mapa, así cada viaje cuesta los mismos minutos de juego
const TT = { GRASS: 0, MOUNT: 1, BRICK: 2, BLDG: 3, ROAD: 4, AVE: 5, WALK: 6, CICLO: 7, WATER: 8, CANAL: 9, PLAZA: 10, BRIDGE: 11, STATION: 12, LAND: 13, AUTO: 14, DEPOT: 15, STEPS: 16 };
const SOLID = [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0];
const TRUCK_OK = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0];
const SURF = [.55, 0, 0, 0, 1, 1, .62, 1.3, 0, 0, .8, 1, .75, 0, .92, .9, .42];
const PATHC = [6, 0, 0, 0, 3, 3, 4, 2, 0, 0, 3, 3, 3, 0, 6, 3, 8];
const MINI_COL = ['#4f8f45', '#24502c', '#8a4a30', '#56657c', '#2b3240', '#384257', '#7d8696', '#9bd341', '#3d8cb0', '#5f7f8a', '#cfc4a6', '#384257', '#ffffff', '#c8c8c8', '#14141c', '#56c7ff', '#9a8a70'];
/* lat/lon -> casillas (float) y -> px del mundo */
const geoT = (lat, lon) => ({ x: (lon - VM.lon0) * VM.kx, y: (VM.latN - lat) * VM.ky });
const geoP = (lat, lon) => { const t = geoT(lat, lon); return { x: t.x * TS, y: t.y * TS }; };
const q4 = a => { const r = []; for (let i = 0; i < a.length; i += 2) r.push({ x: a[i] / 4 * TS, y: a[i + 1] / 4 * TS }); return r; };   // líneas del JSON (casillas ×4) -> px
/* curvas en vez de esquinas: suavizado de Chaikin (cada pasada recorta cada esquina a 1/4 y 3/4 del tramo) */
const chaikin = (P, n = 2) => { for (let k = 0; k < n; k++) { if (P.length < 3) return P; const Q = [P[0]]; for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1]; Q.push({ x: a.x * .75 + b.x * .25, y: a.y * .75 + b.y * .25 }, { x: a.x * .25 + b.x * .75, y: a.y * .25 + b.y * .75 }); } Q.push(P[P.length - 1]); P = Q; } return P; };
/* lugares con postal (de 19-lugares.js), en casillas */
const LANDMARKS = LUGARES.map(([id, name, muni, lat, lon, w, h, k, fact, secret]) => { const t = geoT(lat, lon); return { id, name, muni, lat, lon, x: Math.round(t.x - w / 2), y: Math.round(t.y - h / 2), w, h, k, fact, secret: !!secret }; });
const LM = {}; LANDMARKS.forEach(l => LM[l.id] = l);
const PUBLIC_LM = () => LANDMARKS.filter(l => l.id !== 'depot' && !l.secret);
const CICLOVIA_AV = ['Avenida 80', 'Carrera 43A', 'Avenida El Poblado', 'Avenida Las Vegas'];
const M_PER_PX = VM.tile / TS;
/* velocidad elegida por el jugador (Más, pausa o el botón del juego): 0,8 a 1,5; en carreras y en red, la normal para todos */
const VELS = [[.8, 'Tranquila', '🐢'], [1, 'Normal', '🚲'], [1.25, 'Rápida', '🐇'], [1.5, 'Muy rápida', '⚡']];
const velMul = M => { if (M && (M.net || M.id === 'carrera' || (M.meta && M.meta.net))) return 1; const v = Save.data && +Save.data.settings.vel; return v >= .8 && v <= 1.5 ? v : 1; };

/* inflate (deflate crudo) para navegadores sin DecompressionStream */
function inflateRaw(src, size) {
  const out = new Uint8Array(size); let o = 0, p = 0, bb = 0, bc = 0;
  const bits = n => { while (bc < n) { bb |= (src[p++] | 0) << bc; bc += 8; } const v = bb & ((1 << n) - 1); bb >>>= n; bc -= n; return v; };
  const mk = (len, n) => { const cnt = new Int32Array(16), off = new Int32Array(16), sym = new Int32Array(n); for (let i = 0; i < n; i++) cnt[len[i]]++; cnt[0] = 0; for (let i = 1; i < 16; i++) off[i] = off[i - 1] + cnt[i - 1]; for (let i = 0; i < n; i++) if (len[i]) sym[off[len[i]]++] = i; return { cnt, sym }; };
  const dec = h => { let code = 0, first = 0, idx = 0; for (let l = 1; l < 16; l++) { code |= bits(1); const c = h.cnt[l]; if (code - c < first) return h.sym[idx + code - first]; idx += c; first += c; first <<= 1; code <<= 1; } return 256; };
  const LB = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], LE = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  const DB = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], DE = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  let fl = null, fd = null;
  for (let last = 0; !last && o < size;) {
    last = bits(1); const type = bits(2);
    if (type === 0) { bb = 0; bc = 0; const len = src[p] | src[p + 1] << 8; p += 4; out.set(src.subarray(p, p + len), o); o += len; p += len; continue; }
    let lh, dh;
    if (type === 1) { if (!fl) { const l = new Uint8Array(288); l.fill(8, 0, 144); l.fill(9, 144, 256); l.fill(7, 256, 280); l.fill(8, 280, 288); fl = mk(l, 288); fd = mk(new Uint8Array(30).fill(5), 30); } lh = fl; dh = fd; }
    else {
      const nl = bits(5) + 257, nd = bits(5) + 1, nc = bits(4) + 4, ord = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], cl = new Uint8Array(19);
      for (let i = 0; i < nc; i++) cl[ord[i]] = bits(3);
      const ch = mk(cl, 19), L = new Uint8Array(nl + nd);
      for (let i = 0; i < nl + nd;) { const s = dec(ch); if (s < 16) L[i++] = s; else { let r, v = 0; if (s === 16) { v = L[i - 1]; r = 3 + bits(2); } else if (s === 17) r = 3 + bits(3); else r = 11 + bits(7); while (r--) L[i++] = v; } }
      lh = mk(L.subarray(0, nl), nl); dh = mk(L.subarray(nl), nd);
    }
    for (;;) { let s = dec(lh); if (s < 256) out[o++] = s; else if (s === 256) break; else { s -= 257; const len = LB[s] + bits(LE[s]), ds = dec(dh), d = DB[ds] + bits(DE[ds]); for (let k = 0; k < len; k++, o++) out[o] = out[o - d]; } }
  }
  return out;
}

const CityMap = JE.map = {
  t: null, lid: null, stations: [], depot: null, chunks: new Map(), lmCanvas: {}, mini: null, miniK: 2 * MS, flows: new Map(), lanes: [], lights: [], lightAt: new Map(), metroA: [], metroB: [], cables: [],
  idx(x, y) { return y * MW + x; },
  get(x, y) { return (x < 0 || y < 0 || x >= MW || y >= MH) ? TT.MOUNT : this.t[y * MW + x]; },
  set(x, y, v) { if (x >= 0 && y >= 0 && x < MW && y < MH) this.t[y * MW + x] = v; },
  lightIdx(i) { const v = this.lightAt.get(i); return v == null ? -1 : v; },
  /* vías: [n] y por línea k (tipo), nombre (0 = sin nombre), [v3: nomenclatura oficial y ancho en medios metros], puntos (el primero absoluto, luego diferencias, en fracciones VQ de casilla) */
  parseVias(u8) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), n = dv.getUint32(0, true), L = new Array(n), v3 = VM.v >= 3; let o = 4;
    for (let i = 0; i < n; i++) { const k = dv.getUint8(o), nm = dv.getUint16(o + 1, true); let nom = 0, w = 0, np; if (v3) { nom = dv.getUint16(o + 3, true); w = dv.getUint8(o + 5) / 2; np = dv.getUint16(o + 6, true); o += 8; } else { np = dv.getUint16(o + 3, true); o += 5; } const p = new Float32Array(np * 2); let x = 0, y = 0; for (let j = 0; j < np; j++) { x += dv.getInt16(o, true); y += dv.getInt16(o + 2, true); o += 4; p[j * 2] = x * TS / VQ; p[j * 2 + 1] = y * TS / VQ; } L[i] = { k, n: nm, nom, w, p }; }
    return L;
  },
  /* ---------- carga ---------- */
  async load() {
    const bin = atob(VALLE_BIN), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const nT = MW * MH, nE = VM.eW * VM.eH, nM = VM.mW * VM.mH, nB = VM.barrios ? nM * 2 : 0, nH = VM.hg ? nM : 0, nL = VM.lt ? nM : 0, size = nT + nE * 2 + nM * 2 + nB + nH + nL;
    let raw = null;
    if (window.DecompressionStream) { try { raw = new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); } catch (e) { raw = null; } }
    if (!raw || raw.length < size) raw = inflateRaw(u8, size);
    this.t = raw.slice(0, nT);
    const ed = new Int16Array(raw.slice(nT, nT + nE * 2).buffer), E = this.E = new Int16Array(nE);
    for (let j = 0; j < VM.eH; j++) { let a = 0; for (let i = 0; i < VM.eW; i++) { a += ed[j * VM.eW + i]; E[j * VM.eW + i] = a; } }
    this.mu = raw.slice(nT + nE * 2, nT + nE * 2 + nM); this.co = raw.slice(nT + nE * 2 + nM, nT + nE * 2 + nM * 2);
    if (nB) this.ba = new Uint16Array(raw.slice(nT + nE * 2 + nM * 2, nT + nE * 2 + nM * 2 + nB).buffer);
    const o2 = nT + nE * 2 + nM * 2 + nB; if (nH) this.hg = raw.slice(o2, o2 + nH); if (nL) this.lt = raw.slice(o2 + nH, o2 + nH + nL);   // pisos del edificio más alto y área mediana de los lotes (×4 m²) por celda de 8 casillas
    // vías como vectores (cada calle con su forma y su nombre)
    if (typeof VIAS_BIN === 'string' && VIAS_BIN && VM.viasB) {
      const vb = atob(VIAS_BIN), v8 = new Uint8Array(vb.length); for (let i = 0; i < vb.length; i++) v8[i] = vb.charCodeAt(i); let vr = null;
      if (window.DecompressionStream) { try { vr = new Uint8Array(await new Response(new Blob([v8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); } catch (e) { vr = null; } }
      if (!vr || vr.length < VM.viasB) vr = inflateRaw(v8, VM.viasB);
      this.vias = this.parseVias(vr);
    }
    // sitios reales: universidades, colegios, alcaldías, hospitales, iglesias… con sus edificios reales (22-sitios.js)
    if (typeof SITIOS_BIN === 'string' && SITIOS_BIN && typeof SITIOS_META === 'object' && SITIOS_META) {
      const sb = atob(SITIOS_BIN), s8 = new Uint8Array(sb.length); for (let i = 0; i < sb.length; i++) s8[i] = sb.charCodeAt(i); let sr = null;
      if (window.DecompressionStream) { try { sr = new Uint8Array(await new Response(new Blob([s8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); } catch (e) { sr = null; } }
      if (!sr || sr.length < SITIOS_META.raw) sr = inflateRaw(s8, SITIOS_META.raw);
      try { this.sit = this.parseSitios(sr); } catch (e) { this.sit = null; console.warn('sitios', e); }
    }
    this.lid = new Map();
    this.build();
    const ci = []; for (let i = 0; i < this.t.length; i++) if (this.t[i] === TT.CICLO) ci.push(i); this.cicloIdx = Int32Array.from(ci);
  },
  build() {
    // primero las estaciones, en su punto real; después los lugares, que se corren para no taparlas
    this.rasterSitios(); this.sitLugares();   // los sitios reales entran primero a la cuadrícula
    this.stations = ESTACIONES.map((s, i) => this.carveStation(s, i)).filter(Boolean); this.stations.forEach((s, i) => s.i = i);
    LANDMARKS.forEach((L, i) => this.paintLandmark(L, i)); this.sitOcultar();
    this.buildLights(); this.buildLanes(); this.buildRail(); this.rioCorrido(); this.limpiaManchones(); this.buildMini();
    const dp = LM.depot; this.depot = { x: (dp.x + dp.w / 2) * TS, y: (dp.y + dp.h + .5) * TS, name: 'Casa EnCicla' };
    this.poi = {}; for (const k in PUNTOS) { const [la, lo, n] = PUNTOS[k], p = geoP(la, lo), o = this.nearestOpen(Math.floor(p.x / TS), Math.floor(p.y / TS), k !== 'campus'); this.poi[k] = { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2, name: n }; }
    this.poi.casa = Object.assign({}, this.depot, { name: PUNTOS.casa[2] });
  },
  /* el río, de Caldas a Barbosa, siempre baja y nunca se corta (auditoría de El Metro, «medir siempre igual»):
     - sus casillas de orilla que no son agua pasan a agua (o a puente si son vía);
     - el relieve se «quema» a lo largo del cauce: regresión isotónica decreciente sobre el perfil, y las cuatro esquinas
       del relieve de cada punto quedan a esa altura como máximo (el modelo de terreno mide copas y puentes, no el agua) */
  rioCorrido() {
    const R = this.river; if (!R || !R.pts || R.pts.length < 2) return; const P = R.pts, E = this.E, W = VM.eW, Hh = VM.eH, t = this.t, smp = [];
    for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; for (let s2 = 0; s2 < L; s2 += TS / 2) smp.push([a.x + (b.x - a.x) * s2 / L, a.y + (b.y - a.y) * s2 / L]); }
    let fix = 0; const rs = this.rioSet = new Set();
    const junto = k => { for (const d of [1, -1, MW, -MW, MW + 1, MW - 1, -MW + 1, -MW - 1]) { const v = t[k + d]; if (v === TT.WATER || v === TT.BRIDGE) return true; } return false; };
    for (const [x, y] of smp) { const k = Math.floor(y / TS) * MW + Math.floor(x / TS), v = t[k]; rs.add(k); if (v === TT.WATER || v === TT.BRIDGE || v === TT.CANAL || !junto(k)) continue; t[k] = (v === TT.ROAD || v === TT.AVE || v === TT.AUTO) ? TT.BRIDGE : TT.WATER; fix++; }   // solo se cierran los huecos junto al agua (no se pinta agua entre casas)
    const sube = this.elev(smp[0][0], smp[0][1]) < this.elev(smp[smp.length - 1][0], smp[smp.length - 1][1]); if (sube) smp.reverse();   // de lo alto a lo bajo
    for (let pase = 0; pase < 10; pase++) {
      const v = smp.map(([x, y]) => this.elev(x, y)), f = [], w = [];   // pool adjacent violators (decreciente)
      for (const z of v) { f.push(z); w.push(1); while (f.length > 1 && f[f.length - 1] > f[f.length - 2]) { const z2 = f.pop(), w2 = w.pop(); f[f.length - 1] = (f[f.length - 1] * w[w.length - 1] + z2 * w2) / (w[w.length - 1] + w2); w[w.length - 1] += w2; } }
      const fit = []; f.forEach((z, i) => { for (let k = 0; k < w[i]; k++) fit.push(z); });
      let cambio = 0;
      smp.forEach(([x, y], i) => { const gx = clamp(x / TS / ES, 0, W - 1.001), gy = clamp(y / TS / ES, 0, Hh - 1.001), i0 = gx | 0, j0 = gy | 0; for (const k of [j0 * W + i0, j0 * W + i0 + 1, (j0 + 1) * W + i0, (j0 + 1) * W + i0 + 1]) if (E[k] > fit[i] + .5) { E[k] = Math.floor(fit[i]); cambio++; } });
      if (!cambio) break;
    }
    this.rioFix = fix;
  },
  /* manchones de agua de 1 a 4 casillas en plena ciudad (restos de polígonos chicos): pasan a lo que los rodea; los de parques y monte quedan (son lagos) */
  limpiaManchones() {
    const t = this.t, W = MW, H = MH, vis = new Uint8Array(W * H), D4 = [1, -1, W, -W]; let n = 0;
    for (let i = W; i < W * (H - 1); i++) {
      if (t[i] !== TT.WATER || vis[i]) continue; const comp = [i]; vis[i] = 1;
      for (let q = 0; q < comp.length && comp.length <= 4; q++) for (const d of D4) { const j = comp[q] + d; if (!vis[j] && t[j] === TT.WATER) { vis[j] = 1; comp.push(j); } }
      if (comp.length > 4 || comp.some(k => this.rioSet && this.rioSet.has(k))) continue;   // el cauce del río no se toca
      const cnt = new Map(); let verde = false;
      for (const k of comp) for (const d of [1, -1, W, -W, W + 1, W - 1, -W + 1, -W - 1]) { const v = t[k + d]; if (v === TT.WATER) continue; if (v === TT.GRASS || v === TT.MOUNT || v === TT.PLAZA || v === TT.LAND || v === TT.CANAL || v === TT.BRIDGE) verde = true; cnt.set(v, (cnt.get(v) || 0) + 1); }
      if (verde || !cnt.size || this.lid.has(comp[0])) continue;
      let best = TT.BRICK, bn = 0; for (const [v, c] of cnt) if (c > bn && v !== TT.STATION && v !== TT.BRIDGE) { bn = c; best = v; }
      for (const k of comp) t[k] = best; n++;
    }
    this.manchFix = n;
  },
  /* ---------- relieve ---------- */
  elevT(tx, ty) { // en casillas (float) -> metros
    const W = VM.eW, gx = clamp(tx / ES, 0, W - 1.001), gy = clamp(ty / ES, 0, VM.eH - 1.001), i = gx | 0, j = gy | 0, fx = gx - i, fy = gy - j, E = this.E, k = j * W + i;
    return (E[k] * (1 - fx) + E[k + 1] * fx) * (1 - fy) + (E[k + W] * (1 - fx) + E[k + W + 1] * fx) * fy;
  },
  elev(px, py) { return this.elevT(px / TS, py / TS); },
  /* pendiente (subida > 0) en la dirección a, medida en ±16 px (40 m) */
  slope(px, py, a) { const dx = Math.cos(a) * 16, dy = Math.sin(a) * 16; return (this.elev(px + dx, py + dy) - this.elev(px - dx, py - dy)) / (32 * M_PER_PX); },
  muniAt(px, py) { const i = clamp(Math.floor(py / TS / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(px / TS / 8), 0, VM.mW - 1), v = this.mu[i]; return v ? VM.munis[v - 1] : ''; },
  comunaAt(px, py) { const i = clamp(Math.floor(py / TS / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(px / TS / 8), 0, VM.mW - 1), v = this.co[i]; return v ? VM.comunas[v - 1] : ''; },
  district(x, y) { const c = this.comunaAt(x * TS, y * TS); return /Candelaria/.test(c) ? 'centro' : /Poblado/.test(c) ? 'poblado' : /Laureles|América/.test(c) ? 'laureles' : 'barrio'; },
  /* ---------- lugares y estaciones ---------- */
  paintLandmark(L, i) {
    if (L.real) { L.solids = []; L.sdx = L.sdy = 0; return; }   // sus edificios reales ya están en la cuadrícula (22-sitios.js)
    // corre el lugar unas casillas si tapa avenidas, autopistas, agua u otro lugar
    const bad = v => v === TT.STATION ? 40 : v === TT.AVE || v === TT.AUTO || v === TT.WATER || v === TT.BRIDGE ? 6 / MS : v === TT.ROAD ? 1 / (MS * MS * 2) : 0;
    let best = null, bs = 1e9;
    const RL = Math.round(6 * MS); for (let dy = -RL; dy <= RL; dy++) for (let dx = -RL; dx <= RL; dx++) {
      let s = Math.abs(dx) + Math.abs(dy);
      for (let y = L.y + dy; y < L.y + dy + L.h && s < bs; y++) for (let x = L.x + dx; x < L.x + dx + L.w; x++) { s += bad(this.get(x, y)); if (this.lid.has(this.idx(x, y))) s += 50; }
      if (s < bs) { bs = s; best = { dx, dy }; }
    }
    L.x += best.dx; L.y += best.dy;
    const keep = [TT.WATER, TT.CANAL, TT.AUTO, TT.AVE, TT.BRIDGE, TT.STATION, TT.ROAD];   // las calles que cruzan un lugar siguen siendo calle: un lugar nunca corta la red
    const base = { comuna13: TT.LAND, bibespana: TT.LAND, palacio: TT.PLAZA, catedral: TT.PLAZA, parquenorte: TT.GRASS, deporte: TT.GRASS, memoria: TT.GRASS, cruces: TT.LAND, iglesia: TT.PLAZA, terminal: TT.PLAZA, volador: TT.LAND, campus: TT.GRASS, moravia: TT.LAND, botanico: TT.GRASS, explora: TT.PLAZA, estadio: TT.LAND, botero: TT.PLAZA, coltejer: TT.LAND, teatro: TT.PLAZA, lleras: TT.PLAZA, pies: TT.PLAZA, luces: TT.PLAZA, depot: TT.DEPOT, cerro: TT.LAND, mamm: TT.GRASS, aeropuerto: TT.LAND }[L.k];
    const SE = this.sitBE, X0 = L.x * TS, Y0 = L.y * TS, X1 = (L.x + L.w) * TS, Y1 = (L.y + L.h) * TS, fuera = k => { const bi = SE && SE.get(k); if (bi == null) return false; const b = this.sit.E[bi]; return !(b.x > X0 && b.x < X1 && b.y > Y0 && b.y < Y1); };
    for (let y = L.y; y < L.y + L.h; y++) for (let x = L.x; x < L.x + L.w; x++) { if (keep.includes(this.get(x, y)) || fuera(this.idx(x, y))) continue; this.set(x, y, base); this.lid.set(this.idx(x, y), i); }   // un edificio real que se sigue viendo conserva sus casillas
    // los cuerpos construidos del lugar (en 3D se levantan como edificios); se corren dentro del lugar si así no tapan calles
    const W = L.w, H = L.h, RS = [], solid = (x, y, w, h) => RS.push([x, y, w, h]);
    switch (L.k) {
      case 'iglesia': solid((W >> 1) - 2, 1, 4, 4); break;
      case 'terminal': solid(1, 1, W - 2, 3); break;
      case 'campus': if (H >= 8) { solid(1, 1, 3, 3); solid(W - 4, 1, 3, 3); solid(1, H - 4, 3, 3); solid(W - 4, H - 4, 3, 3); } else { solid(1, 1, 3, H - 2); solid(W - 4, 1, 3, H - 2); } break;
      case 'botanico': solid(3, 2, 5, 4); break;
      case 'explora': solid(1, 1, 3, 3); solid(5, 1, 3, 2); solid(5, 4, 3, 2); break;
      case 'botero': if (!this.sit) solid(0, 0, W, 2); break;   // con los sitios reales, el Museo de Antioquia es el edificio real de al lado
      case 'teatro': solid(1, 1, 5, 4); break;
      case 'mamm': solid(1, 1, 5, 3); break;
      case 'palacio': solid(1, 1, W - 2, 4); break;
      case 'catedral': solid(2, 1, 6, 5); break;
      case 'parquenorte': solid(1, 1, 4, 4); break;
      case 'memoria': solid(1, 1, 5, 3); break;
      case 'depot': solid(0, 0, W, 2); break;
      case 'deporte': solid(7, 1, 4, 3); break;   // el coliseo
    }
    let sdx = 0, sdy = 0;
    if (RS.length && L.k !== 'depot') {   // la calle que cruza el lugar sigue siendo calle: el cuerpo busca dónde no la tapa (10 por casilla tapada, 1 por casilla corrida)
      const tapa = (dx, dy) => { let n = 0; for (const [x, y, w, h] of RS) for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (this.lid.get(this.idx(L.x + xx + dx, L.y + yy + dy)) !== i) n++; return n; };
      const bx0 = Math.min(...RS.map(r => r[0])), by0 = Math.min(...RS.map(r => r[1])), bx1 = Math.max(...RS.map(r => r[0] + r[2])), by1 = Math.max(...RS.map(r => r[1] + r[3]));
      let bs = tapa(0, 0) * 10; if (bs >= 30) for (let dy = -by0; dy <= H - by1; dy++) for (let dx = -bx0; dx <= W - bx1; dx++) { const sc = tapa(dx, dy) * 10 + Math.abs(dx) + Math.abs(dy); if (sc < bs) { bs = sc; sdx = dx; sdy = dy; } }
    }
    const tapada = (x, y) => this.lid.get(this.idx(x, y)) !== i;
    L.sdx = sdx; L.sdy = sdy; L.solids = RS.map(([x, y, w, h]) => {   // y si aún tapa, se recortan los bordes que caen en la calle (sin bajar de 2 casillas)
      let X0 = L.x + x + sdx, Y0 = L.y + y + sdy, X1 = X0 + w, Y1 = Y0 + h;
      for (let guard = 0; guard < 8 && L.k !== 'depot'; guard++) {
        const fila = yy => { let n = 0; for (let xx = X0; xx < X1; xx++) if (tapada(xx, yy)) n++; return n; }, col = xx => { let n = 0; for (let yy = Y0; yy < Y1; yy++) if (tapada(xx, yy)) n++; return n; };
        const e = [[fila(Y0), 0], [fila(Y1 - 1), 1], [col(X0), 2], [col(X1 - 1), 3]].filter(([n, k]) => n > 0 && (k < 2 ? Y1 - Y0 > 2 : X1 - X0 > 2)).sort((a, b) => b[0] - a[0]);
        if (!e.length) break; const k = e[0][1]; if (k === 0) Y0++; else if (k === 1) Y1--; else if (k === 2) X0++; else X1--;
      }
      return [X0, Y0, X1 - X0, Y1 - Y0];
    });
    for (const [x0, y0, w, h] of L.solids) for (let yy = y0; yy < y0 + h; yy++) for (let xx = x0; xx < x0 + w; xx++) if (this.lid.get(this.idx(xx, yy)) === i) this.set(xx, yy, TT.LAND);
    // perímetro transitable y salida a la calle
    for (let y = L.y - 1; y <= L.y + L.h; y++) for (let x = L.x - 1; x <= L.x + L.w; x++) {
      if (y >= L.y && y < L.y + L.h && x >= L.x && x < L.x + L.w) continue;
      const v = this.get(x, y); if (v === TT.BLDG || v === TT.BRICK || v === TT.MOUNT) this.set(x, y, TT.WALK);
    }
    if (L.k === 'depot') { const cx = L.x + (W >> 1); for (let y = L.y + H; y < L.y + H + 6; y++) { const v = this.get(cx, y); if (TRUCK_OK[v]) break; this.set(cx, y, TT.DEPOT); this.set(cx + 1, y, TT.DEPOT); } }
  },
  /* la estación ocupa 4×2 casillas (80×40 m) en la acera o el lote más cercano a su lat/lon, con salida a una vía */
  carveStation(s, i) {
    const [id, name, muni, lat, lon, type, kind, az] = s, g = geoT(lat, lon), tx = g.x, ty = g.y, ok = [TT.BLDG, TT.BRICK, TT.GRASS, TT.PLAZA, TT.WALK];
    const acc = v => v === TT.WALK || v === TT.CICLO || v === TT.PLAZA || v === TT.ROAD || v === TT.AVE;
    let best = null, bd = 1e9;
    // ¿la calle de acceso es parte de la red? BFS corto con memoria: lo que ya se sabe conectado (1) o encerrado (2) no se vuelve a recorrer
    const CN = this._cn || (this._cn = new Uint8Array(MW * MH)), LIM = 600 * MS;
    // lo mismo para el camión: la calle cercana debe ser parte de la red vial principal, la misma a la que sale Casa EnCicla
    const CT = this._ct || (this._ct = (() => {
      const m = new Uint8Array(MW * MH), d = LM.depot, cx0 = Math.round(d.x + d.w / 2), cy0 = Math.round(d.y + d.h / 2); let seed = -1;
      for (let r = 0; r < 160 && seed < 0; r++) for (let dy = -r; dy <= r && seed < 0; dy++) for (let dx = -r; dx <= r; dx++) if ((Math.abs(dx) === r || Math.abs(dy) === r) && (this.get(cx0 + dx, cy0 + dy) === TT.AVE || this.get(cx0 + dx, cy0 + dy) === TT.AUTO)) { seed = (cy0 + dy) * MW + cx0 + dx; break; }   // la avenida o autopista más cercana a Casa EnCicla
      if (seed < 0) return null; const q = [seed]; m[seed] = 1;
      for (let i = 0; i < q.length; i++) { const k = q[i], x = k % MW, y = (k / MW) | 0; for (let e = 0; e < 4; e++) { const nx = x + (e === 0 ? 1 : e === 1 ? -1 : 0), ny = y + (e === 2 ? 1 : e === 3 ? -1 : 0); if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const n = ny * MW + nx; if (m[n] || !TRUCK_OK[this.t[n]]) continue; m[n] = 1; q.push(n); } }
      return m; })());
    const camion = (sx, sy) => !CT || CT[sy * MW + sx] === 1;
    const conecta = (sx, sy) => { const k0 = sy * MW + sx; if (CN[k0]) return CN[k0] === 1; const seen = [k0], set = new Set(seen); let ok = false;
      for (let i = 0; i < seen.length && !ok; i++) { const k = seen[i], qx = k % MW, qy = (k / MW) | 0, v = this.t[k]; if (v === TT.AVE || v === TT.AUTO || CN[k] === 1 || set.size >= LIM) { ok = CN[k] !== 2; break; }
        for (let d = 0; d < 4; d++) { const nx = qx + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = qy + (d === 2 ? 1 : d === 3 ? -1 : 0); if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const n = ny * MW + nx; if (set.has(n) || SOLID[this.t[n]]) continue; set.add(n); seen.push(n); } }
      for (const k of seen) CN[k] = ok ? 1 : 2; return ok; };
    // lo más cerca posible del punto real: acostada (4×2) o de pie (2×4), según quepa en la manzana.
    // Puede montarse sobre pocas casillas de calle menor (con castigo); nunca sobre avenidas, autopistas, ciclorrutas ni agua.
    const OFF = this._off || (this._off = (() => { const R = Math.round(30 * MS), o = []; for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) o.push([x, y, Math.hypot(x, y)]); return o.sort((p, q) => p[2] - q[2]); })());
    for (const [R, maxR] of [[Math.round(20 * MS), 2], [Math.round(30 * MS), 8]]) { if (best) break;
    for (const [ox, oy, od] of OFF) { if (od > R + 3) break; if (od - 3 > bd) break; for (const [w, h] of [[4, 2], [2, 4]]) { const x = Math.round(tx - w / 2) + ox, y = Math.round(ty - h / 2) + oy;
      const d0 = Math.hypot(x + w / 2 - tx, y + h / 2 - ty); if (d0 >= bd) continue;
      let good = true, nr = 0;
      for (let yy = y; yy < y + h && good; yy++) for (let xx = x; xx < x + w; xx++) { const v = this.get(xx, yy); if (v === TT.ROAD) nr++; else if (!ok.includes(v) || (this.sitB && this.sitB.has(yy * MW + xx))) { good = false; break; } if (this.lid.has(this.idx(xx, yy))) { good = false; break; } }
      const d = d0 + nr * 3.5; if (!good || nr > maxR || d >= bd) continue;
      for (let yy = y - 2; yy <= y + h + 1 && good; yy++) for (let xx = x - 2; xx <= x + w + 1; xx++) if (this.get(xx, yy) === TT.STATION) { good = false; break; }
      if (!good) continue;
      // da a una calle por su costado largo (no solo por una esquina) y el camión de balance llega a menos de 5 casillas
      const hz = w > h; let lo = null, hi = null;
      if (hz) for (let xx = x + 1; xx <= x + 3; xx++) { if (!lo && acc(this.get(xx, y + h))) lo = [xx, y + h]; if (!hi && acc(this.get(xx, y - 1))) hi = [xx, y - 1]; }
      else for (let yy = y + 1; yy <= y + 3; yy++) { if (!lo && acc(this.get(x + w, yy))) lo = [x + w, yy]; if (!hi && acc(this.get(x - 1, yy))) hi = [x - 1, yy]; }
      if (lo && !conecta(lo[0], lo[1])) lo = null; if (!lo && hi && !conecta(hi[0], hi[1])) hi = null;   // la calle de acceso debe ser parte de la red, no un retazo suelto
      if (!lo && !hi) continue;
      let tr = false; const cx = Math.floor(x + w / 2), cy = Math.floor(y + h / 2), tw = Math.round(5 * MS) - 1; /* una casilla de holgura: el centro se corre 1 px hacia la calle */ for (let yy = cy - tw; yy <= cy + tw && !tr; yy++) for (let xx = cx - tw; xx <= cx + tw; xx++) if (TRUCK_OK[this.get(xx, yy)] && !(xx >= x && xx < x + w && yy >= y && yy < y + h) && camion(xx, yy)) { tr = true; break; }   // (no cuenta la calle que la propia estación tapa)   // una calle del camión que sí está conectada a la red
      if (!tr) continue;
      bd = d; best = { x, y, w, h, up: !lo };
    } } }
    if (!best) { (this.dropped || (this.dropped = [])).push(name); return null; }
    for (let yy = best.y; yy < best.y + best.h; yy++) for (let xx = best.x; xx < best.x + best.w; xx++) this.set(xx, yy, TT.STATION);
    const cap = type === 'm' ? 14 + Math.floor(h2(i, 3) * 3) * 2 : 10 + Math.floor(h2(i, 4) * 2) * 2;
    const zone = lat > 6.272 ? 'norte' : lat > 6.205 ? 'centro' : 'sur';
    return { i, id, name, muni, type, kind, cap, zone, az: az || null, e: CORREDOR_E[id] || '', lat, lon, v: best.h > best.w, tx: best.x, ty: best.y, x: (best.x + best.w / 2) * TS - (best.up && best.h > best.w ? 1 : 0), y: (best.y + best.h / 2) * TS - (best.up && best.w > best.h ? 1 : 0) };
  },
  /* ---------- semáforos, carriles de carros, metro, tranvía, cables ---------- */
  buildLights() {
    const road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE;
    for (const [a, b] of VM.lights) {
      const tx = Math.floor(a / 4), ty = Math.floor(b / 4); if (!road(this.get(tx, ty))) continue;
      const id = this.lights.length, L = { id, x: (a / 4) * TS, y: (b / 4) * TS, off: h2(tx, ty, 77) * 10 };
      L.x0 = L.x - 12 * WK; L.x1 = L.x + 12 * WK; L.y0 = L.y - 12 * WK; L.y1 = L.y + 12 * WK; this.lights.push(L);
      for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) if (road(this.get(x, y))) this.lightAt.set(this.idx(x, y), id);
    }
  },
  /* ciclo de 10 s: [estado este-oeste, estado norte-sur]  g=verde a=amarillo r=rojo */
  lightState(L, t) { const p = ((t + L.off) % 10 + 10) % 10; return p < 4.2 ? 'gr' : p < 5 ? 'ar' : p < 9.2 ? 'rg' : 'ra'; },
  /* polilínea en px -> {pts, cum, len} */
  poly(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y)); return { pts, cum, len: cum[cum.length - 1] }; },
  /* punto a la distancia s de la polilínea (con desfase lateral off): {x, y, a, i} */
  at(P, s, off, hint) {
    const c = P.cum; s = clamp(s, 0, P.len); let i = hint != null ? clamp(hint, 0, c.length - 2) : 0;
    while (i < c.length - 2 && c[i + 1] < s) i++; while (i > 0 && c[i] > s) i--;
    const a = P.pts[i], b = P.pts[i + 1] || a, L = (c[i + 1] - c[i]) || 1, k = (s - c[i]) / L, ang = Math.atan2(b.y - a.y, b.x - a.x);
    return { x: a.x + (b.x - a.x) * k - Math.sin(ang) * (off || 0), y: a.y + (b.y - a.y) * k + Math.cos(ang) * (off || 0), a: ang, i };
  },
  /* distancia más corta de un punto a la polilínea: {d, s} */
  project(P, x, y) {
    let bd = 1e9, bs = 0;
    for (let i = 0; i < P.pts.length - 1; i++) { const a = P.pts[i], b = P.pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1, t = clamp(((x - a.x) * dx + (y - a.y) * dy) / L2, 0, 1), px = a.x + dx * t, py = a.y + dy * t, d = Math.hypot(x - px, y - py); if (d < bd) { bd = d; bs = P.cum[i] + Math.sqrt(L2) * t; } }
    return { d: bd, s: bs };
  },
  buildLanes() {
    const G = 64, cells = this.laneGrid = new Map(), SPD = { t: 46 * WK, p: 36 * WK, s: 30 * WK };
    const add = (ln) => { this.lanes.push(ln); const seen = new Set(); for (const p of ln.pts) { const k = Math.floor(p.x / TS / G) + ',' + Math.floor(p.y / TS / G); if (seen.has(k)) continue; seen.add(k); (cells.get(k) || cells.set(k, []).get(k)).push(ln); } };
    for (const l of VM.lanes) {
      const P = this.poly(chaikin(q4(l.p), 2)), base = { pts: P.pts, cum: P.cum, len: P.len, spd: SPD[l.c] || 30 * WK, name: l.n, cv: CICLOVIA_AV.includes(l.n), cls: l.c };
      if (l.o) add(Object.assign({ dir: 1, off: 0 }, base)); else { add(Object.assign({ dir: 1, off: 3 * WK }, base)); add(Object.assign({ dir: -1, off: -3 * WK }, base)); }
    }
    // semáforos sobre cada carril
    for (const ln of this.lanes) {
      ln.lights = [];
      for (const g of this.lightsNear(ln)) { const pr = this.project(ln, g.x, g.y); if (pr.d < 14 * WK) { const q = this.at(ln, pr.s), ax = Math.abs(Math.cos(q.a)) > Math.abs(Math.sin(q.a)) ? 0 : 1; ln.lights.push({ p0: pr.s - 12 * WK, p1: pr.s + 12 * WK, g, ax }); } }
      ln.lights.sort((a, b) => a.p0 - b.p0);
    }
  },
  lightsNear(ln) { if (!this._lg) { this._lg = new Map(); for (const g of this.lights) { const k = Math.floor(g.x / TS / 64) + ',' + Math.floor(g.y / TS / 64); (this._lg.get(k) || this._lg.set(k, []).get(k)).push(g); } } const r = new Set(); for (const p of ln.pts) { const L = this._lg.get(Math.floor(p.x / TS / 64) + ',' + Math.floor(p.y / TS / 64)); if (L) L.forEach(g => r.add(g)); } return r; },
  lanesNear(x, y) { const G = 64 * TS, r = []; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const L = this.laneGrid.get((Math.floor(x / G) + i) + ',' + (Math.floor(y / G) + j)); if (L) r.push(...L); } return r; },
  buildRail() {
    const mk = (k) => { const m = VM.metro[k], P = this.poly(chaikin(q4(m.p), 3)); P.st = m.st.map(([name, a, b]) => { const x = a / 4 * TS, y = b / 4 * TS, pr = this.project(P, x, y); return { name, px: x, py: y, s: pr.s }; }); return P; };
    this.lineA = mk('A'); this.lineB = mk('B'); this.tram = mk('T');
    this.metroA = this.lineA.st; this.metroB = this.lineB.st;
    // Metroplús (líneas 1, 2 y O): por su carril, de estación a estación por las avenidas reales
    this.mp = (VM.mp || []).map(l => { const P = this.poly(chaikin(q4(l.p), 2)); P.id = l.id; P.name = l.n; P.col = l.c; P.st = l.st.map(([name, a, b]) => { const x = a / 4 * TS, y = b / 4 * TS; return { name, px: x, py: y, s: this.project(P, x, y).s }; }); return P; });
    this.river = this.poly(q4(VM.river));
    this.cables = [];
    for (const [name, col, st] of CABLES) for (let i = 0; i < st.length - 1; i++) {
      const a = geoP(st[i][0], st[i][1]), b = geoP(st[i + 1][0], st[i + 1][1]);
      this.cables.push({ name: i === 0 ? name : '', col, ax: a.x, ay: a.y, bx: b.x, by: b.y, len: Math.hypot(b.x - a.x, b.y - a.y), st: [0, 1], sn: [st[i][2], st[i + 1][2]] });
    }
  },
  buildMini() {
    const K = this.miniK, w = Math.ceil(MW / K), h = Math.ceil(MH / K), rank = [1, 0, 2, 3, 6, 7, 5, 8, 4, 3, 2, 6, 9, 2, 8, 7, 4];   // qué gana al reducir 2x2
    const cols = MINI_COL.map(c => parseInt(c.slice(1), 16));
    this.mini = Art.mk(w, h, c => {
      const img = c.createImageData(w, h), d = img.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let v = this.get(x * K, y * K), r = rank[v];
        for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) { const u = this.get(x * K + i, y * K + j); if (rank[u] > r) { r = rank[u]; v = u; } }
        const col = cols[v], e = this.elevT(x * K, y * K), sh = clamp(1 + (this.elevT(x * K - 4, y * K - 4) - e) * .006, .7, 1.25), o = (y * w + x) * 4;
        d[o] = clamp((col >> 16) * sh, 0, 255); d[o + 1] = clamp((col >> 8 & 255) * sh, 0, 255); d[o + 2] = clamp((col & 255) * sh, 0, 255); d[o + 3] = 255;
      }
      c.putImageData(img, 0, 0);
      const line = (P, col, wd) => { c.strokeStyle = col; c.lineWidth = wd; c.beginPath(); P.pts.forEach((p, i) => i ? c.lineTo(p.x / TS / K, p.y / TS / K) : c.moveTo(p.x / TS / K, p.y / TS / K)); c.stroke(); };
      line(this.lineA, '#d6dde6', 1.5); line(this.lineB, '#d6dde6', 1.5); line(this.tram, PAL.cie, 1); for (const L of this.mp) line(L, L.col, 1);
      c.lineWidth = 1; for (const cb of this.cables) { c.strokeStyle = cb.col; c.beginPath(); c.moveTo(cb.ax / TS / K, cb.ay / TS / K); c.lineTo(cb.bx / TS / K, cb.by / TS / K); c.stroke(); }
    });
  },

  /* ---------- rutas (Dial) en una ventana alrededor del destino y del que pregunta ---------- */
  flow(tx, ty, truck, fx, fy) {
    tx = clamp(tx | 0, 0, MW - 1); ty = clamp(ty | 0, 0, MH - 1);
    const ok0 = v => truck ? TRUCK_OK[v] : !SOLID[v];
    if (!ok0(this.get(tx, ty))) { const n = this.nearestOpen(tx, ty, truck); tx = n.x; ty = n.y; }
    const full = fx === -1; fx = fx == null || full ? tx : clamp(fx | 0, 0, MW - 1); fy = fy == null || full ? ty : clamp(fy | 0, 0, MH - 1);   // fx = -1: todo el mapa (pruebas)
    // si ya hay un campo que cubre al que pregunta, se reutiliza
    const kb = tx + ',' + ty + (truck ? 't' : 'b');
    for (const [k, F] of this.flows) if (k.startsWith(kb + '|') && fx > F.x0 + 4 && fy > F.y0 + 4 && fx < F.x0 + F.w - 5 && fy < F.y0 + F.h - 5) { this.flows.delete(k); this.flows.set(k, F); return F; }
    const m = full ? 1e5 : Math.round(90 * MS), x0 = clamp(Math.min(tx, fx) - m, 0, MW - 1), y0 = clamp(Math.min(ty, fy) - m, 0, MH - 1), x1 = clamp(Math.max(tx, fx) + m, 0, MW - 1), y1 = clamp(Math.max(ty, fy) + m, 0, MH - 1);
    const w = x1 - x0 + 1, h = y1 - y0 + 1, N = w * h, D = new Int32Array(N).fill(1e9), buckets = []; let cur = 0, maxB = 0;
    const cost = v => truck ? (TRUCK_OK[v] ? (v === TT.AUTO ? 2 : 3) : 0) : PATHC[v];
    const push = (i, d) => { (buckets[d] || (buckets[d] = [])).push(i); };
    const s = (ty - y0) * w + (tx - x0); D[s] = 0; push(s, 0);
    const T = this.t;
    while (cur <= maxB + 8) {
      const B = buckets[cur]; if (!B || !B.length) { cur++; continue; }
      const i = B.pop(); if (D[i] !== cur) continue;
      const x = i % w, y = (i / w) | 0;
      for (let k = 0; k < 4; k++) {
        const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0); if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx, c = cost(T[(ny + y0) * MW + nx + x0]); if (!c) continue;
        const nd = cur + c; if (nd < D[j]) { D[j] = nd; push(j, nd); if (nd > maxB) maxB = nd; }
      }
    }
    const F = { D, x0, y0, w, h };
    this.flows.set(kb + '|' + x0 + ',' + y0 + ',' + w + ',' + h, F); if (this.flows.size > 10) this.flows.delete(this.flows.keys().next().value);
    return F;
  },
  /* valor del campo en la casilla (1e9 = fuera / sin camino) */
  fv(F, x, y) { x -= F.x0; y -= F.y0; return (x < 0 || y < 0 || x >= F.w || y >= F.h) ? 1e9 : F.D[y * F.w + x]; },
  nextStep(F, x, y, lvl) {
    let best = null, bv = this.fv(F, x, y);
    const dn = lvl && this.desnivel ? this.desnivel.get(y * MW + x) : null;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = x + dx, ny = y + dy; let v = this.fv(F, nx, ny); if (v >= 1e9) continue;
      if (dx && dy) { if (this.fv(F, nx, y) >= 1e9 || this.fv(F, x, ny) >= 1e9) continue; v += .5; }
      if (dn && Math.abs(Math.cos(angDiff(Math.atan2(dy, dx), dn.a))) < .45) v += 6;
      if (v < bv) { bv = v; best = { x: nx, y: ny }; }
    }
    return best;
  },
  nearestOpen(x, y, truck) {
    const ok = v => truck ? TRUCK_OK[v] : !SOLID[v];
    for (let r = 0; r < 14 * MS; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if ((Math.abs(dx) === r || Math.abs(dy) === r) && ok(this.get(x + dx, y + dy))) return { x: x + dx, y: y + dy };
    return { x, y };
  },

  /* ---------- dibujo por bloques (caché): pixel + sombras del relieve ---------- */
  chunk(cx, cy) {
    const k = cx + ',' + cy; let c = this.chunks.get(k);
    if (c) { this.chunks.delete(k); this.chunks.set(k, c); return c; }
    c = Art.mk(CH * TS, CH * TS, x => this.drawChunk(x, cx, cy));
    this.chunks.set(k, c); if (this.chunks.size > 36) this.chunks.delete(this.chunks.keys().next().value);
    return c;
  },
  drawChunk(c, cx, cy) {
    const x0 = cx * CH, y0 = cy * CH, px0 = x0 * TS, py0 = y0 * TS, S = CH * TS;
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) this.drawTile(c, x, y, (x - x0) * TS, (y - y0) * TS);
    // rayas del centro: siguen el eje vectorizado de cada calle (sin rayas sueltas en las zonas anchas)
    if (this.chains) for (const ch of this.chainsNear(px0 - TS, py0 - TS, S + 2 * TS, S + 2 * TS)) {
      if (ch.k !== 2 && ch.k !== 3) continue; const p = ch.p, tot = chainLen(p); if (tot < 4 * TS) continue;   // en pixel, rayas solo en avenidas y autopistas (en las calles de barrio ensucian)
      const col = ch.k === 2 ? '#ffd166' : '#d8d8d0', per = ch.k === 1 ? 12 : 14, on = ch.k === 1 ? 5 : 7, m0 = ch.j0 ? TS : 2, m1 = ch.j1 ? tot - TS : tot - 2; let s0 = 0;
      for (let i = 2; i < p.length; i += 2) {
        const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, L = Math.hypot(dx, dy) || 1;
        for (let k = 0; k < L; k++) { const ss = s0 + k; if (ss < m0 || ss > m1 || ss % per >= on) continue; const x = ax + dx * k / L - px0, y = ay + dy * k / L - py0; if (x < -1 || y < -1 || x > S + 1 || y > S + 1) continue; prect(c, Math.floor(x), Math.floor(y), 1, 1, col); }
        s0 += L;
      }
    }
    // cebras en los cruces con semáforo, de lado a lado de cada calle que llega
    for (const z of this.zebras(px0 - 30, py0 - 30, S + 60, S + 60)) {
      const nx = -z.uy, ny = z.ux;
      for (let k = -z.hw + 1.5; k <= z.hw - 1.5; k += 3) for (let t = -3; t <= 3; t++) for (const w of [0, .9]) { const x = z.x + nx * (k + w) + z.ux * t - px0, y = z.y + ny * (k + w) + z.uy * t - py0; if (x >= 0 && y >= 0 && x < S && y < S) prect(c, Math.floor(x), Math.floor(y), 1, 1, '#e9e7df'); }
    }
    c.imageSmoothingEnabled = false; LANDMARKS.forEach((L, i) => { if (L.real || L.x + L.w < x0 || L.x > x0 + CH || L.y + L.h < y0 || L.y > y0 + CH) return; c.drawImage(this.landmarkCanvas(i), (L.x - x0) * TS, (L.y - y0) * TS, L.w * TS, L.h * TS); });
    // árboles
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) {
      const v = this.get(x, y), r = h2(x, y, 5); let rad = 0;
      if (v === TT.GRASS && r < .3 && !this.lid.has(this.idx(x, y))) rad = 5 + (r < .1 ? 2 : 0);
      else if (v === TT.WALK && r < .12) rad = 4;
      if (!rad) continue;
      const px = (x - x0) * TS + TS / 2, py = (y - y0) * TS + TS / 2, g = h2(x, y, 6), col = g < .05 ? '#f2c230' : g < .09 ? '#e88ab8' : '#3f8a3f';
      pdisc(c, px + 1, py + 1, rad, '#0003'); pdisc(c, px, py, rad, col); pdisc(c, px - 1, py - 1, Math.max(1, rad - 2), g < .09 ? '#fff3a066' : '#5fae4f');
    }
    // tranvía (rieles) y viaductos del metro
    const inC = q => q.x > px0 - 12 && q.y > py0 - 12 && q.x < px0 + S + 12 && q.y < py0 + S + 12;
    const T = this.tram; for (let s = 0; s < T.len; s += 1) { const q = this.at(T, s); if (!inC(q)) continue; const nx = -Math.sin(q.a), ny = Math.cos(q.a); if (s % 5 === 0) for (let k = -5; k <= 5; k++) prect(c, q.x - px0 + nx * k, q.y - py0 + ny * k, 1, 1, '#5d5446'); prect(c, q.x - px0 + nx * 3, q.y - py0 + ny * 3, 1, 1, '#a7adb5'); prect(c, q.x - px0 - nx * 3, q.y - py0 - ny * 3, 1, 1, '#a7adb5'); }
    for (const L of [this.lineA, this.lineB]) {
      for (let s = 0; s < L.len; s += 1) {
        const q = this.at(L, s); if (!inC(q)) continue; const nx = -Math.sin(q.a), ny = Math.cos(q.a), x = q.x - px0, y = q.y - py0;
        for (let k = -6; k <= 6; k++) prect(c, x + nx * k + 3, y + ny * k + 4, 1, 1, '#00000022');
        for (let k = -6; k <= 6; k++) prect(c, x + nx * k, y + ny * k, 1, 1, Math.abs(k) === 6 ? '#8d939c' : Math.abs(k) === 3 ? '#7d838c' : '#c9ccd1');
        if (s % 64 === 0) prect(c, x - 2, y - 2, 5, 5, '#00000044');
      }
      for (const st of L.st) { const q = this.at(L, st.s); if (!inC(q)) continue; c.save(); c.translate(Math.round(q.x - px0), Math.round(q.y - py0)); c.rotate(Math.round(q.a / (Math.PI / 4)) * Math.PI / 4); const sl = Math.round(20 * MS * 1.5), sw = Math.round(11 * MS * .85); prect(c, -sl, -sw, sl * 2, sw * 2, '#e8ebef'); prect(c, -sl, -sw, sl * 2, 3, L === this.lineA ? PAL.vd : PAL.cie); prect(c, -sl, sw - 3, sl * 2, 3, L === this.lineA ? PAL.vd : PAL.cie); prect(c, -sl + 4, -3, sl * 2 - 8, 6, '#7d838c'); prect(c, -sl + 2, -sw + 3, 4, 4, '#f4f4f4'); prect(c, sl - 6, sw - 7, 4, 4, '#f4f4f4'); c.restore(); }
    }
    this.relief(c, x0, y0);
  },
  /* sombras del relieve (luz del noroeste) y curvas de nivel suaves en el campo: el "dibujo 2D" sobre el pixel */
  relief(c, x0, y0) {
    const S = CH * TS, img = c.getImageData(0, 0, S, S), d = img.data;
    for (let j = 0; j < S; j += 2) for (let i = 0; i < S; i += 2) {
      const tx = x0 + i / TS, ty = y0 + j / TS, e = this.elevT(tx, ty), gx = (this.elevT(tx + .5, ty) - this.elevT(tx - .5, ty)) / VM.tile, gy = (this.elevT(tx, ty + .5) - this.elevT(tx, ty - .5)) / VM.tile;
      let f = 1 + clamp((gx + gy) * 1.1, -.32, .26) - Math.min(.12, Math.hypot(gx, gy) * .15);
      const v = this.get(x0 + ((i / TS) | 0), y0 + ((j / TS) | 0));
      if (v === TT.GRASS || v === TT.MOUNT) { const b = Math.floor(e / 25), bx = Math.floor(this.elevT(tx + .25, ty) / 25), by = Math.floor(this.elevT(tx, ty + .25) / 25); if (b !== bx || b !== by) f *= (b % 4 === 0 ? .8 : .9); }
      if (f === 1) continue;
      for (let k = 0; k < 4; k++) { const o = ((j + (k >> 1)) * S + i + (k & 1)) * 4; d[o] = Math.min(255, d[o] * f); d[o + 1] = Math.min(255, d[o + 1] * f); d[o + 2] = Math.min(255, d[o + 2] * f); }
    }
    c.putImageData(img, 0, 0);
  },
  drawTile(c, x, y, px, py) {
    // casilla de 16 px = 20 m. Calles con andén y sardinel, esquinas redondeadas; edificios por manzana.
    const G = (xx, yy) => { const t = this.get(xx, yy); return this.cov && (t === TT.ROAD || t === TT.AVE || t === TT.AUTO) && xx >= 0 && yy >= 0 && xx < MW && yy < MH && !this.cov[yy * MW + xx] ? TT.PLAZA : t; };   // asfalto solo bajo las calles vectorizadas
    const v = G(x, y), r = h2(x, y), R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(px + a, py + b, w, h); };
    const rd = vv => vv === TT.ROAD || vv === TT.AVE || vv === TT.AUTO || vv === TT.BRIDGE || vv === TT.DEPOT;
    switch (v) {
      case TT.GRASS: {
        R(0, 0, 16, 16, r < .5 ? '#5d9c4b' : '#62a350');
        for (let i = 0; i < 4; i++) R((h2(x, y, 2 + i) * 14) | 0, (h2(x, y, 9 + i) * 14) | 0, 2, 1, '#78b862');
        if (h2(x, y, 4) < .06) { R(5, 6, 1, 1, h2(x, y, 7) < .5 ? '#ffd84a' : '#ff8fc7'); R(10, 11, 1, 1, '#fff3a0'); }
        break;
      }
      case TT.MOUNT: {
        R(0, 0, 16, 16, '#2f6b3a');
        for (let i = 0; i < 3; i++) { const a = 3 + ((h2(x, y, 10 + i) * 10) | 0), b = 3 + ((h2(x, y, 20 + i) * 10) | 0); pdisc(c, px + a + 1, py + b + 1, 3, '#245530'); pdisc(c, px + a, py + b, 3, i ? '#3a7d44' : '#34763f'); R(a - 1, b - 2, 2, 1, '#4a8f4f'); }
        if (r < .015) R(7, 6, 3, 3, '#c9683f');
        break;
      }
      case TT.BRICK: {   // casas de ladrillo de las laderas, con terraza y tanque de agua
        const cols = ['#b45a36', '#c9683f', '#a84f30', '#9c6b4e', '#d8d2c4', '#8e959c'];
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
          const k = h2(x * 2 + i, y * 2 + j, 3), col = cols[(k * cols.length) | 0], X0 = i * 8, Y0 = j * 8;
          R(X0, Y0, 8, 8, col); R(X0, Y0 + 7, 8, 1, shade(col, -.3)); R(X0 + 7, Y0, 1, 8, shade(col, -.25)); R(X0, Y0, 8, 1, shade(col, .18));
          if (k < .35) R(X0 + 1, Y0 + 3, 6, 1, shade(col, -.15));
          if (h2(x * 2 + i, y * 2 + j, 4) < .25) { R(X0 + 2, Y0 + 2, 3, 3, '#3f6fd8'); R(X0 + 2, Y0 + 2, 3, 1, '#7aa0ef'); }
          else if (h2(x * 2 + i, y * 2 + j, 5) < .2) R(X0 + 4, Y0 + 4, 2, 2, '#2b2f38');
        }
        break;
      }
      case TT.BLDG: {
        const d = this.district(x, y), lk = (xx, yy) => (Math.floor((xx + ((h2(Math.floor(yy / 3), 9) * 2) | 0)) / 3)) * 1000 + Math.floor(yy / 3);
        const my = lk(x, y), pal = d === 'centro' ? ['#c9c5bd', '#b3b7bd', '#8fa6bf', '#d8d4cb', '#a5aab2', '#c0623b'] : d === 'poblado' ? ['#e6e6e1', '#9fb8cf', '#c9ced6', '#7f9cb8', '#d9d4c8'] : d === 'laureles' ? ['#c0623b', '#b4552f', '#cf7a4f', '#d9d2c4', '#a85b3c'] : ['#b9653f', '#c9683f', '#9aa0a6', '#d8d2c4', '#a84f30', '#c4b49a'];
        const hh = h2(my, 7, 1), col = pal[(hh * pal.length) | 0], tall = (d === 'centro' || d === 'poblado') && h2(my, 8, 2) < .4;
        R(0, 0, 16, 16, col);
        if (tall) { for (let i = 2; i < 16; i += 4) R(i, 2, 2, 12, shade(col, -.12)); }
        else { const k = h2(x, y, 9); if (k < .15) { R(4, 4, 4, 4, '#3f6fd8'); R(4, 4, 4, 1, '#7aa0ef'); } else if (k < .3) { R(9, 5, 3, 2, '#8e959c'); R(9, 5, 3, 1, '#c9ced6'); } else if (k < .36) R(3, 9, 6, 4, '#4f8f45'); }
        const n = (xx, yy) => G(xx, yy) === TT.BLDG && lk(xx, yy) === my;
        if (!n(x, y - 1)) R(0, 0, 16, 2, shade(col, .25)); if (!n(x - 1, y)) R(0, 0, 2, 16, shade(col, .15));
        if (!n(x, y + 1)) { R(0, 14, 16, 2, shade(col, tall ? -.5 : -.3)); } if (!n(x + 1, y)) R(14, 0, 2, 16, shade(col, tall ? -.45 : -.25));
        break;
      }
      case TT.ROAD: case TT.AVE: case TT.AUTO: case TT.BRIDGE: case TT.DEPOT: {
        const base = v === TT.AUTO ? '#30364a' : v === TT.DEPOT ? '#8d97a5' : v === TT.AVE ? '#3a4152' : '#3d4454';
        if (v === TT.DEPOT) { R(0, 0, 16, 16, base); if ((x + y) % 2 === 0) R(2, 7, 12, 1, '#ffd166'); break; }
        const n = [G(x, y - 1), G(x + 1, y), G(x, y + 1), G(x - 1, y)].map(rd), d = [rd(G(x + 1, y - 1)), rd(G(x + 1, y + 1)), rd(G(x - 1, y + 1)), rd(G(x - 1, y - 1))];
        const a0 = v === TT.ROAD ? 4 : v === TT.AVE ? 2 : 1, a1 = 16 - a0, side = v === TT.BRIDGE ? '#c9ccd1' : '#bab6a8', curb = v === TT.BRIDGE ? '#9aa0a8' : '#8d897c';
        if (v === TT.BRIDGE) R(0, 0, 16, 16, '#3d7c8c'); else R(0, 0, 16, 16, side);
        // asfalto: núcleo + brazos hacia las vías vecinas + rellenos de esquina
        const rects = [[a0, a0, a1 - a0, a1 - a0]];
        if (n[0]) rects.push([a0, 0, a1 - a0, a0]); if (n[2]) rects.push([a0, a1, a1 - a0, 16 - a1]); if (n[3]) rects.push([0, a0, a0, a1 - a0]); if (n[1]) rects.push([a1, a0, 16 - a1, a1 - a0]);
        if (n[0] && n[1] && d[0]) rects.push([a1, 0, 16 - a1, a0]); if (n[1] && n[2] && d[1]) rects.push([a1, a1, 16 - a1, 16 - a1]); if (n[2] && n[3] && d[2]) rects.push([0, a1, a0, 16 - a1]); if (n[3] && n[0] && d[3]) rects.push([0, 0, a0, a0]);
        if (v !== TT.BRIDGE) for (const [a, b, w, h] of rects) { const X0 = Math.max(0, a - 1), Y0 = Math.max(0, b - 1); R(X0, Y0, Math.min(16, a + w + 1) - X0, Math.min(16, b + h + 1) - Y0, curb); }
        for (const [a, b, w, h] of rects) R(a, b, w, h, base);
        // esquinas redondeadas: el andén se curva donde dos calles doblan
        if (a0 > 1) {
          const fil = (cx, cy) => { R(cx, cy, 1, 1, base); };
          if (n[0] && n[1] && !d[0]) { fil(a1, a0 - 1); fil(a1, a0 - 2); fil(a1 + 1, a0 - 1); }
          if (n[1] && n[2] && !d[1]) { fil(a1, a1); fil(a1, a1 + 1); fil(a1 + 1, a1); }
          if (n[2] && n[3] && !d[2]) { fil(a0 - 1, a1); fil(a0 - 1, a1 + 1); fil(a0 - 2, a1); }
          if (n[3] && n[0] && !d[3]) { fil(a0 - 1, a0 - 1); fil(a0 - 1, a0 - 2); fil(a0 - 2, a0 - 1); }
          // núcleo sin salida por dos lados: la esquina exterior del asfalto se redondea
          if (!n[0] && !n[3]) R(a0, a0, 1, 1, curb); if (!n[0] && !n[1]) R(a1 - 1, a0, 1, 1, curb); if (!n[2] && !n[1]) R(a1 - 1, a1 - 1, 1, 1, curb); if (!n[2] && !n[3]) R(a0, a1 - 1, 1, 1, curb);
        }
        if (r < .35) R(5 + ((h2(x, y, 2) * 6) | 0), 5 + ((h2(x, y, 3) * 6) | 0), 1, 1, shade(base, .1));
        if (r > .93) R(4 + ((h2(x, y, 6) * 7) | 0), 6, 2, 1, shade(base, -.15));   // parche
        if (v === TT.AUTO) { const yl = '#ffd166'; if (!n[0]) R(a0, a0, a1 - a0, 1, yl); if (!n[2]) R(a0, a1 - 1, a1 - a0, 1, yl); if (!n[3]) R(a0, a0, 1, a1 - a0, yl); if (!n[1]) R(a1 - 1, a0, 1, a1 - a0, yl); }
        if (v === TT.BRIDGE) { const w = '#dfe3e8'; if (!n[0] && !n[2]) { R(0, a0 - 1, 16, 1, w); R(0, a1, 16, 1, w); } if (!n[1] && !n[3]) { R(a0 - 1, 0, 1, 16, w); R(a1, 0, 1, 16, w); } }
        break;
      }
      case TT.WALK: {
        R(0, 0, 16, 16, '#c2beb0'); for (let i = 0; i < 16; i += 4) { R(0, i, 16, 1, '#b4b0a2'); R(((i / 4) & 1) * 2 + i % 8, 0, 1, 16, '#b8b4a6'); }
        if (rd(G(x, y - 1))) R(0, 0, 16, 2, '#8d897c'); if (rd(G(x, y + 1))) R(0, 14, 16, 2, '#8d897c');
        if (rd(G(x - 1, y))) R(0, 0, 2, 16, '#8d897c'); if (rd(G(x + 1, y))) R(14, 0, 2, 16, '#8d897c');
        break;
      }
      case TT.STEPS: R(0, 0, 16, 16, '#a8a396'); for (let i = 1; i < 16; i += 3) R(1, i, 14, 1, '#8c877a'); R(0, 0, 1, 16, '#6f6a5e'); R(15, 0, 1, 16, '#6f6a5e'); R(2, 0, 1, 16, '#c9c4b6'); break;
      case TT.CICLO: {
        R(0, 0, 16, 16, '#4a9a2c'); if (r < .4) R(3 + ((h2(x, y, 2) * 10) | 0), 3 + ((h2(x, y, 3) * 10) | 0), 1, 1, '#55a634');
        const cc = vv => vv === TT.CICLO, N = cc(G(x, y - 1)), S = cc(G(x, y + 1)), W = cc(G(x - 1, y)), E = cc(G(x + 1, y));
        if (!N) R(0, 0, 16, 2, '#9bd341'); if (!S) R(0, 14, 16, 2, '#9bd341'); if (!W) R(0, 0, 2, 16, '#9bd341'); if (!E) R(14, 0, 2, 16, '#9bd341');
        if ((N || S) && !(W || E)) { if ((y & 1) === 0) R(7, 3, 2, 6, '#eaf7d4'); } else if ((W || E) && !(N || S)) { if ((x & 1) === 0) R(3, 7, 6, 2, '#eaf7d4'); }
        if (h2(x, y, 31) < .05) { pring(c, px + 5, py + 9, 2, '#eaf7d4'); pring(c, px + 11, py + 9, 2, '#eaf7d4'); R(6, 6, 5, 1, '#eaf7d4'); }
        break;
      }
      case TT.WATER: {
        R(0, 0, 16, 16, '#3d7c8c'); if (r < .6) R((h2(x, y, 2) * 10) | 0, (h2(x, y, 3) * 14) | 0, 5, 1, '#5b9aa8'); if (r > .8) R(3, 10, 3, 1, '#7fb6c0');
        const wa = vv => vv === TT.WATER || vv === TT.BRIDGE || vv === TT.CANAL;
        if (!wa(G(x, y - 1))) R(0, 0, 16, 2, '#2f6370'); if (!wa(G(x, y + 1))) R(0, 14, 16, 2, '#2f6370'); if (!wa(G(x - 1, y))) R(0, 0, 2, 16, '#2f6370'); if (!wa(G(x + 1, y))) R(14, 0, 2, 16, '#2f6370');
        break;
      }
      case TT.CANAL: R(0, 0, 16, 16, '#9a9a92'); R(3, 3, 10, 10, '#4f8796'); R(3, 3, 10, 1, '#3d6f7c'); if (r < .5) R(5, 7, 4, 1, '#6aa3b0'); break;
      case TT.PLAZA: R(0, 0, 16, 16, '#ddd3b8'); R(0, 0, 8, 8, '#d3c8aa'); R(8, 8, 8, 8, '#d3c8aa'); R(0, 7, 16, 1, '#cbbf9f'); R(7, 0, 1, 16, '#cbbf9f'); break;
      case TT.STATION: {
        R(0, 0, 16, 16, '#eef2f5'); R(0, 14, 16, 2, '#dde3e8');
        if (G(x, y - 1) !== TT.STATION) R(0, 0, 16, 3, PAL.vd); if (G(x, y + 1) !== TT.STATION) R(0, 14, 16, 2, PAL.vd2);
        if (G(x - 1, y) !== TT.STATION) R(0, 0, 2, 16, PAL.vd); if (G(x + 1, y) !== TT.STATION) R(14, 0, 2, 16, PAL.vd);
        break;
      }
      case TT.LAND: R(0, 0, 16, 16, '#7e8a99'); break;
    }
  },
  landmarkCanvas: null   // en 21-map-art.js
};
```

#### Archivo: `src/js/30-ride.js` [Juega EnCicla]

```javascript
/* =====================================================================
   SIMULACIÓN DE ESTACIONES + MOTOR DE RECORRIDO (vista cenital)
   ===================================================================== */
const gauss = (x, m, s) => Math.exp(-((x - m) * (x - m)) / (2 * s * s));

class StationSim {
  constructor(rng, o = {}) {
    this.rng = rng; this.demand = o.demand != null ? o.demand : 1; this.extra = o.extra || null;
    this.st = JE.map.stations.map(s => ({ ...s, bikes: Math.round(s.cap * (o.fill != null ? o.fill : rng.range(.35, .7))), broken: false, open: true, emptyT: 0, fullT: 0, noBike: 0, noDock: 0 }));
    this.trips = []; this.depot = o.depot != null ? o.depot : 40; this.trucks = []; this.held = 0; this.shop = 0; this.elapsed = 0; this.trips_done = 0;
    const n = this.st.length; this.D = new Float32Array(n * n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) this.D[i * n + j] = Math.hypot(this.st[i].x - this.st[j].x, this.st[i].y - this.st[j].y) / TS;
    this.total = this.count();
  }
  count() { let c = this.depot + this.held + this.shop + this.trips.length; for (const s of this.st) c += s.bikes; for (const t of this.trucks) c += t.load; return c; }
  out(k, m) { const a = gauss(m, 450, 60), e = gauss(m, 1080, 70); return k === 'res' ? .25 + 1.6 * a + .5 * e : k === 'work' ? .25 + .4 * a + 1.6 * e : k === 'uni' ? .3 + .6 * a + 1.0 * e + .5 * gauss(m, 780, 90) : .5 + .7 * a + .7 * e; }
  att(k, m) { const a = gauss(m, 450, 60), e = gauss(m, 1080, 70); return k === 'res' ? .3 + .3 * a + 1.5 * e : k === 'work' ? .3 + 1.6 * a + .3 * e : k === 'uni' ? .3 + 1.4 * a + .5 * e : .7; }
  choose(s, m) {
    const n = this.st.length; let tot = 0; const w = this._w || (this._w = new Float32Array(n));
    for (let j = 0; j < n; j++) { const d = this.D[s.i * n + j], t = this.st[j]; let x = 0; if (j !== s.i && t.open && !t.broken && d > 12) x = this.att(t.kind, m) * (d < 110 ? 1 : .25) * (this.extra && this.extra.id === t.id ? this.extra.mult : 1); w[j] = x; tot += x; }
    let r = this.rng.f() * tot; for (let j = 0; j < n; j++) { r -= w[j]; if (r <= 0) return this.st[j]; }
    return this.st[(s.i + 1) % n];
  }
  near(s, need) { const n = this.st.length; let best = null, bd = 1e9; for (let j = 0; j < n; j++) { const t = this.st[j]; if (j === s.i || !t.open || t.broken) continue; if (need === 'dock' && t.bikes >= t.cap) continue; const d = this.D[s.i * n + j]; if (d < bd) { bd = d; best = t; } } return best; }
  step(dm, m) {
    this.elapsed += dm; const open = m >= 330 && m <= 1320;
    for (const s of this.st) {
      if (s.bikes <= 0) s.emptyT += dm; else if (s.bikes >= s.cap) s.fullT += dm;
      if (!open || !s.open || s.broken) continue;
      const lam = .045 * this.demand * this.out(s.kind, m) * dm * (this.extra && this.extra.id === s.id ? this.extra.mult : 1);
      let k = Math.floor(lam) + (this.rng.f() < lam % 1 ? 1 : 0);
      while (k-- > 0) {
        if (s.bikes > 0) { s.bikes--; const d = this.choose(s, m); this.trips.push({ o: s.i, d: d.i, t: m + Math.max(4, this.D[s.i * this.st.length + d.i] * .09) }); }
        else s.noBike++;
      }
    }
    for (let i = this.trips.length - 1; i >= 0; i--) {
      const tr = this.trips[i]; if (tr.t > m) continue;
      const d = this.st[tr.d];
      if (d.open && !d.broken && d.bikes < d.cap) { d.bikes++; this.trips.splice(i, 1); this.trips_done++; }
      else { d.noDock++; const alt = this.near(d, 'dock'); if (alt) { tr.d = alt.i; tr.t = m + 3; } else tr.t = m + 5; }
    }
  }
  service() { const T = Math.max(1, this.elapsed) * this.st.length; let bad = 0; for (const s of this.st) bad += s.emptyT + s.fullT; return clamp(1 - bad / T, 0, 1); }
  ratioCol(s) { const r = s.bikes / s.cap; return s.broken ? '#ff6b5a' : r <= 0 ? '#ff6b5a' : r < .2 ? '#ffc93c' : r >= 1 ? '#56c7ff' : PAL.vd; }
}

class Ride {
  constructor(mode, o) {
    this.mode = mode; this.map = JE.map; this.sim = o.sim || null; this.rng = mode.rng;
    const s = o.start; this.p = { x: s.x, y: s.y, a: o.ang != null ? o.ang : -Math.PI / 2, v: 0, w: 0, veh: o.veh || 'bike', stun: 0, load: o.load || 0, cap: o.cap || 20, lvl: 0 };
    this.cam = { x: s.x, y: s.y }; this.cars = []; this.markers = []; this.target = null; this.fx = []; this.leaves = []; this.drops = [];
    this.traffic = o.traffic != null ? o.traffic : 1; this.zone = o.zone || null;
    this.stats = { dist: 0, ciclo: 0, crashes: 0, bells: 0, reds: 0 }; this.cicT = 0; this.offC = 0; this.cicLv = 0; this.lastLight = -1; this.stamp = null; this.opps = []; this.shake = 0; this.gps = []; this.gpsT = 0; this.big = false; this.spawnT = 0; this.honkT = 0;
    const LA = this.map.lineA, LB = this.map.lineB;
    this.trains = [0, .25, .5, .75].map((f, i) => ({ L: LA, s: f * LA.len, dir: i % 2 ? 1 : -1, wait: 0 })).concat([{ L: LB, s: 0, dir: 1, wait: 0 }, { L: LB, s: LB.len, dir: -1, wait: 0 }]);
    if (this.blocked(this.p.x, this.p.y, this.stats_().r)) { const n = this.map.nearestOpen(Math.floor(this.p.x / TS), Math.floor(this.p.y / TS), this.p.veh === 'truck'); this.p.x = n.x * TS + TS / 2; this.p.y = n.y * TS + TS / 2; }
    this.initLife();
    this.mmRect = null; this.sl = 0; this.over = 0; this.cxf = s.x; this.cyf = s.y; this.joyDraw = null; this.ox = 0; this.oy = 0;
  }
  /* conducción con peso (v1.7): velocidad punta VEL (el reloj de los oficios corre MS/VEL más lento, así cada viaje cuesta los mismos minutos de juego),
     arranque gradual (acc), frenada (brk) y rodada libre al soltar (coast), en px/s²; giro limitado por la velocidad: w0 rad/s parado y w1 a toda marcha, con inercia tw s */
  stats_() { const v = this.p.veh, f = VEL * velMul(this.mode); return v === 'truck' ? { max: 50 * WK * f, acc: 24 * WK * f, brk: 62 * WK * f, coast: 22 * WK * f, w0: 2.4, w1: 1.2, tw: .2, r: 3.4 * 1.4 } : v === 'walk' ? { max: 26 * WK * f, acc: 90 * WK * f, brk: 170 * WK * f, coast: 120 * WK * f, w0: 7.5, w1: 6, tw: .05, r: 2 } : { max: 60 * WK * f, acc: 30 * WK * f, brk: 72 * WK * f, coast: 40 * WK * f, w0: 5, w1: 2.7, tw: .09, r: 2.5 }; }
  solidAt(x, y) { const v = this.map.get(Math.floor(x / TS), Math.floor(y / TS)); return this.p.veh === 'truck' ? !TRUCK_OK[v] : SOLID[v] === 1; }
  blocked(x, y, r) { return this.solidAt(x - r, y - r) || this.solidAt(x + r, y - r) || this.solidAt(x - r, y + r) || this.solidAt(x + r, y + r); }
  tileAt() { return this.map.get(Math.floor(this.p.x / TS), Math.floor(this.p.y / TS)); }
  setVeh(v) {
    this.p.veh = v; if (this.blocked(this.p.x, this.p.y, this.stats_().r)) { const n = this.map.nearestOpen(Math.floor(this.p.x / TS), Math.floor(this.p.y / TS), v === 'truck'); this.p.x = n.x * TS + TS / 2; this.p.y = n.y * TS + TS / 2; }
  }
  /* radios fijos (≤ 30 px, del diseño de 8 px) se escalan; los calculados con el tamaño del lugar ya vienen en la escala */
  marker(m) { m.inside = false; m.r = (m.r || 14) <= 30 ? (m.r || 14) * WK : m.r; this.markers.push(m); return m; }
  removeMarker(m) { const i = this.markers.indexOf(m); if (i >= 0) this.markers.splice(i, 1); if (this.target === m) this.target = null; }
  bell() {
    if (this.belT > 0) return; this.belT = .6; this.stats.bells++; Snd.sfx('bell'); Snd.note(5 + (this.stats.bells % 3) * 2, { type: 'sine', v: .05 }); this.bellPeds(); for (const c of this.cars) if (dist(c.x, c.y, this.p.x, this.p.y) < 50) c.yield = 1.2;
    // Easter eggs: tres timbrazos seguidos bajo una estación del Metro o en Moravia
    const now = this.mode.t; this.bellLog = (this.bellLog || []).filter(t => now - t < 3); this.bellLog.push(now);
    if (this.bellLog.length >= 3 && this.mode.easter) {
      const P = this.p, nearMetro = this.map.metroA.concat(this.map.metroB).some(s => dist(s.px, s.py, P.x, P.y) < 28), mv = LM.moravia;
      if (nearMetro) { this.bellLog = []; this.mode.easter('metro'); }
      else if (mv && dist((mv.x + mv.w / 2) * TS, (mv.y + mv.h / 2) * TS, P.x, P.y) < 70) { this.bellLog = []; this.mode.easter('laberinto'); }
    }
  }
  float(txt, col) { this.fx.push({ k: 't', x: this.p.x, y: this.p.y - 10, t: 1.1, txt, col: col || '#fff' }); }
  burst(x, y, col, n = 10) { for (let i = 0; i < n; i++) { const a = this.rng.f() * TAU, s = 20 + this.rng.f() * 40; this.fx.push({ k: 'p', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: .5 + this.rng.f() * .3, col }); } }

  update(dt, dir) {
    const P = this.p, S = this.stats_(), M = this.mode, rain = M.mods.rain;
    this.belT = Math.max(0, (this.belT || 0) - dt); this.inv = Math.max(0, (this.inv || 0) - dt);
    if (P.stun > 0) { P.stun -= dt; dir = { x: 0, y: 0, m: 0 }; }
    let mult = P.veh === 'truck' ? 1 : P.veh === 'walk' ? (WSURF[this.tileAt()] || .8) : (SURF[this.tileAt()] || .5);
    mult *= (M.has('llantas') && P.veh === 'bike' ? 1.12 : 1) * (M.has('camion') && P.veh === 'truck' ? 1.15 : 1) * (rain ? .93 : 1) * (M.mods.ciclovia && P.veh === 'bike' ? 1.06 : 1);
    // relieve real: en subida se pedalea más lento y en bajada se va más rápido (el camión lo siente menos; la bici eléctrica no sufre en subida)
    const sl = this.sl = this.map.slope(P.x, P.y, P.a), eb = P.veh === 'bike' && !!(M.ebike || this.ebike);
    if (M.speedMul) mult *= M.speedMul(this);
    mult *= P.veh === 'truck' ? clamp(1 - .9 * sl, .7, 1.12) : P.veh === 'walk' ? clamp(1 - 1.1 * sl, .6, 1.15) : eb && sl > 0 ? 1 : clamp(1 - 2.2 * sl, .5, 1.32);
    const kw = 1 - Math.exp(-dt / S.tw);
    if (dir.m > 0) {
      // giro con peso: la velocidad de giro deseada sigue al joystick, limitada por la velocidad (a toda marcha se abre la curva) y con inercia
      const ta = Math.atan2(dir.y, dir.x), da = angDiff(P.a, ta), wm = (S.w1 + (S.w0 - S.w1) * clamp(1 - P.v / S.max, 0, 1)) * (rain ? .85 : 1);
      P.w += (clamp(da * 6.5, -wm, wm) - P.w) * kw;
      // arranque gradual hasta la velocidad pedida; si el joystick apunta lejos del rumbo, se frena para girar
      const tv = S.max * mult * dir.m * (.3 + .7 * Math.max(0, Math.cos(da)));
      if (tv > P.v) P.v = Math.min(tv, P.v + Math.min(S.acc, (tv - P.v) * 2) * dt);
      else P.v = Math.max(tv, P.v - Math.min(S.brk * (rain ? .7 : 1), (P.v - tv) * 3.5 + 6) * dt);
    } else { P.w *= 1 - kw; P.v = Math.max(0, P.v - (S.coast * (rain ? .6 : 1) + P.v * .35) * dt); }   // al soltar: rueda y se detiene sola
    P.a += P.w * dt;
    const st = P.v * dt, nx = P.x + Math.cos(P.a) * st, ny = P.y + Math.sin(P.a) * st;
    if (!this.blocked(nx, ny, S.r)) { P.x = nx; P.y = ny; }
    else if (st > 0) {
      let moved = false; // asistencia de esquinas: prueba ángulos cercanos
      for (const da of [.35, -.35, .7, -.7, 1.1, -1.1]) {
        const ax = P.x + Math.cos(P.a + da) * st, ay = P.y + Math.sin(P.a + da) * st;
        if (!this.blocked(ax, ay, S.r)) { P.x = ax; P.y = ay; P.a += da * Math.min(1, dt * 7.5); P.v *= Math.exp(-3.2 * dt); P.w *= .5; moved = true; break; }
      }
      if (!moved) { const rz = Math.exp(-3.2 * dt); if (!this.blocked(nx, P.y, S.r)) { P.x = nx; P.v *= rz; } else if (!this.blocked(P.x, ny, S.r)) { P.y = ny; P.v *= rz; } else { P.v *= Math.exp(-40 * dt); P.w = 0; } }
    }
    P.x = clamp(P.x, 4, MW * TS - 4); P.y = clamp(P.y, 4, MH * TS - 4);
    // bajada fuerte a toda velocidad: hay que soltar un poco o la bici se desboca
    if (P.veh === 'bike' && sl < -.07 && P.v > S.max * 1.12 && P.stun <= 0) {
      this.over += dt; if (this.over > 1.2 && !this.overTold) { this.overTold = 1; this.float('¡Frena en la bajada!', PAL.amb); JE.ui && JE.ui.toast('⛰️ En las bajadas fuertes suelta un poco el dedo para frenar.'); }
      if (this.over > 3.2) { this.over = 0; P.stun = .5; P.v *= .3; this.stats.wobbles = (this.stats.wobbles || 0) + 1; this.float('¡Uy, casi!', PAL.cor); Snd.sfx('bad'); vib(40); }
    } else this.over = Math.max(0, this.over - dt * 1.5);
    this.stats.dist += st; const onC = this.tileAt() === TT.CICLO; if (onC) this.stats.ciclo += st;
    const ti = Math.floor(P.y / TS) * MW + Math.floor(P.x / TS), li = this.map.lightIdx(ti);
    if (li >= 0 && li !== this.lastLight && P.v > 6 * WK && this.mode.t > 2 && P.veh !== 'walk') {
      const ew = Math.abs(Math.cos(P.a)) > Math.abs(Math.sin(P.a)), LT = this.map.lights[li], s = this.map.lightState(LT, this.mode.t)[ew ? 0 : 1] === 'r' && this.map.lightState(LT, this.mode.t - .7)[ew ? 0 : 1] === 'r' ? 'r' : 'ok';
      if (s === 'r') { this.stats.reds++; this.float('¡En rojo!', PAL.cor); Snd.sfx('bad'); vib(40); if (this.mode.onRed) this.mode.onRed(); if (!this.redTold) { this.redTold = 1; JE.ui && JE.ui.toast('🚦 En rojo se espera: ¡respeta el semáforo!'); } }
    }
    this.lastLight = li;
    if (P.veh === 'bike') {
      if (onC && P.v > 20 * WK) { this.cicT += dt; this.offC = 0; } else if ((this.offC += dt) > .7) this.cicT = 0;
      const lv = this.cicT >= 15 ? 3 : this.cicT >= 8 ? 2 : this.cicT >= 4 ? 1 : 0;
      if (lv === 3 && !JE.headless) Save.data.flags.cic4 = 1;
      if (lv > this.cicLv) { this.float('¡Racha ciclorruta x' + (lv + 1) + '!', PAL.vd1); Snd.sfx('coin'); if (this.mode.onStreak) this.mode.onStreak(lv); }
      this.cicLv = lv;
      if (lv && P.v > 35 * WK && !JE.headless && this.rng.f() < .5) this.fx.push({ k: 'p', x: P.x - Math.cos(P.a) * 6 + (this.rng.f() - .5) * 4, y: P.y - Math.sin(P.a) * 6 + (this.rng.f() - .5) * 4, vx: -Math.cos(P.a) * 30, vy: -Math.sin(P.a) * 30, t: .3, col: lv > 1 ? '#ffffff' : PAL.vd1 });
    }
    this.updCars(dt); this.updTrains(dt); this.updLife(dt);
    // marcadores
    for (const m of this.markers.slice()) {
      const r = m.r + (P.veh === 'truck' ? 44 : 0), d = dist(P.x, P.y, m.x, m.y);
      if (d < r && !m.inside) { m.inside = true; if (m.enter) m.enter(m); }
      else if (d > r + 6 && m.inside) { m.inside = false; if (m.leave) m.leave(m); }
    }
    // hojas
    for (const l of this.leaves) if (!l.got && Math.abs(l.x - P.x) < 9 && Math.abs(l.y - P.y) < 9) { l.got = true; Snd.sfx('leaf'); this.leafK = this.mode.t - (this.leafT || -9) < 4 ? (this.leafK || 0) + 1 : 0; this.leafT = this.mode.t; Snd.note(this.leafK); this.float('+5', PAL.vd1); if (M.onLeaf) M.onLeaf(l); }
    // efectos
    if (this.stamp && !this.stamp.fan) { this.stamp.fan = 1; Snd.fanfare(); }
    if (this.stamp && (this.stamp.t -= dt) <= 0) this.stamp = null;
    for (const f of this.fx) { f.t -= dt; if (f.k === 'p') { f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= .9; f.vy *= .9; } else f.y -= 14 * dt; }
    this.fx = this.fx.filter(f => f.t > 0);
    if (rain && !JE.headless) { while (this.drops.length < 70) this.drops.push({ x: this.rng.f() * 400, y: this.rng.f() * 400, s: 160 + this.rng.f() * 80 }); for (const d of this.drops) { d.y += d.s * dt; d.x -= d.s * .2 * dt; if (d.y > 400) { d.y -= 400; d.x = this.rng.f() * 400; } if (d.x < 0) d.x += 400; } }
    // cámara centrada: poca anticipación (a lo sumo 1/6 de la vista) y suave
    this.camara(dt); this.shake = Math.max(0, this.shake - dt);
    // GPS
    this.gpsT -= dt; if (this.gpsT <= 0) { this.gpsT = .35; this.calcGps(); }
  }
  /* el próximo giro de la ruta GPS: {k: -1 izquierda, 1 derecha, 'llega' cerca del destino, m: metros}, o null si sigue derecho */
  giro() {
    const G = [{ x: this.p.x, y: this.p.y }].concat(this.gps), T = this.way || this.target; if (G.length < 4) return null;
    const dT = T ? dist(this.p.x, this.p.y, T.x, T.y) * M_PER_PX : 1e9; if (dT < 60) return { k: 'llega', m: Math.max(5, Math.round(dT / 5) * 5) };
    const a0 = Math.atan2(G[2].y - G[0].y, G[2].x - G[0].x); let acc = dist(G[0].x, G[0].y, G[1].x, G[1].y);
    for (let i = 2; i + 1 < G.length; i++) { const a = Math.atan2(G[i + 1].y - G[i - 1].y, G[i + 1].x - G[i - 1].x), da = angDiff(a0, a); acc += dist(G[i - 1].x, G[i - 1].y, G[i].x, G[i].y); const mm = acc * M_PER_PX; if (mm > 200) return null; if (Math.abs(da) > .7) return { k: da > 0 ? 1 : -1, m: Math.max(5, Math.round(mm / 5) * 5) }; }
    return null;
  }
  /* la cámara sigue al jugador casi centrada (anticipa a lo sumo 1/6 de la vista); en modo cámara libre se queda donde la dejaste */
  camara(dt) {
    const P = this.p, C = this.cam, L = this.libre; if (L && L.on) return;
    const la = P.veh === 'truck' ? .3 : .22, cap = Math.min(View.vw, View.vh) / 6, ax = Math.cos(P.a) * P.v * la, ay = Math.sin(P.a) * P.v * la, l = Math.hypot(ax, ay), q = l > cap ? cap / l : 1, k = 1 - Math.exp(-4.2 * dt);
    C.x += (P.x + ax * q - C.x) * k; C.y += (P.y + ay * q - C.y) * k;
  }
  calcGps() {
    this.gps = []; const T = this.way || this.target; if (!T) return;
    let c = { x: Math.floor(this.p.x / TS), y: Math.floor(this.p.y / TS) };
    const D = this.map.flow(Math.floor(T.x / TS), Math.floor(T.y / TS), this.p.veh === 'truck', c.x, c.y);
    if (this.map.fv(D, c.x, c.y) >= 1e9) { const n = this.map.nearestOpen(c.x, c.y, this.p.veh === 'truck'); c = n; }
    for (let i = 0; i < 90; i++) { const n = this.map.nextStep(D, c.x, c.y, i < 10 ? (this.p.lvl || 0) : 0); if (!n) break; c = n; if (i % 2 === 1) this.gps.push({ x: c.x * TS + TS / 2, y: c.y * TS + TS / 2 }); }
    this.flowD = D;
  }
  /* ---- tráfico: carros por las vías principales reales ---- */
  updCars(dt) {
    const P = this.p, R = 210 * WK, want = Math.round(20 * this.traffic * (this.mode.mods.pico ? 1.4 : 1)), M = this.map;
    this.spawnT -= dt;
    if (this.spawnT <= 0 && this.cars.length < want) {
      this.spawnT = .12; const near = M.lanesNear(this.cam.x, this.cam.y), L = near.length ? near[Math.floor(this.rng.f() * near.length)] : null;
      if (L && !(this.mode.mods.ciclovia && L.cv)) for (let k = 0; k < 4; k++) {
        const p = this.rng.f() * L.len, q = M.at(L, p, L.off);
        if (Math.abs(q.x - this.cam.x) > R || Math.abs(q.y - this.cam.y) > R || dist(q.x, q.y, P.x, P.y) < 70 * WK) continue;
        const c = { L, p, v: 0, spd: L.spd * this.rng.range(.8, 1.15), yield: 0, stop: 0, si: q.i }, r = this.rng.f();
        c.kind = L.spd > 30 && r < .1 ? 'bus' : r < .32 ? 'taxi' : 'car';
        c.col = c.kind === 'taxi' ? '#f5c400' : c.kind === 'bus' ? '#3f8f5a' : this.rng.pick(['#e9eef3', '#c43a26', '#2a5a92', '#1d1f24', '#9aa7b8', '#7a3b3b', '#3d6b3a', '#d98a3a']);
        this.carPos(c); this.cars.push(c); break;
      }
    }
    const pLvl = Math.sign(P.lvl || 0);
    for (const c of this.cars) {
      let v = c.spd * (this.mode.mods.rain ? .85 : 1); if (c.stop > 0) { c.stop -= dt; v = 0; } if (c.yield > 0) { c.yield -= dt; v *= .35; }
      const len = c.kind === 'bus' ? 30 : 14;
      for (const o of this.cars) { if (o === c || o.L !== c.L) continue; const ahead = (o.p - c.p) * c.L.dir; if (ahead > 0 && ahead < len + 4) v = Math.min(v, o.v * .9); }
      const LL = c.L.lights; if (LL.length) {
        const front = c.p + len / 2 * c.L.dir; let s = null;
        if (c.L.dir > 0) { for (const q of LL) if (q.p0 >= front - 1) { s = q; break; } } else { for (let k = LL.length - 1; k >= 0; k--) if (LL[k].p1 <= front + 1) { s = LL[k]; break; } }
        if (s) { const d = c.L.dir > 0 ? s.p0 - front : front - s.p1, st = M.lightState(s.g, this.mode.t)[s.ax]; if (d < 24 * WK && (st === 'r' || (st === 'a' && d > 6 * WK))) v = Math.min(v, Math.max(0, (d - 2) * 3)); }
      }
      const fx = Math.cos(c.ang), fy = Math.sin(c.ang), dx = P.x - c.x, dy = P.y - c.y, along = dx * fx + dy * fy, lat = Math.abs(-dx * fy + dy * fx);
      const pr = this.stats_().r, sameLvl = (c.nivel != null ? c.nivel : (c.arriba ? 1 : 0)) === pLvl;
      if (sameLvl && along > 0 && along < 28 + pr * 2 && lat < 5 + pr) { v = along < 16 + pr * 2 ? 0 : Math.min(v, 6 * WK); if (this.honkT <= 0 && P.v > 2 && dist(P.x, P.y, c.x, c.y) < 60 * WK) { this.honkT = 2.5; Snd.sfx('honk'); } }
      c.v = v; c.p += v * c.L.dir * dt; this.carPos(c);
      // choque con el jugador (solo si van en el mismo nivel vertical: suelo, puente o deprimido)
      if (c.ghost > 0) c.ghost -= dt; else if (sameLvl && Math.abs(along) < ({ bus: 13, camion: 11, moto: 3 }[c.kind] || 6) + pr && lat < (c.kind === 'moto' ? 1.5 : 3) + pr && P.stun <= 0 && !(this.inv > 0)) this.crash(c);
    }
    this.honkT -= dt;
    this.cars = this.cars.filter(c => c.p > -12 && c.p < c.L.len + 12 && dist(c.x, c.y, this.cam.x, this.cam.y) < R * 1.5);
  }
  carPos(c) { const q = this.map.at(c.L, c.p, c.L.off, c.si); c.si = q.i; c.x = q.x; c.y = q.y; c.ang = c.L.dir > 0 ? q.a : q.a + Math.PI; }
  crash(c) {
    const P = this.p;
    c.ghost = 2.5; this.inv = 1.4;
    if (this.mode.has('chaleco') && !this.vestUsed) { this.vestUsed = true; this.float('¡Chaleco!', PAL.amb); return; }
    const a = Math.atan2(P.y - c.y, P.x - c.x); let nx = P.x + Math.cos(a) * 9 * WK, ny = P.y + Math.sin(a) * 9 * WK;
    if (!this.blocked(nx, ny, this.stats_().r)) { P.x = nx; P.y = ny; }
    P.v = 0; P.stun = .6; c.stop = .5; this.stats.crashes++; this.shake = .35; Snd.sfx('bad'); vib(60);
    this.float('¡Cuidado!', PAL.cor); this.burst(P.x, P.y, '#ffffff', 6);
    if (this.mode.onCrash) this.mode.onCrash();
  }
  metroOn() { const M = this.mode; if (M.clock == null) return true; const m = ((M.clock | 0) % 1440 + 1440) % 1440, h = Cal.metro(M.fecha || Cal.now()); return m >= h.abre && m < h.cierra; }   // fuera de horario los trenes duermen
  updTrains(dt) {
    if (!this.metroOn()) return;
    for (const t of this.trains) {
      if (t.wait > 0) { t.wait -= dt; continue; }
      const prev = t.s, half = typeof SIS !== 'undefined' ? SIS.metro.n * (SIS.metro.carL + 1) * PXM / 2 : 0; t.s += 70 * WK * t.dir * dt;   // el tren (3 vagones de El Metro) para centrado en el andén
      for (const st of t.L.st) { const sp = st.s + t.dir * half; if ((prev - sp) * (t.s - sp) < 0) { t.wait = 1.4; t.s = sp; } }
      if (t.s > t.L.len) { t.s = Math.max(0, t.L.len - half * 2); t.dir = -1; t.wait = 2; } if (t.s < 0) { t.s = Math.min(t.L.len, half * 2); t.dir = 1; t.wait = 2; }   // al dar la vuelta, el frente pasa a la otra punta sin saltar
    }
  }

  /* ---- dibujo en el búfer pixelado: suelo y cosas quietas. La cámara es continua: el búfer se corre por fracciones de pixel ---- */
  render(V, min) {
    const b = V.b, P = this.p, sk = this.shake > 0; b.setTransform(V.q || 1, 0, 0, V.q || 1, 0, 0);
    // centro de la vista y origen del dibujo; con la cámara girada el suelo se dibuja en un cuadrado de lado G que la cubre en cualquier ángulo
    const G = V.giro ? V.gw : 0, hw = G ? G / 2 : V.vw / 2, hh = G ? G / 2 : V.vh / 2;
    const ccx = clamp(this.cam.x, V.vw / 2 - 40, MW * TS - V.vw / 2 + 40) + (sk ? (this.rng.f() - .5) * 4 : 0), ccy = clamp(this.cam.y, V.vh / 2 - 40, MH * TS - V.vh / 2 + 40) + (sk ? (this.rng.f() - .5) * 4 : 0);
    const cxf = ccx - hw, cyf = ccy - hh; this.ccx = ccx; this.ccy = ccy; this.piv = { x: V.vw / 2, y: V.vh / 2, G };
    const ox = Math.floor(cxf), oy = Math.floor(cyf); this.ox = ox; this.oy = oy; this.cxf = cxf; this.cyf = cyf; V.subX = cxf - ox; V.subY = cyf - oy; this.min = min;
    const S = CH * TS, BW = (G || V.vw) + 1, BH = (G || V.vh) + 1;
    b.fillStyle = '#2f6b3a'; b.fillRect(0, 0, BW, BH);
    let made = 0;
    for (let cy = Math.floor(oy / S); cy <= Math.floor((oy + BH) / S); cy++) for (let cx = Math.floor(ox / S); cx <= Math.floor((ox + BW) / S); cx++) {
      if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) continue;
      if (!this.map.hasG(cx, cy)) { if (made && this.dibujado) { b.fillStyle = '#cfc9bc'; b.fillRect(cx * S - ox, cy * S - oy, S, S); made++; continue; } made++; }   // a lo sumo un trozo nuevo por cuadro (sin tirones); el resto llega en los cuadros siguientes
      b.drawImage(this.map.chunkG(cx, cy), cx * S - ox, cy * S - oy, S, S);
    }
    this.dibujado = true;
    if (!made) { // precalienta un bloque vecino en la dirección de avance
      const cx = Math.floor(P.x / S) + Math.round(Math.cos(P.a) * 1.4), cy = Math.floor(P.y / S) + Math.round(Math.sin(P.a) * 1.4);
      if (cx >= 0 && cy >= 0 && cx * CH < MW && cy * CH < MH && !this.map.hasG(cx, cy)) this.map.chunkG(cx, cy);
    }
    const inV = (x, y, m = 20) => x > ox - m && x < ox + BW + m && y > oy - m && y < oy + BH + m;
    // estaciones con sus bicis
    const t = performance.now() / 1000;
    for (const s of this.map.stations) {
      if (!inV(s.x, s.y, 30)) continue;
      const ss = this.sim ? this.sim.st[s.i] : null, bikes = ss ? ss.bikes : Math.round(s.cap * .55), x0 = s.v ? -2 * TS : s.tx * TS - ox, y0 = s.v ? -TS : s.ty * TS - oy;
      if (s.v) { b.save(); b.translate(s.x - ox, s.y - oy); b.rotate(Math.PI / 2); }   // estación de pie: el mismo dibujo, girado
      if (GFX() === '3d') { estacion3(b, s, x0, y0, bikes, t, ss, !stOk(s), s.e ? [(this.mode.clock | 0) < E_HASTA, s.e === 'solo' && (this.mode.clock | 0) >= E_CIERRE] : null); if (s.v) b.restore(); continue; }   // dibujo suave en la ciudad 3D
      const W = 4 * TS, H = 2 * TS;
      prect(b, x0 + 3, y0 + 14, W - 16, 3, PAL.vd2); prect(b, x0 + 3, y0 + 14, W - 16, 1, PAL.vd1);
      const per = Math.ceil(s.cap / 2), sp = Math.min(5, (W - 18) / per);
      for (let k = 0; k < s.cap; k++) { const row = k < per ? 0 : 1, bx = x0 + 4 + (k % per) * sp, by = y0 + (row ? 19 : 4); prect(b, Math.round(bx) + 1, row ? y0 + 17 : y0 + 12, 1, 2, '#59606c'); if (k < bikes) b.drawImage(Art.bikeTop(), Math.round(bx), by); else prect(b, Math.round(bx) + 1, by + 4, 1, 2, '#9aa7b8'); }
      if (s.type === 'm') { prect(b, x0 + W - 12, y0 + 5, 9, 14, '#1d2c44'); prect(b, x0 + W - 12, y0 + 4, 9, 2, '#e9eef3'); prect(b, x0 + W - 10, y0 + 9, 5, 3, '#9fb8cf'); prect(b, x0 + W - 12, y0 + 19, 9, 2, PAL.vd); }
      else { prect(b, x0 + W - 10, y0 + 6, 5, 13, '#2b2f38'); prect(b, x0 + W - 9, y0 + 8, 3, 3, (t * 2 | 0) % 2 ? PAL.vd : PAL.vd1); prect(b, x0 + W - 9, y0 + 13, 3, 1, '#9aa7b8'); }
      if (!stOk(s)) { b.fillStyle = '#0a234299'; b.fillRect(x0, y0, W, H); }
      if (s.e) { const on = (this.mode.clock | 0) < E_HASTA; prect(b, x0 + W - 14, y0 + 1, 3, 4, on ? '#ffd84a' : '#8a8a8a'); prect(b, x0 + W - 13, y0 + 3, 1, 3, on ? '#ffd84a' : '#8a8a8a'); if (s.e === 'solo' && (this.mode.clock | 0) >= E_CIERRE) { b.fillStyle = '#0a234299'; b.fillRect(x0, y0, W, 8); } }
      if (ss && ss.broken) { if ((t * 3 | 0) % 2) { pline(b, x0 + 12, y0 + 4, x0 + 30, y0 + 28, PAL.cor); pline(b, x0 + 30, y0 + 4, x0 + 12, y0 + 28, PAL.cor); } }
      if (ss && !ss.open) { b.fillStyle = '#0a234299'; b.fillRect(x0, y0, W, H); }
      if (s.v) b.restore();
    }
    if (this.mode.free && JE.placas) JE.placas.dibujar(b, ox, oy, inV);   // placas de lo poco conocido
    // ruta GPS
    const ph = (t * 4) | 0;
    const gc = (this.way || this.target || {}).col || PAL.amb;
    if (GFX() === '3d' && this.gps.length > 1) {   // en 3D: flechitas suaves en el piso que señalan hacia dónde seguir; se desvanecen con la distancia (v1.7.1)
      const G = chaikin([{ x: this.p.x, y: this.p.y }].concat(this.gps), 3), step = 13, maxD = 230, fl = (t * 14) % step; let acc = 0, d = 10 + step - fl;
      b.lineCap = 'round'; b.lineJoin = 'round';
      const flecha = (x, y, a, al) => { const ca = Math.cos(a), sa = Math.sin(a), P = (u, v) => [x - ox + u * ca - v * sa, y - oy + u * sa + v * ca], A = P(-2.2, -2.6), B = P(1.6, 0), C = P(-2.2, 2.6);
        b.globalAlpha = al * .5; b.strokeStyle = '#0a2342'; b.lineWidth = 2.6; b.beginPath(); b.moveTo(A[0], A[1]); b.lineTo(B[0], B[1]); b.lineTo(C[0], C[1]); b.stroke();
        b.globalAlpha = al; b.strokeStyle = '#ffffff'; b.lineWidth = 1.25; b.stroke(); };
      for (let k = 1; k < G.length && d < maxD; k++) {
        const a0 = G[k - 1], a1 = G[k], L = Math.hypot(a1.x - a0.x, a1.y - a0.y); if (L < .01) continue; const an = Math.atan2(a1.y - a0.y, a1.x - a0.x);
        while (d < acc + L && d < maxD) { const u = (d - acc) / L, x = a0.x + (a1.x - a0.x) * u, y = a0.y + (a1.y - a0.y) * u; if (inV(x, y, 6)) flecha(x, y, an, clamp(1 - d / maxD, 0, 1) * clamp((d - 6) / 18, 0, 1) * .85); d += step; }
        acc += L;
      }
      b.globalAlpha = 1;
    } else this.gps.forEach((g, i) => { if (!inV(g.x, g.y)) return; const c = (i + ph) % 3 === 0 ? '#ffffff' : gc; b.globalAlpha = .75; prect(b, g.x - ox - 2, g.y - oy - 2, 4, 4, '#0a2342'); prect(b, g.x - ox - 1, g.y - oy - 1, 2, 2, c); b.globalAlpha = 1; });   // pixel: puntos pequeños
    // marcadores (aros que laten)
    for (const m of this.markers) {
      if (!inV(m.x, m.y, 40)) continue; const pr = m.r * .7 + Math.sin(t * 5) * 2, col = m.col || PAL.amb;
      if (GFX() === '3d') {   // baliza tenue: zona apenas sombreada, un aro fino y, en el destino, un punto con una onda que se abre
        const x = m.x - ox, y = m.y - oy, r0 = m.r * .62; b.globalAlpha = .13; b.fillStyle = col; b.beginPath(); b.arc(x, y, r0, 0, TAU); b.fill();
        b.globalAlpha = .55; b.strokeStyle = col; b.lineWidth = .8; b.beginPath(); b.arc(x, y, r0 + Math.sin(t * 2.4) * .8, 0, TAU); b.stroke();
        if (m === this.target) { const w = (t * .8) % 1; b.globalAlpha = .5 * (1 - w); b.lineWidth = .9; b.beginPath(); b.arc(x, y, 2 + w * r0 * .8, 0, TAU); b.stroke(); b.globalAlpha = .9; b.fillStyle = '#ffffff'; b.beginPath(); b.arc(x, y, 1.9, 0, TAU); b.fill(); b.strokeStyle = col; b.lineWidth = .9; b.stroke(); }
        b.globalAlpha = 1; continue;
      }
      pring(b, m.x - ox, m.y - oy, Math.round(pr), col); pring(b, m.x - ox, m.y - oy, Math.round(pr) + 1, '#0a234288'); if (m === this.target) pring(b, m.x - ox, m.y - oy, Math.round(pr * .6), '#fff');
    }
    // hojas
    for (const l of this.leaves) if (!l.got && inV(l.x, l.y)) { const bob = Math.sin(t * 4 + l.x) * 1; b.drawImage(Art.icon('hoja'), 0, 0, 16, 16, Math.round(l.x - ox - 5), Math.round(l.y - oy - 5 + bob), 10, 10); }
    // ciclovía: conos en las avenidas cerradas a los carros
    if (this.mode.mods.ciclovia) for (const ln of this.map.lanesNear(this.cam.x, this.cam.y)) { if (!ln.cv || ln.dir < 0) continue; for (let s = 0; s < ln.len; s += 40 * WK) { const q = this.map.at(ln, s); if (!inV(q.x, q.y)) continue; if (GFX() === '3d') { b.fillStyle = '#ff8a3d'; b.beginPath(); b.moveTo(q.x - ox - 1.8, q.y - oy + 1.6); b.lineTo(q.x - ox + 1.8, q.y - oy + 1.6); b.lineTo(q.x - ox, q.y - oy - 2.2); b.closePath(); b.fill(); b.fillStyle = '#ffffff'; b.fillRect(q.x - ox - .9, q.y - oy - .3, 1.8, .7); continue; } prect(b, q.x - ox - 1, q.y - oy, 3, 3, '#ff8a3d'); prect(b, q.x - ox, q.y - oy - 1, 1, 1, '#ffffff'); } }
    // semáforos
    const LC = CB() ? { g: '#35b8ff', a: '#ffc93c', r: '#ff3fa4' } : { g: '#4cff6a', a: '#ffc93c', r: '#ff4b3a' };
    for (const L of this.map.lights) {
      if (!inV(L.x, L.y, 30)) continue; const s = this.map.lightState(L, this.mode.t);
      const lamp = GFX() === '3d' ? (x, y, k) => { b.fillStyle = '#11151d'; b.beginPath(); b.roundRect(x - ox - .2, y - oy - .2, 4.4, 4.4, 1.4); b.fill(); b.fillStyle = LC[k]; b.beginPath(); b.arc(x - ox + 2, y - oy + 2, 1.25, 0, TAU); b.fill(); } : (x, y, k) => { prect(b, x - ox, y - oy, 4, 4, '#11151d'); prect(b, x - ox + 1, y - oy + 1, 2, 2, LC[k]); };   /* en 3D: caja redondeada y luz redonda */
      lamp(L.x0 - 3, L.y0 - 3, s[0]); lamp(L.x1, L.y1, s[0]); lamp(L.x1, L.y0 - 3, s[1]); lamp(L.x0 - 3, L.y1, s[1]);
    }
  }
  /* ---- capa de objetos que se mueven: se dibujan a resolución de pantalla (giran suave, sin temblar) ---- */
  renderTop(V) {
    const G = V.giro ? V.gw : 0, sw = V.vw, sh = V.vh; if (G) { V.vw = V.vh = G; }   // girada: las capas recortan contra el cuadrado que cubre la vista
    try { this.renderTop0(V, sw, sh); } finally { V.vw = sw; V.vh = sh; }
  }
  renderTop0(V, sw, sh) {
    const c = V.ctx, k = V.s * V.dpr, ox = this.cxf, oy = this.cyf, P = this.p, vw = V.vw + 2, vh = V.vh + 2, d3 = GFX() === '3d';
    const inV = (x, y, m = 20) => x > ox - m && x < ox + vw + m && y > oy - m && y < oy + vh + m;
    const spr = (img, x, y, a, sh) => { c.save(); c.translate(x - ox, y - oy); c.rotate(a + Math.PI / 2); blit(c, img, sh); c.restore(); };
    c.save(); this.mundo(c); c.imageSmoothingEnabled = false;
    this.drawGround(c, ox, oy, inV);
    for (const cr of this.cars) if (!cr.arriba && inV(cr.x, cr.y)) spr(Art.carTop(cr.col, cr.kind), cr.x, cr.y, cr.ang, '#0004');
    for (const o of this.opps) if (inV(o.x, o.y)) { c.globalAlpha = .9; spr(Art.riderTop(o.shirt || PAL.cor, '#ffffff', o.skin || SKINS[2]), o.x, o.y, o.a); c.globalAlpha = 1; }
    const sp = P.veh === 'truck' ? Art.truckTop(P.load, P.cap) : P.veh === 'walk' ? Art.walker((this.stepT | 0) % 2) : Art.rider(this.mode.shirt), abajo = !d3 || !(P.lvl > 0);
    // en la ciudad 3D el jugador va debajo de lo que está en alto (viaducto, estaciones, puentes); en un puente va encima
    if (d3) this.drawTrenesSuelo(c, ox, oy, inV, spr);   // trenes a nivel del suelo (los del viaducto van con su pieza en draw3D)
    if (abajo) spr(sp, P.x, P.y, P.a, '#0005');
    this.draw3D(c, ox, oy, vw, vh);
    if (d3) this.drawArriba(c, ox, oy, inV, spr, sp);
    else { const tc = Art.trainCar(); if (this.metroOn()) for (const tr of this.trains) for (let j = -1; j <= 1; j++) { const s = tr.s + j * 17; if (s < 0 || s > tr.L.len) continue; const q = this.map.at(tr.L, s); if (inV(q.x, q.y)) spr(tc, q.x, q.y, q.a); } }   // pixel: trenes sobre el viaducto plano
    if (d3 && abajo) { c.globalAlpha = .42; spr(sp, P.x, P.y, P.a); c.globalAlpha = 1; }   // si algo lo tapa (viaducto, puente, edificio con la cámara inclinada), se ve su silueta
    this.drawSky(c, ox, oy);
    for (const f of this.fx) if (f.k === 'p') { c.fillStyle = f.col; c.fillRect(f.x - ox, f.y - oy, 1, 1); }
    c.restore();
    // pantalla completa: lluvia, noche y luces
    c.save(); c.setTransform(k, 0, 0, k, 0, 0); const fw = sw + 2, fh = sh + 2;
    if (this.mode.mods.rain) { c.fillStyle = '#cfe8ff88'; for (const d of this.drops) c.fillRect(d.x * fw / 400, d.y * fh / 400, .6, 3); c.fillStyle = '#0a234222'; c.fillRect(0, 0, fw, fh); }
    const n = Art.night(this.min); if (n > 0) { c.fillStyle = 'rgba(8,18,52,' + (n * .5).toFixed(3) + ')'; c.fillRect(0, 0, fw, fh); }
    this.mundo(c); this.drawGlow(c, ox, oy, inV, n);
    c.restore();
  }
  /* transformación del mundo en la capa nítida: escala y, si la cámara está girada, giro alrededor del centro de la vista */
  mundo(c) {
    const V = View, k = V.s * V.dpr, q = this.piv; c.setTransform(k, 0, 0, k, 0, 0);
    if (V.giro && q && q.G) { c.translate(q.x, q.y); c.rotate(-V.rot); c.translate(-q.G / 2, -q.G / 2); }
  }
  /* de un punto del mundo a la pantalla (px CSS), con el giro de la cámara */
  w2s(x, y) {
    const V = View, s = V.s, q = this.piv;
    if (!(V.giro && q && q.G)) return { x: (x - this.cxf) * s, y: (y - this.cyf) * s };
    const dx = x - this.cxf - q.G / 2, dy = y - this.cyf - q.G / 2, c = Math.cos(V.rot), n = Math.sin(V.rot);
    return { x: (q.x + dx * c + dy * n) * s, y: (q.y - dx * n + dy * c) * s };
  }
  /* de la pantalla al mundo (px CSS → px del mundo) */
  s2w(X, Y) {
    const V = View, s = V.s, q = this.piv; if (!(V.giro && q && q.G)) return { x: X / s + this.cxf, y: Y / s + this.cyf };
    const ex = X / s - q.x, ey = Y / s - q.y, c = Math.cos(V.rot), n = Math.sin(V.rot);
    return { x: this.cxf + q.G / 2 + ex * c - ey * n, y: this.cyf + q.G / 2 + ex * n + ey * c };
  }
  /* el joystick y las flechas van según la pantalla: con la cámara girada se giran al mundo */
  girarDir(d) { const r = View.giro ? View.rot : 0; if (!r || !d || !d.m) return d; const c = Math.cos(r), n = Math.sin(r); return { x: d.x * c - d.y * n, y: d.x * n + d.y * c, m: d.m }; }
  /* punto de vista de la perspectiva (el "nadir" de la cámara): sobre el jugador, o sobre el centro en la cámara libre; con la cámara inclinada se corre hacia abajo de la pantalla */
  ojo() {
    const L = this.libre, b = L && L.on ? this.cam : this.p, t = panoOn(this) ? 0 : (this.til || 0);
    if (t < .005) return { x: b.x, y: b.y, K: .36 };
    const K = .36 * (1 - .3 * t), D = 43.2 * Math.tan(t * .96) / K, r = View.giro ? View.rot : 0;   // t = 1: unos 55° desde la vertical
    return { x: b.x - Math.sin(r) * D, y: b.y + Math.cos(r) * D, K };
  }
  /* ---- capa nítida: etiquetas, flecha, minimapa, joystick ---- */
  hud(V, opts = {}) {
    const c = V.ctx, s = V.s, ox = this.cxf, oy = this.cyf, P = this.p;
    { const w = Math.round(Math.min(84, V.w * .21)); this.mmRect = opts.noMini ? null : { x: V.w - w - 10, y: (View.hudB || 50) + 8, w, h: Math.round(w * 1.55) }; }
    const sx = x => (x - ox) * s, sy = y => (y - oy) * s, W = (x, y) => this.w2s(x, y);   // W: con el giro de la cámara (sx/sy solo valen sin giro)
    const used = this.lblR = [], top = View.top || 60, mm = this.mmRect, bot = V.h - 70 - (this.mode.coachB || 0);
    const room = (x, y, w, h) => { if (y - h < top || y > bot || x - w / 2 < 4 || x + w / 2 > V.w - 4) return false; if (mm && x + w / 2 > mm.x - 8 && y - h < mm.y + mm.h + 20) return false; for (const r of used) if (Math.abs(r.x - x) < (r.w + w) / 2 + 3 && Math.abs(r.y - y) < (r.h + h) / 2 + 2) return false; used.push({ x, y, w, h }); return true; };
    this.lblRoom = room;
    const lab = [];
    for (const st of this.map.stations) { const q = W(st.x, st.y), x = q.x, y = q.y - 16 * WK * s / 2; if (x > -60 && x < V.w + 60 && y > 40 && y < V.h) lab.push({ t: st.name, x, y, d: dist(st.x, st.y, P.x, P.y), st: 1 }); }
    for (const L of LANDMARKS) { if (L.secret) continue; const q = W((L.x + L.w / 2) * TS, (L.y + L.h / 2) * TS), x = q.x, y = q.y; if (x > -80 && x < V.w + 80 && y > 40 && y < V.h) lab.push({ t: L.name, x, y, d: dist((L.x + L.w / 2) * TS, (L.y + L.h / 2) * TS, P.x, P.y) }); }
    lab.sort((a, b) => a.d - b.d);
    for (const l of lab.slice(0, 10)) { const sz = l.st ? 11 : 12, w = l.t.length * sz * .52 + 8; if (!room(l.x, l.y, w, sz + 6)) continue; V.text(l.t, l.x, l.y, l.st ? { size: sz, align: 'center', bg: '#0a2342dd', color: '#c4ec7c', pad: 3 } : { size: sz, align: 'center', stroke: '#0a2342', sw: 4, color: '#fff' }); }
    for (const o of this.opps) { const q = W(o.x, o.y), x = q.x, y = q.y - 14; if (x > 0 && x < V.w && y > 0 && y < V.h && room(x, y, o.name.length * 6 + 6, 16)) V.text(o.name, x, y, { size: 11, align: 'center', color: '#fff', bg: o.shirt || PAL.cor, pad: 2 }); }
    if (this.stamp) { const k = this.stamp, a = Math.min(1, k.t * 3, (1.8 - k.t) * 8 + .2); c.save(); c.globalAlpha = clamp(a, 0, 1); c.translate(V.w / 2, V.h * .38); c.rotate(-.08); const w = Math.min(V.w - 40, 330); c.fillStyle = '#0008'; c.fillRect(-w / 2 + 6, -38, w, 82); c.fillStyle = k.bg || PAL.amb; c.fillRect(-w / 2, -44, w, 82); c.strokeStyle = PAL.az; c.lineWidth = 4; c.strokeRect(-w / 2 + 2, -42, w - 4, 78); V.text(k.title, 0, -8, { size: 30, align: 'center', color: PAL.az }); V.text(k.sub || '', 0, 20, { size: 15, align: 'center', color: PAL.az, body: true }); c.restore(); }
    this.hudLife(V, sx, sy, W);
    // subida / bajada: aviso sobre el ciclista
    const pct = Math.round(this.sl * 100); if (Math.abs(pct) >= 3 && !this.big) { const up = pct > 0, eb = up && this.ebike && P.veh === 'bike'; V.text((up ? '▲ SUBIDA ' : '▼ BAJADA ') + Math.abs(pct) + ' %' + (eb ? ' ⚡' : ''), W(P.x, P.y).x, W(P.x, P.y).y - 34, { size: 12, align: 'center', color: up ? '#0a2342' : '#fff', bg: up ? '#f4efe1' : (this.over > 1 ? '#c0392b' : '#e0533f'), pad: 3, border: '#0a2342' }); }
    for (const f of this.fx) if (f.k === 't') { const q = W(f.x, f.y); V.text(f.txt, q.x, q.y, { size: 16, align: 'center', stroke: '#0a2342', sw: 4, color: f.col }); }
    for (const m of this.markers) if (m.label && m.num) { const q = W(m.x, m.y), x = q.x, y = q.y; if (x > 0 && x < V.w && y > 0 && y < V.h) V.text(String(m.num), x, y + 5, { size: 14, align: 'center', stroke: '#0a2342', sw: 4, color: m.col || PAL.amb }); }
    // flecha al objetivo
    const T = this.way || this.target;
    if (T) {
      const tq = W(T.x, T.y), tx = tq.x, ty = tq.y, d = dist(P.x, P.y, T.x, T.y) * M_PER_PX, L = 30, Rr = V.w - 30 - (V.w > 600 ? 0 : 0), Tt = Math.min(160, V.h * .3), B = V.h - 110;
      if (tx < L || tx > Rr || ty < 60 || ty > V.h - 70) {
        const cx = (L + Rr) / 2, cy = (Tt + B) / 2, dx = tx - cx, dy = ty - cy, a = Math.atan2(dy, dx);
        const k = Math.min(dx > 0 ? (Rr - cx) / dx : dx < 0 ? (L - cx) / dx : 1e9, dy > 0 ? (B - cy) / dy : dy < 0 ? (Tt - cy) / dy : 1e9);
        const ax = cx + dx * k, ay = cy + dy * k;
        c.save(); c.globalAlpha = .82; c.translate(ax, ay); c.rotate(a); c.scale(.85, .85); c.fillStyle = T.col || PAL.amb; c.strokeStyle = '#0a2342'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(14, 0); c.lineTo(-7, -9); c.lineTo(-2.5, 0); c.lineTo(-7, 9); c.closePath(); c.stroke(); c.fill(); c.restore();
        V.text(d >= 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d / 10) * 10 + ' m', ax - Math.cos(a) * 21, ay - Math.sin(a) * 21 + 4, { size: 11, align: 'center', color: '#fff', stroke: '#0a2342', sw: 3 });
      }
    }
    // próximo giro: un aviso pequeño y translúcido, abajo al centro (solo si hay un giro cerca)
    if (T && !this.big && this.gps.length > 3) { const g = this.giro(); if (g) { const tx2 = V.w / 2, ty2 = V.h - 118, txt = g.k === 'llega' ? '◎ ' + g.m + ' m' : (g.k < 0 ? '↰ ' : '↱ ') + g.m + ' m'; c.save(); c.globalAlpha = .78; V.text(txt, tx2, ty2, { size: 13, align: 'center', color: '#fff', bg: '#0a2342bb', pad: 4, body: true }); c.restore(); } }
    // minimapa
    if (!opts.noMini) {
      // radar: ventana del mapa alrededor del jugador (el valle completo se ve tocándolo)
      const w = Math.round(Math.min(84, V.w * .21)), h = Math.round(w * 1.55), x = V.w - w - 10, y = (View.hudB || 50) + 8, WT = 160 * MS, HT = Math.round(WT * h / w), MK = this.map.miniK;
      const t0x = clamp(P.x / TS - WT / 2, 0, MW - WT), t0y = clamp(P.y / TS - HT / 2, 0, MH - HT), k = w / (WT * TS), ox0 = t0x * TS, oy0 = t0y * TS;
      this.mmRect = { x, y, w, h };
      c.fillStyle = '#0a2342'; c.fillRect(x - 3, y - 3, w + 6, h + 6); c.imageSmoothingEnabled = false; c.drawImage(this.map.mini, t0x / MK, t0y / MK, WT / MK, HT / MK, x, y, w, h);
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(x - 1, y - 1, w + 2, h + 2);
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      const MX = px => x + (px - ox0) * k, MY = py => y + (py - oy0) * k;
      if (this.sim) for (const st of this.sim.st) { c.fillStyle = this.sim.ratioCol(st); c.fillRect(MX(st.x) - 1.5, MY(st.y) - 1.5, 3, 3); }
      else { c.fillStyle = '#fff'; for (const st of this.map.stations) c.fillRect(MX(st.x) - 1, MY(st.y) - 1, 2, 2); }
      const blink = (performance.now() / 300 | 0) % 2;
      for (const o of this.opps) { c.fillStyle = o.shirt || PAL.cor; c.fillRect(MX(o.x) - 2.5, MY(o.y) - 2.5, 5, 5); }
      for (const m of this.markers) { c.fillStyle = m.col || PAL.amb; const r = m === T ? (blink ? 4 : 3) : 2.5; c.fillRect(clamp(MX(m.x), x + 2, x + w - 2) - r, clamp(MY(m.y), y + 2, y + h - 2) - r, r * 2, r * 2); }
      c.fillStyle = '#ff2fb3'; c.beginPath(); c.arc(MX(P.x), MY(P.y), 3, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1; c.stroke();
      c.restore();
      V.text('MAPA', x + w / 2, y + h + 14, { size: 11, align: 'center', color: '#c4ec7c', bg: '#0a2342cc', pad: 2 });
    }
    // controles (flechas o joystick fijo) y joystick
    if (!this.big) Ctrl.draw(V);
    const j = Input.joy; if (j.on) { c.globalAlpha = .55; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(j.ox, j.oy, 46, 0, TAU); c.stroke(); const dx = j.x - j.ox, dy = j.y - j.oy, l = Math.hypot(dx, dy), k2 = l > 46 ? 46 / l : 1; c.fillStyle = PAL.vd; c.beginPath(); c.arc(j.ox + dx * k2, j.oy + dy * k2, 20, 0, TAU); c.fill(); c.globalAlpha = 1; }
    if (this.big) { if (!MapView.open) MapView.show(this); MapView.draw(V); } else if (MapView.open && MapView.ride === this) MapView.hide();
  }
  inMini(x, y) { const r = this.mmRect; return r && x > r.x - 8 && x < r.x + r.w + 8 && y > r.y - 8 && y < r.y + r.h + 24; }
}

/* vista general de todo el valle (Monitoreo y mapa grande) */
function drawOverview(V, o) {
  const c = V.ctx, top = o.top != null ? o.top : 54, bot = o.bot != null ? o.bot : 10, avail = V.h - top - bot;
  // recorte opcional (Monitoreo por zona): o.crop = {x0, y0, x1, y1} en px del mundo
  const cr = o.crop || { x0: 0, y0: 0, x1: MW * TS, y1: MH * TS }, cw = cr.x1 - cr.x0, chh = cr.y1 - cr.y0;
  const k = Math.min((V.w - 16) / cw, avail / chh), w = cw * k, h = chh * k, x = (V.w - w) / 2, y = top + (avail - h) / 2;
  o.rect = { x: x - cr.x0 * k, y: y - cr.y0 * k, k, w, h };
  if (!o.noBg) { c.fillStyle = '#0a2342f2'; c.fillRect(0, 0, V.w, V.h); }
  const MK = JE.map.miniK; c.imageSmoothingEnabled = k * TS < 3; c.drawImage(JE.map.mini, cr.x0 / TS / MK, cr.y0 / TS / MK, cw / TS / MK, chh / TS / MK, x, y, w, h); c.imageSmoothingEnabled = false; c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
  const X = px => x + (px - cr.x0) * k, Y = py => y + (py - cr.y0) * k;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  if (o.title) V.text(o.title, V.w / 2, top - 8, { size: 15, align: 'center', color: '#c4ec7c' });
  const lbl = k * TS > 2.4;
  for (const L of LANDMARKS) if (lbl && L.id !== 'depot' && !L.secret) V.text(L.name.split(' · ')[0], X((L.x + L.w / 2) * TS), Y((L.y + L.h / 2) * TS), { size: 9, align: 'center', color: '#ffffffcc', stroke: '#0a2342', sw: 3 });
  const st = o.stations || (o.sim ? o.sim.st : JE.map.stations), rr = Math.max(4, Math.min(11, k * 26));
  for (const s of st) {
    const sx = X(s.x), sy = Y(s.y);
    if (o.sim) {
      const r = s.bikes / s.cap; c.fillStyle = '#0a2342'; c.beginPath(); c.arc(sx, sy, rr + 2, 0, TAU); c.fill();
      c.strokeStyle = '#ffffff33'; c.lineWidth = 3; c.beginPath(); c.arc(sx, sy, rr, 0, TAU); c.stroke();
      c.strokeStyle = o.sim.ratioCol(s); c.beginPath(); c.arc(sx, sy, rr, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(r, .02, 1)); c.stroke();
      if (o.sel === s) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(sx - rr - 4, sy - rr - 4, rr * 2 + 8, rr * 2 + 8); }
      if (rr >= 6) V.text(String(s.bikes), sx, sy + 4, { size: 10, align: 'center', color: '#fff' });
      if (s.broken) V.text('⚠', sx + rr, sy - rr, { size: 12, color: PAL.cor, body: true });
    } else { c.fillStyle = '#fff'; c.fillRect(sx - 2, sy - 2, 4, 4); }
  }
  const dp = o.base || JE.map.depot; c.fillStyle = PAL.cie; c.fillRect(X(dp.x) - 5, Y(dp.y) - 5, 10, 10); V.text(o.base ? 'BASE' : 'BODEGA', X(dp.x), Y(dp.y) + 16, { size: 10, align: 'center', color: PAL.cie, stroke: '#0a2342', sw: 3 });
  if (o.markers) for (const m of o.markers) { c.fillStyle = m.col || PAL.amb; c.beginPath(); c.arc(X(m.x), Y(m.y), m === o.target ? 6 : 4, 0, TAU); c.fill(); if (m.num) V.text(String(m.num), X(m.x), Y(m.y) - 8, { size: 11, align: 'center', color: '#fff', stroke: '#0a2342', sw: 3 }); }
  if (o.trucks) for (const t of o.trucks) { const a = Art.truckTop(t.load, 20); c.save(); c.translate(X(t.x), Y(t.y)); c.rotate(t.a + Math.PI / 2); c.drawImage(a, -6, -12, 12, 24); c.restore(); if (t.sel) { c.strokeStyle = PAL.amb; c.lineWidth = 2; c.strokeRect(X(t.x) - 9, Y(t.y) - 9, 18, 18); } }
  if (o.player) { c.fillStyle = '#ff2fb3'; c.beginPath(); c.arc(X(o.player.x), Y(o.player.y), 5, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
  c.restore();
  return o.rect;
}
```

#### Archivo: `tools/build.js` [Juega EnCicla]

```javascript
#!/usr/bin/env node
/* Construye Juega EnCicla:
   dist/juega-encicla.html  -> un solo archivo, offline (también es el www de Capacitor)
   dist/web/                -> PWA para GitHub Pages (index.html, manifest, sw.js, íconos, OG)
   Uso: node tools/build.js   (luego node tools/assets.js para íconos e imagen OG) */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'src'), DIST = path.join(ROOT, 'dist'), WEB = path.join(DIST, 'web');
const URL = 'https://juanfeliperico369-stack.github.io/BicicletasUno/';
const rd = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const jsFiles = fs.readdirSync(path.join(SRC, 'js')).filter(f => f.endsWith('.js')).sort();
const mvJs = path.join(ROOT, 'motor-valle', 'js', 'valle.js');
let js = jsFiles.map(f => `/* ---- ${f} ---- */\n` + rd('js/' + f)).join('\n') + (fs.existsSync(mvJs) ? `\n/* ---- motor-valle/js/valle.js ---- */\n` + fs.readFileSync(mvJs, 'utf8') : '');
// mapa real del Valle de Aburrá (motor-valle/geo/build.py): casillas y relieve comprimidos (deflate) + líneas en JSON
const VALLE = `const VALLE_META = ${rd('data/valle.json')};\nconst VALLE_BIN = '${fs.readFileSync(path.join(SRC, 'data', 'valle.bin')).toString('base64')}';\nconst VIAS_BIN = '${fs.existsSync(path.join(SRC, 'data', 'vias.bin')) ? fs.readFileSync(path.join(SRC, 'data', 'vias.bin')).toString('base64') : ''}';\nconst SITIOS_META = ${fs.existsSync(path.join(SRC, 'data', 'sitios.json')) ? rd('data/sitios.json') : 'null'};\nconst SITIOS_BIN = '${fs.existsSync(path.join(SRC, 'data', 'sitios.bin')) ? fs.readFileSync(path.join(SRC, 'data', 'sitios.bin')).toString('base64') : ''}';\n`;
// guion del juego (contenido/guion/*.json): historia "Un día del valle", frases de la ciudad, tutor, fiestas y Metro
const GDIR = path.join(ROOT, 'contenido', 'guion');
const GUION = fs.existsSync(GDIR) ? Object.fromEntries(fs.readdirSync(GDIR).filter(f => f.endsWith('.json')).sort().map(f => [f.slice(0, -5), JSON.parse(fs.readFileSync(path.join(GDIR, f), 'utf8'))])) : {};
// lo que va en alto (motor-valle/geo/alturas.py): tramos del metro en viaducto y puentes de las vías
const ALT = fs.existsSync(path.join(SRC, 'data', 'alturas.json')) ? rd('data/alturas.json') : 'null';
// Metroplús como en El Metro (motor-valle/geo/metroplus_elmetro.py): corredores de OSM de las Líneas 1 y 2 y andenes reales
const MPR = fs.existsSync(path.join(SRC, 'data', 'metroplus.json')) ? rd('data/metroplus.json') : 'null';
js = VALLE + `const GUION = ${JSON.stringify(GUION)};\nconst ALTURAS = ${ALT};\nconst MP_REAL = ${MPR};\n` + js;
const version = (js.match(/version: '([^']+)'/) || [])[1] || '0.0.0';
const b64 = f => fs.readFileSync(path.join(SRC, 'assets', f)).toString('base64');
const fonts = `@font-face{font-family:"Titulos";font-weight:300 700;font-stretch:75% 125%;src:url(data:font/woff2;base64,${b64('titulos.woff2')}) format("woff2");font-display:swap}@font-face{font-family:"Cuerpo";font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,${b64('cuerpo.woff2')}) format("woff2")}`;
const css = rd('style.css');
const tpl = rd('index.html');
const svgIcon = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges"><rect width="32" height="32" fill="#0a2342"/><circle cx="16" cy="16" r="13" fill="#9bd341"/><g fill="none" stroke="#fff" stroke-width="2"><circle cx="10" cy="19" r="4"/><circle cx="22" cy="19" r="4"/></g><path d="M10 19 15 13 22 19M15 13h5M15 19 20 13M13 12h4" stroke="#0a2342" stroke-width="1.6" fill="none"/></svg>`);
const page = (head, standalone) => tpl.replace('<!--HEAD-->', head).replace('/*FONTS*/', fonts).replace('/*CSS*/', css)
  .replace('/*JS*/', () => js.replace('/*STANDALONE*/false', standalone ? 'true' : 'false'));

fs.mkdirSync(path.join(WEB, 'icons'), { recursive: true });
// 1) archivo único offline
const single = page(`<link rel="icon" href="${svgIcon}">`, true);
fs.writeFileSync(path.join(DIST, 'juega-encicla.html'), single);
// 2) PWA
const head = [
  '<link rel="manifest" href="manifest.webmanifest">',
  '<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">',
  `<link rel="icon" type="image/svg+xml" href="${svgIcon}">`,
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
  '<meta property="og:type" content="website">', '<meta property="og:locale" content="es_CO">',
  '<meta property="og:title" content="Juega EnCicla">',
  '<meta property="og:description" content="El videojuego arcade del sistema de bicicletas públicas del Valle de Aburrá. 12 oficios, modo libre y multijugador, sin internet.">',
  `<meta property="og:url" content="${URL}">`, `<meta property="og:image" content="${URL}compartir.png">`,
  '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">', '<meta property="og:image:alt" content="Portada de Juega EnCicla">',
  '<meta name="twitter:card" content="summary_large_image">', `<link rel="canonical" href="${URL}">`
].join('\n');
const web = page(head, false);
fs.writeFileSync(path.join(WEB, 'index.html'), web);
const hash = crypto.createHash('sha1').update(web).digest('hex').slice(0, 8);
fs.writeFileSync(path.join(WEB, 'manifest.webmanifest'), JSON.stringify({
  name: 'Juega EnCicla', short_name: 'EnCicla', description: 'Videojuego arcade del sistema de bicicletas públicas EnCicla (Valle de Aburrá). Funciona sin internet.',
  lang: 'es-CO', id: './', start_url: './', scope: './', display: 'standalone', orientation: 'any', background_color: '#0a2342', theme_color: '#0a2342', categories: ['games', 'education'],
  icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }, { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' }]
}, null, 1));
const CACHE = `juega-encicla-v${version}-${hash}`;
fs.writeFileSync(path.join(WEB, 'sw.js'), `/* Service worker de Juega EnCicla: guarda el juego para jugar sin internet */
const CACHE = '${CACHE}';
const FILES = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './compartir.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-192.png', './icons/icon-maskable-512.png', './icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('juega-encicla-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const p = new URL(r.url).pathname, base = new URL('./', location).pathname;
  if (p.startsWith(base + 'metro/')) return;   // El Metro (en /metro/) tiene su propio service worker
  // el juego (./ o index.html) sale de la caché; las demás páginas (pagina.html, privacidad.html) van a la red primero
  if (r.mode === 'navigate' && (p === base || p === base + 'index.html')) { e.respondWith(caches.match('./index.html').then(c => c || fetch(r)).catch(() => caches.match('./index.html'))); return; }
  if (r.mode === 'navigate' || /\\.apk$/.test(p)) { e.respondWith(fetch(r).catch(() => caches.match(r, { ignoreSearch: true }))); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(c => c || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(ca => ca.put(r, cp)); } return res; })));
});
`);
fs.writeFileSync(path.join(WEB, '.nojekyll'), '');
// página oficial y privacidad (landing/) + APK de descarga si existe
const LAND = path.join(ROOT, 'landing');
if (fs.existsSync(LAND)) fs.cpSync(LAND, WEB, { recursive: true, filter: s => !/descargas/.test(s) });
const apk = fs.readdirSync(DIST).filter(f => f.endsWith('.apk')).sort().pop();
if (apk) { fs.mkdirSync(path.join(WEB, 'descargas'), { recursive: true }); fs.copyFileSync(path.join(DIST, apk), path.join(WEB, 'descargas', 'JuegaEnCicla.apk')); }
fs.writeFileSync(path.join(DIST, 'build.json'), JSON.stringify({ version, hash, cache: CACHE, files: jsFiles, bytes: { single: single.length, web: web.length, js: js.length } }, null, 1));
console.log('OK v' + version, 'cache', CACHE, '| único', (single.length / 1024).toFixed(0) + ' KB | js', (js.length / 1024).toFixed(0) + ' KB');
// documento único para las IA de arte e historia (docs/IA-ENCICLA.md + anexos)
try { const r = require('./todo-ia.js')(); console.log('Documento para IA: dist/ENCICLA-TODO.md ·', (r.bytes / 1024).toFixed(0), 'KB'); } catch (e) { console.warn('Documento para IA:', e.message); }
```


#### Cómo probar M2

1. Ejecutar `python3 motor-valle/geo/alturas.py` (verifica los 13 tramos de viaducto del Metro, 1.435 puentes y 12 túneles/deprimidos en `src/data/alturas.json`).
2. Ejecutar `node tools/build.js && NODE_PATH=/tmp/pw/node_modules NODE_OPTIONS="-r /tmp/pw/setup.js" node tools/auditoria-mapa.js`.
3. En **Modo Libre**, pedalear por el **Soterrado de Parques del Río** o el **Deprimido de San Juan (La Alpujarra)**: al entrar por la rampa (`P.lvl = -1`), los muros de contención encauzan la vía, se enciende el halo cálido bajo la cubierta traslúcida y los carros que cruzan por el nivel superior (`nivel 0` o `+1`) no chocan con el ciclista.

---

### M3 · Mejoras gráficas, interiores de estaciones y mejores casas de ladera `[Juega EnCicla]`

#### Qué se hizo en M3

1. **Interiores detallados de estaciones EnCicla en 2D y 3D (`Art.booth` y `Ride.prototype.estaciones3D` en `src/js/92-vehiculos.js`):**
   - **Caseta manual:** interior visible a través del ventanal con pared de fondo azul profundo (`#162844`), escritorio de madera (`#8b5a2b`), monitor/planilla (`#7ce0ff`), silla ergonómica (`#232a38`), chaleco reflectivo verde con cintas plateadas colgado en gancho (`#9bd341` / `#e6ecf5`), tablero de llaves codificadas por color (`#56c7ff`, `#ff5a36`, `#ffe066`, `#9bd341`), tula verde EnCicla (`#7ab800`), cargador de celular con LED verde (`#3dd668`) y pocillo de tinto humeante (`#d94e34`).
   - **Tótem automático y módulos de anclaje:** columna en azul EnCicla (`#0a2342`), pantalla táctil Cívica retroiluminada (`#7ce0ff`), lector sin contacto con halo verde pulsante (`#3dd668`), panel solar superior (`#1f365c`) y módulos de anclaje (`#4c5563`) con LEDs individuales de estado (`#3dd668` disponible, `#ffb300` ocupado, `#e84855` averiado).
2. **Casas de ladera mejoradas (`techoL` en `src/js/92-vehiculos.js` y `src/js/75-graficos.js`):**
   - En los barrios con cota `> 1.545 m s. n. m.`, los lotes residenciales dibujan terraza de plancha con tanque cilíndrico negro de agua (`#1f232a` con reborde `#4a5160`), cuerda con ropa tendida de colores (`#ff5a36`, `#56c7ff`, `#ffe066`, `#9bd341`) y escalera exterior de concreto (`#bfc5ce`) con pasamanos (`#eef2f7`).
3. **Atmósfera del valle (`Ride.prototype.drawGlow` en `src/js/92-vehiculos.js`):**
   - Niebla andina suave en la madrugada (5:30 a 7:50 a. m.) y durante los aguaceros, reflejos especulares sobre el pavimento mojado detrás de los vehículos y cono de luz cálida (`rgba(255,244,180,0.22)`) en la farola delantera de la bici de noche.

#### Especificaciones de arte autocontenido (M3)

| Pieza | Medidas reales (m) | Medidas en juego (px) | Paleta Hex |
|---|---|---|---|
| Caseta manual EnCicla | `4,0 m × 2,2 m × 2,6 m` | `6,4 × 3,6 px` (3D) · `34 × 34 px` (vista estación) | Cuerpo `#0a2342`, techo `#7ab800`, borde `#c4ec7c`, escritorio `#8b5a2b`, pantalla `#7ce0ff`, chaleco `#9bd341`, tinto `#d94e34`, LED `#3dd668` |
| Tótem automático Cívica | `0,55 m × 0,45 m × 2,10 m` | `2,1 × 2,1 px` base · `z = 0,085` | Columna `#0a2342`, pantalla `#7ce0ff`, halo lector `#3dd668`, panel solar `#1f365c`, anclaje `#4c5563` |
| Casa de ladera antioqueña | `6,0 m × 8,0 m` · 1 a 3 pisos | `9,6 × 12,8 px` · `z = 0,14 .. 0,34` | Ladrillo `#b85d3b`, plancha `#8b9098`, tanque `#1f232a`, escalera `#bfc5ce`, pasamanos `#eef2f7` |

#### Código completo de `src/js/75-graficos.js` `[Juega EnCicla]`

*(El código de `src/js/92-vehiculos.js`, que contiene los interiores de estaciones 2D/3D, las casas de ladera y la atmósfera del valle junto con los vehículos de M5, se incluye completo en la sección M5 más abajo para no duplicarlo).*

#### Archivo: `src/js/75-graficos.js` [Juega EnCicla]

```javascript
/* =====================================================================
   GRÁFICOS: ciudad 3D (suelo dibujado, edificios con volumen y perspectiva) o pixel clásico,
   y dos vistas del mapa: cenital y panorámica de plataformas.
   ===================================================================== */
const GFX = () => (Save.data && Save.data.settings.gfx === 'pixel') ? 'pixel' : '3d';
const panoOn = R => !!(R && Save.data.settings.vista === 'pano' && R.mode && R.mode.ride === R);
const SPRK = () => GFX() === '3d' ? .74 : 1;   // en 3D los vehículos se dibujan más pequeños: las calles se sienten anchas
/* dibuja un sprite centrado; los sprites dibujados (sc > 1) se escalan con suavizado */
function blit(c, img, sh) {
  const s = img.sc || 1, k = SPRK(), w = img.width / s * k, h = img.height / s * k;
  if (sh) { c.fillStyle = sh; c.beginPath(); c.ellipse(1, 1.5, w / 2, h / 2, 0, 0, TAU); c.fill(); }
  if (s > 1 || k !== 1) { c.imageSmoothingEnabled = s > 1; c.drawImage(img, -w / 2, -h / 2, w, h); c.imageSmoothingEnabled = false; } else c.drawImage(img, -w / 2, -h / 2);
}

/* ---------- rutas conectadas: une calles y ciclorrutas sueltas al cargar el mapa ---------- */
const isRoad = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE;
const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
CityMap.bridge = function () {
  const t = this.t, W = MW, H = MH, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? TT.MOUNT : t[y * W + x];
  const pass = (ok, maxGap, fillV, keep) => {
    const adds = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!ok(t[y * W + x])) continue; let n = 0, bx = 0, by = 0;
      for (const [dx, dy] of N8) if (ok(t[(y + dy) * W + x + dx])) { n++; bx = dx; by = dy; }
      if (n !== 1) continue;                                   // solo puntas sueltas
      const d0 = N8.findIndex(d => d[0] === -bx && d[1] === -by);
      search: for (const k of [0, 1, 7]) {                      // de frente y a 45°
        const [dx, dy] = N8[(d0 + k) % 8], path = [];
        for (let s = 1; s <= maxGap + 1; s++) { const v = at(x + dx * s, y + dy * s); if (ok(v)) { if (s > 1) adds.push(path.slice()); break search; } if (v === TT.WATER || v === TT.CANAL || v === TT.STATION || v === TT.DEPOT || v === TT.LAND) break; path.push((y + dy * s) * W + x + dx * s); }
      }
    }
    for (const p of adds) for (const i of p) if (!keep(t[i])) t[i] = fillV;
    return adds.length;
  };
  const r = pass(isRoad, 3, TT.ROAD, v => false), c = pass(v => v === TT.CICLO, 5, TT.CICLO, isRoad);
  // retazos de ciclorruta de 1 o 2 casillas sin conexión: se vuelven andén
  let cut = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (t[y * W + x] !== TT.CICLO) continue; let n = 0, ox = 0, oy = 0;
    for (const [dx, dy] of N8) if (t[(y + dy) * W + x + dx] === TT.CICLO) { n++; ox = x + dx; oy = y + dy; }
    if (n === 0) { t[y * W + x] = TT.WALK; cut++; }
    else if (n === 1) { let m = 0; for (const [dx, dy] of N8) if (t[(oy + dy) * W + ox + dx] === TT.CICLO) m++; if (m === 1) { t[y * W + x] = TT.WALK; t[oy * W + ox] = TT.WALK; cut += 2; } }
  }
  this.bridged = { roads: r, ciclo: c, cut };
};
/* ---------- calles como líneas: la red se rastrea y se simplifica a tramos rectos (sin escalones) ---------- */
const CHW = { 1: .96, 2: 1.3, 3: 1.5, 4: 1.1, 5: .42, 6: .7, 7: .55, 8: .3, 9: .2 };
const SWK = { 1: 3.5, 2: 6, 3: 0, 4: 4.5, 6: .5, 7: .5, 8: .3 };   // andén a cada lado (px) según el tipo de vía
/* ancho dibujado de cada tramo (px): con el mapa de 10 m sale del dato real (malla vial oficial o ancho típico de su clase), dentro de unos límites jugables */
const WLIM = { 1: [.62, 1.25], 4: [.75, 1.5], 2: [1.05, 2.4], 3: [1.05, 1.8], 5: [.36, .5], 6: [.5, 1], 7: [.45, .7], 8: [.25, .4] };
const chW = (k, m) => Math.round((VM.tile >= 20 || !m || !WLIM[k] ? CHW[k] || 1 : clamp(m / VM.tile, WLIM[k][0], WLIM[k][1])) * 20) / 20 * TS;   // 1 calle, 4 carrera, 2 avenida, 3 autopista, 5 ciclorruta, 6 peatonal, 7 escalas, 8 sendero
CityMap.vectorize = function () {
  const W = MW, H = MH, N = W * H, t = this.t, chains = this.chains = [], kindOf = v => v === TT.ROAD ? 1 : v === TT.AVE || v === TT.BRIDGE ? 2 : v === TT.AUTO ? 3 : v === TT.CICLO ? 5 : 0;
  const rdp = (P, eps) => {   // Ramer-Douglas-Peucker iterativo sobre [x0,y0,x1,y1,...]
    const n = P.length / 2; if (n <= 2) return P; const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1; const st = [[0, n - 1]];
    while (st.length) { const [a, b] = st.pop(), ax = P[a * 2], ay = P[a * 2 + 1], bx = P[b * 2], by = P[b * 2 + 1], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1; let md = 0, mi = -1;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((P[i * 2] - ax) * dy - (P[i * 2 + 1] - ay) * dx) / L; if (d > md) { md = d; mi = i; } }
      if (md > eps && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
    const o = []; for (let i = 0; i < n; i++) if (keep[i]) o.push(P[i * 2], P[i * 2 + 1]); return o;
  };
  /* Zhang-Suen: una calle ancha o una plancha de asfalto se reduce a su eje de una casilla (las calles finas no cambian) */
  const thin = m => {
    let idx = []; for (let i = W; i < N - W; i++) if (m[i]) { const x = i % W; if (x > 0 && x < W - 1) idx.push(i); }
    for (let it = 0, ch = 1; ch && it < 30; it++) {
      ch = 0;
      for (const step of [0, 1]) {
        const del = [];
        for (const i of idx) {
          if (!m[i]) continue; const p2 = m[i - W], p3 = m[i - W + 1], p4 = m[i + 1], p5 = m[i + W + 1], p6 = m[i + W], p7 = m[i + W - 1], p8 = m[i - 1], p9 = m[i - W - 1];
          const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9; if (B < 2 || B > 6) continue;
          const A = (!p2 & p3) + (!p3 & p4) + (!p4 & p5) + (!p5 & p6) + (!p6 & p7) + (!p7 & p8) + (!p8 & p9) + (!p9 & p2); if (A !== 1) continue;
          if (step ? (p2 & p4 & p8) | (p2 & p6 & p8) : (p2 & p4 & p6) | (p4 & p6 & p8)) continue; del.push(i);
        }
        for (const i of del) m[i] = 0; if (del.length) ch = 1;
      }
      idx = idx.filter(i => m[i]);
    }
  };
  const trace = (isM, eps, delgado) => {
    const m = new Uint8Array(N); for (let i = 0; i < N; i++) if (isM(t[i])) m[i] = 1; if (delgado) thin(m);
    const nb = (i, f) => { const x = i % W, y = (i / W) | 0; for (let k = 0; k < 8; k++) { const dx = N8[k][0], dy = N8[k][1], nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!m[j]) continue; if (dx && dy && (m[y * W + nx] || m[ny * W + x])) continue; f(j); } };
    const deg = new Uint8Array(N); for (let i = 0; i < N; i++) if (m[i]) { let d = 0; nb(i, () => d++); deg[i] = d; }
    const seen = new Uint8Array(N), pair = new Set();
    const emit = ids => { const P = [], cnt = {}; for (const i of ids) { P.push((i % W) + .5, ((i / W) | 0) + .5); const k = kindOf(t[i]); cnt[k] = (cnt[k] | 0) + 1; } let k = 0, best = -1; for (const q in cnt) if (cnt[q] > best && +q) { best = cnt[q]; k = +q; } const S = rdp(P, eps).map(v => v * TS); chains.push({ k, p: S, w: chW(k), j0: deg[ids[0]] > 2, j1: deg[ids[ids.length - 1]] > 2 }); };
    const walk = (a, b) => { const ids = [a]; let prev = a, cur = b; for (;;) { ids.push(cur); if (deg[cur] !== 2 || seen[cur]) break; seen[cur] = 1; let nx = -1; nb(cur, j => { if (j !== prev && nx < 0) nx = j; }); if (nx < 0 || nx === a) { if (nx === a) ids.push(a); break; } prev = cur; cur = nx; } return ids; };
    for (let i = 0; i < N; i++) { if (!m[i] || deg[i] === 2) continue; if (!deg[i]) { emit([i]); continue; } nb(i, j => { if (deg[j] === 2) { if (seen[j]) return; } else { const key = i < j ? i * N + j : j * N + i; if (pair.has(key)) return; pair.add(key); } emit(walk(i, j)); }); }
    for (let i = 0; i < N; i++) if (m[i] && deg[i] === 2 && !seen[i]) { let j0 = -1; nb(i, j => { if (j0 < 0) j0 = j; }); seen[i] = 1; emit(walk(i, j0)); }
  };
  if (this.vias) {   // calles exactas de los datos: cada vía con su forma y su nombre
    const ends = new Map(), key = (x, y) => Math.round(x) + ',' + Math.round(y);
    for (const v of this.vias) if (v.k <= 4) { const p = v.p, n = p.length; for (const q of [key(p[0], p[1]), key(p[n - 2], p[n - 1])]) ends.set(q, (ends.get(q) || 0) + 1); }
    for (const v of this.vias) { const p = v.p, n = p.length; chains.push({ k: v.k, p, n: v.n, nom: v.nom, w: chW(v.k, v.w), j0: v.k <= 4 && ends.get(key(p[0], p[1])) > 1, j1: v.k <= 4 && ends.get(key(p[n - 2], p[n - 1])) > 1 }); }
  } else trace(isRoad, .95, true);
  if (!(this.vias && VM.v >= 3)) trace(v => v === TT.CICLO, .95);   // v3: las ciclorrutas ya vienen como vectores
  // la física sigue a la línea: las casillas bajo cada tramo recto pasan a ser vía
  const soft = [TT.GRASS, TT.BRICK, TT.BLDG, TT.WALK, TT.PLAZA, TT.STEPS], code = { 1: TT.ROAD, 2: TT.AVE, 3: TT.AUTO, 4: TT.ROAD, 5: TT.CICLO };
  const cov = this.cov = new Uint8Array(N);
  for (const ch of chains) { const p = ch.p, r = ch.k === 5 ? .3 : ch.w / TS * .42, rp = !this.vias || ch.k === 5 ? r : ch.k === 1 || ch.k === 4 ? 0 : .3, v = code[ch.k]; if (!v) continue;   // con vías exactas, la física solo toma el eje (la cuadrícula ya trae la calle)
    for (let i = 0; i + 3 < p.length; i += 2) { const ax = p[i] / TS, ay = p[i + 1] / TS, bx = p[i + 2] / TS, by = p[i + 3] / TS, L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / .25));
      for (let s = 0; s <= n; s++) { const x = ax + (bx - ax) * s / n, y = ay + (by - ay) * s / n; for (let yy = Math.floor(y - r); yy <= Math.floor(y + r); yy++) for (let xx = Math.floor(x - r); xx <= Math.floor(x + r); xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const q = yy * W + xx, cur = t[q]; if (v !== TT.CICLO) cov[q] = 1; if (xx < Math.floor(x - rp) || xx > Math.floor(x + rp) || yy < Math.floor(y - rp) || yy > Math.floor(y + rp)) continue; if (soft.includes(cur) && (v !== TT.CICLO || cur !== TT.BLDG && cur !== TT.BRICK)) t[q] = v; } } } }
  // índice espacial por celdas de 32 casillas
  const G = this.chainGrid = new Map(), C = 32 * TS;
  chains.forEach((ch, idx) => { ch.id = idx; const p = ch.p; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); }
    for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const k = gx + ',' + gy; (G.get(k) || G.set(k, []).get(k)).push(idx); } });
};
const chainLen = p => { let L = 0; for (let i = 2; i < p.length; i += 2) L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); return L; };
/* cebras: en cada semáforo, a cada lado del cruce y sobre cada calle que pasa por él, perpendiculares a ella */
CityMap.zebras = function (x0, y0, w, h) {
  const out = [];
  for (const L of this.lights) {
    if (L.x < x0 || L.y < y0 || L.x > x0 + w || L.y > y0 + h) continue;
    if (!L.zb) {
      L.zb = [];
      for (const ch of this.chainsNear(L.x - 2 * TS, L.y - 2 * TS, 4 * TS, 4 * TS)) {
        if (!(ch.k >= 1 && ch.k <= 4) || ch.p.length < 4) continue; const p = ch.p, hw = ch.w / 2; let bd = 1.4 * TS, bi = -1, bt = 0;
        for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, t = clamp(((L.x - ax) * dx + (L.y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1), d = Math.hypot(ax + dx * t - L.x, ay + dy * t - L.y); if (d < bd) { bd = d; bi = i; bt = t; } }
        if (bi < 0) continue; const ax = p[bi - 2], ay = p[bi - 1], dx = p[bi] - ax, dy = p[bi + 1] - ay, len = Math.hypot(dx, dy); if (len < 1) continue;
        const ux = dx / len, uy = dy / len, cx = ax + dx * bt, cy = ay + dy * bt;
        for (const sg of [-1, 1]) { const zx = cx + ux * 15 * sg, zy = cy + uy * 15 * sg; if (L.zb.some(z => Math.hypot(z.x - zx, z.y - zy) < hw * 2 + 4)) continue; L.zb.push({ x: zx, y: zy, ux, uy, hw }); }
      }
    }
    for (const z of L.zb) out.push(z);
  }
  return out;
};
CityMap.chainsNear = function (x0, y0, w, h) { const C = 32 * TS, out = new Set(); for (let gy = Math.floor(y0 / C); gy <= Math.floor((y0 + h) / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor((x0 + w) / C); gx++) for (const i of this.chainGrid.get(gx + ',' + gy) || []) out.add(this.chains[i]); return [...out]; };
const _build75 = CityMap.build;
CityMap.build = function () { this.bridge(); this.vectorize(); _build75.call(this); };

/* ---------- suelo de la ciudad 3D ---------- */
const GROUND = ['#5f9e46', '#3d7a3a', '#bfb7a6', '#c2beb4', '#c2beb4', '#c2beb4', '#c9c5bb', '#c9c5bb', '#3f86c8', '#5f9e46', '#d9d1bd', '#c2beb4', '#cfcabf', '#c9b78c', '#c2beb4', '#b5b0a6', '#c5b99f'];
const ROADW = { [TT.ROAD]: .96, [TT.AVE]: 1.3, [TT.AUTO]: 1.5, [TT.BRIDGE]: 1.3 };
const LOSA = ['#a7a49c', '#9a9893', '#b5b0a6', '#8f9196', '#a39d92'], PINTA = ['#d9c7a3', '#c9b38a', '#e0cfae'];
const PARK_COL = ['#c0392b', '#ecf0f1', '#2c3e50', '#7f8c8d', '#f1c40f', '#2980b9', '#bdc3c7', '#8e44ad', '#16a085'], ROPA = ['#ff6b5a', '#56c7ff', '#ffc93c', '#ffffff', '#9bd341', '#b07cff'];
const ROOF = ['#8a8d93', '#9a9893', '#7d8189', '#a59f95', '#8f9499', '#b1aca2'], TEJA = ['#c2623b', '#b55430', '#cf7448', '#a94b2b', '#c8693f'];
const WALLS = [['#b5653f', '#9a5334'], ['#c0714a', '#a35d3b'], ['#a85a38', '#8d4a2d'], ['#cfc8b8', '#b0a999'], ['#d9d2c2', '#bab3a3'], ['#b9b4a8', '#9c978b'], ['#a9bccd', '#8ba0b3'], ['#c7d0d8', '#a7b1ba']];
const TALL = [[6.2505, -75.5686, 80], [6.2086, -75.5695, 70], [6.2405, -75.5745, 45], [6.1715, -75.5860, 30], [6.1725, -75.6110, 30], [6.3370, -75.5580, 30]];
const SOMBRA = new Map(), sombra18 = col => SOMBRA.get(col) || (SOMBRA.set(col, shade(col, -.18)), SOMBRA.get(col));   // tono oscuro de cada color de árbol, calculado una vez
const mixHex = (a, b, f) => { const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)], A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join(''); };
Object.assign(CityMap, {
  chunks2: new Map(), lotC: new Map(),
  hasG(cx, cy) { return GFX() === 'pixel' ? this.chunks.has(cx + ',' + cy) : this.chunks2.has(cx + ',' + cy + ':' + this.cq()); },
  cq() { return clamp(Math.round((View.s || 2) * (View.dpr || 1) / 2.4), 2, 3); },
  chunkG(cx, cy) {
    if (GFX() === 'pixel') return this.chunk(cx, cy);
    const q = this.cq(), k = cx + ',' + cy + ':' + q; let c = this.chunks2.get(k);
    if (c) { this.chunks2.delete(k); this.chunks2.set(k, c); return c; }
    c = Art.mk(CH * TS * q, CH * TS * q, x => this.drawGround3(x, cx, cy, q));
    this.chunks2.set(k, c); const vis = Math.ceil(((View.vw || 200) / (CH * TS) + 2) * ((View.vh || 200) / (CH * TS) + 2)); if (this.chunks2.size > Math.max(navigator.deviceMemory && navigator.deviceMemory <= 2 ? 10 : 14, vis + 4)) this.chunks2.delete(this.chunks2.keys().next().value);   /* al menos los trozos que caben en pantalla (pantallas grandes o zoom alejado) */
    return c;
  },
  /* ---------- CIUDAD SUAVE: nada de casillas a la vista ----------
     - El suelo de cada trozo sale de máscaras suavizadas (pasto, monte, plaza, parqueadero, manzanas, agua): bordes curvos y esquinas redondas.
     - Andén y sardinel siguen cada calle; las esquinas quedan redondas.
     - Casas y edificios en lotes a lo largo de cada calle, girados con ella (también en las curvas), en hasta 3 filas hacia adentro de la manzana.
       Los lotes se numeran desde el inicio de la calle y se descartan los que pisan a otro de mayor prioridad: cada trozo llega al mismo resultado. */
  chCum(ch) { if (ch.cum) return ch.cum; const p = ch.p, n = p.length >> 1, c = new Float32Array(n); for (let i = 1; i < n; i++) c[i] = c[i - 1] + Math.hypot(p[i * 2] - p[i * 2 - 2], p[i * 2 + 1] - p[i * 2 - 1]); return (ch.cum = c); },
  chPt(ch, s) {
    const p = ch.p, c = this.chCum(ch), n = c.length; s = clamp(s, 0, c[n - 1]); let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; }
    const L = c[hi] - c[lo] || 1, t = (s - c[lo]) / L; return { x: p[lo * 2] + (p[hi * 2] - p[lo * 2]) * t, y: p[lo * 2 + 1] + (p[hi * 2 + 1] - p[lo * 2 + 1]) * t };
  },
  /* contorno suavizado de una clase de casilla en el trozo, como trazo vectorial (nítido a cualquier zoom, sin costuras):
     rejilla con 2 casillas de margen → suavizado [1 2 1] → rejilla a media casilla (bilineal) → marching squares, todo en una sola ruta */
  contorno(c, x0, y0, test, thr) {
    const M = 2, N = CH + 2 * M, g = this._mg || (this._mg = new Float32Array(N * N)), h = this._mh || (this._mh = new Float32Array(N * N));
    let any = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const v = test(this.get(x0 - M + i, y0 - M + j), x0 - M + i, y0 - M + j) ? 1 : 0; g[j * N + i] = v; any += v; }
    if (!any) return false;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) h[j * N + i] = (g[j * N + Math.max(0, i - 1)] + 2 * g[j * N + i] + g[j * N + Math.min(N - 1, i + 1)]) / 4;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) g[j * N + i] = (h[Math.max(0, j - 1) * N + i] + 2 * h[j * N + i] + h[Math.min(N - 1, j + 1) * N + i]) / 4;
    const N2 = N * 2 - 1, u = this._mu || (this._mu = new Float32Array(N2 * N2));
    for (let J = 0; J < N2; J++) for (let I = 0; I < N2; I++) { const i = I >> 1, j = J >> 1, fx = (I & 1) * .5, fy = (J & 1) * .5, i1 = Math.min(N - 1, i + 1), j1 = Math.min(N - 1, j + 1); u[J * N2 + I] = (g[j * N + i] * (1 - fx) + g[j * N + i1] * fx) * (1 - fy) + (g[j1 * N + i] * (1 - fx) + g[j1 * N + i1] * fx) * fy; }
    const T = thr || .5, ox = (x0 - M + .5) * TS, oy = (y0 - M + .5) * TS, k = TS / 2, cs = [0, 0, 0, 0];
    c.beginPath(); let run = -1;
    const tira = (J, I0, I1) => { const X0 = ox + I0 * k, X1 = ox + I1 * k, Y0 = oy + J * k, Y1 = Y0 + k; c.moveTo(X0, Y0); c.lineTo(X1, Y0); c.lineTo(X1, Y1); c.lineTo(X0, Y1); c.closePath(); };   // celdas llenas seguidas: un rectángulo (menos trazos, mismo dibujo)
    for (let J = 0; J < N2 - 1; J++, run = -1) for (let I = 0; I < N2 - 1; I++) {
      const a = u[J * N2 + I], b = u[J * N2 + I + 1], d = u[(J + 1) * N2 + I], e = u[(J + 1) * N2 + I + 1], lleno = a >= T && b >= T && d >= T && e >= T;
      if (lleno) { if (run < 0) run = I; if (I === N2 - 2) { tira(J, run, I + 1); run = -1; } continue; }
      if (run >= 0) { tira(J, run, I); run = -1; }
      if (a < T && b < T && d < T && e < T) continue;
      cs[0] = a; cs[1] = b; cs[2] = e; cs[3] = d; let first = true;
      for (let q = 0; q < 4; q++) {
        const v1 = cs[q], v2 = cs[(q + 1) & 3], x1 = q === 1 || q === 2 ? 1 : 0, y1 = q >= 2 ? 1 : 0, x2 = q === 0 || q === 1 ? 1 : 0, y2 = q === 1 || q === 2 ? 1 : 0;
        if (v1 >= T) { const X = ox + (I + x1) * k, Y = oy + (J + y1) * k; if (first) { c.moveTo(X, Y); first = false; } else c.lineTo(X, Y); }
        if ((v1 >= T) !== (v2 >= T)) { const t = (T - v1) / (v2 - v1), X = ox + (I + x1 + (x2 - x1) * t) * k, Y = oy + (J + y1 + (y2 - y1) * t) * k; if (first) { c.moveTo(X, Y); first = false; } else c.lineTo(X, Y); }
      }
      c.closePath();
    }
    return true;
  },
  /* lotes del trozo: { all: los que tocan el trozo (para el suelo), ed: los edificios con centro en el trozo (para el volumen) } */
  lotes(cx, cy) {
    const key = cx + ',' + cy, C0 = this.lotC; let R = C0.get(key); if (R) { C0.delete(key); C0.set(key, R); return R; }
    if (!this.tallT) this.tallT = TALL.map(([la, lo, r]) => { const g = geoT(la, lo); return [g.x, g.y, r * MS]; });
    const S = CH * TS, X0 = cx * S, Y0 = cy * S, MG = 120, RANK = { 2: 0, 4: 1, 1: 2, 6: 3, 7: 4, 8: 5 };
    const ok = v => v === TT.BRICK || v === TT.BLDG, atras = v => v === TT.BRICK || v === TT.BLDG || v === TT.GRASS || v === TT.WALK || v === TT.PLAZA, frente = v => !(v === TT.WATER || v === TT.CANAL || v === TT.AUTO || v === TT.STATION || v === TT.LAND || v === TT.BRIDGE || v === TT.DEPOT);   // el frente del lote puede tocar la casilla de la calle (que incluye el andén)
    const T = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return this.lid.has(this.idx(tx, ty)) ? TT.LAND : this.get(tx, ty); };
    const cand = [];
    for (const ch of this.chainsNear(X0 - MG, Y0 - MG, S + 2 * MG, S + 2 * MG)) {
      const rk = RANK[ch.k]; if (rk == null || ch.p.length < 4) continue;
      const cum = this.chCum(ch), len = cum[cum.length - 1], p = ch.p; if (len < 14) continue;
      let sa = 1e9, sb = -1; for (let i = 0; i < cum.length; i++) { const x = p[i * 2], y = p[i * 2 + 1]; if (x > X0 - MG && x < X0 + S + MG && y > Y0 - MG && y < Y0 + S + MG) { sa = Math.min(sa, cum[Math.max(0, i - 1)]); sb = Math.max(sb, cum[Math.min(cum.length - 1, i + 1)]); } }
      if (sb < 0) continue;
      const lt = this.lt ? this.lt[clamp(Math.floor(p[1] / TS / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(p[0] / TS / 8), 0, VM.mW - 1)] * 4 : 0;
      const W = clamp(Math.sqrt((lt || 110) / 2) * TS / VM.tile, 9, 17), base = ch.w / 2 + SWK[ch.k] + 1;   // frente del lote según los lotes catastrales de la zona
      for (const sd of [-1, 1]) {
        const s0 = 2 + h2(ch.id, sd + 2, 31) * W;
        for (let i = Math.max(0, Math.floor((sa - s0) / W) - 1), iN = Math.ceil((sb - s0) / W) + 1; i <= iN; i++) {
          const s = s0 + i * W; if (s < 2 || s + W > len - 2) continue;
          const a = this.chPt(ch, s), b = this.chPt(ch, s + W), m = this.chPt(ch, s + W / 2); let ux = b.x - a.x, uy = b.y - a.y; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
          const nx = -uy * sd, ny = ux * sd; let off = base;
          for (let r = 0; r < 3; r++) {
            const v = T(m.x + nx * (off + 6), m.y + ny * (off + 6)); if (!ok(v)) break;
            const B = v === TT.BLDG, d = B ? 22 : 13, cxl = m.x + nx * (off + d / 2), cyl = m.y + ny * (off + d / 2), hw = W / 2 - .35, hd = d / 2 - .35;
            if (!ok(T(cxl, cyl))) break; let bad = 0; for (const [p1, p2] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const v2 = T(cxl + ux * hw * p1 + nx * hd * p2, cyl + uy * hw * p1 + ny * hd * p2); if (p2 < 0 ? !frente(v2) : !atras(v2)) bad++; }
            if (bad || (this.sitT && (this.enSitio(cxl, cyl) || this.enSitio(cxl + nx * hd, cyl + ny * hd) || this.enSitio(cxl + ux * hw, cyl + uy * hw) || this.enSitio(cxl - ux * hw, cyl - uy * hw)))) break;   // ni dentro de un sitio real
            cand.push({ x: cxl, y: cyl, ux, uy, nx, ny, w: W - .7, d: d - .7, B, r, rk, id: ch.id, sd, i, pr: [r, rk, ch.id, sd, i] });
            off += d + 1.3;
          }
        }
      }
    }
    // dos lotes vecinos de edificio se vuelven un solo edificio (parejas fijas: 0-1, 2-3…)
    const byK = new Map(); for (const q of cand) byK.set(q.id + ':' + q.sd + ':' + q.r + ':' + q.i, q);
    for (const q of cand) {
      if (!q.B || q.dead || (q.i & 1)) continue; const o = byK.get(q.id + ':' + q.sd + ':' + q.r + ':' + (q.i + 1)); if (!o || !o.B || h2(q.id, q.i, 41) > .72) continue;
      let ux = o.x - q.x, uy = o.y - q.y; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul; q.x = (q.x + o.x) / 2; q.y = (q.y + o.y) / 2; q.ux = ux; q.uy = uy; q.nx = -uy * q.sd; q.ny = ux * q.sd; q.w = q.w + o.w + .7; q.d = Math.max(q.d, o.d); o.dead = true;
    }
    // sin traslapes: un lote se descarta si pisa a otro de mayor prioridad (fila, tipo de calle, calle, lado, número)
    const live = cand.filter(q => !q.dead).sort((a, b) => { for (let k = 0; k < 5; k++) if (a.pr[k] !== b.pr[k]) return a.pr[k] - b.pr[k]; return 0; });
    const G = new Map(), CE = 32, KX = 65536;   // celdas de 32 px con clave numérica (rápido en celulares)
    const proy = (Q, ax, ay) => Math.abs(Q.w / 2 * (Q.ux * ax + Q.uy * ay)) + Math.abs(Q.d / 2 * (Q.nx * ax + Q.ny * ay)), sep = (A, B, ax, ay) => Math.abs((B.x - A.x) * ax + (B.y - A.y) * ay) >= proy(A, ax, ay) + proy(B, ax, ay) - .8;
    const cruza = (A, B) => { const dx = B.x - A.x, dy = B.y - A.y, rr = (A.w + A.d + B.w + B.d) / 2; if (dx * dx + dy * dy > rr * rr) return false; return !(sep(A, B, A.ux, A.uy) || sep(A, B, A.nx, A.ny) || sep(A, B, B.ux, B.uy) || sep(A, B, B.nx, B.ny)); };   // ejes separadores (SAT), sin crear arreglos
    // corredores del metro, del tranvía y del Metroplús: ningún lote los pisa (el viaducto y los rieles van sobre la calle)
    const TR = this._trG || (this._trG = (() => { const G2 = new Map(), C = 64, add = (L, r) => { const P = L.pts; for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], sg = [a.x, a.y, b.x, b.y, r]; for (let gy = Math.floor((Math.min(a.y, b.y) - 24) / C); gy <= Math.floor((Math.max(a.y, b.y) + 24) / C); gy++) for (let gx = Math.floor((Math.min(a.x, b.x) - 24) / C); gx <= Math.floor((Math.max(a.x, b.x) + 24) / C); gx++) { const k = gx * 65536 + gy; (G2.get(k) || G2.set(k, []).get(k)).push(sg); } } }; add(this.lineA, 9); add(this.lineB, 9); add(this.tram, 7); for (const m of this.mp || []) add(m, 5); return G2; })());
    const choca = q => { const L = TR.get(Math.floor(q.x / 64) * KX + Math.floor(q.y / 64)); if (!L) return false; const R = Math.hypot(q.w, q.d) / 2 * .8; for (const sg of L) { const ax = sg[0], ay = sg[1], dx = sg[2] - ax, dy = sg[3] - ay, t = clamp(((q.x - ax) * dx + (q.y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1); if (Math.hypot(ax + dx * t - q.x, ay + dy * t - q.y) < R + sg[4]) return true; } return false; };
    const all = [], ed = [], ladZ = /Poblado/.test(this.comunaAt(X0 + S / 2, Y0 + S / 2)) || /Envigado|Sabaneta|Itag/.test(this.muniAt(X0 + S / 2, Y0 + S / 2));
    for (const q of live) {
      if (choca(q)) continue; const rq = (q.w + q.d) / 2 + 1, gx0 = Math.floor((q.x - rq) / CE), gx1 = Math.floor((q.x + rq) / CE), gy0 = Math.floor((q.y - rq) / CE), gy1 = Math.floor((q.y + rq) / CE); let hit = false;
      for (let gy = gy0; gy <= gy1 && !hit; gy++) for (let gx = gx0; gx <= gx1 && !hit; gx++) { const L = G.get(gx * KX + gy); if (L) for (const o of L) if (cruza(q, o)) { hit = true; break; } }
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) { const k = gx * KX + gy, L = G.get(k); if (L) L.push(q); else G.set(k, [q]); }
      if (hit) continue;
      const hw = q.w / 2 - (q.B ? .9 : 0), hd = q.d / 2 - (q.B ? .9 : 0);
      q.pts = [q.x - q.ux * hw - q.nx * hd, q.y - q.uy * hw - q.ny * hd, q.x + q.ux * hw - q.nx * hd, q.y + q.uy * hw - q.ny * hd, q.x + q.ux * hw + q.nx * hd, q.y + q.uy * hw + q.ny * hd, q.x - q.ux * hw + q.nx * hd, q.y - q.uy * hw + q.ny * hd];
      let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; for (let k = 0; k < 8; k += 2) { bx0 = Math.min(bx0, q.pts[k]); bx1 = Math.max(bx1, q.pts[k]); by0 = Math.min(by0, q.pts[k + 1]); by1 = Math.max(by1, q.pts[k + 1]); }
      q.k = h2(q.id * 7 + q.sd + 3, q.i * 3 + q.r, 43);
      if (q.B) {
        const tx = q.x / TS, ty = q.y / TS, fl = this.hg ? this.hg[clamp(Math.floor(ty / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(tx / 8), 0, VM.mW - 1)] : 0, r = q.k;
        let boost = 0; for (const [ax, ay, rad] of this.tallT) boost = Math.max(boost, clamp(1.5 - Math.hypot(tx - ax, ty - ay) / rad, 0, 1));
        q.z = fl ? clamp(.05 + Math.max(2, fl * (.55 + .45 * r)) * .03, .1, 1.15) : .13 + .26 * r + .6 * r * r * boost;
        const wi = q.z > .62 ? (ladZ && r < .72 ? ((r * 97) | 0) % 3 : 6 + ((r * 7) | 0) % 2) : ((r * 97) | 0) % 6;   /* El Poblado, Envigado y Sabaneta: torres de ladrillo (así se ven desde el aire) */ q.roof = ROOF[((r * 31) | 0) % ROOF.length]; q.wa = WALLS[wi][0]; q.wb = WALLS[wi][1]; q.pal = [];
        if (q.x >= X0 && q.x < X0 + S && q.y >= Y0 && q.y < Y0 + S) ed.push(q);
      }
      if (bx1 > X0 - 2 && bx0 < X0 + S + 2 && by1 > Y0 - 2 && by0 < Y0 + S + 2) all.push(q);
    }
    // casas del interior de la manzana: en cada casilla de ladrillo que no cubre un lote, una casa girada con la calle más cercana
    const dentro = (x, y) => { for (const o of G.get(Math.floor(x / CE) * KX + Math.floor(y / CE)) || []) { if (o.pts === undefined) continue; const dx = x - o.x, dy = y - o.y; if (Math.abs(dx * o.ux + dy * o.uy) < o.w / 2 + 2 && Math.abs(dx * o.nx + dy * o.ny) < o.d / 2 + 2) return true; } return false; };
    const tx0 = cx * CH - 1, ty0 = cy * CH - 1, SG = new Map(), SC = 32;   // tramos de calle por celda de 32 px: cada casa del interior toma la dirección de la calle más cercana (a menos de 48 px)
    for (const ch of this.chainsNear(X0 - 48, Y0 - 48, S + 96, S + 96)) { if (RANK[ch.k] == null) continue; const p = ch.p;
      for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], bx = p[i], by = p[i + 1]; if ((bx - ax) * (bx - ax) + (by - ay) * (by - ay) < .01) continue;
        const x0 = Math.max(Math.min(ax, bx), X0 - 96), x1 = Math.min(Math.max(ax, bx), X0 + S + 96), y0 = Math.max(Math.min(ay, by), Y0 - 96), y1 = Math.min(Math.max(ay, by), Y0 + S + 96); if (x0 > x1 || y0 > y1) continue;
        const sg = [ax, ay, bx, by]; for (let gy = Math.floor(y0 / SC); gy <= Math.floor(y1 / SC); gy++) for (let gx = Math.floor(x0 / SC); gx <= Math.floor(x1 / SC); gx++) { const k = gx * KX + gy, L = SG.get(k); if (L) L.push(sg); else SG.set(k, [sg]); } } }
    const rumbo = (x, y) => { let bd = 48, ux = 1, uy = 0; for (let gy = Math.floor((y - 48) / SC); gy <= Math.floor((y + 48) / SC); gy++) for (let gx = Math.floor((x - 48) / SC); gx <= Math.floor((x + 48) / SC); gx++) { const L = SG.get(gx * KX + gy); if (L) for (const sg of L) { const ax = sg[0], ay = sg[1], dx = sg[2] - ax, dy = sg[3] - ay, L2 = dx * dx + dy * dy, t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1), d = Math.hypot(ax + dx * t - x, ay + dy * t - y); if (d < bd) { bd = d; const l = Math.sqrt(L2); ux = dx / l; uy = dy / l; } } } return [ux, uy]; };
    for (let ty = ty0; ty <= ty0 + CH + 1; ty++) for (let tx = tx0; tx <= tx0 + CH + 1; tx++) {
      if (this.get(tx, ty) !== TT.BRICK || this.lid.has(this.idx(tx, ty)) || h2(tx, ty, 51) < .08 || (this.sitT && this.sitT.has(this.idx(tx, ty)))) continue;
      const x = (tx + .5) * TS + (h2(tx, ty, 52) - .5) * 3, y = (ty + .5) * TS + (h2(tx, ty, 53) - .5) * 3; if (dentro(x, y) || choca({ x, y, w: 12, d: 12 })) continue;
      const [ux, uy] = rumbo(x, y);
      const q = { x, y, ux, uy, nx: -uy, ny: ux, w: 11 + h2(tx, ty, 54) * 2, d: 11 + h2(tx, ty, 55) * 2, B: false, int: true, id: tx, i: ty, r: 9, sd: 1 }, hw = q.w / 2, hd = q.d / 2;
      q.pts = [x - ux * hw + uy * hd, y - uy * hw - ux * hd, x + ux * hw + uy * hd, y + uy * hw - ux * hd, x + ux * hw - uy * hd, y + uy * hw + ux * hd, x - ux * hw - uy * hd, y - uy * hw + ux * hd];
      q.k = h2(tx, ty, 56); all.push(q);
    }
    // volumen y colores de cada casa (1 a 3 pisos)
    const casas = [];
    // en las laderas (así se ven desde el aire): casas de ladrillo a la vista con plancha gris; en lo plano, más teja de barro
    const tc = (cx + .5) * CH, tcy = (cy + .5) * CH, lad = Math.hypot(this.elevT(tc + 4, tcy) - this.elevT(tc - 4, tcy), this.elevT(tc, tcy + 4) - this.elevT(tc, tcy - 4)) / (8 * VM.tile) > .1;
    for (const q of all) { if (q.B) continue; const r = q.k; q.z = .045 + ((h2(q.id, q.i, 57) * (lad ? 4 : 3)) | 0) * .025; q.roof = lad ? (r < .3 ? TEJA[(r * 9 | 0) % TEJA.length] : r < .9 ? LOSA[(r * 13 | 0) % LOSA.length] : PINTA[(r * 17 | 0) % PINTA.length]) : r < .55 ? TEJA[(r * 9 | 0) % TEJA.length] : r < .88 ? LOSA[(r * 13 | 0) % LOSA.length] : PINTA[(r * 17 | 0) % PINTA.length]; const wi = (lad ? r < .8 : r < .6) ? (r * 31 | 0) % 3 : 3 + (r * 37 | 0) % 3; q.wa = WALLS[wi][0]; q.wb = WALLS[wi][1]; if (q.x >= X0 && q.x < X0 + S && q.y >= Y0 && q.y < Y0 + S) casas.push(q); }
    // lugares emblemáticos: sus cuerpos con volumen (edificios) y sus casas de ladera (Comuna 13, Santo Domingo, Pueblito Paisa)
    for (const P of this.lmPartes()) { if (P.x1 < X0 || P.x0 > X0 + S || P.y1 < Y0 || P.y0 > Y0 + S) continue; for (const q of P.ed) { all.push(q); if (q.x >= X0 && q.x < X0 + S && q.y >= Y0 && q.y < Y0 + S) ed.push(q); } for (const q of P.casas) all.push(q); }
    R = { all, ed, casas }; C0.set(key, R); if (C0.size > 64) C0.delete(C0.keys().next().value);
    return R;
  },
  drawGround3(c, cx, cy, q) {
    const x0 = cx * CH, y0 = cy * CH, px0 = x0 * TS, py0 = y0 * TS, S = CH * TS, g = (x, y) => this.get(x, y);
    c.setTransform(q, 0, 0, q, -px0 * q, -py0 * q); c.lineCap = 'round'; c.lineJoin = 'round';
    // 1) suelo: piso de ciudad y capas suavizadas encima (sin casillas a la vista)
    c.fillStyle = '#cfc9bc'; c.fillRect(px0, py0, S, S);
    const cov = this.cov, pk = (x, y) => { const v = g(x, y); return (v === TT.ROAD || v === TT.AVE || v === TT.AUTO) && cov && x >= 0 && y >= 0 && x < MW && y < MH && !cov[y * MW + x]; };
    const capa = (test, col, thr) => { if (this.contorno(c, x0, y0, test, thr)) { c.fillStyle = col; c.fill(); } };
    capa(v => v === TT.MOUNT, '#3f7a3c');
    capa(v => v === TT.GRASS || v === TT.CANAL || v === TT.LAND, '#69a84e');
    capa(v => v === TT.PLAZA, '#ddd3bd');
    capa((v, x, y) => { if (!pk(x, y)) return false; let n = 0; for (const [dx, dy] of N8) if (pk(x + dx, y + dy)) n++; return n >= 5; }, '#8e929a');
    capa(v => v === TT.BRICK, '#a99f91');
    const verdeZ = /Poblado|Laureles/.test(this.comunaAt(px0 + S / 2, py0 + S / 2)) || /Envigado/.test(this.muniAt(px0 + S / 2, py0 + S / 2));   // desde el aire, El Poblado, Laureles y Envigado son casi bosque entre los edificios
    capa(v => v === TT.BLDG, verdeZ ? '#8fb072' : '#9fa2a7');   // allí, entre las torres hay jardines de las unidades
    const agua = this.decks && this.decks.length ? v => v === TT.WATER || v === TT.BRIDGE : v => v === TT.WATER;   // con los puentes en alto, el río sigue por debajo
    capa(agua, '#87a872', .3);
    capa(agua, '#3f86c8');
    // textura del pasto y del monte: puntos, no cuadros
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) { const v = g(x, y); if (v !== TT.GRASS && v !== TT.MOUNT) continue; c.fillStyle = v === TT.MOUNT ? '#356d34' : '#78b65c'; c.beginPath(); for (let k = 0; k < 3; k++) { const X = x * TS + 2 + h2(x, y, 30 + k) * 12, Y = y * TS + 2 + h2(x, y, 40 + k) * 12; c.moveTo(X + .9, Y); c.arc(X, Y, .9, 0, TAU); } c.fill(); }
    // relieve suave (luz del noroeste)
    const RS = CH + 3, rc = Art.mk(RS, RS, r => { const im = r.createImageData(RS, RS), D = im.data; for (let j = 0; j < RS; j++) for (let i = 0; i < RS; i++) { const tx = x0 - 1 + i, ty = y0 - 1 + j, gx = (this.elevT(tx + .5, ty) - this.elevT(tx - .5, ty)) / VM.tile, gy = (this.elevT(tx, ty + .5) - this.elevT(tx, ty - .5)) / VM.tile, f = clamp((gx + gy) * 1.1, -.3, .25), o = (j * RS + i) * 4; if (f > 0) { D[o] = 255; D[o + 1] = 250; D[o + 2] = 230; D[o + 3] = f * 127.5; } else { D[o] = 10; D[o + 1] = 20; D[o + 2] = 40; D[o + 3] = -f * 153; } } r.putImageData(im, 0, 0); });
    c.imageSmoothingEnabled = true; c.drawImage(rc, 0, 0, RS, RS, px0 - TS * 1.5, py0 - TS * 1.5, RS * TS, RS * TS);   // una muestra por casilla: el relieve es suave (datos de 80 m) y el suavizado lo estira
    const CHS = this.chainsNear(px0 - 2 * TS, py0 - 2 * TS, S + 4 * TS, S + 4 * TS);
    const run = (f, w, col, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); for (const ch of CHS) { if (!f(ch.k)) continue; const p = ch.p; c.moveTo(p[0], p[1]); if (p.length === 2) c.lineTo(p[0] + .01, p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); } c.stroke(); c.setLineDash([]); };
    // lugares emblemáticos: su suelo vectorial (prados, caminos, agua, canchas, el estadio, los cerros), bajo las calles que los cruzan
    const LMV = []; LANDMARKS.forEach((L, i) => { if (!(L.x + L.w < x0 - 3 || L.x > x0 + CH + 3 || L.y + L.h < y0 - 3 || L.y > y0 + CH + 3)) LMV.push(i); });
    for (const i of LMV) this.lugar3(c, LANDMARKS[i], i, 0);
    this.sitSuelo(c, cx, cy);   // canchas con sus líneas, pistas atléticas y piscinas (22-sitios.js)
    // 2) quebradas: un hilo de agua por su trazo real, dentro de su retiro verde
    run(k => k === 9, 7.5, 'rgba(105,168,78,.9)'); run(k => k === 9, 3.4, '#6f9a7c'); run(k => k === 9, 2.2, '#4f9bd4');
    // 3) andenes con sardinel a lo largo de cada calle (y peatonales, escalas y senderos)
    const RD = k => k > 0 && k < 5, GW = new Map(); for (const ch of CHS) if (RD(ch.k)) { const key = ch.k * 1e4 + Math.round(ch.w * 10); (GW.get(key) || GW.set(key, []).get(key)).push(ch); }
    const KO = { 1: 0, 4: 1, 2: 2, 3: 3 }, GK = [...GW.keys()].sort((a, b) => KO[(a / 1e4) | 0] - KO[(b / 1e4) | 0] || a - b), ASF = { 1: '#565a62', 4: '#565a62', 2: '#50545c', 3: '#4a4e56' };
    const runL = (L, w, col, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); for (const ch of L) { const p = ch.p; c.moveTo(p[0], p[1]); if (p.length === 2) c.lineTo(p[0] + .01, p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); } c.stroke(); c.setLineDash([]); };
    for (const key of GK) { const k = (key / 1e4) | 0; if (k !== 3) runL(GW.get(key), (key % 1e4) / 10 + 2 * SWK[k] + 1.4, '#9d978b'); }
    for (const key of GK) { const k = (key / 1e4) | 0; if (k !== 3) runL(GW.get(key), (key % 1e4) / 10 + 2 * SWK[k], '#dcd7cc'); else runL(GW.get(key), (key % 1e4) / 10 + 3, '#8fae74'); }
    run(q => q === 6, (CHW[6] + .14) * TS, '#b3ab98'); run(q => q === 6, CHW[6] * TS, '#e6dfcd');
    run(q => q === 7, CHW[7] * TS, '#cbc1ab'); run(q => q === 7, CHW[7] * TS * .9, '#a99d84', [.8, 1.5]);
    run(q => q === 8, CHW[8] * TS, '#d6c9a8', [3, 2.5]);
    // 4) calles: cada una con su ancho, bordes, separadores y líneas
    for (const key of GK) runL(GW.get(key), (key % 1e4) / 10 + 1, '#7d796f');
    for (const key of GK) runL(GW.get(key), (key % 1e4) / 10, ASF[(key / 1e4) | 0]);
    for (const key of GK) { const k = (key / 1e4) | 0, w = (key % 1e4) / 10, L = GW.get(key); if (k < 2 || k > 3) continue; runL(L, w - .14 * TS, k === 3 ? '#e8c64a' : '#d9d6cc'); runL(L, w - .22 * TS, ASF[k]); if (k === 2 && w >= 1.7 * TS) { runL(L, .22 * TS, '#cfcabf'); runL(L, .13 * TS, '#5f9e46'); } }
    for (const key of GK) { const k = (key / 1e4) | 0, w = (key % 1e4) / 10, L = GW.get(key); if (k === 1) runL(L, .7, '#e6e4dc', [5, 7]); else if (k === 4) runL(L, .75, '#eceae2', [6, 6]); else if (k === 2 && w < 1.7 * TS) runL(L, .8, '#e8c64a', [8, 6]); else if (k === 3) runL(L, .8, '#f2f0e8', [9, 6]); }
    for (const ch of CHS) { if (!RD(ch.k)) continue; const p = ch.p, w = ch.w / 2 - .5; c.fillStyle = ASF[ch.k]; if (ch.j0) { c.beginPath(); c.arc(p[0], p[1], w, 0, TAU); c.fill(); } if (ch.j1) { c.beginPath(); c.arc(p[p.length - 2], p[p.length - 1], w, 0, TAU); c.fill(); } }
    run(k => k === 9, .9, 'rgba(79,155,212,.45)', [2.5, 3.2]);   // las quebradas que pasan cubiertas bajo las calles (la Santa Elena bajo La Playa): línea tenue
    // cebras en los cruces con semáforo
    c.strokeStyle = '#eceae2'; c.lineWidth = 1.6; c.lineCap = 'butt'; c.beginPath();
    for (const z of this.zebras(px0 - 40, py0 - 40, S + 80, S + 80)) { const nx = -z.uy, ny = z.ux; for (let k = -z.hw + 1.5; k <= z.hw - 1.5; k += 3) { const x = z.x + nx * k, y = z.y + ny * k; c.moveTo(x - z.ux * 3, y - z.uy * 3); c.lineTo(x + z.ux * 3, y + z.uy * 3); } }
    c.stroke(); c.lineCap = 'round';
    // ciclorrutas: carril verde con bordes y bicis pintadas
    run(q => q === 5, .52 * TS, '#e9e6dc'); run(q => q === 5, .42 * TS, '#2e9d55'); run(q => q === 5, .55, '#d8f0c8', [3, 4]);
    for (const ch of CHS) { if (ch.k !== 5) continue; const len = chainLen(ch.p); for (let s = 20 + h2(ch.p[0] | 0, ch.p[1] | 0, 12) * 40; s < len - 8; s += 70) { const a = this.chPt(ch, s), b = this.chPt(ch, s + 2); if (a.x < px0 - 4 || a.y < py0 - 4 || a.x > px0 + S + 4 || a.y > py0 + S + 4) continue; const an = Math.atan2(b.y - a.y, b.x - a.x); c.save(); c.translate(a.x, a.y); c.rotate(an); c.strokeStyle = '#e6f5da'; c.lineWidth = .6; c.beginPath(); c.arc(-1.6, 0, 1.2, 0, TAU); c.moveTo(2.8, 0); c.arc(1.6, 0, 1.2, 0, TAU); c.stroke(); c.restore(); } }
    // 5) lotes: sombras, casas con su techo y base de los edificios (el volumen de los edificios va en draw3D)
    const LT = this.lotes(cx, cy), poly = (P, dx, dy) => { c.moveTo(P[0] + dx, P[1] + dy); c.lineTo(P[2] + dx, P[3] + dy); c.lineTo(P[4] + dx, P[5] + dy); c.lineTo(P[6] + dx, P[7] + dy); c.closePath(); };
    c.fillStyle = 'rgba(8,14,30,.24)'; c.beginPath(); for (const L of LT.all) if (!L.B) poly(L.pts, 1.2, 1.5); c.fill();
    c.fillStyle = 'rgba(8,14,30,.26)'; for (const L of LT.all) if (L.B) { const d = 3 + L.z * 13, H = hull8(L.pts, d); c.beginPath(); c.moveTo(H[0], H[1]); for (let k = 2; k < H.length; k += 2) c.lineTo(H[k], H[k + 1]); c.closePath(); c.fill(); }
    c.fillStyle = '#8f9399'; c.beginPath(); for (const L of LT.all) if (L.B) poly(L.pts, 0, 0); c.fill();   // base de los edificios (su volumen va en draw3D)
    // casas con volumen: techo levantado según sus pisos y fachadas hacia el sur (la cámara inclinada de las ciudades de arcade); por color, en pocos trazos
    const muros = new Map(), techos = new Map(), ruta = (m, h) => m.get(h) || m.set(h, new Path2D()).get(h), cumbre = new Path2D(), tanques = new Path2D(), ropa = [];
    for (const L of LT.all) {
      if (L.B) continue; const P = L.pts, hz = 1.4 + L.z * 18, mx = L.x, my = L.y;
      for (let i = 0; i < 4; i++) { const j = (i + 1) & 3, ex = (P[i * 2] + P[j * 2]) / 2, ey = (P[i * 2 + 1] + P[j * 2 + 1]) / 2, ny = ey - my, nx = ex - mx; if (ny <= .05 * Math.abs(nx)) continue; const w = ruta(muros, Math.abs(nx) > Math.abs(ny) ? L.wb : L.wa); w.moveTo(P[i * 2], P[i * 2 + 1]); w.lineTo(P[j * 2], P[j * 2 + 1]); w.lineTo(P[j * 2], P[j * 2 + 1] - hz); w.lineTo(P[i * 2], P[i * 2 + 1] - hz); w.closePath(); }
      const t = ruta(techos, L.roof); t.moveTo(P[0], P[1] - hz); t.lineTo(P[2], P[3] - hz); t.lineTo(P[4], P[5] - hz); t.lineTo(P[6], P[7] - hz); t.closePath();
      if (L.k < .55) { cumbre.moveTo((P[0] + P[6]) / 2, (P[1] + P[7]) / 2 - hz); cumbre.lineTo((P[2] + P[4]) / 2, (P[3] + P[5]) / 2 - hz); }
      else if (L.k < .7) { const X = P[0] + (P[4] - P[0]) * .7, Y = P[1] + (P[5] - P[1]) * .35 - hz; tanques.moveTo(X + 1.4, Y); tanques.arc(X, Y, 1.4, 0, TAU); }
      else if (L.k > .93) ropa.push([L, hz]);
    }
    for (const [h, w] of muros) { c.fillStyle = h; c.fill(w); }
    for (const [h, t] of techos) { c.fillStyle = h; c.fill(t); }
    c.strokeStyle = 'rgba(20,16,12,.22)'; c.lineWidth = .7; c.stroke(cumbre); c.fillStyle = '#1e2126'; c.fill(tanques);
    for (const [L, hz] of ropa) for (let j = -1; j <= 1; j += 2) { const X = L.x + L.ux * j * L.w * .2 + L.nx * L.d * .15, Y = L.y + L.uy * j * L.w * .2 + L.ny * L.d * .15 - hz; c.fillStyle = ROPA[((L.k * 61 | 0) + j + 2) % ROPA.length]; c.fillRect(X - .7, Y - .7, 1.4, 1.5); }
    // edificios reales de los sitios (22-sitios.js): sombra, base de los altos y los bajos (1 o 2 pisos) con su volumen, como las casas
    const STR = this.sitTrozo(cx, cy);
    if (STR) {
      const anillos = (R, dx, dy) => { for (const P of R) { c.moveTo(P[0] + dx, P[1] + dy); for (let i = 2; i < P.length; i += 2) c.lineTo(P[i] + dx, P[i + 1] + dy); c.closePath(); } };
      c.fillStyle = 'rgba(8,14,30,.24)'; c.beginPath(); for (const b of STR.e) { if (b.oculto) continue; const d = 2 + b.z * 12; if (b.fl > 0) for (const k of [.34, .67, 1]) anillos(b.R, d * k * .55, d * k); if (b.P) for (const q of b.P) { const d2 = 2 + q.z1 * 12; for (const k of [.34, .67, 1]) anillos([q.B], d2 * k * .55, d2 * k); } } c.fill();   /* también la sombra de torres y agujas */
      c.fillStyle = '#8f9399'; c.beginPath(); for (const b of STR.e) if (!b.oculto && (b.fl >= 3 || b.P)) anillos(b.R, 0, 0); c.fill('evenodd');
      for (const b of STR.e) if (!b.oculto && b.fl < 3 && !b.P) sitEdifSuelo(c, b);
    }
    // nombres de las calles: sobre la calzada y en el sentido de la vía, cada ~550 m (como en los mapas)
    const NOM = VM.calles || []; c.font = '700 6.4px Cuerpo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const ch of CHS) {
      if (!ch.n || !(ch.k <= 4 || ch.k === 6)) continue; const nm = NOM[ch.n - 1]; if (!nm) continue;
      const tw = c.measureText(nm).width + 6, p = ch.p, tot = chainLen(p), gap = 880; let d = tot < gap ? tot / 2 : 300, s0 = 0;
      for (let i = 2; i < p.length && d < tot; i += 2) {
        const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, L = Math.hypot(dx, dy);
        for (; d < s0 + L; d += gap) {
          const t = d - s0; if (t < tw / 2 || L - t < tw / 2) continue; const X = ax + dx * t / L, Y = ay + dy * t / L;
          if (X - tw / 2 < px0 || X + tw / 2 > px0 + S || Y - tw / 2 < py0 || Y + tw / 2 > py0 + S) continue;
          let a = Math.atan2(dy, dx); if (a > Math.PI / 2 || a < -Math.PI / 2) a += Math.PI;
          c.save(); c.translate(X, Y); c.rotate(a); c.lineWidth = 1.8; c.lineJoin = 'round'; c.strokeStyle = 'rgba(28,32,40,.9)'; c.strokeText(nm, 0, 0); c.fillStyle = '#f2efe6'; c.fillText(nm, 0, 0); c.restore();
        }
        s0 += L;
      }
    }
    // parques y plazas con su nombre
    if (VM.parques) { if (!this._pq) { this._pq = new Map(); for (const [n, a, b, k] of VM.parques) { const x = a / 4 * TS, y = b / 4 * TS, key = Math.floor(x / S) + ',' + Math.floor(y / S); (this._pq.get(key) || this._pq.set(key, []).get(key)).push([n, x, y, k]); } }
      c.font = 'italic 700 6.6px Cuerpo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      const vistos = new Set(); for (const [n, x, y, k] of this._pq.get(cx + ',' + cy) || []) { if (vistos.has(n)) continue; vistos.add(n); const tw = c.measureText(n).width;   /* un nombre por trozo */ if (x - tw / 2 < px0 + 2 || x + tw / 2 > px0 + S - 2) continue; c.lineWidth = 2; c.strokeStyle = 'rgba(246,244,236,.92)'; c.strokeText(n, x, y); c.fillStyle = k === 2 ? '#6b5326' : '#2f6b2a'; c.fillText(n, x, y); } }
    this.sitNombres(c, cx, cy);   // universidades, alcaldías, hospitales y demás con su nombre
    // 6) mobiliario: postes de luz en el andén; en las avenidas, árboles (algunos guayacanes). No en las esquinas.
    for (const ch of CHS) {
      if (!(ch.k >= 1 && ch.k <= 4) || ch.k === 3) continue; const len = chainLen(ch.p), hw = ch.w / 2 + SWK[ch.k] * .55, step = ch.k === 2 ? 24 : 38; let j = 0;
      for (let s = 12 + h2(ch.p[0] | 0, ch.p[1] | 0, 70) * step; s < len - 12; s += step, j++) {
        const a = this.chPt(ch, s), b = this.chPt(ch, s + 2), L = Math.hypot(b.x - a.x, b.y - a.y) || 1, ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, sd = j % 2 ? 1 : -1, X = a.x - uy * hw * sd, Y = a.y + ux * hw * sd;
        if (X < px0 - 6 || Y < py0 - 6 || X > px0 + S + 6 || Y > py0 + S + 6) continue; const v = g(Math.floor(X / TS), Math.floor(Y / TS)); if (v === TT.WATER || v === TT.AUTO || v === TT.BRIDGE || v === TT.STATION) continue;
        if (ch.k === 2 && j % 3) { const k = h2(X | 0, Y | 0, 71), col = k < .14 ? '#f2c230' : k < .22 ? '#e88ab8' : '#3f8a3f', r = 4.4; c.fillStyle = 'rgba(8,14,30,.28)'; c.beginPath(); c.arc(X + 1.6, Y + 1.8, r, 0, TAU); c.fill(); c.fillStyle = shade(col, -.18); c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(X - .7, Y - .7, r * .76, 0, TAU); c.fill(); c.fillStyle = '#ffffff2e'; c.beginPath(); c.arc(X - 1.5, Y - 1.5, r * .36, 0, TAU); c.fill(); }
        else { const lx = X + uy * sd * 3.4, ly = Y - ux * sd * 3.4; c.strokeStyle = 'rgba(8,14,30,.28)'; c.lineWidth = .9; c.beginPath(); c.moveTo(X + 1.4, Y + 1.4); c.lineTo(lx + 1.4, ly + 1.4); c.stroke(); c.strokeStyle = '#2f3540'; c.lineWidth = .7; c.beginPath(); c.moveTo(X, Y); c.lineTo(lx, ly); c.stroke(); c.fillStyle = '#2f3540'; c.beginPath(); c.arc(X, Y, 1.1, 0, TAU); c.fill(); c.fillStyle = '#fff4cf'; c.beginPath(); c.ellipse(lx, ly, 1.3, .8, Math.atan2(uy, ux), 0, TAU); c.fill(); }
      }
    }
    // bancas en las plazas
    c.fillStyle = '#7a5a3a';
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) if (g(x, y) === TT.PLAZA && h2(x, y, 72) < .07 && !this.lid.has(this.idx(x, y))) { const X = x * TS + 4 + h2(x, y, 73) * 6, Y = y * TS + 5 + h2(x, y, 74) * 6; c.fillRect(X, Y, 5, 1.5); c.fillStyle = '#5c4229'; c.fillRect(X, Y + 1.5, 5, .5); c.fillStyle = '#7a5a3a'; }
    // lugares emblemáticos
    for (const i of LMV) this.lugar3(c, LANDMARKS[i], i, 1);   // árboles, esculturas, postes, buses, aviones, la rueda de Chicago, las cruces
    const cub = new Set(); if (verdeZ) for (const L of LT.all) { const P = L.pts; cub.add(this.idx(Math.floor(L.x / TS), Math.floor(L.y / TS))); for (let k = 0; k < 8; k += 2) cub.add(this.idx(Math.floor(P[k] / TS), Math.floor(P[k + 1] / TS))); }   // casillas con lote (ahí no van árboles)
    // árboles con sombra (en parques, monte y andenes anchos)
    for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
      const v = g(x, y), r = h2(x, y, 5); let rad = 0;
      const si = this.sitT ? this.sitT.get(this.idx(x, y)) : undefined, ens = si !== undefined; if (ens && this.sit.S[si] && this.sit.S[si].k === 'trans') continue;   // en los patios de trenes no hay árboles   // los campus son muy arborizados (así se ven desde el aire), y El Poblado y Laureles son casi bosque entre los edificios
      if (v === TT.GRASS && r < (ens || verdeZ ? .5 : .3) && !this.lid.has(this.idx(x, y))) rad = .36 + (r < .1 ? .14 : 0);
      else if (verdeZ && v === TT.WALK && r < .32) rad = .3 + r * .4;
      else if (pk(x, y) && r < (verdeZ ? .3 : .1)) rad = .3 + r * .3;   // arboledas sobre los parqueaderos y las entradas de las unidades
      else if (verdeZ && v === TT.BLDG && r < .34 && !cub.has(this.idx(x, y))) rad = .38 + r * .5;   // jardines entre las torres else if (v === TT.WALK && r < .14) rad = .26; else if (v === TT.MOUNT && r < .6) rad = .42 + r * .3;
      if (!rad) continue; const X = x * TS + TS * (.3 + h2(x, y, 7) * .4), Y = y * TS + TS * (.3 + h2(x, y, 8) * .4), k = h2(x, y, 6), col = k < .05 ? '#f2c230' : k < .09 ? '#e88ab8' : v === TT.MOUNT ? '#2f6a33' : '#3f8a3f', R = rad * TS; if (this.sitG && !this.sitLibre(cx, cy, X, Y)) continue;
      c.fillStyle = 'rgba(8,14,30,.28)'; c.beginPath(); c.arc(X + R * .35, Y + R * .4, R, 0, TAU); c.fill(); c.fillStyle = sombra18(col); c.beginPath(); c.arc(X, Y, R, 0, TAU); c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(X - R * .15, Y - R * .15, R * .78, 0, TAU); c.fill(); c.fillStyle = k < .09 ? '#fff3a088' : '#ffffff2e'; c.beginPath(); c.arc(X - R * .35, Y - R * .35, R * .38, 0, TAU); c.fill();
    }
    // 7) tranvía, Metroplús y metro: los andenes van A LO LARGO del trazo (siguen sus curvas), y los rieles mueren en ellos
    const near = (x, y, m) => x > px0 - m && y > py0 - m && x < px0 + S + m && y < py0 + S + m;
    const path = (L, w, col, dx = 0, dy = 0) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); L.pts.forEach((p, i) => i ? c.lineTo(p.x + dx, p.y + dy) : c.moveTo(p.x + dx, p.y + dy)); c.stroke(); };
    const tramo = (L, s0, s1, w, col, dx = 0, dy = 0) => { const n = Math.max(1, Math.ceil((s1 - s0) / 6)); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'butt'; c.beginPath(); for (let k = 0; k <= n; k++) { const p = this.at(L, s0 + (s1 - s0) * k / n); k ? c.lineTo(p.x + dx, p.y + dy) : c.moveTo(p.x + dx, p.y + dy); } c.stroke(); c.lineCap = 'round'; };
    const costillas = (L, s0, s1, w, col) => { c.strokeStyle = col; c.lineWidth = .9; c.beginPath(); for (let s = s0 + 7; s < s1 - 4; s += 14) { const p = this.at(L, s), nx = -Math.sin(p.a), ny = Math.cos(p.a); c.moveTo(p.x - nx * w, p.y - ny * w); c.lineTo(p.x + nx * w, p.y + ny * w); } c.stroke(); };
    // como en El Metro (35-ciudad.js de metrozero), en metros: tranvía con su lecho, cuatro rieles y el riel guía; Metroplús con su carril exclusivo; paradas con su andén
    const m = PXM, ID = x => x, IDY = (x, y) => y, offL = (L, rg, off, col, lw, dash) => { c.strokeStyle = col; c.lineWidth = lw; if (dash) c.setLineDash(dash); c.beginPath(); for (let s = rg[0]; s <= rg[1] + 4; s += 4) { const q = this.at(L, Math.min(s, rg[1]), off); s === rg[0] ? c.moveTo(q.x, q.y) : c.lineTo(q.x, q.y); } c.stroke(); if (dash) c.setLineDash([]); };
    const anden = (L, s0, s1, o, w, col) => { sisBanda(c, this, L, s0, s1, o, o + w, 0, ID, IDY); c.save(); c.translate(1.6, 2.6); c.fillStyle = 'rgba(0,0,0,.22)'; c.fill(); c.restore(); c.fillStyle = '#ece6d6'; c.fill(); c.strokeStyle = 'rgba(40,36,30,.5)'; c.lineWidth = .32; c.stroke(); sisBanda(c, this, L, s0 + 3 * m, s1 - 3 * m, o + w * .45, o + w, 0, ID, IDY); c.fillStyle = col; c.fill(); };
    { const T = this.tram, rg = this.altRango(T, px0, py0, S, 60); if (rg) { offL(T, rg, 0, 'rgba(30,30,30,.45)', 6.4 * m); offL(T, rg, 0, '#6a6e74', 6 * m); for (const o of [-1.9, -.5, .5, 1.9]) offL(T, rg, o * m, '#2e3034', .38); offL(T, rg, 0, '#c9c9c4', .4); }
      for (const st of T.st || []) { const p = this.at(T, st.s); if (!near(p.x, p.y, 60)) continue; const s0 = clamp(st.s - SIS.tram.plat * m / 2, 0, T.len), s1 = clamp(st.s + SIS.tram.plat * m / 2, 0, T.len); for (const sd of [-1, 1]) anden(T, s0, s1, sd * 3.3 * m, sd * 2.8 * m, SIS.tram.col); } }
    for (const L of this.mp || []) { const rg = this.altRango(L, px0, py0, S, 60); if (!rg) continue; offL(L, rg, 0, '#9a958a', 8 * m); offL(L, rg, 0, '#4b5058', 7 * m); offL(L, rg, 0, L.col + '88', 6 * m); offL(L, rg, 0, 'rgba(255,255,255,.85)', .3 * m, [2.5 * m, 3.5 * m]); }
    for (const L of this.mp || []) for (const st of L.st) { const p = this.at(L, st.s); if (!near(p.x, p.y, 60)) continue; const s0 = clamp(st.s - SIS.brt.plat * m / 2, 0, L.len), s1 = clamp(st.s + SIS.brt.plat * m / 2, 0, L.len); anden(L, s0, s1, -1.9 * m, -3.2 * m, L.col); }
    const SL = 21 * MS * 1.55, SW = 11 * MS * .9;
    this.altSuelo(c, px0, py0, S);   // sombras y pilares de lo que va en alto (76-altura.js)
    for (const L of [this.lineA, this.lineB]) {
      if (L.alto && L.alto.length) {   // solo los tramos a nivel del suelo; el viaducto va en alto (draw3D)
        const rg = this.altRango(L, px0, py0, S, 40); let s = 0;
        const seg = []; for (const a of L.alto) { if (a.s0 > s) seg.push([s, a.s0]); s = a.s1; } if (s < L.len) seg.push([s, L.len]);
        for (const [a0, b0] of seg) { if (!rg) break; const a = Math.max(a0, rg[0]), b = Math.min(b0, rg[1]); if (b - a < 1) continue; tramo(L, a, b, 13, 'rgba(8,14,30,.3)', 4, 5); tramo(L, a, b, 13, '#8d939c'); tramo(L, a, b, 10.5, '#d3d6db'); tramo(L, a, b, 4.6, '#9aa0a8'); tramo(L, a, b, 3.4, '#d3d6db'); }
      } else { path(L, 13, 'rgba(8,14,30,.3)', 4, 5); path(L, 13, '#8d939c'); path(L, 10.5, '#d3d6db'); path(L, 4.6, '#9aa0a8'); path(L, 3.4, '#d3d6db'); }
      for (const st of L.st) { if (st.alto) continue; const p = this.at(L, st.s); if (!near(p.x, p.y, SL + 20)) continue; const s0 = Math.max(0, st.s - SL), s1 = Math.min(L.len, st.s + SL), col = L === this.lineA ? '#1C5C9C' : '#E38835';
        tramo(L, s0, s1, SW * 2, 'rgba(8,14,30,.3)', 3, 4); tramo(L, s0, s1, SW * 2, col); tramo(L, s0, s1, SW * 2 - 6.8, '#eef0f3'); costillas(L, s0, s1, SW - 4, '#c3c8cf'); }
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
});
/* casco convexo de un rectángulo y su sombra corrida d px (sol del noroeste) */
function hull8(P, d) {
  const q = []; for (let k = 0; k < 8; k += 2) { q.push([P[k], P[k + 1]], [P[k] + d, P[k + 1] + d]); }
  q.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of q) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = q.length - 1; i >= 0; i--) { const p = q[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  const h = lo.slice(0, -1).concat(up.slice(0, -1)), out = []; for (const p of h) out.push(p[0], p[1]); return out;
}
/* edificios con volumen: cada lote de edificio se levanta con perspectiva desde el jugador (lo lejano primero), girado con su calle */
Ride.prototype.draw3D = function (c, ox, oy, vw, vh) {
  if (GFX() !== '3d') return; const M = this.map, E = this.ojo(), px = E.x - ox, py = E.y - oy, K = E.K, S = CH * TS, nb = Math.round(Art.night(this.min) * 3), L = [], mg = 70;   // perspectiva desde el ojo de la cámara (sobre el jugador, o corrido si está inclinada)
  const fast3D = JE.calidad3D === 0 || ((this.til || 0) > .55 && (View.zf || 1) < .82), maxD2 = fast3D ? 270 * 270 : 1e9;
  for (let cy = Math.floor((oy - mg) / S); cy <= Math.floor((oy + vh + mg) / S); cy++) for (let cx = Math.floor((ox - mg) / S); cx <= Math.floor((ox + vw + mg) / S); cx++) {
    if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) continue;
    for (const b of M.lotes(cx, cy).ed) { const x = b.x - ox, y = b.y - oy, m2 = b.z > .6 ? mg + 200 : mg; if (x > vw + m2 || y > vh + m2 || x < -m2 || y < -m2) continue; if (b.gx != null) { const gx = b.gx - ox - px, gy = b.gy - oy - py; b.dd = gx * gx + gy * gy + (2 - b.z); } else b.dd = (x - px) * (x - px) + (y - py) * (y - py); if (fast3D && !b.t && b.z < .16 && b.dd > maxD2) continue; L.push(b); }   /* las partes de un lugar van juntas: primero las bajas, luego las torres */
    const AP = M.altG && M.altG.get(cx + ',' + cy); if (AP) for (const b of AP) { const x = b.x - ox, y = b.y - oy; if (x > vw + mg + 40 || y > vh + mg + 40 || x < -mg - 40 || y < -mg - 40) continue; b.dd = (x - px) * (x - px) + (y - py) * (y - py); L.push(b); }   /* lo que va en alto: viaducto del metro, estaciones elevadas y puentes (76-altura.js) */
    const ST = M.sitTrozo(cx, cy); if (ST) for (const b of ST.e) { if (b.oculto || (b.fl < 3 && !b.P) || Math.floor(b.x / S) !== cx || Math.floor(b.y / S) !== cy) continue; const x = b.x - ox, y = b.y - oy, m2 = ((b.zt || b.z) > .6 ? mg + 200 : mg) + (b.bb[2] - b.bb[0]) / 2; if (x > vw + m2 || y > vh + m2 || x < -m2 || y < -m2) continue; b.dd = (x - px) * (x - px) + (y - py) * (y - py); L.push(b); }   /* edificios reales de los sitios (22-sitios.js) */
  }
  L.sort((a, b) => b.dd - a.dd); c.lineWidth = .5; const bx = [0, 0, 0, 0], by = [0, 0, 0, 0], rx = [0, 0, 0, 0], ry = [0, 0, 0, 0];
  for (const b of L) {
    if (b.alto) { this.altoPieza(c, b, ox, oy, px, py, K, nb); continue; }
    const p = b.pal[nb] || (b.pal[nb] = { roof: mixHex(b.roof, '#0b1430', nb * .17), wa: mixHex(b.wa, '#0b1430', nb * .17), wb: mixHex(b.wb, '#0b1430', nb * .17), ln: nb >= 2 ? '#ffd97a' : shade(b.wb, -.22), top: mixHex(shade(b.roof, .16), '#0b1430', nb * .17) });
    if (b.sitio) { sitEdif3D(c, b, ox, oy, px, py, K, p, nb); continue; }   // con su forma real
    const f = 1 + K * b.z, Q = b.pts, nf = b.nf || Math.max(1, Math.round(b.z * 9));
    for (let i = 0; i < 4; i++) { const x = Q[i * 2] - ox, y = Q[i * 2 + 1] - oy; bx[i] = x; by[i] = y; rx[i] = px + (x - px) * f; ry[i] = py + (y - py) * f; }
    const mx = (bx[0] + bx[2]) / 2, my = (by[0] + by[2]) / 2;
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) & 3, ex = (bx[i] + bx[j]) / 2, ey = (by[i] + by[j]) / 2, nx = ex - mx, ny = ey - my;
      if (nx * (px - ex) + ny * (py - ey) <= 0) continue;   // esa pared mira hacia el otro lado
      c.fillStyle = Math.abs(nx) > Math.abs(ny) ? p.wb : p.wa; c.beginPath(); c.moveTo(bx[i], by[i]); c.lineTo(bx[j], by[j]); c.lineTo(rx[j], ry[j]); c.lineTo(rx[i], ry[i]); c.closePath(); c.fill();
      if (nf > 1 && !(fast3D && b.dd > 180 * 180 && !b.t)) { c.strokeStyle = b.lnc ? (p.lnc || (p.lnc = mixHex(b.lnc, '#0b1430', nb * .17))) : p.ln; if (nb >= 2) c.setLineDash([1.2, 2.2]); c.beginPath(); for (let k = 1; k < nf; k++) { const t = k / nf; c.moveTo(bx[i] + (rx[i] - bx[i]) * t, by[i] + (ry[i] - by[i]) * t); c.lineTo(bx[j] + (rx[j] - bx[j]) * t, by[j] + (ry[j] - by[j]) * t); } c.stroke(); if (nb >= 2) c.setLineDash([]); }
    }
    c.fillStyle = p.roof; c.beginPath(); c.moveTo(rx[0], ry[0]); c.lineTo(rx[1], ry[1]); c.lineTo(rx[2], ry[2]); c.lineTo(rx[3], ry[3]); c.closePath(); c.fill();
    const cxr = (rx[0] + rx[2]) / 2, cyr = (ry[0] + ry[2]) / 2; if (!(b.t === 'dos' || b.t === 'cuatro' || b.t === 'aguja') && !(fast3D && b.dd > 180 * 180)) { c.strokeStyle = p.top; c.beginPath(); for (let i = 0; i < 4; i++) { const x = cxr + (rx[i] - cxr) * .84, y = cyr + (ry[i] - cyr) * .84; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.stroke(); }
    if (b.t) techoLM(c, b, rx, ry, p, nb, px, py, f, K); else if (!(fast3D && b.dd > 160 * 160)) techoL(c, b, rx, ry, p);
  }
};
/* techos de los edificios, en el sentido del lote: aires, tanques, helipuerto, jardín o paneles */
function techoL(c, b, rx, ry, p) {
  const ux = rx[1] - rx[0], uy = ry[1] - ry[0], vx = rx[3] - rx[0], vy = ry[3] - ry[0], w = Math.hypot(ux, uy), h = Math.hypot(vx, vy); if (w < 12 || h < 12) return;
  const at = (a, d) => [rx[0] + ux * a + vx * d, ry[0] + uy * a + vy * d], quad = (a0, d0, a1, d1, col) => { const A = at(a0, d0), B = at(a1, d0), C = at(a1, d1), D = at(a0, d1); c.fillStyle = col; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.lineTo(C[0], C[1]); c.lineTo(D[0], D[1]); c.closePath(); c.fill(); }, k = b.k;
  if (k < .3) { quad(.22, .3, .34, .44, p.top); quad(.4, .3, .5, .44, p.top); }
  else if (k < .5) { const C = at(.7, .38); c.fillStyle = p.top; c.beginPath(); c.arc(C[0], C[1], 2.4, 0, TAU); c.fill(); }
  else if (k < .64 && b.z > .5) { const C = at(.5, .5); c.strokeStyle = '#e8e6de'; c.lineWidth = .8; c.beginPath(); c.arc(C[0], C[1], Math.min(w, h) * .22, 0, TAU); c.stroke(); quad(.44, .4, .47, .6, '#e8e6de'); quad(.53, .4, .56, .6, '#e8e6de'); quad(.44, .49, .56, .52, '#e8e6de'); c.lineWidth = .5; }
  else if (k > .86) quad(.1, .55, .55, .88, '#6aa94f');
  else if (k > .74) { quad(.12, .5, .5, .82, '#22365e'); c.strokeStyle = '#5b7db0'; c.lineWidth = .3; c.beginPath(); for (let a = .18; a < .5; a += .07) { const A = at(a, .5), B = at(a, .82); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); } c.stroke(); c.lineWidth = .5; }
}

/* ---------- personajes y vehículos dibujados (ciudad 3D) ---------- */
const SPR4 = 4;
function vsprite(key, base, draw) { const k = 'v' + key; let c = Art.cache.get(k); if (c) return c; c = Art.mk(base.width * SPR4, base.height * SPR4, x => { x.scale(SPR4, SPR4); x.lineCap = 'round'; x.lineJoin = 'round'; draw(x, base.width, base.height); }); c.sc = SPR4; Art.cache.set(k, c); return c; }
const ell = (x, cx, cy, rx, ry, col) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill(); };
const rrect = (x, a, b, w, h, r, col) => { x.fillStyle = col; x.beginPath(); x.roundRect(a, b, w, h, r); x.fill(); };
const line = (x, a, b, c2, d, w, col) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke(); };
for (const [name, fn] of Object.entries({
  riderTop: (base, a) => vsprite('rt' + a.join(), base, (x, w, h) => { const [shirt, helmet, skin, frame = PAL.vd] = a; ell(x, w / 2, 1.3, .7, 1.3, '#1b1f27'); ell(x, w / 2, h - 1.4, .7, 1.4, '#1b1f27'); line(x, w / 2, 2.6, w / 2, h - 2.6, .9, frame); line(x, .6, 3.4, w - .6, 3.4, .7, '#30343c'); line(x, 1.9, 5.6, .9, 3.5, .9, skin); line(x, w - 1.9, 5.6, w - .9, 3.5, .9, skin); ell(x, w / 2, 6.4, 2.4, 1.9, shirt); ell(x, w / 2, 6.3, 1.5, 1.7, helmet); x.fillStyle = '#ffffff55'; x.fillRect(w / 2 - .25, 4.8, .5, 3); }),
  bikeTop: (base) => vsprite('bt', base, (x, w, h) => { ell(x, w / 2, 1.2, .55, 1.2, '#1b1f27'); ell(x, w / 2, h - 1.2, .55, 1.2, '#1b1f27'); line(x, w / 2, 2, w / 2, h - 2, .8, PAL.vd); line(x, 0, 2.4, w, 2.4, .6, '#30343c'); }),
  carTop: (base, a) => vsprite('ct' + a.join(), base, (x, w, h) => {
    const [col, kind] = a; if (kind === 'moto') { ell(x, w / 2, h / 2, w * .3, h * .45, '#1b1f27'); ell(x, w / 2, h * .45, w * .32, h * .22, col); ell(x, w / 2, h * .55, w * .26, w * .26, '#e8e8e8'); return; }
    rrect(x, .3, .3, w - .6, h - .6, Math.min(w, h) * .28, col); const glass = '#1f2f45';
    if (kind === 'bus') { rrect(x, .9, .9, w - 1.8, h * .1, 1, glass); for (let i = 0; i < 5; i++) { x.fillStyle = glass; x.fillRect(.5, h * (.2 + i * .14), .7, h * .1); x.fillRect(w - 1.2, h * (.2 + i * .14), .7, h * .1); } rrect(x, w * .25, h * .3, w * .5, h * .5, 1, shade(col, .12)); return; }
    if (kind === 'camion') { rrect(x, .4, .4, w - .8, h * .3, 1.2, col); rrect(x, .9, .9, w - 1.8, h * .1, .6, glass); rrect(x, .2, h * .33, w - .4, h * .66, .6, '#c9ccd1'); return; }
    rrect(x, .9, h * .2, w - 1.8, h * .17, 1, glass); rrect(x, .9, h * .68, w - 1.8, h * .12, 1, glass); rrect(x, 1, h * .39, w - 2, h * .27, 1, shade(col, .1)); x.fillStyle = '#fff6b0'; x.fillRect(.6, .4, 1, .5); x.fillRect(w - 1.6, .4, 1, .5);
    if (kind === 'taxi') rrect(x, w / 2 - 1, h * .46, 2, 1, .4, '#1d1f24');
  }),
  truckTop: (base, a) => vsprite('tt' + a.join(), base, (x, w, h) => { const [load = 0, cap = 14] = a; rrect(x, .4, .4, w - .8, h * .26, 1.4, '#e9eef3'); rrect(x, 1, .9, w - 2, h * .09, .6, '#1f2f45'); rrect(x, .2, h * .3, w - .4, h * .68, .8, PAL.vd); const n = Math.min(8, Math.round(8 * load / Math.max(1, cap))); for (let i = 0; i < n; i++) line(x, 1.2, h * .34 + i * h * .075, w - 1.2, h * .34 + i * h * .075, .7, '#1b1f27'); }),
  walker: (base, a) => vsprite('wk' + a.join() + Save.data.profile.shirt + Save.data.profile.skin, base, (x, w, h) => { const P = Save.data.profile, f = a[0] | 0; ell(x, w / 2 - .9, h / 2 + (f ? 1.4 : -1.4), .6, 1, '#2a3550'); ell(x, w / 2 + .9, h / 2 + (f ? -1.4 : 1.4), .6, 1, '#2a3550'); ell(x, w / 2, h / 2, w * .42, h * .2, SHIRTS[P.shirt] || PAL.vd); ell(x, w / 2, h / 2, w * .22, w * .22, PELO[P.hairCol | 0] || '#2a1a10'); }),
  trainCar: (base) => vsprite('tc', base, (x, w, h) => { rrect(x, .15, .15, w - .3, h - .3, 1.8, '#e6e9ee'); rrect(x, .9, 1.4, w - 1.8, h - 2.8, 1.1, '#c9cfd8'); for (let i = 0; i < 3; i++) rrect(x, w / 2 - 1.2, 3 + i * 4, 2.4, 2, .6, '#8e98a6'); rrect(x, .15, .15, w - .3, 1.2, .6, PAL.vd); rrect(x, .15, h - 1.35, w - .3, 1.2, .6, PAL.vd); x.fillStyle = '#ffffff66'; x.fillRect(.6, 1.6, .5, h - 3.2); })
})) { const orig = Art[name]; Art[name] = function (...a) { const base = orig.apply(this, a); return GFX() === '3d' && !base.sc ? fn(base, a) : base; }; }

/* ---------- vista panorámica de plataformas ---------- */
Object.assign(Ride.prototype, {
  jump() { if (!panoOn(this) || (this.z | 0) > 0 || this.p.veh !== 'bike') return; this.vz = 150; this.z = .01; Snd.sfx('tap'); },
  panoTick(dt) {
    const P = this.p; this.trav = (this.trav || 0) + P.v * dt;
    if (this.z > 0) { this.z += this.vz * dt; this.vz -= 420 * dt; if (this.z <= 0) { this.z = 0; this.vz = 0; } }
    const O = this.obs || (this.obs = []); while (O.length < 4) { const last = O.length ? O[O.length - 1].d : this.trav + 220; O.push({ d: last + 260 + this.rng.f() * 380, k: this.rng.pick(['hueco', 'cono', 'charco', 'hueco']) }); }
    for (const o of O) if (!o.done && this.trav >= o.d) { o.done = true; if (this.z > 5) { this.mode.score += 2; Snd.note(4); this.float('¡Salto!', PAL.vd1); } else if (P.veh === 'bike') { P.v *= .35; this.shake = .25; Snd.sfx('bad'); this.float({ hueco: '¡Hueco!', cono: '¡Cono!', charco: '¡Charco!' }[o.k], PAL.amb); } }
    while (O.length && O[0].done && O[0].d < this.trav - 200) O.shift();
  },
  renderPano(V, min) {
    const b = V.b, q = V.q || 1, vw = V.vw, vh = V.vh, P = this.p, M = this.map; b.setTransform(q, 0, 0, q, 0, 0); V.subX = V.subY = 0; this.min = min;
    if (this.pa == null) this.pa = P.a; if (P.v > 3) { let d = P.a - this.pa; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; this.pa += d * .06; }
    const ax = Math.cos(this.pa), ay = Math.sin(this.pa), xr = Math.round(vw * .38), sc = .6, ex = .9, e0 = M.elev(P.x, P.y), base = Math.round(vh * .7), tr = this.trav || 0;
    const prof = x => { const d = (x - xr) / sc; return base - (M.elev(P.x + ax * d, P.y + ay * d) - e0) * ex; };
    const hor = Math.round(vh * .52); b.drawImage(Art.panorama(vw, vh, min, hor), 0, 0);
    // capa media: ciudad real alrededor (edificios altos, casas en ladera, árboles), con paralaje
    const par = .45, step = 22;
    for (let i = -1; i <= Math.ceil(vw / step) + 1; i++) {
      const sx = i * step - ((tr * sc * par) % step), k0 = Math.floor((tr * sc * par) / step) + i, d = (sx - xr) / sc / par, wx = P.x + ax * d - ay * 90, wy = P.y + ay * d + ax * 90, v = M.get(Math.floor(wx / TS), Math.floor(wy / TS)), hh = h2(k0, 3, 7), gy = prof(sx) - 6;
      if (v === TT.BLDG) { const H = 22 + Math.round(hh * 46), W = 14 + Math.round(hh * 8), col = ROOF[(hh * ROOF.length) | 0]; prect(b, sx, gy - H, W, H, shade(col, -.12)); for (let yy = gy - H + 3; yy < gy - 4; yy += 5) for (let xx = sx + 2; xx < sx + W - 2; xx += 4) prect(b, xx, yy, 2, 2, Art.night(min) > .4 && h2(xx, yy, k0) < .5 ? '#ffe9a0' : '#9fb4c8'); }
      else if (v === TT.BRICK || v === TT.MOUNT && hh < .4) { const col = TEJA[(hh * TEJA.length) | 0]; prect(b, sx, gy - 12, 14, 12, '#d8c8b0'); prect(b, sx - 1, gy - 15, 16, 4, col); prect(b, sx + 5, gy - 7, 4, 7, '#6e4a2a'); }
      else if (v === TT.GRASS || v === TT.MOUNT) { pdisc(b, sx + 6, gy - 12, 7, '#3f8a3f'); prect(b, sx + 5, gy - 6, 2, 6, '#6e4a2a'); }
    }
    // suelo con el perfil real de la vía (subidas y bajadas exageradas para verlas)
    const tile = M.get(Math.floor(P.x / TS), Math.floor(P.y / TS)), cic = tile === TT.CICLO;
    for (let x = 0; x <= vw; x += 2) { const y = Math.round(prof(x)); prect(b, x, y, 2, 3, '#e3ded3'); prect(b, x, y + 3, 2, 10, cic ? '#2f9e57' : '#52575f'); prect(b, x, y + 13, 2, vh - y, '#6b5a43'); if (((x + Math.floor(tr * sc)) & 15) < 7) prect(b, x, y + 8, 2, 1, cic ? '#e8f5d0' : '#e4e4dc'); }
    // vehículos cercanos en la misma vía, vistos de lado
    for (const cr of this.cars) { const dx = cr.x - P.x, dy = cr.y - P.y, al = dx * ax + dy * ay, lat = -dx * ay + dy * ax; if (Math.abs(lat) > 40 * WK || Math.abs(al) > vw / sc) continue; const x = xr + al * sc, y = prof(x) + 5, L = cr.kind === 'bus' ? 30 : cr.kind === 'moto' ? 9 : cr.kind === 'camion' ? 26 : 16, H = cr.kind === 'bus' || cr.kind === 'camion' ? 14 : cr.kind === 'moto' ? 6 : 8;
      prect(b, x - L / 2, y - H, L, H, cr.col); prect(b, x - L / 2 + 2, y - H + 2, L - 4, 3, '#1f2f45'); pdisc(b, x - L / 2 + 3, y, 2, '#1b1f27'); pdisc(b, x + L / 2 - 3, y, 2, '#1b1f27'); }
    // estaciones EnCicla al pasar
    for (const s of M.stations) { const dx = s.x - P.x, dy = s.y - P.y, al = dx * ax + dy * ay, lat = Math.abs(-dx * ay + dy * ax); if (lat > 50 * WK || Math.abs(al) > vw / sc) continue; const x = Math.round(xr + al * sc), y = Math.round(prof(x)); prect(b, x - 16, y - 18, 32, 4, PAL.vd); prect(b, x - 14, y - 14, 2, 14, '#9aa7b8'); for (let i = 0; i < 5; i++) { prect(b, x - 9 + i * 5, y - 7, 1, 7, '#59606c'); prect(b, x - 10 + i * 5, y - 6, 3, 3, PAL.vd); } (this.pLab || (this.pLab = [])).push({ t: s.name, x, y: y - 22 }); }
    // obstáculos para saltar
    for (const o of this.obs || []) { if (o.done) continue; const x = Math.round(xr + (o.d - tr) * sc); if (x < -10 || x > vw + 10) continue; const y = Math.round(prof(x)) + 3; if (o.k === 'hueco') { prect(b, x - 5, y, 10, 3, '#1d1f24'); } else if (o.k === 'cono') { prect(b, x - 1, y - 7, 3, 7, '#f07a1a'); prect(b, x - 1, y - 5, 3, 1, '#fff'); prect(b, x - 3, y, 7, 1, '#f07a1a'); } else { prect(b, x - 7, y, 14, 2, '#7fb6e6'); prect(b, x - 4, y, 6, 1, '#cfe6fa'); } }
    // el jugador, de lado
    const y = Math.round(prof(xr)) + 3 - Math.round(this.z || 0), ph = this.trav ? this.trav / 18 : 0, me = this.mode.uniform ? Art.me({ uniforme: true }) : Art.me();
    if (P.veh === 'truck') { prect(b, xr - 18, y - 16, 36, 13, PAL.vd); prect(b, xr + 10, y - 22, 9, 10, '#e9eef3'); prect(b, xr + 12, y - 20, 5, 4, '#1f2f45'); pdisc(b, xr - 11, y - 2, 3, '#1b1f27'); pdisc(b, xr + 12, y - 2, 3, '#1b1f27'); }
    else if (P.veh === 'walk') Art.person(b, xr, y, me, ph, 1);
    else { Art.bikeSide(b, xr, y - 6, { r: 5, face: 1, col: bikeCol() }); const lx = Math.round(Math.sin(ph * 3) * 2); prect(b, xr - 1 + lx, y - 15, 2, 5, me.pants); prect(b, xr - 1 - lx, y - 15, 2, 5, shade(me.pants, -.2)); prect(b, xr - 2, y - 23, 5, 8, me.vest ? PAL.vd : me.shirt); pline(b, xr + 2, y - 21, xr + 5, y - 18, me.skin); prect(b, xr - 1, y - 28, 5, 5, me.skin); prect(b, xr - 2, y - 30, 7, 3, me.cap || HELMETS[Save.data.profile.helmet] || '#fff'); prect(b, xr + 3, y - 26, 1, 1, '#141414'); }
    if (this.z > 0) { b.fillStyle = '#0004'; b.fillRect(xr - 6, Math.round(prof(xr)) + 4, 12, 2); }
    this.panoXY = { x: xr, y: y - 30 };
  }
});
const _render75 = Ride.prototype.render;
Ride.prototype.render = function (V, min) { this.pLab = []; if (panoOn(this)) return this.renderPano(V, min); this.z = 0; return _render75.call(this, V, min); };
const _rtop75 = Ride.prototype.renderTop;
Ride.prototype.renderTop = function (V) {
  if (!panoOn(this)) return _rtop75.call(this, V);
  const c = V.ctx, n = Art.night(this.min); if (n > 0) { c.fillStyle = 'rgba(8,18,52,' + (n * .45).toFixed(3) + ')'; c.fillRect(0, 0, V.w, V.h); }
  if (this.mode.mods.rain) { c.strokeStyle = '#cfe0ff55'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 60; i++) { const x = (i * 97 + performance.now() * .3) % V.w, y = (i * 53 + performance.now() * .6) % V.h; c.moveTo(x, y); c.lineTo(x - 3, y + 9); } c.stroke(); }
};
const _hud75 = Ride.prototype.hud;
Ride.prototype.hud = function (V, opts) {
  if (!panoOn(this)) return _hud75.call(this, V, opts);
  const cx = this.cxf, cy = this.cyf, T = this.target, fx = this.fx; this.cxf = -1e7; this.cyf = -1e7; this.target = null; this.fx = [];
  try { _hud75.call(this, V, opts); } finally { this.cxf = cx; this.cyf = cy; this.target = T; this.fx = fx; }
  const s = V.s, pp = this.panoXY || { x: 0, y: 0 };
  for (const l of (this.pLab || []).slice(0, 2)) V.text(l.t, l.x * s, l.y * s, { size: 11, align: 'center', bg: '#0a2342dd', color: '#c4ec7c', pad: 3 });
  for (const f of fx) if (f.k === 't') V.text(f.txt, pp.x * s, pp.y * s - 10, { size: 16, align: 'center', stroke: '#0a2342', sw: 4, color: f.col });
  const pct = Math.round((this.sl || 0) * 100); if (Math.abs(pct) >= 3) V.text((pct > 0 ? '▲ SUBIDA ' : '▼ BAJADA ') + Math.abs(pct) + ' %', pp.x * s, pp.y * s - 30, { size: 13, align: 'center', color: pct > 0 ? PAL.amb : PAL.cie, stroke: '#0a2342', sw: 4 });
  if (T) { const d = Math.round(dist(T.x, T.y, this.p.x, this.p.y) * M_PER_PX), lb = (T.label || 'Destino').slice(0, 30); V.text('➜ ' + lb + ' · ' + (d >= 1000 ? (d / 1000).toFixed(1) + ' km' : d + ' m'), V.w / 2, (View.top || 60) + 46, { size: 14, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 5, body: true }); }
};
const _upd75 = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) { _upd75.call(this, dt, dir); if (panoOn(this)) this.panoTick(dt); };
/* control en panorámica: la bici sigue la ruta sola; tú pedaleas (→), frenas (←) y saltas (↑ o botón) */
const _mupd75 = MapMode.prototype.update;
MapMode.prototype.update = function (dt) {
  const R = this.ride; if (!R || this.sub || this.botDir || !panoOn(R) || R.big) return _mupd75.call(this, dt);
  const inp = Input.dir(); let d;
  if (R.target) { this.botDrive(); d = this.botDir; } else d = { x: Math.cos(R.p.a), y: Math.sin(R.p.a), m: 1 };
  const thr = inp.m > .2 ? (inp.x < -.4 ? 0 : clamp(.6 + .5 * Math.max(inp.x, 0), .6, 1)) : .6;
  if (inp.m > .5 && inp.y < -.65) R.jump();
  this.botDir = { x: d.x, y: d.y, m: d.m === 0 ? 0 : thr };
  try { _mupd75.call(this, dt); } finally { this.botDir = null; }
};
const _act75 = MapMode.prototype.actions;
MapMode.prototype.actions = function () { const a = _act75.call(this); if (this.ride && !this.sub) { if (panoOn(this.ride) && this.ride.p.veh === 'bike') a.unshift({ id: 'jump', icon: 'llanta', label: 'Saltar', fn: () => this.ride.jump() }); } return a; };
const _key75 = MapMode.prototype.key;
MapMode.prototype.key = function (e) { if (e.code === 'KeyV') return toggleVista(); if (panoOn(this.ride) && (e.code === 'Space' || e.code === 'ArrowUp')) return this.ride.jump(); return _key75.call(this, e); };
function toggleVista() { const S = Save.data.settings; S.vista = S.vista === 'pano' ? 'cenital' : 'pano'; Save.save(); Snd.sfx('tap'); JE.ui && JE.ui.toast(S.vista === 'pano' ? '🎬 Vista panorámica: la bici sigue la ruta; tú pedaleas, frenas y saltas' : '🗺️ Vista cenital'); }
/* pausa: cambiar de vista */
const _pause75 = Game.pause;
Game.pause = function () { _pause75.call(this); const m = $('#pMap'); if (!m || !this.mode || !this.mode.ride) return; const b = document.createElement('button'); b.className = 'btn'; b.id = 'pVista'; b.textContent = Save.data.settings.vista === 'pano' ? '🗺️ Vista cenital' : '🎬 Vista panorámica'; m.parentNode.insertBefore(b, m.nextSibling); b.onclick = () => { toggleVista(); this.resume(); }; };
/* Más: gráficos y vista */
const _mas75 = UI.renderMas;
UI.renderMas = function () {
  _mas75.call(this); const z = $('#tab-mas [data-zoom]'); if (!z) return; const row = z.closest('.opt'), S = Save.data.settings;
  const d = document.createElement('div'); d.innerHTML = `<div class="opt"><span>Gráficos</span><div class="seg">${[['3d', 'Ciudad 3D'], ['pixel', 'Pixel clásico']].map(([k, n]) => `<button data-gfx="${k}" class="${GFX() === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <div class="opt"><span>Vista del mapa<br><small class="m">Panorámica: de lado, estilo plataformas (tecla V)</small></span><div class="seg">${[['cenital', 'Cenital'], ['pano', 'Panorámica']].map(([k, n]) => `<button data-vista="${k}" class="${(S.vista || 'cenital') === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>`;
  while (d.firstChild) row.parentNode.insertBefore(d.lastChild, row.nextSibling);
  $$('[data-gfx]').forEach(b => b.onclick = () => { S.gfx = b.dataset.gfx; Save.save(); Art.cache.clear(); CityMap.chunks2.clear(); CityMap.chunks.clear(); Snd.sfx('tap'); this.renderMas(); });
  $$('[data-vista]').forEach(b => b.onclick = () => { S.vista = b.dataset.vista; Save.save(); Snd.sfx('tap'); this.renderMas(); });
};
```


#### Cómo probar M3

1. Iniciar un turno de **Anfitrión** (o entrar a una estación manual en Modo Libre): observar a través del ventanal de la caseta el escritorio de madera, el tablero de llaves por colores, el chaleco reflectivo colgado, la tula verde, el cargador con LED verde y el pocillo de tinto.
2. En **Modo Libre** con gráficos **Ciudad 3D**, acercar la cámara (`+`) sobre cualquier estación EnCicla para ver la caseta amoblada o el tótem automático con su halo Cívica pulsante y los LEDs de los anclajes.
3. Subir hacia **San Javier (Comuna 13)** o **Manrique / Santo Domingo**: observar las terrazas de plancha con tanques negros de agua, ropa tendida y escaleras exteriores.

---

### M4 · Run EnCicla · Carrera sin fin en 3D `[Juega EnCicla]`

#### Qué se hizo en M4

1. **Nuevo modo `MGRunner3D` (`src/js/91-runner.js`):**
   - Inspirado en *RunRunZero* y conectado directamente a las coordenadas, barrios y pendientes reales del mapa unificado del Valle de Aburrá.
   - Incluye **6 corredores reales**:
     1. *Ciclorruta Parques del Río* (`La Alpujarra → Conquistadores → Carlos E. Restrepo`),
     2. *Corredor Av. Las Vegas* (`El Poblado → Ciudad del Río → Envigado`),
     3. *Ciclorruta Avenida 80* (`La Aguacatala → Belén → Laureles → Floresta`),
     4. *Paseo Carabobo Norte* (`Parque Berrío → Parque Explora → Jardín Botánico`),
     5. *Corredor Universidad – Estadio* (`U. de Antioquia → Suramericana → Atanasio Girardot`),
     6. *Ruta San Javier – La América* (`Estación San Javier → La Floresta → Estadio`).
2. **Dos vistas con cambio instantáneo (`toggleCam()`, botón `🎥 1.ª / 3.ª Persona` o teclas `V` / `C`):**
   - **Primera persona (`drawFirstPerson`):** dibuja desde los ojos del ciclista el manubrio verde EnCicla (`#7ab800` o azul eléctrico `#2fa8dc` en bici eléctrica) que se inclina al cambiar de carril y vibra con el pedaleo, la canasta metálica delantera (`#3a4350` / `#566172`) con su placa oficial EnCicla y vaso de tinto cuando lleva impulso, las maniguetas de freno de aluminio (`#cfd6e0`) que se aprietan al frenar/agacharse, el timbre dorado (`#ffd24c`) cuya palanca oscila al tocar `🔔 Timbre`, y las manos del jugador con el tono de piel de su perfil.
   - **Tercera persona (`drawThirdPerson`):** dibuja en perspectiva 3D la bici EnCicla (o el vehículo activo de M5: bici eléctrica, patinete, monopatín eléctrico, tabla de skate o patines en línea) desde atrás, con luz trasera LED roja, pedaleo o patinaje alternado y la camiseta y casco/peinado reales del perfil del jugador.
3. **Mecánicas de 3 carriles, salto, agachada y timbre ciudadano:**
   - Controles por deslizamiento táctil (*swipe*), botones grandes en pantalla (`◀`, `▲ Salto`, `▼ Agacha`, `🔔 Timbre`, `▶`) y teclado (`Flechas` / `WASD` + `Espacio` + `V`).
   - Al tocar `🔔 Timbre`, los perritos criollos y vendedores de chaza se apartan amablemente dando `+4` puntos de cultura ciudadana.

#### Código completo de `src/js/91-runner.js` `[Juega EnCicla]`

#### Archivo: `src/js/91-runner.js` [Juega EnCicla]

```javascript
/* =====================================================================
   RUN ENCICLA · CARRERA SIN FIN EN 3D (v1.8 · M4)
   Modo de carrera 3D sobre las ciclorrutas reales del Valle de Aburrá
   (inspirado en RunRunZero y conectado al mapa unificado de Juega EnCicla).
   - Dos cámaras con cambio instantáneo:
     * 1.ª persona: manubrio verde EnCicla que gira y vibra, canasta delantera con placa,
       maniguetas de freno, timbre que se mueve al sonar y manos del jugador.
     * 3.ª persona: detrás de la bici EnCicla (o del vehículo activo de M5) con el jugador
       pedaleando/patinando en perspectiva 3D.
   - 3 carriles, salto, agacharse/frenar bajo ramas de guayacán, timbre 🔔 para pedir vía
     a peatones y perritos criollos, rampas, hojas verdes y tinto recargador.
   ===================================================================== */

const pcirc = typeof pdisc !== 'undefined' ? pdisc : (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };

const CORREDORES_3D = [
  { id: 'parques', name: 'Ciclorruta Parques del Río', sub: 'La Alpujarra → Conquistadores → Carlos E. Restrepo', x0: 1218, y0: 2375, x1: 1185, y1: 2310, tree: '#f2c12e' },
  { id: 'vegas', name: 'Corredor Av. Las Vegas', sub: 'El Poblado → Ciudad del Río → Envigado', x0: 1245, y0: 2580, x1: 1210, y1: 2890, tree: '#ff77a8' },
  { id: 'av80', name: 'Ciclorruta Avenida 80', sub: 'La Aguacatala → Belén → Laureles → Floresta', x0: 1095, y0: 2560, x1: 1068, y1: 2210, tree: '#f2c12e' },
  { id: 'carabobo', name: 'Paseo Carabobo Norte', sub: 'Parque Berrío → Parque Explora → Jardín Botánico', x0: 1292, y0: 2315, x1: 1318, y1: 2085, tree: '#49a844' },
  { id: 'estadio', name: 'Corredor Universidad – Estadio', sub: 'U. de Antioquia → Suramericana → Atanasio Girardot', x0: 1285, y0: 2145, x1: 1125, y1: 2205, tree: '#ff8a3d' },
  { id: 'comuna13', name: 'Ruta San Javier – La América', sub: 'Estación San Javier → La Floresta → Estadio', x0: 952, y0: 2262, x1: 1110, y1: 2225, tree: '#49a844' }
];

class MGRunner3D extends MG {
  constructor(parent, opt = {}) {
    super(parent, opt);
    this.view = { kind: 'pixel', w: 320, h: 200 };
    const idx = opt.corredor != null ? opt.corredor : this.rng.i(0, CORREDORES_3D.length - 1);
    this.corr = CORREDORES_3D[idx % CORREDORES_3D.length];
    this.fp = opt.fp != null ? !!opt.fp : (Save.data && Save.data.settings && Save.data.settings.runCam === '1p');
    this.veh = opt.veh || (parent && parent.ride && parent.ride.p && parent.ride.p.veh) || 'bike';
    if (this.veh === 'bike' && parent && parent.ebike) this.veh = 'ebike';
    if (this.veh === 'walk' || this.veh === 'truck') this.veh = 'bike';
    this.dur = opt.dur || 45;
    this.metaM = opt.metaM || 650;
    this.distM = 0;
    this.spd = 11.5; /* m/s (~41 km/h punta arcade) */
    this.lane = 0;   /* -1 izquierda, 0 centro, +1 derecha */
    this.lx = 0;     /* posición lateral interpolada */
    this.z = 0;      /* altura de salto en metros */
    this.vz = 0;
    this.duckT = 0;  /* agachado / frenando */
    this.bellT = 0;  /* animación de timbre */
    this.boostT = 0; /* poder de tinto cargado */
    this.hitT = 0;
    this.combo = 0;
    this.hojas = 0;
    this.hits = 0;
    this.nextD = 26;
    this.items = [];
    this.barrio = 'Medellín';
    this.sl = 0;
    for (let i = 0; i < 8; i++) this.spawnRow();
  }

  spawnRow() {
    const d = this.nextD;
    this.nextD += this.rng.range(16, 26);
    const lane = this.rng.i(-1, 1);
    const r = this.rng.f();
    const kind = r < .18 ? 'hueco' : r < .33 ? 'cono' : r < .46 ? 'rama' : r < .59 ? 'perro' : r < .70 ? 'chaza' : r < .80 ? 'charco' : r < .90 ? 'moto' : 'rampa';
    this.items.push({ d, lane, kind, done: false, moved: false });
    /* Hojas verdes en el carril libre o sobre la rampa */
    const freeLane = kind === 'rampa' ? lane : ((lane + 2) % 3) - 1;
    const nH = this.rng.i(2, 4);
    for (let k = 0; k < nH; k++) {
      this.items.push({ d: d + k * 3.2, lane: freeLane, kind: (k === 1 && this.rng.f() < .14) ? 'tinto' : 'hoja', z: kind === 'rampa' ? .9 : .2, done: false });
    }
  }

  moveLane(dl) {
    const nl = clamp(this.lane + dl, -1, 1);
    if (nl !== this.lane) { this.lane = nl; Snd.sfx('tap'); }
  }

  jump() {
    if (this.z > .05) return;
    this.vz = 6.2; this.z = .06; this.duckT = 0;
    if (this.veh === 'skate') Snd.vehSfx('skate', 'ollie'); else Snd.sfx('tap');
  }

  duck() {
    this.duckT = .65;
    if (this.z > .05) this.vz = Math.min(this.vz, -5);
    Snd.sfx('tap');
  }

  toggleCam() {
    this.fp = !this.fp;
    if (Save.data && Save.data.settings) { Save.data.settings.runCam = this.fp ? '1p' : '3p'; Save.save(); }
    Snd.sfx('tap');
    this.pop(this.fp ? '🎥 1.ª persona (manubrio)' : '🎥 3.ª persona (detrás)', 160, 44, PAL.cie);
  }

  ringBell() {
    if (this.bellT > .15) return;
    this.bellT = .55;
    Snd.vehSfx(this.veh, 'bell');
    let cleared = 0;
    for (const it of this.items) {
      const rel = it.d - this.distM;
      if (!it.done && !it.moved && rel > 2 && rel < 36 && (it.kind === 'perro' || it.kind === 'chaza')) {
        it.moved = true;
        it.lane = it.lane <= 0 ? 1.55 : -1.55;
        cleared++;
      }
    }
    if (cleared) {
      this.good(4 * cleared, 160, 62, '🔔 +' + (4 * cleared) + ' ¡Vía libre!');
    }
  }

  /* Punto geográfico real sobre el corredor para consultar cota, pendiente y barrio */
  posMapa() {
    const C = this.corr, u = clamp((this.distM / Math.max(200, this.metaM)) % 1, 0, 1);
    const tx = C.x0 + (C.x1 - C.x0) * u, ty = C.y0 + (C.y1 - C.y0) * u;
    return { tx, ty, px: tx * TS, py: ty * TS, a: Math.atan2(C.y1 - C.y0, C.x1 - C.x0) };
  }

  update(dt) {
    this.tick(dt);
    const q = this.posMapa();
    if (JE.map && JE.map.barrioAt) {
      this.barrio = JE.map.barrioAt(q.tx, q.ty) || 'Medellín';
      this.sl = clamp(JE.map.slope(q.px, q.py, q.a), -.08, .08);
    }
    this.bellT = Math.max(0, this.bellT - dt);
    this.duckT = Math.max(0, this.duckT - dt);
    this.boostT = Math.max(0, this.boostT - dt);
    this.hitT = Math.max(0, this.hitT - dt);
    /* Velocidad progresiva con efecto de pendiente y tinto */
    const targetSpd = (12.5 + Math.min(5.5, this.distM * .007)) * (this.boostT > 0 ? 1.25 : 1) * (this.duckT > 0 ? .78 : 1) * (this.veh === 'ebike' && this.sl > 0 ? 1 : (1 - this.sl * 2.2));
    this.spd += ( clamp(targetSpd, 7.5, 21) - this.spd ) * Math.min(1, dt * 3.5);
    if (this.hitT > .25) this.spd = Math.min(this.spd, 6.5);
    this.distM += this.spd * dt;
    this.lx += (this.lane - this.lx) * Math.min(1, dt * 11);
    if (this.z > 0 || this.vz !== 0) {
      this.z += this.vz * dt;
      this.vz -= 16.5 * dt;
      if (this.z <= 0) { this.z = 0; this.vz = 0; }
    }
    while (this.nextD < this.distM + 115) this.spawnRow();

    /* Colisiones y recolección */
    for (const it of this.items) {
      if (it.done) continue;
      const rel = it.d - this.distM;
      if (rel > 1.4 || rel < -1.4) continue;
      const dLane = Math.abs(this.lx - it.lane);
      if (it.kind === 'hoja') {
        if (dLane < .55 && Math.abs(this.z - (it.z || .2)) < .95) {
          it.done = true; this.hojas++; this.combo++;
          this.p.score += 2 + Math.min(4, this.combo >> 2);
          Snd.sfx('coin');
        }
        continue;
      }
      if (it.kind === 'tinto') {
        if (dLane < .58) {
          it.done = true; this.boostT = 5.5;
          this.good(6, 160, 56, '☕ ¡Tinto bien cargado! +6');
        }
        continue;
      }
      if (dLane >= .46) continue;
      if (it.kind === 'rampa') {
        it.done = true; this.vz = 8.4; this.z = .15;
        this.good(5, 160, 58, '🚀 ¡Salto en rampa! +5');
        continue;
      }
      if (it.kind === 'rama') {
        if (this.duckT > 0) {
          it.done = true; this.good(3, 160, 66, '✓ ¡Pasaste agachado! +3');
        } else {
          this.chocar(it, '🌿 ¡Rama baja! Agáchate con ▼');
        }
        continue;
      }
      if ((it.kind === 'hueco' || it.kind === 'cono' || it.kind === 'charco') && this.z > .42) {
        it.done = true; this.good(3, 160, 62, '🦘 ¡Buen salto! +3');
        continue;
      }
      if (this.boostT > 0) {
        it.done = true; this.pop('⚡ ¡Con impulso!', 160, 68, PAL.amb);
        continue;
      }
      const msg = { hueco: '🕳️ ¡Hueco!', cono: '🚧 ¡Cono de obra!', charco: '💦 ¡Charco!', perro: '🐕 ¡Usa el timbre 🔔!', chaza: '☂️ ¡Chaza en la vía!', moto: '🛵 ¡Moto en ciclorruta!' }[it.kind] || '¡Cuidado!';
      this.chocar(it, msg);
    }
    this.items = this.items.filter(it => it.d > this.distM - 8);
    this.coach = this.fp
      ? '1.ª persona: ◀ ▶ cambia de carril · ▲ salta · ▼ agáchate · 🔔 timbre para pedir vía · 🎥 cambia a 3.ª persona.'
      : '3.ª persona: ◀ ▶ cambia de carril · ▲ salta huecos y rampas · ▼ esquiva ramas · 🔔 timbre · 🎥 cambia a 1.ª persona.';
    if (this.distM >= this.metaM || this.t >= this.dur) {
      this.won = this.distM >= this.metaM * .75;
      if (Save.data) {
        Save.data.stats.runnerM = Math.max(Save.data.stats.runnerM | 0, Math.round(this.distM));
        Save.data.flags = Save.data.flags || {};
        if (this.distM >= 500) Save.data.flags.runner500 = 1;
        Logros.check(); Save.save();
      }
      this.done = true;
    }
  }

  chocar(it, txt) {
    it.done = true; this.hits++; this.combo = 0; this.hitT = .65; this.spd *= .45;
    this.bad(txt, 160, 74); vib(45);
  }

  /* Proyección 3D del corredor de ciclorruta con montañas del Valle de Aburrá, árboles de guayacán y obstáculos */
  render(V) {
    const b = V.b, vw = V.vw, vh = V.vh, min = this.p.clock || 540, night = Art.night(min);
    const hz = Math.round(vh * (.38 - clamp(this.sl * 1.4, -.08, .08)) + (this.duckT > 0 ? 7 : 0) - this.z * 8);
    /* Cielo del Valle de Aburrá y cordilleras laterales */
    const sky = Art.sky ? Art.sky(min)[0] : '#76c5f0';
    prect(b, 0, 0, vw, hz, sky);
    b.fillStyle = night > .5 ? '#101d35' : '#2d5a4c';
    b.beginPath(); b.moveTo(0, hz);
    for (let x = 0; x <= vw; x += 16) b.lineTo(x, hz - 14 - Math.round(Math.sin(x * .035 + this.corr.x0) * 8 + Math.cos(x * .08) * 4));
    b.lineTo(vw, hz); b.closePath(); b.fill();
    /* Suelo y zonas verdes a los costados de la ciclorruta */
    prect(b, 0, hz, vw, vh - hz, night > .5 ? '#16281e' : '#3d7a3a');

    const cx = Math.round(vw / 2 - this.lx * (this.fp ? 26 : 16) + (this.hitT > 0 ? Math.sin(this.t * 45) * 4 : 0));
    const wTop = 18, wBot = Math.round(vw * .74);
    /* Calzada de ciclorruta verde/terracota con perspectiva trapezoidal */
    b.fillStyle = night > .5 ? '#1e4230' : '#2e8b52';
    b.beginPath();
    b.moveTo(cx - wTop, hz); b.lineTo(cx + wTop, hz);
    b.lineTo(cx + wBot, vh); b.lineTo(cx - wBot, vh);
    b.closePath(); b.fill();
    /* Bordillos blancos y franjas de los 3 carriles */
    b.strokeStyle = '#eef4ea'; b.lineWidth = 1.5;
    b.beginPath();
    b.moveTo(cx - wTop, hz); b.lineTo(cx - wBot, vh);
    b.moveTo(cx + wTop, hz); b.lineTo(cx + wBot, vh);
    b.stroke();

    /* Bandas transversales de perspectiva y guayacanes laterales */
    const phase = (this.distM % 8) / 8;
    for (let i = 1; i <= 12; i++) {
      const u = Math.pow((i - phase) / 12, 1.85);
      if (u <= .02 || u > 1) continue;
      const y = Math.round(hz + (vh - hz) * u), hw = wTop + (wBot - wTop) * u;
      prect(b, Math.round(cx - hw / 3), y, 1, Math.max(1, Math.round(3 * u)), '#d8f0c8');
      prect(b, Math.round(cx + hw / 3), y, 1, Math.max(1, Math.round(3 * u)), '#d8f0c8');
      /* Árboles y postes de luz a ambos lados del corredor */
      if (((i + Math.floor(this.distM / 8)) % 2) === 0) {
        const sc = .3 + u * 1.15;
        for (const sd of [-1, 1]) {
          const tx = Math.round(cx + sd * (hw + 14 * sc)), trH = Math.round(18 * sc), rC = Math.round(9 * sc);
          prect(b, tx - Math.max(1, Math.round(sc)), y - trH, Math.max(2, Math.round(2 * sc)), trH, '#5c3c24');
          pcirc(b, tx, y - trH - rC / 2, rC, this.corr.tree);
          pcirc(b, tx - Math.round(3 * sc), y - trH - rC / 3, Math.max(2, Math.round(rC * .7)), shade(this.corr.tree, .12));
        }
      }
    }

    /* Dibujo de obstáculos, rampas y hojas ordenados de lejos a cerca */
    const vis = this.items.filter(it => !it.done && it.d - this.distM > -.8 && it.d - this.distM < 90).sort((a, b2) => b2.d - a.d);
    for (const it of vis) {
      const rel = it.d - this.distM, t = clamp(1 - rel / 90, .04, 1), u = Math.pow(t, 2.1);
      const y = Math.round(hz + (vh - hz - 12) * u), hw = wTop + (wBot - wTop) * u;
      const x = Math.round(cx + it.lane * (hw * .62)), sc = Math.max(.25, .25 + u * 1.15);
      this.drawItem3D(b, it, x, y, sc, hw);
    }

    /* Cámara elegida: 1.ª persona (manubrio EnCicla) o 3.ª persona (detrás de la bici/vehículo) */
    if (this.fp) this.drawFirstPerson(b, vw, vh);
    else this.drawThirdPerson(b, vw, vh);
  }

  drawItem3D(b, it, x, y, sc, hw) {
    const r = v => Math.max(1, Math.round(v * sc));
    if (it.kind === 'hoja') {
      const hy = y - r(8 + Math.sin(this.t * 6 + it.d) * 2 + (it.z || 0) * 10);
      pcirc(b, x, hy, r(4.2), '#7ab800'); pcirc(b, x - r(1), hy - r(1), r(2.2), '#c4ec7c');
    } else if (it.kind === 'tinto') {
      const hy = y - r(9);
      prect(b, x - r(3), hy - r(4), r(6), r(7), '#d94e34'); prect(b, x - r(2), hy - r(4), r(4), r(2), '#fff');
    } else if (it.kind === 'hueco') {
      b.fillStyle = '#14171d'; b.beginPath(); b.ellipse(x, y, r(9), r(3.5), 0, 0, TAU); b.fill();
      b.strokeStyle = '#5a606b'; b.lineWidth = 1; b.stroke();
    } else if (it.kind === 'charco') {
      b.fillStyle = '#4aa8d8aa'; b.beginPath(); b.ellipse(x, y, r(11), r(4), 0, 0, TAU); b.fill();
    } else if (it.kind === 'cono') {
      prect(b, x - r(5), y - r(2), r(10), r(2), '#d9531e');
      b.fillStyle = '#ff6b2b'; b.beginPath(); b.moveTo(x - r(4), y - r(2)); b.lineTo(x + r(4), y - r(2)); b.lineTo(x, y - r(13)); b.closePath(); b.fill();
      prect(b, x - r(2), y - r(8), r(4), r(2), '#ffffff');
    } else if (it.kind === 'rampa') {
      b.fillStyle = '#e8b931'; b.beginPath(); b.moveTo(x - r(9), y); b.lineTo(x + r(9), y); b.lineTo(x + r(7), y - r(8)); b.lineTo(x - r(7), y - r(8)); b.closePath(); b.fill();
      prect(b, x - r(6), y - r(6), r(12), r(2), '#0a2342');
    } else if (it.kind === 'rama') {
      /* Rama alta que cruza el carril: hay que pasar agachado */
      const by = y - r(18);
      prect(b, Math.round(x - hw * .45), by, Math.round(hw * .9), r(4), '#5c3c24');
      for (let k = -2; k <= 2; k++) pcirc(b, x + k * r(7), by - r(2), r(6), this.corr.tree);
    } else if (it.kind === 'perro') {
      prect(b, x - r(5), y - r(6), r(10), r(4), '#c68642');
      pcirc(b, x - r(5), y - r(8), r(3), '#c68642');
      prect(b, x - r(4), y - r(2), r(2), r(3), '#8d5524'); prect(b, x + r(2), y - r(2), r(2), r(3), '#8d5524');
    } else if (it.kind === 'chaza') {
      prect(b, x - r(8), y - r(10), r(16), r(9), '#2a5a92');
      b.fillStyle = '#ff5a36'; b.beginPath(); b.arc(x, y - r(12), r(11), Math.PI, 0); b.fill();
    } else if (it.kind === 'moto') {
      prect(b, x - r(3), y - r(12), r(6), r(11), '#1d1f24');
      pcirc(b, x, y - r(14), r(3.5), '#e84855');
      pcirc(b, x, y - r(7), r(2), '#fff6b0');
    }
  }

  /* Vista en 1.ª persona: manubrio verde EnCicla, canasta delantera con placa, frenos, timbre animado y manos */
  drawFirstPerson(b, vw, vh) {
    const P = Save.data ? Save.data.profile : {}, skin = SKINS[P.skin] || '#f0c090';
    const steer = (this.lane - this.lx) * .22, bob = Math.sin(this.distM * 1.4) * (this.z > 0 ? 0 : 2.2) + (this.duckT > 0 ? 10 : 0) - this.z * 7;
    const cx = Math.round(vw / 2), cy = Math.round(vh - 18 + bob);
    b.save();
    b.translate(cx, cy);
    b.rotate(steer);
    /* Canasta metálica delantera EnCicla con placa numerada y vaso de tinto si lleva boost */
    prect(b, -28, -26, 56, 20, '#3a4350');
    prect(b, -26, -24, 52, 16, '#566172');
    for (let x = -22; x <= 22; x += 6) prect(b, x, -24, 1, 16, '#262d38');
    /* Placa verde EnCicla al frente de la canasta */
    prect(b, -18, -21, 36, 10, '#7ab800');
    prect(b, -16, -19, 32, 6, '#0a2342');
    prect(b, -12, -17, 24, 2, '#c4ec7c');
    if (this.boostT > 0) { prect(b, 14, -29, 7, 9, '#d94e34'); prect(b, 15, -31, 5, 2, '#ffffff'); }
    /* Potencia central y barra del manubrio verde EnCicla */
    prect(b, -5, -8, 10, 26, '#262b34');
    prect(b, -72, -10, 144, 6, this.veh === 'ebike' ? '#2fa8dc' : '#7ab800');
    prect(b, -72, -10, 144, 2, '#c4ec7c');
    /* Maniguetas de freno de aluminio (se aprietan al frenar/agacharse) */
    const brkY = this.duckT > 0 ? -11 : -15;
    prect(b, -66, brkY, 18, 3, '#cfd6e0');
    prect(b, 48, brkY, 18, 3, '#cfd6e0');
    /* Mangos de caucho negro */
    prect(b, -78, -12, 20, 9, '#1b1f26');
    prect(b, 58, -12, 20, 9, '#1b1f26');
    /* Timbre cromado/dorado a la derecha con palanca que oscila al sonar */
    pcirc(b, 40, -13, 5, '#ffd24c'); pcirc(b, 40, -14, 3, '#fff3b8');
    const bellAng = this.bellT > 0 ? Math.sin(this.bellT * 35) * 4 : 0;
    prect(b, Math.round(44 + bellAng), -14, 4, 2, '#c8d0dc');
    /* Pantalla LED si va en bici eléctrica o monopatín eléctrico */
    if (this.veh === 'ebike' || this.veh === 'emonopatin') {
      prect(b, -11, -14, 22, 8, '#0a2342');
      prect(b, -9, -12, 18, 4, '#7ce0ff');
    }
    /* Manos del jugador sujetando los mangos */
    prect(b, -72, -13, 14, 11, skin);
    prect(b, 58, -13, 14, 11, skin);
    b.restore();
  }

  /* Vista en 3.ª persona: detrás del ciclista/patinador con su ropa, casco y vehículo activo */
  drawThirdPerson(b, vw, vh) {
    const P = Save.data ? Save.data.profile : {};
    const shirt = SHIRTS[P.shirt] || PAL.vd, skin = SKINS[P.skin] || '#f0c090';
    const helmet = P.helmet === 0 ? (PELO[P.hairCol | 0] || '#2a1a10') : (HELMETS[P.helmet] || '#ffffff');
    const x = Math.round(vw / 2), y = Math.round(vh - 16 - this.z * 20), duck = this.duckT > 0 ? 7 : 0;
    const ped = Math.sin(this.distM * 1.9) * 3;
    /* Sombra en el suelo */
    b.fillStyle = 'rgba(0,0,0,0.28)';
    b.beginPath(); b.ellipse(x, vh - 12, 10, 3.5, 0, 0, TAU); b.fill();
    if (this.veh === 'skate' || this.veh === 'patines') {
      if (this.veh === 'skate') {
        prect(b, x - 8, y - 3, 16, 3, '#d9a066');
        prect(b, x - 7, y - 1, 3, 2, '#f4efe2'); prect(b, x + 4, y - 1, 3, 2, '#f4efe2');
      } else {
        prect(b, x - 6, y - 4 + Math.round(ped), 4, 4, '#1b4d89'); prect(b, x + 2, y - 4 - Math.round(ped), 4, 4, '#1b4d89');
        prect(b, x - 5, y, 2, 2, '#ff5a36'); prect(b, x + 3, y, 2, 2, '#ff5a36');
      }
    } else {
      /* Rueda trasera, guardabarros, marco verde EnCicla y luz roja LED */
      prect(b, x - 2, y - 14, 4, 14, '#1b1f27');
      prect(b, x - 3, y - 22, 6, 10, this.veh === 'ebike' ? '#2fa8dc' : '#7ab800');
      prect(b, x - 1, y - 17, 2, 2, '#ff3b30');
      prect(b, x - 13, y - 24 + duck, 26, 2, '#30343c'); /* manubrio */
    }
    /* Piernas con pedaleo alternado */
    prect(b, x - 6, y - 15 + Math.round(ped), 4, 8, '#1f2d46');
    prect(b, x + 2, y - 15 - Math.round(ped), 4, 8, '#1f2d46');
    /* Espalda, brazos y cabeza/casco */
    prect(b, x - 7, y - 27 + duck, 14, 13 - Math.floor(duck / 2), shirt);
    prect(b, x - 12, y - 25 + duck, 5, 4, skin);
    prect(b, x + 7, y - 25 + duck, 5, 4, skin);
    pcirc(b, x, y - 32 + duck, 5, helmet);
  }

  hud(V) {
    this.btns = [];
    const pct = Math.min(100, Math.round(this.distM / this.metaM * 100));
    const kmh = Math.round(this.spd * 2.4);
    V.text('🏁 ' + this.corr.name + ' · ' + this.barrio, 12, (View.hudB || 50) + 18, { size: 13, color: '#c4ec7c', bg: '#0a2342dd', pad: 4 });
    V.text(Math.round(this.distM) + ' / ' + this.metaM + ' m (' + pct + ' %) · ' + kmh + ' km/h · 🍃 ' + this.hojas, 12, (View.hudB || 50) + 42, { size: 13, color: '#fff', bg: '#0a2342cc', pad: 4 });
    /* Botón de cambio instantáneo entre 1.ª y 3.ª persona */
    this.button(V, V.w - 148, (View.hudB || 50) + 10, 136, 36, this.fp ? '🎥 1.ª Persona' : '🎥 3.ª Persona', () => this.toggleCam(), { bg: PAL.az1, size: 13, key: 'cam' });
    /* Controles táctiles grandes abajo para celular y escritorio */
    const y = V.h - 92, bw = Math.min(76, Math.floor((V.w - 44) / 5));
    const x0 = Math.round((V.w - (bw * 5 + 24)) / 2);
    this.button(V, x0, y, bw, 46, '◀', () => this.moveLane(-1), { bg: PAL.az1, size: 20, key: 'l' });
    this.button(V, x0 + (bw + 6), y, bw, 46, '▲ Salto', () => this.jump(), { bg: PAL.vd2, size: 14, key: 'u' });
    this.button(V, x0 + (bw + 6) * 2, y, bw, 46, '▼ Agacha', () => this.duck(), { bg: PAL.az2, size: 13, key: 'd' });
    this.button(V, x0 + (bw + 6) * 3, y, bw, 46, '🔔 Timbre', () => this.ringBell(), { bg: '#b0651a', size: 13, key: 'b' });
    this.button(V, x0 + (bw + 6) * 4, y, bw, 46, '▶', () => this.moveLane(1), { bg: PAL.az1, size: 20, key: 'r' });
    this.drawPops(V);
  }

  pointer(type, vx, vy, cx, cy) {
    if (super.pointer(type, vx, vy, cx, cy)) return true;
    if (type === 'down') {
      this._sw = { x: cx, y: cy };
      return true;
    }
    if (type === 'up' && this._sw) {
      const dx = cx - this._sw.x, dy = cy - this._sw.y;
      this._sw = null;
      if (Math.hypot(dx, dy) > 22) {
        if (Math.abs(dx) > Math.abs(dy)) this.moveLane(dx > 0 ? 1 : -1);
        else if (dy < 0) this.jump();
        else this.duck();
        return true;
      }
    }
    return false;
  }

  key(k) {
    if (k === 'ArrowLeft' || k === 'KeyA') this.moveLane(-1);
    else if (k === 'ArrowRight' || k === 'KeyD') this.moveLane(1);
    else if (k === 'ArrowUp' || k === 'KeyW') this.jump();
    else if (k === 'ArrowDown' || k === 'KeyS') this.duck();
    else if (k === 'Space') this.ringBell();
    else if (k === 'KeyV' || k === 'KeyC') this.toggleCam();
  }

  /* Piloto automático para pruebas (tests/run.js) */
  bot(dt) {
    let threat = null;
    for (const it of this.items) {
      if (it.done || it.kind === 'hoja' || it.kind === 'tinto') continue;
      const rel = it.d - this.distM;
      if (rel > 1 && rel < 26 && Math.abs(it.lane - this.lane) < .45) { threat = it; break; }
    }
    if (threat) {
      if (threat.kind === 'perro' || threat.kind === 'chaza') this.ringBell();
      else if (threat.kind === 'rama') this.duck();
      else if (threat.kind === 'rampa' || threat.kind === 'hueco' || threat.kind === 'charco') this.jump();
      else this.moveLane(this.lane <= 0 ? 1 : -1);
    }
  }
}

JE.MGRunner3D = MGRunner3D;

/* Acceso desde Modo Libre (botón 🏁 Carrera 3D) y desde Más */
ModeUsuarioR.prototype.iniciarRunner3D = function (corredorIdx) {
  if (!this.free || this.sub) return;
  const P = this.ride.p;
  /* Elige el corredor más cercano a la posición actual si no se especifica uno */
  let bestI = corredorIdx != null ? corredorIdx : 0, bestD = 1e18;
  if (corredorIdx == null) {
    CORREDORES_3D.forEach((c, i) => {
      const mx = (c.x0 + c.x1) / 2 * TS, my = (c.y0 + c.y1) / 2 * TS, d = dist(P.x, P.y, mx, my);
      if (d < bestD) { bestD = d; bestI = i; }
    });
  }
  const veh = (P.veh === 'bike' && this.ebike) ? 'ebike' : P.veh;
  this.runSub(new MGRunner3D(this, { corredor: bestI, veh, metaM: 550, dur: 45 }), mg => {
    this.ride.stamp = { t: 2.5, title: mg.won ? '¡CORREDOR COMPLETADO!' : '¡BUENA RODADA 3D!', sub: mg.corr.name + ' · ' + Math.round(mg.distM) + ' m', bg: mg.won ? PAL.vd : PAL.cie };
    if (JE.ui) JE.ui.toast('🏁 Recorriste ' + Math.round(mg.distM) + ' m en ' + mg.corr.name + ' (🍃 +' + mg.hojas + ' hojas)');
  });
};

const _act91 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act91.call(this);
  if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
  a.push({ id: 'runner3d', icon: 'estrella', label: '🏁 Carrera 3D', fn: () => this.iniciarRunner3D() });
  return a;
};

LOGROS.push({ id: 'runner500', name: 'A toda biela en 3D', desc: 'Recorre 500 m en una carrera sin fin 3D por las ciclorrutas del valle', icon: 'estrella', test: S => !!(S.flags && S.flags.runner500) });
```


#### Cómo probar M4

1. Entrar a **Modo Libre** (`Usuario > Modo libre`) y tocar el botón de acción **`🏁 Carrera 3D`** en la barra inferior.
2. Tocar el botón **`🎥 1.ª Persona / 🎥 3.ª Persona`** arriba a la derecha (o la tecla `V`) para alternar en vivo entre la vista desde el manubrio con canasta y timbre y la vista en tercera persona detrás del ciclista.
3. Cambiar de carril con `◀ ▶`, saltar huecos y rampas con `▲ Salto`, agacharse bajo las ramas de guayacán con `▼ Agacha` y tocar `🔔 Timbre` para pedir vía.

---

### M5 · Nuevos vehículos jugables en el mundo libre `[Juega EnCicla]`

#### Qué se hizo en M5

1. **Siete vehículos jugables en el mundo libre (`src/js/92-vehiculos.js`):**
   - Todos seleccionables en cualquier momento desde el botón **`🛴 Vehículo`** en Modo Libre (`UI.vehiculos`), respetando el préstamo de EnCicla (si el jugador tenía una bici del sistema prestada y pasa a skate, patines o patinete, su bici EnCicla queda estacionada con candado y marcador en el mapa para recogerla o devolverla luego).
   - **Tabla de especificaciones físicas y visuales de los vehículos (escala `1 m = 1,6 px`):**

| ID | Vehículo | Largo × Ancho (m) | Largo × Ancho (px) | Vel. punta (`VSTATS.max`) | Superficie ideal / comportamiento | Paleta Hex |
|---|---|---|---|---|---|---|
| `bike` | **Bici EnCicla / propia** | `2,90 × 1,00 m` | `4,6 × 1,6 px` | `60 × WK` | Ciclorruta (`1,16×`), timbre 🔔 | Verde `#7ab800`, lima `#9bd341`, llanta `#1b1f27` |
| `ebike` | **Bici eléctrica EnCicla** | `2,95 × 1,05 m` | `4,7 × 1,7 px` | `67 × WK` | **No pierde velocidad en subidas** (`sl > 0`), farola LED | Marco `#9bd341`, batería `#2fa8dc`, luz `#fff6b0` |
| `scooter` | **Patinete clásico** | `2,20 × 0,85 m` | `3,5 × 1,4 px` | `51 × WK` | Ágil en andenes (`0,92×`) y plazas (`0,98×`), campanilla aguda | Aluminio `#c9d1db`, lija `#262b36`, manubrio `#5b6472` |
| `emonopatin` | **Monopatín eléctrico** | `2,35 × 0,90 m` | `3,8 × 1,4 px` | `71 × WK` | Muy rápido en ciclorruta (`1,22×`) y asfalto, sufre en pasto (`0,58×`) | Grafito `#1f242e`, acento `#ffb300`, LED `#9bd341` |
| `skate` | **Tabla de skate** | `2,00 × 0,80 m` | `3,2 × 1,3 px` | `54 × WK` | Giro cerrado (`w0 = 6,5`), **botón 🔔 hace salto *ollie*** | Arce `#d9a066`, lija `#232730`, ruedas `#f4efe2` |
| `patines` | **Patines en línea** | `1,75 × 0,95 m` | `2,8 × 1,5 px` | `56 × WK` | Fluido en parques (`0,78×`), plazas (`1,05×`) y ciclorrutas (`1,18×`) | Bota `#1b4d89`, guía `#d8dee8`, ruedas `#ff5a36` |
| `walk` | **A pie** | `1,70 × 1,70 m` | `2,7 × 2,7 px` | `26 × WK` | Sube escaleras y senderos sin penalización de tráfico | Camiseta y piel del perfil del jugador |

2. **Logro nuevo:** `multimodal` (*«Ruedas del valle»: Recorre el modo libre en 5 vehículos distintos*).

#### Código completo de `src/js/92-vehiculos.js` `[Juega EnCicla]`

#### Archivo: `src/js/92-vehiculos.js` [Juega EnCicla]

```javascript
/* =====================================================================
   VEHÍCULOS DEL MUNDO LIBRE Y MEJORAS GRÁFICAS (v1.8 · M3 + M5)
   1) M5 · Siete medios de transporte jugables en el valle:
      - bike:        Bicicleta EnCicla / propia (2,90 m × 1,00 m · 4,6 × 1,6 px)
      - ebike:       Bicicleta eléctrica EnCicla (2,95 m × 1,05 m · batería #2fa8dc · sin castigo en subida)
      - scooter:     Patinete clásico de impulso (2,20 m × 0,85 m · tabla aluminio #c9d1db)
      - emonopatin:  Monopatín eléctrico (2,35 m × 0,90 m · chasis grafito #1f242e · pantalla LED #9bd341)
      - skate:       Tabla de skate (2,00 m × 0,80 m · madera de arce #d9a066 · salto ollie con timbre/espacio)
      - patines:     Patines en línea (1,75 m × 0,95 m · botas #1b4d89 y ruedas coral #ff5a36)
      - truck:       Camión de Balance EnCicla (5,60 m × 2,40 m)
      - walk:        A pie (1,70 m × 1,70 m)
   2) M3 · Mejoras gráficas del valle (2D y 3D):
      - Casas de ladera mejoradas: zócalo escalonado de ladrillo en pendiente, escalera exterior con pasamanos,
        voladizo del segundo piso, terraza de plancha con tanque negro Rotoplas y ropa tendida.
      - Interiores detallados de estaciones EnCicla: caseta manual (escritorio, pantalla/planilla, silla,
        chaleco reflectivo colgado, tablero de llaves por colores, tula verde EnCicla, cargador de celular con LED
        y pocillo de tinto) y tótem automático (pantalla Cívica retroiluminada, lector sin contacto con halo verde,
        panel solar superior y anclajes con luces LED de estado).
      - Atmósfera del valle: niebla andina matinal y en aguacero, reflejos especulares en pavimento mojado
        y halos cálidos de alumbrado público + cono de farola delantera de noche.
   ===================================================================== */

const VEH_CATALOGO = JE.vehiculos = [
  { id: 'bike', name: 'Bici EnCicla', icon: '🚲', mL: 2.9, mW: 1.0, col: '#7ab800', sub: 'Ágil en ciclorrutas · timbre 🔔', free: true },
  { id: 'ebike', name: 'Bici eléctrica', icon: '⚡', mL: 2.95, mW: 1.05, col: '#2fa8dc', sub: 'Motor asistido: sube lomas sin cansarse', free: true },
  { id: 'scooter', name: 'Patinete clásico', icon: '🛴', mL: 2.2, mW: 0.85, col: '#c9d1db', sub: 'Liviano de impulso · entra a plazas y parques', free: true },
  { id: 'emonopatin', name: 'Monopatín eléctrico', icon: '🔋', mL: 2.35, mW: 0.9, col: '#1f242e', sub: 'Rápido en asfalto y ciclorruta · sufre en pasto', free: true },
  { id: 'skate', name: 'Tabla de skate', icon: '🛹', mL: 2.0, mW: 0.8, col: '#d9a066', sub: 'Giros cerrados · botón 🔔 hace salto ollie', free: true },
  { id: 'patines', name: 'Patines en línea', icon: '🛼', mL: 1.75, mW: 0.95, col: '#ff5a36', sub: 'Paso fluido por andenes, parques y ciclovías', free: true },
  { id: 'walk', name: 'A pie', icon: '🚶', mL: 1.7, mW: 1.7, col: '#56c7ff', sub: 'Camina por cualquier andén, puente o sendero', free: true }
];

/* Física de cada vehículo (escalada por WK y VEL en stats_):
   max = velocidad punta, acc = aceleración, brk = frenada, coast = desaceleración libre,
   w0 = giro quieto (rad/s), w1 = giro a tope (rad/s), tw = inercia de giro (s), r = radio de colisión (px),
   up = sensibilidad a las subidas, drain = gasto base de energía en modo libre */
const VSTATS = {
  bike:       { max: 60, acc: 30, brk: 72,  coast: 40,  w0: 5.0, w1: 2.7, tw: .09, r: 2.5,  up: 2.2, drain: 1.0 },
  ebike:      { max: 67, acc: 42, brk: 76,  coast: 38,  w0: 4.8, w1: 2.6, tw: .09, r: 2.55, up: 0.1, drain: 0.35 },
  scooter:    { max: 51, acc: 38, brk: 78,  coast: 46,  w0: 5.8, w1: 3.3, tw: .07, r: 2.2,  up: 2.5, drain: 1.1 },
  emonopatin: { max: 71, acc: 54, brk: 82,  coast: 44,  w0: 5.2, w1: 2.5, tw: .08, r: 2.3,  up: 0.5, drain: 0.3 },
  skate:      { max: 54, acc: 40, brk: 64,  coast: 34,  w0: 6.5, w1: 3.8, tw: .06, r: 2.1,  up: 2.6, drain: 1.05 },
  patines:    { max: 56, acc: 44, brk: 68,  coast: 36,  w0: 6.2, w1: 3.6, tw: .06, r: 2.0,  up: 2.3, drain: 1.0 },
  truck:      { max: 50, acc: 24, brk: 62,  coast: 22,  w0: 2.4, w1: 1.2, tw: .20, r: 4.76, up: 0.9, drain: 0.2 },
  walk:       { max: 26, acc: 90, brk: 170, coast: 120, w0: 7.5, w1: 6.0, tw: .05, r: 2.0,  up: 1.1, drain: 0.34 }
};

/* Multiplicador de velocidad por tipo de suelo (TT) para los nuevos vehículos */
const VSURF = {
  ebike:      { [TT.CICLO]: 1.18, [TT.ROAD]: 1, [TT.AVE]: 1, [TT.AUTO]: .96, [TT.BRIDGE]: 1.05, [TT.SIDE]: .76, [TT.PARK]: .72, [TT.PLAZA]: .88, [TT.EARTH]: .62, [TT.STAIRS]: .38, [TT.EST]: .92, [TT.BODEGA]: .95 },
  scooter:    { [TT.CICLO]: 1.15, [TT.ROAD]: .96, [TT.AVE]: .94, [TT.AUTO]: .82, [TT.BRIDGE]: 1.02, [TT.SIDE]: .92, [TT.PARK]: .74, [TT.PLAZA]: .98, [TT.EARTH]: .45, [TT.STAIRS]: .32, [TT.EST]: .95, [TT.BODEGA]: .95 },
  emonopatin: { [TT.CICLO]: 1.22, [TT.ROAD]: 1.04, [TT.AVE]: 1.02, [TT.AUTO]: .92, [TT.BRIDGE]: 1.06, [TT.SIDE]: .82, [TT.PARK]: .58, [TT.PLAZA]: .92, [TT.EARTH]: .38, [TT.STAIRS]: .25, [TT.EST]: .92, [TT.BODEGA]: .95 },
  skate:      { [TT.CICLO]: 1.16, [TT.ROAD]: .95, [TT.AVE]: .92, [TT.AUTO]: .78, [TT.BRIDGE]: 1.02, [TT.SIDE]: .94, [TT.PARK]: .62, [TT.PLAZA]: 1.06, [TT.EARTH]: .34, [TT.STAIRS]: .28, [TT.EST]: .96, [TT.BODEGA]: .96 },
  patines:    { [TT.CICLO]: 1.18, [TT.ROAD]: .96, [TT.AVE]: .94, [TT.AUTO]: .8, [TT.BRIDGE]: 1.04, [TT.SIDE]: .96, [TT.PARK]: .78, [TT.PLAZA]: 1.05, [TT.EARTH]: .36, [TT.STAIRS]: .3, [TT.EST]: .96, [TT.BODEGA]: .96 }
};

/* Sonidos propios por vehículo en WebAudio (sin archivos externos) */
Snd.vehSfx = function (veh, kind) {
  if (!this.on || !this.init()) return;
  if (kind === 'ollie') {
    this.tone(155, .07, 'triangle', .11, 92);
    this.noise(.05, .07);
    setTimeout(() => this.tone(240, .06, 'sine', .08, 130), 65);
    return;
  }
  if (veh === 'ebike' || veh === 'emonopatin') {
    this.tone(veh === 'ebike' ? 520 : 640, .09, 'sine', .08, veh === 'ebike' ? 880 : 980);
    setTimeout(() => this.tone(veh === 'ebike' ? 880 : 980, .11, 'triangle', .07, 1180), 55);
  } else if (veh === 'scooter') {
    this.tone(1480, .14, 'sine', .09);
    setTimeout(() => this.tone(1960, .16, 'sine', .08), 45);
  } else if (veh === 'skate') {
    this.vehSfx('skate', 'ollie');
  } else if (veh === 'patines') {
    this.tone(740, .08, 'triangle', .08, 990);
    setTimeout(() => this.tone(990, .1, 'sine', .07), 50);
  } else {
    this.sfx('bell');
  }
};

/* ---------- Sprites 2D pixelados y vectoriales 4× (ciudad 3D) para cada vehículo ---------- */
Object.assign(Art, {
  vehTop(veh, shirt, helmet, skin) {
    if (veh === 'truck') return this.truckTop(0, 14);
    if (veh === 'walk') return this.walker(0);
    if (veh === 'bike') return this.riderTop(shirt, helmet, skin, PAL.vd);
    const P = Save.data ? Save.data.profile : {};
    shirt = shirt || SHIRTS[P.shirt] || PAL.cor;
    helmet = helmet || (P.helmet === 0 ? (PELO[P.hairCol | 0] || '#2a1a10') : (HELMETS[P.helmet] || '#ffffff'));
    skin = skin || SKINS[P.skin] || '#f0c090';
    const key = 'vtop:' + veh + ':' + shirt + ':' + helmet + ':' + skin + ':' + GFX();
    if (this.cache.has(key)) return this.cache.get(key);
    /* Base pixel art 11×14 px */
    const base = this.mk(11, 14, c => {
      if (veh === 'ebike') {
        prect(c, 5, 0, 1, 3, '#1d1f24'); prect(c, 5, 11, 1, 3, '#1d1f24');
        prect(c, 5, 2, 1, 9, '#9bd341'); prect(c, 4, 4, 3, 4, '#2fa8dc'); /* batería azul cielo */
        prect(c, 5, 0, 1, 1, '#fff6b0'); /* farola LED */
        prect(c, 2, 3, 7, 1, '#2a2d34');
      } else if (veh === 'scooter' || veh === 'emonopatin') {
        const el = veh === 'emonopatin';
        prect(c, 5, 1, 1, 2, '#1d1f24'); prect(c, 5, 11, 1, 2, '#1d1f24');
        prect(c, 4, 3, 3, 8, el ? '#1f242e' : '#c9d1db');
        prect(c, 5, 4, 1, 6, el ? '#ffb300' : '#262b36');
        prect(c, 2, 3, 7, 1, el ? '#1f242e' : '#5b6472');
        if (el) prect(c, 5, 2, 1, 1, '#9bd341'); /* pantalla LED */
      } else if (veh === 'skate') {
        prect(c, 3, 2, 5, 1, '#f4efe2'); prect(c, 3, 11, 5, 1, '#f4efe2'); /* ruedas de uretano */
        prect(c, 4, 1, 3, 12, '#d9a066'); prect(c, 5, 2, 1, 10, '#232730'); /* tabla de arce y lija */
      } else if (veh === 'patines') {
        prect(c, 3, 3, 2, 7, '#1b4d89'); prect(c, 6, 4, 2, 7, '#1b4d89');
        prect(c, 3, 2, 1, 9, '#ff5a36'); prect(c, 7, 3, 1, 9, '#ff5a36');
      }
      /* brazos, hombros y cabeza del jugador */
      if (veh !== 'skate' && veh !== 'patines') {
        prect(c, 2, 4, 2, 2, skin); prect(c, 7, 4, 2, 2, skin);
      } else {
        prect(c, 1, 6, 2, 2, skin); prect(c, 8, 5, 2, 2, skin);
      }
      prect(c, 3, 5, 5, 4, shirt); prect(c, 4, 4, 3, 5, shirt);
      prect(c, 4, 5, 3, 3, helmet); prect(c, 5, 4, 1, 3, '#ffffff');
    });
    if (GFX() !== '3d') { this.cache.set(key, base); return base; }
    /* Versión vectorial 4× para la ciudad 3D */
    const v3 = vsprite(key, base, (x, w, h) => {
      if (veh === 'ebike') {
        ell(x, w / 2, 1.3, .75, 1.3, '#1b1f27'); ell(x, w / 2, h - 1.4, .75, 1.4, '#1b1f27');
        line(x, w / 2, 2.5, w / 2, h - 2.5, 1.1, '#9bd341');
        rrect(x, w / 2 - .85, 4.1, 1.7, 3.6, .6, '#2fa8dc');
        ell(x, w / 2, 1.1, .55, .45, '#fff6b0');
        line(x, 1.6, 3.4, w - 1.6, 3.4, .75, '#30343c');
      } else if (veh === 'scooter' || veh === 'emonopatin') {
        const el = veh === 'emonopatin';
        ell(x, w / 2, 1.3, .65, 1.2, '#1b1f27'); ell(x, w / 2, h - 1.4, .65, 1.2, '#1b1f27');
        rrect(x, w / 2 - 1.35, 2.4, 2.7, h - 4.8, 1.1, el ? '#1f242e' : '#c9d1db');
        rrect(x, w / 2 - .85, 3.3, 1.7, h - 6.6, .6, el ? '#2c3342' : '#262b36');
        if (el) { line(x, w / 2 - 1.1, 3.8, w / 2 - 1.1, h - 3.8, .35, '#ffb300'); line(x, w / 2 + 1.1, 3.8, w / 2 + 1.1, h - 3.8, .35, '#ffb300'); ell(x, w / 2, 2.6, .55, .45, '#9bd341'); }
        line(x, 1.9, 3.1, w - 1.9, 3.1, .75, el ? '#1f242e' : '#5b6472');
      } else if (veh === 'skate') {
        rrect(x, w / 2 - 1.9, 2.4, 3.8, 1.1, .4, '#f4efe2');
        rrect(x, w / 2 - 1.9, h - 3.5, 3.8, 1.1, .4, '#f4efe2');
        rrect(x, w / 2 - 1.65, 1.2, 3.3, h - 2.4, 1.5, '#d9a066');
        rrect(x, w / 2 - 1.25, 2.0, 2.5, h - 4.0, 1.1, '#232730');
      } else if (veh === 'patines') {
        for (const [dx, dy] of [[-1.25, -.6], [1.25, .6]]) {
          rrect(x, w / 2 + dx - .7, h / 2 + dy - 2.8, 1.4, 5.6, .6, '#ff5a36');
          rrect(x, w / 2 + dx - .85, h / 2 + dy - 1.8, 1.7, 3.6, .7, '#1b4d89');
        }
      }
      if (veh === 'skate' || veh === 'patines') {
        line(x, 1.5, 6.8, 3.3, 6.2, .9, skin); line(x, w - 1.5, 5.4, w - 3.3, 6.0, .9, skin);
      } else {
        line(x, 2.1, 5.5, 2.0, 3.3, .9, skin); line(x, w - 2.1, 5.5, w - 2.0, 3.3, .9, skin);
      }
      ell(x, w / 2, 6.4, 2.35, 1.85, shirt);
      ell(x, w / 2, 6.2, 1.48, 1.65, helmet);
      x.fillStyle = '#ffffff55'; x.fillRect(w / 2 - .25, 4.8, .5, 2.8);
    });
    this.cache.set(key, v3);
    return v3;
  },
  /* Dibujo lateral de cada vehículo para la vista panorámica, las postales y la tarjeta de selección */
  vehSide(b, x, y, veh, opts = {}) {
    if (veh === 'bike' || veh === 'ebike') {
      this.bikeSide(b, x, y, Object.assign({ col: veh === 'ebike' ? '#9bd341' : PAL.vd, ebike: veh === 'ebike' }, opts));
      if (veh === 'ebike') { prect(b, x - 2, y - 8, 5, 2, '#2fa8dc'); prect(b, x + 7, y - 13, 2, 2, '#fff6b0'); }
      return;
    }
    if (veh === 'scooter' || veh === 'emonopatin') {
      const el = veh === 'emonopatin';
      pcirc(b, x - 6, y - 2, 2, '#1d1f24'); pcirc(b, x + 6, y - 2, 2, '#1d1f24');
      prect(b, x - 5, y - 3, 10, 2, el ? '#1f242e' : '#c9d1db');
      if (el) prect(b, x - 4, y - 2, 8, 1, '#ffb300');
      pline(b, x + 5, y - 3, x + 4, y - 15, el ? '#1f242e' : '#5b6472');
      prect(b, x + 2, y - 16, 4, 1, '#262b36');
      if (el) prect(b, x + 5, y - 15, 2, 2, '#fff6b0');
      return;
    }
    if (veh === 'skate') {
      pcirc(b, x - 4, y - 1, 1, '#f4efe2'); pcirc(b, x + 4, y - 1, 1, '#f4efe2');
      prect(b, x - 6, y - 3, 12, 1, '#d9a066'); prect(b, x - 7, y - 4, 2, 1, '#d9a066'); prect(b, x + 5, y - 4, 2, 1, '#d9a066');
      return;
    }
    if (veh === 'patines') {
      for (const dx of [-3, 2]) {
        prect(b, x + dx, y - 5, 3, 3, '#1b4d89');
        prect(b, x + dx - 1, y - 2, 5, 1, '#d8dee8');
        prect(b, x + dx - 1, y - 1, 5, 1, '#ff5a36');
      }
    }
  }
});

/* Integración de los 7 vehículos con Ride.prototype.stats_, update, jump/bell y render */
const _rider92 = Art.rider;
Art.rider = function (shirt) {
  const M = Game.mode, R = M && M.ride, v = R && R.p && R.p.veh;
  if (v && v !== 'bike' && v !== 'truck' && v !== 'walk') return this.vehTop(v, shirt);
  if (R && (R.ebike || (M && M.ebike)) && v === 'bike') return this.vehTop('ebike', shirt);
  return _rider92.call(this, shirt);
};

Ride.prototype.stats_ = function () {
  const v = (this.p.veh === 'bike' && (this.ebike || (this.mode && this.mode.ebike))) ? 'ebike' : (this.p.veh || 'bike');
  const S = VSTATS[v] || VSTATS.bike, f = VEL * velMul(this.mode);
  return { max: S.max * WK * f, acc: S.acc * WK * f, brk: S.brk * WK * f, coast: S.coast * WK * f, w0: S.w0, w1: S.w1, tw: S.tw, r: S.r, up: S.up, drain: S.drain };
};

const _upd92 = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) {
  const P = this.p, v = P.veh;
  /* Multiplicador específico por superficie y vehículo antes del paso físico */
  if (VSURF[v]) {
    const t = this.tileAt(), sm = VSURF[v][t] || .75, origS = SURF[t];
    SURF[t] = sm; _upd92.call(this, dt, dir); SURF[t] = origS;
  } else {
    _upd92.call(this, dt, dir);
  }
  /* Salto ollie en skate o con rampa */
  if (this.ollieT > 0) {
    this.ollieT = Math.max(0, this.ollieT - dt);
    P.z = Math.max(P.z || 0, Math.sin((this.ollieT / .42) * Math.PI) * .12);
  }
  /* Bici eléctrica y monopatín eléctrico mantienen el ritmo en las subidas */
  if ((v === 'ebike' || v === 'emonopatin') && this.sl > 0 && dir && dir.m > 0 && P.v > 4) {
    const S = this.stats_();
    P.v = Math.min(S.max, P.v + S.acc * this.sl * .9 * dt);
  }
};

const _bell92 = Ride.prototype.bell;
Ride.prototype.bell = function () {
  const v = this.p.veh;
  if (v === 'skate' && !(this.ollieT > 0)) {
    this.ollieT = .42; this.inv = Math.max(this.inv || 0, .42);
    this.float('¡Ollie! 🛹', PAL.amb); Snd.vehSfx('skate', 'ollie');
    this.burst(this.p.x, this.p.y, '#f4efe2', 5);
  } else if (v && v !== 'bike') {
    Snd.vehSfx(v, 'bell');
  }
  return _bell92.call(this);
};

/* Selector de vehículos en Modo Libre (ModeUsuarioR): respeta la bici prestada de EnCicla (queda estacionada con candado) */
UI.vehiculos = function (M) {
  if (!M || !M.free || !M.ride) return;
  const cur = (M.ride.p.veh === 'bike' && M.ebike) ? 'ebike' : M.ride.p.veh;
  this.modal(`<h2>🛴 Tu vehículo en el valle</h2>
    <p class="m" style="margin:4px 0 10px">Elige cómo recorrer el Valle de Aburrá. Si tienes una bici de EnCicla prestada, queda asegurada con candado donde cambies.</p>
    <div class="col" style="gap:8px">${VEH_CATALOGO.map(v => `<button class="btn ${cur === v.id ? 'pri' : ''}" data-veh="${v.id}" style="display:flex;align-items:center;justify-content:space-between;text-align:left;padding:10px 14px">
      <span><strong>${v.icon} ${v.name}</strong><br><small style="opacity:.85;font-weight:400">${v.sub}</small></span>
      <span style="font-size:12px;opacity:.9">${v.mL}×${v.mW} m</span>
    </button>`).join('')}</div>
    <div class="col" style="margin-top:10px"><button class="btn" id="mClose">▶ Seguir rodando</button></div>`, () => {
    $$('[data-veh]').forEach(b => b.onclick = () => {
      const id = b.dataset.veh;
      M.cambiarVehiculo(id);
      this.closeModal();
      if (Game.paused) Game.resume();
    });
    const cl = $('#mClose'); if (cl) cl.onclick = () => { this.closeModal(); if (Game.paused) Game.resume(); };
  });
};

ModeUsuarioR.prototype.cambiarVehiculo = function (id) {
  const R = this.ride, P = R.p, V = VEH_CATALOGO.find(x => x.id === id) || VEH_CATALOGO[0];
  /* Si tenía una bici de EnCicla en préstamo y cambia a otro vehículo personal, deja la bici estacionada en el mapa */
  if (!this.ownBike && (P.veh === 'bike' || P.veh === 'ebike') && id !== 'bike' && id !== 'ebike' && !this.parked) {
    this.parked = { x: P.x, y: P.y, ebike: !!this.ebike };
    this.parkedM = R.marker({ x: P.x, y: P.y, r: 14, col: PAL.vd, label: '🚲 Tu bici EnCicla' });
  } else if ((id === 'bike' || id === 'ebike') && this.parked) {
    if (this.parkedM) R.removeMarker(this.parkedM);
    this.parked = null; this.parkedM = null;
  }
  if (id === 'ebike') { this.ebike = 1; R.ebike = 1; R.setVeh('bike'); }
  else { if (id === 'bike') { this.ebike = 0; R.ebike = 0; } R.setVeh(id); }
  Save.data.flags = Save.data.flags || {};
  Save.data.flags['veh_' + id] = 1;
  const usedCount = VEH_CATALOGO.filter(v => Save.data.flags['veh_' + v.id]).length;
  if (usedCount >= 5) Save.data.flags.multimodal = 1;
  Logros.check(); Save.save();
  Snd.vehSfx(id, 'bell');
  R.float(V.icon + ' ' + V.name, PAL.vd1);
  if (JE.ui) JE.ui.toast(V.icon + ' Ahora vas en ' + V.name.toLowerCase() + ' (' + V.sub + ')');
};

const _act92 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act92.call(this);
  if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
  const cur = (this.ride.p.veh === 'bike' && this.ebike) ? 'ebike' : this.ride.p.veh;
  const V = VEH_CATALOGO.find(x => x.id === cur) || VEH_CATALOGO[0];
  a.push({ id: 'vehiculo', icon: 'llanta', label: V.icon + ' Vehículo', fn: () => UI.vehiculos(this) });
  return a;
};

LOGROS.push({ id: 'multimodal', name: 'Ruedas del valle', desc: 'Recorre el modo libre en 5 vehículos distintos (bici, eléctrica, patinete, skate o patines)', icon: 'llanta', test: S => !!(S.flags && S.flags.multimodal) });

/* =====================================================================
   M3 · MEJORAS GRÁFICAS: CASAS DE LADERA, INTERIORES DE ESTACIONES Y ATMÓSFERA
   ===================================================================== */

/* 1) Interiores detallados de estaciones EnCicla:
      - Caseta manual (4,0 m × 2,2 m × 2,6 m): escritorio (#8b5a2b), pantalla/planilla (#7ce0ff), silla (#232a38),
        chaleco reflectivo colgado (#9bd341 con cintas #e6ecf5), tablero de llaves por colores, tula verde EnCicla (#7ab800),
        cargador de celular con LED verde (#3dd668) y pocillo de tinto (#d94e34).
      - Tótem automático (0,55 m × 0,45 m × 2,10 m): columna azul/acero, pantalla táctil Cívica, lector con halo verde
        y panel solar superior. */
const _booth92 = Art.booth;
Art.booth = function (b, x, y, w, h) {
  _booth92.call(this, b, x, y, w, h);
  /* Interior detallado visible por el ventanal de la caseta del anfitrión */
  const wx = x + 3, wy = y - h + 8, ww = w - 6, wh = h - 18;
  prect(b, wx, wy, ww, wh, '#162844'); /* pared de fondo de la caseta */
  /* Tablero de llaves codificadas por color (azul, coral, amarillo, verde) */
  prect(b, wx + 2, wy + 2, 9, 6, '#243a5e');
  prect(b, wx + 3, wy + 3, 1, 2, '#56c7ff'); prect(b, wx + 5, wy + 3, 1, 2, '#ff5a36');
  prect(b, wx + 7, wy + 3, 1, 2, '#ffe066'); prect(b, wx + 9, wy + 3, 1, 2, '#9bd341');
  /* Chaleco reflectivo verde colgado en gancho */
  prect(b, wx + ww - 7, wy + 2, 5, 7, '#9bd341');
  prect(b, wx + ww - 7, wy + 4, 5, 1, '#e6ecf5'); prect(b, wx + ww - 7, wy + 7, 5, 1, '#e6ecf5');
  /* Silla ergonómica detrás del anfitrión */
  prect(b, wx + Math.floor(ww / 2) - 4, wy + 6, 8, 7, '#232a38');
  /* Tula verde EnCicla arrumada al costado */
  prect(b, wx + 2, wy + wh - 5, 5, 4, '#7ab800'); prect(b, wx + 3, wy + wh - 4, 3, 1, '#ffffff');
  /* Escritorio de madera, pantalla/planilla, cargador con LED verde y pocillo de tinto */
  prect(b, wx, wy + wh - 2, ww, 3, '#8b5a2b');
  prect(b, wx + 3, wy + wh - 6, 6, 4, '#1b2838'); prect(b, wx + 4, wy + wh - 5, 4, 2, '#7ce0ff'); /* monitor/planilla */
  prect(b, wx + ww - 9, wy + wh - 4, 3, 2, '#1f242e'); prect(b, wx + ww - 8, wy + wh - 4, 1, 1, '#3dd668'); /* cargador con LED */
  prect(b, wx + ww - 4, wy + wh - 5, 2, 3, '#d94e34'); prect(b, wx + ww - 4, wy + wh - 7, 1, 1, '#ffffff88'); /* tinto humeante */
};

/* Dibujo en 3D del interior de las estaciones EnCicla (manuales con caseta amoblada y automáticas con tótem Cívica y LEDs) */
Ride.prototype.estaciones3D = function (c, ox, oy, vw, vh) {
  if (GFX() !== '3d') return;
  const E = this.ojo(), px = E.x - ox, py = E.y - oy, K = E.K, nb = Math.round(Art.night(this.min) * 3);
  const PX = (x, y, z) => px + (x - px) * (1 + K * z), PY = (x, y, z) => py + (y - py) * (1 + K * z);
  const pulse = .55 + .45 * Math.sin((this.mode.t || 0) * 4.5);
  for (const st of this.map.stations) {
    const sx = st.x - ox, sy = st.y - oy;
    if (sx < -40 || sy < -40 || sx > vw + 40 || sy > vh + 40) continue;
    const d2 = (sx - px) * (sx - px) + (sy - py) * (sy - py);
    if (d2 > 210 * 210) continue;
    const manual = st.manual !== false && (st.id % 2 === 0);
    if (manual) {
      /* Caseta manual 3D: 4,0 m × 2,2 m × 2,6 m (6,4 × 3,5 px, z = 0.095) con ventanal e interior iluminado */
      const bx = sx - 7, by = sy - 5, bw = 6.4, bh = 3.6, z = .095;
      c.fillStyle = nb >= 2 ? '#132c52' : '#0a2342';
      c.fillRect(bx, by, bw, bh);
      /* Ventana e interior: escritorio, pantalla, chaleco reflectivo y LED */
      c.fillStyle = nb >= 2 ? '#ffe596' : '#d8eefc';
      c.fillRect(bx + .8, by + .8, bw - 1.6, bh - 1.4);
      c.fillStyle = '#8b5a2b'; c.fillRect(bx + .9, by + bh - 1.3, bw - 1.8, .7); /* escritorio */
      c.fillStyle = '#9bd341'; c.fillRect(bx + bw - 2.1, by + 1.0, 1.0, 1.3); /* chaleco reflectivo */
      c.fillStyle = '#56c7ff'; c.fillRect(bx + 1.2, by + 1.1, 1.3, .9); /* pantalla/tablero */
      c.fillStyle = '#3dd668'; c.fillRect(bx + 2.8, by + bh - 1.4, .55, .55); /* LED cargador */
      /* Cubierta verde EnCicla proyectada en 3D */
      const rx0 = PX(bx - .4, by - .4, z), ry0 = PY(bx - .4, by - .4, z), rx1 = PX(bx + bw + .4, by + bh + .4, z), ry1 = PY(bx + bw + .4, by + bh + .4, z);
      c.fillStyle = '#7ab800'; c.fillRect(rx0, ry0, rx1 - rx0, ry1 - ry0);
      c.strokeStyle = '#c4ec7c'; c.lineWidth = .45; c.strokeRect(rx0, ry0, rx1 - rx0, ry1 - ry0);
    } else {
      /* Tótem automático 3D: columna #0a2342, pantalla Cívica #7ce0ff, halo verde sin contacto #3dd668 y panel solar */
      const tx = sx - 5.5, ty = sy - 3.5, z = .085, txTop = PX(tx, ty, z), tyTop = PY(tx, ty, z);
      c.strokeStyle = '#0a2342'; c.lineWidth = 2.1; c.beginPath(); c.moveTo(tx, ty); c.lineTo(txTop, tyTop); c.stroke();
      c.fillStyle = '#7ce0ff'; c.fillRect(txTop - .7, tyTop - .5, 1.4, 1.0); /* pantalla Cívica */
      c.fillStyle = `rgba(61,214,104,${(0.45 + 0.45 * pulse).toFixed(2)})`;
      c.beginPath(); c.arc(txTop, tyTop + .8, 1.1, 0, TAU); c.fill(); /* halo lector tarjeta Cívica */
      c.fillStyle = '#1f365c'; c.fillRect(txTop - 1.1, tyTop - 1.1, 2.2, .7); /* panel solar */
    }
    /* Módulos de anclaje con LEDs de estado (verde disponible, ámbar ocupado, rojo taller) */
    const nMod = 5;
    for (let i = 0; i < nMod; i++) {
      const mx = sx - 2 + i * 2.2, my = sy + 1.5;
      c.fillStyle = '#4c5563'; c.fillRect(mx - .4, my - .4, .8, 1.2);
      c.fillStyle = (i === 4 && st.broken) ? '#e84855' : (i % 2 === 0 ? '#3dd668' : '#ffb300');
      c.fillRect(mx - .25, my - .3, .5, .5);
    }
  }
};

/* 2) Casas de ladera mejoradas (ladera3D):
      En los barrios altos del valle (cota > 1545 m: Comuna 13, Santo Domingo, Manrique, Popular, Robledo, Villahermosa, Picacho),
      las casas sobre pendiente muestran su zócalo/barranco escalonado de ladrillo, escalera exterior con pasamanos,
      terraza de plancha gris con tanque de agua negro y cuerda de ropa tendida. */
const _techoL92 = techoL;
techoL = function (c, b, rx, ry, p) {
  const ux = rx[1] - rx[0], uy = ry[1] - ry[0], vx = rx[3] - rx[0], vy = ry[3] - ry[0], w = Math.hypot(ux, uy), h = Math.hypot(vx, vy);
  if (w >= 9 && h >= 9 && b.z < .36 && JE.map && JE.map.elev(b.x, b.y) > 1545) {
    const at = (a, d) => [rx[0] + ux * a + vx * d, ry[0] + uy * a + vy * d];
    /* Tanque de agua negro tipo Rotoplas sobre la plancha */
    const T = at(.74, .28);
    c.fillStyle = '#1f232a'; c.beginPath(); c.arc(T[0], T[1], 1.7, 0, TAU); c.fill();
    c.strokeStyle = '#4a5160'; c.lineWidth = .35; c.stroke();
    /* Cuerda de ropa tendida con prendas de colores paisas */
    if (b.k < .65) {
      const A = at(.18, .62), B = at(.82, .68);
      c.strokeStyle = '#cfd5df'; c.lineWidth = .3; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke();
      const cols = ['#ff5a36', '#56c7ff', '#ffe066', '#9bd341'];
      for (let i = 0; i < 3; i++) {
        const t = .22 + i * .26, px = A[0] + (B[0] - A[0]) * t, py = A[1] + (B[1] - A[1]) * t;
        c.fillStyle = cols[(i + (b.x | 0)) & 3]; c.fillRect(px - .6, py - .4, 1.2, 1.1);
      }
    }
    /* Escalera exterior de concreto con pasamanos en el costado de la casa de ladera */
    if (b.k > .32) {
      const E0 = [rx[0] - ux * .12, ry[0] - uy * .12], E1 = [rx[0], ry[0]];
      c.strokeStyle = '#bfc5ce'; c.lineWidth = .9; c.beginPath(); c.moveTo(E0[0], E0[1] + 2.5); c.lineTo(E1[0], E1[1]); c.stroke();
      c.strokeStyle = '#eef2f7'; c.lineWidth = .35; c.beginPath(); c.moveTo(E0[0], E0[1] + 1.7); c.lineTo(E1[0], E1[1] - .8); c.stroke();
    }
    return;
  }
  return _techoL92(c, b, rx, ry, p);
};

/* 3) Atmósfera del valle: niebla andina matinal/lluviosa, reflejos en pavimento mojado y halos nocturnos */
const _draw3D92 = Ride.prototype.draw3D;
Ride.prototype.draw3D = function (c, ox, oy, vw, vh) {
  _draw3D92.call(this, c, ox, oy, vw, vh);
  this.estaciones3D(c, ox, oy, vw, vh);
};

const _drawGlow92 = Ride.prototype.drawGlow;
Ride.prototype.drawGlow = function (c, ox, oy, inV, n) {
  /* Reflejos especulares en el asfalto mojado cuando llueve */
  if (this.mode && this.mode.mods && this.mode.mods.rain) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const cr of this.cars) if (inV(cr.x, cr.y)) {
      const rx = cr.x - ox + Math.cos(cr.ang) * 7, ry = cr.y - oy + Math.sin(cr.ang) * 7;
      c.fillStyle = 'rgba(255,235,160,0.12)';
      c.beginPath(); c.ellipse(rx, ry, 5, 2.2, cr.ang, 0, TAU); c.fill();
    }
    c.restore();
  }
  _drawGlow92.call(this, c, ox, oy, inV, n);
  /* Cono cálido de la farola delantera de la bici / eléctrica / monopatín de noche */
  if (n > .25 && this.p.veh !== 'walk') {
    const P = this.p, px = P.x - ox, py = P.y - oy, L = (P.veh === 'ebike' || P.veh === 'emonopatin' || this.ebike) ? 34 : 24;
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = `rgba(255,244,180,${(n * 0.22).toFixed(3)})`;
    c.beginPath(); c.moveTo(px, py);
    c.lineTo(px + Math.cos(P.a - .28) * L, py + Math.sin(P.a - .28) * L);
    c.lineTo(px + Math.cos(P.a + .28) * L, py + Math.sin(P.a + .28) * L);
    c.closePath(); c.fill(); c.restore();
  }
  /* Niebla andina del Valle de Aburrá en la madrugada (5:30 a 7:50 a. m.) o bajo aguacero */
  const min = ((this.min || 480) % 1440 + 1440) % 1440, rain = !!(this.mode && this.mode.mods && this.mode.mods.rain);
  const fog = Math.max(rain ? .16 : 0, min >= 320 && min <= 475 ? Math.sin(((min - 320) / 155) * Math.PI) * .22 : 0);
  if (fog > .01) {
    const t = (this.mode && this.mode.t) || 0;
    c.save();
    c.fillStyle = `rgba(226,236,248,${(fog * 0.55).toFixed(3)})`;
    for (let i = 0; i < 3; i++) {
      const fx = ((ox * .15 + t * (4 + i * 2) + i * 95) % 260) - 40, fy = 22 + i * 58;
      c.beginPath(); c.ellipse(fx + 110, fy, 115, 22, 0, 0, TAU); c.fill();
    }
    c.restore();
  }
};
```


#### Cómo probar M5

1. Entrar a **Modo Libre** y tocar el botón **`🚲 Vehículo`** en la barra de acciones inferior.
2. Elegir **⚡ Bici eléctrica** y subir una pendiente fuerte (> 5 %): aparece el indicador `▲ SUBIDA ⚡` y la bici mantiene su velocidad sin agotar al ciclista.
3. Elegir **🛹 Tabla de skate** y presionar el botón **`🔔`** (o barra espaciadora): la tabla ejecuta un salto **`¡Ollie! 🛹`** con sonido de pop sobre el pavimento y partículas bajo las ruedas.
4. Probar los 5 vehículos de ruedas para desbloquear el logro **🏅 Ruedas del valle**.

---

### M6 · Trama del mundo libre «Ruedas y Rieles del Aburrá» y cruce con El Metro `[Ambos / Juega EnCicla]`

#### Qué se hizo en M6

1. **Arco de historia en mundo abierto «Ruedas y Rieles del Aburrá» (`contenido/guion/trama_valle.json`, `src/js/93-trama.js`):**
   - 6 capítulos jugables directamente en el mundo libre (`ModeUsuarioR`) desde el botón **`📖 Trama`**, sin sacar al jugador de la ciudad:
     - **Cap. 1 · *El Tinto de San Antonio*** (San Antonio → Parque Berrío, en Bici EnCicla con Rosalba, Doña Luz y Don Rubén).
     - **Cap. 2 · *El Corredor del Río*** (La Alpujarra → Parques del Río, con Santi y Wílmar + tramo en **Carrera 3D** por el soterrado).
     - **Cap. 3 · *Subida Eléctrica a San Javier*** (Estadio → San Javier, con Kevin y Doña Marleny subiendo la loma en **Bici Eléctrica ⚡**).
     - **Cap. 4 · *Ruedas Libres en Ciudad del Río*** (Industriales → MAMM Ciudad del Río, con Yuli y Jhon en **Tabla de Skate 🛹**).
     - **Cap. 5 · *Relevo en el Norte del Valle*** (Universidad → Parque Explora / Moravia, con Don Libardo y Wilson en **Monopatín Eléctrico 🔋** + tramo **Carrera 3D** por Carabobo Norte).
     - **Cap. 6 · *La Gran Conexión del Aburrá*** (Universidad → La Alpujarra, con Ing. Paola, Don Efraín y Rosalba + rodada final **Carrera 3D**).
2. **15 personajes compartidos de Juega EnCicla y El Metro vivos en el mapa (`contenido/guion/metro.json`, `contenido/guion/trama_valle.json`, `src/js/93-trama.js`):**
   - **9 de Juega EnCicla:** Santi (*Universidad*), Doña Luz (*Estadio*), Don Jairo (*Caribe / Bodega*), Yuli (*Ciudad del Río*), Kevin (*Laureles / Av. 80*), Ing. Paola (*La Alpujarra*), Wilson (*Moravia*), Cata (*Envigado*) y Don Rubén (*Parque Berrío*).
   - **6 de El Metro:** Rosalba (*San Antonio*), Don Efraín (*Cisneros / Universidad*), Doña Marleny (*San Javier*), Wílmar (*Acevedo / Santo Domingo*), Don Libardo (*Universidad*) y Jhon (*Industriales*).
   - Al pasar a menos de `55 m` de cualquiera de ellos en Modo Libre, aparece su personaje con etiqueta (`🚲` o `🚇`), bocadillo de diálogo flotante y bonificación de hojas verdes.
3. **4 fragmentos ferroviarios cruzados con El Metro:**
   - *Tiquete Edmonson de 1929* (Universidad), *Silbato de bronce de La Quiebra* (San Antonio), *Polea guía del Metrocable K (2004)* (San Javier) y *Plano Maestro Ruedas y Rieles* (La Alpujarra).

#### Código completo de los archivos nuevos y modificados en M6

#### Archivo: `contenido/guion/metro.json` [Ambos]

```json
{
 "primerTren": {
  "quien": "Rosalba",
  "dice": "Mija, despierte. El primer tren sale a las cuatro y media y la ciudad no espera a nadie."
 },
 "maquinistaGana": {
  "quien": "Rosalba",
  "dice": "Usted tiene mano."
 },
 "maquinistaPierde": {
  "quien": "Rosalba",
  "dice": "Tranquila, mija. Nadie nace aprendido. Otra vez."
 },
 "cumple": {
  "quien": "La nieta de Rosalba",
  "dice": "Qué bonito celebrar dos formas de movernos."
 },
 "red": {
  "quien": "Don Efraín",
  "dice": "La red no es de hierro, mija. Es de la gente que la cuida."
 },
 "personajesMetro": [
  { "id": "rosalba", "name": "Rosalba", "rol": "Instructora de trenes · Línea A", "lugar": "San Antonio", "tx": 1272, "ty": 2338, "shirt": "#1c5c9c", "skin": 2, "hair": 3, "saludo": "¡Quiubo! Dejé el tren en San Antonio y bajé a ver cómo va el relevo de las bicis." },
  { "id": "efrain", "name": "Don Efraín", "rol": "Memoria del Ferrocarril de Antioquia", "lugar": "Cisneros / Universidad", "tx": 1286, "ty": 2152, "shirt": "#6b4f35", "skin": 1, "hair": 4, "saludo": "Por donde hoy pedaleás pasaba la locomotora Nº 45 rumbo a Puerto Berrío." },
  { "id": "marleny", "name": "Doña Marleny", "rol": "Aromáticas y tinto · Estación San Javier", "lugar": "San Javier", "tx": 958, "ty": 2265, "shirt": "#d94e34", "skin": 2, "hair": 1, "saludo": "Tómese un tintico con canela antes de subir esa loma de San Javier." },
  { "id": "wilmar", "name": "Wílmar", "rol": "Operador de Metrocable · Línea K", "lugar": "Acevedo / Santo Domingo", "tx": 1352, "ty": 1915, "shirt": "#3f8f5a", "skin": 3, "hair": 0, "saludo": "Desde las cabinas del cable se ven las bicis verdes rodando junto al río." },
  { "id": "libardo", "name": "Don Libardo", "rol": "Jefe de estación · Universidad", "lugar": "Universidad", "tx": 1294, "ty": 2125, "shirt": "#0a2342", "skin": 1, "hair": 4, "saludo": "Cuando llega el tren de las cinco, media estación sale directo a buscar bici EnCicla." },
  { "id": "jhon", "name": "Jhon", "rol": "Aprendiz de taller ferroviario", "lugar": "Industriales", "tx": 1255, "ty": 2475, "shirt": "#e38835", "skin": 2, "hair": 0, "saludo": "Rieles arriba y bielas abajo: al final todo es mantener el valle en movimiento." }
 ],
 "fragmentos": [
  { "id": "edmonson", "name": "Tiquete Edmonson de 1929", "quien": "Don Efraín", "lugar": "Universidad", "tx": 1288, "ty": 2148, "texto": "Un boleto de cartón prensado del antiguo Ferrocarril de Antioquia: «Estación Medellín – Estación Botero, 1929»." },
  { "id": "silbato", "name": "Silbato de bronce de La Quiebra", "quien": "Rosalba", "lugar": "San Antonio", "tx": 1274, "ty": 2340, "texto": "El silbato con que los guardagujas daban salida a los vagones antes de que existiera el viaducto de la Línea A." },
  { "id": "polea", "name": "Polea guía del Metrocable K (2004)", "quien": "Doña Marleny", "lugar": "San Javier", "tx": 956, "ty": 2262, "texto": "Pieza conmemorativa del primer cable aéreo urbano del mundo integrado al transporte público en las laderas del valle." },
  { "id": "mural", "name": "Plano Maestro Ruedas y Rieles", "quien": "Don Rubén", "lugar": "La Alpujarra", "tx": 1235, "ty": 2372, "texto": "El mapa firmado por los equipos de EnCicla y El Metro que une las 133 estaciones de bici con las 12 líneas del SITVA." }
 ],
 "creditos": "¿Te gustan los trenes? Juega El Metro",
 "web": "https://juanfeliperico369-stack.github.io/MetroZero/"
}
```

#### Archivo: `contenido/guion/trama_valle.json` [Juega EnCicla]

```json
{
 "titulo": "Ruedas y Rieles del Aburrá",
 "subtitulo": "Crónica abierta del Valle de Aburrá en Modo Libre",
 "personajesEnCicla": [
  { "id": "santi", "name": "Santi", "rol": "Estudiante y ciclista diario", "lugar": "Universidad / Jardín Botánico", "tx": 1298, "ty": 2110, "shirt": "#56c7ff", "skin": 1, "hair": 0, "saludo": "¡Parce! Con EnCicla llego a clase en diez minutos por toda la ciclorruta de Carabobo." },
  { "id": "luz", "name": "Doña Luz", "rol": "Anfitriona de estación · Estadio", "lugar": "Estadio", "tx": 1132, "ty": 2212, "shirt": "#7ab800", "skin": 2, "hair": 2, "saludo": "Buenos días, corazón. Revise siempre frenos y altura del sillín antes de arrancar." },
  { "id": "jairo", "name": "Don Jairo", "rol": "Conductor del camión de Balance", "lugar": "Caribe / Bodega", "tx": 1255, "ty": 2035, "shirt": "#1d4a80", "skin": 2, "hair": 4, "saludo": "A las seis ya llevo dos viajes de balanceo entre el norte y Laureles." },
  { "id": "yuli", "name": "Yuli", "rol": "Mecánica líder del taller", "lugar": "Ciudad del Río", "tx": 1258, "ty": 2525, "shirt": "#ff5a36", "skin": 3, "hair": 1, "saludo": "Cadena lubricada, guaya tensa y llanta a 50 PSI: esa bici quedó volando." },
  { "id": "kevin", "name": "Kevin", "rol": "Apoyo de campo en ruta", "lugar": "Laureles / Av. 80", "tx": 1082, "ty": 2335, "shirt": "#9bd341", "skin": 1, "hair": 0, "saludo": "Hoy me tocó abrir cuatro estaciones automáticas por toda la 80." },
  { "id": "paola", "name": "Ing. Paola", "rol": "Coordinadora de Monitoreo", "lugar": "La Alpujarra", "tx": 1232, "ty": 2368, "shirt": "#2a5a92", "skin": 1, "hair": 2, "saludo": "En las pantallas vemos el pulso del valle: cada préstamo cuenta una historia." },
  { "id": "wilson", "name": "Wilson", "rol": "Técnico electrónico de tótems", "lugar": "Moravia", "tx": 1312, "ty": 2075, "shirt": "#ffb300", "skin": 3, "hair": 0, "saludo": "Panel solar limpio y lector Cívica calibrado: ningún usuario se queda sin rodar." },
  { "id": "cata", "name": "Cata", "rol": "Guía cultural y fotógrafa del valle", "lugar": "Envigado / Las Vegas", "tx": 1218, "ty": 2845, "shirt": "#ff2fb3", "skin": 1, "hair": 1, "saludo": "Entre guayacanes rosados y amarillos, cada esquina del valle merece una postal." },
  { "id": "ruben", "name": "Don Rubén", "rol": "Supervisor general de EnCicla", "lugar": "Parque Berrío", "tx": 1282, "ty": 2305, "shirt": "#0a2342", "skin": 2, "hair": 4, "saludo": "Ciento treinta y tres estaciones y todo un valle conectado a pedal limpio." }
 ],
 "capitulos": [
  {
   "id": "cap1",
   "n": 1,
   "titulo": "El Tinto de San Antonio",
   "quien": "Rosalba y Doña Luz",
   "origen": "San Antonio",
   "destino": "Parque Berrío",
   "tx0": 1272, "ty0": 2338,
   "tx1": 1282, "ty1": 2305,
   "veh": "bike",
   "intro": "Rosalba (conductora de la Línea A de El Metro) encontró en su cabina la bitácora ferroviaria de Don Efraín. Llévasela en bici EnCicla a Don Rubén en Parque Berrío.",
   "cierre": "Don Rubén recibe la bitácora bajo el viaducto de Parque Berrío: «¡Gracias! EnCicla y El Metro laten al mismo ritmo».",
   "hojas": 12
  },
  {
   "id": "cap2",
   "n": 2,
   "titulo": "El Corredor del Río",
   "quien": "Santi y Wílmar",
   "origen": "La Alpujarra",
   "destino": "Parques del Río",
   "tx0": 1232, "ty0": 2368,
   "tx1": 1192, "ty1": 2328,
   "veh": "bike",
   "runner": 0,
   "intro": "Santi y Wílmar están midiendo la conexión intermodal junto al soterrado de Parques del Río. Llega al acceso del río y completa el corredor en Carrera 3D.",
   "cierre": "Santi anota el tiempo en su libreta: «¡Con el soterrado abajo y la ciclorruta arriba, cruzamos el río en un suspiro!».",
   "hojas": 15
  },
  {
   "id": "cap3",
   "n": 3,
   "titulo": "Subida Eléctrica a San Javier",
   "quien": "Kevin y Doña Marleny",
   "origen": "Estadio",
   "destino": "San Javier",
   "tx0": 1132, "ty0": 2212,
   "tx1": 958, "ty1": 2265,
   "veh": "ebike",
   "intro": "El tótem de San Javier necesita un lector Cívica de repuesto. Cambia a la Bici Eléctrica ⚡ y súbelo hasta el puesto de aromáticas de Doña Marleny junto al Metrocable.",
   "cierre": "Doña Marleny te sirve una aromática de cidrón: «¡Esa bici eléctrica subió la loma de San Javier como si fuera planito!».",
   "hojas": 18
  },
  {
   "id": "cap4",
   "n": 4,
   "titulo": "Ruedas Libres en Ciudad del Río",
   "quien": "Yuli y Jhon",
   "origen": "Industriales",
   "destino": "Ciudad del Río (MAMM)",
   "tx0": 1255, "ty0": 2475,
   "tx1": 1258, "ty1": 2525,
   "veh": "skate",
   "intro": "Jhon salió del taller ferroviario y Yuli lo espera frente al Museo de Arte Moderno. Haz el recorrido en Tabla de Skate 🛹 o Patines 🛼 (usa 🔔 para saltar en ollie).",
   "cierre": "Yuli choca los cinco en la plazoleta de Ciudad del Río: «¡Del tren al skate y del skate a la bici: así se vive Medellín!».",
   "hojas": 16
  },
  {
   "id": "cap5",
   "n": 5,
   "titulo": "Relevo en el Norte del Valle",
   "quien": "Don Libardo y Wilson",
   "origen": "Universidad",
   "destino": "Parque Explora / Moravia",
   "tx0": 1294, "ty0": 2125,
   "tx1": 1312, "ty1": 2075,
   "veh": "emonopatin",
   "runner": 3,
   "intro": "Don Libardo avisa desde la estación Universidad que viene un tren lleno de estudiantes. Recorre el Paseo Carabobo Norte en Monopatín Eléctrico 🔋 y supera el tramo 3D.",
   "cierre": "Wilson deja el tótem al 100 % frente al Parque Explora: «¡A tiempo para recibir a toda la muchachada de la U!».",
   "hojas": 18
  },
  {
   "id": "cap6",
   "n": 6,
   "titulo": "La Gran Conexión del Aburrá",
   "quien": "Ing. Paola, Don Efraín y Rosalba",
   "origen": "Universidad",
   "destino": "La Alpujarra",
   "tx0": 1286, "ty0": 2152,
   "tx1": 1235, "ty1": 2372,
   "veh": "ebike",
   "runner": 4,
   "intro": "Don Efraín, Rosalba y la Ing. Paola te esperan en La Alpujarra para inaugurar el Plano Maestro «Ruedas y Rieles del Aburrá». Llega al centro administrativo y completa la rodada final.",
   "cierre": "¡Completaste el arco «Ruedas y Rieles del Aburrá»! Las 133 estaciones de EnCicla y la red del Metro celebran juntas el movimiento del valle.",
   "hojas": 25
  }
 ]
}
```

#### Archivo: `src/js/93-trama.js` [Juega EnCicla]

```javascript
/* =====================================================================
   TRAMA DEL MUNDO LIBRE: «RUEDAS Y RIELES DEL ABURRÁ» (v1.8 · M6)
   Unifica en el mundo abierto de Juega EnCicla:
   - Los 15 personajes compartidos de Juega EnCicla y El Metro ubicados en sus
     barrios y estaciones reales del Valle de Aburrá, con retrato, saludo en
     bocadillo flotante y diálogo al acercarse.
   - Los 6 capítulos del arco jugable «Ruedas y Rieles del Aburrá», que combinan
     los oficios de EnCicla, los nuevos vehículos de M5 (bici eléctrica, skate,
     monopatín eléctrico) y los corredores en 3D de M4 (MGRunner3D).
   - Los 4 fragmentos cruzados con El Metro (Tiquete Edmonson de 1929, Silbato de
     La Quiebra, Polea del Metrocable K y Plano Maestro Ruedas y Rieles).
   ===================================================================== */

const Trama = JE.trama = {
  guion() { return (typeof GUION !== 'undefined' && GUION && GUION.trama_valle) || { personajesEnCicla: [], capitulos: [] }; },
  metro() { return (typeof GUION !== 'undefined' && GUION && GUION.metro) || { personajesMetro: [], fragmentos: [] }; },

  /* Todos los personajes de ambos juegos posicionados en coordenadas de píxel sobre la calle/andén abierto más cercano */
  personajes() {
    if (this._pers) return this._pers;
    const G = this.guion(), M = this.metro(), list = [];
    const all = (G.personajesEnCicla || []).map(p => Object.assign({ juego: 'EnCicla' }, p))
      .concat((M.personajesMetro || []).map(p => Object.assign({ juego: 'El Metro' }, p)));
    for (const p of all) {
      const o = JE.map ? JE.map.nearestOpen(p.tx | 0, p.ty | 0, false) : { x: p.tx, y: p.ty };
      list.push(Object.assign({}, p, { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2 }));
    }
    this._pers = list;
    return list;
  },

  fragmentos() {
    if (this._frags) return this._frags;
    const M = this.metro(), list = [];
    for (const f of (M.fragmentos || [])) {
      const o = JE.map ? JE.map.nearestOpen(f.tx | 0, f.ty | 0, false) : { x: f.tx, y: f.ty };
      list.push(Object.assign({}, f, { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2 }));
    }
    this._frags = list;
    return list;
  },

  estado() {
    const S = Save.data;
    if (!S.trama || typeof S.trama !== 'object') S.trama = { cap: 0, done: [], frags: [], charlas: [] };
    return S.trama;
  },

  capActual() {
    const E = this.estado(), caps = this.guion().capitulos || [];
    return caps.find(c => !E.done.includes(c.id)) || null;
  },

  /* Inicia o continúa un capítulo de la trama en el mundo libre sin encerrar al jugador */
  iniciarCap(M, capId) {
    if (!M || !M.free || !M.ride) return;
    const caps = this.guion().capitulos || [];
    const C = (capId && caps.find(c => c.id === capId)) || this.capActual() || caps[0];
    if (!C) return;
    this.limpiar(M);
    const o1 = JE.map.nearestOpen(C.tx1 | 0, C.ty1 | 0, false);
    const dx = o1.x * TS + TS / 2, dy = o1.y * TS + TS / 2;
    if (C.veh && M.cambiarVehiculo) M.cambiarVehiculo(C.veh);
    M.tramaAct = {
      cap: C,
      m: M.ride.marker({
        x: dx, y: dy, r: 22 * WK, col: '#ff2fb3', label: '📖 ' + C.titulo, num: C.n,
        enter: () => this.llegarCap(M, C)
      })
    };
    M.ride.target = M.tramaAct.m;
    M.ride.calcGps();
    Snd.sfx('ok');
    if (JE.ui) JE.ui.toast('📖 Cap. ' + C.n + ' · ' + C.titulo + ': ' + C.intro);
  },

  llegarCap(M, C) {
    if (!M.tramaAct || M.tramaAct.cap !== C) return;
    this.limpiar(M);
    const finalizar = () => {
      const E = this.estado();
      if (!E.done.includes(C.id)) E.done.push(C.id);
      const premio = C.hojas || 15;
      Save.data.leaves = (Save.data.leaves | 0) + premio;
      M.score += premio * 2;
      if (E.done.length >= (this.guion().capitulos || []).length) {
        Save.data.flags = Save.data.flags || {};
        Save.data.flags.trama_valle = 1;
      }
      const nw = Logros.check();
      Save.save();
      M.ride.stamp = { t: 3.2, title: 'CAP. ' + C.n + ' COMPLETADO', sub: C.titulo + ' · +' + premio + ' 🍃', bg: '#c4ec7c' };
      Snd.sfx('win');
      if (JE.ui) JE.ui.toast('📖 ' + C.cierre + (nw.length ? ' · 🏅 ' + nw.map(x => x.name).join(', ') : ''));
    };
    if (C.runner != null && typeof MGRunner3D !== 'undefined' && !M.sub) {
      const veh = (M.ride.p.veh === 'bike' && M.ebike) ? 'ebike' : M.ride.p.veh;
      M.runSub(new MGRunner3D(M, { corredor: C.runner, veh, metaM: 420, dur: 40 }), () => finalizar());
    } else {
      finalizar();
    }
  },

  limpiar(M) {
    if (M && M.tramaAct) {
      if (M.tramaAct.m && M.ride) M.ride.removeMarker(M.tramaAct.m);
      M.tramaAct = null;
    }
  },

  /* Descubre un fragmento cruzado de El Metro al pasar cerca en modo libre */
  recogerFrag(M, f) {
    const E = this.estado();
    if (E.frags.includes(f.id)) return;
    E.frags.push(f.id);
    Save.data.leaves = (Save.data.leaves | 0) + 10;
    if (E.frags.length >= this.fragmentos().length) {
      Save.data.flags = Save.data.flags || {};
      Save.data.flags.rieles_ruedas = 1;
    }
    Logros.check(); Save.save();
    Snd.sfx('star');
    M.ride.stamp = { t: 3, title: '🚇 RECUERDO DEL METRO', sub: f.name + ' · +10 🍃', bg: '#bfe3f7' };
    if (JE.ui) JE.ui.toast('🚇 ' + f.name + ' (' + f.quien + '): ' + f.texto);
  },

  /* Personaje cercano al jugador (< 36 m) */
  cerca(M) {
    if (!M || !M.ride) return null;
    const P = M.ride.p;
    let best = null, bd = 36 * WK;
    for (const p of this.personajes()) {
      const d = dist(P.x, P.y, p.x, p.y);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  },

  hablar(M, p) {
    p = p || this.cerca(M);
    if (!p) return;
    const E = this.estado();
    if (!E.charlas.includes(p.id)) {
      E.charlas.push(p.id);
      Save.data.leaves = (Save.data.leaves | 0) + 3;
      if (E.charlas.length >= 8) { Save.data.flags = Save.data.flags || {}; Save.data.flags.vecinos_valle = 1; }
      Logros.check(); Save.save();
    }
    Snd.sfx('ok');
    if (JE.ui) JE.ui.toast('💬 ' + p.name + ' (' + p.rol + '): «' + p.saludo + '»');
  }
};

/* Ventana de la trama «Ruedas y Rieles del Aburrá»: capítulos, personajes de ambos juegos y fragmentos de El Metro */
UI.tramaValle = function (M) {
  const E = Trama.estado(), G = Trama.guion(), caps = G.capitulos || [], frags = Trama.fragmentos(), pers = Trama.personajes();
  const act = M && M.tramaAct && M.tramaAct.cap;
  this.modal(`<h2>📖 ${G.titulo || 'Ruedas y Rieles del Aburrá'}</h2>
    <p class="m" style="margin:4px 0 10px">${G.subtitulo || ''} · Capítulos: <strong>${E.done.length}/${caps.length}</strong> · Recuerdos del Metro: <strong>${E.frags.length}/${frags.length}</strong> · Vecinos saludados: <strong>${E.charlas.length}/${pers.length}</strong></p>
    <div class="col" style="gap:8px;max-height:46vh;overflow-y:auto;padding-right:4px">
      ${caps.map(c => {
        const ok = E.done.includes(c.id), on = act && act.id === c.id;
        return `<div class="card" style="padding:10px 12px;border-left:4px solid ${ok ? PAL.vd : on ? '#ff2fb3' : PAL.cie}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span><strong>${ok ? '✓ ' : 'Cap. ' + c.n + ' · '}${c.titulo}</strong><br><small class="m">${c.quien} · ${c.origen} → ${c.destino}</small></span>
            ${M && M.free ? `<button class="btn sm ${on ? 'pri' : ''}" data-cap="${c.id}">${on ? '◎ En curso' : ok ? '↻ Repetir' : '▶ Rodar'}</button>` : ''}
          </div>
          <p class="m" style="font-size:12.5px;margin:6px 0 0">${ok ? c.cierre : c.intro}</p>
        </div>`;
      }).join('')}
      <p class="pag" style="margin-top:8px">🚇 Fragmentos cruzados con El Metro</p>
      ${frags.map(f => {
        const ok = E.frags.includes(f.id);
        return `<div class="opt" style="padding:8px 10px"><span><strong>${ok ? '🚇 ' + f.name : '🔒 Recuerdo en ' + f.lugar}</strong><br><small class="m">${ok ? f.texto : 'Pasa pedaleando cerca de ' + f.lugar + ' (' + f.quien + ') para descubrirlo.'}</small></span></div>`;
      }).join('')}
    </div>
    <div class="col" style="margin-top:10px"><button class="btn pri" id="mClose">▶ Volver al valle</button></div>`, () => {
    $$('[data-cap]').forEach(b => b.onclick = () => {
      Trama.iniciarCap(M, b.dataset.cap);
      this.closeModal();
      if (Game.paused) Game.resume();
    });
    const cl = $('#mClose'); if (cl) cl.onclick = () => { this.closeModal(); if (Game.paused) Game.resume(); };
  });
};

/* Dibujo de los 15 personajes compartidos y los 4 fragmentos del Metro en el mapa y HUD del Modo Libre */
const _tick93 = ModeUsuarioR.prototype.tick;
ModeUsuarioR.prototype.tick = function (dt) {
  _tick93.call(this, dt);
  if (!this.free || !this.ride) return;
  const P = this.ride.p, E = Trama.estado();
  for (const f of Trama.fragmentos()) {
    if (!E.frags.includes(f.id) && dist(P.x, P.y, f.x, f.y) < 26 * WK) Trama.recogerFrag(this, f);
  }
  const nearP = Trama.cerca(this);
  if (nearP && this._lastNearP !== nearP.id) {
    this._lastNearP = nearP.id;
    Trama.hablar(this, nearP);
  } else if (!nearP) {
    this._lastNearP = null;
  }
};

const _hudLife93 = Ride.prototype.hudLife;
Ride.prototype.hudLife = function (V, sx, sy, W) {
  _hudLife93.call(this, V, sx, sy, W);
  if (!this.mode || !this.mode.free) return;
  const c = V.ctx, P = this.p, E = Trama.estado();
  /* Marcadores de fragmentos de El Metro cercanos */
  for (const f of Trama.fragmentos()) {
    if (E.frags.includes(f.id)) continue;
    const d = dist(P.x, P.y, f.x, f.y); if (d > 260 * WK) continue;
    const q = W(f.x, f.y); if (q.x < -30 || q.x > V.w + 30 || q.y < 40 || q.y > V.h - 40) continue;
    c.save(); c.fillStyle = '#1c5c9c'; c.strokeStyle = '#fff'; c.lineWidth = 2;
    c.beginPath(); c.arc(q.x, q.y, 8, 0, TAU); c.fill(); c.stroke();
    V.text('🚇', q.x, q.y + 4, { size: 11, align: 'center' });
    c.restore();
  }
  /* Personajes compartidos de EnCicla y El Metro con etiqueta y bocadillo de saludo al acercarse */
  for (const p of Trama.personajes()) {
    const d = dist(P.x, P.y, p.x, p.y); if (d > 220 * WK) continue;
    const q = W(p.x, p.y); if (q.x < -50 || q.x > V.w + 50 || q.y < 45 || q.y > V.h - 45) continue;
    c.save();
    c.fillStyle = p.shirt || PAL.vd; c.strokeStyle = '#0a2342'; c.lineWidth = 2;
    c.beginPath(); c.arc(q.x, q.y - 4, 6, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = SKINS[p.skin | 0] || '#f0c090';
    c.beginPath(); c.arc(q.x, q.y - 11, 4.2, 0, TAU); c.fill(); c.stroke();
    c.restore();
    const tag = (p.juego === 'El Metro' ? '🚇 ' : '🚲 ') + p.name;
    V.text(tag, q.x, q.y - 20, { size: 11, align: 'center', color: '#fff', bg: p.juego === 'El Metro' ? '#1c5c9cdd' : '#0a2342dd', pad: 2 });
    if (d < 55 * WK) {
      const short = p.saludo.length > 54 ? p.saludo.slice(0, 52) + '…' : p.saludo;
      V.text('«' + short + '»', q.x, q.y - 36, { size: 11, align: 'center', color: '#0a2342', bg: '#fff8dc', pad: 3, border: '#0a2342', body: true });
    }
  }
};

const _act93 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act93.call(this);
  if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
  a.push({ id: 'trama', icon: 'estrella', label: this.tramaAct ? '📖 Cap. ' + this.tramaAct.cap.n : '📖 Trama', fn: () => UI.tramaValle(this) });
  return a;
};

LOGROS.push(
  { id: 'trama_valle', name: 'Cronista del Aburrá', desc: 'Completa los 6 capítulos de la trama abierta «Ruedas y Rieles del Aburrá»', icon: 'estrella', test: S => !!(S.flags && S.flags.trama_valle) },
  { id: 'rieles_ruedas', name: 'Ruedas y Rieles', desc: 'Descubre los 4 fragmentos ferroviarios cruzados con El Metro en el modo libre', icon: 'metro', test: S => !!(S.flags && S.flags.rieles_ruedas) },
  { id: 'vecinos_valle', name: 'Amigo del valle', desc: 'Conversa con 8 personajes de EnCicla y El Metro por las calles del valle', icon: 'anfitrion', test: S => !!(S.flags && S.flags.vecinos_valle) }
);
```


#### Cómo probar M6

1. Entrar a **Modo Libre** y tocar el botón **`📖 Trama`** en la barra inferior para abrir la crónica **«Ruedas y Rieles del Aburrá»**.
2. Tocar **`▶ Rodar`** en el Capítulo 1 (*El Tinto de San Antonio*) o cualquiera de los 6 capítulos: el GPS marca la ruta en la ciudad abierta, equipa el vehículo del capítulo y al llegar lanza el cierre o el corredor 3D correspondiente.
3. Acercarse a las estaciones **San Antonio**, **Universidad**, **San Javier** o **La Alpujarra** para conversar con Rosalba, Don Efraín, Doña Marleny o la Ing. Paola y recolectar los **4 recuerdos ferroviarios de El Metro (`🚇`)**.

---

## 3. Reporte de pruebas y fallas (Tabla M1)

| # | Juego | Modo o pantalla | Qué pasa | Cómo reproducirlo | Gravedad | Estado |
|---|---|---|---|---|---|---|
| 1 | Juega EnCicla | Mapa 3D · Controles táctiles (`81-controles.js`, `88-camara.js`) | Al apoyar el primer dedo sobre las flechas o el joystick y luego apoyar un segundo dedo para pellizcar/girar la cámara, `Input.joy.on` se apagaba pero `Ctrl.held` e `Input.keys` quedaban encendidos, dejando la bici acelerando o girando sola. | En celular (`412 × 915`), elegir control *Flechas* o *Joystick*, mantener pulsado con un dedo y apoyar un segundo dedo para hacer zoom. | **Alta** | **Corregido** (`Ctrl.clear()` al detectar 2 dedos o cámara libre) |
| 2 | Juega EnCicla | Cámara 3D (`88-camara.js`) | Al deslizar dos dedos verticalmente para inclinar la cámara, pequeñas variaciones en la separación de los dedos (> 12 px) bloqueaban el gesto en modo zoom/giro (`lock = 'zr'`) e impedían inclinar; además, un giro leve desde vista cenital saltaba `C.t` a `0.3` en un solo cuadro. | En vista 3D cenital, subir o bajar dos dedos juntos o girar levemente con dos dedos. | **Media** | **Corregido** (umbral proporcional `Math.abs(dm) > dz * 1.15` e inclinación progresiva) |
| 3 | Juega EnCicla | Tráfico en puentes y soterrados (`30-ride.js`, `76-altura.js`) | `Ride.prototype.updCars` calculaba choques con `this.cars` sin verificar si el carro y el jugador estaban en el mismo nivel vertical (`lvl = -1, 0, +1`), provocando choques fantasma al pasar por debajo de un puente donde circulaban carros arriba. | Pasar en bici por debajo de un puente vehicular en La Aguacatala, Industriales o San Juan mientras pasa tráfico sobre el puente. | **Alta** | **Corregido** (colisión y frenado solo cuando `car.nivel === Math.sign(P.lvl)`) |
| 4 | Juega EnCicla | Puentes, deprimidos y GPS (`76-altura.js`, `20-map.js`) | `Ride.prototype.nivel()` solo se ejecutaba cuando `GFX() === '3d'`, solo tenía barandas en puentes sobre agua (`D.agua`), no existían los pasos deprimidos (`lvl = -1`) y el GPS sugería girar 90° desde la mitad de un puente hacia la calle inferior. | Cruzar un puente vehicular sobre avenida en vista 2D o 3D con destino lateral activo en el GPS. | **Alta** | **Corregido** (`nivel()` en 2D/3D, 12 deprimidos `lvl = -1`, barandas en todo puente/túnel y `CityMap.desnivel`) |
| 5 | Juega EnCicla | Modo Libre · Paseo guiado (`89-paseo.js`) | Tocar la pantalla con dos dedos para girar o acercar la cámara durante el Paseo guiado disparaba `Input.joy.on` en el primer dedo y cancelaba el paseo; además `Paseo.siguiente()` no priorizaba estrictamente la cubeta de lugares a `< 2,5 km`. | Activar `🧭 Paseo` en Modo Libre y pellizcar la pantalla con dos dedos para mirar un edificio. | **Media** | **Corregido** (filtro `!Cam.g && Cam.ptr.size <= 1` con retardo de `140 ms` y ordenamiento por cubeta `<= 2,5 km`) |
| 6 | Juega EnCicla | Modo Libre · Energía y velocidad elegida (`69-libre.js`) | El gasto de energía en subida (`drain = .35 + sl * 30`) se multiplicaba por `dt` real sin escalar por `velMul(this)`, por lo que subir una loma en velocidad *Tranquila* (`0,8×`) consumía `1,87×` más energía que subir la misma loma en *Muy rápida* (`1,5×`). | Subir de Estadio a San Javier en Modo Libre con velocidad `0,8×` y comparar energía restante contra `1,5×`. | **Media** | **Corregido** (gasto escalado por `velMul(this)`) |
| 7 | Juega EnCicla | Rendimiento · Calidad automática (`88-camara.js`, `75-graficos.js`) | `Calidad.cuadro(t)` salía sin hacer nada cuando `devicePixelRatio <= 1.01`, y cuando reducía `View.calidad` en pantallas Retina cambiaba `CityMap.cq()`, borrando de golpe todos los trozos 3D en caché y causando un tirón perceptible. | Jugar en un portátil o monitor con `DPR = 1` con cámara inclinada en La Candelaria. | **Media** | **Corregido** (ajuste en 2 etapas: primero `JE.calidad3D = 0` sin vaciar caché de trozos, luego `View.calidad`) |
| 8 | Juega EnCicla | Ciudad 3D · Centro de Medellín (`75-graficos.js`) | Con cámara muy inclinada (`til > 0.55`) y zoom alejado (`z < 0.82`) en zonas densas, `draw3D` proyectaba y dibujaba accesorios de techo y líneas de piso de cientos de lotes bajos lejanos (> 270 px del foco), elevando el tiempo de cuadro. | Inclinar la cámara al máximo (`Baja`) y alejar el zoom en Parque Berrío / La Candelaria. | **Baja** | **Corregido** (culling de lotes bajos `z < 0.16` y detalles de techo a gran distancia en `fast3D`) |
| 9 | Juega EnCicla | Multijugador WebRTC (`70-net.js`) | En dispositivos sin interfaz de red activa distinta de `lo` (modo avión, contenedor o pruebas locales entre pestañas sin Wi-Fi), `RTCPeerConnection` reúne 0 candidatos ICE (`a=candidate:` ausente) y el botón `#nStart` nunca se habilita. | Abrir 3 pestañas en un entorno sin interfaz LAN/WAN o ejecutar la sección 5 de `tests/run.js`. | **Media** | **Corregido** (respaldo automático con `BroadcastChannel('je-net-' + roomId)` cuando el SDP no trae candidatos ICE) |

---

## 4. Ideas innovadoras para Juega EnCicla (ordenadas por impacto y esfuerzo)

Todas las ideas propuestas a continuación están diseñadas específicamente para **Juega EnCicla**, respetando la restricción de **un solo archivo HTML offline sin librerías externas** y aprovechando el Motor del Valle y el vínculo con *El Metro*:

| # | Idea innovadora | Impacto | Esfuerzo | Cómo encaja en un solo HTML sin librerías |
|---|---|---|---|---|
| 1 | **Intermodalidad en vivo en estaciones SITVA (subir con la bici plegable o tomar el Metrocable / Tranvía desde Modo Libre)** | **Muy alto** | **Bajo** | Al llegar a cualquiera de las estaciones de *El Metro*, *Metrocable* (Líneas K, J, H, M, P, L) o *Tranvía de Ayacucho*, permitir un botón `🚡 Subir al Cable / 🚊 Tranvía` que traslada la cámara en tiempo real siguiendo la cabina aérea o el tranvía sobre el valle en 3D hasta la estación de destino. |
| 2 | **Editor ciudadano de ciclorrutas («Diseña tu corredor del AMVA»)** | **Muy alto** | **Medio** | Permitir en Modo Libre trazar con el dedo nuevos tramos de ciclorruta (`TT.CICLO`) sobre avenidas existentes; el simulador `Sim` recalcula al instante cuántos viajes por hora suben en las estaciones cercanas y cuántas toneladas de $\text{CO}_2$ se ahorran. |
| 3 | **Fantasma de récord y retos asincrónicos por código QR / texto corto (`JE2...`)** | **Alto** | **Bajo** | Comprimir con `CompressionStream('deflate-raw')` las muestras `(t, x, y, veh)` o los cambios de carril de `MGRunner3D` en un código de 120 caracteres para que un amigo pegue el código sin internet y compita contra el ciclista fantasma translúcido en la misma ciclorruta. |
| 4 | **Radio Comunitaria del Aburrá (síntesis procedural WebAudio + boletines viales en pantalla)** | **Alto** | **Bajo** | Tres emisoras seleccionables en WebAudio puro (*Tropipaisa FM*, *Lofi del Río* y *Radio Operativa EnCicla*) que adaptan su tempo a la velocidad de pedaleo y anuncian en cintillo cuando empieza un aguacero en Envigado o cuando hay partido en el Atanasio. |
| 5 | **Modo Fotógrafo 3D con postal exportable en PNG desde Canvas** | **Alto** | **Bajo** | En la cámara libre 3D (`📷`), añadir un disparador que encuadra la vista actual en perspectiva 3D con sello postal del barrio, fecha, hora, clima y personaje, y descarga un PNG nítido (`canvas.toDataURL()`) listo para compartir. |
| 6 | **Clima microclimático por municipio del valle (llueve en Sabaneta mientras hace sol en Bello)** | **Alto** | **Medio** | En vez de lluvia uniforme en todo el mapa, mover celdas de nube de sur a norte o desde las laderas con una función gaussiana `rainAt(x, y, t)`: el jugador ve la cortina de lluvia acercarse desde Itagüí y puede buscar techo en una estación antes de mojarse. |
| 7 | **Escuela de Bici EnCicla (circuito de destreza para niños y adultos mayores)** | **Alto** | **Bajo** | Un modo corto en el Parque Norte o la Unidad Deportiva Atanasio donde Doña Luz enseña equilibrio, señales manuales de giro, distancia segura con buses y frenado en piso mojado. |
| 8 | **Ciclopaseo Nocturno de los Jueves (caravana luminosa por el valle)** | **Alto** | **Bajo** | Evento especial cuando el reloj del Modo Libre pasa de las 19:30: decenas de ciclistas con luces LED verdes, azules y fucsias forman una serpiente luminosa por la Av. El Poblado, la 70 y Parques del Río; rodar en grupo reduce el gasto de energía un 40 % (*efecto pelotón*). |
| 9 | **Desfile de Silleteros y Alumbrados en 3D sobre Parques del Río** | **Medio** | **Bajo** | Cuando la temporada activa *Feria de las Flores* o *Alumbrados navideños*, levantar en `draw3D` arcos luminosos volumétricos sobre el río Medellín y silletas florales tridimensionales en Santa Elena y Avenida La Playa. |
| 10 | **Tarjeta Cívica Unificada entre Juega EnCicla y El Metro (`localStorage` compartido en el mismo dominio)** | **Medio** | **Bajo** | Guardar en una clave compartida `aburra_civica_v1` el perfil del personaje, las hojas verdes, los boletos y los fragmentos ferroviarios: lo que desbloqueas en *El Metro* (`/metro/`) aparece en tu billetera Cívica de *Juega EnCicla* (`/`) y viceversa. |
| 11 | **Minijuego de Poda y Guayacanes (mantenimiento ambiental de las ciclorrutas)** | **Medio** | **Bajo** | Nuevo encargo para el rol de *Apoyo*: despejar ramas caídas tras un vendaval y sembrar guayacanes amarillos y rosados que luego florecen permanentemente en ese tramo del mapa del jugador. |
| 12 | **Narrador accesible por voz (`window.speechSynthesis` offline)** | **Medio** | **Bajo** | Opción en *Más > Accesibilidad* que lee con la voz en español del sistema operativo los avisos del GPS (*«Gira a la derecha en 40 metros hacia Estación Estadio»*), los diálogos de los personajes y las tarjetas de ventanilla. |

---

## 5. Lista de verificación (qué se probó y en qué tamaño de pantalla)

| Prueba ejecutada | Celular (`412 × 915`, DPR 2, táctil) | Computador (`1280 × 800`, DPR 1, teclado y ratón) | Resultado |
|---|---|---|---|
| **1. Sintaxis y compilación offline (`node tools/build.js`)** | Sí (`dist/juega-encicla.html`, 4,86 MB, 0 recursos externos) | Sí (`dist/juega-encicla.html`, CSP activo, 0 errores de consola) | **PASÓ** |
| **2. Auditoría completa del mapa (`node tools/auditoria-mapa.js`)** | 133 estaciones, 45 lugares con postal, 1.203 sitios reales, 5.314 edificios | 1.435 puentes en alto, 12 deprimidos/soterrados, 13 estaciones de Metro en viaducto | **PASÓ** |
| **3. Alcanzabilidad del mapa en 2 niveles (`CityMap.flow` y `CityMap.desnivel`)** | 133/133 estaciones y 45/45 lugares alcanzables en bici y camión | GPS sin giros laterales imposibles desde puentes ni deprimidos | **PASÓ** |
| **4. M1 · Controles táctiles, cámara 3D de 2 dedos y Paseo guiado** | `Ctrl.clear()` libera flechas/joystick al apoyar 2.º dedo; inclinación suave; Paseo no se corta al mover cámara | Rueda del ratón, clic derecho orbital y teclas `+ - Z X R F T C N G` funcionan sin bloqueo | **PASÓ** |
| **5. M1 · Fluidez y tiempo de cuadro en 3D (La Candelaria, cámara inclinada `t = 0.62` y girada)** | Mediana de cuadro `< 6 ms` (~60 FPS estables) | Mediana de cuadro `< 8 ms` (~60 FPS estables, `Calidad` activo en DPR 1) | **PASÓ** |
| **6. M2 · Colisiones por nivel vertical (`-1` deprimido, `0` suelo, `+1` puente)** | 0 choques fantasma bajo puentes o dentro del Soterrado de Parques del Río | `Valle.decodificar()` responde cota (`1478 m` en centro), municipio y barrio exactos | **PASÓ** |
| **7. M3 · Interiores de estaciones, casas de ladera y atmósfera** | Caseta manual con escritorio, pantalla, llaves, chaleco, tula, cargador LED y tinto; tótem con halo Cívica | Casas de ladera (> 1.545 m) con tanque Rotoplas, ropa tendida y escalera exterior; niebla y farola nocturna | **PASÓ** |
| **8. M4 · Run EnCicla · Carrera sin fin en 3D (`MGRunner3D`)** | Botones táctiles `◀`, `▲ Salto`, `▼ Agacha`, `🔔 Timbre`, `▶` y *swipe* funcionan; cambio instantáneo 1.ª/3.ª persona | Teclas `Flechas/WASD`, `Espacio` (timbre) y `V/C` (cámara 1.ª/3.ª persona) + piloto automático `bot()` | **PASÓ** |
| **9. M5 · Siete vehículos jugables en Modo Libre** | Selector `🛴 Vehículo` probado con `bike`, `ebike`, `scooter`, `emonopatin`, `skate` (*ollie*), `patines` y `walk` | Bici EnCicla prestada queda estacionada con candado al cambiar a vehículo personal; logro `multimodal` verificado | **PASÓ** |
| **10. M6 · Trama «Ruedas y Rieles del Aburrá», 15 personajes y 4 fragmentos de El Metro** | Modal `📖 Trama` abre los 6 capítulos; bocadillos de saludo de los 15 personajes en el mapa | Recolección de los 4 fragmentos ferroviarios de *El Metro* y desbloqueo de logros verificados | **PASÓ** |
| **11. Simulación completa de los 13 modos y sala multijugador de 3 dispositivos (`tests/run.js --n=27`)** | 27 partidas simuladas + 12 pruebas de interfaz + prueba CPU 4× | Sala multijugador con 3 dispositivos conectada y sincronizada de principio a fin | **PASÓ** |
