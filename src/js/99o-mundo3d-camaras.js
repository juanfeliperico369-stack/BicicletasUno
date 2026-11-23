/* =====================================================================
   UN SOLO MUNDO 3D + CÁMARAS COHERENTES + ARTE 3D/2D/PIXEL (v2.2 · Ronda 3.0 · Gemini/Antigravity)
   Unifica TODAS las vistas sobre el MISMO mapa real del Valle de Aburrá (JE.map, M.lotes, M.chains,
   M.stations, R.cars, R.trains, R.markers, R.leaves, M.elev):
   1) 3D Cenital       · vista superior con edificios 3D, fachadas y luz del valle
   2) 3D Oblicua       · seguimiento inclinado con rumbo
   3) 3D Tercera Pers. · proyección perspectiva REAL del mismo mundo 3D detrás del vehículo
   4) 3D Primera Pers. · perspectiva REAL desde el manubrio EnCicla / cabina del camión
   5) Panorámica 2D    · vista lateral enriquecida con el relieve, edificios, estaciones y los 7 vehículos
   6) Maqueta 2:1      · proyección dimétrica viva siguiendo al jugador sobre el valle real
   + Capa de estilo combinable «Pixel World» (compatible con TODAS las cámaras 3D y 2D).
   ===================================================================== */
(function () {
  const VISTAS = [
    { id: 'cenital', n: '3D Cenital', ic: '🛰️', desc: 'Vista superior clásica con volumen 3D' },
    { id: 'oblicua', n: '3D Oblicua', ic: '📐', desc: 'Cámara inclinada que gira con tu rumbo' },
    { id: '3p', n: '3D Tercera Persona', ic: '🚲', desc: 'Mismo mundo 3D en perspectiva detrás de ti' },
    { id: '1p', n: '3D Primera Persona', ic: '👁️', desc: 'Mismo mundo 3D desde el manubrio o cabina' },
    { id: 'pano', n: 'Panorámica 2D', ic: '🌄', desc: 'Plataformas laterales sobre el relieve real' },
    { id: 'maqueta', n: 'Maqueta 2:1', ic: '⬢', desc: 'Relieve isométrico vivo del Valle de Aburrá' }
  ];

  const Vistas = JE.vistas = {
    lista: VISTAS,
    actual() {
      const S = Save.data && Save.data.settings;
      if (!S) return 'cenital';
      if (S.vista === 'pano') return 'pano';
      const v = S.vista3d || 'cenital';
      if (v === 'cenital' && S.cam && S.cam.sigue && (S.cam.t || 0) > .45) return 'oblicua';
      return v;
    },
    esPersp() { const v = this.actual(); return v === '3p' || v === '1p'; },
    esMaqueta() { return this.actual() === 'maqueta'; },
    esPixel() { return !!(Save.data && Save.data.settings && Save.data.settings.gfx === 'pixel'); },
    poner(id, quiet) {
      const S = Save.data && Save.data.settings; if (!S) return;
      const item = VISTAS.find(v => v.id === id) || VISTAS[0];
      S.vista = item.id === 'pano' ? 'pano' : 'cenital';
      S.vista3d = item.id;
      const C = Cam.cfg();
      if (item.id === 'cenital') { C.t = 0; C.sigue = 0; C.r = 0; }
      else if (item.id === 'oblicua') { C.t = .62; C.sigue = 1; }
      else if (item.id === '3p' || item.id === '1p' || item.id === 'maqueta') { C.t = 0; C.sigue = 0; C.r = 0; }
      Save.save();
      View.rotOn = false; View.rot = 0; View.apply();
      this.cerrarPop();
      if (!quiet && JE.ui) JE.ui.toast(item.ic + ' Vista: ' + item.n);
      if (Game.mode) { Cam.barra(Game.mode); Game.layout(true); }
    },
    togglePixel(quiet) {
      const S = Save.data && Save.data.settings; if (!S) return;
      S.gfx = S.gfx === 'pixel' ? '3d' : 'pixel';
      Save.save();
      if (typeof Art !== 'undefined' && Art.cache) Art.cache.clear();
      if (typeof CityMap !== 'undefined' && CityMap.chunks2) CityMap.chunks2.clear();
      View.apply();
      if (!quiet && JE.ui) JE.ui.toast(S.gfx === 'pixel' ? '👾 Estilo Pixel World activado (combinable con cualquier cámara)' : '✨ Estilo 3D Detallado activado');
      this.pintarPop();
    },
    siguiente() {
      const cur = this.actual(), idx = VISTAS.findIndex(v => v.id === cur);
      const next = VISTAS[(idx + 1) % VISTAS.length];
      this.poner(next.id);
      return next;
    },
    cerrarPop() {
      const p = $('#camPop'); if (p) p.hidden = true;
    },
    pintarPop() {
      const p = $('#camPop'); if (!p) return;
      const cur = this.actual(), px = this.esPixel();
      p.innerHTML = `<div class="cp-h">Cámaras (un solo mundo 3D)</div>` +
        VISTAS.map(v => `<button data-v3="${v.id}" class="${cur === v.id ? 'on' : ''}"><span>${v.ic} ${v.n}</span><small>${cur === v.id ? '●' : ''}</small></button>`).join('') +
        `<div class="cp-sep"></div><div class="cp-h">Estilo visual</div>` +
        `<button data-vpx="1" class="${px ? 'on' : ''}"><span>👾 Pixel World</span><small>${px ? 'ON' : 'OFF'}</small></button>`;
      p.querySelectorAll('[data-v3]').forEach(b => b.onclick = e => { e.stopPropagation(); Snd.sfx('tap'); this.poner(b.dataset.v3); });
      const bp = p.querySelector('[data-vpx]');
      if (bp) bp.onclick = e => { e.stopPropagation(); Snd.sfx('tap'); this.togglePixel(); };
    },
    togglePop() {
      let p = $('#camPop');
      if (!p) {
        p = document.createElement('div');
        p.id = 'camPop';
        p.hidden = true;
        p.addEventListener('pointerdown', e => e.stopPropagation());
        $('#sGame').appendChild(p);
      }
      if (!p.hidden) { p.hidden = true; return; }
      this.pintarPop();
      p.hidden = false;
    }
  };

  /* Cerrar popup de cámara al tocar fuera */
  window.addEventListener('pointerdown', e => {
    const p = $('#camPop');
    if (p && !p.hidden && !e.target.closest('#camPop,#camBar')) p.hidden = true;
  }, true);

  /* Atajos de teclado: 1-6 eligen vista, P alterna Pixel World, V cambia entre 3P/1P/Cenital */
  window.addEventListener('keydown', e => {
    const M = Game.mode;
    if (!M || !M.ride || M.sub || Game.paused || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
    if (e.code === 'Digit1') Vistas.poner('cenital');
    else if (e.code === 'Digit2') Vistas.poner('oblicua');
    else if (e.code === 'Digit3') Vistas.poner('3p');
    else if (e.code === 'Digit4') Vistas.poner('1p');
    else if (e.code === 'Digit5') Vistas.poner('pano');
    else if (e.code === 'Digit6') Vistas.poner('maqueta');
    else if ((e.code === 'Digit7' || e.code === 'KeyK') && !e.repeat) Vistas.togglePixel();
    else if (e.code === 'KeyV' && !e.repeat) {
      const c = Vistas.actual();
      Vistas.poner(c === '3p' ? '1p' : c === '1p' ? 'cenital' : '3p');
    }
  });

  /* ---------- Conectar el botón 🎥 de #camBar al selector unificado ----------
     Además garantizamos que #camBar siga visible en Panorámica, 3P, 1P, Maqueta y Pixel
     para que el jugador SIEMPRE pueda volver a cambiar de vista con 1 toque. */
  const _barra99o = Cam.barra;
  Cam.barra = function (M) {
    const R = M && M.ride && !M.sub && M.view && M.view.kind === 'map' ? M.ride : null;
    _barra99o.call(this, M);
    const bar = $('#camBar');
    if (!R || R.big || M.carry) { Vistas.cerrarPop(); return; }
    if (!bar) return;
    /* Si estamos en Panorámica, Maqueta o Pixel, mantener #camBar visible con el botón 🎥 */
    if (bar.hidden) bar.hidden = false;
    const angBtn = bar.querySelector('[data-cam="ang"]');
    if (angBtn) {
      angBtn.hidden = false;
      const cur = VISTAS.find(v => v.id === Vistas.actual()) || VISTAS[0];
      angBtn.setAttribute('aria-label', 'Cámara: ' + cur.n);
      angBtn.title = 'Cambiar cámara / vista (' + cur.n + ')';
      if (!angBtn.dataset.v99o) {
        angBtn.dataset.v99o = '1';
        angBtn.onclick = e => { e.stopPropagation(); Snd.sfx('tap'); Vistas.togglePop(); };
      }
    }
    const libBtn = bar.querySelector('[data-cam="libre"]');
    if (libBtn && (Vistas.esPersp() || Vistas.esMaqueta() || panoOn(R))) libBtn.hidden = true;
    Cam.lugar();
  };

  /* Añadir acceso al selector de vistas también en Pausa y en Más */
  const _pause99o = Game.pause;
  Game.pause = function () {
    Vistas.cerrarPop();
    _pause99o.call(this);
    const go = $('#pGo'), M = this.mode;
    if (!go || !M || !M.ride || $('#pVista')) return;
    const b = document.createElement('button');
    b.className = 'btn'; b.id = 'pVista';
    const lbl = () => {
      const cur = VISTAS.find(v => v.id === Vistas.actual()) || VISTAS[0];
      b.textContent = cur.ic + ' Vista: ' + cur.n + (Vistas.esPixel() ? ' · Pixel' : '');
    };
    lbl();
    const ref = $('#pVel') || go;
    ref.after(b);
    b.onclick = () => { Snd.sfx('tap'); Vistas.siguiente(); lbl(); };
  };

  const _mas99o = UI.renderMas;
  UI.renderMas = function () {
    _mas99o.call(this);
    const camRow = $('#tab-mas [data-camang]');
    if (!camRow || $('#tab-mas [data-v3m]')) return;
    const row = camRow.closest('.opt'), cur = Vistas.actual(), px = Vistas.esPixel();
    const d = document.createElement('div');
    d.className = 'opt';
    d.innerHTML = `<span>Cámaras del mundo 3D y estilo<br><small class="m">Mismo valle real en Cenital, Oblicua, 3.ª/1.ª Persona, Panorámica 2D, Maqueta 2:1 y Pixel World</small></span>` +
      `<div class="seg wrap">${VISTAS.map(v => `<button data-v3m="${v.id}" class="${cur === v.id ? 'on' : ''}">${v.ic} ${v.n}</button>`).join('')}` +
      `<button data-vpxm="1" class="${px ? 'on' : ''}">👾 Pixel World</button></div>`;
    row.after(d);
    d.querySelectorAll('[data-v3m]').forEach(b => b.onclick = () => { Snd.sfx('tap'); Vistas.poner(b.dataset.v3m, true); this.renderMas(); });
    const bp = d.querySelector('[data-vpxm]');
    if (bp) bp.onclick = () => { Snd.sfx('tap'); Vistas.togglePixel(true); this.renderMas(); };
  };

  /* ---------- Controles coherentes en 3P y 1P ----------
     En 3P y 1P la cámara mira siempre al frente del vehículo (yaw). Por eso, Arriba = acelerar
     hacia adelante, Izquierda/Derecha = girar respecto a la cámara, Abajo = frenar/voltear. */
  const _girar99o = Ride.prototype.girarDir;
  Ride.prototype.girarDir = function (d) {
    if (Vistas.esPersp() && d && d.m > 0) {
      const yaw = this._yaw3 != null ? this._yaw3 : this.p.a;
      const ca = Math.cos(yaw), sa = Math.sin(yaw);
      /* Pantalla arriba (d.y = -1) → adelante (ca, sa); pantalla derecha (d.x = 1) → derecha (-sa, ca) */
      const wx = -d.y * ca - d.x * sa;
      const wy = -d.y * sa + d.x * ca;
      return { x: wx, y: wy, m: d.m };
    }
    if (Vistas.esMaqueta() && d && d.m > 0) {
      /* En Maqueta 2:1 los ejes están rotados 45° respecto a pantalla */
      const a = Math.atan2(d.y, d.x) - Math.PI / 4;
      return { x: Math.cos(a), y: Math.sin(a), m: d.m };
    }
    return _girar99o ? _girar99o.call(this, d) : d;
  };

  /* Suavizado del ángulo de cámara 3D en cada paso físico */
  const _upd99o = Ride.prototype.update;
  Ride.prototype.update = function (dt, dir) {
    const r = _upd99o.call(this, dt, dir);
    if (this._yaw3 == null) this._yaw3 = this.p.a;
    else this._yaw3 = angDiff(0, this._yaw3 + angDiff(this._yaw3, this.p.a) * (1 - Math.exp(-dt * 6.5)));
    /* En 3P / 1P permitir salto / ollie con Espacio cuando se presiona timbre en skate o rampa */
    return r;
  };

  /* =====================================================================
     RENDERIZADOR PERSP. 3D REAL DEL MISMO MUNDO (3.ª PERSONA Y 1.ª PERSONA)
     Proyecta con cámara perspectiva verdadera:
     - Cielo y cordilleras del Valle de Aburrá según la hora
     - Calles, avenidas, separadores, andenes, ciclorrutas y río de JE.map.chainsNear
     - Edificios y casas reales de JE.map.lotes y sitTrozo con fachadas, ventanas y techos
     - Estaciones EnCicla, tráfico real, trenes del Metro, hojas, marcadores, GPS y skateparks
     - Vehículo del jugador en 3.ª persona o manubrio/cabina detallada en 1.ª persona
     - Compatible con Pixel World (búfer pixelado nítido si gfx === 'pixel')
     ===================================================================== */
  let _pxCv = null, _pxCtx = null;

  function clipSegNear(x0, z0, x1, z1, zn) {
    if (z0 < zn && z1 < zn) return null;
    if (z0 >= zn && z1 >= zn) return [x0, z0, x1, z1];
    const t = (zn - z0) / (z1 - z0 || 1e-6);
    const xm = x0 + (x1 - x0) * t;
    return z0 < zn ? [xm, zn, x1, z1] : [x0, z0, xm, zn];
  }

  function renderWorld3D(R, V, min, is1P) {
    const pxMode = Vistas.esPixel();
    const W = pxMode ? Math.max(200, Math.round(V.w / 2.2)) : V.w;
    const H = pxMode ? Math.max(150, Math.round(V.h / 2.2)) : V.h;
    let c;
    if (pxMode) {
      if (!_pxCv) { _pxCv = document.createElement('canvas'); _pxCtx = _pxCv.getContext('2d'); }
      if (_pxCv.width !== W || _pxCv.height !== H) { _pxCv.width = W; _pxCv.height = H; }
      c = _pxCtx;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.imageSmoothingEnabled = false;
    } else {
      c = V.ctx;
      c.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    }

    const P = R.p, M = R.map;
    const yaw = R._yaw3 != null ? R._yaw3 : P.a;
    const fx = Math.cos(yaw), fy = Math.sin(yaw), rx = -fy, ry = fx;
    const camDist = is1P ? -1.4 : (P.veh === 'truck' ? 23 : 16.5);
    const camX = P.x - fx * camDist, camY = P.y - fy * camDist;
    const hopZ = (P.z || 0) * 18;
    const camZ = (is1P ? (P.veh === 'truck' ? 5.2 : 3.4) : (P.veh === 'truck' ? 12.2 : 9.4)) + hopZ * (is1P ? .9 : .45);
    const slPitch = clamp((R.sl || 0) * 130, -24, 24);
    const hz = Math.round(H * (is1P ? .43 : .38) - slPitch);
    const F = Math.min(W, H) * (is1P ? .92 : .84);
    const cx = W * .5, ZN = 2.0, ZMAX = JE.calidad3D === 0 ? 110 : 148;
    const night = Art.night(min || 600), hr = (((min || 600) / 60) % 24 + 24) % 24;
    const golden = (hr > 5.4 && hr < 7.6) || (hr > 16.8 && hr < 18.8);

    const toCam = (wx, wy) => {
      const dx = wx - camX, dy = wy - camY;
      return { x: dx * rx + dy * ry, z: dx * fx + dy * fy };
    };
    const proj = (sx3, sy3, sz3) => {
      const z = Math.max(ZN, sz3);
      return { x: cx + (sx3 / z) * F, y: hz - ((sy3 - camZ) / z) * F, k: F / z };
    };

    /* 1) Cielo del Valle de Aburrá + Sol/Luna + Cordilleras */
    const skyCols = Art.sky ? Art.sky(min || 600) : ['#64b5f6', '#b3e5fc'];
    const gSky = c.createLinearGradient(0, 0, 0, hz + 8);
    gSky.addColorStop(0, skyCols[0]);
    gSky.addColorStop(1, golden ? '#f7b267' : (skyCols[1] || '#b3e5fc'));
    c.fillStyle = gSky;
    c.fillRect(0, 0, W, hz + 4);

    /* Estrellas de noche o disco solar de día */
    if (night > .35) {
      c.fillStyle = 'rgba(255,250,220,' + (night * .7).toFixed(2) + ')';
      for (let i = 0; i < 24; i++) {
        const sx = ((i * 97 - yaw * 120) % W + W) % W, sy = (i * 37) % Math.max(20, hz - 22);
        c.fillRect(sx, sy, 1.5, 1.5);
      }
    } else {
      const sunAng = angDiff(yaw, -Math.PI * .35 + (hr - 6) * .22);
      if (Math.abs(sunAng) < 1.2) {
        const sx = cx + sunAng * F * .7, sy = hz - Math.sin(clamp((hr - 5.5) / 13, .08, .92) * Math.PI) * (hz * .78);
        const sg = c.createRadialGradient(sx, sy, 2, sx, sy, 34);
        sg.addColorStop(0, golden ? '#fff4c2' : '#ffffff');
        sg.addColorStop(.35, golden ? 'rgba(255,190,90,.55)' : 'rgba(255,245,200,.45)');
        sg.addColorStop(1, 'rgba(255,240,180,0)');
        c.fillStyle = sg; c.beginPath(); c.arc(sx, sy, 34, 0, TAU); c.fill();
      }
    }

    /* Dos cordilleras del Valle de Aburrá (lejana y cercana) que giran coherentemente con yaw */
    const drawRidge = (col, amp, baseOff, freq, ph) => {
      c.fillStyle = col; c.beginPath(); c.moveTo(0, hz + 2);
      for (let x = 0; x <= W + 16; x += 16) {
        const a = yaw + (x - cx) / F;
        const m = Math.sin(a * freq + ph) * amp + Math.cos(a * (freq * 2.1) - ph * .6) * (amp * .45);
        c.lineTo(x, hz - baseOff - Math.max(0, m));
      }
      c.lineTo(W, hz + 2); c.closePath(); c.fill();
    };
    drawRidge(night > .5 ? '#101d36' : golden ? '#6e5c78' : '#588296', 26, 8, 3.0, 1.1);
    drawRidge(night > .5 ? '#15283a' : golden ? '#485a4c' : '#3a6e4c', 18, 2, 5.0, 2.7);

    /* 2) Suelo base del valle (se mezcla con neblina en el horizonte) */
    const gFloor = c.createLinearGradient(0, hz, 0, H);
    gFloor.addColorStop(0, night > .5 ? '#1a2d28' : '#6c8d5e');
    gFloor.addColorStop(.18, night > .5 ? '#1c2b24' : '#4f7a44');
    gFloor.addColorStop(1, night > .5 ? '#162026' : '#3f5f3b');
    c.fillStyle = gFloor;
    c.fillRect(0, hz, W, H - hz);

    /* 3) Calles, andenes, ciclorrutas y río REALES de M.chainsNear proyectados en 3D */
    const drawGroundRibbon = (x0, y0, x1, y1, halfW, col) => {
      const p0 = toCam(x0, y0), p1 = toCam(x1, y1);
      if (p0.z < ZN && p1.z < ZN) return;
      if (p0.z > ZMAX && p1.z > ZMAX) return;
      const seg = clipSegNear(p0.x, p0.z, p1.x, p1.z, ZN);
      if (!seg) return;
      const [ax, az, bx, bz] = seg;
      let dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz);
      if (l < .05) { dx = 0; dz = 1; l = 1; }
      const nx = (dz / l) * halfW, nz = -(dx / l) * halfW;
      const q0 = proj(ax - nx, 0, Math.max(ZN, az - nz));
      const q1 = proj(ax + nx, 0, Math.max(ZN, az + nz));
      const q2 = proj(bx + nx, 0, Math.max(ZN, bz + nz));
      const q3 = proj(bx - nx, 0, Math.max(ZN, bz - nz));
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(q0.x, q0.y); c.lineTo(q1.x, q1.y); c.lineTo(q2.x, q2.y); c.lineTo(q3.x, q3.y);
      c.closePath(); c.fill();
    };

    const span = ZMAX * 1.1;
    const minX = camX + fx * (span * .45) - span * .85, minY = camY + fy * (span * .45) - span * .85;
    const chains = M.chainsNear ? M.chainsNear(minX, minY, span * 1.7, span * 1.7) : [];
    const roadAsph = night > .5 ? '#2c333d' : '#4c525c';
    const walkCol = night > .5 ? '#5b6169' : '#d2cbbd';
    const cicloCol = night > .5 ? '#1f6a3b' : '#2e9d55';
    const waterCol = night > .5 ? '#1d466b' : '#3f86c8';

    /* Primero andenes / agua, luego asfalto, luego ciclorrutas y líneas centrales */
    for (let pass = 0; pass < 3; pass++) {
      for (let ci = 0; ci < chains.length; ci++) {
        const ch = chains[ci], pts = ch.p;
        if (!pts || pts.length < 4) continue;
        const isRd = ch.k >= 1 && ch.k <= 4;
        if (pass === 0 && !isRd && ch.k !== 9 && ch.k !== 6) continue;
        if (pass === 1 && !isRd) continue;
        if (pass === 2 && ch.k !== 5 && !isRd) continue;
        const hw = (ch.w || 10) * .5;
        for (let j = 2; j < pts.length; j += 2) {
          const x0 = pts[j - 2], y0 = pts[j - 1], x1 = pts[j], y1 = pts[j + 1];
          if (pass === 0) {
            if (ch.k === 9) drawGroundRibbon(x0, y0, x1, y1, 3.6, waterCol);
            else if (ch.k === 6) drawGroundRibbon(x0, y0, x1, y1, hw, walkCol);
            else drawGroundRibbon(x0, y0, x1, y1, hw + 2.8, walkCol);
          } else if (pass === 1) {
            drawGroundRibbon(x0, y0, x1, y1, hw, roadAsph);
          } else {
            if (ch.k === 5) {
              drawGroundRibbon(x0, y0, x1, y1, 3.6, cicloCol);
              drawGroundRibbon(x0, y0, x1, y1, .35, '#d8f0c8');
            } else if (ch.k === 2 || ch.k === 3) {
              drawGroundRibbon(x0, y0, x1, y1, .48, '#e8c64a');
            } else if (ch.k === 1 || ch.k === 4) {
              drawGroundRibbon(x0, y0, x1, y1, .28, 'rgba(240,238,228,.75)');
            }
          }
        }
      }
    }

    /* Parches de río Medellín / plazas (TT.WATER / TT.PLAZA) y árboles/guayacanes 3D alrededor */
    const tx0 = Math.floor(P.x / TS), ty0 = Math.floor(P.y / TS);
    const drawList = [];
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const tx = tx0 + dx, ty = ty0 + dy;
        const tv = M.get(tx, ty);
        const wx = (tx + .5) * TS, wy = (ty + .5) * TS, pc = toCam(wx, wy);
        if (pc.z < ZN + 2 || pc.z > ZMAX * .85 || Math.abs(pc.x) > pc.z * 1.15) continue;
        if (tv === TT.WATER || tv === TT.PLAZA) {
          drawGroundRibbon(wx - TS * .5, wy, wx + TS * .5, wy, TS * .52, tv === TT.WATER ? waterCol : (night > .5 ? '#6c685e' : '#ddd3bd'));
        } else if ((tv === TT.GRASS || tv === TT.MOUNT) && h2(tx, ty, 5) < .24) {
          const k = h2(tx, ty, 6);
          const col = k < .14 ? '#f2c230' : k < .24 ? '#e88ab8' : '#3a863e';
          drawList.push({ k: 'tree', z: pc.z, pc, col, r: 3.4 + (k * 2.2) });
        }
      }
    }

    /* Flechas GPS sobre el pavimento 3D */
    if (R.gps && R.gps.length > 1) {
      c.fillStyle = '#9bd341';
      for (let i = 0; i < R.gps.length && i < 24; i += 2) {
        const g = R.gps[i], pc = toCam(g.x, g.y);
        if (pc.z < ZN + 2 || pc.z > 90 || Math.abs(pc.x) > pc.z * 1.0) continue;
        const q = proj(pc.x, .35, pc.z), rr = clamp(2.1 * q.k, 2, 16);
        c.globalAlpha = clamp(1 - pc.z / 90, .2, .9);
        c.beginPath(); c.moveTo(q.x, q.y - rr * .7); c.lineTo(q.x + rr, q.y + rr * .4); c.lineTo(q.x - rr, q.y + rr * .4); c.closePath(); c.fill();
      }
      c.globalAlpha = 1;
    }

    /* 4) Recolectar TODOS los objetos 3D visibles en el frustum y ordenarlos por profundidad */
    const S = CH * TS;
    const cMinX = Math.max(0, Math.floor((minX) / S)), cMaxX = Math.min(Math.floor((MW - 1) / CH), Math.floor((minX + span * 1.7) / S));
    const cMinY = Math.max(0, Math.floor((minY) / S)), cMaxY = Math.min(Math.floor((MH - 1) / CH), Math.floor((minY + span * 1.7) / S));
    const maxBldgs = JE.calidad3D === 0 ? 45 : 75;
    let bCount = 0;
    for (let cy = cMinY; cy <= cMaxY && bCount < maxBldgs; cy++) {
      for (let cx2 = cMinX; cx2 <= cMaxX && bCount < maxBldgs; cx2++) {
        const LT = M.lotes(cx2, cy);
        if (!LT || !LT.all) continue;
        for (let i = 0; i < LT.all.length; i++) {
          const b = LT.all[i];
          const pc = toCam(b.x, b.y);
          if (pc.z < ZN + 1.5 || pc.z > ZMAX || Math.abs(pc.x) > pc.z * 1.18 + 20) continue;
          if (!b.B && pc.z > 88) continue;
          drawList.push({ k: 'bldg', z: pc.z, b });
          if (++bCount >= maxBldgs) break;
        }
      }
    }

    /* Estaciones EnCicla reales */
    for (const s of M.stations) {
      const pc = toCam(s.x, s.y);
      if (pc.z < ZN + 1 || pc.z > ZMAX || Math.abs(pc.x) > pc.z * 1.15 + 14) continue;
      drawList.push({ k: 'st', z: pc.z, s, pc });
    }
    /* Tráfico real (carros, buses, motos) */
    for (const cr of R.cars) {
      const pc = toCam(cr.x, cr.y);
      if (pc.z < ZN + .8 || pc.z > 105 || Math.abs(pc.x) > pc.z * 1.1 + 8) continue;
      drawList.push({ k: 'car', z: pc.z, cr, pc });
    }
    /* Trenes del Metro en viaducto / superficie */
    for (const tr of R.trains || []) {
      for (let j = -1; j <= 1; j++) {
        const ss = tr.s + j * 17; if (ss < 0 || ss > tr.L.len) continue;
        const q = M.at(tr.L, ss), pc = toCam(q.x, q.y);
        if (pc.z < ZN + 2 || pc.z > ZMAX || Math.abs(pc.x) > pc.z * 1.2 + 12) continue;
        const alto = tr.L.alto && tr.L.alto.some(a => ss >= a.s0 && ss <= a.s1);
        drawList.push({ k: 'train', z: pc.z, pc, alto });
      }
    }
    /* Hojas verdes coleccionables */
    for (const l of R.leaves || []) {
      if (l.got) continue;
      const pc = toCam(l.x, l.y);
      if (pc.z < ZN + .5 || pc.z > 75 || Math.abs(pc.x) > pc.z * 1.05) continue;
      drawList.push({ k: 'leaf', z: pc.z, pc, x: l.x });
    }
    /* Marcadores / metas (pilares de luz tipo Forza Horizon) */
    for (const mk of R.markers || []) {
      const pc = toCam(mk.x, mk.y);
      if (pc.z < ZN + 1 || pc.z > ZMAX * 1.3 || Math.abs(pc.x) > pc.z * 1.25 + 15) continue;
      drawList.push({ k: 'mk', z: pc.z, mk, pc });
    }
    /* Rampas y zonas de skatepark/parkour (si 99p está cargado) */
    if (JE.skateSpots) {
      for (const sp of JE.skateSpots) {
        const pc = toCam(sp.x, sp.y);
        if (pc.z < ZN + 1 || pc.z > 115 || Math.abs(pc.x) > pc.z * 1.2 + 18) continue;
        drawList.push({ k: 'skate', z: pc.z, sp, pc });
      }
    }

    /* Ordenar de lejos a cerca */
    drawList.sort((a, b) => b.z - a.z);

    /* 5) Dibujar todos los elementos 3D proyectados */
    const tSec = performance.now() / 1000;
    const fogCol = night > .5 ? '#101d36' : golden ? '#e6a86e' : '#96c2de';

    for (let i = 0; i < drawList.length; i++) {
      const it = drawList[i];
      if (it.k === 'bldg') {
        const b = it.b, Q = b.pts;
        const bh = b.B ? (8 + b.z * 38) : (4.8 + (b.z || .12) * 12);
        const fog = clamp((it.z - 65) / (ZMAX - 55), 0, .55);
        const nb = Math.round(night * 3);
        const p = b.pal && b.pal[nb] ? b.pal[nb] : {
          roof: mixHex(b.roof || '#9aa0a6', '#0b1430', nb * .17),
          wa: mixHex(b.wa || '#d6cab8', '#0b1430', nb * .17),
          wb: mixHex(b.wb || '#bfb3a0', '#0b1430', nb * .17)
        };
        const pBot = [], pTop = [];
        let ok = true;
        for (let k = 0; k < 4; k++) {
          const pc2 = toCam(Q[k * 2], Q[k * 2 + 1]);
          if (pc2.z < ZN) { ok = false; break; }
          pBot.push(proj(pc2.x, 0, pc2.z));
          pTop.push(proj(pc2.x, bh, pc2.z));
        }
        if (!ok) continue;
        const mx = b.x, my = b.y;
        const floors = Math.max(1, Math.min(8, Math.round(bh / 4.8)));
        for (let k = 0; k < 4; k++) {
          const j = (k + 1) & 3;
          const ex = (Q[k * 2] + Q[j * 2]) * .5, ey = (Q[k * 2 + 1] + Q[j * 2 + 1]) * .5;
          const nx = ex - mx, ny = ey - my;
          if (nx * (camX - ex) + ny * (camY - ey) <= 0) continue;
          const baseCol = Math.abs(nx) > Math.abs(ny) ? p.wb : p.wa;
          const wallCol = fog > .08 ? mixHex(baseCol, fogCol, fog) : baseCol;
          c.fillStyle = wallCol;
          c.beginPath();
          c.moveTo(pBot[k].x, pBot[k].y); c.lineTo(pBot[j].x, pBot[j].y);
          c.lineTo(pTop[j].x, pTop[j].y); c.lineTo(pTop[k].x, pTop[k].y);
          c.closePath(); c.fill();
          /* Zócalo comercial en planta baja + cornisa superior */
          if (it.z < 96) {
            const zTopK = lerp(pBot[k].y, pTop[k].y, .16), zTopJ = lerp(pBot[j].y, pTop[j].y, .16);
            c.fillStyle = 'rgba(14,22,36,.24)';
            c.beginPath();
            c.moveTo(pBot[k].x, pBot[k].y); c.lineTo(pBot[j].x, pBot[j].y);
            c.lineTo(lerp(pBot[j].x, pTop[j].x, .16), zTopJ); c.lineTo(lerp(pBot[k].x, pTop[k].x, .16), zTopK);
            c.closePath(); c.fill();
            /* Ventanas arquitectónicas en cuadrícula perspectiva real */
            const winCol = night > .45 ? '#ffe38a' : '#264463';
            const cols = Math.max(2, Math.min(5, Math.round(Math.abs(pBot[j].x - pBot[k].x) / 14)));
            c.fillStyle = winCol;
            for (let fl = 1; fl < floors; fl++) {
              const u0 = (fl + .06) / (floors + .35), u1 = (fl + .56) / (floors + .35);
              for (let cl = 0; cl < cols; cl++) {
                const s0 = (cl + .18) / cols, s1 = (cl + .78) / cols;
                const ax0 = lerp(pBot[k].x, pTop[k].x, u0), ay0 = lerp(pBot[k].y, pTop[k].y, u0);
                const bx0 = lerp(pBot[j].x, pTop[j].x, u0), by0 = lerp(pBot[j].y, pTop[j].y, u0);
                const ax1 = lerp(pBot[k].x, pTop[k].x, u1), ay1 = lerp(pBot[k].y, pTop[k].y, u1);
                const bx1 = lerp(pBot[j].x, pTop[j].x, u1), by1 = lerp(pBot[j].y, pTop[j].y, u1);
                c.beginPath();
                c.moveTo(lerp(ax0, bx0, s0), lerp(ay0, by0, s0));
                c.lineTo(lerp(ax0, bx0, s1), lerp(ay0, by0, s1));
                c.lineTo(lerp(ax1, bx1, s1), lerp(ay1, by1, s1));
                c.lineTo(lerp(ax1, bx1, s0), lerp(ay1, by1, s0));
                c.closePath(); c.fill();
              }
            }
            /* Cornisa de remate */
            c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1.2;
            c.beginPath(); c.moveTo(pTop[k].x, pTop[k].y); c.lineTo(pTop[j].x, pTop[j].y); c.stroke();
          }
          c.strokeStyle = 'rgba(10,20,36,.22)'; c.lineWidth = .7;
          c.beginPath(); c.moveTo(pBot[k].x, pBot[k].y); c.lineTo(pTop[k].x, pTop[k].y); c.stroke();
        }
        /* Techo visible si la cámara está más alta que el edificio */
        if (camZ > bh) {
          c.fillStyle = fog > .08 ? mixHex(p.roof, fogCol, fog) : p.roof;
          c.beginPath();
          c.moveTo(pTop[0].x, pTop[0].y); c.lineTo(pTop[1].x, pTop[1].y);
          c.lineTo(pTop[2].x, pTop[2].y); c.lineTo(pTop[3].x, pTop[3].y);
          c.closePath(); c.fill();
        }
      } else if (it.k === 'tree') {
        const q = proj(it.pc.x, 0, it.pc.z), qt = proj(it.pc.x, 5.2, it.pc.z);
        const rad = clamp(it.r * q.k * .55, 3, 38), trW = Math.max(2, rad * .24);
        c.fillStyle = 'rgba(0,0,0,.24)'; c.beginPath(); c.ellipse(q.x, q.y, rad * .85, rad * .26, 0, 0, TAU); c.fill();
        c.fillStyle = '#5c3c24'; c.fillRect(q.x - trW * .5, qt.y, trW, Math.max(3, q.y - qt.y));
        c.fillStyle = shade(it.col, -.16); c.beginPath(); c.arc(qt.x, qt.y, rad, 0, TAU); c.fill();
        c.fillStyle = it.col; c.beginPath(); c.arc(qt.x - rad * .18, qt.y - rad * .18, rad * .76, 0, TAU); c.fill();
      } else if (it.k === 'st') {
        const q = proj(it.pc.x, 0, it.pc.z), qt = proj(it.pc.x, 4.4, it.pc.z);
        const w = clamp(12 * q.k, 10, 140), h = Math.max(4, q.y - qt.y);
        c.fillStyle = '#0a2342'; c.fillRect(q.x - w * .45, qt.y + h * .2, w * .08, h * .8); c.fillRect(q.x + w * .37, qt.y + h * .2, w * .08, h * .8);
        c.fillStyle = PAL.vd; c.fillRect(q.x - w * .52, qt.y, w * 1.04, Math.max(3, h * .26));
        c.fillStyle = '#fff'; c.fillRect(q.x - w * .46, qt.y + 1, w * .92, Math.max(1, h * .07));
        if (it.z < 68 && !pxMode) {
          c.font = '700 11px Cuerpo,sans-serif'; c.textAlign = 'center';
          c.fillStyle = '#0a2342dd'; c.fillRect(q.x - 44, qt.y - 17, 88, 14);
          c.fillStyle = '#c4ec7c'; c.fillText('🚲 ' + it.s.name.slice(0, 14), q.x, qt.y - 7);
        }
      } else if (it.k === 'car') {
        const cr = it.cr, q = proj(it.pc.x, 0, it.pc.z);
        const isBus = cr.kind === 'bus' || cr.kind === 'camion';
        const w = clamp((isBus ? 4.4 : cr.kind === 'moto' ? 1.8 : 3.2) * q.k, 4, 86);
        const h = clamp((isBus ? 4.2 : cr.kind === 'moto' ? 2.2 : 2.3) * q.k, 3, 62);
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(q.x - w * .55, q.y - 2, w * 1.1, 3);
        c.fillStyle = cr.col || '#d94e34'; c.fillRect(q.x - w * .5, q.y - h, w, h);
        c.fillStyle = '#1f2f45'; c.fillRect(q.x - w * .38, q.y - h * .86, w * .76, h * .34);
        const sameDir = Math.cos(cr.ang - yaw) > 0;
        c.fillStyle = sameDir ? '#ff3b30' : '#fff4b8';
        const lr = Math.max(1.5, w * .12);
        c.fillRect(q.x - w * .42, q.y - h * .34, lr, lr); c.fillRect(q.x + w * .42 - lr, q.y - h * .34, lr, lr);
      } else if (it.k === 'train') {
        const hBase = it.alto ? 9.5 : 0;
        const q = proj(it.pc.x, hBase, it.pc.z), qt = proj(it.pc.x, hBase + 4.2, it.pc.z);
        const w = clamp(5.5 * q.k, 6, 90), h = Math.max(4, q.y - qt.y);
        if (it.alto) {
          const qg = proj(it.pc.x, 0, it.pc.z);
          c.fillStyle = '#8b929c'; c.fillRect(q.x - w * .55, q.y, w * 1.1, Math.max(2, h * .28));
          c.fillStyle = '#6c737d'; c.fillRect(q.x - w * .14, q.y, w * .28, Math.max(2, qg.y - q.y));
        }
        c.fillStyle = '#e6e9ee'; c.fillRect(q.x - w * .5, qt.y, w, h);
        c.fillStyle = PAL.vd; c.fillRect(q.x - w * .5, qt.y + h * .65, w, Math.max(2, h * .2));
        c.fillStyle = '#1c5c9c'; c.fillRect(q.x - w * .4, qt.y + h * .18, w * .8, h * .32);
      } else if (it.k === 'leaf') {
        const bob = 1.6 + Math.sin(tSec * 5 + it.x) * .5;
        const q = proj(it.pc.x, bob, it.pc.z), r = clamp(1.3 * q.k, 2.5, 14);
        c.fillStyle = '#7ab800'; c.beginPath(); c.arc(q.x, q.y, r, 0, TAU); c.fill();
        c.fillStyle = '#c4ec7c'; c.beginPath(); c.arc(q.x - r * .25, q.y - r * .25, r * .5, 0, TAU); c.fill();
      } else if (it.k === 'mk') {
        const q = proj(it.pc.x, 0, it.pc.z), qt = proj(it.pc.x, 22, it.pc.z);
        const r = clamp(3.2 * q.k, 4, 34), col = it.mk.col || PAL.amb;
        const pg = c.createLinearGradient(0, qt.y, 0, q.y);
        pg.addColorStop(0, 'rgba(255,255,255,0)');
        pg.addColorStop(1, col + '99');
        c.fillStyle = pg; c.fillRect(q.x - r * .45, qt.y, r * .9, Math.max(8, q.y - qt.y));
        c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.ellipse(q.x, q.y, r, r * .35, 0, 0, TAU); c.stroke();
      } else if (it.k === 'skate') {
        const q = proj(it.pc.x, 0, it.pc.z), qt = proj(it.pc.x, 2.8, it.pc.z);
        const w = clamp(10 * q.k, 10, 120), h = Math.max(4, q.y - qt.y);
        c.fillStyle = '#e8b931';
        c.beginPath(); c.moveTo(q.x - w * .5, q.y); c.lineTo(q.x + w * .5, q.y); c.lineTo(q.x + w * .38, qt.y); c.lineTo(q.x - w * .38, qt.y); c.closePath(); c.fill();
        c.fillStyle = '#0a2342'; c.fillRect(q.x - w * .4, qt.y, w * .8, Math.max(2, h * .25));
      }
    }

    /* 6) Jugador en 3.ª persona o cabina/manubrio en 1.ª persona */
    if (is1P) drawCockpit1P(c, W, H, R, tSec, pxMode);
    else drawPlayer3P(c, W, H, R, tSec, pxMode);

    /* Lluvia y velo nocturno */
    if (R.mode && R.mode.mods && R.mode.mods.rain) {
      c.strokeStyle = 'rgba(207,232,255,.45)'; c.lineWidth = 1; c.beginPath();
      for (let i = 0; i < 45; i++) {
        const rx2 = (i * 97 + tSec * 120) % W, ry2 = (i * 53 + tSec * 360) % H;
        c.moveTo(rx2, ry2); c.lineTo(rx2 - 3, ry2 + 12);
      }
      c.stroke();
    }
    if (night > .25) {
      const hg = c.createRadialGradient(cx, H * .86, 8, cx, H * .56, W * .48);
      hg.addColorStop(0, 'rgba(255,244,184,' + (night * .28).toFixed(2) + ')');
      hg.addColorStop(1, 'rgba(255,244,184,0)');
      c.fillStyle = hg; c.fillRect(0, hz, W, H - hz);
    }

    if (pxMode) {
      const mc = V.ctx;
      mc.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
      mc.imageSmoothingEnabled = false;
      mc.drawImage(_pxCv, 0, 0, W, H, 0, 0, V.w, V.h);
    }
  }

  /* Dibujo del vehículo y ciclista desde atrás en 3.ª persona (mismos colores del perfil) */
  function drawPlayer3P(c, W, H, R, tSec, pxMode) {
    const P = R.p, veh = P.veh, prof = Save.data ? Save.data.profile : {};
    const shirt = R.mode && R.mode.uniform ? '#0e2d55' : (SHIRTS[prof.shirt] || PAL.vd);
    const skin = SKINS[prof.skin] || '#f0c090';
    const helm = R.mode && R.mode.uniform ? '#ffffff' : (prof.helmet === 0 ? (PELO[prof.hairCol | 0] || '#2a1a10') : (HELMETS[prof.helmet] || '#ffffff'));
    const sc = Math.min(W, H) / (pxMode ? 190 : 380);
    const lean = clamp((P.w || 0) * .12, -.28, .28);
    const hop = (P.z || 0) * 140 * sc;
    const ped = Math.sin((R.stats.dist || 0) * .22) * 5 * sc;
    const bx = W * .5, by = H * .81;

    c.fillStyle = 'rgba(0,0,0,.35)';
    c.beginPath(); c.ellipse(bx, by + 4 * sc, (veh === 'truck' ? 42 : 18) * sc, 6 * sc, 0, 0, TAU); c.fill();

    c.save();
    c.translate(bx, by - hop);
    c.rotate(lean);

    if (veh === 'truck') {
      const tw = 74 * sc, th = 56 * sc;
      c.fillStyle = '#0e2d55'; c.beginPath(); c.roundRect(-tw / 2, -th, tw, th, 8 * sc); c.fill();
      c.fillStyle = PAL.vd; c.fillRect(-tw * .47, -th * .92, tw * .94, th * .62);
      c.fillStyle = '#0a2342'; c.fillRect(-tw * .36, -th * .72, tw * .72, th * .24);
      c.fillStyle = '#c4ec7c'; c.font = '700 ' + Math.round(10 * sc) + 'px Titulos,sans-serif'; c.textAlign = 'center';
      c.fillText('ENCICLA · ' + (P.load | 0), 0, -th * .56);
      c.fillStyle = '#ff3b30'; c.fillRect(-tw * .44, -th * .22, 12 * sc, 7 * sc); c.fillRect(tw * .44 - 12 * sc, -th * .22, 12 * sc, 7 * sc);
      c.fillStyle = '#14171c'; c.fillRect(-tw * .42, -5 * sc, 14 * sc, 10 * sc); c.fillRect(tw * .42 - 14 * sc, -5 * sc, 14 * sc, 10 * sc);
      c.restore(); return;
    }

    if (veh === 'skate') {
      c.fillStyle = '#d9a066'; c.beginPath(); c.roundRect(-16 * sc, -6 * sc, 32 * sc, 6 * sc, 3 * sc); c.fill();
      c.fillStyle = '#f4efe2'; c.fillRect(-13 * sc, -1 * sc, 6 * sc, 4 * sc); c.fillRect(7 * sc, -1 * sc, 6 * sc, 4 * sc);
    } else if (veh === 'patines') {
      c.fillStyle = '#1b4d89'; c.fillRect(-12 * sc, -10 * sc + ped * .6, 8 * sc, 9 * sc); c.fillRect(4 * sc, -10 * sc - ped * .6, 8 * sc, 9 * sc);
      c.fillStyle = '#ff5a36'; c.fillRect(-10 * sc, -2 * sc + ped * .6, 4 * sc, 4 * sc); c.fillRect(6 * sc, -2 * sc - ped * .6, 4 * sc, 4 * sc);
    } else if (veh !== 'walk') {
      c.fillStyle = '#181c22'; c.beginPath(); c.roundRect(-4.5 * sc, -30 * sc, 9 * sc, 30 * sc, 4 * sc); c.fill();
      const frame = veh === 'ebike' ? '#2fa8dc' : veh === 'emonopatin' ? '#1f242e' : veh === 'scooter' ? '#c9d1db' : (typeof bikeCol === 'function' ? bikeCol() : PAL.vd);
      c.fillStyle = frame; c.fillRect(-5 * sc, -44 * sc, 10 * sc, 20 * sc);
      c.fillStyle = '#ff3b30'; c.beginPath(); c.arc(0, -34 * sc, 3 * sc, 0, TAU); c.fill();
      c.fillStyle = '#2d323b'; c.fillRect(-26 * sc, -52 * sc, 52 * sc, 4 * sc);
    }

    c.fillStyle = '#1f2d46';
    c.fillRect(-11 * sc, -34 * sc + ped * .7, 8 * sc, 18 * sc);
    c.fillRect(3 * sc, -34 * sc - ped * .7, 8 * sc, 18 * sc);
    c.fillStyle = shirt;
    c.beginPath(); c.roundRect(-15 * sc, -60 * sc, 30 * sc, 28 * sc, 8 * sc); c.fill();
    if (R.mode && R.mode.uniform) { c.fillStyle = PAL.vd; c.fillRect(-14 * sc, -52 * sc, 28 * sc, 5 * sc); }
    c.fillStyle = skin;
    c.fillRect(-23 * sc, -56 * sc, 9 * sc, 9 * sc); c.fillRect(14 * sc, -56 * sc, 9 * sc, 9 * sc);
    c.fillStyle = helm; c.beginPath(); c.arc(0, -69 * sc, 11 * sc, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-2 * sc, -78 * sc, 4 * sc, 14 * sc);
    c.restore();
  }

  /* Cabina / manubrio en 1.ª persona (adaptado al vehículo real) */
  function drawCockpit1P(c, W, H, R, tSec) {
    const P = R.p, veh = P.veh, prof = Save.data ? Save.data.profile : {};
    const skin = SKINS[prof.skin] || '#f0c090';
    const sc = Math.min(W, H) / 360;
    const steer = clamp((P.w || 0) * .14, -.26, .26);
    const bob = P.v > 4 ? Math.sin(tSec * (6 + P.v * .08)) * 3 * sc : 0;

    if (veh === 'truck') {
      c.fillStyle = '#0e1b2d';
      c.fillRect(0, 0, W, 16 * sc); c.fillRect(0, 0, 14 * sc, H); c.fillRect(W - 14 * sc, 0, 14 * sc, H);
      c.fillRect(0, H - 56 * sc, W, 56 * sc);
      c.save(); c.translate(W * .34, H - 22 * sc); c.rotate(steer * 2.4);
      c.strokeStyle = '#1c222b'; c.lineWidth = 10 * sc; c.beginPath(); c.arc(0, 0, 44 * sc, 0, TAU); c.stroke();
      c.strokeStyle = '#39424f'; c.lineWidth = 6 * sc; c.beginPath(); c.moveTo(-40 * sc, 0); c.lineTo(40 * sc, 0); c.moveTo(0, 0); c.lineTo(0, 40 * sc); c.stroke();
      c.restore();
      return;
    }

    if (veh === 'walk' || veh === 'skate' || veh === 'patines') return;

    c.save();
    c.translate(W * .5, H - 36 * sc + bob);
    c.rotate(steer);
    if (veh === 'bike' || veh === 'ebike') {
      c.fillStyle = '#36414f'; c.beginPath(); c.roundRect(-56 * sc, -64 * sc, 112 * sc, 42 * sc, 6 * sc); c.fill();
      c.fillStyle = '#4e5b6e'; c.fillRect(-52 * sc, -60 * sc, 104 * sc, 34 * sc);
      c.fillStyle = '#252e3a';
      for (let gx = -42; gx <= 42; gx += 12) c.fillRect(gx * sc, -60 * sc, 2 * sc, 34 * sc);
      c.fillStyle = PAL.vd; c.fillRect(-32 * sc, -52 * sc, 64 * sc, 18 * sc);
      c.fillStyle = '#0a2342'; c.fillRect(-28 * sc, -48 * sc, 56 * sc, 10 * sc);
      c.fillStyle = '#c4ec7c'; c.fillRect(-22 * sc, -45 * sc, 44 * sc, 4 * sc);
    }
    /* Maniguetas de freno de aluminio */
    c.fillStyle = '#cfd6e0';
    c.fillRect(-130 * sc, -30 * sc, 36 * sc, 5 * sc);
    c.fillRect(94 * sc, -30 * sc, 36 * sc, 5 * sc);
    c.fillStyle = '#252b34'; c.fillRect(-9 * sc, -22 * sc, 18 * sc, 58 * sc);
    c.fillStyle = veh === 'ebike' ? '#2fa8dc' : veh === 'emonopatin' ? '#1f242e' : PAL.vd;
    c.beginPath(); c.roundRect(-138 * sc, -24 * sc, 276 * sc, 12 * sc, 6 * sc); c.fill();
    c.fillStyle = '#181c22';
    c.beginPath(); c.roundRect(-148 * sc, -27 * sc, 38 * sc, 18 * sc, 7 * sc); c.fill();
    c.beginPath(); c.roundRect(110 * sc, -27 * sc, 38 * sc, 18 * sc, 7 * sc); c.fill();
    c.fillStyle = '#ffd24c'; c.beginPath(); c.arc(76 * sc, -30 * sc, 9 * sc, 0, TAU); c.fill();
    c.fillStyle = '#fff5bd'; c.beginPath(); c.arc(74 * sc, -32 * sc, 4 * sc, 0, TAU); c.fill();
    if (veh === 'ebike' || veh === 'emonopatin') {
      c.fillStyle = '#0a2342'; c.beginPath(); c.roundRect(-24 * sc, -36 * sc, 48 * sc, 18 * sc, 5 * sc); c.fill();
      c.fillStyle = '#7ce0ff'; c.font = '700 ' + Math.round(11 * sc) + 'px monospace'; c.textAlign = 'center';
      c.fillText(Math.round((P.v || 0) * .24) + ' km/h', 0, -23 * sc);
    }
    c.fillStyle = skin;
    c.beginPath(); c.roundRect(-136 * sc, -28 * sc, 26 * sc, 20 * sc, 8 * sc); c.fill();
    c.beginPath(); c.roundRect(110 * sc, -28 * sc, 26 * sc, 20 * sc, 8 * sc); c.fill();
    c.restore();
  }

  /* =====================================================================
     MAQUETA 2:1 EN VIVO (reutiliza Maqueta de 86-maqueta.js siguiendo al jugador)
     ===================================================================== */
  function renderMaquetaViva(R, V) {
    if (typeof Maqueta === 'undefined') return;
    const c = V.ctx, W = V.w, H = V.h, P = R.p;
    c.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    c.fillStyle = '#9fc7e6'; c.fillRect(0, 0, W, H);
    const mx = P.x * M_PER_PX, my = P.y * M_PER_PX, a = 1.15;
    const res = JE.calidad3D === 0 ? .5 : .65;
    const cw = Math.max(120, Math.round(W * res)), ch = Math.max(120, Math.round(H * res));
    if (!R._mqCam || Math.hypot(mx - R._mqCam.x, my - R._mqCam.y) > 22 || R._mqW !== cw || R._mqH !== ch) {
      Maqueta.render({ x: mx, y: my, a: a * res }, cw, ch);
      R._mqCam = { x: mx, y: my, a }; R._mqW = cw; R._mqH = ch;
    }
    const o = R._mqCam, [U, Vv] = Maqueta.R(mx, my), [Uo, Vo] = Maqueta.R(o.x, o.y);
    c.imageSmoothingEnabled = !Vistas.esPixel();
    c.drawImage(Maqueta.cv, ((Uo - Vo) - (U - Vv)) * a, ((Uo + Vo) - (U + Vv)) * a * .5, W, H);
    const cam = { x: mx, y: my, a };
    const S2 = (px, py, dz) => { const x = px * M_PER_PX, y = py * M_PER_PX; return Maqueta.P(x, y, Maqueta.elev(x, y) + (dz || 0), cam, W, H); };
    for (const s of JE.map.stations) {
      const q = S2(s.x, s.y, 7);
      if (q.x < -12 || q.y < 30 || q.x > W + 12 || q.y > H) continue;
      c.fillStyle = '#0a2342'; c.fillRect(q.x - 4, q.y - 4, 8, 8);
      c.fillStyle = PAL.vd; c.fillRect(q.x - 3, q.y - 3, 6, 6);
    }
    for (const mk of R.markers || []) {
      const q = S2(mk.x, mk.y, 12);
      if (q.x < -12 || q.y < 20 || q.x > W + 12 || q.y > H) continue;
      c.strokeStyle = mk.col || PAL.amb; c.lineWidth = 2.5;
      c.beginPath(); c.arc(q.x, q.y, 10, 0, TAU); c.stroke();
    }
    const qp = S2(P.x, P.y, 6);
    c.fillStyle = '#ff2fb3'; c.strokeStyle = '#fff'; c.lineWidth = 2.5;
    c.beginPath(); c.arc(qp.x, qp.y, 7, 0, TAU); c.fill(); c.stroke();
  }

  /* =====================================================================
     ENGANCHE EN Ride.prototype.render / renderTop / hud + MEJORA VISUAL 3D CENITAL
     ===================================================================== */
  const _render99o = Ride.prototype.render;
  Ride.prototype.render = function (V, min) {
    this.min = min;
    if (Vistas.esPersp() || Vistas.esMaqueta()) {
      this.pLab = [];
      return;
    }
    return _render99o.call(this, V, min);
  };

  const _rtop99o = Ride.prototype.renderTop;
  Ride.prototype.renderTop = function (V) {
    if (Vistas.esPersp()) {
      renderWorld3D(this, V, this.min || 600, Vistas.actual() === '1p');
      return;
    }
    if (Vistas.esMaqueta()) {
      renderMaquetaViva(this, V);
      return;
    }
    _rtop99o.call(this, V);
    if (!panoOn(this) && GFX() === '3d') {
      const hr = (((this.min || 600) / 60) % 24 + 24) % 24;
      const c = V.ctx;
      if ((hr > 5.5 && hr < 7.2) || (hr > 17.0 && hr < 18.7)) {
        c.save();
        c.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
        c.fillStyle = hr < 12 ? 'rgba(255,198,112,.08)' : 'rgba(255,146,72,.10)';
        c.fillRect(0, 0, V.w, V.h);
        c.restore();
      }
    }
  };

  /* HUD limpio sobre 3P / 1P / Maqueta: etiquetas abajo-centro para CERO solapamiento con el barrio arriba */
  const _hud99o = Ride.prototype.hud;
  Ride.prototype.hud = function (V, opts) {
    if (!Vistas.esPersp() && !Vistas.esMaqueta()) return _hud99o.call(this, V, opts);
    const cx = this.cxf, cy = this.cyf, T = this.target, fx = this.fx;
    this.cxf = -1e7; this.cyf = -1e7; this.target = null; this.fx = [];
    try { _hud99o.call(this, V, opts); } finally { this.cxf = cx; this.cyf = cy; this.target = T; this.fx = fx; }
    const tag = Vistas.actual() === '1p' ? '1.ª PERSONA · 3D' : Vistas.actual() === '3p' ? '3.ª PERSONA · 3D' : 'MAQUETA 2:1';
    const kmh = Math.round((this.p.v || 0) * .24);
    const baseY = V.h - 16;
    V.text(tag + (Vistas.esPixel() ? ' · PIXEL' : '') + ' · ' + kmh + ' km/h', V.w / 2, baseY, { size: 11.5, align: 'center', color: '#c4ec7c', bg: '#0a2342dc', pad: 4, body: true });
    if (T) {
      const d = Math.round(dist(T.x, T.y, this.p.x, this.p.y) * M_PER_PX);
      const da = angDiff(this.p.a, Math.atan2(T.y - this.p.y, T.x - this.p.x));
      const arrow = Math.abs(da) < .35 ? '⬆' : da > 0 ? '➡' : '⬅';
      V.text(arrow + ' ' + (T.label || 'Destino').slice(0, 24) + ' · ' + (d >= 1000 ? (d / 1000).toFixed(1) + ' km' : d + ' m'), V.w / 2, baseY - 24, { size: 12.5, align: 'center', color: '#fff', bg: '#0a2342e6', pad: 4, body: true });
    }
    for (const f of fx) if (f.k === 't') V.text(f.txt, V.w / 2, V.h * .30, { size: 16, align: 'center', stroke: '#0a2342', sw: 4, color: f.col });
  };
})();
