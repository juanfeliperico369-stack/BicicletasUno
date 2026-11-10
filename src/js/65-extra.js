/* =====================================================================
   LOGROS · INTRODUCCIÓN "¿QUÉ ES ENCICLA?" · TARJETA DE RESULTADO
   ===================================================================== */
const LOGROS = [
  { id: 'primer', name: 'Primer pedalazo', desc: 'Termina tu primer turno', icon: 'usuario', test: S => S.stats.plays >= 1 },
  { id: 'aprobado', name: '¡Aprobado!', desc: 'Aprueba un turno del escalafón', icon: 'estrella', test: S => S.history.some(h => h.p && !h.free && !isMulti(h.m)) },
  { id: 'perfecto', name: 'Turno perfecto', desc: 'Gana 3 estrellas en un turno', icon: 'estrella', test: S => S.history.some(h => h.st === 3 && !isMulti(h.m)) },
  { id: 'racha3', name: 'En racha', desc: 'Aprueba 3 turnos seguidos', icon: 'estrella', test: S => S.bestStreak >= 3 },
  { id: 'postal5', name: 'Turista paisa', desc: 'Colecciona 5 postales', icon: 'pin', test: S => S.postales.length >= 5 },
  { id: 'postal15', name: 'Conocedor del valle', desc: 'Colecciona 15 postales', icon: 'pin', test: S => S.postales.length >= 15 },
  { id: 'postalTodas', name: 'Álbum completo', desc: 'Colecciona todas las postales del valle', icon: 'pin', test: S => PUBLIC_LM().every(l => S.postales.includes(l.id)) },
  { id: 'explorador', name: 'Explorador secreto', desc: 'Encuentra la postal secreta', icon: 'pin', test: S => S.postales.includes('trescruces') },
  { id: 'ciclorruta', name: 'Ciclorrutero', desc: 'Logra la racha x4 en ciclorruta', icon: 'hoja', test: S => !!S.flags.cic4 },
  { id: 'hojas100', name: 'Pulmón verde', desc: 'Recoge 100 hojas verdes', icon: 'hoja', test: S => S.stats.leaves >= 100 },
  { id: 'km10', name: '10 km pedaleados', desc: 'Recorre 10 km en el juego', icon: 'usuario', test: S => S.stats.km >= 10 },
  { id: 'timbre', name: 'Buena convivencia', desc: 'Usa el timbre 50 veces', icon: 'timbre', test: S => S.stats.bells >= 50 },
  { id: 'oficios', name: 'Todero EnCicla', desc: 'Juega los 9 oficios', icon: 'supervisor', test: S => ROLES.every(r => S.history.some(h => h.m === r.id)) },
  { id: 'supervisor', name: 'Supervisor de corazón', desc: 'Aprueba un turno de Supervisor', icon: 'supervisor', test: S => S.history.some(h => h.m === 'supervisor' && h.p && !h.free) },
  { id: 'carrera', name: 'Más rápido que el bot', desc: 'Gana una carrera de postales', icon: 'balance', test: S => S.history.some(h => h.m === 'carrera' && h.p) },
  { id: 'amigo', name: 'Pedalear en compañía', desc: 'Juega una carrera con un amigo', icon: 'apoyo', test: S => S.history.some(h => h.m === 'carrera' && h.net) },
  { id: 'reto', name: 'Retador', desc: 'Juega el reto del día', icon: 'estrella', test: S => S.history.some(h => h.reto) },
  { id: 'maquinista', name: 'Maquinista secreto', desc: 'Descubre el secreto del Metro', icon: 'monitoreo', secret: true, test: S => !!S.flags.metroEgg },
  { id: 'laberinto', name: 'Jardinero de Moravia', desc: 'Resuelve el laberinto secreto', icon: 'hoja', secret: true, test: S => !!S.flags.mazeEgg },
  { id: 'dorada', name: 'Bici dorada', desc: 'Encuentra el secreto de la portada', icon: 'estrella', secret: true, test: S => !!S.flags.goldSeen },
  { id: 'caldascopa', name: 'De Caldas a Copacabana', desc: 'Visita el Alto de San Miguel y Copacabana', icon: 'pin', test: S => S.postales.includes('nacimiento') && S.postales.includes('copacabana') }
];
const Logros = JE.logros = {
  check() { const S = Save.data, n = LOGROS.filter(l => !S.logros.includes(l.id) && l.test(S)); n.forEach(l => S.logros.push(l.id)); return n; },
  html() {
    const S = Save.data; return `<div class="pag" style="margin-top:16px">Logros · ${S.logros.length} de ${LOGROS.length}</div><div class="logros">${LOGROS.map(l => { const ok = S.logros.includes(l.id), hid = l.secret && !ok; return `<div class="logro ${ok ? 'ok' : ''}"><img class="px" src="${Art.iconURL(hid ? 'pin' : l.icon, 2)}" alt=""><b>${hid ? '??? · Secreto' : esc(l.name)}</b><small>${hid ? 'Busca las pistas en «¿Sabías que?»' : esc(l.desc)}</small></div>`; }).join('')}</div>`;
  }
};

/* introducción en páginas de revista */
const INTRO = [
  { t: '¿Qué es EnCicla?', icon: 'estacion', p: 'Es el sistema de <b>bicicletas públicas gratuito</b> del Área Metropolitana del Valle de Aburrá. Nació en 2011 y hoy tiene más de 130 estaciones en varios municipios.' },
  { t: '¿Cómo se presta?', icon: 'anfitrion', p: 'Te registras, llegas a una estación (manual con <b>anfitrión</b> o automática con <b>tótem</b>), prestas la bici y la devuelves en cualquier estación antes de <b>1 hora</b>.' },
  { t: 'Detrás de cada préstamo', icon: 'supervisor', p: 'Anfitriones, apoyos, mecánicos, bodegueros, técnicos, conductores de balanceo, monitoreo y supervisores trabajan cada día. <b>Aquí vas a vivir cada oficio.</b>' },
  { t: 'Cuida la bici pública', icon: 'timbre', p: 'Usa casco, respeta los semáforos y a los peatones, y prefiere la ciclorruta. ¡La bici pública es de todos!' }
];
UI.intro = function (done) {
  let i = 0; const show = () => {
    const pg = INTRO[i];
    this.modal(`<div class="pag">PAG ${i + 1} DE ${INTRO.length} · BIENVENIDA</div><div class="introimg"><img class="px" src="${Art.iconURL(pg.icon, 6)}" alt=""></div><h2>${esc(pg.t)}</h2><p class="m" style="font-size:16px">${pg.p}</p>
      <div class="dots">${INTRO.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="col"><button class="btn pri" id="inNext">${i < INTRO.length - 1 ? 'Siguiente ▶' : '¡A rodar!'}</button>${i < INTRO.length - 1 ? '<button class="btn gh" id="inSkip">Saltar</button>' : ''}</div>`, () => {
      $('#inNext').onclick = () => { Snd.sfx('tap'); if (++i < INTRO.length) show(); else fin(); };
      const sk = $('#inSkip'); if (sk) sk.onclick = fin;
    });
  };
  const fin = () => { Save.data.settings.seen.intro = 1; Save.save(); this.closeModal(); if (done) done(); };
  show();
};
UI.apoya = function () {
  this.modal(`<h2>Apoya la bici pública</h2><p class="m">EnCicla es gratis gracias a todos los que la usan bien y a quienes la mantienen funcionando cada día. Úsala, cuídala y compártela.</p>
  <div class="paper" style="margin:10px 0"><div class="t">Donaciones</div><p style="margin:6px 0 0">Próximamente, desde la página oficial del juego, podrás apoyar a EnCicla.</p></div>
  <div class="col"><button class="btn pri" id="apWeb">Sitio oficial de EnCicla ↗</button><button class="btn" id="apShare">Compartir el juego</button><button class="btn gh" id="mClose">Cerrar</button></div><p class="m" style="font-size:12px">El sitio oficial necesita internet. Este juego es una demo no oficial.</p>`, () => {
    $('#apWeb').onclick = () => { const u = 'https://encicla.metropol.gov.co/'; if (window.Capacitor) location.href = u; else window.open(u, '_blank', 'noopener'); };
    $('#apShare').onclick = () => this.share('🚲 Juega EnCicla: el videojuego arcade de la bici pública del Valle de Aburrá.');
  });
};

/* tarjeta de resultado (imagen para WhatsApp / estados) */
Art.resultCard = function (res, meta) {
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), r = ROLE[meta.roleId];
  x.fillStyle = PAL.az; x.fillRect(0, 0, W, H); x.fillStyle = '#ffffff10'; for (let i = 0; i < W; i += 10) for (let j = 0; j < H; j += 10) x.fillRect(i, j, 2, 2);
  x.fillStyle = PAL.vd; x.fillRect(0, 0, W, 90); x.fillStyle = PAL.az; x.font = '800 30px Cuerpo, sans-serif'; x.textBaseline = 'middle'; x.fillText('JUEGA ENCICLA · EDICIÓN DEL TURNO', 48, 47);
  x.textBaseline = 'alphabetic'; x.lineWidth = 6; x.strokeStyle = PAL.vd; x.font = '700 330px Titulos, Impact, sans-serif'; x.strokeText(String(r.n), 40, 430);
  x.fillStyle = '#fff'; x.font = '700 150px Titulos, Impact, sans-serif'; x.fillText(r.name.toUpperCase(), 250, 300);
  x.fillStyle = PAL.amb; x.font = 'italic 40px Georgia, serif'; x.fillText(meta.roleId === 'carrera' ? 'Carrera de postales' : meta.reto ? 'Reto del día' : 'Turno ' + meta.turno + ' · ' + meta.nov.name, 256, 370);
  x.font = '130px sans-serif'; for (let i = 0; i < 3; i++) { x.fillStyle = i < res.stars ? PAL.amb : '#ffffff30'; x.fillText('★', 60 + i * 150, 590); }
  x.fillStyle = PAL.vd1; x.font = '700 200px Titulos, Impact, sans-serif'; x.fillText(fmtInt(res.score), 560, 600); x.fillStyle = '#fff'; x.font = '800 30px Cuerpo, sans-serif'; x.fillText('PUNTOS', 566, 650);
  let y = 760; x.font = '600 40px Cuerpo, sans-serif';
  for (const g of res.goals) { x.fillStyle = g.ok ? PAL.vd : PAL.cor; x.fillRect(60, y - 42, 60, 60); x.fillStyle = PAL.az; x.font = '700 46px Titulos, sans-serif'; x.fillText(g.ok ? '✓' : '✗', 74, y + 4); x.fillStyle = '#fff'; x.font = '600 38px Cuerpo, sans-serif'; x.fillText(g.txt.length > 40 ? g.txt.slice(0, 39) + '…' : g.txt, 140, y); y += 90; }
  const art = this.mk(200, 125, p => this.cover(p, 200, 125, 3.1)); x.imageSmoothingEnabled = false; x.drawImage(art, 60, 1010, 400, 250); x.strokeStyle = '#fff'; x.lineWidth = 6; x.strokeRect(60, 1010, 400, 250);
  x.fillStyle = PAL.crema; x.fillRect(500, 1010, 520, 250); x.fillStyle = PAL.az; x.font = '700 64px Titulos, sans-serif'; x.fillText('¿ME SUPERAS?', 530, 1090);
  x.font = '600 30px Cuerpo, sans-serif'; x.fillText(Save.data.profile.name, 530, 1150); x.fillText(new Date().toLocaleDateString('es-CO'), 530, 1196); x.font = '700 26px Cuerpo, sans-serif'; x.fillText('juanfeliperico369-stack.github.io/BicicletasUno', 530, 1240);
  x.fillStyle = PAL.vd; x.fillRect(0, H - 40, W, 40);
  return c;
};
UI.shareCard = function (res, meta) {
  const c = Art.resultCard(res, meta), name = 'juega-encicla-' + meta.roleId + '.png';
  c.toBlob(blob => {
    if (!blob) return this.toast('No se pudo crear la imagen');
    try { const f = new File([blob], name, { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], text: '🚲 Juega EnCicla · ' + fmtInt(res.score) + ' puntos. ¿Me superas? ' + JE.URL }).catch(() => { }); return; } } catch (e) { }
    if (window.Capacitor) return this.share('🚲 Juega EnCicla · hice ' + fmtInt(res.score) + ' puntos como ' + ROLE[meta.roleId].name + '. ¿Me superas?');
    this.download(blob, name);
  }, 'image/png');
};
