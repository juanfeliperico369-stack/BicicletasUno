/* =====================================================================
   🧪 MODO PRUEBA (ronda 3.3, Claude) · para probar el juego con personas reales (niños, abuelos, amigos) sin internet y sin
   datos personales. Nielsen («Why You Only Need to Test with 5 Users», 2000): con 5 personas parecidas se ven la mayoría de
   los problemas, pero grupos distintos (niños y adultos) se prueban APARTE, y rinden más tres rondas de 5 que una de 15.
   Prendido en Más → «🧪 Modo prueba», cada partida guarda, solo en este celular:
     el modo y el turno, la hora (redondeada), cuánto duró, cómo acabó (terminó, no pasó o se salió), los puntos, las
     estrellas, los errores del juego, cuántos cuadros fueron lentos (más de 50 ms) y, si la persona quiere, una carita
     (👍 😐 👎) en la pantalla de resultados. Nada de nombres.
   «📤 Ver y copiar» muestra un resumen (cuántas partidas, cuántas terminadas, dónde se salen) y el JSON para pegarlo donde
   quieras; «🗑️ Borrar» lo limpia. Se guarda en 'prueba' (registrada en 98v-claves.js), con las últimas 200 partidas.
   ===================================================================== */
Save.registrar('prueba', 'objeto', 'modo prueba: partidas sin datos personales (99m-modo-prueba.js)');
const Prueba = JE.prueba = {
  on() { return !!(Save.data && Save.data.settings && Save.data.settings.prueba); },
  d() { const S = Save.data; if (!S.prueba || typeof S.prueba !== 'object' || Array.isArray(S.prueba)) S.prueba = { v: 1, partidas: [] }; if (!Array.isArray(S.prueba.partidas)) S.prueba.partidas = []; return S.prueba; },
  act: null, cuadros: 0, lentos: 0,
  empezar(id, turno, meta) {
    if (!this.on() || JE.headless) return; this.cerrar('salió');
    const d = new Date(), z = n => String(n).padStart(2, '0'), ini = d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes());   /* hora local, al minuto */
    this.act = { m: id, t: turno | 0, libre: !!(meta && meta.free), ini, t0: performance.now(), e0: (JE.errors || []).length }; this.cuadros = 0; this.lentos = 0; this._t = 0;
  },
  cerrar(fin, res) {
    const a = this.act; if (!a) return null; this.act = null;
    const p = { m: a.m, t: a.t, libre: a.libre, ini: a.ini, dur: Math.round((performance.now() - a.t0) / 1000), fin, pts: res ? Math.round(res.score || 0) : null, est: res ? res.stars | 0 : null, err: (JE.errors || []).length - a.e0, cuadros: this.cuadros, lentos: this.lentos, pant: Math.round(innerWidth) + '×' + Math.round(innerHeight), cara: null };
    const L = this.d().partidas; L.push(p); if (L.length > 200) L.splice(0, L.length - 200); Save.save(); return p;
  },
  resumen() {
    const L = this.d().partidas, n = L.length; if (!n) return 'Todavía no hay partidas guardadas.';
    const term = L.filter(p => p.fin === 'terminó').length, sal = {}, dur = L.reduce((a, p) => a + p.dur, 0) / n, caras = L.filter(p => p.cara);
    for (const p of L) if (p.fin === 'salió') sal[p.m] = (sal[p.m] || 0) + 1; const top = Object.entries(sal).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m, k]) => ((ROLE[m] || {}).name || m) + ' (' + k + ')');
    const lentos = L.reduce((a, p) => a + (p.lentos || 0), 0), cuad = L.reduce((a, p) => a + (p.cuadros || 0), 0);
    return n + (n === 1 ? ' partida · ' : ' partidas · ') + term + (term === 1 ? ' terminada (' : ' terminadas (') + Math.round(100 * term / n) + ' %) · duración media ' + Math.round(dur) + ' s' + (top.length ? ' · donde más se salen: ' + top.join(', ') : '') + (cuad ? ' · cuadros lentos: ' + (100 * lentos / cuad).toFixed(1).replace('.', ',') + ' %' : '') + (caras.length ? ' · caritas: ' + ['👍', '😐', '👎'].map(c => c + ' ' + caras.filter(p => p.cara === c).length).join(' ') : '');
  }
};
(function () {
  const _start = Game.start;
  Game.start = function (id, turno, o) { const r = _start.apply(this, arguments); try { Prueba.empezar(id, turno, o); } catch (e) { } return r; };
  const _stop = Game.stop;
  Game.stop = function () { try { if (Prueba.act) Prueba.cerrar('salió'); } catch (e) { } return _stop.apply(this, arguments); };
  const _loop = Game.loop;
  Game.loop = function (t) { if (Prueba.act && this.mode) { const d = t - (Prueba._t || t); Prueba._t = t; if (d > 0 && d < 1000) { Prueba.cuadros++; if (d > 50) Prueba.lentos++; } } return _loop.call(this, t); };
  /* al terminar: se cierra la partida y, si está prendido, la carita en los resultados */
  const _res = UI.result;
  UI.result = function (res, meta, prog) {
    let p = null; try { if (Prueba.act) p = Prueba.cerrar(res && res.pass ? 'terminó' : 'no pasó', res); } catch (e) { }
    const r = _res.apply(this, arguments);
    if (p && Prueba.on()) {
      const body = $('#resBody'); if (body) { const d = document.createElement('div'); d.className = 'opt'; d.id = 'pruebaCara';
        d.innerHTML = `<span>🧪 ¿Qué tal te pareció?<br><small class="m">Modo prueba: queda solo en este celular, sin tu nombre</small></span><div class="seg">${['👍', '😐', '👎'].map(c => `<button data-cara="${c}" aria-label="${c}">${c}</button>`).join('')}</div>`;
        body.prepend(d); d.querySelectorAll('[data-cara]').forEach(b => b.onclick = () => { p.cara = b.dataset.cara; Save.save(); Snd.sfx('tap'); d.querySelectorAll('[data-cara]').forEach(x => x.classList.toggle('on', x === b)); }); }
    }
    return r;
  };
  /* en Más: el interruptor, el resumen con el JSON para copiar y borrar */
  UI.pruebas = function () {
    const D = Prueba.d(), json = JSON.stringify({ juego: 'Juega EnCicla', version: JE.version, exportado: new Date().toISOString().slice(0, 16), partidas: D.partidas }, null, 1);
    this.modal(`<h2>🧪 Modo prueba</h2><p class="m">${esc(Prueba.resumen())}</p>
      <p class="pag">Para copiar y pegar (sin nombres)</p><textarea id="pruebaJSON" readonly style="width:100%;height:180px;font:12px var(--fm);border-radius:8px;padding:6px;box-sizing:border-box">${esc(json)}</textarea>
      <div class="col" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"><button class="btn pri" id="pruebaCopiar">📋 Copiar</button><button class="btn gh" id="pruebaBorrar">🗑️ Borrar las partidas</button><button class="btn" id="mClose">Listo</button></div>`, () => {
      $('#pruebaCopiar').onclick = async () => { const t = $('#pruebaJSON'); try { await navigator.clipboard.writeText(json); this.toast('📋 Copiado'); } catch (e) { t.select(); try { document.execCommand('copy'); this.toast('📋 Copiado'); } catch (e2) { this.toast('Selecciona el texto y cópialo'); } } };
      $('#pruebaBorrar').onclick = () => this.confirm('Borrar las ' + D.partidas.length + ' partidas guardadas del modo prueba', () => { D.partidas = []; Save.save(); this.toast('🗑️ Borradas'); });
    });
  };
  const _mas = UI.renderMas;
  UI.renderMas = function () {
    _mas.apply(this, arguments); const ancla = $('#tab-mas [data-tamopt]'); if (!ancla || $('#tab-mas [data-prueba]')) return; const S = Save.data.settings, d = document.createElement('div'); d.className = 'opt';
    d.innerHTML = `<span>🧪 Modo prueba<br><small class="m">Para probar con personas: guarda cómo va cada partida, sin internet y sin nombres</small></span><span style="display:flex;gap:8px;align-items:center"><button class="btn sm" data-prueba-ver="1">Ver</button><button class="sw ${S.prueba ? 'on' : ''}" data-prueba="1" aria-label="Modo prueba"></button></span>`;
    (ancla.closest('.opt') || ancla).after(d);
    d.querySelector('[data-prueba]').onclick = e => { S.prueba = !S.prueba; Save.save(); Snd.sfx('tap'); e.currentTarget.classList.toggle('on', !!S.prueba); this.toast(S.prueba ? '🧪 Modo prueba prendido: cada partida queda anotada en este celular' : '🧪 Modo prueba apagado'); };
    d.querySelector('[data-prueba-ver]').onclick = () => { Snd.sfx('tap'); this.pruebas(); };
  };
})();
