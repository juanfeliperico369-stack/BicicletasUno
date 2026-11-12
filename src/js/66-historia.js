/* =====================================================================
   HISTORIA: un capítulo por turno real (19). Cada turno aprobado
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
    { t: 'Semáforo en rojo', a: 'Hoy son dos viajes. Ojo con los semáforos: en bici también se frena en rojo, y en las bajadas suelta un poquito, que del afán no queda sino el cansancio.', d: 'Así da gusto: pedaleas como todo un ciudadano. Dicen que EnCicla anda buscando anfitriones…' },
    { t: 'Tres viajes y una decisión', a: 'Tres viajes seguidos, como cualquier día de trabajo. Si los logras, pasa por la estación: Santi, el anfitrión, quiere conocerte.', d: '¡Te lo dije! Santi dice que tienes madera. Ponte el chaleco: mañana madrugas a las 5.' }
  ],
  anfitrion: [
    { t: 'Las 5 de la mañana', a: 'A las 5 en punto el supervisor te entrega la tula: llaves y celular. Tienes media hora para abrir las automáticas del sector y la tuya, con su inventario. A las 5:30 arranca el sistema.', d: '¡Abriste a tiempo! Y en la ventanilla: sacar la bici, entregarla y ajustar el sillín a la medida. Así se atiende.' },
    { t: 'La estación es tuya', a: 'Hoy te toca el cierre. A las 9 p. m. el sistema cierra, pero sigues recibiendo bicis hasta las 10. Después el inventario y a cerrar las automáticas antes de las 10:30.', d: 'Estación impecable. Don Jairo, el mecánico, preguntó quién dejaba las bicis tan ordenadas.' }
  ],
  mecanico: [
    { t: 'El oído del mecánico', a: 'Toda bici avisa lo que le duele. Las que llegan malas del camión de balance se diagnostican primero: el que adivina, daña.', d: 'Eso. Bici que sale de aquí, sale como nueva. Mañana te paso al equipo de ensamble.' },
    { t: 'Bicis nuevas', a: 'Llegaron las piezas de bodega. Marco, ruedas, manubrio, cadena, sillín, frenos y luces: en ese orden y con las tuercas en su punto.', d: '¡Qué berraquera! Bicis nuevas para el valle. Yuli, la de bodega, necesita a alguien juicioso.' }
  ],
  bodega: [
    { t: 'Cada cosa en su sitio', a: 'La bodega es el corazón: aquí llega todo. Descarga, verifica que nada venga golpeado ni con cantidades raras, organiza y carga el pedido del taller. Después lo llevas tú mismo.', d: 'Pedido exacto y a tiempo. Kevin, el de apoyo, anda pidiendo ayuda con los relevos.' }
  ],
  apoyo: [
    { t: 'La zona entera', a: 'El de apoyo abre todas las automáticas de su zona: Envigado tiene trece, Aeropuerto dos. Después, entre las 8 y las 12, los relevos. Y nunca pares de hacer inventarios de control.', d: 'Llegaste a tiempo a cada relevo. Eso también es servicio.' },
    { t: 'De relevo en relevo', a: 'Turno 3: relevos de 4 a 8:30 de la noche, inventarios en cada rato libre y, a las 10, el cierre de toda la zona.', d: 'Ni un relevo tarde. La ingeniera Paola pregunta si sabes de cables.' }
  ],
  tecnico: [
    { t: 'Luz verde', a: 'Tótems, luces LED de los anclajes, celulares de las estaciones… y los power banks. Los celulares que están medio malos se descargan rápido: arma tu plan para que ninguno se apague.', d: 'Todo encendido y ningún celular apagado. Wilson, el del carro de balance, te guarda puesto.' }
  ],
  balance: [
    { t: 'Las tulas de las 4 a. m.', a: 'El camión duerme en la Terminal del Norte. A las 4 sales: unos llevan al supervisor jefe a Suramericana, otros las tulas de la universidad, de Envigado e Itagüí (en el Puente Pandequeso) o de Sabaneta y La Estrella.', d: 'Ruta cumplida. Y de paso, las bicis malas al taller.' },
    { t: 'El camión de 40', a: 'Hoy manejas el camión especial: 40 bicis entre el Campus de la Nacional, Suramericana y el Estadio, y tanteas las estaciones del sur.', d: 'Corredor balanceado. Cata, la de la sala de control, quiere conocerte.' },
    { t: 'Turno de noche', a: 'Balanceo hasta las 10, también en los corredores eléctricos. Luego recoges las tulas, las entregas en Casa EnCicla y guardas el camión en la Terminal del Norte.', d: 'Camión guardado y sin un rayón. Sube a la sala de control: Cata te espera.' }
  ],
  monitoreo: [
    { t: 'La sala de control', a: 'Desde aquí se ve todo. Rojo es estación vacía; azul, llena. Manda las misiones a los carros y, cada hora, revisa que los inventarios cuadren.', d: 'Buen ojo. El mapa te habla y tú ya lo entiendes.' },
    { t: 'Atención al cliente', a: 'Suena el teléfono: sanciones, bicis que no se sueltan, gente que se quiere inscribir. Lee el sistema antes de contestar.', d: 'Nadie colgó bravo. Don Rubén anda preguntando por ti.' }
  ],
  supervisor: [
    { t: 'Las tulas', a: 'A las 4 llegas a Casa EnCicla, por el Parque de Malibú. Arma cada tula con su llave y un celular cargado, súbete al carro de balance y, a las 5, entrega cada una a su anfitrión.', d: 'Sistema abierto sin novedad. Mandas como quien ha pasado por todos los puestos.' },
    { t: 'Un día cualquiera', a: 'No hay días cualquiera: relevos, bicis con falla, semáforos dañados y usuarios inconformes. Cuida las estaciones y cuida a tu gente.', d: 'Todo resuelto. Falta una sola cosa: el cierre.' },
    { t: 'La Gran Rodada', a: 'Hoy el cierre es especial: miles pedalean de Caldas a Barbosa. A las 10:30 recoges todas las tulas y pones a cargar los celulares en Casa EnCicla.', d: '¡Lo lograste! Empezaste prestando una bici y hoy cuidas las de todo el valle. Gracias por rodar con EnCicla.' }
  ]
};
const Historia = JE.historia = {
  get total() { return ROLES.reduce((a, r) => a + nShifts(r.id), 0); },
  n(roleId, turno) { let k = 0; for (const r of ROLES) { if (r.id === roleId) return k + turno; k += nShifts(r.id); } return turno; },
  done(roleId, turno) { return ((Save.data.stars[roleId] || [])[turno - 1] | 0) > 0; },
  count() { let n = 0; for (const r of ROLES) for (let t = 1; t <= nShifts(r.id); t++) if (this.done(r.id, t)) n++; return n; },
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
  for (const r of ROLES) for (let t = 1; t <= nShifts(r.id); t++) {
    const H = HISTORIA[r.id][t - 1], ok = Historia.done(r.id, t), n = Historia.n(r.id, t);
    if (ok) h += `<details><summary><b>${n}.</b> ${esc(H.t)} <small>${esc(r.name)} · ${esc(shiftName(r.id, t))}</small></summary>${Historia.bubble(r.id, t, false)}${Historia.bubble(r.id, t, true)}</details>`;
    else if (open && this.unlocked(r) && this.turnoOk(r, t)) { h += `<div class="next"><b>${n}.</b> ${esc(H.t)} <small>▶ ${esc(r.name)} · ${esc(shiftName(r.id, t))}</small></div>`; open = false; }
    else h += `<div class="lock"><b>${n}.</b> 🔒 <small>${esc(r.name)} · ${esc(shiftName(r.id, t))}</small></div>`;
  }
  this.modal(h + `</div><div class="col"><button class="btn pri" id="mClose">Cerrar</button></div>`);
};
LOGROS.push(
  { id: 'cronista', name: 'La Gran Rodada', desc: 'Completa todos los capítulos de la historia', icon: 'supervisor', test: () => Historia.count() >= Historia.total },
  { id: 'estreno', name: 'De estreno', desc: 'Compra algo en la tienda con hojas verdes', icon: 'hoja', test: S => (S.owned || []).length > 0 },
  { id: 'equipo', name: 'Trabajo en equipo', desc: 'Aprueba un turno cooperativo con amigos', icon: 'monitoreo', test: S => S.history.some(h => h.m === 'equipo' && h.p) }
);
