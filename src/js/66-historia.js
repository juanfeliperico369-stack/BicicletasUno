/* =====================================================================
   HISTORIA: 27 capítulos (9 oficios × 3 turnos). Cada turno aprobado
   desbloquea el siguiente. Un mentor por oficio te habla antes y después.
   ===================================================================== */
/* elenco: [nombre, cargo, piel, pelo, gorra/casco (o '' si no usa), camisa] */
const CAST = {
  usuario: ['Doña Luz', 'usuaria desde 2011', '#e0ac7e', '#d9d9d9', '', '#b07cff'],
  anfitrion: ['Santi', 'anfitrión de estación', '#c68a5c', '#2b1d14', '#9bd341', '#9bd341'],
  mecanico: ['Don Jairo', 'mecánico del taller', '#a86a3d', '#8a8a8a', '#0e2d55', '#143a6b'],
  bodega: ['Yuli', 'jefa de bodega', '#e0ac7e', '#5a2d0c', '', '#ffc93c'],
  apoyo: ['Kevin', 'apoyo en ruta', '#8d5524', '#141414', '#ffffff', '#9bd341'],
  tecnico: ['Ing. Paola', 'técnica de estaciones', '#f1c9a5', '#141414', '#ffc93c', '#0a2342'],
  balance: ['Wilson', 'conductor de balance', '#c68a5c', '#2b1d14', '#ff6b5a', '#ffffff'],
  monitoreo: ['Cata', 'sala de control', '#a86a3d', '#2b1d14', '', '#56c7ff'],
  supervisor: ['Don Rubén', 'supervisor', '#e0ac7e', '#bbbbbb', '', '#0a2342']
};
/* t: título · a: antes del turno · d: después de aprobarlo */
const HISTORIA = {
  usuario: [
    { t: 'El primer pedalazo', a: '¡Bienvenido, mijo! Yo monto en EnCicla desde 2011. Presta tu primera bici y llévala a la otra estación antes de una hora. Suave, que nadie nace aprendido.', d: '¿Viste? Gratis, sin humo y sin trancón. Mañana te enseño a respetar los semáforos.' },
    { t: 'Semáforo en rojo', a: 'Hoy son dos viajes. Ojo con los semáforos: en bici también se frena en rojo, que del afán no queda sino el cansancio.', d: 'Así da gusto: pedaleas como todo un ciudadano. Dicen que EnCicla anda buscando anfitriones…' },
    { t: 'Tres viajes y una decisión', a: 'Tres viajes seguidos, como cualquier día de trabajo. Si los logras, pasa por la estación: Santi, el anfitrión, quiere conocerte.', d: '¡Te lo dije! Santi dice que tienes madera. Ponte el chaleco: mañana empiezas como anfitrión.' }
  ],
  anfitrion: [
    { t: 'El chaleco verde', a: 'Bienvenido a la estación. El anfitrión es la cara de EnCicla: saluda, revisa la tarjeta y entrega una bici buena. Hoy la fila es corta.', d: '¡Buen primer turno! La gente se va contenta cuando la atienden con una sonrisa.' },
    { t: 'Fila de hora pico', a: 'Hoy sale más gente de la universidad. Mira bien cada tarjeta y no entregues bicis con luz roja.', d: 'Ni un error. Don Jairo, el mecánico, preguntó quién estaba dejando las bicis tan ordenadas.' },
    { t: 'La estación es tuya', a: 'Hoy cierro yo… ¡mentiras! Cierras tú. Fila larga y bicis dañadas: sepáralas para el taller.', d: 'Estación impecable. Don Jairo te espera: dice que quien cuida las bicis debe aprender a curarlas.' }
  ],
  mecanico: [
    { t: 'El oído del mecánico', a: 'Toda bici avisa lo que le duele: una llanta baja, una cadena seca. Empieza por lo fácil y usa la herramienta correcta.', d: 'Eso. Bici que sale de aquí, sale como nueva.' },
    { t: 'Frenos y cadenas', a: 'Hoy llegan más enfermas. Primero mira la falla y después repara: el que adivina, daña.', d: 'Buen pulso. En bodega están cortos de manos y Yuli necesita a alguien juicioso.' },
    { t: 'Taller a reventar', a: 'Mañana hay evento y el valle necesita todas las bicis. Hoy nadie se va hasta dejarlas listas… bueno, tú no.', d: '¡Qué berraquera! Todas rodando. Yuli te recibe en la bodega.' }
  ],
  bodega: [
    { t: 'Cada cosa en su sitio', a: 'La bodega es el corazón: aquí llega todo y de aquí sale todo. Clasifica cada repuesto en su caja y carga las bicis nuevas.', d: 'Ordenadito. Así los camiones no pierden tiempo.' },
    { t: 'Llegó el pedido', a: 'Hoy llegan repuestos más rápido. Que no se te cruce nada: una caja mal puesta es una bici parada.', d: 'Ni una pieza perdida. Kevin, el de apoyo, anda pidiendo ayuda con los relevos.' },
    { t: 'Desvíos', a: 'Hoy toca enrutar lo que sale para todo el valle. Cada paquete por su carril.', d: 'Bodega al día. Kevin te presta la bici de apoyo: ¡a la calle!' }
  ],
  apoyo: [
    { t: 'Relevos', a: 'El de apoyo va donde lo necesiten: abre estaciones y releva al anfitrión que sale a almorzar. Rueda rápido, pero seguro.', d: 'Llegaste a tiempo y el compañero almorzó tranquilo. Eso también es servicio.' },
    { t: 'De estación en estación', a: 'Hoy hay más tareas y quedan más lejos. Tú eliges el orden: usa las ciclorrutas, que son más rápidas.', d: 'Ya te conocen en media ciudad. La ingeniera Paola pregunta si sabes de cables.' },
    { t: 'El comodín', a: 'Hoy cubres la zona entera. El que sirve para todo, sirve para mucho.', d: 'Ni una tarea tarde. Paola te espera con la caja de herramientas.' }
  ],
  tecnico: [
    { t: 'Luz verde', a: 'Las estaciones automáticas no tienen anfitrión: tienen tótem y anclajes. Si una se apaga, la gente se queda sin bici. Llega y arréglala.', d: 'Volvió la luz verde. Cada estación que revive son cien viajes que sí se hacen.' },
    { t: 'Circuitos', a: 'Hoy toca abrir el tótem: cierra el circuito y la estación despierta. Con calma, que la electricidad no perdona el afán.', d: 'Operatividad bien arriba. Wilson, el del camión, dice que le haces falta en la ruta.' },
    { t: 'Tormenta eléctrica', a: 'Anoche tronó duro y medio valle amaneció apagado. Hoy no paramos.', d: 'Todo encendido de nuevo. Wilson te guarda el puesto… y las llaves del camión.' }
  ],
  balance: [
    { t: 'El camión', a: 'Este camión no cabe por las ciclorrutas, así que piensa como conductor. Lleva bicis a donde faltan y recoge donde sobran.', d: 'Suave en las curvas y puntual. Así se balancea un sistema.' },
    { t: 'Mañana de universidades', a: 'A las siete se vacían los barrios y se llenan las universidades. Las órdenes de Cata no dan espera.', d: 'Casi ninguna vencida. Cata quiere conocer a quien le cumple las órdenes.' },
    { t: 'Todo el valle en un camión', a: 'Hoy hay más órdenes que semáforos. Planea la ruta antes de arrancar.', d: 'Camión guardado y sin un rayón. Sube a la sala de control: Cata te espera.' }
  ],
  monitoreo: [
    { t: 'La sala de control', a: 'Desde aquí se ve todo. Rojo es estación vacía; azul, llena. Manda los camiones antes de que alguien se quede sin bici.', d: 'Buen ojo. El mapa te habla y tú ya lo entiendes.' },
    { t: 'El sur despierta', a: 'Hoy vigilas el sur: Envigado, Itagüí, Sabaneta. Más estaciones y los mismos camiones.', d: 'Servicio arriba del 80 %. Don Rubén anda preguntando por ti.' },
    { t: 'De Bello a Barbosa', a: 'El norte es largo y las estaciones quedan lejos: cada orden cuenta doble.', d: 'Lo lograste. Don Rubén se jubila pronto y busca quién coordine la Gran Rodada.' }
  ],
  supervisor: [
    { t: 'Abrir el sistema', a: 'El supervisor abre, reparte al personal y resuelve lo que salga. Empieza con calma y escucha a tu gente.', d: 'Sistema abierto y cerrado sin novedad. Mandas como quien ha pasado por todos los puestos.' },
    { t: 'Un día cualquiera', a: 'No hay días cualquiera: semáforos dañados, bodega llena, estaciones sin relevo. Respira y prioriza.', d: 'Todo resuelto. Falta una sola cosa: la Gran Rodada del Valle.' },
    { t: 'La Gran Rodada', a: 'Hoy miles de personas pedalean de Caldas a Barbosa, y Doña Luz va de primera. Que no falte una sola bici.', d: '¡Lo lograste! Empezaste prestando una bici y hoy cuidas las de todo el valle. Gracias por rodar con EnCicla.' }
  ]
};
const Historia = JE.historia = {
  total: 27,
  n(roleId, turno) { return ROLE[roleId].n * 3 - 3 + turno; },
  done(roleId, turno) { return ((Save.data.stars[roleId] || [])[turno - 1] | 0) > 0; },
  count() { let n = 0; for (const r of ROLES) for (let t = 1; t <= 3; t++) if (this.done(r.id, t)) n++; return n; },
  /* retrato pixel 12×12 del mentor */
  face(roleId) {
    const k = 'face' + roleId; let u = Art.cache.get(k); if (u) return u;
    const [, , skin, hair, cap, shirt] = CAST[roleId], c = document.createElement('canvas'); c.width = c.height = 12; const x = c.getContext('2d');
    const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
    R(0, 0, 12, 12, '#c4ec7c'); R(1, 9, 10, 3, shirt); R(5, 8, 2, 1, skin); R(2, 2, 8, 6, skin); R(2, 1, 8, 2, hair); R(1, 2, 1, 4, hair); R(10, 2, 1, 4, hair);
    if (cap) { R(2, 0, 8, 2, cap); R(1, 2, 10, 1, cap); }
    R(4, 4, 1, 1, '#141414'); R(7, 4, 1, 1, '#141414'); R(5, 6, 2, 1, '#8a3b2a');
    if (roleId === 'mecanico') R(4, 6, 4, 1, '#5a5a5a'); if (roleId === 'usuario') { R(3, 4, 3, 1, '#0a2342'); R(7, 4, 2, 1, '#0a2342'); } if (roleId === 'monitoreo') { R(1, 3, 1, 3, '#141414'); R(1, 6, 3, 1, '#141414'); } if (roleId === 'supervisor') R(5, 9, 2, 3, '#ff6b5a');
    u = c.toDataURL(); Art.cache.set(k, u); return u;
  },
  bubble(roleId, turno, after, extra) {
    const C = CAST[roleId], H = (HISTORIA[roleId] || [])[turno - 1]; if (!C || !H) return '';
    return `<div class="hist-b ${after ? 'after' : ''}"><img class="px" src="${this.face(roleId)}" alt=""><div><div class="pag">Capítulo ${this.n(roleId, turno)} de ${this.total} · ${esc(H.t)}</div><p>«${esc(extra || (after ? H.d : H.a))}»</p><small>${esc(C[0])}, ${esc(C[1])}</small></div></div>`;
  },
  /* se muestra en el briefing y en los resultados de los turnos del escalafón */
  brief(roleId, turno, o) { return o.free || o.reto || !HISTORIA[roleId] ? '' : this.bubble(roleId, turno, false); },
  result(res, meta) {
    if (meta.free || meta.reto || !HISTORIA[meta.roleId]) return '';
    return res.pass ? this.bubble(meta.roleId, meta.turno, true) : this.bubble(meta.roleId, meta.turno, true, 'No pasa nada: hasta el mejor se cae de la bici. Respira y vuelve a intentarlo.');
  }
};
UI.historia = function () {
  const got = Historia.count(); let h = `<h2>La historia</h2><p class="pag">${got} de ${Historia.total} capítulos · del primer pedalazo a la Gran Rodada</p><div class="hist-l">`, open = true;
  for (const r of ROLES) for (let t = 1; t <= 3; t++) {
    const H = HISTORIA[r.id][t - 1], ok = Historia.done(r.id, t), n = Historia.n(r.id, t);
    if (ok) h += `<details><summary><b>${n}.</b> ${esc(H.t)} <small>${esc(r.name)} · turno ${t}</small></summary>${Historia.bubble(r.id, t, false)}${Historia.bubble(r.id, t, true)}</details>`;
    else if (open && this.unlocked(r) && this.turnoOk(r, t)) { h += `<div class="next"><b>${n}.</b> ${esc(H.t)} <small>▶ ${esc(r.name)} · turno ${t}</small></div>`; open = false; }
    else h += `<div class="lock"><b>${n}.</b> 🔒 <small>${esc(r.name)} · turno ${t}</small></div>`;
  }
  this.modal(h + `</div><div class="col"><button class="btn pri" id="mClose">Cerrar</button></div>`);
};
LOGROS.push(
  { id: 'cronista', name: 'La Gran Rodada', desc: 'Completa los 27 capítulos de la historia', icon: 'supervisor', test: () => Historia.count() >= Historia.total },
  { id: 'estreno', name: 'De estreno', desc: 'Compra algo en la tienda con hojas verdes', icon: 'hoja', test: S => (S.owned || []).length > 0 },
  { id: 'equipo', name: 'Trabajo en equipo', desc: 'Aprueba un turno cooperativo con amigos', icon: 'monitoreo', test: S => S.history.some(h => h.m === 'equipo' && h.p) }
);
