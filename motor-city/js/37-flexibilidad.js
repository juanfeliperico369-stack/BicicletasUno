/* =====================================================================
   FLEXIBILIDAD (4.8) · que cada quien ajuste el juego a su mano
   Pedido del autor: «Añade a todo *Flexibilidad*». Un solo lugar con los ajustes que cambian cómo se siente el juego
   (lo que ofrecen los juegos de carreras y de mundo abierto para celular: esquema de control, sensibilidad, mano,
   tamaño de los botones, cámara y calidad). El motor no guarda nada: cada juego guarda el objeto donde quiera
   (Turno Cero en leerG().flex) y lo aplica al cargar.
   - 🕹️ control: según la cámara (lo de siempre), apuntar en el mundo, volante o un pulgar (acelera solo);
   - 🎯 giro: normal, rápido o suave (MC.opciones.giro, en el manejo y en la física);
   - 🚗 velocidad de los vehículos: ×1 a ×1,5 o ×0,8 (MC.Vehiculos.escala; también para los rivales, para que sea justo);
   - 🎥 distancia de la cámara: normal, lejos o cerca (MC.opciones.camDist);
   - ⏫ acelerador fijo al subir a un vehículo (el juego lo lee);
   - 🚇 tren: el joystick empuja hacia donde va el tren o es una palanca ↑↓ (el juego lo lee);
   - ✋ mano: diestra o zurda (joystick a la derecha, botones y minimapa a la izquierda);
   - 🔠 tamaño de la interfaz: 100 % a 130 % o 90 % (--mc-ui);
   - 🎨 calidad: automática o fija (baja, media, alta);
   - 📳 vibración en los choques (si el aparato la tiene).
   Uso: const f = MC.Flex.valores(guardado); MC.Flex.aplicar(f, { vistas }); MC.Flex.menu(ui, f, nuevo => guardar(nuevo));
   ===================================================================== */
const Flex = {
  /* [clave, nombre, opciones]: la primera opción es la de fábrica */
  DEF: [
    ['control', '🕹️ Control', [['auto', 'según la cámara'], ['mundo', 'apuntar hacia donde voy'], ['volante', 'volante (↑ acelera, ◀ ▶ giran)'], ['un_pulgar', 'un pulgar (acelera solo)']]],
    ['giro', '🎯 Giro', [[1, 'normal'], [1.3, 'rápido'], [.75, 'suave']]],
    ['velocidad', '🚗 Velocidad de los vehículos', [[1, '×1'], [1.25, '×1,25'], [1.5, '×1,5'], [.8, '×0,8']]],
    ['camara', '🎥 Distancia de la cámara', [[1, 'normal'], [1.3, 'lejos'], [.8, 'cerca']]],
    ['acelFijo', '⏫ Acelerador fijo al subir', [[false, 'no'], [true, 'sí']]],
    ['tren', '🚇 Tren', [['direccion', 'el joystick empuja hacia donde va'], ['palanca', 'palanca: ↑ acelera, ↓ frena']]],
    ['mano', '✋ Mano', [['diestra', 'diestra'], ['zurda', 'zurda (joystick a la derecha)']]],
    ['ui', '🔠 Tamaño de la interfaz', [[1, '100 %'], [1.15, '115 %'], [1.3, '130 %'], [.9, '90 %']]],
    ['calidad', '🎨 Calidad', [['auto', 'automática'], [.45, 'baja'], [.7, 'media'], [1, 'alta']]],
    ['vibrar', '📳 Vibración en choques', [[true, 'sí'], [false, 'no']]],
    ['pantalla', '✂️ Pantalla', [['mitades', 'en mitades: arriba la cámara, abajo manejar'], ['clasica', 'clásica: joystick en toda la izquierda']]]
  ],
  actual: null,
  /* lo guardado, limpio: cada clave con un valor que existe (lo desconocido vuelve a fábrica) */
  valores(g) { const o = {}; for (const [k, , ops] of this.DEF) { const v = g ? g[k] : undefined; o[k] = ops.some(p => p[0] === v) ? v : ops[0][0]; } return o; },
  texto(f, k) { const D = this.DEF.find(d => d[0] === k); return (D[2].find(p => p[0] === f[k]) || D[2][0])[1]; },
  siguiente(f, k) { const ops = this.DEF.find(d => d[0] === k)[2], i = ops.findIndex(p => p[0] === f[k]); return Object.assign({}, f, { [k]: ops[(i + 1) % ops.length][0] }); },
  aplicar(f, op = {}) {
    f = this.valores(f); const O = MC.opciones;
    O.giro = f.giro; O.camDist = f.camara; O.ui = f.ui; O.pantalla = f.pantalla; O.vibrar = f.vibrar; O.zurdo = f.mano === 'zurda'; O.control = f.control;
    if (MC.Vehiculos) MC.Vehiculos.escala = f.velocidad;
    if (typeof document !== 'undefined') { document.documentElement.style.setProperty('--mc-ui', String(f.ui)); if (document.body) document.body.classList.toggle('mc-zurdo', O.zurdo); }
    const V = op.vistas; if (V) { if (f.calidad === 'auto') V.auto = true; else { V.auto = false; V.calidad = f.calidad; } }
    this.actual = f; MC.emit('flex', f); return f;
  },
  /* el esquema de MC.Manejo.aplicar según el ajuste y la cámara ('auto' deja lo que la cámara pide) */
  vista(porCamara) { const c = MC.opciones.control; return c === 'mundo' ? 'mundo' : c === 'volante' || c === 'un_pulgar' ? 'volante' : porCamara; },
  esquema(porDefecto = 'joystick') { return MC.opciones.control === 'un_pulgar' ? 'un_pulgar' : porDefecto; },
  vibrar(ms) { try { if (MC.opciones.vibrar !== false && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sin vibración */ } },
  /* el menú: cada fila pasa al siguiente valor; «↺ Como venía» vuelve a lo de fábrica */
  menu(ui, f, guardar, titulo = '⚙️ Flexibilidad') {
    f = this.valores(f);
    const it = this.DEF.map(([k, n]) => ({ id: k, texto: n + ': <b>' + this.texto(f, k) + '</b>' })).concat([{ id: '_fabrica', texto: '↺ Como venía' }, { id: '_x', texto: '✕ Listo' }]);
    ui.menu(titulo, it, k => { if (k === '_x') return; const n = k === '_fabrica' ? this.valores({}) : this.siguiente(f, k); guardar(n); this.menu(ui, n, guardar, titulo); });
  }
};
MC.Flex = Flex;
/* 📳 un toque corto en los choques del jugador (los rivales llevan .ia) */
MC.on('choque', C => { if (C && !C.ia && (C.impacto || 0) > 4) Flex.vibrar(Math.min(120, 20 + C.impacto * 6)); });
