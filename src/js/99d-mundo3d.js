/* =====================================================================
   UN SOLO MUNDO 3D (ronda 3.0, Claude) · el autor: «el mundo debe ser 3D, pero no debes crear otro cuando pases a primera o
   tercera persona: el mismo mundo que se ve en cenital se debe aplicar igual. El 2D es para diseñar el entorno y detallar».
   Así se hizo: la vista 3D (WebGL, sin librerías) usa EL MISMO MAPA Y EL MISMO ARTE que la cenital:
   - el PISO es el dibujo 2D de cada trozo de 160 m (calles, andenes, cebras, parques, ríos…: CityMap.chunkG), puesto como
     textura sobre el suelo: lo que se diseña en 2D se ve en 3D;
   - los EDIFICIOS son los mismos lotes de la cenital (M.lotes: sus 4 esquinas, su altura y sus colores de techo y muro),
     levantados en volumen con luz del sol del noroeste;
   - los ÁRBOLES salen donde el 2D pinta las copas del pasto (la misma regla de casilla y semilla);
   - los CARROS, la gente y el ciclista son los del recorrido (Ride), en volumen.
   Cámaras sobre ese mundo: 🧍 Tercera persona (detrás y arriba de la bici) y 👁️ Primera persona (a la altura de los ojos);
   la cenital sigue siendo la de siempre. El joystick va según la cámara (arriba = adelante). Los nombres, la flecha del
   destino y los avisos se proyectan con la misma cámara. Sin WebGL, se queda la cenital (respaldo 2D).
   ===================================================================== */
const Mundo3D = JE.mundo3d = {
  modo: null, gl: null, cv: null, tex: new Map(), mallas: new Map(), yaw: 0, H: 1.6, ALT: 120,   /* px de alto por unidad de z de los lotes (una casa ~6 m, 4 pisos ~16 m) */
  ZA: 30 * PXM,   /* 3.2 · px de alto por unidad de z de lo que va en alto (76-altura.js): el viaducto del metro (z ,4) queda a 12 m y un puente de z ,2 a 6 m */
  activo(R) { return !!(this.modo && R && R.mode && R.mode.ride === R && !R.mode.sub && !(typeof panoOn === 'function' && panoOn(R)) && !R.big && this.ok()); },
  ok() { if (this._ok != null) return this._ok; try { const c = document.createElement('canvas'), g = c.getContext('webgl', { antialias: true }); this._ok = !!g; } catch (e) { this._ok = false; } return this._ok; },
  ciclo() { const M = ['tercera', 'primera', null], i = M.indexOf(this.modo); this.poner(M[(i + 1) % M.length]); },
  poner(m) {
    if (m && !this.ok()) { UI.toast('Este celular no tiene WebGL: la vista 3D no está disponible'); return; }
    this.modo = m; const b = $('#b3D'); if (b) { b.textContent = m === 'tercera' ? '🧍' : m === 'primera' ? '👁️' : '3D'; b.classList.toggle('on', !!m); }
    if (this.cv) this.cv.hidden = !m; document.body.classList.toggle('gl3d', !!m);
    if (!JE.headless) UI.toast(m === 'tercera' ? '🧍 Tercera persona: el mismo valle en 3D' : m === 'primera' ? '👁️ Primera persona: a la altura de tus ojos' : '🗺️ Vista cenital');
  },
  /* ---------- WebGL ---------- */
  iniciar() {
    if (this.gl) return true; const cv = this.cv = document.createElement('canvas'); cv.id = 'gl3d'; cv.setAttribute('aria-hidden', 'true'); $('#sGame').insertBefore(cv, $('#cv'));
    const gl = this.gl = cv.getContext('webgl', { antialias: true, alpha: false }); if (!gl) return false;
    const vs = `attribute vec3 p;attribute vec3 n;attribute vec3 c;attribute vec2 u;uniform mat4 M;uniform vec3 L;uniform float nk;varying vec3 vc;varying vec2 vu;varying float vf;varying float vl;
      void main(){vec4 q=M*vec4(p,1.);gl_Position=q;vc=c;vu=u;vf=clamp((q.w-140.*nk)/(560.*nk),0.,1.);vl=.62+.38*max(dot(n,L),0.)+.0*n.y;}`;
    /* 3.2 · las fachadas con ventanas: los muros de los edificios llevan en u la distancia a lo largo del muro (+10) y en v la
       altura (px); cada piso de 3 m tiene su fila de ventanas, y de noche algunas se prenden */
    const fs = `precision mediump float;varying vec3 vc;varying vec2 vu;varying float vf;varying float vl;uniform sampler2D T;uniform float usaT;uniform vec3 F;uniform float noche;
      void main(){vec3 k=usaT>.5?texture2D(T,vu).rgb:vc;float luz=0.;
        if(usaT<.5&&vu.x>=10.){vec2 w=vec2((vu.x-10.)/4.2,vu.y/4.8);vec2 f=fract(w);if(vu.y>1.2&&f.x>.22&&f.x<.74&&f.y>.32&&f.y<.78){float h=fract(sin(dot(floor(w),vec2(12.9898,78.233)))*43758.5453);k=mix(k*.55,vec3(.3,.4,.5),.5);luz=step(.5,h)*noche;}}
        k*=vl*(1.-noche*.55);k=mix(k,vec3(1.,.85,.5),luz*.85);gl_FragColor=vec4(mix(k,F,vf),1.);}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const pr = this.pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    this.loc = { p: gl.getAttribLocation(pr, 'p'), n: gl.getAttribLocation(pr, 'n'), c: gl.getAttribLocation(pr, 'c'), u: gl.getAttribLocation(pr, 'u'), M: gl.getUniformLocation(pr, 'M'), L: gl.getUniformLocation(pr, 'L'), T: gl.getUniformLocation(pr, 'T'), usaT: gl.getUniformLocation(pr, 'usaT'), F: gl.getUniformLocation(pr, 'F'), noche: gl.getUniformLocation(pr, 'noche'), nk: gl.getUniformLocation(pr, 'nk') };
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); this.din = gl.createBuffer(); return true;
  },
  /* una malla: arreglo plano de [x, h, y, nx, ny, nz, r, g, b, u, v] */
  subir(arr) { const gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW); return { b, n: arr.length / 11 }; },
  pintar(m, tex) {
    const gl = this.gl, L = this.loc, S = 44; gl.bindBuffer(gl.ARRAY_BUFFER, m.b);
    gl.enableVertexAttribArray(L.p); gl.vertexAttribPointer(L.p, 3, gl.FLOAT, false, S, 0); gl.enableVertexAttribArray(L.n); gl.vertexAttribPointer(L.n, 3, gl.FLOAT, false, S, 12);
    gl.enableVertexAttribArray(L.c); gl.vertexAttribPointer(L.c, 3, gl.FLOAT, false, S, 24); gl.enableVertexAttribArray(L.u); gl.vertexAttribPointer(L.u, 2, gl.FLOAT, false, S, 36);
    gl.uniform1f(L.usaT, tex ? 1 : 0); if (tex) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(L.T, 0); } gl.drawArrays(gl.TRIANGLES, 0, m.n);
  },
  rgb(h) { if (!h || h[0] !== '#') return [.7, .7, .7]; const n = parseInt(h.slice(1, 7), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; },
  /* caja orientada: centro (x, y), largo L, ancho W, alto h, base z0, rumbo a, color */
  caja(o, x, y, a, Lg, W, h, z0, col) {
    const c = Math.cos(a), s = Math.sin(a), P = [[-Lg / 2, -W / 2], [Lg / 2, -W / 2], [Lg / 2, W / 2], [-Lg / 2, W / 2]].map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
    this.prisma(o, P, z0, z0 + h, col, col);
  },
  /* 3.5 · una cara con su frente hacia la normal n (puntos [x, altura, y], como en prisma) */
  quad(o, a, b, c, d, n, col) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], t = (p, q, r) => { for (const k of [p, q, r]) o.push(k[0], k[1], k[2], n[0], n[1], n[2], col[0], col[1], col[2], 0, 0); };
    if ((uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2] >= 0) { t(a, b, c); t(a, c, d); } else { t(a, c, b); t(a, d, c); }
  },
  /* 3.5 · caja con ALABEO (this.lad) alrededor del eje de avance y el pivote en zp (el piso): la bici y el ciclista se inclinan
     hacia adentro de la curva, φ = atan(v·ω/g), como en Motor City 5.2 */
  cajaL(o, x, y, a, Lg, W, h, z0, col, zp) {
    const r = this.lad || 0; if (Math.abs(r) < .015) return this.caja(o, x, y, a, Lg, W, h, z0, col);
    const ca = Math.cos(a), sa = Math.sin(a), cr = Math.cos(r), sr = Math.sin(r), F = [ca, 0, sa], Sd = [-sa * cr, sr, ca * cr], U = [sa * sr, cr, -ca * sr];
    const P = (u, v, z) => [x + F[0] * u + Sd[0] * v + U[0] * (z - zp), zp + Sd[1] * v + U[1] * (z - zp), y + F[2] * u + Sd[2] * v + U[2] * (z - zp)], ng = n => n.map(t => -t);
    const u0 = -Lg / 2, u1 = Lg / 2, v0 = -W / 2, v1 = W / 2, za = z0, zb = z0 + h, c = [P(u0, v0, za), P(u1, v0, za), P(u1, v1, za), P(u0, v1, za), P(u0, v0, zb), P(u1, v0, zb), P(u1, v1, zb), P(u0, v1, zb)];
    this.quad(o, c[4], c[5], c[6], c[7], U, col); this.quad(o, c[0], c[1], c[2], c[3], ng(U), col); this.quad(o, c[1], c[2], c[6], c[5], F, col);
    this.quad(o, c[0], c[3], c[7], c[4], ng(F), col); this.quad(o, c[2], c[3], c[7], c[6], Sd, col); this.quad(o, c[0], c[1], c[5], c[4], ng(Sd), col);
  },
  /* prisma con base poligonal convexa P (sentido cualquiera): muros con su normal y techo */
  prisma(o, P, z0, z1, muro, techo, muro2, vent) {
    const n = P.length; let area = 0; for (let i = 0; i < n; i++) { const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % n]; area += x0 * y1 - x1 * y0; } const sg = area > 0 ? 1 : -1;
    for (let i = 0; i < n; i++) { const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % n], dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = dy / l * sg, ny = -dx / l * sg, col = muro2 && Math.abs(nx) > Math.abs(ny) ? muro2 : muro;
      const v = (x, y, z) => o.push(x, z, y, nx, 0, ny, col[0], col[1], col[2], vent ? 10 + Math.hypot(x - x0, y - y0) : 0, vent ? z : 0);
      if (sg > 0) { v(x0, y0, z0); v(x1, y1, z1); v(x1, y1, z0); v(x0, y0, z0); v(x0, y0, z1); v(x1, y1, z1); } else { v(x0, y0, z0); v(x1, y1, z0); v(x1, y1, z1); v(x0, y0, z0); v(x1, y1, z1); v(x0, y0, z1); } }
    for (let i = 1; i < n - 1; i++) { const t = [P[0], P[i], P[i + 1]]; if (sg < 0) t.reverse(); for (const [x, y] of t) o.push(x, z1, y, 0, 1, 0, techo[0], techo[1], techo[2], 0, 0); }
  },
  /* lo quieto de un trozo: piso con su textura (aparte), edificios y árboles */
  malla(cx, cy) {
    const k = cx + ',' + cy; let m = this.mallas.get(k); if (m) return m; const M = JE.map, S = CH * TS, o = [], A = this.ALT;
    for (const b of M.lotes(cx, cy).ed) { const p = b.pts; if (!p || p.length < 8) continue; const P = [[p[0], p[1]], [p[2], p[3]], [p[4], p[5]], [p[6], p[7]]], h = Math.max(4, (b.z || .08) * A);
      this.prisma(o, P, 0, h, this.rgb(b.wa), this.rgb(b.roof), this.rgb(b.wb), true); }
    const x0 = cx * CH, y0 = cy * CH;   /* árboles: la regla de las copas del pasto de la cenital (75-graficos.js) */
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) { if (M.get(x, y) !== TT.GRASS || h2(x, y, 5) >= .3 || (M.lid && M.lid.has(M.idx(x, y)))) continue;
      const X = x * TS + TS * (.3 + h2(x, y, 7) * .4), Y = y * TS + TS * (.3 + h2(x, y, 8) * .4), r = (.36 + (h2(x, y, 5) < .1 ? .14 : 0)) * TS, kk = h2(x, y, 6), col = this.rgb(kk < .05 ? '#f2c230' : kk < .09 ? '#e88ab8' : '#3f8a3f');
      this.caja(o, X, Y, 0, 1.4, 1.4, r * .9, 0, [.42, .3, .2]); const hex = []; for (let i = 0; i < 6; i++) hex.push([X + Math.cos(i * TAU / 6) * r, Y + Math.sin(i * TAU / 6) * r]); this.prisma(o, hex, r * .8, r * 2.1, col.map(v => v * .82), col); }
    if (this.extraMalla) try { this.extraMalla(o, cx, cy); } catch (e) { JE.errors.push('3d malla: ' + e.message); }   /* 3.2: el viaducto, los puentes y las estaciones (99f) */
    const piso = [], q = (x, y, u, v) => piso.push(x, 0, y, 0, 1, 0, 1, 1, 1, u, v), X0 = cx * S, Y0 = cy * S; q(X0, Y0, 0, 0); q(X0, Y0 + S, 0, 1); q(X0 + S, Y0 + S, 1, 1); q(X0, Y0, 0, 0); q(X0 + S, Y0 + S, 1, 1); q(X0 + S, Y0, 1, 0);
    m = { cosas: o.length ? this.subir(o) : null, piso: this.subir(piso) }; this.mallas.set(k, m);
    if (this.mallas.size > 60) { const [kk, mm] = this.mallas.entries().next().value; this.mallas.delete(kk); for (const x of [mm.cosas, mm.piso]) if (x) this.gl.deleteBuffer(x.b); }
    return m;
  },
  textura(cx, cy) {
    const k = cx + ',' + cy; let t = this.tex.get(k); if (t) { this.tex.delete(k); this.tex.set(k, t); return t; } const M = JE.map; if (!M.hasG(cx, cy) && this._nuevas-- <= 0) return null;   /* a lo sumo 1 trozo nuevo por cuadro (sin tirones) */
    const gl = this.gl, src = M.chunkG(cx, cy); t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.tex.set(k, t); if (this.tex.size > 40) { const [kk, tt] = this.tex.entries().next().value; this.tex.delete(kk); gl.deleteTexture(tt); } return t;
  },
  /* ---------- la cámara ---------- */
  camara(R, W, Hh) {
    const P = R.p, ten = this.modo === 'primera'; let d = P.a - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); this.yaw += d * Math.min(1, (this._dt || .016) * (ten ? 9 : 4));
    const fx = Math.cos(this.yaw), fy = Math.sin(this.yaw);
    /* la cámara de tercera persona no se mete en los edificios: se acerca y sube si hay uno detrás (como las buenas cámaras de seguimiento) */
    let D = 46; if (!ten) for (let k = 6; k <= 46; k += 4) { const t = JE.map.get(Math.floor((P.x - fx * k) / TS), Math.floor((P.y - fy * k) / TS)); if (t === TT.BLDG || t === TT.MOUNT) { D = Math.max(10, k - 6); break; } }
    this.D = (this.D || D) + (D - (this.D || D)) * Math.min(1, (this._dt || .016) * (D < (this.D || D) ? 12 : 3)); const Dd = this.D;
    const eye = ten ? [P.x + fx * 1.2, 2.7, P.y + fy * 1.2] : [P.x - fx * Dd, 30 + (46 - Dd) * .9, P.y - fy * Dd], at = ten ? [P.x + fx * 40, 2.2, P.y + fy * 40] : [P.x + fx * 22, 3, P.y + fy * 22];
    const proj = this.persp(ten ? 1.15 : 1.0, W / Hh, ten ? .5 : 2, 2600), view = this.mirar(eye, at); this.vp = this.mul(proj, view); this.eye = eye; this.W = W; this.Hh = Hh;
  },
  persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; },
  mirar(e, a) { let z = [e[0] - a[0], e[1] - a[1], e[2] - a[2]]; const zl = Math.hypot(...z); z = z.map(v => v / zl); let x = [z[2], 0, -z[0]]; const xl = Math.hypot(...x) || 1; x = x.map(v => v / xl); const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]), -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]), -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]), 1]; },
  mul(a, b) { const o = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return o; },
  /* del mundo (px, y altura) a la pantalla (px CSS); null si queda detrás */
  pantalla(x, y, h = 0) { const m = this.vp; if (!m) return null; const X = m[0] * x + m[4] * h + m[8] * y + m[12], Y = m[1] * x + m[5] * h + m[9] * y + m[13], Wc = m[3] * x + m[7] * h + m[11] * y + m[15]; if (Wc < .5) return null; return { x: (X / Wc * .5 + .5) * this.W, y: (1 - (Y / Wc * .5 + .5)) * this.Hh }; },
  /* ---------- el cuadro ---------- */
  dibujar(R) {
    if (!this.iniciar()) { this.modo = null; return; } const gl = this.gl, cv = this.cv, V = View, k = Math.min(window.devicePixelRatio || 1, 1.5) * (V.calidad || 1), W = V.w, Hh = V.h;
    if (cv.width !== Math.round(W * k) || cv.height !== Math.round(Hh * k)) { cv.width = Math.round(W * k); cv.height = Math.round(Hh * k); } cv.hidden = false; gl.viewport(0, 0, cv.width, cv.height);
    const t = performance.now(); this._dt = this._t0 ? Math.min(.1, (t - this._t0) / 1000) : .016; this._t0 = t; this._nuevas = 1;
    this.camara(R, W, Hh); const L = this.loc, min = R.min || (R.mode && R.mode.clock) || 600, cie = Art.sky(min), F = this.rgb(cie[1]), noche = Art.night(min);
    gl.clearColor(...this.rgb(cie[0]).map(v => v * .5 + F[0] * 0), 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /* el cielo: degradado del color de arriba al del horizonte (dos triángulos que tapan la pantalla, sin profundidad) */
    gl.uniformMatrix4fv(L.M, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); gl.uniform3fv(L.F, F); gl.uniform1f(L.noche, 0); gl.uniform1f(L.nk, 1); gl.uniform3fv(L.L, [0, 1, 0]); gl.disable(gl.DEPTH_TEST);
    const top = this.rgb(cie[0]), cielo = []; const sv = (x, y, c) => cielo.push(x, y, .999, 0, 1, 0, c[0], c[1], c[2], 0, 0); sv(-1, -1, F); sv(1, -1, F); sv(1, 1, top); sv(-1, -1, F); sv(1, 1, top); sv(-1, 1, top);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.din); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cielo), gl.DYNAMIC_DRAW); this.pintar({ b: this.din, n: 6 }); gl.enable(gl.DEPTH_TEST);
    gl.uniformMatrix4fv(L.M, false, this.vp); gl.uniform3fv(L.F, F); gl.uniform1f(L.noche, noche); gl.uniform3fv(L.L, [-.45, .75, -.5]); gl.uniform1f(L.nk, this.mirador ? 2.6 : 1);   /* 3.2: desde un mirador la niebla se aleja */
    const S = CH * TS, P = R.p, rad = this.mirador ? 3 : 2, ccx = Math.floor(P.x / S), ccy = Math.floor(P.y / S), fx = Math.cos(this.yaw), fy = Math.sin(this.yaw), lista = [];
    for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) { const cx = ccx + dx, cy = ccy + dy; if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) continue; const mx = (cx + .5) * S - P.x, my = (cy + .5) * S - P.y; if (mx * fx + my * fy < -S * 1.1) continue; lista.push([mx * mx + my * my, cx, cy]); }
    lista.sort((a, b) => a[0] - b[0]);
    for (const [, cx, cy] of lista) { const m = this.malla(cx, cy), T = this.textura(cx, cy); if (T) this.pintar(m.piso, T); if (m.cosas) this.pintar(m.cosas); }
    if (this.extraFijo) try { this.extraFijo(R); } catch (e) { JE.errors.push('3d fijo: ' + e.message); }   /* 3.2: los cables con sus torres y estaciones (99f) */
    /* lo que se mueve: carros, gente y el ciclista */
    const o = []; for (const c of R.cars || []) { if (Math.abs(c.x - P.x) > 700 || Math.abs(c.y - P.y) > 700) continue; const col = this.rgb(c.col || '#c43a26'), Lg = c.kind === 'bus' ? 19 : c.kind === 'bici' ? 3 : 7, Wd = c.kind === 'bus' ? 4 : c.kind === 'bici' ? 1 : 3.1, h = c.kind === 'bus' ? 5 : c.kind === 'bici' ? 2.7 : 2.4, z0 = c.arriba ? (c.z || 0) * this.ZA : 0;
      this.caja(o, c.x, c.y, c.ang, Lg, Wd, h * .55, z0, col); this.caja(o, c.x - Math.cos(c.ang) * Lg * .08, c.y - Math.sin(c.ang) * Lg * .08, c.ang, Lg * .58, Wd * .9, h * .42, z0 + h * .55, col.map(v => v * .55)); }
    for (const q of R.peds || []) { if (Math.abs(q.x - P.x) > 400 || Math.abs(q.y - P.y) > 400) continue; this.caja(o, q.x, q.y, 0, .9, .9, 2.8, 0, this.rgb(q.col)); }
    const me = Art.me(), v = P.veh, alto = (P.lvl > 0 ? (P.z || 0) : 0) * this.ZA, ca = P.a;
    { const S0 = R.stats_(), veq = clamp(P.v / Math.max(1, S0.max), 0, 1.2) * 7, obj = v === 'walk' || v === 'truck' ? 0 : clamp(-Math.atan(veq * (P.w || 0) / 9.81) * 1.8, -.65, .65); this.lad = (this.lad || 0) + (obj - (this.lad || 0)) * Math.min(1, (this._dt || .016) * 12); }   /* 3.6 GPT-6: ángulo físico escalado 1.8x SOLO visualmente para legibilidad móvil; suavizado más responsivo sin cambiar física ni choque */
    if (v === 'truck') { this.caja(o, P.x, P.y, ca, 12, 4, 4.5, alto, this.rgb('#9bd341')); this.caja(o, P.x + Math.cos(ca) * 4.6, P.y + Math.sin(ca) * 4.6, ca, 3, 3.8, 3, alto + 4.5, this.rgb('#e9eef3')); }
    else { if (v !== 'walk') { this.cajaL(o, P.x, P.y, ca, 3, .35, 1.6, alto, [.1, .1, .12], alto); this.cajaL(o, P.x, P.y, ca, 2.4, .3, .5, alto + 1.4, this.rgb(PAL.vd), alto); }
      const z1 = alto + (v === 'walk' ? 0 : 1.6); this.cajaL(o, P.x, P.y, ca, .9, .9, 1.5, z1, this.rgb(me.pants || '#2a3b5c'), alto); this.cajaL(o, P.x, P.y, ca, 1.1, 1.3, 1.6, z1 + 1.5, this.rgb(me.shirt || PAL.vd), alto); this.cajaL(o, P.x, P.y, ca, .8, .8, .8, z1 + 3.1, this.rgb(me.cap || '#ffffff'), alto); }
    if (this.extraMovil) try { this.extraMovil(o, R); } catch (e) { JE.errors.push('3d móvil: ' + e.message); }   /* 3.2: trenes, tranvía, Metroplús y cabinas (99f) */
    if (o.length) { gl.bindBuffer(gl.ARRAY_BUFFER, this.din); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(o), gl.DYNAMIC_DRAW); this.pintar({ b: this.din, n: o.length / 11 }); }
  }
};
(function () {
  /* la cenital 2D no se dibuja cuando la vista es 3D (el lienzo 2D queda transparente para el HUD) */
  const _render = Ride.prototype.render;
  Ride.prototype.render = function (V, min) {
    if (!Mundo3D.activo(this)) { if (Mundo3D.cv && !Mundo3D.cv.hidden) Mundo3D.cv.hidden = true; return _render.call(this, V, min); }
    this.min = min; const b = V.b; b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, V.buf.width, V.buf.height); const c = V.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, V.cv.width, V.cv.height); this.cxf = this.p.x - V.vw / 2; this.cyf = this.p.y - V.vh / 2; this.piv = { x: V.vw / 2, y: V.vh / 2, G: 0 };
  };
  const _top = Ride.prototype.renderTop;
  Ride.prototype.renderTop = function (V) { if (!Mundo3D.activo(this)) return _top.call(this, V); try { Mundo3D.dibujar(this); } catch (e) { JE.errors.push('3d: ' + e.message); Mundo3D.poner(null); } };
  /* nombres, flecha y avisos con la cámara 3D */
  const _w2s = Ride.prototype.w2s;
  Ride.prototype.w2s = function (x, y) { if (!Mundo3D.activo(this) || !Mundo3D.vp) return _w2s.call(this, x, y); const q = Mundo3D.pantalla(x, y, 6); return q || { x: -9999, y: -9999 }; };
  /* el joystick según la cámara: arriba es adelante */
  const _gd = Ride.prototype.girarDir;
  Ride.prototype.girarDir = function (d) { if (!Mundo3D.activo(this) || !d || !d.m) return _gd.call(this, d); const y = Mundo3D.yaw, fx = Math.cos(y), fy = Math.sin(y); return { x: d.x * -fy + -d.y * fx, y: d.x * fx + -d.y * fy, m: d.m }; };
  /* el botón «3D» en la barra de la izquierda: cenital → tercera → primera → cenital */
  const _tick = Cam.tick;
  Cam.tick = function (R, dt) { const r = _tick.apply(this, arguments); const bar = $('#camBar'); if (bar && !bar.querySelector('#b3D')) { const b = document.createElement('button'); b.id = 'b3D'; b.setAttribute('aria-label', 'Vista 3D: tercera y primera persona'); b.textContent = Mundo3D.modo === 'tercera' ? '🧍' : Mundo3D.modo === 'primera' ? '👁️' : '3D'; b.onclick = e => { e.stopPropagation(); Snd.sfx('tap'); Mundo3D.ciclo(); }; bar.append(b); } return r; };
  const _key = Game.key; Game.key = function (e) { if (e.code === 'KeyY' && this.mode && this.mode.ride && !this.mode.sub) { Mundo3D.ciclo(); return; } return _key.call(this, e); };
  for (const k of ['stop', 'finish']) { const f = Game[k]; Game[k] = function () { if (Mundo3D.cv) Mundo3D.cv.hidden = true; return f.apply(this, arguments); }; }
})();
