/* =====================================================================
   VISTA 3D EN PERSPECTIVA (WebGL 1, sin librerías) · primera y tercera persona, dron y cine
   Parte del G3 de El Metro (WebGL como mejora, con respaldo en Canvas 2D):
   - Relieve real (malla de 20 m cerca, 240 m lejos: las montañas que rodean el valle) con el suelo pintado
     por las MISMAS losas de las vistas 2D (es el mismo mapa).
   - Edificios reales levantados con su huella y su altura, colores de su zona y ventanas que se encienden de noche;
     sitios y partes de los emblemáticos; puentes y viaducto a su nivel con sus pilas; árboles por zona.
   - Personaje (la misma pose de todas las vistas), vehículos, trenes, cabinas, tráfico y gente.
   - Luz del sol según la hora, cielo, niebla según el clima y la calidad; detalle por distancia (LOD).
   Coordenadas GL: x = oriente, y = arriba, z = sur (metros), relativas a un origen O para no perder precisión.
   ===================================================================== */
const M4 = {
  persp(o, fy, asp, n, f) { const t = 1 / Math.tan(fy / 2), nf = 1 / (n - f); o.fill(0); o[0] = t / asp; o[5] = t; o[10] = (f + n) * nf; o[11] = -1; o[14] = 2 * f * n * nf; return o; },
  mirar(o, e, c, u = [0, 1, 0]) {
    let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
    let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx; l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0; o[4] = xy; o[5] = yy; o[6] = zy; o[7] = 0; o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
    o[12] = -(xx * e[0] + xy * e[1] + xz * e[2]); o[13] = -(yx * e[0] + yy * e[1] + yz * e[2]); o[14] = -(zx * e[0] + zy * e[1] + zz * e[2]); o[15] = 1; return o;
  },
  mul(o, a, b) { const t = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) t[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; o.set(t); return o; }
};
/* constructor de mallas: x, y, z, nx, ny, nz, r, g, b, e (emisivo) */
class Malla {
  constructor() { this.d = []; }
  tri(a, b, c, col, e = 0) { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2]; let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l; for (const p of [a, b, c]) this.d.push(p[0], p[1], p[2], nx, ny, nz, col[0], col[1], col[2], e); }
  quad(a, b, c, d, col, e) { this.tri(a, b, c, col, e); this.tri(a, c, d, col, e); }
  /* prisma: polígono P (metros del mundo, relativos a O) de y0 a y1, con techo plano o a dos aguas */
  prisma(P, O, y0, y1, muro, techo, op = {}) {
    const n = P.length >> 1; if (n < 3) return; const V = []; let A = 0;
    for (let i = 0; i < n; i++) V.push([P[2 * i] - O[0], P[2 * i + 1] - O[1]]);
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; A += V[i][0] * V[j][1] - V[j][0] * V[i][1]; }
    const cw = A > 0;   // en GL z = sur: un polígono «antihorario» del mapa se ve horario desde arriba
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, a = V[i], b = V[j], p0 = [a[0], y0, a[1]], p1 = [b[0], y0, b[1]], p2 = [b[0], y1, b[1]], p3 = [a[0], y1, a[1]]; if (cw) this.quad(p0, p3, p2, p1, muro); else this.quad(p0, p1, p2, p3, muro);
      if (op.ventanas && y1 - y0 > 5) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), cols = Math.min(8, Math.floor(L / 3.4)), pisos = Math.min(20, Math.floor((y1 - y0 - 1) / 3)); if (cols > 0) { const nx = (b[1] - a[1]) / L * (cw ? -1 : 1) * .06, nz = -(b[0] - a[0]) / L * (cw ? -1 : 1) * .06; for (let p = 0; p < pisos; p++) for (let q = 0; q < cols; q++) { if (h2(op.ventanas + i * 31 + q, p, 5) > .35) continue; const u0 = (q + .3) / cols, u1 = (q + .7) / cols, yA = y0 + 1.2 + p * 3, yB = yA + 1.3, x0 = a[0] + (b[0] - a[0]) * u0 + nx, z0 = a[1] + (b[1] - a[1]) * u0 + nz, x1 = a[0] + (b[0] - a[0]) * u1 + nx, z1 = a[1] + (b[1] - a[1]) * u1 + nz; const w = [x0, yA, z0], x = [x1, yA, z1], yy = [x1, yB, z1], zz = [x0, yB, z0]; if (cw) this.quad(w, zz, yy, x, [1, .84, .5], 1); else this.quad(w, x, yy, zz, [1, .84, .5], 1); } } }
    }
    /* techo: abanico (los polígonos de huella son casi convexos) o a dos aguas en casas rectangulares */
    if (op.dosAguas && n === 4) { const c = op.dosAguas, h = Math.min(2.4, c.ancho * .45), m = [(V[0][0] + V[1][0]) / 2, y1 + h, (V[0][1] + V[1][1]) / 2], m2 = [(V[2][0] + V[3][0]) / 2, y1 + h, (V[2][1] + V[3][1]) / 2], p = V.map(v => [v[0], y1, v[1]]); if (cw) { this.quad(p[0], m, m2, p[3], techo); this.quad(p[2], m2, m, p[1], techo); this.tri(p[0], p[1], m, muro); this.tri(p[2], p[3], m2, muro); } else { this.quad(p[0], p[3], m2, m, techo); this.quad(p[2], p[1], m, m2, techo); this.tri(p[0], m, p[1], muro); this.tri(p[2], m2, p[3], muro); } return; }
    const top = V.map(v => [v[0], y1, v[1]]); for (let i = 1; i < n - 1; i++) { if (cw) this.tri(top[0], top[i + 1], top[i], techo); else this.tri(top[0], top[i], top[i + 1], techo); }
  }
  /* caja orientada: centro (x, y, z), largo en el rumbo a, ancho y alto */
  caja(x, y, z, a, L, W, Hh, col, e = 0) { const c = Math.cos(a), s = Math.sin(a), hx = L / 2, hz = W / 2, P = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]].map(([u, v]) => [x + u * c - v * s, z + u * s + v * c]), b = P.map(p => [p[0], y, p[1]]), t = P.map(p => [p[0], y + Hh, p[1]]); for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; this.quad(b[i], b[j], t[j], t[i], col, e); } this.quad(t[0], t[1], t[2], t[3], col, e); }
  /* segmento grueso entre dos puntos (huesos del personaje, tubos de la bici) */
  hueso(p, q, r, col) { const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2], L = Math.hypot(dx, dy, dz) || 1e-6; let ax = 0, ay = 1, az = 0; if (Math.abs(dy / L) > .9) { ax = 1; ay = 0; } let ux = dy * az - dz * ay, uy = dz * ax - dx * az, uz = dx * ay - dy * ax, l = Math.hypot(ux, uy, uz) || 1; ux = ux / l * r; uy = uy / l * r; uz = uz / l * r; let vx = (dy * uz - dz * uy) / L, vy = (dz * ux - dx * uz) / L, vz = (dx * uy - dy * ux) / L; const A = [], B = []; for (const [i, j] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) { A.push([p[0] + ux * i + vx * j, p[1] + uy * i + vy * j, p[2] + uz * i + vz * j]); B.push([q[0] + ux * i + vx * j, q[1] + uy * i + vy * j, q[2] + uz * i + vz * j]); } for (let k = 0; k < 4; k++) { const m = (k + 1) % 4; this.quad(A[k], A[m], B[m], B[k], col); } }
}
/* Proyección económica de sombras sobre el terreno, sin shadow maps ni texturas.
   Se construye una sola malla para los objetos cercanos, reutilizable por celda de cámara y posición solar.
   Las sombras solo afectan al plano del suelo, con profundidad y mezcla alfa; NO se pintan sobre las fachadas. */
const Sombras3D = {
  generar(M, O, sol, cx, cy, op = {}) {
    if (!sol || sol.z < .16 || !M || typeof M.cota !== 'function') return [];
    const radio = op.radio || 115, m = new Malla();
    const k = Math.min(2.7, 1 / Math.max(sol.z, .32));
    const elev = (x, y) => M.cota(x, y) - O[2] + .12;
    const desplazamiento = altura => {
      const alcance = Math.min(25, altura * k * Math.hypot(sol.x, sol.y));
      const norm = Math.hypot(sol.x, sol.y) || 1;
      return [-sol.x / norm * alcance, -sol.y / norm * alcance];
    };
    const color = [.055, .075, .065];
    const edificaciones = op.edificios || M.edificiosEn(cx - radio, cy - radio, cx + radio, cy + radio);
    let edificios = 0;
    for (const e of edificaciones) {
      if (edificios >= 65) break;
      if (!e || !Number.isFinite(e.x) || !Number.isFinite(e.y) || !Number.isFinite(e.h) ||
          Math.hypot(e.x - cx, e.y - cy) > radio || e.h < 3) continue;
      const P = op.esquinas ? op.esquinas(e) : Mundo.esquinas(e), n = P.length / 2;
      if (n < 3 || n > 16) continue;
      const [dx, dy] = desplazamiento(Math.min(e.h, 22));
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, ax = P[i * 2], ay = P[i * 2 + 1], bx = P[j * 2], by = P[j * 2 + 1];
        if (![ax, ay, bx, by].every(Number.isFinite)) continue;
        m.quad([ax - O[0], elev(ax, ay), ay - O[1]],
          [bx - O[0], elev(bx, by), by - O[1]],
          [bx + dx - O[0], elev(bx + dx, by + dy), by + dy - O[1]],
          [ax + dx - O[0], elev(ax + dx, ay + dy), ay + dy - O[1]], color);
      }
      edificios++;
    }
    const arboles = op.arboles || Arboleda.en(M, cx - radio, cy - radio, cx + radio, cy + radio, 100);
    let arbolesDibujados = 0;
    for (const t of arboles) {
      if (arbolesDibujados >= 80 || !t || !Number.isFinite(t.x) || !Number.isFinite(t.y) || !Number.isFinite(t.h)) continue;
      if (Math.hypot(t.x - cx, t.y - cy) > radio) continue;
      const [dx,dy] = desplazamiento(t.h * .72), x = t.x + dx, y = t.y + dy, rx = Math.max(.5, t.r * .86), ry = rx * .75;
      const center = [x - O[0], elev(x, y), y - O[1]];
      for(let i = 0;i < 8;i++) {
        const a = i * Math.PI/4, b=(i+1)*Math.PI/4;
        const pa = [x + Math.cos(a)*rx, y + Math.sin(a)*ry], pb=[x + Math.cos(b)*rx,y + Math.sin(b)*ry];
        m.tri(center,[pa[0]-O[0],elev(...pa),pa[1]-O[1]],[pb[0]-O[0],elev(...pb),pb[1]-O[1]],color);
      }
      arbolesDibujados++;
    }
    return m.d;
  }
};
const VS = 'attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;attribute float aE;uniform mat4 uM;uniform vec3 uL;uniform float uAmb;uniform float uSol;uniform vec3 uO;uniform float uNoche;varying vec3 vC;varying float vD;uniform float uCurv;void main(){float d=max(dot(normalize(aN),uL),0.);vec3 c=aC*(uAmb+uSol*d);vC=mix(c,aC*(0.55+0.6*uNoche),aE*uNoche)+aE*uNoche*vec3(0.25,0.18,0.05);vD=length(aP-uO);vec3 pc=aP;vec2 dd=aP.xz-uO.xz;pc.y-=dot(dd,dd)*uCurv;gl_Position=uM*vec4(pc,1.);}';
const VT = 'attribute vec3 aP;attribute vec3 aN;attribute vec2 aT;uniform mat4 uM;uniform vec3 uL;uniform float uAmb;uniform float uSol;uniform vec3 uO;varying vec2 vT;varying float vL;varying float vD;uniform float uCurv;void main(){vL=uAmb+uSol*max(dot(normalize(aN),uL),0.);vT=aT;vD=length(aP-uO);vec3 pc=aP;vec2 dd=aP.xz-uO.xz;pc.y-=dot(dd,dd)*uCurv;gl_Position=uM*vec4(pc,1.);}';
const FS = 'precision mediump float;uniform vec3 uF;uniform vec2 uFR;varying vec3 vC;varying float vD;void main(){float f=clamp((vD-uFR.x)/(uFR.y-uFR.x),0.,1.);gl_FragColor=vec4(mix(vC,uF,f),1.);}';
const FT = 'precision mediump float;uniform sampler2D uS;uniform vec3 uF;uniform vec2 uFR;varying vec2 vT;varying float vL;varying float vD;void main(){float f=clamp((vD-uFR.x)/(uFR.y-uFR.x),0.,1.);gl_FragColor=vec4(mix(texture2D(uS,vT).rgb*vL,uF,f),1.);}';
const FSH = 'precision mediump float;varying vec3 vC;uniform float uAlpha;void main(){gl_FragColor=vec4(vC,uAlpha);}';
const FC = 'precision mediump float;varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.);}';
const VC = 'attribute vec2 aP;attribute vec3 aC;varying vec3 vC;void main(){vC=aC;gl_Position=vec4(aP,0.999,1.);}';
class VistaGL {
  constructor(mundo, losas) {
    this.mundo = mundo; this.losas = losas; this.cv = lienzo(4, 4); this.ok = false; this.regiones = new Map(); this.O = null; this.R = 160; this.cola = [];
    try { this.gl = this.cv && this.cv.getContext && (this.cv.getContext('webgl', { antialias: true, alpha: false }) || this.cv.getContext('experimental-webgl')); } catch (e) { this.gl = null; }
    if (!this.gl) return; const gl = this.gl;
    const prog = (v, f) => { const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }; const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); const u = {}, a = {}; const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS), na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); for (let i = 0; i < nu; i++) { const n = gl.getActiveUniform(p, i).name; u[n] = gl.getUniformLocation(p, n); } for (let i = 0; i < na; i++) { const n = gl.getActiveAttrib(p, i).name; a[n] = gl.getAttribLocation(p, n); } return { p, u, a }; };
    try { this.pC = prog(VS, FS); this.pT = prog(VT, FT); this.pS = prog(VC, FC); this.pSh = prog(VS, FSH); this.ok = true; } catch (e) { MC.falla('WebGL', e); this.ok = false; }
    this.dyn = gl.createBuffer(); this.cielo = gl.createBuffer(); this.bufSombras = gl.createBuffer(); this._sombrasCache = null; this.aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  }
  _vbo(arr) { const gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW); return { b, n: arr.length }; }
  liberar() { const gl = this.gl; for (const r of this.regiones.values()) this._borrar(r); this.regiones.clear(); this._sombrasCache = null; if (this.lejos) { for (const b of this.lejos) gl.deleteBuffer(b.b); this.lejos = null; } }
  _borrar(r) { const gl = this.gl; if (r.suelo) gl.deleteBuffer(r.suelo.b); if (r.cosas) gl.deleteBuffer(r.cosas.b); if (r.tex) gl.deleteTexture(r.tex); }
  /* relieve lejano: bloques de 8 × 8 celdas de 240 m con colores por suelo (las montañas que rodean el valle) */
  _lejos() {
    const M = this.mundo, st = 240, O = this.O, B = [], Sx = Math.ceil(M.ancho / st), Sy = Math.ceil(M.alto / st), S = MC.arte.dato('suelo', PAL_SUELO);
    const col = (x, y) => { const t = M.suelo(x, y); let c = hex3(TT_URBANO.has(t) ? '#a8998a' : t === TT.WATER ? '#4f9fd0' : t === TT.MOUNT ? '#3f6e3a' : S[t] || '#5e8c4a'); return c; };
    for (let by = 0; by < Sy; by += 8) for (let bx = 0; bx < Sx; bx += 8) {
      const m = new Malla(); for (let j = by; j < Math.min(Sy, by + 8); j++) for (let i = bx; i < Math.min(Sx, bx + 8); i++) {
        const P = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([u, v]) => [u * st - O[0], M.cota(u * st, v * st) - O[2] - 14, v * st - O[1]]), c = col((i + .5) * st, (j + .5) * st); m.quad(P[0], P[3], P[2], P[1], c);
      }
      B.push(Object.assign(this._vbo(m.d), { cx: (bx + 4) * st, cy: (by + 4) * st }));
    }
    this.lejos = B;
  }
  /* una región de 160 m: suelo con textura de la losa y las cosas con volumen */
  _region(gx, gy, detalle) {
    const M = this.mundo, gl = this.gl, R = this.R, O = this.O, x0 = gx * R, y0 = gy * R, n = 8, st = R / n, suelo = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const P = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([u, v]) => { const x = x0 + u * st, y = y0 + v * st, nn = M.normal(x, y, 10); return [x - O[0], M.cota(x, y) - O[2], y - O[1], nn[0], nn[1], nn[2], u / n, v / n]; }); for (const q of [P[0], P[2], P[1], P[0], P[3], P[2]]) suelo.push(...q); }
    /* texturas de lado potencia de 2 (512, 256 o 128 px por losa de 160 m) para tener mipmaps y filtro anisótropo: el piso se ve nítido a lo lejos */
    const res = (detalle > 3 ? 1024 : detalle > 2 ? 512 : detalle > 1 ? 256 : 128) / R, L = this.losas.losa(gx, gy, res, false, 3), tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    if (L) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, L); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([94, 140, 74]));
    const pot = L && (L.width & (L.width - 1)) === 0; if (pot) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, pot ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (pot && this.aniso) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const m = new Malla(), minH = detalle >= 2 ? 0 : detalle === 1 ? 10 : 24;
    for (const e of M.edificiosEn(x0, y0, x0 + R, y0 + R)) { if (e.x < x0 || e.x >= x0 + R || e.y < y0 || e.y >= y0 + R || e.h < minH) continue; const st2 = estiloEdificio(M, e), P = Mundo.esquinas(e); let zb = 1e9; for (let i = 0; i < P.length; i += 2) zb = Math.min(zb, M.cota(P[i], P[i + 1])); zb -= O[2] + .3; m.edificio3d(P, O, zb, e, st2, detalle, M.estilo(e.x, e.y)); }   /* 3.0: con fachada (js/45b-mundo3d.js) */
    for (const q of M.sitios().E) { if (q.x < x0 || q.x >= x0 + R || q.y < y0 || q.y >= y0 + R) continue; const zb = M.cota(q.x, q.y) - O[2] - .3, mu = hex3(q.clase === 'iglesia' ? '#efe8d8' : '#d9d4c9'), te = hex3(q.techo === 'dos' || q.techo === 'cuatro' ? '#b5542f' : '#bdbcb6'); const h0 = q.partes ? Math.max(3, q.partes[0].z0) : q.h; m.prisma(q.R[0], O, zb, zb + h0, mu, te, { ventanas: detalle >= 2 ? 7 : 0 }); if (q.partes) for (const p of q.partes) m.prisma(p.B, O, zb + p.z0, zb + p.z1, mu, p.techo === 'aguja' ? hex3('#e3e6ea') : te); }
    for (const P of M.pasosEn(x0, y0, x0 + R, y0 + R)) { if (P.nivel <= 0) continue; const T = P.trazo || (P.trazo = new Trazo(P.p)), vi = P.tipo === 'viaducto', rampa = vi ? 0 : Math.min(P.largo * .4, P.peatonal ? 9 : 22), h = s => P.nivel * NIVEL_M * (vi ? 1 : suave(Math.min(s, P.largo - s) / rampa)), paso = 6;
      for (let s = 0; s < P.largo; s += paso) { const a = T.at(s), b = T.at(Math.min(P.largo, s + paso)); if (a.x < x0 || a.x >= x0 + R || a.y < y0 || a.y >= y0 + R) continue; const ha = M.cota(a.x, a.y) + h(s) - O[2], hb = M.cota(b.x, b.y) + h(Math.min(P.largo, s + paso)) - O[2], w = P.ancho / 2, nx = -Math.sin(a.a) * w, ny = Math.cos(a.a) * w, A = [a.x - O[0], a.y - O[1]], Bq = [b.x - O[0], b.y - O[1]], c = hex3(vi ? '#c9cfd8' : P.peatonal ? '#d8cfbd' : '#6a6f79'); m.quad([A[0] + nx, ha, A[1] + ny], [Bq[0] + nx, hb, Bq[1] + ny], [Bq[0] - nx, hb, Bq[1] - ny], [A[0] - nx, ha, A[1] - ny], c); m.quad([A[0] - nx, ha - 1, A[1] - ny], [A[0] - nx, ha, A[1] - ny], [Bq[0] - nx, hb, Bq[1] - ny], [Bq[0] - nx, hb - 1, Bq[1] - ny], hex3('#8e8a80')); m.quad([A[0] + nx, ha - 1, A[1] + ny], [Bq[0] + nx, hb - 1, Bq[1] + ny], [Bq[0] + nx, hb, Bq[1] + ny], [A[0] + nx, ha, A[1] + ny], hex3('#8e8a80'));
        if ((s % (vi ? 30 : 24)) < paso && h(s) > 3) m.caja(A[0], M.cota(a.x, a.y) - O[2], A[1], a.a, 1.4, vi ? 2.2 : 1, h(s) - 1, hex3('#9aa3ad')); } }
    /* 3.0: los MISMOS árboles de las vistas 2D (MC.Arboleda), low-poly y por especie */
    if (detalle >= 1) for (const t of Arboleda.en(M, x0, y0, x0 + R, y0 + R, 3000)) { if (t.x < x0 || t.x >= x0 + R || t.y < y0 || t.y >= y0 + R) continue; m.arbol3d(t.x - O[0], M.cota(t.x, t.y) - O[2] - .1, t.y - O[1], t, detalle); }
    if (false) for (let y = Math.ceil(y0 / 9) * 9; y < y0 + R; y += 9) for (let x = Math.ceil(x0 / 9) * 9; x < x0 + R; x += 9) { const tt = M.suelo(x, y); if (tt !== TT.GRASS && tt !== TT.MOUNT && tt !== TT.PLAZA) continue; const hv = h2(x, y, 41), Z = M.estilo(x, y); if (hv > (tt === TT.MOUNT ? .45 : (Z.arboles || .4) * .5)) continue; const tx = x + h2(x, y, 42) * 6 - O[0], ty = y + h2(x, y, 43) * 6 - O[1], zb = M.cota(x, y) - O[2], r = 2 + h2(x, y, 44) * 2.4, c = hex3(['#3f8a3f', '#4a9444', '#357a38', '#5a9e48'][(hv * 40 | 0) % 4]); m.caja(tx, zb, ty, 0, .5, .5, r, hex3('#6e4a2a')); m.caja(tx, zb + r * .8, ty, hv * 6, r * 1.7, r * 1.7, r * 1.5, c); }
    return { gx, gy, suelo: this._vbo(suelo), tex, cosas: m.d.length ? this._vbo(m.d) : null, detalle };
  }
  /* las cosas que se mueven, en una sola malla por cuadro */
  _dinamico(E) {
    const m = new Malla(), M = this.mundo, O = this.O, rel = (x, y, z) => [x - O[0], z - O[2], y - O[1]];
    const pj = E.jugador; if (pj && !E._sinJugador) { const C = pj.cuerpo, A = pj.aspecto, zb = M.cota(C.x, C.y) + C.zPaso + C.z, J = Personaje.pose(C.estado || 'quieto', C.fase, { alto: A.alto, manubrio: C.veh.manubrio }), ca = Math.cos(C.a), sa = Math.sin(C.a), P = j => rel(C.x + ca * j[0], C.y + sa * j[0], zb + j[1]), Lp = (j, l) => { const p = P(j); return [p[0] - sa * l, p[1], p[2] + ca * l]; };
      const piel = hex3(A.cPiel), cam = hex3(A.cCamisa), pan = hex3(A.cPantalon);
      if (C.veh.clase !== 'pie') { const V = C.veh; if (V.clase === 'auto' || V.clase === 'pesado') { const r = rel(C.x, C.y, zb), Mo = Modelos.L.size ? Modelos.vehiculo({ tipo: V.clase === 'pesado' ? 'camion' : 'carro', modelo: V.modelo }) : null; if (Mo) m.modelo(Mo, r[0], r[1], r[2], C.a, { largo: V.largo, tinte: V.tinte || null, oscuro: pj.oscuro || 0 }); else m.carro3d(r[0], r[1], r[2], C.a, V.largo, V.ancho, V.color || '#c0392b', V.clase === 'pesado' ? 'buseta' : 'carro', E.cielo ? E.cielo.noche : 0); } else { m.hueso(P([-.5, .35]), P([.55, .35]), .04, hex3('#1b1f27')); m.hueso(P([-.05, .4]), P([.3, .85]), .035, hex3(V.color || '#7ab800')); m.hueso(P([.55, .35]), P([.38, 1.0]), .03, hex3('#2b2f38')); for (const u of [-.52, .55]) m.caja(...rel(C.x + ca * u, C.y + sa * u, zb), C.a, .68, .06, .68, hex3('#1b1f27')); } }
      const MoJ = C.veh.clase === 'pie' && pj.modelo && !C.nadando ? Modelos.L.get(pj.modelo) : null; if (MoJ) { const r = rel(C.x, C.y, zb), clip = C.estado === 'corre' ? 'sprint_loop' : C.estado === 'camina' || Math.abs(C.v) > .3 ? (Math.abs(C.v) > 3.2 ? 'sprint_loop' : 'walk_loop') : 'idle_breath'; m.modelo(MoJ, r[0], r[1], r[2], C.a, { k: (A.alto || 1.7) / MoJ.alto, clip, t: E.t || 0 }); } else if (!(C.veh.clase === 'auto' || C.veh.clase === 'pesado')) { m.hueso(Lp(J.cadera, .12), Lp(J.rodI, .12), .07, pan); m.hueso(Lp(J.rodI, .12), Lp(J.pieI, .12), .06, pan); m.hueso(Lp(J.cadera, -.12), Lp(J.rodD, -.12), .07, pan); m.hueso(Lp(J.rodD, -.12), Lp(J.pieD, -.12), .06, pan); if (!this._sinCabeza) m.hueso(P(J.cadera), P(J.pecho), .17, cam); m.hueso(Lp(J.pecho, .2), Lp(J.codoI, .22), .05, cam); m.hueso(Lp(J.codoI, .22), Lp(J.manoI, .2), .045, A.manga ? cam : piel); m.hueso(Lp(J.pecho, -.2), Lp(J.codoD, -.22), .05, cam); m.hueso(Lp(J.codoD, -.22), Lp(J.manoD, -.2), .045, A.manga ? cam : piel); const h = P(J.cabeza); if (!this._sinCabeza) m.caja(h[0], h[1] - .13, h[2], C.a, .24, .22, .26, piel); if (this._sinCabeza) { /* en primera persona se ven las manos y el manubrio */ } else if (A.cCasco) m.caja(h[0], h[1] + .06, h[2], C.a, .3, .27, .12, hex3(A.cCasco)); else m.caja(h[0] - ca * .03, h[1] + .07, h[2] - sa * .03, C.a, .26, .24, .08, hex3(A.cPelo)); }
    }
    this._njug = m.d.length;   // 3.0: lo del jugador va primero (se repinta encima en las cámaras aéreas)
    for (const v of E.trafico || []) { const T2 = TRAF_TIPOS[v.tipo] || TRAF_TIPOS.carro, r = rel(v.x, v.y, M.cota(v.x, v.y)), h = v.tipo === 'buseta' || v.tipo === 'camion' ? 2.9 : v.tipo === 'moto' || v.tipo === 'bici' ? 1.2 : 1.1; const Mo = Modelos.L.size && Math.hypot(v.x - E.camara.x, v.y - E.camara.y) < Modelos.lejos ? Modelos.vehiculo(v) : null; if (Mo) { m.modelo(Mo, r[0], r[1], r[2], v.a, { largo: v.largo || T2.largo, tinte: v.sirena || v.bando ? null : v.color, oscuro: v.roto ? .65 : 0 }); if (v.sirena) { const f = Math.floor(performance.now() / 160) % 2, ca = Math.cos(v.a), sa = Math.sin(v.a); m.cajaF(r[0] - ca * .35 - sa * .25, r[1] + 1.56, r[2] - sa * .35 + ca * .25, v.a, .3, .16, .12, f ? [1, .1, .1] : [.35, .05, .05], f); m.cajaF(r[0] - ca * .35 + sa * .25, r[1] + 1.56, r[2] - sa * .35 - ca * .25, v.a, .3, .16, .12, f ? [.1, .2, .5] : [.15, .4, 1], 1 - f); } } else m.carro3d(r[0], r[1], r[2], v.a, T2.largo, T2.ancho, v.color, v.tipo === 'buseta' || v.tipo === 'camion' || v.tipo === 'moto' || v.tipo === 'bici' ? v.tipo : 'carro', E.cielo ? E.cielo.noche : 0, v.sirena ? v : null); }
    /* 4.0: modelos GLB que el juego pone en el mundo (personas de la historia, retenes, contenedores, escondites…) */
    for (const q of E.modelos3d || []) { const Mo = Modelos.L.get(q.id); if (!Mo || Math.hypot(q.x - E.camara.x, q.y - E.camara.y) > (q.lejos || 260)) continue; const r = rel(q.x, q.y, M.cota(q.x, q.y) + (q.z || 0)); m.modelo(Mo, r[0], r[1], r[2], q.a || 0, { k: q.k || 1, ky: q.ky, largo: q.largo, tinte: q.tinte || null, e: q.e || 0, clip: q.clip, t: (E.t || 0) + (q.fase || 0) }); }
    for (const p of E.peatones || []) { const r = rel(p.x, p.y, M.cota(p.x, p.y)), A = p.aspecto || (p.aspecto = Personaje.azar(p.semilla || 1)), sw = Math.sin(p.fase) * .25; m.persona3d(r[0], r[1], r[2], p.a, A, p.fase || 0, A.alto || 1.7); }
    if (E.objetos) E.objetos.malla(m, rel, pj ? pj.cuerpo : null, 170);   // 3.0: artilugios físicos (MC.Objetos)
    for (const v of E.vehiculos || []) { const zt = M.cota(v.x, v.y) + (v.z || 0); if (v.clase === 'cable') { const r = rel(v.x, v.y, zt); m.caja(r[0], r[1] - 2.2, r[2], v.a, 2.2, 2, 2, hex3(v.color), .5); m.caja(r[0], r[1] - .2, r[2], v.a, .15, .15, .4, hex3('#2d3138')); continue; } const L = E.transporte && E.transporte.lineas.find(l => l.id === v.linea); if (!L) continue; const n = v.clase === 'metro' ? 6 : v.clase === 'tram' ? 2 : 1, coche = v.largo / n; for (let i = 0; i < n; i++) { const sc = v.s - v.dir * (i + .5) * coche, c = L.T.at(sc), r = rel(c.x, c.y, M.cota(c.x, c.y) + (v.z || 0)); m.caja(r[0], r[1] + .4, r[2], c.a, coche - .6, v.clase === 'brt' || v.clase === 'feeder' ? 2.5 : 3, 3.2, hex3('#e6e9ee'), .35); m.caja(r[0], r[1] + 1.4, r[2], c.a, coche - .5, (v.clase === 'brt' ? 2.5 : 3) + .04, .5, hex3(v.color)); } }
    return m.d;
  }
  /* dibuja en su propio lienzo; devuelve el lienzo (o null si no hay WebGL) */
  dibujar(W, H, E, op = {}) {
    if (!this.ok) return null; const gl = this.gl, C = E.camara, M = this.mundo, cal = E.calidad ?? 1;
    if (this.cv.width !== W || this.cv.height !== H) { this.cv.width = W; this.cv.height = H; }
    const ox = Math.round(C.ojo[0] / 2000) * 2000, oy = Math.round(C.ojo[1] / 2000) * 2000;
    if (!this.O || Math.abs(this.O[0] - ox) > 2500 || Math.abs(this.O[1] - oy) > 2500) { this.liberar(); this.O = [ox, oy, M.cota(ox, oy)]; }
    if (!this.lejos) this._lejos();
    /* regiones a la vista por distancia, con presupuesto de tiempo para construir */
    /* 3.0: radio de vista definido por la cámara (la periferia del jugador). Las aéreas cargan solo lo que cabe en su encuadre
       y un poco más, con la niebla justo antes del borde: lo que se va cargando no se ve llegar (como la bruma de GTA San Andreas) */
    const aerea = C.d && C.d.fijo, Da = aerea ? (C.distAerea || 60) : 0;
    this._sinCabeza = C.perfil === 'primera'; const R = this.R, radio = aerea ? clamp(Da * 2.3 + 50, 140, 640) : 380 + 520 * cal, cx = aerea ? C.blanco[0] : C.ojo[0], cy = aerea ? C.blanco[1] : C.ojo[1], quiero = new Map();
    for (let gy = Math.floor((cy - radio) / R); gy <= Math.floor((cy + radio) / R); gy++) for (let gx = Math.floor((cx - radio) / R); gx <= Math.floor((cx + radio) / R); gx++) { const d = Math.hypot((gx + .5) * R - cx, (gy + .5) * R - cy); if (d > radio + R) continue; quiero.set(gx + ',' + gy, d < 100 && cal > .7 ? 4 : d < 170 && cal > .5 ? 3 : d < 300 ? 2 : d < 600 ? 1 : 0); }
    for (const [k, r] of this.regiones) if (!quiero.has(k)) { this._borrar(r); this.regiones.delete(k); }
    const t0 = MC.ahora(), faltan = [...quiero].filter(([k, d]) => { const r = this.regiones.get(k); return !r || r.detalle < d; }).sort((a, b) => { const [ax, ay] = a[0].split(',').map(Number), [bx, by] = b[0].split(',').map(Number); return Math.hypot((ax + .5) * R - cx, (ay + .5) * R - cy) - Math.hypot((bx + .5) * R - cx, (by + .5) * R - cy); });
    for (const [k, d] of faltan) { if (MC.ahora() - t0 > (op.presupuesto || 8) && this.regiones.size) break; const [gx, gy] = k.split(',').map(Number), viejo = this.regiones.get(k); if (viejo) this._borrar(viejo); this.regiones.set(k, this._region(gx, gy, d)); }
    this.pendientes = faltan.length;
    /* cámara y luz */
    const O = this.O, e = [C.ojo[0] - O[0], C.ojo[2] - O[2], C.ojo[1] - O[1]], b = [C.blanco[0] - O[0], C.blanco[2] - O[2], C.blanco[1] - O[1]];
    const P = M4.persp(new Float32Array(16), C.fov, W / H, .3, 9000), V = M4.mirar(new Float32Array(16), e, b), MVP = M4.mul(new Float32Array(16), P, V);
    const S = E.cielo, sol = S.sol, luz = sol.alt > -.05 ? [sol.x, Math.max(.15, sol.z), sol.y] : [.3, .8, .2], ll = Math.hypot(...luz), L = luz.map(v => v / ll), niebla = E.clima ? E.clima.niebla : 0, lluvia = E.clima ? E.clima.lluvia : 0;
    const fog = S.bruma, fr = aerea ? [Da * (1.55 - niebla * .5), Da * (2.25 - niebla * .6) + 40] : [radio * (.45 - niebla * .35), radio * (1.05 - niebla * .5) + 1500 * (1 - niebla) * (1 - lluvia * .5)];
    gl.viewport(0, 0, W, H); gl.clearColor(fog[0], fog[1], fog[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /* cielo: degradado de pantalla del cénit al horizonte (el horizonte sigue la inclinación de la cámara) */
    gl.disable(gl.DEPTH_TEST); gl.useProgram(this.pS.p); const dy = b[1] - e[1], dh = Math.hypot(b[0] - e[0], b[2] - e[2]) || 1, hz = clamp(-Math.atan2(dy, dh) / (C.fov / 2), -1, 1), t = S.top, hc = S.hor;
    const cielo = [-1, 1, ...t, 1, 1, ...t, -1, hz, ...hc, 1, hz, ...hc, -1, -1, ...fog, 1, -1, ...fog]; const qd = [0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4].flatMap(i => cielo.slice(i * 5, i * 5 + 5));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cielo); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(qd), gl.DYNAMIC_DRAW); this._attr(this.pS, [['aP', 2], ['aC', 3]], 5); gl.drawArrays(gl.TRIANGLES, 0, 12);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.frontFace(gl.CCW);
    const curv = E.curvatura || 0;   /* 4.0: el planeta es redondo: la altura baja con d²·k según la distancia (k = 1/2R) */
    const uni = (p) => { if (p.u.uCurv) gl.uniform1f(p.u.uCurv, curv); gl.uniformMatrix4fv(p.u.uM, false, MVP); gl.uniform3fv(p.u.uL, L); gl.uniform1f(p.u.uAmb, S.ambiente * .9); gl.uniform1f(p.u.uSol, S.luzSol * .75); gl.uniform3fv(p.u.uO, e); gl.uniform3fv(p.u.uF, fog); gl.uniform2fv(p.u.uFR, fr); if (p.u.uNoche) gl.uniform1f(p.u.uNoche, S.noche); };
    /* relieve lejano (sin los bloques que caen bajo el detalle) */
    gl.useProgram(this.pC.p); uni(this.pC); gl.disable(gl.CULL_FACE);
    for (const B of this.lejos) { if (Math.hypot(B.cx - cx, B.cy - cy) < radio - 1100) continue; gl.bindBuffer(gl.ARRAY_BUFFER, B.b); this._attr(this.pC, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10); gl.drawArrays(gl.TRIANGLES, 0, B.n / 10); }
    /* regiones: suelo con su losa */
    gl.useProgram(this.pT.p); uni(this.pT); gl.activeTexture(gl.TEXTURE0); gl.uniform1i(this.pT.u.uS, 0);
    for (const r of this.regiones.values()) { gl.bindTexture(gl.TEXTURE_2D, r.tex); gl.bindBuffer(gl.ARRAY_BUFFER, r.suelo.b); this._attr(this.pT, [['aP', 3], ['aN', 3], ['aT', 2]], 8); gl.drawArrays(gl.TRIANGLES, 0, r.suelo.n / 8); }
    /* C-M27: sombras solares planas sobre el terreno antes de dibujar volúmenes.
       Cache por celda de ~25 m, para no reconstruir centenares de triángulos por cuadro.
       Se desactivan con noche, lluvia fuerte o calidad baja (respaldo visual del 2D). */
    if (cal > .48 && sol.z > .16 && S.luzSol > .2 && this.pSh) {
      const clave = [Math.floor(cx / 25), Math.floor(cy / 25), Math.round(sol.x * 10),
        Math.round(sol.y * 10), Math.round(sol.z * 10), ...O].join('/');
      if (!this._sombrasCache || this._sombrasCache.clave !== clave) {
        const geometria = Sombras3D.generar(M, O, sol, cx, cy);
        this._sombrasCache = { clave, n: geometria.length / 10 };
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufSombras);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometria), gl.DYNAMIC_DRAW);
      }
      if (this._sombrasCache.n) {
        const alpha = clamp(S.luzSol * (1 - lluvia * .5) * .33, .05, .33);
        const cull = gl.isEnabled(gl.CULL_FACE);
        gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false); gl.useProgram(this.pSh.p); uni(this.pSh);
        gl.uniform1f(this.pSh.u.uAlpha, alpha);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufSombras);
        this._attr(this.pSh, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10);
        gl.drawArrays(gl.TRIANGLES, 0, this._sombrasCache.n);
        gl.depthMask(true); gl.disable(gl.BLEND); if (cull) gl.enable(gl.CULL_FACE);
      }
    }
    gl.useProgram(this.pC.p); uni(this.pC);
    for (const r of this.regiones.values()) if (r.cosas) { gl.bindBuffer(gl.ARRAY_BUFFER, r.cosas.b); this._attr(this.pC, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10); gl.drawArrays(gl.TRIANGLES, 0, r.cosas.n / 10); }
    const D = this._dinamico(E); if (D.length) { gl.bindBuffer(gl.ARRAY_BUFFER, this.dyn); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(D), gl.DYNAMIC_DRAW); this._attr(this.pC, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10); gl.drawArrays(gl.TRIANGLES, 0, D.length / 10);
      /* 3.0: rayos X del jugador en las cámaras aéreas: si un árbol o un techo lo tapan, se ve igual (encima de todo) */
      if (aerea && this._njug > 0) { gl.disable(gl.DEPTH_TEST); gl.drawArrays(gl.TRIANGLES, 0, this._njug / 10); gl.enable(gl.DEPTH_TEST); } }
    this.mvp = MVP; return this.cv;
  }
  _attr(p, L, paso) { const gl = this.gl; let o = 0; for (const [n, k] of L) { const a = p.a[n]; if (a !== undefined && a >= 0) { gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, k, gl.FLOAT, false, paso * 4, o * 4); } o += k; } }
  /* metros del mundo → píxel de la pantalla (para etiquetas encima de la 3D) */
  aPantalla(x, y, z, W, H) { if (!this.mvp || !this.O) return null; const m = this.mvp, X = x - this.O[0], Y = z - this.O[2], Z = y - this.O[1], cw = m[3] * X + m[7] * Y + m[11] * Z + m[15]; if (cw <= .1) return null; return [(m[0] * X + m[4] * Y + m[8] * Z + m[12]) / cw * W / 2 + W / 2, -(m[1] * X + m[5] * Y + m[9] * Z + m[13]) / cw * H / 2 + H / 2]; }
}
Object.assign(MC, { VistaGL, Malla, M4, Sombras3D });
