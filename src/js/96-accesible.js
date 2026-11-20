/* =====================================================================
   ACCESIBLE Y FIEL (traído de la rama revolucion-v2, 2.0.1, al unir las ramas el 20-nov-2026)
   - Alto contraste: opción en Más, junto a «Letra grande»; se aplica al arrancar.
   - El viaducto del metro y el tranvía no pasan sobre casas: bajo su trazado, las casas o edificios pasan a andén
     (se mide con tools/auditoria-mapa.js; antes A 7,8 %, B 5,9 % y T 7 % del trazado iban sobre casas).
   Los trenes de noche ya quedan guardados con Ride.metroOn() (30-ride.js).
   ===================================================================== */
const _init96 = UI.init; UI.init = function () { _init96.apply(this, arguments); document.body.classList.toggle('contraste', !!(Save.data && Save.data.settings && Save.data.settings.contraste)); };
const _mas96 = UI.renderMas;
UI.renderMas = function () {
  _mas96.apply(this, arguments); const S = Save.data.settings, big = document.querySelector('#tab-mas [data-sw="big"]'); if (!big || document.querySelector('#tab-mas [data-sw="contraste"]')) return;
  const o = document.createElement('div'); o.className = 'opt'; o.innerHTML = `<span>Alto contraste<br><small class="m">Textos y bordes marcados, mapa más nítido</small></span><button class="sw ${S.contraste ? 'on' : ''}" data-sw="contraste" aria-label="Alto contraste"></button>`;
  big.closest('.opt').after(o); const b = o.querySelector('button');
  b.onclick = () => { S.contraste = !S.contraste; Save.save(); b.classList.toggle('on', S.contraste); document.body.classList.toggle('contraste', S.contraste); Snd.sfx('tap'); };
};
const _rail96 = CityMap.buildRail;
CityMap.buildRail = function () {
  _rail96.apply(this, arguments); const casa = v => v === TT.BRICK || v === TT.BLDG; let n = 0;
  for (const [P, r] of [[this.lineA, 7], [this.lineB, 7], [this.tram, 5]]) {
    if (!P) continue; const paso = 4 / M_PER_PX, R = r / M_PER_PX;
    for (let s = 0; s <= P.len; s += paso) {
      const q = this.at(P, s), tx0 = Math.floor((q.x - R) / TS), tx1 = Math.floor((q.x + R) / TS), ty0 = Math.floor((q.y - R) / TS), ty1 = Math.floor((q.y + R) / TS);
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (Math.hypot((tx + .5) * TS - q.x, (ty + .5) * TS - q.y) <= R + TS / 2 && casa(this.get(tx, ty))) { this.set(tx, ty, TT.WALK); n++; }
    }
  }
  this.corredorRiel = n;
};
