/* RUN SCOOTER dentro de Motor City · copia casi idéntica de RunRunZero 5b2f85d (motor WebGL propio, modelos, escena, reglas y audio)
   con 12 parches con nombre (herramientas/importar-run.mjs). Generado: no editar a mano.
   © Run Scooter (juanfeliperico369-stack/RunRunZero), mismo autor. */
(function (MC) {
'use strict';
if (!MC) return;
const RUNV = {};
/* ---- RunRunZero/src/engine.js ---- */
/* ===== MOTOR 3D · WebGL1 propio (sin librerías) ===== */
const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); const n = parseInt(h, 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp3 = (o, a, b, t) => { o[0] = a[0] + (b[0] - a[0]) * t; o[1] = a[1] + (b[1] - a[1]) * t; o[2] = a[2] + (b[2] - a[2]) * t; return o; };
const ONE = [1, 1, 1];

const M4 = {
  I() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  persp(o, fy, asp, n, f) {
    const t = 1 / Math.tan(fy / 2), nf = 1 / (n - f); o.fill(0);
    o[0] = t / asp; o[5] = t; o[10] = (f + n) * nf; o[11] = -1; o[14] = 2 * f * n * nf; return o;
  },
  look(o, ex, ey, ez, cx, cy, cz) {
    let zx = ex - cx, zy = ey - cy, zz = ez - cz, l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
    let xx = zz, xz = -zx; l = Math.hypot(xx, xz) || 1; xx /= l; xz /= l;
    const yx = zy * xz, yy = zz * xx - zx * xz, yz = -zy * xx;
    o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0; o[4] = 0; o[5] = yy; o[6] = zy; o[7] = 0;
    o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
    o[12] = -(xx * ex + xz * ez); o[13] = -(yx * ex + yy * ey + yz * ez); o[14] = -(zx * ex + zy * ey + zz * ez); o[15] = 1; return o;
  },
  _t: new Float32Array(16),
  mul(o, a, b) {
    const t = M4._t;
    for (let c = 0; c < 4; c++) {
      const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
      t[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
      t[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
      t[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
      t[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
    }
    o.set(t); return o;
  },
  // T * Ry * Rx * Rz * S
  trs(o, x, y, z, ry = 0, rx = 0, rz = 0, kx = 1, ky = kx, kz = kx) {
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx), cz = Math.cos(rz), sz = Math.sin(rz);
    const a00 = cy, a01 = sy * sx, a02 = sy * cx, a11 = cx, a12 = -sx, a20 = -sy, a21 = cy * sx, a22 = cy * cx;
    o[0] = (a00 * cz + a01 * sz) * kx; o[1] = (a11 * sz) * kx; o[2] = (a20 * cz + a21 * sz) * kx; o[3] = 0;
    o[4] = (-a00 * sz + a01 * cz) * ky; o[5] = (a11 * cz) * ky; o[6] = (-a20 * sz + a21 * cz) * ky; o[7] = 0;
    o[8] = a02 * kz; o[9] = a12 * kz; o[10] = a22 * kz; o[11] = 0;
    o[12] = x; o[13] = y; o[14] = z; o[15] = 1; return o;
  }
};

/* ---------- Atlas de texturas (Canvas2D → WebGL) ---------- */
const AT = { W: 1024, H: 1024, white: [16 / 1024, 990 / 2048], r: {} };
const WUV = AT.white;

/* ---------- Constructor de mallas low-poly ---------- */
class MB {
  constructor() { this.d = []; this.T = M4.I(); this.st = []; }
  at(x, y, z, ry, rx, rz, kx, ky, kz, fn) {
    const m = M4.trs(new Float32Array(16), x, y, z, ry, rx, rz, kx, ky, kz);
    this.st.push(this.T); this.T = M4.mul(new Float32Array(16), this.T, m); fn(this); this.T = this.st.pop(); return this;
  }
  tp(p) { const m = this.T; return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]]; }
  tri(a, b, c, col, e = 0, ta = WUV, tb = WUV, tc = WUV) {
    a = this.tp(a); b = this.tp(b); c = this.tp(c);
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const d = this.d;
    d.push(a[0], a[1], a[2], nx, ny, nz, col[0], col[1], col[2], e, ta[0], ta[1]);
    d.push(b[0], b[1], b[2], nx, ny, nz, col[0], col[1], col[2], e, tb[0], tb[1]);
    d.push(c[0], c[1], c[2], nx, ny, nz, col[0], col[1], col[2], e, tc[0], tc[1]);
  }
  quad(a, b, c, d, col, e = 0, uv) {
    if (uv) { const [u0, v0, u1, v1] = uv; this.tri(a, b, c, col, e, [u0, v1], [u1, v1], [u1, v0]); this.tri(a, c, d, col, e, [u0, v1], [u1, v0], [u0, v0]); }
    else { this.tri(a, b, c, col, e); this.tri(a, c, d, col, e); }
  }
  box(x, y, z, w, h, dd, col, e = 0) {
    const a = w / 2, b = h / 2, c = dd / 2;
    const p = [[x - a, y - b, z - c], [x + a, y - b, z - c], [x + a, y + b, z - c], [x - a, y + b, z - c], [x - a, y - b, z + c], [x + a, y - b, z + c], [x + a, y + b, z + c], [x - a, y + b, z + c]];
    this.quad(p[4], p[5], p[6], p[7], col, e); this.quad(p[1], p[0], p[3], p[2], col, e);
    this.quad(p[0], p[4], p[7], p[3], col, e); this.quad(p[5], p[1], p[2], p[6], col, e);
    this.quad(p[3], p[7], p[6], p[2], col, e); this.quad(p[0], p[1], p[5], p[4], col, e);
  }
  // cilindro vertical (base en y), r2 = radio superior (cono si 0)
  cyl(x, y, z, r, h, seg, col, e = 0, r2 = r, caps = true) {
    for (let i = 0; i < seg; i++) {
      const a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const b0 = [x + c0 * r, y, z + s0 * r], b1 = [x + c1 * r, y, z + s1 * r], t0 = [x + c0 * r2, y + h, z + s0 * r2], t1 = [x + c1 * r2, y + h, z + s1 * r2];
      if (r2 > 0.0001) this.quad(b0, b1, t1, t0, col, e); else this.tri(b0, b1, t0, col, e);
      if (caps) { this.tri([x, y, z], b1, b0, col, e); if (r2 > 0.0001) this.tri([x, y + h, z], t0, t1, col, e); }
    }
  }
  ico(x, y, z, r, col, e = 0, ky = 1, rng = null, jit = 0) {
    const t = (1 + Math.sqrt(5)) / 2;
    const v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(p => {
      const l = Math.hypot(p[0], p[1], p[2]); const j = rng ? 1 + (rng() - 0.5) * jit : 1;
      return [x + p[0] / l * r * j, y + p[1] / l * r * ky * j, z + p[2] / l * r * j];
    });
    const f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    for (const q of f) this.tri(v[q[0]], v[q[1]], v[q[2]], col, e);
  }
  hemi(x, y, z, r, seg, rings, col, e = 0) {
    for (let j = 0; j < rings; j++) {
      const p0 = j / rings * Math.PI / 2, p1 = (j + 1) / rings * Math.PI / 2;
      for (let i = 0; i < seg; i++) {
        const a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2;
        const P = (a, p) => [x + Math.cos(a) * Math.cos(p) * r, y + Math.sin(p) * r, z + Math.sin(a) * Math.cos(p) * r];
        this.quad(P(a0, p0), P(a1, p0), P(a1, p1), P(a0, p1), col, e);
      }
    }
  }
  // cuña: rampa a lo largo de -z, altura h al final
  wedge(x, z0, w, len, h, col, e = 0) {
    const a = w / 2, z1 = z0 - len;
    const A = [x - a, 0, z0], B = [x + a, 0, z0], C = [x + a, h, z1], D = [x - a, h, z1], E = [x - a, 0, z1], F = [x + a, 0, z1];
    this.quad(A, B, C, D, col, e); this.quad(E, F, C, D, col, e);
    this.tri(A, E, D, col, e); this.tri(B, F, C, col, e);
  }
}

/* ---------- Renderizador ---------- */
const VS = `attribute vec3 aP;attribute vec3 aN;attribute vec4 aC;attribute vec2 aT;
uniform mat4 uM,uV,uP;uniform vec2 uBend;uniform vec4 uHill;uniform float uH0;uniform float uHR[64];uniform vec2 uHR0;uniform float uPal;uniform float uTime;uniform vec3 uTint,uTintE,uK0,uK1,uK2,uK3,uK4;
varying vec3 vN;varying vec3 vC;varying float vE;varying vec2 vT;varying float vD;varying float vH;varying vec3 vW;varying float vPF;
void main(){vec4 w=uM*vec4(aP,1.0);vH=w.y;vPF=uPal;if(uPal>0.5&&aC.r<0.06&&aP.y>0.9){float sw=sin(uTime*1.7+w.z*0.21+w.x*0.37)*0.045*aP.y;w.x+=sw;w.z+=sw*0.6;}if(uHill.w>1.5){float sa=uHill.z-w.z;float f=clamp((sa-uHR0.x)/uHR0.y,0.0,62.99);int i=int(f);w.y+=mix(uHR[i],uHR[i+1],f-float(i))-uH0;}else if(uHill.w>0.5){float sa=uHill.z-w.z;w.y+=clamp((sa-150.0)/250.0,0.0,1.0)*(6.0*sin(uHill.x-w.z*0.0105)+2.2*sin(uHill.y-w.z*0.027))-uH0;}vec4 v=uV*w;float z=min(v.z,0.0);v.x+=uBend.x*z*z;v.y+=uBend.y*z*z;
gl_Position=uP*v;vN=(uM*vec4(aN,0.0)).xyz;vE=aC.a;vT=aT;vD=-v.z;vW=w.xyz;
float k=aC.r*4.0;vec3 pc=uK0*max(0.0,1.0-abs(k))+uK1*max(0.0,1.0-abs(k-1.0))+uK2*max(0.0,1.0-abs(k-2.0))+uK3*max(0.0,1.0-abs(k-3.0))+uK4*max(0.0,1.0-abs(k-4.0));
vec3 dc=aC.rgb*mix(uTint,uTintE,step(0.5,aC.a));vC=mix(dc,pc*aC.g*uTint,uPal);}`;
const FS = `precision mediump float;uniform sampler2D uTex;uniform vec3 uFog,uL,uCam;uniform float uAmb,uSun,uEmit,uAlpha,uCut;uniform vec2 uFogR;
varying vec3 vN;varying vec3 vC;varying float vE;varying vec2 vT;varying float vD;varying float vH;varying vec3 vW;varying float vPF;
void main(){vec4 t=texture2D(uTex,vT);if(t.a<uCut)discard;vec3 base=vC*t.rgb;
vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;float d=max(dot(n,uL),0.0);d=mix(d,floor(d*3.0+0.5)/3.0,0.3);
vec3 V=normalize(uCam-vW);float sp=pow(max(dot(reflect(-uL,n),V),0.0),18.0)*0.24*uSun*(1.0-0.75*vPF);float rim=pow(1.0-max(dot(n,V),0.0),3.0)*0.2;
float ao=mix(mix(0.68,1.0,clamp(vH*1.3+0.2,0.0,1.0)),1.0,step(0.8,n.y));
vec3 c=base*(uAmb*(0.72+0.28*n.y)+uSun*d)*ao+vec3(sp)+base*rim*uAmb;c=mix(c,base*1.3,vE*uEmit);
float f=clamp((vD-uFogR.x)/(uFogR.y-uFogR.x),0.0,1.0);c=mix(c,uFog,f*f);gl_FragColor=vec4(c,t.a*uAlpha);}`;
const SVS = `attribute vec2 aP;varying vec2 vU;void main(){vU=aP*0.5+0.5;gl_Position=vec4(aP,0.9999,1.0);}`;
const SFS = `precision mediump float;varying vec2 vU;uniform vec3 uTop,uHor,uSunC,uSun;uniform float uStars,uAsp,uHy,uTime;
void main(){float h=clamp((vU.y-uHy)/(1.0-uHy),0.0,1.0);vec3 c=mix(uHor,uTop,pow(h,0.75));
vec2 p=vec2((vU.x-0.5)*uAsp,vU.y);float sd=length(p-uSun.xy);c=mix(c,uSunC,smoothstep(uSun.z,uSun.z*0.82,sd)*step(0.001,h));
c+=uSunC*0.18*smoothstep(uSun.z*3.5,0.0,sd)*step(0.001,h);
if(uStars>0.0){vec2 g=floor(p*120.0);float r=fract(sin(dot(g,vec2(12.9898,78.233)))*43758.5453);c+=step(0.993,r)*uStars*h*(0.6+0.4*sin(uTime*3.0+r*40.0));}
gl_FragColor=vec4(c,1.0);}`;

const R = {
  gl: null, cv: null, meshes: [], dpr: 1, w: 1, h: 1, lost: false,
  V: M4.I(), P: M4.I(), _m: new Float32Array(16), last: null, U: {}, SU: {},
  init(cv) {
    this.cv = cv;
    const opt = { antialias: false, alpha: false, depth: true, stencil: false, powerPreference: 'default', preserveDrawingBuffer: false };
    const gl = cv.getContext('webgl', opt) || cv.getContext('experimental-webgl', opt);
    if (!gl) return false;
    this.gl = gl;
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); this.lost = true; }, false);
    cv.addEventListener('webglcontextrestored', () => { this.setup(); this.meshes.forEach(m => this._up(m)); if (this.atlasCanvas) this.texture(this.atlasCanvas); this.lost = false; }, false);
    this.setup(); return true;
  },
  _prog(vs, fs) {
    const gl = this.gl, mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(sh)); return sh; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aP'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
    return p;
  },
  setup() {
    const gl = this.gl;
    this.prog = this._prog(VS, FS); this.sprog = this._prog(SVS, SFS);
    const U = this.U = {}, n = gl.getProgramParameter(this.prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(this.prog, i); U[a.name] = gl.getUniformLocation(this.prog, a.name); }
    const SU = this.SU = {}, n2 = gl.getProgramParameter(this.sprog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n2; i++) { const a = gl.getActiveUniform(this.sprog, i); SU[a.name] = gl.getUniformLocation(this.sprog, a.name); }
    this.A = ['aP', 'aN', 'aC', 'aT'].map(k => gl.getAttribLocation(this.prog, k));
    this.sA = gl.getAttribLocation(this.sprog, 'aP');
    this.sbuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.sbuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.disable(gl.CULL_FACE); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.last = null;
  },
  texture(canvas) {
    const gl = this.gl; this.atlasCanvas = canvas; gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  },
  _up(m) { const gl = this.gl; m.b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, m.b); gl.bufferData(gl.ARRAY_BUFFER, m.data, gl.STATIC_DRAW); },
  mesh(mb) { const m = { data: new Float32Array(mb.d), n: mb.d.length / 12, b: null }; this._up(m); this.meshes.push(m); return m; },
  free(m) { if (!m) return; const i = this.meshes.indexOf(m); if (i >= 0) this.meshes.splice(i, 1); this.gl.deleteBuffer(m.b); },
  resize(scale) {
    const d = Math.min(window.devicePixelRatio || 1, 2) * scale; this.dpr = d;
    const w = Math.max(1, Math.round(this.cv.clientWidth * d)), h = Math.max(1, Math.round(this.cv.clientHeight * d));
    if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h; }
    this.w = w; this.h = h;
  },
  // env: {top,hor,fog,fogR,sun,sunC,stars,amb,sunI,emit,L,bend}
  begin(cam, env, time) {
    const gl = this.gl; if (!gl || this.lost) return false;
    gl.viewport(0, 0, this.w, this.h);
    gl.clearColor(env.hor[0], env.hor[1], env.hor[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const asp = this.w / this.h;
    M4.persp(this.P, cam.fov, asp, 0.1, 400);
    M4.look(this.V, cam.ex, cam.ey, cam.ez, cam.cx, cam.cy, cam.cz);
    // cielo
    gl.useProgram(this.sprog); gl.depthMask(false);
    const S = this.SU;
    gl.uniform3fv(S.uTop, env.top); gl.uniform3fv(S.uHor, env.hor); gl.uniform3fv(S.uSunC, env.sunC);
    gl.uniform3f(S.uSun, env.sun[0], env.sun[1], env.sun[2]); gl.uniform1f(S.uStars, env.stars);
    gl.uniform1f(S.uAsp, asp); gl.uniform1f(S.uHy, env.hy); gl.uniform1f(S.uTime, time);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sbuf);
    for (let i = 1; i < 4; i++) if (this.A[i] >= 0) gl.disableVertexAttribArray(this.A[i]);
    gl.enableVertexAttribArray(this.sA); gl.vertexAttribPointer(this.sA, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3); gl.depthMask(true);
    // mundo
    gl.useProgram(this.prog); const U = this.U;
    gl.uniformMatrix4fv(U.uP, false, this.P); gl.uniformMatrix4fv(U.uV, false, this.V);
    gl.uniform2f(U.uBend, env.bend[0], env.bend[1]); gl.uniform4f(U.uHill, env.hill[0], env.hill[1], env.hill[2], env.hill[3]); gl.uniform1f(U.uH0, env.h0); if (env.hr && U['uHR[0]']) { gl.uniform1fv(U['uHR[0]'], env.hr); gl.uniform2f(U.uHR0, env.hr0[0], env.hr0[1]); }
    gl.uniform3fv(U.uFog, env.hor); gl.uniform2f(U.uFogR, env.fogR[0], env.fogR[1]);
    gl.uniform3fv(U.uL, env.L); gl.uniform1f(U.uAmb, env.amb); gl.uniform1f(U.uSun, env.sunI);
    gl.uniform1f(U.uEmit, env.emit); this.emit = env.emit; this._e = env.emit;
    if (U.uCam) gl.uniform3f(U.uCam, cam.ex, cam.ey, cam.ez); if (U.uTime) gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uAlpha, 1); gl.uniform1f(U.uCut, 0.5); gl.uniform1f(U.uPal, 0);
    gl.uniform3fv(U.uTint, ONE); gl.uniform3fv(U.uTintE, ONE);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.uniform1i(U.uTex, 0);
    for (let i = 0; i < 4; i++) if (this.A[i] >= 0) gl.enableVertexAttribArray(this.A[i]);
    this.last = null; this._tint = null; this._tintE = null; this._pal = 0; this.draws = 0;
    return true;
  },
  pal(on, k) {
    const gl = this.gl, U = this.U; gl.uniform1f(U.uPal, on ? 1 : 0); this._pal = on;
    if (k) { gl.uniform3fv(U.uK0, k[0]); gl.uniform3fv(U.uK1, k[1]); gl.uniform3fv(U.uK2, k[2]); gl.uniform3fv(U.uK3, k[3]); gl.uniform3fv(U.uK4, k[4]); }
  },
  draw(m, M, tint = ONE, tintE = ONE, emit = -1) {
    const gl = this.gl, U = this.U;
    if (this.last !== m) {
      gl.bindBuffer(gl.ARRAY_BUFFER, m.b);
      gl.vertexAttribPointer(this.A[0], 3, gl.FLOAT, false, 48, 0);
      if (this.A[1] >= 0) gl.vertexAttribPointer(this.A[1], 3, gl.FLOAT, false, 48, 12);
      if (this.A[2] >= 0) gl.vertexAttribPointer(this.A[2], 4, gl.FLOAT, false, 48, 24);
      if (this.A[3] >= 0) gl.vertexAttribPointer(this.A[3], 2, gl.FLOAT, false, 48, 40);
      this.last = m;
    }
    if (this._tint !== tint) { gl.uniform3fv(U.uTint, tint); this._tint = tint; }
    if (this._tintE !== tintE) { gl.uniform3fv(U.uTintE, tintE); this._tintE = tintE; }
    const e = emit < 0 ? this.emit : emit; if (e !== this._e) { gl.uniform1f(U.uEmit, e); this._e = e; }
    gl.uniformMatrix4fv(U.uM, false, M);
    gl.drawArrays(gl.TRIANGLES, 0, m.n); this.draws++;
  },
  blend(on, alpha = 1) {
    const gl = this.gl;
    if (on) { gl.enable(gl.BLEND); gl.depthMask(false); gl.uniform1f(this.U.uCut, 0.01); }
    else { gl.disable(gl.BLEND); gl.depthMask(true); gl.uniform1f(this.U.uCut, 0.5); }
    gl.uniform1f(this.U.uAlpha, alpha);
  }
};

/* ---- RunRunZero/src/data.js ---- */
/* ===== DATOS · vehículos, ediciones (zonas), historia, misiones, rangos ===== */
const VEH = [
  { id: 'foot', name: 'A pie', price: 0, kind: 'h', spd: 0.62, jmp: 1.0, hnd: 1.3, boost: 3.5, perk: 'Parkour: saltas solo rocas, vallas y bolardos', desc: 'Así empieza todo repartidor de EMSAY: tenis, morral y ganas.' },
  { id: 'quad', name: 'Patines quad', price: 600, kind: 'h', spd: 0.8, jmp: 1.0, hnd: 1.32, boost: 4.5, perk: 'Doble salto en el aire', desc: 'Dos ruedas adelante y dos atrás: el más ágil entre carriles.' },
  { id: 'inline', name: 'Patines en línea', price: 1400, kind: 'h', spd: 0.86, jmp: 1.02, hnd: 1.18, boost: 5.5, perk: 'Rueda en hilera: los charcos no te tumban', desc: 'Cuatro ruedas en fila: veloces sobre el asfalto.' },
  { id: 'skate', name: 'Skate', price: 2000, kind: 'h', spd: 0.84, jmp: 1.17, hnd: 1.06, boost: 4.5, perk: 'Ollie alto y trucos ×2', desc: 'Tabla, lija y actitud. Cada salto es un truco.' },
  { id: 'long', name: 'Longboard', price: 2800, kind: 'h', spd: 0.88, jmp: 0.95, hnd: 0.96, boost: 5, perk: 'Bajadas más rápidas y sin perder el control', desc: 'Tabla larga y ruedas blandas: vuela en las bajadas.' },
  { id: 'scooter', name: 'Monopatín', price: 3500, kind: 'h', spd: 0.85, jmp: 1.0, hnd: 1.0, boost: 4.5, perk: 'Equilibrio: el tambaleo dura 2,2 s (no 3 s)', desc: 'El clásico de empuje. Estable y noble.' },
  { id: 'uni', name: 'Monociclo', price: 4200, kind: 'h', spd: 0.83, jmp: 1.05, hnd: 1.2, boost: 4, perk: 'Equilibrista: los roces laterales no te tambalean', desc: 'Una rueda, un sillín y mucho circo.' },
  { id: 'bike', name: 'Bicicleta', price: 5500, kind: 'h', spd: 0.96, jmp: 0.93, hnd: 0.94, boost: 7, perk: '+15 % de puntos', desc: 'La reina de la ciclovía, con canasta de revistas.' },
  { id: 'trike', name: 'Triciclo de carga', price: 7000, kind: 'h', spd: 0.88, jmp: 0.86, hnd: 0.9, boost: 5, perk: 'Entregas ×2 (puntos y monedas)', desc: 'El vehículo oficial de reparto EMSAY, con cajón de revistas.' },
  { id: 'ebike', name: 'Bicicleta eléctrica', price: 9000, kind: 'e', spd: 1.0, jmp: 0.93, hnd: 0.96, boost: 8, perk: 'Asistencia: las subidas no te frenan', desc: 'Pedaleo asistido para repartir sin sudar.' },
  { id: 'escooter', name: 'Monopatín eléctrico', price: 11000, kind: 'e', spd: 0.98, jmp: 0.96, hnd: 1.0, boost: 7, perk: 'Poderes +35 % de duración', desc: 'Batería llena: imán, turbo y x2 duran más.' },
  { id: 'euc', name: 'Monociclo eléctrico', price: 13000, kind: 'e', spd: 1.0, jmp: 1.05, hnd: 1.12, boost: 7.5, perk: 'Mini imán: atrae monedas cercanas', desc: 'Una sola rueda y mucho equilibrio. El más moderno.' },
  { id: 'moped', name: 'Scooter eléctrico', price: 16000, kind: 'e', spd: 1.06, jmp: 0.9, hnd: 0.98, boost: 8.5, perk: 'Batería grande: +50 % de energía', desc: 'Parece una mini moto y no hace ruido.' },
  { id: 'moto', name: 'Moto de reparto', price: 22000, kind: 'm', street: 1, spd: 1.14, jmp: 0.9, hnd: 1.0, boost: 10, perk: 'Sale a la calle · entregas +25 %', desc: 'Con baúl EMSAY. Ojo con el límite de velocidad.' },
  { id: 'auto', name: 'Auto de prensa', price: 30000, kind: 'm', street: 1, spd: 1.18, jmp: 0.92, hnd: 0.92, boost: 10, perk: 'Carrocería: aguanta un golpe cada 45 s', desc: 'El carro de la redacción, con letrero en el techo.' },
  { id: 'camion', name: 'Camión EMSAY', price: 40000, kind: 'm', street: 1, spd: 1.05, jmp: 0.86, hnd: 0.82, boost: 7, perk: 'Cuadrilla: las entregas se hacen solas y perfectas', desc: 'Con personal que te ayuda a repartir toda la edición.' },
  { id: 'jetpack', name: 'Jetpack', price: 60000, kind: 'f', spd: 1.1, jmp: 1.0, hnd: 1.15, boost: 9, perk: 'Propulsión: 4 impulsos en el aire y caída lenta', desc: 'El invento de la Capitana Cometa. Corre en tierra, vuela con ↑.' }
];
const VEHI = Object.fromEntries(VEH.map(v => [v.id, v]));

const COS = {
  casco: [
    { id: 'h0', name: 'Teal EMSAY', c: '#0e6378', p: 0 }, { id: 'h1', name: 'Crema portada', c: '#e8e4c4', p: 300 },
    { id: 'h2', name: 'Rojo sesión 3', c: '#c0191c', p: 600 }, { id: 'h3', name: 'Mostaza final', c: '#c49a2c', p: 900 },
    { id: 'h4', name: 'Neón morado', c: '#a42cff', p: 1500, e: 1 }, { id: 'h5', name: 'Oro del domingo', c: '#ffc23a', st: 5, e: 1 }
  ],
  ropa: [
    { id: 'r0', name: 'Repartidor', a: '#e8e4c4', b: '#1b4459', p: 0 }, { id: 'r1', name: 'Tipologías', a: '#ff5a2a', b: '#1b4459', p: 500 },
    { id: 'r2', name: 'Oralidad gris', a: '#9a9ea6', b: '#2b2d33', p: 700 }, { id: 'r3', name: 'Rojo y negro', a: '#c0191c', b: '#151515', p: 1000 },
    { id: 'r4', name: 'Sesión final', a: '#c49a2c', b: '#4a2e12', p: 1200 }, { id: 'r6', name: 'Sakura', a: '#f4a6c0', b: '#2b2d33', p: 900 }, { id: 'r7', name: 'Caribe', a: '#2f9fd1', b: '#f0d9a0', p: 900 }, { id: 'r8', name: 'Cafetal', a: '#3f8a3a', b: '#6b4226', p: 1100 }, { id: 'r5', name: 'Doc Element', a: '#1a0636', b: '#39c8ff', st: 4, e: 1 }
  ],
  pintura: [
    { id: 'p0', name: 'Teal', c: '#0e6378', p: 0 }, { id: 'p1', name: 'Crema', c: '#e8e4c4', p: 400 },
    { id: 'p2', name: 'Rojo', c: '#c0191c', p: 800 }, { id: 'p3', name: 'Naranja', c: '#ff5a2a', p: 1200 },
    { id: 'p4', name: 'Mostaza', c: '#c49a2c', p: 1600 }, { id: 'p6', name: 'Negro mate', c: '#22242a', p: 1000 }, { id: 'p7', name: 'Rosa sakura', c: '#f4a6c0', p: 1400 }, { id: 'p8', name: 'Verde menta', c: '#2dffb3', p: 2000, e: 1 }, { id: 'p5', name: 'Neón azul', c: '#39c8ff', st: 6, e: 1 }
  ],
  estela: [
    { id: 't0', name: 'Ninguna', p: 0 }, { id: 't1', name: 'Polvo', p: 600 }, { id: 't2', name: 'Confeti EMSAY', p: 1500 },
    { id: 't3', name: 'Línea neón', st: 8 }, { id: 't4', name: 'Estrellas ✦', st: 12 }
  ],
  piel: [
    { id: 's0', name: 'Canela', c: '#c98e62', p: 0 }, { id: 's1', name: 'Miel', c: '#e0b089', p: 0 }, { id: 's2', name: 'Marfil', c: '#f0c9a8', p: 0 },
    { id: 's3', name: 'Cacao', c: '#8a5a3a', p: 0 }, { id: 's4', name: 'Ébano', c: '#5a3a24', p: 0 }
  ],
  pelo: [
    { id: 'k0', name: 'Corto negro', hair: 'corto', c: '#1b1410', p: 0 }, { id: 'k1', name: 'Coleta castaña', hair: 'coleta', c: '#5a3a1e', p: 0 },
    { id: 'k2', name: 'Afro', hair: 'afro', c: '#141010', p: 200 }, { id: 'k3', name: 'Coleta roja', hair: 'coleta', c: '#c0391c', p: 400 },
    { id: 'k6', name: 'Rubio corto', hair: 'corto', c: '#e0b84a', p: 300 }, { id: 'k7', name: 'Moño azul', hair: 'moño', c: '#39c8ff', p: 600 },
    { id: 'k4', name: 'Moño morado', hair: 'moño', c: '#a42cff', ach: 'a8' }, { id: 'k5', name: 'Canas de editor', hair: 'canoso', c: '#e6e6e6', ach: 'a14' }
  ],
  mascota: [
    { id: 'm0', name: 'Sin mascota', p: 0 }, { id: 'm1', name: 'Perro Bache', c: '#c9935e', p: 2500 },
    { id: 'm2', name: 'Gata Tinta', c: '#3a3a46', p: 3500 }, { id: 'm3', name: 'Loro Domingo', c: '#2dbd5a', st: 10 }
  ]
};
const COSI = {}; for (const k in COS) for (const c of COS[k]) COSI[c.id] = Object.assign({ cat: k }, c);

/* Logros: [id, nombre, descripción, estrellas, condición(S, g), cosmético que regala] */
const ACH = [
  ['a1', 'Primera entrega', 'Entrega tu primera revista', 1, S => S.tot.deliv >= 1], ['a2', 'Cartero del barrio', 'Entrega 100 revistas en total', 2, S => S.tot.deliv >= 100],
  ['a3', 'Racha de oro', 'Encadena 10 entregas seguidas', 2, (S, g) => g && g.dBest >= 10], ['a4', 'Medio camino', 'Recorre 2.000 m en una partida', 1, (S, g) => g && g.p.s >= 2000],
  ['a5', 'Sin fin', 'Recorre 5.000 m en una partida', 3, (S, g) => g && g.p.s >= 5000], ['a6', 'Maratón', 'Suma 42.195 m en total', 2, S => S.tot.dist >= 42195],
  ['a7', 'Bolsillo lleno', 'Junta 10.000 monedas en total', 2, S => S.tot.coins >= 10000], ['a8', 'Acróbata', 'Haz 25 trucos en una partida', 2, (S, g) => g && g.tricks >= 25, 'k4'],
  ['a9', 'Rey del camión', 'Sube a 8 camiones en una partida', 1, (S, g) => g && g.trucks >= 8], ['a10', 'Bajo la lluvia', 'Llega a una edición con lluvia', 1, (S, g) => g && g.rainSeen],
  ['a11', 'Topo urbano', 'Atraviesa un túnel', 1, (S, g) => g && g.tunSeen], ['a12', 'Coleccionista', 'Ten 10 vehículos', 3, S => VEH.filter(v => S.owned[v.id]).length >= 10],
  ['a13', 'Con estilo', 'Ten 15 cosméticos', 2, S => Object.keys(S.ownedCos).length >= 15], ['a14', 'Lector de EMSAY', 'Recupera las 12 páginas', 3, S => S.clues >= 12, 'k5'],
  ['a15', 'Madrugador', 'Racha de 7 días de regalo', 2, S => S.daily.streak >= 7], ['a16', 'Retador', 'Supera un Reto del día', 1, S => !!S.ch.rew],
  ['a17', 'Leyenda', 'Llega al rango Leyenda', 3, S => rankOf(S.xp) >= 9], ['a18', 'Poder total', 'Usa 8 poderes en una partida', 1, (S, g) => g && g.powers >= 8],
  ['a21', 'Deletreo', 'Completa la palabra EMSAY', 2, S => S.word && S.word.done >= 1], ['a22', 'Planeador', 'Vuela con el paraguas', 1, (S, g) => g && g.glides >= 1],
  ['a23', 'Buen ciudadano', 'Respeta 10 semáforos en rojo', 1, S => (S.cnt.civic || 0) >= 10], ['a24', 'Escurridizo', 'Pierde a la policía 3 veces', 2, S => (S.cnt.esc || 0) >= 3],
  ['a25', 'Duelista', 'Gana 5 duelos a rivales', 2, S => (S.cnt.duels || 0) >= 5], ['a26', 'Equilibrio total', 'Desliza 150 m por barandas en una partida', 2, (S, g) => g && g.grindM >= 150],
  ['a27', 'Lector voraz', 'Recupera 50 páginas', 3, S => S.clues >= 50], ['a28', 'Hemeroteca', 'Recupera todas las páginas', 5, S => S.clues >= STORY.length],
  ['a29', 'En forma', 'Llega a 80 de capacidad física', 2, S => S.fit >= 80], ['a30', 'Aprendiz aplicado', 'Aprende 3 habilidades de mentores', 2, S => Object.keys(S.ment).length >= 3],
  ['a19', 'Mejor amigo', 'Consigue una mascota', 1, S => Object.keys(S.ownedCos).some(k => /^m[1-9]/.test(k))], ['a20', 'Velocista', 'Toca ⚡ 150 veces en una partida', 1, (S, g) => g && (g.boosts || 0) >= 150]
];
const UPG = [
  { id: 'magnet', name: 'Imán', base: 8, per: 2, icon: '∩' },
  { id: 'turbo', name: 'Turbo', base: 4.5, per: 1, icon: '⚡' },
  { id: 'x2', name: 'Puntos x2', base: 10, per: 3, icon: '×2' },
  { id: 'gift', name: 'Suerte en regalos', base: 0, per: 0, icon: '◆' }
];
UPG.push({ id: 'en', name: 'Aliento y batería', base: 0, per: 8, icon: '♥', pct: 1 }, { id: 'rue', name: 'Ruedas y tenis', base: 0, per: 7, icon: '◎', pct: 1 }, { id: 'fre', name: 'Frenos', base: 0, per: 8, icon: '■', pct: 1 }, { id: 'mor', name: 'Morral de reparto', base: 0, per: 6, icon: '✉', pct: 1 });
const UPC = [400, 900, 1800, 3500, 6000];

/* Ediciones: cada 1000 m cambia la "página" de la revista EMSAY */
const Z = (o) => {
  const r = {}; for (const k in o) r[k] = Array.isArray(o[k]) && typeof o[k][0] === 'string' ? o[k].map(hex) : (typeof o[k] === 'string' && o[k][0] === '#' ? hex(o[k]) : o[k]); return r;
};
const ZRAW = [
  Z({ name: 'PORTADA', sub: 'Disponible cada domingo', bill: 0, top: '#5fb3c9', hor: '#e8e4c4', sunC: '#fff7d6', sun: [0.32, 0.78, 0.05], stars: 0, amb: 0.82, sunI: 0.42, emit: 0.18, fog: [70, 185],
    road: ['#0e6378', '#d9d2b0', '#6f9e5a', '#e8e4c4', '#e8e4c4'], scen: ['#3f8a4f', '#5b4636', '#0e6378', '#e8e4c4', '#ffd36b'], ui: '#0e6378' }),
  Z({ name: 'SESIÓN 1 · ESCUCHAR & OÍR', sub: '¿Estamos realmente conectados?', bill: 2, top: '#ffd77a', hor: '#fbe7a9', sunC: '#fffbe8', sun: [-0.3, 0.72, 0.06], stars: 0, amb: 0.85, sunI: 0.4, emit: 0.18, fog: [70, 185],
    road: ['#c94f3d', '#fff0c2', '#9cbf4a', '#fff6d5', '#3a2a1a'], scen: ['#6fae3e', '#6b4a2b', '#f4c95d', '#e7a33e', '#ffe9a8'], ui: '#b8281f' }),
  Z({ name: 'SESIÓN 2 · ORALIDAD', sub: '7 componentes & técnicas', bill: 3, top: '#c9ccd2', hor: '#9a9ea6', sunC: '#ffffff', sun: [0.2, 0.86, 0.04], stars: 0, amb: 0.8, sunI: 0.35, emit: 0.22, fog: [60, 175],
    road: ['#3a3d44', '#b9bcc2', '#7f8d6c', '#ffffff', '#111111'], scen: ['#5f7a55', '#2b2d33', '#5c6068', '#7c8088', '#fff3c4'], ui: '#2b2d33', tun: 1 }),
  Z({ name: 'SESIÓN 3 · DESENTRAÑAR', sub: 'Niveles de lectura', bill: 4, top: '#ff7a52', hor: '#c0191c', sunC: '#ffe2c2', sun: [0, 0.6, 0.11], stars: 0, amb: 0.75, sunI: 0.45, emit: 0.35, fog: [55, 170],
    road: ['#1a1a1a', '#e8e0d8', '#5a1d17', '#f2f2f2', '#f2f2f2'], scen: ['#2d2d2d', '#111111', '#8e1013', '#e8e0d8', '#ffd0a0'], ui: '#c0191c' }),
  Z({ name: 'TIPOLOGÍAS TEXTUALES', sub: 'Los tipos de texto en la ciudad', bill: 5, top: '#0c2533', hor: '#1b4459', sunC: '#ffe7c7', sun: [0.36, 0.8, 0.035], stars: 0.9, amb: 0.62, sunI: 0.3, emit: 0.8, fog: [55, 170],
    road: ['#0f2a38', '#24506a', '#163847', '#ff5a2a', '#ff5a2a'], scen: ['#2f7d6d', '#0b1d27', '#ff5a2a', '#e8c25a', '#ffd27a'], ui: '#ff5a2a', tun: 1 }),
  Z({ name: 'SESIÓN FINAL · LA RUTA', sub: 'En el discurso y la oratoria', bill: 6, top: '#f6cf6a', hor: '#c49a2c', sunC: '#fff3c8', sun: [-0.15, 0.62, 0.09], stars: 0, amb: 0.82, sunI: 0.42, emit: 0.3, fog: [65, 180],
    road: ['#5a3a1a', '#f5e6c0', '#8a7a2c', '#ffffff', '#ffffff'], scen: ['#8c6d1f', '#3b2410', '#6b3f16', '#f5e6c0', '#fff0b0'], ui: '#6b3f16' }),
  Z({ name: 'EDICIÓN NEÓN · DOC ELEMENT', sub: 'Negro total, bordes morados, letra azul', bill: 7, top: '#000000', hor: '#0b0418', sunC: '#a42cff', sun: [0, 0.7, 0.07], stars: 1, amb: 0.5, sunI: 0.22, emit: 1, fog: [50, 165],
    road: ['#0b0418', '#4d1785', '#05010b', '#39c8ff', '#a42cff'], scen: ['#2dffb3', '#1a0636', '#0b0418', '#1a0636', '#ff2fb3'], ui: '#a42cff', tun: 1 }),
  Z({ name: 'MALECÓN · EDICIÓN PLAYA', sub: 'Brisa, arena y revistas', bill: 1, top: '#5cc6ee', hor: '#f7e7c4', sunC: '#fff7d6', sun: [0.25, 0.8, 0.06], stars: 0, amb: 0.85, sunI: 0.42, emit: 0.2, fog: [75, 190],
    road: ['#d9572b', '#efe2bf', '#f0d9a0', '#ffffff', '#1d4e79'], scen: ['#3aa35a', '#8a5a32', '#ff5a2a', '#2f9fd1', '#ffd23a'], ui: '#2f9fd1' }),
  Z({ name: 'BOSQUE NUBLADO', sub: 'Entre pinos y neblina', bill: 8, top: '#9fbab3', hor: '#d7e3dc', sunC: '#ffffff', sun: [-0.2, 0.85, 0.04], stars: 0, amb: 0.78, sunI: 0.3, emit: 0.3, fog: [35, 145],
    road: ['#2f5d3a', '#c9c2a8', '#3d6b3f', '#f4f1e6', '#8a7a5a'], scen: ['#2e6b3a', '#4a3426', '#5a7d5a', '#e8efe9', '#ffd36b'], ui: '#2f5d3a' }),
  Z({ name: 'FINCA CAFETERA', sub: 'Montañas verdes y casitas de colores', bill: 9, top: '#7fc8f5', hor: '#fff1cf', sunC: '#fff8e0', sun: [0.3, 0.75, 0.06], stars: 0, amb: 0.85, sunI: 0.42, emit: 0.2, fog: [70, 185],
    road: ['#7a3b1f', '#e9d8b4', '#7fb24a', '#ffffff', '#e9d8b4'], scen: ['#3f8a3a', '#6b4226', '#e7dfc8', '#c0191c', '#ff3b30'], ui: '#7a3b1f' }),
  Z({ name: 'PUENTE SOBRE EL RÍO', sub: 'Rueda sobre el agua', bill: 0, top: '#6fb2d6', hor: '#cfe6ee', sunC: '#ffffff', sun: [-0.3, 0.8, 0.05], stars: 0, amb: 0.84, sunI: 0.4, emit: 0.25, fog: [70, 185],
    road: ['#4a4f58', '#b9bcc2', '#2f7fb0', '#ffd23a', '#e8e4c4'], scen: ['#3f8a4f', '#3a3f4a', '#e8e4c4', '#f4f1e6', '#ffd23a'], ui: '#2f7fb0' })
];
/* orden de las ediciones: la revista alterna sus páginas con los nuevos escenarios */
const ZORD = [0, 1, 7, 2, 9, 3, 8, 4, 10, 5, 6];
const ZONES = ZORD.map(i => ZRAW[i]);
/* nombre corto de la zona para letreros de esquina */
const zShort = Z => { const p = Z.name.split(' · '); return p.length > 1 && /^(SESIÓN|EDICIÓN)/.test(p[0]) ? p[1] : p[0]; };
/* zona libre: retos para ganar habilidad */
const DRILL = [
  { k: 'jumps', n: 10, t: 'Salta {n} veces' },
  { k: 'pads', n: 4, t: 'Pisa {n} impulsores' },
  { k: 'grindM', n: 25, t: 'Desliza {n} m en barandas' },
  { k: 'tricks', n: 5, t: 'Haz {n} trucos en el aire' },
  { k: 'combo', n: 1.8, abs: 1, t: 'Sube el estilo a ×{n}' },
  { k: 'jumps', n: 25, t: 'Salta {n} veces' },
  { k: 'parkTr', n: 12, t: 'Haz {n} trucos en el parque' },
  { k: 'cleanS', n: 500, abs: 1, t: 'Rueda {n} m sin caerte' },
  { k: 'grindM', n: 70, t: 'Desliza {n} m en barandas' }
];

/* Misiones (3 activas) — run:1 = dentro de una sola partida */
const MIS = [
  { k: 'coins', t: 'Recoge {n} monedas en una partida', n: [50, 120, 250, 400, 650], run: 1 },
  { k: 'dist', t: 'Recorre {n} m en una partida', n: [500, 1000, 2000, 3500, 5500], run: 1 },
  { k: 'jumps', t: 'Salta {n} veces', n: [15, 35, 70, 120, 200] },
  { k: 'ducks', t: 'Agáchate bajo {n} ramas o talanqueras', n: [3, 8, 16, 28, 45] },
  { k: 'gifts', t: 'Abre {n} regalos', n: [1, 3, 6, 10, 16] },
  { k: 'powers', t: 'Usa {n} poderes', n: [2, 5, 10, 16, 25] },
  { k: 'tricks', t: 'Haz {n} trucos en el aire', n: [5, 12, 25, 45, 70] },
  { k: 'score', t: 'Haz {n} puntos en una partida', n: [1500, 4000, 9000, 18000, 35000], run: 1 },
  { k: 'clean', t: 'Recorre {n} m sin tambalearte', n: [300, 700, 1200, 2000, 3000], run: 1 },
  { k: 'trucks', t: 'Sube a {n} camiones', n: [1, 3, 6, 10, 16] },
  { k: 'zone', t: 'Llega a la edición {n}', n: [2, 3, 4, 6, 8], run: 1 },
  { k: 'deliv', t: 'Haz {n} entregas', n: [8, 20, 40, 70, 110] },
  { k: 'perf', t: 'Haz {n} entregas perfectas', n: [4, 10, 20, 35, 60] },
  { k: 'near', t: 'Pasa rozando a {n} personas', n: [5, 12, 25, 40, 60] },
  { k: 'civic', t: 'Respeta {n} semáforos en rojo', n: [1, 3, 6, 10, 15] },
  { k: 'grind', t: 'Desliza {n} m por barandas', n: [30, 80, 160, 280, 450] },
  { k: 'duels', t: 'Gana {n} duelos a rivales', n: [1, 2, 4, 7, 10] },
  { k: 'dstreak', t: 'Encadena {n} entregas seguidas', n: [3, 5, 8, 12, 16], run: 1 }
];

const RANKS = ['Novato', 'Aprendiz', 'Ciclista', 'Rodador', 'Acróbata', 'Veloz', 'Experto', 'Maestro', 'Élite', 'Leyenda'];
const RANKXP = [0, 400, 1200, 2800, 5500, 9500, 15000, 23000, 34000, 50000];
const rankOf = xp => { let i = 0; while (i < RANKXP.length - 1 && xp >= RANKXP[i + 1]) i++; return i; };

/* Ranking de la ciudad (rivales ficticios) */
const CITY = [
  ['Don Gustavo', 250000], ['La Patinadora', 120000], ['Capitana Cometa', 90000], ['Rueda Loca', 65000], ['Mango Biche', 48000],
  ['Doña Ciclo', 36000], ['El Ollie', 27000], ['Kiko Quad', 20000], ['Paz Pedal', 15000], ['Lu Neón', 11000],
  ['Tomás Turbo', 8200], ['Bache Bravo', 6000], ['Sofi Scooter', 4500], ['Nico Manubrio', 3200], ['La Canasta', 2300],
  ['Pepe Piñón', 1600], ['Rita Rampa', 1100], ['Juancho Cono', 700], ['Bici Bebé', 400], ['El Domingo', 200]
];

const TIPS = [
  'Desliza ↓ en el aire para caer rápido y agacharte al tocar el suelo.',
  'Dos golpes leves en 3 segundos te tumban: conos, charcos y roces cuentan.',
  'Los carriles de la izquierda vienen de frente: úsalos solo para adelantar.',
  'Toca el botón de entrega cuando el aro esté verde: entrega PERFECTA y doble puntaje.',
  'En rojo cruzan carros. Mantén FRENO, espera el verde y ganas puntos por buen ciudadano.',
  'En las bajadas fuertes frena un poco o perderás el control.',
  'El impulso gasta aliento. Entrena a pie o en vehículos de fuerza y tu capacidad física crece.',
  'Con motor no superes el límite: si te sigue la policía, acelera a fondo o frena y cambia de carril.',
  'Salta sobre las barandas para deslizar: dan puntos, estilo y energía.',
  'Si un animalito cruza, frena o pasa por donde ya cruzó.',
  'Las zonas libres recargan tu energía y los trucos valen doble.',
  'Los mentores enseñan habilidades: cúmpleles un favor o págales la clase.',
  'Cada 1000 m cambia la edición: Orbe tiene barrios de todo el mundo.',
  'Las páginas perdidas cuentan la historia de Don Gustavo.',
  'El Reto del día es igual para todos: misma ruta, mismo orden de obstáculos.'
];

/* Mentores: personajes especiales que enseñan habilidades (por un favor o pagando la clase) */
const MENT = [
  { id: 'kiko', look: { skin: '#8a5a3a', hair: 'corto', hc: '#141010', acc: 'banda', shirt: '#ff5a2a' }, barrio: 'Pequeña Lagos', vfav: 'A pie (y por las paredes)', frase: 'Si hay muro, hay camino.', bio: 'Creció saltando bancas en Pequeña Lagos y hoy entrena a los repartidores más jóvenes. Dicen que una vez entregó el periódico subiendo por el andamio de la torre del reloj. Enseña a caer bien antes que a saltar alto.', name: 'Kiko Parkour', perk: 'parkour', hab: 'Parkour', desc: 'Doble salto a pie y en todo vehículo de fuerza.', favor: 'Recorre 8.000 m a pie', key: 'footM', n: 8000, price: 3000, col: '#ff5a2a' },
  { id: 'pati', look: { skin: '#c98e62', hair: 'moño', hc: '#a42cff', acc: 'gafas', shirt: '#a42cff' }, barrio: 'Avenida Neón', vfav: 'Patines en línea', frase: '¡Esto no es una carrera, es una conversación!', bio: 'Patina la Avenida Neón cada noche desde hace quince años. Fue la primera en llevar EMSAY sobre ruedas y nunca ha perdido una página. Le encanta conversar mientras derrapa entre la gente sin rozar a nadie.', name: 'La Patinadora', perk: 'derrape', hab: 'Derrape', desc: 'Cambias de carril 20 % más rápido.', favor: 'Pasa rozando a 60 personas', key: 'near', n: 60, price: 3500, col: '#a42cff' },
  { id: 'correo', look: { skin: '#e0b089', hair: 'canoso', hc: '#d8d8d8', acc: 'gorra', shirt: '#0e6378' }, barrio: 'Centro de Orbe', vfav: 'Triciclo de carga', frase: 'Una carta a tiempo vale por dos.', bio: 'Jefa de correspondencia de EMSAY desde antes de que existiera la ciclovía. Conoce de memoria cada buzón de Orbe y el nombre de cada perro de cada casita. Su lanzamiento de sobres es leyenda en la redacción.', name: 'Doña Correo', perk: 'brazo', hab: 'Brazo de cartero', desc: 'Entregas perfectas más fáciles y desde más lejos.', favor: 'Haz 80 entregas perfectas', key: 'perf', n: 80, price: 4000, col: '#0e6378' },
  { id: 'tito', look: { skin: '#5a3a24', hair: 'calvo', hc: '#111', acc: 'silbato', shirt: '#c49a2c' }, barrio: 'Sabana Dorada', vfav: 'Bicicleta', frase: 'Respira, pedalea, repite.', bio: 'Exmaratonista y entrenador de la selección de Orbe. Corre al lado de sus alumnos con un silbato y un termo de aguapanela. Asegura que el aliento se entrena como cualquier músculo, un metro a la vez.', name: 'Entrenador Tito', perk: 'pulmon', hab: 'Pulmón de acero', desc: '+30 % de aliento y lo recuperas más rápido.', favor: 'Usa el impulso 1.500 veces', key: 'boosts', n: 1500, price: 4500, col: '#c49a2c' },
  { id: 'freno', look: { skin: '#f0c9a8', hair: 'coleta', hc: '#5a3a1e', acc: 'casco', shirt: '#c0191c' }, barrio: 'Puente del Río Mundo', vfav: 'Monopatín eléctrico', frase: 'Frenar a tiempo también es ganar.', bio: 'Instructora de seguridad vial y fan número uno de los semáforos. Ha enseñado a medio Orbe a bajar las cuestas sin desbocarse. Los perros del barrio la saludan porque siempre pasa despacio frente a sus casas.', name: 'Maestra Freno', perk: 'freno', hab: 'Freno fino', desc: 'Frenas 40 % más rápido y los perros no te persiguen.', favor: 'Respeta 25 semáforos en rojo', key: 'civic', n: 25, price: 3500, col: '#c0191c' },
  { id: 'ollie', look: { skin: '#c98e62', hair: 'corto', hc: '#e0b84a', acc: 'gorra2', shirt: '#2dffb3' }, barrio: 'Barrio Sakura', vfav: 'Skate', frase: 'Cada baranda es una página en blanco.', bio: 'Skater del Barrio Sakura que convirtió el parque del Kilómetro Cero en su sala de clases. Inventó tres trucos que llevan su nombre y los regala a quien le haga un buen deslizamiento.', name: 'Ollie', perk: 'trucos', hab: 'Trucos de calle', desc: 'Trucos y barandas valen el doble.', favor: 'Desliza 1.200 m por barandas', key: 'grind', n: 1200, price: 5000, col: '#2dffb3' },
  { id: 'gus', look: { skin: '#d9a47e', hair: 'canoso', hc: '#e6e6e6', acc: 'boina', shirt: '#1b4459', must: 1 }, barrio: 'Kilómetro Cero', vfav: 'Bicicleta antigua', frase: 'La revista nunca fue mía. Es de quien la reparte.', bio: 'Fundador de EMSAY. Desapareció hace diez años el día que inauguraron la ciclovía y desde entonces deja notas en los márgenes de las páginas perdidas. Algunos dicen que aún reparte en algún carril de Orbe.', name: 'Don Gustavo', perk: 'ojo', hab: 'Ojo de editor', desc: 'Aparecen más páginas perdidas y letras.', favor: 'Recupera 30 páginas', key: 'pages', n: 30, price: 6000, col: '#e8e4c4' },
  { id: 'cometa', look: { skin: '#a8754e', hair: 'coleta', hc: '#141010', acc: 'aviador', shirt: '#39c8ff' }, barrio: 'Puerto Nórdico', vfav: 'Jetpack', frase: '¿Atajo? Mejor por arriba.', bio: 'Inventora y piloto del único jetpack de reparto del mundo. Entrega los pedidos urgentes del Puerto Nórdico volando sobre los tejados. Solo le presta su invento a quien gane suficientes duelos en la ciclovía.', name: 'Capitana Cometa', perk: '', veh: 'jetpack', hab: 'Te regala su Jetpack', desc: 'El vehículo más especial de Orbe.', favor: 'Gana 15 duelos a rivales', key: 'duels', n: 15, price: 60000, col: '#39c8ff' }
];
/* Nombres de trucos por vehículo: [salto, truco 1, truco 2] */
const TRK = {
  foot: ['Salto de gato', 'Mortal', 'Giro 360'], quad: ['Giro 360', 'Mortal', 'Spagat'], inline: ['Giro 360', 'Mortal', 'Spagat'], skate: ['Ollie', 'Kickflip', '360 Flip'],
  long: ['Ollie', 'Shove-it', 'Slide'], scooter: ['Bunny hop', 'Tailwhip', 'Barspin'], uni: ['Salto', 'Giro', 'Salto loco'], bike: ['Bunny hop', 'Tailwhip', 'Superman'],
  trike: ['Salto', 'Caballito', 'Giro'], ebike: ['Bunny hop', 'Tailwhip', 'Superman'], escooter: ['Salto', 'Tailwhip', 'Barspin'], euc: ['Salto', 'Giro', 'Mortal'],
  moped: ['Salto', 'Caballito', '360'], moto: ['Salto', 'Caballito', 'Superman'], auto: ['Salto', 'Giro', 'Tonel'], camion: ['Salto', 'Giro', 'Tonel'], jetpack: ['Despegue', 'Tirabuzón', 'Rizo']
};
/* Evento especial de Orbe según el día de la semana (domingo = 0) */
const EVT = [
  { id: 'dominical', name: 'Edición dominical', desc: 'Todas las entregas valen ×1,5', bill: 10 },
  { id: 'libro', name: 'Feria del Libro de Orbe', desc: 'El doble de páginas perdidas', bill: 10 },
  { id: 'maraton', name: 'Maratón de la Ciclovía', desc: 'Corredores por todas partes y +50 % de XP', bill: 12 },
  { id: 'carnaval', name: 'Carnaval de las Mil Ruedas', desc: 'Monedas ×1,5 y confeti para todos', bill: 11 },
  { id: 'correo', name: 'Jueves de Correo', desc: 'El correo vale el doble', bill: 10 },
  { id: 'cometas', name: 'Festival de Cometas', desc: 'Muchos más paraguas planeadores', bill: 13 },
  { id: 'pulgas', name: 'Mercado de las Pulgas', desc: 'Más regalos en la vía', bill: 10 }
];
const evToday = () => EVT[new Date().getDay()];
/* Rivales: otros repartidores que compiten contigo */
const RIV = [['Rueda Loca', '#ff5a2a'], ['Lu Neón', '#a42cff'], ['Tomás Turbo', '#ffc23a'], ['Sofi Scooter', '#2dffb3'], ['Nico Manubrio', '#39c8ff']];
/* Secciones de las páginas de EMSAY */
const SECT = { h: 'Historia', f: 'Farándula', n: 'Noticias', l: 'Libros', e: 'Eventos', d: 'Editorial' };
/* Orbe: la ciudad donde caben todas las ciudades */
['Centro de Orbe', 'Barrio Sakura', 'Puerto Nórdico', 'La Medina', 'Pequeña Lagos', 'Sabana Dorada', 'Avenida Neón', 'Malecón del Caribe', 'Bosque Nublado', 'Alto Andino', 'Puente del Río Mundo'].forEach((b, i) => { ZRAW[i].sub = b; });
ZRAW[1].scen[0] = hex('#f4a6c0');

/* ---- RunRunZero/src/story.js ---- */
/* Páginas perdidas de EMSAY · [título, texto, sección] */
const STORY = [
  ['La rotativa en blanco', 'Domingo, seis de la mañana. La rotativa de EMSAY escupió una edición completamente en blanco, con una sola nota: «Las palabras se fueron a rodar». La editorial convocó a los mejores velocistas de Orbe. Yo me até los zapatos y salí a pie, porque todo viaje empieza con los pies.', 'h'],
  ['Luna y el pato', 'La cantante Luna Brisa llegó tarde a su concierto en el Malecón porque se detuvo a ayudar a un pato que no sabía cruzar. El público aplaudió más fuerte por el pato que por la primera canción. Ella dijo: «Ese pato tiene mejor ritmo que mi baterista».', 'f'],
  ['Semáforo con hipo', 'El semáforo del cruce de la Avenida Neón amaneció con hipo: cambiaba de verde a rojo cada tres segundos. Los técnicos le dieron un vaso de agua, o eso dijeron. Hoy funciona normal, aunque el Agente Pito vigila de cerca, por si el hipo regresa.', 'n'],
  ['Don Quijote sobre ruedas', 'Miguel de Cervantes escribió «Don Quijote de la Mancha», una novela de un caballero soñador que confunde molinos con gigantes. Si algún día tu bici se avería, piensa en él: lo importante es seguir cabalgando, aunque el camino tenga baches. Léelo con humor, que fue escrito con mucho.', 'l'],
  ['Feria del Libro', 'Cada otoño, la Feria del Libro de Orbe llena el Puente del Río Mundo de casetas con cuentos, poemas y mapas. EMSAY instala su kiosco más grande y regala marcapáginas con forma de rueda. Los niños leen en voz alta bajo carpas, y los lectores tímidos encuentran su sitio.', 'e'],
  ['La rotativa canta', 'En la sala de máquinas de EMSAY, la rotativa tiene un canto propio: un tarareo grave que se oye desde la calle. Los impresores dicen que es su forma de decir buenos días. Si un día se calla, saben que algo anda mal, y corren a darle aceite y cariño.', 'd'],
  ['Chef sobre patines', 'El famoso chef Tamarindo Ruiz sorprendió en Pequeña Lagos: prepara sus arepas rellenas patinando entre las mesas. Dice que el movimiento le da sabor. Ya se ha caído tres veces, pero ningún plato, y los clientes piden más vueltas y más queso.', 'f'],
  ['Patos en hora pico', 'Una familia de siete patos cruzó la ciclovía en plena hora pico, y todos los carriles se detuvieron con respeto. Los repartidores esperaron sonriendo y hasta sacaron fotos. El pato mayor agradeció con un graznido, y el tránsito reanudó su marcha sin un solo bocinazo.', 'n'],
  ['Macondo en la ciclovía', 'Gabriel García Márquez imaginó Macondo en «Cien años de soledad», un pueblo donde la realidad y la fantasía caminan juntas. Es un libro para leer despacio, como quien pedalea con tiempo. Quizá encuentres mariposas amarillas, y descubras que a veces el viento también cuenta historias.', 'l'],
  ['Huellas de llanta', 'Mi primera pista apareció pegada a un poste del Malecón del Caribe: una página suelta, con huellas de llanta estampadas encima. Olía a pan recién horneado, como si alguien la hubiera sacado del horno. Entendí que las palabras no se perdieron; salieron a pasear y dejaron rastro.', 'h'],
  ['Carnaval Mil Ruedas', 'El Carnaval de las Mil Ruedas reúne a patinadores, monociclistas y triciclos con disfraces de todos los colores. Este año ganó un dragón de papel sobre cuatro bicicletas, con una cola de treinta metros. La música no paró en tres días, ni tampoco las empanadas calientes de la Medina.', 'e'],
  ['Erratas famosas', 'Entre las erratas más famosas de EMSAY está una nota que decía «el alcalde inauguró un puente de pan». Quería decir «de piedra». Los lectores pidieron probar el puente. Los correctores, tras reír, aprendieron a leer dos veces y a comer menos durante la revisión.', 'd'],
  ['Mía Cascabel estrena gorra', 'La actriz Mía Cascabel apareció en la alfombra roja de la Avenida Neón con una gorra de repartidora EMSAY. Dijo que es su amuleto desde que entregó revistas para un papel. Los fotógrafos pidieron que se la quitara; ella respondió: «Primero entrego, después poso».', 'f'],
  ['Lluvia de cometas', 'El Alto Andino registró una lluvia de cometas sueltas tras un ventarrón sorpresivo. Los niños recogieron más de doscientas en una tarde. Las autoridades piden devolverlas a sus dueños, y recuerdan que las cometas, como las palabras, siempre quieren volver a casa.', 'n'],
  ['El jardín de senderos', 'Jorge Luis Borges nos dejó cuentos como «El jardín de senderos que se bifurcan», sobre caminos que se abren como ramas. Es perfecto para leer cuando dudas qué ruta tomar. Dicen que en el fondo todos los mapas son laberintos amables, y los libros, buenos faroles.', 'l'],
  ['Maratón de la Ciclovía', 'La Maratón de la Ciclovía recorre toda Orbe: Malecón, Avenida Neón, Bosque Nublado y Puente del Río Mundo. No importa la velocidad, sino llegar con una sonrisa. En la meta esperan limonada, guarapo y abrazos de la Maestra Freno, que repite siempre: «Todos llegan, solo cambia la hora».', 'e'],
  ['Tilde, gato impresor', 'El gato de la imprenta, llamado Tilde, duerme sobre las hojas calientes recién impresas. Es el único que firma con huellas. Los empleados juran que cada vez que Tilde ronronea, la edición sale perfecta. Si bosteza, hay que revisar la tinta otra vez.', 'd'],
  ['Gol en cometa', 'El delantero Bruno Relámpago y la arquera Zoe Guantes protagonizaron un desafío amistoso en el Alto Andino: él pateaba, ella atajaba, y el balón terminó colgado de una cometa. Nadie sabe quién ganó, pero todos coinciden en que fue el partido más alto de la temporada.', 'f'],
  ['Oír y escuchar', 'En el margen de la página había una letra apretada, inclinada hacia adelante, como con prisa: «Oír es sentir el viento. Escuchar es saber hacia dónde sopla». Me quedé quieto, cerré los ojos y por fin lo entendí: para seguir las páginas, primero tenía que aprender a escuchar.', 'h'],
  ['Récord de entregas', 'El repartidor Nico Manubrio batió el récord semanal: entregó novecientas revistas sin una sola queja y con cero pinchazos. Al preguntarle su secreto, respondió: «Saludar a todos y mirar siempre hacia adelante». Le entregaron una medalla… que, claro, dejó en el primer buzón.', 'n'],
  ['Rondas de Gabriela', 'La poeta chilena Gabriela Mistral escribió rondas y canciones para los niños, llenas de ternura y de cielo. Fue la primera latinoamericana en ganar el Premio Nobel de Literatura. Sus versos se pueden leer mientras esperas un semáforo en rojo, y te hacen sentir cuidado.', 'l'],
  ['Festival de Cometas', 'En agosto, el Alto Andino se llena de cometas de mil formas: peces, dragones, ballenas y hasta un cartero con alas. Los niños las elevan con hilo de colores y sueños. Quien consigue el vuelo más largo recibe una medalla y el privilegio de bautizar al próximo viento.', 'e'],
  ['Cartas de lectores', 'El buzón de lectores de EMSAY recibe cada semana mil cartas: algunas piden recetas, otras aclaran dudas y varias solo dicen gracias. Doña Correo las lee todas. La carta más repetida es esta: «Sigan rodando». Ella las pega en el tablón de la sala con alfileres de colores.', 'd'],
  ['Camila, carril lento', 'Camila Pedal, famosa por sus videos en la ciclovía, confesó su secreto: pedalea despacio a propósito para saludar a todos. Ya suma un millón de seguidores y mil perros que le ladran contentos. Su consejo del día: «Llegar tarde con una sonrisa vale más que llegar temprano sin ella».', 'f'],
  ['El Agente Pito sorprende', 'El Agente Pito detuvo a un ciclista que superaba el límite de velocidad, pero no le puso multa: le regaló un casco nuevo y una charla sobre frenos. «Prefiero repartir consejos que multas», explicó. El ciclista prometió ir más despacio y regresar a darle las gracias.', 'n'],
  ['Sor Juana la curiosa', 'Sor Juana Inés de la Cruz, monja y poeta mexicana del siglo diecisiete, defendió el derecho a aprender y escribir. Era curiosa como un repartidor que quiere conocer todos los atajos. Sus poemas siguen vivos, y su valentía invita a leer sin pedir permiso.', 'l'],
  ['Noche de los Museos', 'Una noche al año, los museos de Orbe abren sus puertas hasta la madrugada, con linternas y música. Los niños buscan tesoros entre estatuas, y los abuelos cuentan historias frente a los cuadros. EMSAY reparte un mapa especial que termina en el museo más curioso: el de los relojes.', 'e'],
  ['El editor perdido', 'Doña Correo me contó la historia en voz baja. Hace diez años, el día que inauguraron la ciclovía, Don Gustavo, fundador de EMSAY, salió en bicicleta a entregar la última edición. Nunca volvió a la redacción. Su escritorio sigue intacto, con la taza todavía tibia, dicen los más soñadores.', 'h'],
  ['La sala de redacción', 'En la sala de redacción de EMSAY hay veinte escritorios, cuarenta tazas y un reloj que adelanta cinco minutos para que nadie llegue tarde. Las paredes están cubiertas de portadas viejas. El escritorio del fondo, vacío y limpio, es el de Don Gustavo, y nadie lo mueve.', 'd'],
  ['Gemelos Arpa-Tambor', 'Los gemelos músicos Arpa y Tambor se pelearon por quién tocaría primero en la Noche de los Museos, y terminaron tocando a dúo en una sola canción de seis minutos. El público pidió repetirla. Ahora dicen que se pelean a propósito para componer mejor.', 'f'],
  ['Nace un nuevo carril', 'La alcaldía inauguró un tercer sendero para peatones junto a la ciclovía del Malecón del Caribe. Los caminantes estrenaron zapatos nuevos y los abuelos, bastones adornados. Durante el corte de cinta, un perro se adelantó y cruzó primero, con orgullo de pionero.', 'n'],
  ['Popol Vuh', 'El Popol Vuh es un libro sagrado del pueblo maya kiché, que cuenta cómo nació el mundo y cómo los gemelos héroes derrotaron a los señores de Xibalbá. Es antiguo, misterioso y lleno de aventuras. Léelo con respeto, como quien recibe una carta de otro siglo.', 'l'],
  ['Día sin Carro', 'El Día sin Carro, Orbe se llena de bicicletas, patines, monopatines y caminantes. Las calles se vuelven un parque enorme donde se juega, se baila y se come sin ruido. Los autos duermen en el garaje, y hasta los pájaros comentan que el aire huele distinto.', 'e'],
  ['Consejo del repartidor', 'Doña Correo reparte siempre este consejo: antes de salir, revisa la ruta, los frenos y la sonrisa. Una entrega lleva más que papel: lleva ilusión. Un buzón mal cerrado no es un pecado, pero una cara amable abre cualquier puerta, incluso las más tímidas del barrio.', 'd'],
  ['Zapatos de oro', 'La corredora Pepa Luz recibió unos zapatos deportivos bañados en dorado por ganar la Maratón de la Ciclovía. Pero los usa solo para dormir, porque dice que le dan sueños veloces. En la pista sigue corriendo con sus viejas zapatillas remendadas, como siempre.', 'f'],
  ['Gato atrapado en buzón', 'Un gato naranja fue hallado dormido dentro de un buzón del Barrio Sakura. El cartero lo rescató, y lo entregó a su dueña con sello de «Correo exprés». El felino, ofendido, exigió un desayuno. Las autoridades recomiendan revisar los buzones antes de depositar cartas.', 'n'],
  ['Rueda con ojo', 'Cada página perdida traía un pequeño dibujo en una esquina: una rueda con un ojo en el centro. Kiko Parkour dijo que era un adorno; la Patinadora, que era una advertencia. Yo creo que es una invitación: mirar con atención, leer entre líneas y rodar siempre con los ojos abiertos.', 'h'],
  ['Mil y una noches', 'En «Las mil y una noches», Scheherezade salva su vida contando historias cada noche, y nunca se queda sin una nueva. Es un recordatorio de que contar es un acto de valentía. Aladino, Simbad y alfombras voladoras esperan a todo lector curioso de la ciudad.', 'l'],
  ['Regata del Río Mundo', 'La Regata del Río Mundo reúne barquitos de papel, canoas y balsas decoradas por vecinos de todos los barrios. Gana el que llegue primero al Puerto Nórdico, o el que luzca más ingenio. Este año triunfó una balsa con forma de libro abierto, tripulada por tres gatos.', 'e'],
  ['Los correctores', 'Los correctores de EMSAY trabajan con lápices rojos, lupas y mucha paciencia. Su regla de oro: una coma bien puesta salva una frase. Una vez corrigieron una nota sobre «tortugas veloces» y descubrieron que iba sobre «tortugas feroces». Nadie sabe cuál era más cierta.', 'd'],
  ['Don Cuchara abre', 'El chef Don Cuchara inauguró su segundo restaurante en el Barrio Sakura, donde mezcla sopa de miso con arepa de choclo. Los críticos quedaron intrigados, y los niños, encantados. El menú tiene un solo aviso: «Prohibido hablar de dietas antes del postre».', 'f'],
  ['Tormenta de limonada', 'Una falla en la caseta del Puente del Río Mundo hizo brotar un chorro de limonada que refrescó a toda la ciclovía durante cinco minutos. Los corredores abrieron la boca, los niños sacaron vasos y los técnicos, sonrojados, cerraron la válvula con una toalla.', 'n'],
  ['La Odisea de Homero', 'La «Odisea» de Homero narra el largo regreso de Ulises a casa, con tormentas, monstruos y sirenas. Es la mejor guía para quien se pierde por el camino y aun así quiere llegar. Si alguna vez tu ruta se alarga, recuerda a Ulises: lo importante es no rendirse.', 'l'],
  ['Mercado de las Pulgas', 'Cada domingo, el Mercado de las Pulgas abre en la Medina con juguetes antiguos, discos de vinilo y libros que ya conocen medio mundo. Los repartidores aprovechan para cambiar piezas de bicicleta. Si regateas con cariño, el vendedor te regala un caramelo, y a veces una historia entera.', 'e'],
  ['Tinta de colores', 'El taller de tinta de EMSAY prepara más de cien colores. El favorito de los lectores es un azul profundo llamado «Atardecer en el puerto». El menos querido es un verde pantano. Los aprendices mezclan colores con delantales manchados y orgullo en la mirada.', 'd'],
  ['No es una carrera', 'Rueda Loca, Lu Neón, Tomás Turbo, Sofi Scooter y Nico Manubrio también perseguían páginas, y al principio nos quitábamos las entregas a codazos limpios. Hasta que Sofi gritó en plena Avenida Neón: «¡Esto no es una carrera, es una conversación!». Y desde entonces nos pasamos los datos.', 'h'],
  ['Rumores en Neón', 'Corre el chisme de que la estrella Valentina Destello planea cantar disfrazada de farol en la Avenida Neón. Su equipo lo niega, pero esta semana un farol cantó muy afinado. Los vecinos dejaron flores bajo cada poste, por si acaso, y el alcalde pidió revisar las bombillas.', 'f'],
  ['Monociclo contra el viento', 'El monociclista Tomás Turbo cruzó el Puente del Río Mundo a contraviento, con un sombrero que se negó a quitar. Llegó despeinado pero feliz. El puente, dicen, se movió un poquito de admiración. Su próximo reto: hacerlo con un paraguas, y sin sombrero.', 'n'],
  ['Shakespeare en escena', 'William Shakespeare escribió obras como «Sueño de una noche de verano», una comedia con hadas, enredos y un asno muy simpático. Hace más de cuatrocientos años que hace reír a Orbe y al mundo. Es ideal para leer en voz alta, con voces graciosas y capas improvisadas.', 'l'],
  ['Festival de la Linterna', 'En el Barrio Sakura, el Festival de la Linterna ilumina las calles con faroles de papel pintados a mano. Los vecinos escriben deseos y los cuelgan en las ramas. Después, la ciclovía se llena de luz flotante. Es la noche perfecta para pedir algo bonito y compartir un té.', 'e'],
  ['La biblioteca interna', 'En el tercer piso de EMSAY hay una pequeña biblioteca con todas las ediciones desde la fundación. Se huele a papel viejo y a cuentos felices. Los empleados leen ahí a la hora del almuerzo, y a veces encuentran marcapáginas olvidados con dedicatorias de Don Gustavo.', 'd'],
  ['Nuevo récord de autógrafos', 'El cantante Sebastián Cometa firmó dos mil autógrafos en una sola tarde, y terminó firmando hasta los helados de los fans. Su mano quedó tan cansada que pidió masajes de aplausos. Dijo que lo volverá a intentar, pero con un bolígrafo de repuesto y música suave.', 'f'],
  ['Nuevo alumbrado nocturno', 'Los faroles de la ciclovía ahora brillan en tonos suaves que cambian según la hora: dorado al atardecer, azul en la noche. Los vecinos del Puerto Nórdico lo llaman «el amanecer prestado». Los repartidores nocturnos aseguran que ahora les cuesta menos pedalear con buen ánimo.', 'n'],
  ['Austen y paseos', 'Jane Austen, escritora inglesa, creó «Orgullo y prejuicio», donde Elizabeth Bennet aprende a mirar más allá de las apariencias. Es una novela de conversaciones inteligentes y paseos a pie. Ideal para repartidores que disfrutan de las pausas, y para quien sabe que las primeras impresiones engañan.', 'l'],
  ['El mapa', 'Juntamos las páginas sobre la mesa de la redacción y apareció un mapa dibujado con tinta. La ciclovía rodea toda Orbe, pasa por Pequeña Lagos, el Alto Andino y el Puente del Río Mundo, y se cruza consigo misma en un solo punto, marcado con una cruz: el Kilómetro Cero.', 'h'],
  ['Feria del Café Andino', 'En el Alto Andino, las fincas cafeteras celebran cada año la Feria del Café con catas, música y bailes. Los repartidores de EMSAY llegan con paquetes de revistas y regresan con bolsas de grano. El aroma llena el valle, y hasta el burro del lugar luce un delantal elegante.', 'e'],
  ['Diseñadores de portadas', 'Los diseñadores de portadas de EMSAY pasan horas escogiendo letras, fotos y colores. Cada semana, la portada debe contar una historia sin palabras. La favorita del año fue un dibujo de un buzón florecido. Los lectores la recortaron para decorar cuartos, escuelas y cafeterías.', 'd'],
  ['Actriz y gato', 'La actriz Ámbar Delgado fue sorprendida ensayando con un gato de la imprenta que maúlla en do mayor. Ahora ambos preparan un dúo para la Feria del Libro. Ella asegura que él no tiene mal carácter: solo es un artista muy exigente con el público.', 'f'],
  ['Camión de mudanzas bloquea', 'Un camión de mudanzas se detuvo frente a la ferretería del Barrio Sakura, y los repartidores formaron una fila para pasar uno por uno. Nadie tocó la bocina: el conductor repartió galletas. La mudanza terminó en una hora, con un gran aplauso y cero tropiezos.', 'n'],
  ['Verne, vuelta al mundo', 'Julio Verne imaginó «La vuelta al mundo en ochenta días», donde Phileas Fogg apuesta a recorrer el planeta en tiempo récord. Aunque la historia se escribió hace más de un siglo, sigue siendo rápida y divertida. Perfecta lectura para quien ama el movimiento y los mapas.', 'l'],
  ['Desfile de Mascotas', 'El Desfile de Mascotas llena la Avenida Neón de perros con corbata, gatos con capa y un loro con gafas de sol. Un jurado de niños reparte premios al más elegante y al más tranquilo. El Agente Pito dirige el tránsito con un silbato muy educado y una sonrisa enorme.', 'e'],
  ['Reunión del lunes', 'Los lunes en EMSAY hay reunión con galletas. Cada quien cuenta lo que descubrió el fin de semana y propone un tema. La regla: nadie interrumpe al que habla, salvo el gato Tilde, que maúlla cuando algo le parece buena idea. Así nacen las mejores portadas.', 'd'],
  ['Teo cambia de look', 'El futbolista Teo Ráfaga se tiñó el cabello de color verde cancha antes de la gran final, y dijo que era para confundir a los defensas. Ganó su equipo, pero los hinchas aseguran que fue por el peinado. Teo sonrió y prometió un próximo color: celeste cometa.', 'f'],
  ['Tiza negra', 'Una mañana, la ciclovía amaneció llena de baches pintados con tiza negra: huecos falsos que hacían frenar en seco a los repartidores. Alguien los dibujaba de noche para retrasarnos. El Agente Pito investigó, pero Maestra Freno sonrió: «Quien dibuja baches teme que lleguemos primero».', 'h'],
  ['Perros en la maratón', 'Doce perros se colaron en la Maratón de la Ciclovía y cruzaron la meta antes que los humanos. Los organizadores decidieron premiar a todos con una medalla de hueso. El ganador absoluto, un salchicha llamado Canelo, aseguró: «Todo fue gracias a mis patas largas».', 'n'],
  ['Frankenstein de Mary Shelley', 'Mary Shelley escribió «Frankenstein» siendo muy joven, durante unas vacaciones lluviosas. Es una novela sobre ciencia, soledad y la responsabilidad de crear. No es solo una historia de miedo: también habla de la ternura que todos necesitamos. Léela con luz encendida y una taza caliente cerca.', 'l'],
  ['Concierto en el Puente', 'Cada primer viernes del mes, músicos de todos los barrios tocan en el Puente del Río Mundo. Se mezclan guitarras, arpas, tamboras y flautas de bambú. El público escucha sentado en el suelo, y los repartidores aprovechan para soltar el manubrio y bailar un ratito.', 'e'],
  ['Cuadro de honor', 'En la entrada de EMSAY hay un cuadro de honor con los nombres de los repartidores más constantes. Para entrar no hace falta ser veloz, sino fiel: llegar siempre, con lluvia, con sol y con cuesta. Al final del año, se añaden nombres nuevos con letras doradas.', 'd'],
  ['Concierto sobre ruedas', 'La banda Los Rodantes tocó su concierto completo sobre una plataforma con ruedas que recorrió la ciclovía durante tres horas. El baterista se mareó, el bajista se sonrojó y la cantante pidió más velocidad. Los repartidores aplaudieron al pasar, entregando revistas a ritmo de ska.', 'f'],
  ['Bache bautizado', 'El bache más famoso del Alto Andino, apodado «El Abuelo», fue reparado por la cuadrilla municipal. Los vecinos organizaron una pequeña despedida con pastel de guayaba. Un niño preguntó dónde irían los baches jubilados, y el alcalde respondió: «A descansar en el cielo de los asfaltos».', 'n'],
  ['El Principito', 'Antoine de Saint-Exupéry fue aviador y escribió «El Principito», un cuento sobre un niño de otro planeta que aprende lo que importa. «Lo esencial es invisible a los ojos», dice el zorro. Es un libro corto que se lee en una tarde y se recuerda toda la vida.', 'l'],
  ['Olimpiada de Trucos', 'La Olimpiada de Trucos reunió a skaters, patinadores y monociclistas en la zona libre de la ciclovía. Ollie ejecutó un giro doble que dejó al público sin aliento. Los jueces, con tarjetas de colores, premiaron la creatividad más que la altura. Hubo abrazos, aplausos y mucha limonada.', 'e'],
  ['La Tinta Gris', 'En el Bosque Nublado encontré una mancha extraña que se arrastraba sobre las calles: la Tinta Gris. Se come las palabras que nadie lee, y las dejaba desteñidas, como fotos viejas. Entendí el peligro: una historia que no se lee, poco a poco, se olvida hasta desaparecer.', 'h'],
  ['Café de la madrugada', 'A las cuatro de la mañana, cuando la rotativa empieza a rodar, el cocinero Chucho prepara café para los impresores. Su receta es secreta, aunque todos sospechan que lleva canela. Dicen que con esa taza las letras salen más derechas y los chistes, más cortos.', 'd'],
  ['Romance en la heladería', 'Un chisme dulce: la pastelera Rosalía Canela y el piloto Marcos Alas fueron vistos compartiendo un helado de maracuyá en el Puerto Nórdico, con dos cucharas y una sola sonrisa. Ambos juran que solo hablaban de trabajo. Nadie les creyó, ni el helado, que se derritió de ternura.', 'f'],
  ['Arcoíris sobre el río', 'Un arcoíris doble apareció sobre el Puente del Río Mundo tras la llovizna de mediodía. Los repartidores frenaron para admirarlo, y las entregas se retrasaron cinco minutos. Los lectores, al enterarse del motivo, respondieron con tarjetas de agradecimiento y bizcochos.', 'n'],
  ['Genji y las cartas', 'Murasaki Shikibu, dama de la corte japonesa del siglo once, escribió «La historia de Genji», considerada una de las primeras novelas del mundo. Está llena de cartas, poemas y paisajes. Es larga, pero se disfruta por capítulos, como quien reparte correo con paciencia y cariño.', 'l'],
  ['Noche de Cuentacuentos', 'La Noche de Cuentacuentos transforma plazas y parques de Orbe en pequeños teatros al aire libre. Abuelos, niños y viajeros cuentan historias de lugares lejanos. Los oyentes votan con aplausos y el ganador recibe un gorro de cuentista, tejido por Doña Correo con lana de colores.', 'e'],
  ['El archivo de fotos', 'El archivo de fotografías de EMSAY guarda millones de imágenes: ferias, carnavales, perros y nubes. Los archivistas las ordenan con paciencia de relojero. Una foto muy querida muestra a Don Gustavo sonriendo sobre su bicicleta el día de la inauguración de la ciclovía.', 'd'],
  ['Estreno con estornudos', 'El estreno de la película «La Bruma Cantora» se vio interrumpido por una ola de estornudos: la actriz principal usó pimienta real en una escena. El director dijo que la risa del público fue mejor que cualquier aplauso. La película sigue en cartelera, ahora con pañuelos gratis.', 'f'],
  ['Reparto en jetpack', 'Capitana Cometa realizó la primera entrega con jetpack desde la torre de la redacción hasta una azotea en Pequeña Lagos. Aterrizó suave y entregó la revista antes de que el cartero terminara su café. Pidió disculpas al gorrión que se asustó con el despegue.', 'n'],
  ['Un metro por lector', 'Descubrimos algo asombroso: cada vez que entregaba una revista a tiempo y alguien la leía, la Tinta Gris retrocedía un metro. Un metro por lector. Todo el equipo entendió el plan: repartir más rápido y mejor, porque cada lector abierto es un pedacito de ciudad que se salva.', 'h'],
  ['Bashō y el camino', 'Matsuo Bashō, poeta japonés, recorrió caminos a pie escribiendo haikus, poemas breves como un suspiro. En «Sendas de Oku» narra su viaje con calma y asombro. Es un libro perfecto para quienes aman rodar, caminar o simplemente mirar una rana saltar al estanque.', 'l'],
  ['Festival de Jardines', 'El Festival de Jardines inunda el Bosque Nublado de flores y música suave. Cada barrio presenta su jardín: el Malecón trae palmeras, la Medina, fuentes, y el Barrio Sakura, cerezos. Los visitantes recorren los senderos en bici despacito, para no pisar ni una mariposa.', 'e'],
  ['Cómo reparar un buzón', 'Consejo de la sección de oficios: si un buzón se atasca, no lo golpees; ábrelo con suavidad, revisa la bisagra y échale una gota de aceite. Así lo enseña el taller de EMSAY. Un buzón contento recibe mejor las revistas, y las abuelas dejan galletas encima.', 'd'],
  ['La campeona del hula-hula', 'Inés Aro, estrella de la ciclovía, mantuvo un hula-hula girando durante la carrera completa de la Avenida Neón, mientras patinaba hacia atrás. Dice que su secreto es no mirar el aro, sino mirar hacia adelante. Los jueces quedaron sin palabras, y los vendedores de limonada, sin vasos.', 'f'],
  ['Escuela de frenos', 'La Maestra Freno abrió un curso gratuito de frenado seguro en el Bosque Nublado. En su primera clase hubo cincuenta alumnos y ninguna rodilla raspada. «Frenar a tiempo también es llegar», repite ella. Las inscripciones siguen abiertas, con casco prestado para los olvidadizos.', 'n'],
  ['Li Bai, luna', 'Li Bai fue un poeta chino de la dinastía Tang que escribía a la luz de la luna y brindaba con su sombra. Sus versos hablan de amistad, viajes y nostalgia. Para leerlo basta un balcón de la Medina y un té tibio. La luna, dice, siempre acompaña a los viajeros.', 'l'],
  ['Carrera de Carritos', 'En la Carrera de Carritos, los vecinos arman vehículos de cartón sin motor y los lanzan cuesta abajo por el Alto Andino. Algunos ruedan lejos y otros apenas se mueven, pero todos hacen reír. Gana el más original; este año, un carrito en forma de sándwich.', 'e'],
  ['El tablón de anuncios', 'En el tablón de anuncios de EMSAY aparecen notas curiosas: «Se busca paraguas azul», «Se cambia bici por piano», «Gracias, repartidor de la gorra verde». Cada semana, el tablón es el rincón más leído de la redacción, aunque no tenga fotos ni titulares.', 'd'],
  ['Kilómetro Cero', 'Llegué por fin al Kilómetro Cero, donde la ciclovía se cruza consigo misma. Allí esperaba una bicicleta antigua, con una nota atada al manubrio: «La revista nunca fue mía. Es de quien la reparte. Sigue rodando». Reconocí la letra inclinada de Don Gustavo y me temblaron las rodillas.', 'h'],
  ['Mariachi andino sorpresa', 'Una banda mezcla de mariachi y charango cautivó al Alto Andino con una serenata para las vacas. Las vacas aplaudieron moviendo la cola, o eso dijo el mayoral. El cantante principal, Chuy Quena, confesó que ensayaba para conquistar a la maestra de baile.', 'f'],
  ['Cartas a tiempo', 'El correo EMSAY informó que el noventa y ocho por ciento de las cartas llegaron a tiempo esta semana. Doña Correo celebró con una torta de limón. El dos por ciento restante se perdió en un buzón con candado, y ya fue liberado con gran dignidad.', 'n'],
  ['Tagore y la voz', 'Rabindranath Tagore, poeta bengalí, ganó el Nobel por «Gitanjali», un libro de canciones y plegarias. También escribió cuentos para niños y fundó una escuela abierta al aire libre. Sus palabras suenan como un río manso. Para leer cuando necesites calma tras una larga jornada.', 'l'],
  ['Cine al aire', 'La Muestra de Cine al Aire proyecta películas sobre una pantalla gigante en el Malecón del Caribe. El público trae cobijas, canguil y a veces un perro dormilón. Esta noche, las películas son de todas las culturas, con subtítulos y mucha curiosidad.', 'e'],
  ['Taller de bicicletas', 'El taller de bicicletas de EMSAY repara llantas, cadenas y timbres para los repartidores. El mecánico, Don Lucho, afina los frenos con una oreja pegada al metal. Dice que cada bici tiene su voz y que aprendió a oírla con los años.', 'd'],
  ['Fashion week de cascos', 'La Semana de la Moda de Orbe presentó los cascos más elegantes del año, con plumas, espejos y hasta una maceta con flores. La diseñadora Xiomara Brillo defendió la seguridad: «Lo importante es proteger la cabeza, y que además se vea fabulosa».', 'f'],
  ['Cometa gigante vence viento', 'Un cometa de veinte metros, diseñado por estudiantes del Alto Andino, voló sin parar por tres horas sobre Orbe. Cuando por fin aterrizó, los niños lo abrazaron como a un gigante dormido. Prometen volar uno aún mayor, siempre que el viento acepte la invitación.', 'n'],
  ['Rumi, poeta del giro', 'Rumi, poeta persa del siglo trece, escribió versos sobre el amor y la búsqueda interior. De su tradición nacieron los derviches giróvagos, que bailan girando como ruedas. Léelo despacio: sus poemas invitan a dejar la prisa y a buscar lo que de verdad importa.', 'l'],
  ['Sin fin', 'La rotativa volvió a imprimir, con tinta fresca y palabras de sobra. Mientras alguien ruede con una historia que contar, EMSAY saldrá cada semana. A veces, al atardecer, veo una bicicleta antigua doblar la esquina de un carril lejano: Don Gustavo sigue repartiendo. Y yo, claro, sigo rodando.', 'h'],
  ['Día del Repartidor', 'El Día del Repartidor, Orbe agradece a quienes llevan cartas, revistas y paquetes por la ciudad. Los vecinos dejan frutas en los buzones y notas de aprecio. Doña Correo entrega medallas de cartón y un abrazo largo. Hasta los rivales se saludan con apretón de manos.', 'e'],
  ['Aprendices en práctica', 'Cada verano llegan aprendices a EMSAY: escriben titulares, doblan periódicos y reparten revistas a pie. Su primera tarea es leer cinco ediciones viejas. La segunda, escribir la carta de un lector imaginario. Muchos regresan años después convertidos en redactores, correctores o repartidores veloces.', 'd'],
  ['Susurros del jurado', 'Durante el concurso de talentos, un jurado famoso lloró de risa con un acto de malabares con huevos duros. El concursante, Beto Ojitos, ganó el premio sin romper ningún huevo ni la solemnidad. Después se comió la evidencia con sal, pan y mucha cortesía.', 'f'],
  ['Cierre por baile', 'Un tramo de la Avenida Neón cerró varias horas porque un grupo de bailarines ocupó los cuatro carriles con una coreografía espontánea. El Agente Pito aplaudió y desvió el tránsito sonriendo. Al final, todos bailaron un poco, incluso los semáforos, con luces intermitentes.', 'n'],
  ['Achebe y la memoria', 'Chinua Achebe, escritor nigeriano, publicó «Todo se desmorona», novela sobre un pueblo igbo y la llegada de los cambios. Con respeto y claridad, muestra cómo viven las comunidades que cuentan sus propias historias. Es un libro necesario para entender que cada voz merece ser escuchada.', 'l'],
  ['Fiesta del Río', 'La Fiesta del Río une a los habitantes de Pequeña Lagos con los del Puerto Nórdico en una gran comida compartida. Hay pescado, plátano, galletas de jengibre y música de tambores. La ciclovía se cierra por unas horas para que las mesas lleguen hasta la orilla.', 'e'],
  ['Reloj adelantado', 'El reloj de la entrada de EMSAY lleva diez años marcando la misma hora extra: cinco minutos adelantado. Nadie se atreve a corregirlo. Dicen que Don Gustavo lo ajustó así para que nadie llegara tarde a repartir. Cada mañana, los repartidores lo saludan al pasar, como a un viejo amigo.', 'd'],
  ['Gala de los Pedales', 'La Gala de los Pedales de Oro premió a los mejores artistas del año. El presentador, Ignacio Timbre, se tropezó con la alfombra y dijo: «Así se abre una gala». El público lo ovacionó de pie, y la alfombra pidió disculpas por no avisar del escalón.', 'f'],
  ['Alerta de charcos', 'El servicio de clima de Orbe avisó que habrá charcos medianos en la zona de Pequeña Lagos esta tarde. Se recomienda usar botas, saltar con cuidado y no pisar al pato que vive ahí. Si ve al pato molesto, retroceda y pídale permiso por la derecha.', 'n'],
  ['Mahfuz y El Cairo', 'Naguib Mahfuz, escritor egipcio y Nobel de Literatura, retrató con cariño las calles de El Cairo en su «Trilogía». Sus personajes viven, aman y discuten en callejones llenos de sabor. Leerlo es como pasear por una ciudad vieja, y conocer a sus vecinos.', 'l'],
  ['Feria de Inventos', 'La Feria de Inventos de Orbe exhibe máquinas curiosas: una bici que toca música, un casco con luz de lectura, un buzón que dice gracias. Los niños votan por sus favoritos. Ganó un sombrero paraguas con ventilador, aunque el jurado reconoció que gira un poco de más.', 'e'],
  ['Cena de fin', 'La cena de fin de año de EMSAY reúne a impresores, redactores, correctores y repartidores en una mesa larguísima. Hay pavo, arroz, ensalada y un brindis con jugo de maracuyá. Antes del postre, alguien lee en voz alta la carta de un lector, y todos se quedan en silencio.', 'd'],
];

/* ---- RunRunZero/src/game.js ---- */
/* ===== LÓGICA v2 · independiente del render (la usan el juego, la portada y el bot) =====
   Ciclovía de 4 carriles: 0-1 bajan (vienen de frente), 2-3 suben (tu sentido). */
const NL = 4, LW = 1.6, LX = l => (l - 1.5) * LW, LANES = [0, 1, 2, 3];
const GRAV = 42, DT = 1 / 120, PH = 1.7, PCH = 0.95, PHW = 0.32, PHD = 0.32, STEP = 0.36, VIEW = 190;
const rngOf = seed => { let a = (seed >>> 0) || 1; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const pickW = (r, items) => { let tot = 0; for (const it of items) tot += Math.max(0, it[1]); let x = r() * tot; for (const it of items) { x -= Math.max(0, it[1]); if (x <= 0) return it[0]; } return items[items.length - 1][0]; };

/* need: qué hace falta para pasar · jump / duck / ramp / block. vault: a pie se salta solo (parkour). hard: choque que lesiona */
const OT = {
  rock: { hw: 0.62, hd: 0.5, y0: 0, y1: 0.85, fatal: 1, land: 1, need: 'jump', vault: 1, name: 'una roca' },
  cone: { hw: 0.34, hd: 0.3, y0: 0, y1: 0.62, minor: 1, need: 'jump', vault: 1, name: 'un cono' },
  barrier: { hw: 0.72, hd: 0.18, y0: 0, y1: 1.05, fatal: 1, need: 'jump', vault: 1, name: 'una valla de obra' },
  pothole: { hw: 0.64, hd: 0.7, y0: -0.3, y1: 0.12, fatal: 1, ground: 1, need: 'jump', name: 'un bache' },
  puddle: { hw: 0.68, hd: 1.3, y0: -0.2, y1: 0.1, minor: 1, ground: 1, need: 'jump', name: 'un charco' },
  branch: { hw: 0.8, hd: 0.35, y0: 1.12, y1: 2.7, fatal: 1, need: 'duck', name: 'una rama baja' },
  stall: { hw: 0.7, hd: 0.7, y0: 0, y1: 2.1, fatal: 1, land: 1, need: 'block', hard: 1, name: 'una caseta' },
  kiosk: { hw: 0.72, hd: 0.9, y0: 0, y1: 2.4, fatal: 1, land: 1, need: 'block', hard: 1, name: 'un kiosco' },
  truck: { hw: 0.74, hd: 7, y0: 0, y1: 2.4, fatal: 1, land: 1, need: 'block', hard: 1, name: 'un camión descargando' },
  ramp: { hw: 0.74, hd: 3, y0: 0, y1: 2.4, ramp: 1, need: 'ramp', name: 'una rampa' },
  jramp: { hw: 0.74, hd: 2, y0: 0, y1: 1.1, ramp: 1, need: 'ramp', name: 'una rampa' },
  gate: { hw: 0.76, hd: 0.15, y0: 1, y1: 1.2, minor: 1, need: 'gate', name: 'una talanquera' },
  bollard: { hw: 0.66, hd: 0.15, y0: 0, y1: 0.75, fatal: 1, need: 'jump', vault: 1, name: 'unos bolardos' },
  person: { hw: 0.3, hd: 0.3, y0: 0, y1: 1.7, fatal: 1, need: 'block', hard: 1, name: 'un peatón' },
  wall: { hw: 0.74, hd: 1, y0: 0, y1: 1.0, fatal: 1, need: 'block', hard: 1, name: 'el separador de la vía' },
  rail: { hw: 0.26, hd: 8, y0: 0, y1: 0.55, minor: 1, land: 1, need: 'jump', vault: 1, name: 'una baranda' },
  npc: { hw: 0.42, hd: 0.7, y0: 0, y1: 1.8, fatal: 1, need: 'block', moving: 1, hard: 1, name: 'otra persona' },
  car: { hw: 0.62, hd: 1.6, y0: 0, y1: 1.3, fatal: 1, need: 'block', moving: 1, hard: 1, name: 'un carro' },
  median: { hw: 0.2, hd: 50, y0: 0, y1: 0.9, fatal: 1, need: 'block', name: 'el separador de la bifurcación' },
  pad: { hw: 0.62, hd: 1.1, y0: 0, y1: 0.04, need: 'free', name: 'un impulsor' },
  manhole: { hw: 0.5, hd: 0.5, y0: -0.4, y1: 0.1, fatal: 1, ground: 1, need: 'jump', name: 'una alcantarilla destapada' },
  crack: { hw: 0.74, hd: 0.28, y0: -0.1, y1: 0.06, minor: 1, ground: 1, need: 'jump', name: 'una grieta del pavimento' },
  bump: { hw: 0.78, hd: 0.32, y0: 0, y1: 0.12, minor: 1, ground: 1, bump: 1, need: 'jump', name: 'un resalto a toda velocidad' },
  trash: { hw: 0.52, hd: 0.42, y0: 0, y1: 0.7, minor: 1, need: 'jump', vault: 1, name: 'unas bolsas de basura' },
  pbike: { hw: 0.32, hd: 0.85, y0: 0, y1: 1.0, fatal: 1, need: 'jump', vault: 1, name: 'una bici parqueada' },
  container: { hw: 0.62, hd: 0.66, y0: 0, y1: 1.3, fatal: 1, land: 1, need: 'block', hard: 1, name: 'un contenedor de basura' },
  sand: { hw: 0.78, hd: 1.6, y0: -0.1, y1: 0.05, ground: 1, sand: 1, need: 'jump', name: 'la arena' },
  scaff: { hw: 0.8, hd: 0.45, y0: 1.15, y1: 2.9, fatal: 1, need: 'duck', name: 'un andamio de obra' }
};
/* cada barrio tiene obstáculos con lógica: ciudad (c), naturaleza (n) y playa (b) */
const CAT = ZORD.map(i => ['c', 'c', 'c', 'c', 'c', 'n', 'c', 'b', 'n', 'n', 'c'][i]);
/* zonas: tabla por tramos; en cada esquina el jugador puede doblar y cambiar de zona */
function zinfo(g, s) {
  const zt = g.zt; s = Math.max(0, s);
  while (zt[zt.length - 1].s <= s) { const l = zt[zt.length - 1]; zt.push({ s: l.s + 1000, z: (l.z + 1) % ZONES.length, ed: l.ed + 1 }); }
  let i = zt.length - 2; while (i > 0 && zt[i].s > s) i--;
  const a = zt[i]; return { z: a.z, ed: a.ed, s0: a.s, s1: zt[i + 1].s, pz: i > 0 ? zt[i - 1].z : a.z };
}
const catAt = (g, s) => CAT[zinfo(g, s).z];
const POOL = {
  c: { e: [['pothole', 1.2], ['puddle', 1], ['cone', 1], ['barrier', 1], ['trash', 1.6], ['pbike', 1.2], ['container', 0.9], ['stall', 1.6], ['kiosk', 0.6], ['scaff', 1.1], ['manhole', 0.6]],
       m: [['pothole', 2], ['manhole', 1.5], ['crack', 1.3], ['bump', 1.4], ['cone', 1.2], ['barrier', 1.2], ['puddle', 0.8], ['bollard', 0.6]] },
  n: { e: [['rock', 2], ['branch', 1.8], ['pothole', 1.4], ['puddle', 1.2], ['trash', 0.4], ['stall', 0.8], ['cone', 0.6]],
       m: [['pothole', 2.2], ['rock', 0.8], ['puddle', 1], ['crack', 0.8], ['cone', 0.8], ['barrier', 0.8], ['bump', 0.6]] },
  b: { e: [['sand', 2], ['trash', 1.2], ['stall', 2], ['puddle', 0.6], ['cone', 0.8], ['pbike', 1]],
       m: [['sand', 1.6], ['pothole', 1.4], ['bump', 1], ['cone', 1], ['barrier', 0.8], ['crack', 0.5]] }
};
const STREETX = ['branch', 'scaff', 'stall', 'pbike', 'sand', 'trash', 'rock'];
const NPCN = ['un ciclista', 'un corredor', 'una patinadora', 'un peatón', '', 'una moto'];
/* talanquera: barra que sube y baja (de pie si está alta, agachado a media altura, saltando si está baja) */
const gateY = (o, t) => o.fix || 0.95 + 1.45 * (0.5 + 0.5 * Math.sin(t * 1.7 + (o.ph || 0)));
/* clima: algunas ediciones llueven (mismo resultado en lógica y render) */
const RAINY = ed => ed > 0 && (Math.imul(ed + 7, 2654435761) >>> 0) % 4 === 1;
const SOFT = [['pothole', 2], ['cone', 1.5], ['barrier', 1.5], ['bollard', 1.2], ['bump', 1.2], ['crack', 1], ['puddle', 0.8]];
const THRAW = [
  { near: [['tree', 3.5], ['pine', 1], ['bush', 2], ['lamp', 1.5], ['bench', 1], ['bill', 1]], far: [['bld', 3], ['tree', 4], ['hill', 3]] },
  { near: [['tree', 3], ['bush', 2.5], ['lamp', 1.5], ['bench', 1.5], ['bill', 1.5]], far: [['bld', 5], ['tree', 3], ['hill', 2]] },
  { near: [['lamp', 3.5], ['bench', 1], ['bush', 1], ['tree', 1.5], ['bill', 3]], far: [['bld', 8.5], ['tree', 1.5]] },
  { near: [['tree', 3], ['lamp', 3], ['bill', 2], ['bush', 2]], far: [['bld', 6], ['hill', 4]] },
  { near: [['pine', 3], ['lamp', 3], ['bill', 2], ['bush', 2]], far: [['bld', 7], ['hill', 3]] },
  { near: [['tree', 4], ['bush', 2], ['bench', 1.5], ['bill', 2.5]], far: [['hill', 4], ['tree', 3], ['bld', 3]] },
  { near: [['lamp', 4.5], ['bill', 3.5], ['bush', 2]], far: [['bld', 9], ['hill', 1]] },
  { near: [['palm', 4], ['bench', 1], ['parasol', 2.5], ['bill', 1]], far: [['palm', 3], ['hill', 1], ['bld', 1.5]], sea: 1 },
  { near: [['pine', 5], ['tree', 1.5], ['bush', 2], ['fence', 1.2]], far: [['pine', 5], ['mount', 2.5]] },
  { near: [['coffee', 4], ['fence', 2], ['tree', 1.5], ['bench', 0.6], ['bill', 0.8]], far: [['coffee', 3], ['mount', 2], ['hill', 2]] },
  { near: [['lamp', 2]], far: [['boat', 1.5], ['mount', 1.2]], rail: 1 }
];
const THEMES = ZORD.map(i => THRAW[i]);
const TUT = [
  { need: 'jump', msg: 'DESLIZA ↑ PARA SALTAR', pc: 'Flecha ↑ · W · Espacio' },
  { need: 'duck', msg: 'DESLIZA ↓ PARA AGACHARTE', pc: 'Flecha ↓ · S' },
  { need: 'lane', msg: 'DESLIZA ← → PARA ESQUIVAR', pc: 'Flechas ← → · A D' },
  { need: 'deliver', msg: 'TOCA EL BOTÓN ✉ PARA ENTREGAR', pc: 'Tecla E (derecha) · Q (izquierda)' }
];

const vEst = (g, s) => (14 + 21 * (1 - Math.exp(-(g.free ? Math.min(s, 1400) : s) / 2600))) * (g.vs || g.veh.spd);
/* ¿se puede pasar de un carril a otro? (las bifurcaciones y los tramos angostos lo impiden) */
const forkAt = (g, s) => g.forks.find(f => s > f.a - 2 && s < f.b);
const narAt = (g, s) => g.nars.find(n => s > n.a - 2 && s < n.b), parkAt = (g, s) => g.parks.some(p => s > p[0] && s < p[1]);
const laneOk = (g, from, to, s) => { const f = forkAt(g, s); if (f && (from < 2) !== (to < 2)) return false; const n = narAt(g, s); return !(n && !n.open.includes(to)); };
/* Relieve: subidas y bajadas (el mismo perfil usa el shader) */
let HILL = s => { const e = clamp((s - 150) / 250, 0, 1); return e * (6.0 * Math.sin(s * 0.0105) + 2.2 * Math.sin(s * 0.027 + 1.7)); };
const HILLD = s => HILL(s + 0.5) - HILL(s - 0.5);
RUNV.ponHill = f => { HILL = f; };
/* las subidas cuestan más a los vehículos de fuerza; las bajadas aceleran (toca frenar) */
const hillK = (g, sl) => { const v = g.veh; if (v.id === 'long' && sl < 0) return clamp(1 - 2.8 * sl, 1, 1.4); if (v.id === 'ebike' && sl > 0) return 1; return v.kind === 'h' ? clamp(1 - 2.0 * sl, 0.72, 1.3) : clamp(1 - sl, 0.86, 1.24); };
const FLOW = ZORD.map(i => [0.6, 0.6, 0.2, 0.4, 0.3, 0.6, 0.35, 0.2, 0.3, 0.5, 0][i]);
const DELK = ZORD.map(i => [0.6, 0.7, 0.3, 0.4, 0.3, 0.6, 0.3, 0.45, 0.6, 0.85, -1][i]);
const diffAt = s => clamp((s - 150) / 6500, 0, 1);
/* semáforos de los cruces: verde, amarillo, rojo (en rojo cruzan carros) */
const TG = 6.5, TY = 1.3, TR = 4.6, CYC = TG + TY + TR;
const lightP = (X, t) => ((t + X.off) % CYC + CYC) % CYC;
const lightAt = (X, t) => { const p = lightP(X, t); return p < TG ? 0 : p < TG + TY ? 1 : 2; };
function crossCars(X, t, out) {
  out.length = 0; const tr = lightP(X, t) - (TG + TY); if (tr < 0) return out;
  for (let row = 0; row < 2; row++) for (let i = 0; i < 3; i++) {
    const dtc = tr - (0.2 + i * 0.9 + row * 0.45); if (dtc < 0 || dtc > 2.3) continue;
    const dir = row ? -1 : 1; out.push({ x: dir * (-15 + 13 * dtc), s: X.s + (row ? 2.2 : -2.2), dir, col: (X.id + i + row * 2) % 4, moto: (X.id + i) % 5 === 0 });
  }
  return out;
}
const DEL = { per: [40, 3, 'periódico'], rev: [50, 4, 'revista'], cor: [60, 5, 'correo'], pos: [80, 6, 'póster'], kio: [160, 15, 'paquete'] };
const WOB = { T: { name: 'la bajada sin frenar' }, pat: 'bajada' }, CARX = { T: { name: 'un carro del cruce', hard: 1 }, pat: 'cruce' }, DOG = { T: { name: 'un perro bravo' }, pat: 'perro' };

function newGame(o) {
  const v = VEHI[o.veh] || VEH[0], up = o.up || {}, K = o.perks || {}, bat = v.id === 'escooter' ? 1.35 : 1, fit = clamp(o.fit == null ? 30 : o.fit, 0, 100), inj = o.inj || 0, hum = v.kind === 'h';
  const g = {
    seed: o.seed >>> 0, rng: rngOf(o.seed), srng: rngOf((o.seed >>> 0) * 7 + 3), xr: rngOf((o.seed >>> 0) * 13 + 5), veh: v, demo: !!o.demo, ai: !!o.ai, t: 0, perks: K,
    street: v.street ? 1 : 0, vault: v.id === 'foot' || v.id === 'jetpack', maxJ: v.id === 'jetpack' ? 4 : (v.id === 'quad' || (K.parkour && hum)) ? 2 : 1,
    p: { s: 0, x: LX(2), lane: 2, from: 2, laneT: -9, y: 0, vy: 0, gv: 0, gy: 0, v: 0, air: false, airT: 0, crouch: 0, fastFall: 0, jumps: 0, stumble: 0, slow: 1, inv: 0, alive: true, deadT: 0,
      magnet: 0, turbo: 0, x2: 0, glide: 0, shield: v.id === 'auto' ? 1 : 0, boost: 0, sl: 0, trickHit: 0, phase: 0, brake: 0, en: 0, tapT: 9, over: 0, trN: 0, trT: 9, grind: 0, grT: 0, inPark: 0 },
    obs: [], coins: [], items: [], scen: [], ev: [], lf: [0, 0, 0, 0], resv: [0, 0, 0, 0], sideBusy: [0, 0],
    zt: [{ s: 0, z: 0, ed: 0 }], corners: [], turns: 0, free: o.free ? 1 : 0, drI: 0, drB: 0, drills: 0, drP: 0, drCur: 0, drNeed: 1, falls: 0,
    xs: [], crs: [], nars: [], parks: [], shops: [], forks: [], fork: null, evt: o.evt || '', vs: v.spd * (1 + 0.02 * ((o.vup || {}).v || 0)), hk: v.hnd * (1 + 0.05 * ((o.vup || {}).h || 0)), pads: 0, forksN: 0, nar: null, park: null, pol: null, riv: null, _cars: [],
    genS: 42, scenS: -30, nextGate: 1000, nextSeg: o.free ? 30 : 520, segI: 0, nextCrit: 640, nextRiv: o.free ? 1e12 : 850, nextKio: 420,
    dels: [], deliv: 0, perf: 0, dStreak: 0, dBest: 0, nextDel: 105, stolen: 0, tuns: [], pet: !!o.pet, petSide: 1, edition: 0, score: 0, coinsRun: 0, starsRun: 0, clues: 0, gifts: 0, jumps: 0, ducks: 0, tricks: 0, powers: 0, trucks: 0,
    cleanS: 0, cleanBest: 0, revives: 0, cause: '', hard: 0, mult: o.mult || 1, bad: 0, rows: 0, combo: 1, comboT: 0, comboCap: 2 + 0.03 * (o.skill || 0),
    near: 0, vaults: 0, grindM: 0, parkTr: 0, boosts: 0, crossN: 0, redRuns: 0, civic: 0, fines: 0, escapes: 0, dodges: 0, duels: 0, rivLost: 0, critOk: 0, overT: 0, rivLv: o.rivLv || 0,
    enMax: (hum ? (0.45 + 0.55 * fit / 100) * (K.pulmon ? 1.3 : 1) * (1 - 0.12 * inj) : v.id === 'moped' ? 1.5 : 1) * (1 + 0.08 * (up.en || 0)),
    enRegen: hum ? (0.05 + 0.08 * fit / 100) * (K.pulmon ? 1.3 : 1) : 0.025, enCost: hum ? 0.07 : 0.05,
    bmax: v.boost * (1 + 0.06 * ((o.vup || {}).b || 0)) * (1 + 0.07 * (up.rue || 0)) * (hum ? (0.6 + 0.4 * fit / 100) * (1 - 0.05 * inj) : 1),
    brakeDec: 16 * (1 + 0.08 * (up.fre || 0)) * (K.freno ? 1.4 : 1), delK: 1 + 0.06 * (up.mor || 0),
    dur: { magnet: (8 + 2 * (up.magnet || 0)) * bat, turbo: (4.5 + (up.turbo || 0)) * bat, x2: (10 + 3 * (up.x2 || 0)) * bat, glide: 6 * bat }, letters: o.letters || '', nextLetter: 260, glides: 0,
    luck: up.gift || 0, nextGift: 380, nextClue: 320, cluesLeft: o.cluesLeft || 0, tut: o.tut ? 0 : -1, tutWait: null
  };
  g.p.en = g.enMax; genAhead(g);
  return g;
}

function addOb(g, t, lane, s, extra) {
  const T = OT[t]; const o = { pat: g._kind, t, T, lane, x: LX(lane), s, R: s, hd: T.hd, hw: T.hw, y0: T.y0, y1: T.y1, alive: 1, hitT: -9, passed: 0, fly: null };
  if (extra) Object.assign(o, extra);
  g.obs.push(o); g.lf[lane] = Math.max(g.lf[lane], o.s + o.hd); return o;
}
// ¿hay espacio libre para una moneda/objeto en (carril, s, y)?
function spotOk(g, lane, s, y) {
  if (s < g.resv[lane] && y < 2.2) return false;
  for (const o of g.obs) {
    if (o.lane !== lane || !o.alive || o.t === 'median' || o.t === 'pad') continue;
    if (o.T.moving) { if (Math.abs(s - o.R) < 16) return false; continue; }
    if (s > o.s - o.hd - 0.8 && s < o.s + o.hd + 0.8) {
      if (o.T.ramp) continue;
      if (y < o.y1 + 0.35 && y + 0.5 > o.y0) return false;
    }
  }
  return true;
}
function addCoin(g, lane, s, y) { if (spotOk(g, lane, s, y)) g.coins.push({ lane, x: LX(lane), s, y, alive: 1, mag: 0 }); }
function coinLine(g, lane, s0, n, y, sp = 2.4) { for (let i = 0; i < n; i++) addCoin(g, lane, s0 + i * sp, y); }
function coinArc(g, lane, sc, v, y0 = 0) {
  const vy = Math.sqrt(2 * GRAV * 1.5), T = 2 * vy / GRAV, D = v * T;
  for (let i = -3; i <= 3; i++) { const d = i / 3 * D / 2, t = (d + D / 2) / v; addCoin(g, lane, sc + d, y0 + 0.8 + Math.max(0, vy * t - GRAV * t * t / 2)); }
}
/* gente y tráfico en movimiento: u = velocidad real (m/s), negativa si viene de frente */
function addNpc(g, lane, s, nk) {
  const P = g.p, r = g.rng, on = lane < 2, vx = Math.max(P.v, 0.85 * vEst(g, P.s)), T = Math.max(0.5, (s - P.s) / vx);
  const car = g.street && nk !== 5, sp = g.street ? (on ? 0.55 : 0.5) * vEst(g, s) : [6.5 + r() * 2, 3 + r(), 4.6 + r(), 1.3 + r() * 0.4][nk];
  const u = on ? -sp : sp, s0 = s - u * T;
  if (on ? g.lf[lane] > s - 45 : g.lf[lane] > s0 - 3) return null;
  if (s < g.resv[lane]) return null;
  const o = addOb(g, car ? 'car' : 'npc', lane, s0, { u, R: s, nk: car ? 4 : nk, col: Math.floor(r() * 4) });
  if (!car) { o.name = NPCN[nk]; if (nk === 5) { o.hd = 0.9; o.y1 = 1.5; } }
  g.lf[lane] = Math.max(g.lf[lane] - 0, 0); g.resv[lane] = Math.max(g.resv[lane], on ? s0 + 6 : s + 40);
  return o;
}

/* cruce con semáforo, tramo angosto o zona libre de trucos */
function genSeg(g) {
  const r = g.rng, s = g.genS;
  if (RUNV.esquina && !g.free) { const c = RUNV.esquina(g, s); if (c) { g.corners.push(c); g.sideBusy[0] = g.sideBusy[1] = c.s + 12; coinLine(g, 0, c.s - 40, 6, 0.8, 3); coinLine(g, 3, c.s - 40, 6, 0.8, 3); g.genS = c.s + 14; g.nextSeg = g.genS + 90; g.segI++; return; } }
  if (g.free) { const a = s + 8, b = a + 420; g.park = [a, b]; g.parks.push(g.park); g.genS = a + 6; g.nextSeg = b + 14; g.segI++; return; }
  const kinds = g.street ? ['cross', 'corner', 'fork', 'narrow', 'cross', 'corner'] : ['cross', 'corner', 'fork', 'narrow', 'corner', 'park', 'cross', 'fork', 'corner'], k = kinds[g.segI % kinds.length];
  const tunB = (a, b) => g.tuns.find(t => b > t[0] - 15 && a < t[1] + 15);
  if (k === 'corner' && !RUNV.esquina) {
    // esquina: a la izquierda y a la derecha salen calles hacia otras zonas (de 2 carriles o un callejón de 1)
    const C = s + 50, tb = tunB(s, C + 30); if (tb) { g.nextSeg = tb[1] + 25; return; }
    if (g.resv.some(x => x > C - 10)) { g.nextSeg = Math.max(...g.resv) + 12; return; }
    const z = zinfo(g, C).z, o = []; for (let i = 1; i < ZONES.length; i++) o.push((z + i) % ZONES.length);
    for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = o[i]; o[i] = o[j]; o[j] = t; }
    const nL = r() < 0.5 ? 1 : 2, nR = r() < 0.65 ? 3 - nL : nL;
    g.corners.push({ s: C, z, L: { z: o[0], n: nL }, R: { z: o[1], n: nR }, done: 0, ai: null });
    g.sideBusy[0] = g.sideBusy[1] = C + 12;
    coinLine(g, 0, C - 40, 6, 0.8, 3); coinLine(g, 3, C - 40, 6, 0.8, 3);
    g.genS = C + 14; g.nextSeg = g.genS + 400 + r() * 260; g.segI++; return;
  }
  if (k === 'park' || k === 'cross') { const tb = tunB(s, s + 240); if (tb) { g.nextSeg = tb[1] + 25; return; } }
  if (k === 'fork') {
    const a = s + 44, L = 150 + r() * 80, b = a + L;
    if (g.resv[1] > a - 4 || g.resv[2] > a - 4) { g.nextSeg = Math.max(g.resv[1], g.resv[2]) + 6; return; }
    addOb(g, 'median', 1, a + L / 2, { x: 0, hd: L / 2 });
    g.fork = { a, b, dl: r() < 0.5 ? 0 : 1 }; g.forks.push(g.fork); g.forksN++; g.nextDel = Math.min(g.nextDel, a + 12);
    g.genS = a + 10; g.nextSeg = b + 380 + r() * 260; g.segI++; return;
  }
  if (k === 'cross') {
    const C = s + 32; g.xs.push({ s: C, off: r() * CYC, id: g.xs.length + g.segI, pass: 0, wait: 0 }); g.sideBusy[0] = g.sideBusy[1] = C + 14;
    g.genS = C + 16; g.nextSeg = g.genS + 380 + r() * 260; g.segI++; return;
  }
  if (k === 'narrow') {
    const a = s + 36, L = 90 + r() * 70, b = a + L, d = diffAt(s);
    const open = pickW(r, [[[1, 2], 3], [[2, 3], 3], [[0, 1], 1.5], [[2], d > 0.15 ? 1.6 : 0], [[1], d > 0.3 ? 1 : 0]]);
    const closed = LANES.filter(l => !open.includes(l));
    if (closed.some(l => g.resv[l] > a - 4)) { g.nextSeg = Math.max(...closed.map(l => g.resv[l])) + 6; return; }
    for (const l of closed) addOb(g, 'wall', l, a + L / 2, { hd: L / 2 });
    g.nar = { a, b, open }; g.nars.push(g.nar); g.sideBusy[0] = g.sideBusy[1] = Math.max(g.sideBusy[0], a);
    g.genS = a + 8; g.nextSeg = b + 380 + r() * 260; g.segI++; return;
  }
  const a = s + 22, b = a + 190; g.park = [a, b]; g.parks.push(g.park); g.genS = a + 6; g.nextSeg = b + 420 + r() * 260; g.segI++;
}

function genRow(g) {
  const r = g.rng, s = g.genS, d = diffAt(s), v = vEst(g, s) * hillK(g, HILLD(s)), rain = RAINY(zinfo(g, s).ed);
  const tg = lerp(1.25, 0.78, d), gap = Math.max(11, v * tg) * (1 + r() * 0.35);
  const st = ['free', 'free', 'free', 'free'];
  let len = 0, coinLane = -1, kind;
  g.rows++;
  const rl = () => Math.floor(r() * NL), wRain = p => rain ? p.map(j => j[0] === 'puddle' ? ['puddle', 3.5] : j) : p;
  const P0 = POOL[catAt(g, s)], pool = l => { let p = wRain(l === 0 || l === 3 ? P0.e : P0.m); if (g.street) p = p.filter(j => !STREETX.includes(j[0])); return p; };
  const place = (t, l, ds = 0) => {
    if (s + ds < g.resv[l]) return false;
    if (t === 'branch') { addOb(g, 'branch', l, s + ds, { vis: { side: l < 2 ? -1 : 1, lanes: [l] } }); st[l] = 'duck'; }
    else if (t === 'stall') {
      addOb(g, 'stall', l, s + ds, { v: Math.floor(r() * 3) }); st[l] = 'block';
      addOb(g, 'person', l, s + ds - 1.5, { v: Math.floor(r() * 4), ry: 0 });
      const l2 = l === 0 ? 1 : 2; if (r() < 0.3 && st[l2] === 'free' && s >= g.resv[l2] && st.filter(x => x !== 'block').length > 2) { addOb(g, 'person', l2, s + ds - 0.4, { v: Math.floor(r() * 4), ry: l === 0 ? -1.2 : 1.2 }); st[l2] = 'block'; }
    } else { addOb(g, t, l, s + ds, t === 'gate' ? { ph: r() * 6.28 } : null); st[l] = OT[t].need; }
    return true;
  };
  // tutorial: una cosa a la vez
  if (g.tut >= 0 && g.tut < TUT.length) {
    const i = g.tut;
    if (i === 0) addOb(g, 'barrier', 2, s).tut = 0;
    else if (i === 1) addOb(g, 'scaff', 2, s).tut = 1;
    else if (i === 2) { const o = addNpc(g, 2, s, 3); if (o) o.tut = 2; }
    else g.dels.push({ s, side: 1, k: 'rev', obj: 'casita', v: 0, done: 0, miss: 0, tut: 3 });
    g.tut++; g.genS = s + 32; coinLine(g, 3, s - 10, 5, 0.8); return;
  }
  if (s >= g.nextSeg && !g.nar && !g.park) { genSeg(g); if (g.genS !== s) return; }
  let nar = g.nar, park = g.park, fork = g.fork;
  if (fork && s > fork.b - 6) { g.fork = fork = null; g.genS = s + 12; return; }
  if (nar && s > nar.b - 4) { g.nar = nar = null; g.genS = s + 12; return; }
  if (park && s > park[1] - 8) { g.park = park = null; g.genS = s + 10; return; }
  if (nar) {
    const op = nar.open; g._kind = 'angosto';
    if (op.length === 1) { if (r() < 0.7) place(pickW(r, wRain(SOFT)), op[0]); else coinLine(g, op[0], s - 5, 6, 0.8); }
    else {
      const k = pickW(r, [['one', 4.5], ['both', 2], ['npc', s > 250 ? 2 : 0], ['coins', 1.5]]);
      if (k === 'one') place(pickW(r, wRain(SOFT.concat([['rock', 1]]))), op[Math.floor(r() * 2)]);
      else if (k === 'both') { place(pickW(r, wRain(SOFT)), op[0]); place(pickW(r, wRain(SOFT)), op[1]); }
      else if (k === 'npc') { const l = op[Math.floor(r() * 2)]; if (addNpc(g, l, s, Math.floor(r() * 4))) st[l] = 'block'; }
      const fl = op.filter(l => st[l] === 'free'); if (fl.length && r() < 0.8) coinLine(g, fl[Math.floor(r() * fl.length)], s - 6, 6, 0.8);
    }
    coinLane = -2;
  } else if (fork) {
    // bifurcación: una rama de ENTREGAS (marcada) y otra de IMPULSO con impulsores, barandas y rampas
    g._kind = 'bifurcación'; const D = fork.dl ? [2, 3] : [0, 1], O = fork.dl ? [0, 1] : [2, 3];
    if (r() < 0.5) place(pickW(r, wRain(SOFT)), D[Math.floor(r() * 2)]);
    const k = pickW(r, [['pad', 3.2], ['rail', 1.4], ['jramp', 1.1], ['obs', 1.8]]), l = O[Math.floor(r() * 2)];
    if (k === 'pad') { addOb(g, 'pad', l, s); coinLine(g, l, s + 3, 4, 0.8); }
    else if (k === 'rail' && !g.street) { const L = 12 + r() * 6; addOb(g, 'rail', l, s + L / 2, { hd: L / 2 }); coinLine(g, l, s + 1.5, Math.floor(L / 2.4) - 1, 1.35); len = L; }
    else if (k === 'jramp' && !g.street) { addOb(g, 'jramp', l, s); const vy = 0.275 * v, T = (vy + Math.sqrt(vy * vy + 2 * GRAV * 1.1)) / GRAV; for (let i = 1; i <= 6; i++) { const t = i / 7 * T; addCoin(g, l, s + 2 + v * t, 1.8 + vy * t - GRAV * t * t / 2); } len = v * T + 4; }
    else place(pickW(r, wRain(SOFT)), l);
    const fl = D.filter(q => st[q] === 'free'); if (fl.length) coinLine(g, fl[Math.floor(r() * fl.length)], s - 6, 5, 0.8);
    coinLane = -2;
  } else if (park) {
    g._kind = 'parque'; const k = pickW(r, [['jramp', 4], ['rail', 4], ['cones', 1], ['coins', 1], ['walk', 1.6], ['pad', g.free ? 2.2 : 0]]), l = rl();
    if (k === 'walk') { if (addNpc(g, l, s, 3)) st[l] = 'block'; else coinLine(g, l, s - 4, 6, 0.8); }
    if (k === 'jramp') { addOb(g, 'jramp', l, s); st[l] = 'ramp'; const vy = 0.275 * v, T = (vy + Math.sqrt(vy * vy + 2 * GRAV * 1.1)) / GRAV; for (let i = 1; i <= 6; i++) { const t = i / 7 * T; addCoin(g, l, s + 2 + v * t, 1.8 + vy * t - GRAV * t * t / 2); } len = v * T + 4; }
    else if (k === 'rail') { const L = 16 + r() * 10; addOb(g, 'rail', l, s + L / 2, { hd: L / 2 }); coinLine(g, l, s + 1.5, Math.floor(L / 2.4) - 1, 1.35); len = L; }
    else if (k === 'cones') { place('cone', l); place('cone', (l + 2) % NL); }
    else if (k === 'pad') { addOb(g, 'pad', l, s); coinLine(g, l, s + 3, 4, 0.8); }
    else if (k === 'walk') { /* paseantes */ }
    else coinLine(g, l, s - 4, 8, 0.8);
    coinLane = -2;
  } else {
    kind = pickW(r, [
      ['single', 2.2 - 1.2 * d], ['double', 1 + 1.5 * d], ['triple', d > 0.1 ? 0.5 + 2 * d : 0], ['quad', d > 0.3 ? 0.3 + 1.2 * d : 0],
      ['npc', s > 230 ? 1.8 + 2.4 * d : 0], ['truck', s > 300 ? 0.75 : 0], ['jramp', s > 200 ? 0.4 : 0], ['rail', s > 350 && !g.street ? 0.5 : 0],
      ['slalom', 0.45], ['breather', Math.max(0.15, 0.6 - 0.5 * d)]
    ]);
    g._kind = kind;
    if (kind === 'npc') {
      const n = 1 + (r() < 0.35 + 0.5 * d ? 1 : 0) + (r() < d * 0.6 ? 1 : 0), ls = LANES.slice().sort(() => r() - 0.5); let c = 0;
      for (const l of ls) { if (c >= n) break; const nk = g.street ? (r() < 0.35 ? 5 : 4) : pickW(r, [[0, 4], [1, g.evt === 'maraton' ? 8 : 2.5], [2, 2], [3, 1.5]]); if (addNpc(g, l, s, nk)) { st[l] = 'block'; c++; } }
      if (!c) kind = 'single';
      else if (d > 0.3 && r() < 0.5) { const f = LANES.filter(l => st[l] === 'free'); if (f.length > 1) { const l = f[Math.floor(r() * f.length)]; place(pickW(r, pool(l).filter(j => OT[j[0]].need !== 'block')), l); } }
    }
    if (kind === 'single') { const l = rl(); place(pickW(r, pool(l)), l); }
    else if (kind === 'double' || kind === 'triple') { const n = kind === 'double' ? 2 : 3, ls = LANES.slice().sort(() => r() - 0.5).slice(0, n); for (const l of ls) if (st[l] === 'free') place(pickW(r, pool(l)), l); }
    else if (kind === 'quad') {
      for (const l of LANES) if (st[l] === 'free') place(pickW(r, pool(l)), l);
      if (st.every(x => x === 'block')) { const l = 1 + Math.floor(r() * 2); g.obs = g.obs.filter(o => !(o.lane === l && Math.abs(o.s - s) < 2 && !o.T.moving)); st[l] = 'free'; place(pickW(r, wRain(SOFT)), l); }
    } else if (kind === 'truck') {
      const l = r() < 0.5 ? 0 : 3, sd = l === 0 ? 0 : 1;
      if (s < g.resv[l] || g.sideBusy[sd] > s - 6) { place(pickW(r, pool(l)), l); }
      else {
        const ramp = !g.street && r() < 0.55;
        if (ramp) { addOb(g, 'ramp', l, s); st[l] = 'ramp'; coinLine(g, l, s + 4.5, 5, 3.2); } else st[l] = 'block';
        addOb(g, 'truck', l, s + 10, { col: Math.floor(r() * 3) }); g.shops.push({ s: s + 10, side: l === 0 ? -1 : 1, v: Math.floor(r() * 3) }); g.sideBusy[sd] = s + 22;
        const l2 = l === 0 ? 1 : 2; if (r() < 0.3 && s + 6 >= g.resv[l2]) addOb(g, 'person', l2, s + 6 + r() * 6, { v: Math.floor(r() * 4), ry: l === 0 ? -1.4 : 1.4 });
        len = 17;
      }
    } else if (kind === 'jramp') {
      const l = 1 + Math.floor(r() * 2);
      if (s >= g.resv[l]) {
        addOb(g, 'jramp', l, s); st[l] = 'ramp';
        const vy = 0.275 * v, T = (vy + Math.sqrt(vy * vy + 2 * GRAV * 1.1)) / GRAV;
        for (let i = 1; i <= 6; i++) { const t = i / 7 * T; addCoin(g, l, s + 2 + v * t, 1.1 + vy * t - GRAV * t * t / 2 + 0.7); }
        len = v * T + 4;
      }
    } else if (kind === 'rail') {
      const l = rl(), L = 14 + r() * 8;
      if (s >= g.resv[l]) { addOb(g, 'rail', l, s + L / 2, { hd: L / 2 }); st[l] = 'jump'; coinLine(g, l, s + 1.5, Math.floor(L / 2.4) - 1, 1.35); len = L; coinLane = -2; }
    } else if (kind === 'slalom') {
      const dir = r() < 0.5 ? 1 : -1, t = d > 0.35 ? 'barrier' : 'cone', sp = Math.max(8, v * 0.55);
      for (let k = 0; k < 4; k++) { const free = dir > 0 ? k : 3 - k; for (const l of LANES) if (l !== free && s + k * sp >= g.resv[l]) addOb(g, t, l, s + k * sp); coinLine(g, free, s + k * sp - 1.2, 2, 0.8); }
      st[0] = st[1] = st[2] = st[3] = 'jump'; coinLane = -2; len = 3 * sp;
    } else if (kind === 'breather') { coinLine(g, rl(), s - 6, 8, 0.8); coinLane = -2; }
  }
  // validación: siempre debe existir al menos un carril transitable
  const live = nar ? nar.open : LANES;
  if (live.every(l => st[l] === 'block')) { const fx = live.find(l => !g.obs.some(o => o.lane === l && o.T.moving && Math.abs(o.R - s) < 3)); if (fx !== undefined) { g.obs = g.obs.filter(o => !(o.lane === fx && !o.T.moving && o.t !== 'wall' && o.t !== 'median' && o.s > s - 3 && o.s < s + len + 3)); st[fx] = 'free'; } }
  if (live.every(l => st[l] === 'block')) { g.bad++; g.badK = (g.badK || '') + g._kind + '@' + Math.round(s) + ' '; }
  // monedas guía (marcan el carril seguro)
  if (coinLane === -1 && r() < 0.78) {
    const pref = LANES.filter(l => st[l] === 'free'), alt = LANES.filter(l => st[l] === 'jump' && g.obs.some(o => o.s === s && o.lane === l && !['puddle', 'sand', 'crack', 'bump'].includes(o.t)));
    if (pref.length && (r() < 0.6 || !alt.length)) coinLine(g, pref[Math.floor(r() * pref.length)], s - 7, 6, 0.8);
    else if (alt.length) coinArc(g, alt[Math.floor(r() * alt.length)], s, v);
  }
  // objetos, animales y entregas entre filas
  const mid = s + len + gap * 0.5, ojo = g.perks.ojo ? 0.6 : 1, ls = live.slice().sort(() => r() - 0.5), freeL = ls.find(l => spotOk(g, l, mid, 1));
  const nearX = g.xs.some(X => Math.abs(X.s - mid) < 16);
  if (mid >= g.nextCrit && !nar && !park && !nearX && gap > 12) {
    const k = pickW(r, [['dog', 3], ['cat', 2.5], ['duck', 2.5]]), dir = r() < 0.5 ? 1 : -1;
    g.crs.push({ s: mid, kind: k, dir, v: k === 'dog' ? 4.2 : k === 'cat' ? 5 : 1.9, hw: k === 'duck' ? 0.9 : 0.35, x0: -dir * 4.7, x: -dir * 4.7, t0: -1, trig: 38 + v * 0.8, name: k === 'dog' ? 'un perrito que cruzaba' : k === 'cat' ? 'un gato que cruzaba' : 'una familia de patos', done: 0, hit: 0 });
    g.nextCrit = mid + 430 + r() * 420;
  } else if (freeL !== undefined) {
    let it = null;
    if (g.letters && mid >= g.nextLetter) { it = 'letter'; g.nextLetter = mid + (550 + r() * 350) * ojo * (g.evt === 'libro' ? 0.7 : 1); }
    else if (g.cluesLeft > 0 && mid >= g.nextClue) { it = 'clue'; g.nextClue = mid + (900 + r() * 600) * ojo * (g.evt === 'libro' ? 0.5 : 1); g.cluesLeft--; }
    else if (mid >= g.nextGift) { it = 'gift'; g.nextGift = mid + (480 + r() * 420) * (g.evt === 'pulgas' ? 0.55 : 1); }
    else if (s > 160 && r() < 0.05) it = pickW(r, [['magnet', 3], ['turbo', 1.6], ['x2', 2.2], ['shield', 1.8], ['glide', g.evt === 'cometas' ? 7 : 2.3]]);
    if (it) g.items.push({ k: it, lane: freeL, x: LX(freeL), s: mid, y: 1.0, alive: 1, ch: it === 'letter' ? g.letters[0] : null });
  }
  const dz = zinfo(g, mid).z;
  if (!g.free && mid >= g.nextDel && DELK[dz] >= 0 && !park && !nearX) {
    const fk = forkAt(g, mid), side = fk ? (fk.dl ? 1 : -1) : r() < 0.5 ? -1 : 1, sb = side < 0 ? 0 : 1, wl = side < 0 ? 0 : 3;
    if (g.sideBusy[sb] < mid - 7 && !(nar && !nar.open.includes(wl) && false)) {
      let k = mid >= g.nextKio ? 'kio' : pickW(r, [['per', 3], ['rev', 3], ['cor', 2.5], ['pos', 1.8]]);
      if (k === 'kio') g.nextKio = mid + 600 + r() * 300;
      const obj = k === 'kio' ? 'kiosko' : k === 'pos' ? 'muro' : k === 'cor' ? 'buzon' : k === 'per' ? 'casita' : (r() < DELK[dz] ? 'casita' : 'buzon');
      g.dels.push({ s: mid, side, k, obj, v: Math.floor(r() * 3), done: 0, miss: 0, dog: obj === 'casita' && r() < 0.14 ? 1 : 0 });
      g.sideBusy[sb] = mid + 5; g.nextDel = mid + (fk ? 26 + r() * 14 : 55 + r() * 70);
    }
  }
  g.genS = s + len + gap;
}

function genScen(g) {
  const r = g.srng, s = g.scenS, zi = zinfo(g, s).z, th = THEMES[zi];
  const Z0 = ZONES[zi], inTun = x => g.tuns.some(t => x >= t[0] - 8 && x <= t[1] + 8);
  if (Z0.tun && s > 300 && !inTun(s + 40) && !g.parks.some(p => p[1] > s - 20 && p[0] < s + 175) && !g.xs.some(X => X.s > s - 20 && X.s < s + 175) && s > (g.tuns.length ? g.tuns[g.tuns.length - 1][1] : 0) + 160 && r() < 0.06) { const a = s + 12, b = a + 70 + r() * 80; g.tuns.push([a, b]); for (const ps of [a, b]) g.scen.push({ k: 'portal', s: ps, x: 0, side: 1, ry: 0, sc: 1, v: 0, sh: 1, z: zi }); }
  if (g.tuns.length > 4) g.tuns.shift();
  const tn = g.tuns.find(t => s + 6 >= t[0] && s + 6 <= t[1]);
  if (tn) { g.scen.push({ k: 'tunnel', s: s + 6, x: 0, side: 1, ry: 0, sc: 1, v: 0, sh: 1, z: zi }); g.scenS += 6 + r() * 5; return; }
  if (th.sea) g.scen.push({ k: 'sea', s, x: 9.6, side: 1, ry: 0, sc: 1, v: 0, sh: 1, z: zi });
  if (th.rail) for (const sd of [-1, 1]) g.scen.push({ k: 'rail', s, x: sd * 5.45, side: sd, ry: 0, sc: 1, v: 0, sh: 1, z: zi });
  if (s >= g.nextGate - 14) { const Zg = zinfo(g, g.nextGate); g.scen.push({ k: 'gate', s: g.nextGate, x: 0, ry: 0, sc: 1, z: Zg.z, v: 0, sh: 1 }); g.nextGate = Zg.s1; }
  for (const side of [-1, 1]) {
    const k = pickW(r, th.near);
    if (r() < 0.8) g.scen.push({ k, s: s + r() * 3, x: side * (k === 'bill' ? 7.2 : th.rail ? 5.6 : 6 + r() * 1.6), side, ry: k === 'bill' ? -side * 0.35 : r() * 6.28, sc: 0.85 + r() * 0.35, v: k === 'bill' && g.evt && r() < 0.5 ? EVT.find(e => e.id === g.evt).bill : Math.floor(r() * 14), sh: 0.85 + r() * 0.25, z: zi, nr: 1 });
    const f = pickW(r, th.sea && side > 0 ? [['boat', 1]] : th.far);
    if (r() < 0.75) g.scen.push({ k: f, s: s + r() * 4, x: side * (f === 'hill' ? 34 + r() * 20 : f === 'mount' ? 55 + r() * 30 : f === 'boat' ? 16 + r() * 26 : 13 + r() * 10), side, ry: f === 'bld' ? 0 : r() * 6.28, sc: f === 'bld' ? 1 : 0.9 + r() * 0.8, v: Math.floor(r() * 3), sh: 0.8 + r() * 0.3, z: zi, h: 0.7 + r() * 0.9, pi: r() < 0.5 ? 2 : 3 });
    // gente caminando por el andén (decoración viva)
    if (!th.rail && r() < 0.42) g.scen.push({ k: 'ped', s: s + r() * 5, x: side * (4.0 + r() * 0.9), side, ry: 0, sc: 1, v: Math.floor(r() * 4), sh: 1, z: zi, mv: (r() < 0.5 ? 1 : -1) * (1 + r() * 2.4), t0: g.t, nr: 1 });
  }
  if (r() < FLOW[zi]) { const sd = r() < 0.5 ? -1 : 1; g.scen.push({ k: 'flowers', s: s + r() * 4, x: sd * (5.9 + r() * 2.6), side: sd, ry: r() * 6.28, sc: 0.8 + r() * 0.5, v: 0, sh: 0.9 + r() * 0.2, z: zi, nr: 1 }); }
  g.scenS += 6 + r() * 5;
}

function genAhead(g) {
  let n = 0;
  while (g.genS < g.p.s + VIEW && n++ < 60) genRow(g);
  while (g.scenS < g.p.s + VIEW + 10) genScen(g);
}

function groundAt(g, x, s, y) {
  let gnd = 0, hit = null;
  for (const o of g.obs) {
    if (!o.alive || o.fly || !(o.T.land || o.T.ramp)) continue;
    if (Math.abs(x - o.x) >= o.hw + PHW) continue;
    if (s + PHD < o.s - o.hd || s - PHD > o.s + o.hd) continue;
    const top = o.T.ramp ? clamp((s - (o.s - o.hd)) / (2 * o.hd), 0, 1) * o.y1 : o.y1;
    if (y >= top - STEP && top > gnd) { gnd = top; hit = o; }
  }
  g._gO = hit; return gnd;
}

const ev = (g, k, a) => { if (g.ev.length < 64) g.ev.push({ k, a }); };
/* estilo: trucos, barandas, rozadas y entregas perfectas suben el combo */
function style(g, a) { const c0 = Math.floor(g.combo * 2); g.combo = Math.min(g.comboCap, g.combo + a); g.comboT = 5; if (Math.floor(g.combo * 2) > c0) ev(g, 'combo', g.combo); }

function deliver(g, side, auto) {
  const P = g.p, K = g.perks, reach = K.brazo ? 28 : 22; let d = null;
  for (const q of g.dels) { if (q.done || q.miss || q.side !== side) continue; const a = q.s - P.s; if (a < -2.5 || a > reach) continue; if (!d || q.s < d.s) d = q; }
  if (!d) { ev(g, 'dnone', side); return false; }
  const a = d.s - P.s; let q = auto || (a >= (K.brazo ? 0.5 : 2) && a <= (K.brazo ? 13 : 9.5)) ? 2 : 1;
  if (d.k === 'pos' && (side < 0 ? P.lane > 1 : P.lane < 2)) q = 1;
  d.done = 1; d.q = q; g.deliv++; g.dStreak++; g.dBest = Math.max(g.dBest, g.dStreak); if (q === 2) { g.perf++; style(g, 0.2); }
  const id = g.veh.id, k2 = (id === 'trike' ? 2 : id === 'moto' ? 1.25 : 1) * g.delK;
  d.pts = Math.round(DEL[d.k][0] * (g.evt === 'dominical' ? 1.5 : 1) * (g.evt === 'correo' && d.k === 'cor' ? 2 : 1) * q * g.mult * (P.x2 > 0 ? 2 : 1) * (1 + 0.1 * Math.min(10, g.dStreak - 1)) * k2 * (q === 2 ? g.combo : 1));
  g.score += d.pts; g.coinsRun += Math.round(DEL[d.k][1] * q * (id === 'trike' ? 2 : 1));
  d.T = clamp(Math.max(a, 1) / Math.max(P.v, 4), 0.15, 0.7); ev(g, 'deliver', d);
  if (d.dog && !g.pol && !K.freno && P.v > 15.5) chase(g, 'dog', 4.5);
  if (g.tutWait && g.tutWait.need === 'deliver') g.tutWait.ok = 1;
  return true;
}
function chase(g, k, d) { if (g.free) return; const P = g.p; g.pol = { k, d, t: 0, vp: k === 'pol' ? Math.max(vEst(g, P.s) * 1.1 + 3.5, P.v * 0.92) : 16.5 }; ev(g, 'chase', k); }

function input(g, k) {
  const P = g.p, V = g.veh; if (!P.alive) return;
  if (k === 'L' || k === 'R') {
    const nl = clamp(P.lane + (k === 'L' ? -1 : 1), 0, NL - 1);
    if (nl !== P.lane) { P.from = P.lane; P.lane = nl; P.laneT = g.t; ev(g, 'lane'); }
  } else if (k === 'U') {
    const jv = Math.sqrt(2 * GRAV * 1.55 * V.jmp);
    if (!P.air) { P.crouch = 0; P.air = true; P.airT = 0; P.vy = jv + Math.max(0, P.gv) * 0.5; P.jumps = 1; P.trickHit = 0; P.trN = 0; P.trT = 9; g.jumps++; ev(g, 'jump'); }
    else if (P.glide > 0) return;
    else if (P.jumps < g.maxJ) { P.vy = jv * 0.85; P.jumps++; g.jumps++; ev(g, 'jump2'); }
    else if (P.trN < 2 && P.airT > 0.06) { P.trN++; P.trT = 0; P.vy += 2.2; ev(g, 'trickGo', P.trN); }
  } else if (k === 'B') {
    if (P.en >= g.enCost) { const up = V.kind === 'h' ? 1 + Math.max(0, P.sl) * 8 : 1; P.en = Math.max(0, P.en - g.enCost * up); P.tapT = 0; P.boost = Math.min(1, P.boost + 0.13); g.boosts++; ev(g, 'boost', P.boost); }
    else ev(g, 'noen');
  } else if (k === 'K') { if (!P.brake) { P.brake = 1; ev(g, 'brake'); } }
  else if (k === 'k') P.brake = 0;
  else if (k === 'Q') deliver(g, -1);
  else if (k === 'E') deliver(g, 1);
  else if (k === 'D') {
    if (P.air) { P.vy = Math.min(P.vy, -26); P.fastFall = 1; } else P.crouch = 0.62;
    ev(g, 'duck');
  }
}

function smash(g, o) {
  const P = g.p, r = g.xr;
  o.fly = { t: 0, vx: ((o.x || 0) - P.x >= 0 ? 1 : -1) * (3 + r() * 4), vy: 7 + r() * 5, vz: P.v * 0.5, rx: (r() - 0.5) * 12, ry: (r() - 0.5) * 8, x: 0, y: 0, z: 0 };
  g.score += 20 * g.mult; ev(g, 'smash', o);
}
function die(g, o) {
  const P = g.p;
  if (g.free) { P.stumble = 0; P.inv = 1.4; P.slow = 0.5; g.combo = 1; g.comboT = 0; g.falls++; g.cleanBest = Math.max(g.cleanBest, g.cleanS); g.cleanS = 0; if (o && o.t && o.t !== 'wall' && o.t !== 'truck' && o.alive) smash(g, o); ev(g, 'fall', o); return; }
  if (P.shield) { P.shield = 0; P.inv = 1.2; if (o && o.t && o.t !== 'wall' && o.t !== 'truck') smash(g, o); ev(g, 'shield'); return; }
  P.alive = false; P.deadT = 0; P.vy = 5; P.air = true; P.brake = 0; g.cause = o ? (o.name || o.T.name) : 'una caída'; g.hard = o && o.T.hard ? 1 : 0;
  g.causePat = o ? o.pat + (P.stumble > 0 ? '+tamb' : '') : ''; g.pol = null;
  g.cleanBest = Math.max(g.cleanBest, g.cleanS); ev(g, 'crash', o);
}
function stumble(g, o, bounce) {
  const P = g.p;
  if (P.stumble > 0) { die(g, o); return; }
  P.stumble = g.veh.id === 'scooter' ? 2.2 : 3.0; P.slow = 0.72; P.trickHit = 1; g.combo = 1; g.comboT = 0;
  g.cleanBest = Math.max(g.cleanBest, g.cleanS); g.cleanS = 0;
  if (bounce) { const t = P.lane; P.lane = P.from; P.from = t; }
  ev(g, 'stumble', o);
}
function revive(g) {
  const P = g.p;
  for (const o of g.obs) if (o.t !== 'wall' && o.s + o.hd > P.s - 3 && o.s - o.hd < P.s + 40) o.alive = 0;
  for (const c of g.crs) if (c.s < P.s + 40) c.done = 1;
  const nr = narAt(g, P.s); if (nr && !nr.open.includes(P.lane)) P.lane = nr.open[0];
  P.alive = true; P.inv = 2.5; P.stumble = 0; P.slow = 1; P.vy = 0; P.air = false; P.y = 0; P.gv = 0; P.crouch = 0; P.brake = 0; P.over = 0; g.pol = null; g.overT = -3;
  P.v = vEst(g, P.s) * 0.55; P.x = LX(P.lane); g.revives++; ev(g, 'revive');
}

function chaseStep(g, dt) {
  const P = g.p, c = g.pol; c.t += dt;
  const vp = c.k === 'pol' ? c.vp + Math.min(4, c.t * 0.3) : c.vp; c.d = Math.max(0, c.d + (P.v - vp) * dt);
  if (c.k === 'dog') {
    if (P.v < 9 || c.t > 7) { g.pol = null; g.score += 40 * g.mult; ev(g, 'dogCalm'); }
    else if (c.d > 12) { g.pol = null; g.score += 80 * g.mult; ev(g, 'dogEsc'); }
    else if (c.d < 0.5) { g.pol = null; ev(g, 'dogBite'); stumble(g, DOG, false); }
    return;
  }
  if (c.d > 34) { g.pol = null; g.overT = -2; g.escapes++; g.score += 300 * g.mult; style(g, 0.3); ev(g, 'polEsc'); }
  else if (c.d < 6 && (P.brake || P.v < vp * 0.7) && g.t - P.laneT < 0.5) { g.pol = null; g.overT = -4; g.dodges++; g.score += 400 * g.mult; style(g, 0.3); ev(g, 'polDodge'); }
  else if (c.d < 0.9) { const fine = Math.min(g.coinsRun, 40 + Math.floor(g.coinsRun * 0.12)); g.coinsRun -= fine; g.fines++; P.slow = 0.55; P.boost = 0; g.pol = null; g.overT = -4; ev(g, 'polFine', fine); }
}

/* doblar en una esquina: se rehace lo que viene con la zona elegida y una calle angosta */
function turnAt(g, c, dir) {
  const P = g.p, B = dir < 0 ? c.L : c.R, cut = c.s + 1, keep = o => o.s < cut;
  g.obs = g.obs.filter(o => o.T.moving ? o.s < c.s - 12 : o.s - o.hd < cut);
  g.coins = g.coins.filter(keep); g.items = g.items.filter(keep); g.dels = g.dels.filter(keep); g.crs = g.crs.filter(keep); g.shops = g.shops.filter(keep); g.xs = g.xs.filter(keep);
  g.scen = g.scen.filter(sc => sc.s < cut - 2); g.corners = g.corners.filter(x => x.s <= c.s);
  g.nars = g.nars.filter(n => n.a < cut); g.parks = g.parks.filter(p => p[0] < cut); g.forks = g.forks.filter(f => f.a < cut); g.tuns = g.tuns.filter(t => t[0] < cut);
  g.nar = g.park = g.fork = null; g.lf = g.lf.map(x => Math.min(x, cut)); g.resv = g.resv.map(x => Math.min(x, cut));
  const Z = zinfo(g, c.s); g.zt = g.zt.filter(e => e.s < c.s); g.zt.push({ s: c.s, z: B.z, ed: Z.ed + 1 }); g.nextGate = c.s + 1000;
  const a = c.s + 6, L = (B.n === 1 ? 170 : 230) + g.rng() * 90, b = a + L, open = B.n === 1 ? [dir < 0 ? 1 : 2] : [1, 2];
  g._kind = 'calle';
  for (const l of LANES) if (!open.includes(l)) addOb(g, 'wall', l, a + L / 2, { hd: L / 2, st: 1, adj: open.some(q => Math.abs(q - l) === 1) ? 1 : 0 });
  g.nar = { a, b, open, st: 1 }; g.nars.push(g.nar);
  g.scen.push({ k: 'gate', s: a + 4, x: 0, ry: 0, sc: 1, z: B.z, v: 0, sh: 1 });
  g.genS = a + 16; g.scenS = c.s + 0.5; g.nextSeg = b + 320 + g.rng() * 200; g.sideBusy = [a + 24, a + 24]; g.nextDel = Math.max(g.nextDel, a + 30);
  const nl = open.reduce((m, l) => Math.abs(l - P.lane) < Math.abs(m - P.lane) ? l : m, open[0]); P.lane = P.from = nl; P.x = LX(nl);
  if (g.pol) { if (g.pol.k === 'pol') { g.escapes++; g.score += 300 * g.mult; ev(g, 'polEsc'); } g.pol = null; }
  if (g.riv) { if (g.riv.ah) { g.duels++; g.score += 150 * g.mult; ev(g, 'rivShake', g.riv); } g.riv = null; g.nextRiv = P.s + 600; }
  g.turns++; g.score += 50 * g.mult; style(g, 0.25); ev(g, 'turn', { dir, z: B.z, n: B.n });
  if (RUNV.gira) RUNV.gira(c, dir);
}
/* zona libre: retos de habilidad encadenados */
function drillStep(g) {
  const D = DRILL[g.drI % DRILL.length], lap = Math.floor(g.drI / DRILL.length), v = g[D.k] || 0;
  const need = D.k === 'combo' ? Math.min(D.n + 0.2 * lap, g.comboCap - 0.05) : Math.round(D.n * (1 + 0.6 * lap)), cur = D.abs ? v : v - g.drB;
  g.drP = clamp(cur / need, 0, 1); g.drCur = cur; g.drNeed = need;
  if (cur >= need) { g.drills++; g.drI++; const N = DRILL[g.drI % DRILL.length]; g.drB = g[N.k] || 0; g.score += 200 * g.mult; g.coinsRun += 25; ev(g, 'drill', { t: drillTxt(D, need), i: g.drills }); }
}
const drillTxt = (D, need) => D.t.replace('{n}', D.k === 'combo' ? need.toFixed(1).replace('.', ',') : fmtN(need));
const fmtN = n => Math.round(n).toLocaleString('es-CO');

/* rivales: otros repartidores de la historia que te pasan y te quitan entregas */
function rivalStep(g, dt, base) {
  const P = g.p, r = g.xr; let R = g.riv;
  if (!R) {
    if (P.s >= g.nextRiv && !P.inPark && !narAt(g, P.s + 30) && P.v > 8 && (g.tut < 0 || g.tut >= TUT.length)) {
      const i = Math.floor(r() * RIV.length), lane = P.lane === 2 ? 3 : 2;
      R = g.riv = { i, name: RIV[i][0], s: P.s - 9, lane, x: LX(lane), v: P.v + 3, t: 0, led: 0, ah: 0, y: 0, lc: 2 + r() * 2, hitT: -9 }; ev(g, 'rival', R);
    }
    return;
  }
  R.t += dt; const gap = R.s - P.s, cruise = base * (1 + 0.012 * g.rivLv) + (gap > 22 ? -0.8 : 0.3);
  if (gap > 10) R.led = 1;
  R.v += ((R.led ? cruise : Math.max(P.v + 3.5, cruise)) - R.v) * Math.min(1, dt * 2); R.s += R.v * dt;
  if (!R.ah && gap > 0.5) { R.ah = 1; g.score = Math.max(0, g.score - 40 * g.mult); ev(g, 'rivPass', R); }
  const blockIn = l => g.obs.some(o => o.alive && !o.fly && o.lane === l && o.t !== 'median' && o.t !== 'pad' && (o.y1 > 1.25 || o.T.moving || o.T.need === 'duck' || o.t === 'wall') && o.s + o.hd > R.s - 1 && o.s - o.hd - R.s < 16);
  const opts = LANES.filter(l => Math.abs(l - R.lane) === 1 && laneOk(g, R.lane, l, R.s) && (gap > 6 || gap < -4 || l !== P.lane));
  if (blockIn(R.lane) && Math.abs(R.x - LX(R.lane)) < 0.3) { const ok = opts.filter(l => !blockIn(l)); if (ok.length) { R.lane = ok[Math.floor(r() * ok.length)]; R.lc = 1.5; } }
  else if ((R.lc -= dt) < 0) { R.lc = 2.5 + r() * 3; const ok = opts.filter(l => !blockIn(l)); if (ok.length) R.lane = ok[Math.floor(r() * ok.length)]; }
  R.x += clamp(LX(R.lane) - R.x, -8 * dt, 8 * dt);
  let hop = 0; for (const o of g.obs) if (o.alive && !o.fly && o.lane === R.lane && o.t !== 'median' && o.t !== 'pad' && o.y1 <= 1.25 && !o.T.moving && Math.abs(o.s - R.s) < o.hd + 3) hop = Math.max(hop, Math.min(2.7, o.y1 + 0.5) * Math.max(0, 1 - Math.abs(o.s - R.s) / (o.hd + 3)));
  R.y += (hop - R.y) * Math.min(1, dt * 10);
  if (R.ah) {
    for (const c of g.coins) if (c.alive && !c.mag && c.lane === R.lane && Math.abs(c.s - R.s) < 1 && c.y < 2.5) c.alive = 0;
    for (const d of g.dels) if (!d.done && !d.miss && R.s > d.s && gap > 0) { d.miss = 1; d.stolen = 1; g.stolen++; R.st = (R.st || 0) + 1; g.dStreak = 0; ev(g, 'dstolen', R); }
  }
  if (Math.abs(gap) < 1.3 && Math.abs(R.x - P.x) < 0.8 && P.y < 1 && R.y < 0.6 && g.t - R.hitT > 1.2 && P.inv <= 0 && P.turbo <= 0) { R.hitT = g.t; stumble(g, { T: { name: R.name }, pat: 'rival' }, Math.abs(LX(P.lane) - P.x) > 0.02); if (!P.alive) return; }
  if (R.ah && gap < -1.5) { g.riv = null; g.nextRiv = P.s + (g.race ? 380 : 800) + r() * (g.race ? 250 : 600); g.duels++; g.score += 250 * g.mult * g.combo; style(g, 0.3); ev(g, 'rivWin', R); }
  else if (gap > 55 || R.t > 32 || (!R.ah && R.t > 7)) { g.riv = null; g.nextRiv = P.s + (g.race ? 350 : 700) + r() * (g.race ? 250 : 500); if (R.ah) { g.rivLost++; ev(g, 'rivLost', R); } }
}

function step(g, dt, inp) {
  const P = g.p, V = g.veh, K = g.perks;
  g.t += dt;
  if (!P.alive) { P.deadT += dt; P.vy -= GRAV * dt; P.y = Math.max(P.gy || 0, P.y + P.vy * dt); P.v *= Math.pow(0.08, dt); P.s += P.v * dt; return; }
  // tutorial: cámara lenta hasta que el jugador haga el gesto correcto
  if (g.tutWait) {
    const w = g.tutWait, ok = w.need === 'jump' ? P.air : w.need === 'duck' ? P.crouch > 0 : w.need === 'deliver' ? w.ok : P.lane !== w.o.lane;
    if (ok || w.o.s - P.s < -2) { g.tutWait = null; ev(g, 'tutOk', w.need); } else dt *= 0.18;
  }
  if (inp) input(g, inp);
  P.inv = Math.max(0, P.inv - dt); P.stumble = Math.max(0, P.stumble - dt); P.crouch = Math.max(0, P.crouch - dt); P.tapT += dt; P.trT += dt;
  if (g.comboT > 0 && (g.comboT -= dt) <= 0) g.combo = 1;
  for (const k of ['magnet', 'turbo', 'x2', 'glide']) if (P[k] > 0) { P[k] -= dt; if (P[k] <= 0) { P[k] = 0; if (k === 'turbo') P.inv = Math.max(P.inv, 1.5); if (k === 'glide') { P.inv = Math.max(P.inv, 1.4); P.vy = 0; P.airT = 0; P.trickHit = 1; } ev(g, 'pEnd', k); } }
  if (V.id === 'auto' && !P.shield && (P.shT = (P.shT || 0) + dt) > 45) { P.shT = 0; P.shield = 1; }
  // energía (aliento / batería): la gasta el impulso y se recupera sola
  const sl = P.sl = HILLD(P.s), hum = V.kind === 'h', inPark = parkAt(g, P.s); P.inPark = inPark ? 1 : 0;
  let rg = P.tapT < 0.6 ? 0 : g.enRegen * (inPark ? 3 : 1) * (hum && sl < -0.03 ? 1.5 : 1); if (!hum && (P.brake || sl < -0.03)) rg += 0.1;
  P.en = Math.min(g.enMax, P.en + rg * dt);
  // descanso en el parque: detente unos segundos para recuperar energía (y curar una lesión)
  if (inPark && P.v < 1.2 && !P.air) { if ((g.restT = (g.restT || 0) + dt) > 2.5 && !g.rested) { g.rested = 1; P.en = g.enMax; ev(g, 'rest'); } } else g.restT = 0;
  // velocidad: v = (14 + 21·(1 − e^(−s/2600)))·vehículo·pendiente + impulso
  const base = vEst(g, P.s); P.slow = Math.min(1, P.slow + dt * 0.35); P.boost = Math.max(0, P.boost - dt * 0.24);
  const tv = (base * hillK(g, sl) + g.bmax * P.boost) * (P.turbo > 0 ? 1.4 : 1) * P.slow;
  if (P.brake && P.turbo <= 0 && P.glide <= 0) P.v = Math.max(0, P.v - g.brakeDec * dt);
  else P.v += (tv - P.v) * Math.min(1, dt * (P.v < tv ? 2.2 : 6));
  // en bajadas fuertes los vehículos de fuerza se desbocan: hay que frenar
  if (hum && V.id !== 'long' && sl < -0.04 && P.v > base * 1.15 + g.bmax * P.boost && P.turbo <= 0 && !P.air && P.glide <= 0) { P.over += dt; if (P.over > 2.4) { P.over = 0; stumble(g, WOB, false); if (!P.alive) return; } }
  else P.over = Math.max(0, P.over - dt * 1.5);
  const s0 = P.s; P.s += P.v * dt; P.phase += P.v * dt;
  // lateral
  const tx = LX(P.lane), dx = tx - P.x, lat = 13 * g.hk * (K.derrape ? 1.2 : 1) * dt;
  P.x += Math.abs(dx) <= lat ? dx : Math.sign(dx) * lat;
  // vertical
  const gnd = groundAt(g, P.x, P.s, P.y), gO = g._gO; P.gy = gnd;
  if (P.glide > 0) { P.air = true; P.vy = 0; P.airT = 0; P.y += (6.2 - P.y) * Math.min(1, dt * 3); }
  else if (P.air) {
    P.vy -= GRAV * (V.id === 'jetpack' && P.vy < 0 && !P.fastFall ? 0.45 : 1) * dt; P.y += P.vy * dt; P.airT += dt;
    if (P.y <= gnd && P.vy <= 0) {
      P.y = gnd; P.vy = 0; P.air = false; P.gv = 0;
      if (P.fastFall) { P.crouch = 0.55; P.fastFall = 0; }
      if (P.trN > 0 && P.trT < 0.22) { P.trN = 0; stumble(g, { T: { name: 'un truco incompleto' }, pat: 'truco' }, false); if (!P.alive) return; }
      else if ((P.airT > 0.42 || P.trN > 0) && !P.trickHit) {
        const pts = Math.round(((P.airT > 0.8 ? 60 : 30) + 45 * P.trN) * (V.id === 'skate' ? 2 : 1) * (K.trucos ? 2 : 1) * (inPark ? 2 : 1) * g.mult * g.combo);
        g.score += pts; g.tricks += 1 + P.trN; if (inPark) g.parkTr += 1 + P.trN; style(g, 0.2 + 0.2 * P.trN); ev(g, 'trick', { pts, name: (TRK[V.id] || TRK.foot)[Math.min(2, P.trN)] });
      }
      P.jumps = 0; P.trN = 0; ev(g, 'land', P.airT);
    }
  } else {
    if (gnd >= P.y - 0.001) { P.gv = (gnd - P.y) / dt; P.y = gnd; }
    else { P.air = true; P.airT = 0; P.trickHit = 0; P.trN = 0; P.vy = P.grind ? 5.5 : Math.max(0, Math.min(P.gv, 14)); P.gv = 0; P.vy -= GRAV * dt; P.y += P.vy * dt; }
  }
  if (gO && gO.t === 'truck' && !gO.counted && !P.air) { gO.counted = 1; g.trucks++; ev(g, 'truck'); }
  // barandas: deslizar da puntos, estilo y energía
  if (gO && gO.t === 'rail' && !P.air) {
    const gm = P.v * dt; if (!P.grind) { P.grind = 1; style(g, 0.25); ev(g, 'grindOn'); }
    g.grindM += gm; g.score += gm * 3 * g.mult * g.combo * (K.trucos ? 2 : 1); P.en = Math.min(g.enMax, P.en + 0.12 * dt);
    if ((P.grT += gm) > 6) { P.grT = 0; style(g, 0.12); ev(g, 'grind'); }
  } else if (!P.air || P.airT > 0.05) P.grind = 0;
  // colisiones (barrido en z para que nada se atraviese a alta velocidad)
  const h = P.crouch > 0 ? PCH : PH, zA = Math.min(s0, P.s) - PHD, zB = Math.max(s0, P.s) + PHD, moving = Math.abs(tx - P.x) > 0.02;
  for (const o of g.obs) {
    if (!o.alive || o.fly) continue;
    if (o.t === 'pad') { if (!o.used && P.y < 0.6 && Math.abs(P.x - o.x) < o.hw + 0.15 && zB > o.s - o.hd && zA < o.s + o.hd) { o.used = 1; g.pads++; P.boost = Math.min(1, P.boost + 0.6); P.en = Math.min(g.enMax, P.en + g.enMax * 0.25); P.padT = 2.5; g.score += 30 * g.mult; style(g, 0.15); ev(g, 'pad', o); } continue; }
    if (o.T.moving) {
      o.s += o.u * dt; const rel = o.s - P.s, was = o.rel > 0; o.rel = rel;
      if (was && rel <= 0 && !o.nm) { o.nm = 1; if (Math.abs(o.x - P.x) < 1.9 && g.t - o.hitT > 1 && P.v > 6) { g.near++; g.score += 15 * g.mult; style(g, 0.1); ev(g, 'near', o); } }
      if (o.s + o.hd < P.s - 0.6) continue;
    }
    if (o.t === 'gate') { const gy = gateY(o, g.t); o.y0 = gy - 0.08; o.y1 = gy + 0.08; }
    const os0 = o.s - o.hd, os1 = o.s + o.hd;
    if ((o.t === 'branch' || o.t === 'scaff') && !o.passed && P.s - PHD > os1) { o.passed = 1; if (Math.abs(P.x - o.x) < o.hw && P.crouch > 0) { g.ducks++; ev(g, 'duckOk'); } }
    if (o.tut !== undefined && !o.tdone && os0 > P.s && (os0 - P.s - PHD) / Math.max(1, P.v - (o.u || 0)) * P.v <= (TUT[o.tut].need === 'lane' ? P.v * 0.6 : P.v * 0.21 + 0.4)) { o.tdone = 1; g.tutWait = { need: TUT[o.tut].need, o }; ev(g, 'tut', o.tut); }
    if (zB < os0 || zA > os1) continue;
    if (P.glide > 0 && P.y > 2.9) continue;
    if (Math.abs(P.x - o.x) >= o.hw + PHW) continue;
    if (g.t - o.hitT < 0.6) continue;
    const top = o.T.ramp ? clamp((P.s - os0) / (os1 - os0), 0, 1) * o.y1 : o.y1;
    const pb = P.y, pt = P.y + h;
    if (o.T.ground) { if (pb > top + 0.02) continue; }
    else {
      if (pt <= o.y0) continue;
      if ((o.T.land || o.T.ramp) ? pb >= top - STEP : pb >= top) continue;
    }
    // ¡contacto!
    o.hitT = g.t;
    if (P.turbo > 0) { if (!o.T.ramp && o.t !== 'wall' && o.t !== 'truck') smash(g, o); continue; }
    if (P.inv > 0) continue;
    const frontal = o.T.moving || (s0 + PHD <= os0 + 0.06) || o.T.ground;
    if (o.T.ramp) { stumble(g, o, true); continue; }
    if (frontal) {
      if (g.vault && o.T.vault) { P.air = true; P.airT = 0; P.vy = Math.sqrt(2 * GRAV * (o.y1 + 0.55)); P.slow = Math.min(P.slow, 0.88); P.jumps = 1; P.trickHit = 1; P.crouch = 0; g.vaults++; ev(g, 'vault', o); }
      else if (o.T.sand) { P.slow = Math.min(P.slow, 0.7); ev(g, 'sand', o); continue; }
      else if (o.T.bump && P.v < 13) { if (!P.air) { P.air = true; P.airT = 0; P.vy = 3.2; P.trickHit = 1; } ev(g, 'bump', o); continue; }
      else if (o.T.minor || (g.vault && o.T.ground)) { if (o.t === 'puddle' && V.id === 'inline') { ev(g, 'splash', o); continue; } stumble(g, o, false); if (o.t === 'cone' || o.t === 'trash') smash(g, o); }
      else die(g, o);
    } else if (V.id === 'uni' && moving) { const t = P.lane; P.lane = P.from; P.from = t; ev(g, 'lane'); }
    else stumble(g, o, moving);
    if (!P.alive) return;
  }
  // cruces: carros en rojo, respeto del semáforo
  for (const X of g.xs) {
    const dC = X.s - P.s; if (dC > 26 || dC < -12) continue;
    if (!X.pass) {
      if (P.v < 1.2 && dC < 24) X.wait = 1;
      if (dC < 5.5) { X.pass = 1; g.crossN++; const st = lightAt(X, g.t); if (st === 2) { g.redRuns++; ev(g, 'redrun'); if (!g.pol && P.turbo <= 0) chase(g, 'pol', 10); } else if (X.wait) { g.civic++; g.score += 60 * g.mult; ev(g, 'civic'); } }
    }
    if (P.turbo > 0 || P.inv > 0 || P.y > 1.3) continue;
    for (const c of crossCars(X, g.t, g._cars)) if (Math.abs(P.s - c.s) < 1.0 + PHD && Math.abs(P.x - c.x) < (c.moto ? 1.0 : 2.15) + PHW) { die(g, CARX); if (!P.alive) return; P.inv = Math.max(P.inv, 1.2); break; }
  }
  // animalitos que cruzan: frena o pasa antes
  for (const c of g.crs) {
    if (c.done) continue; const ahead = c.s - P.s;
    if (c.t0 < 0) { if (ahead < c.trig) { c.t0 = g.t; ev(g, 'crit', c); } continue; }
    c.x = c.x0 + c.dir * c.v * (g.t - c.t0);
    if (c.x * c.dir > 5.2 || ahead < -3) { c.done = 1; if (!c.hit) g.critOk++; continue; }
    if (!c.hit && P.s + PHD > c.s - 0.45 && s0 - PHD < c.s + 0.45 && Math.abs(P.x - c.x) < c.hw + PHW && P.y < 0.55 && P.turbo <= 0 && P.inv <= 0) { c.hit = 1; ev(g, 'critHit', c); die(g, { T: { name: c.name, hard: 1 }, pat: 'animal' }); if (!P.alive) return; }
  }
  // exceso de velocidad con motor → policía; perros y rivales
  P.padT = Math.max(0, (P.padT || 0) - dt);
  if (!hum && !g.pol) { if (P.v > base * 1.1 + 0.55 * g.bmax && P.turbo <= 0 && P.padT <= 0) g.overT += dt; else g.overT = Math.max(Math.min(g.overT, 0) , g.overT - dt * 0.6); if (g.overT < 0) g.overT += dt; if (g.overT > 1.8) chase(g, 'pol', 13); }
  if (g.pol) { chaseStep(g, dt); if (!P.alive) return; }
  rivalStep(g, dt, base); if (!P.alive) return;
  g.petSide = P.lane === 3 ? -1 : 1;
  // monedas
  const mul = g.mult * (P.x2 > 0 ? 2 : 1) * (V.id === 'bike' ? 1.15 : 1) * (1 + 0.5 * P.boost), magR = P.magnet > 0 ? 16 : 0;
  for (const c of g.coins) {
    if (!c.alive) continue;
    if (magR && !c.mag && c.s > P.s - 2 && c.s < P.s + magR) c.mag = 1;
    else if (g.pet && !c.mag && c.s > P.s && c.s < P.s + 3.2 && Math.sign(c.x - P.x) === g.petSide && Math.abs(c.x - P.x) < 2.1 && c.y < 2.2 + P.y) c.mag = 1;
    else if (V.id === 'euc' && !c.mag && c.s > P.s - 1 && c.s < P.s + 4.5 && Math.abs(c.x - P.x) < 2 && Math.abs(c.y - P.y - 0.9) < 1.6) c.mag = 1;
    if (c.mag) { const k = Math.min(1, dt * 14); c.x += (P.x - c.x) * k; c.y += (P.y + 0.9 - c.y) * k; c.s += (P.s + 0.2 - c.s) * k; }
    if (c.s > zA - 0.6 && c.s < zB + 0.6 && Math.abs(c.x - P.x) < 0.8 && c.y > P.y - 0.4 && c.y < P.y + h + 0.5) { c.alive = 0; g.coinsRun += g.evt === 'carnaval' && (g._cf = !g._cf) ? 2 : 1; g.score += 10 * mul; ev(g, 'coin', c); }
  }
  for (const it of g.items) {
    if (!it.alive) continue;
    if (P.magnet > 0 && it.s > P.s - 1 && it.s < P.s + 10) { const k = Math.min(1, dt * 10); it.x += (P.x - it.x) * k; it.y += (P.y + 1 - it.y) * k; it.s += (P.s - it.s) * k; }
    if (it.s > zA - 0.8 && it.s < zB + 0.8 && Math.abs(it.x - P.x) < 0.9 && it.y > P.y - 0.6 && it.y < P.y + h + 0.6) { it.alive = 0; pickup(g, it); }
  }
  // entregas: se hacen con los botones (el camión con cuadrilla entrega solo)
  for (const d of g.dels) {
    if (d.done || d.miss) continue; const a = d.s - P.s;
    if (d.tut !== undefined && !d.tdone && a < 8.5 && a > 2) { d.tdone = 1; g.tutWait = { need: 'deliver', o: d, ok: 0 }; ev(g, 'tut', d.tut); }
    if (V.id === 'camion' && a < 7 && a > 1) deliver(g, d.side, true);
    else if (a < -2.5) { d.miss = 1; if (g.dStreak > 0) ev(g, 'dmiss', d); g.dStreak = 0; }
  }
  // puntuación por distancia
  const ds = P.s - s0; g.score += ds * mul; g.cleanS += ds;
  const Zi = zinfo(g, P.s); if (Zi.ed > g.edition) { g.edition = Zi.ed; if (RAINY(Zi.ed)) g.rainSeen = 1; ev(g, 'zone', { ed: Zi.ed, z: Zi.z }); }
  for (const c of g.corners) if (!c.done && P.s >= c.s - 1) { c.done = 1; const dir = P.lane === 0 ? -1 : P.lane === 3 ? 1 : 0; if (dir && P.alive) turnAt(g, c, dir); else ev(g, 'straight', c); break; }
  if (g.free) drillStep(g);
  if (!g.tunSeen && g.tuns.length && g.tuns.some(t => P.s > t[0] + 5 && P.s < t[1])) g.tunSeen = 1;
  // limpieza y generación
  if ((g._cl = (g._cl || 0) + 1) % 30 === 0) {
    const cut = P.s - 18;
    g.obs = g.obs.filter(o => (o.T.moving ? o.s > cut - 20 && o.s < P.s + 700 : o.s + o.hd > cut) && !(o.fly && o.fly.t > 2.5));
    g.coins = g.coins.filter(c => c.alive && c.s > cut);
    g.items = g.items.filter(i => i.alive && i.s > cut);
    g.dels = g.dels.filter(d => d.s > cut - 12);
    g.xs = g.xs.filter(X => X.s > cut - 20); g.crs = g.crs.filter(c => !c.done || c.s > cut); g.shops = g.shops.filter(q => q.s > cut - 20);
    g.nars = g.nars.filter(n => n.b > cut); g.parks = g.parks.filter(p => p[1] > cut); g.corners = g.corners.filter(c => c.s > cut - 40);
    while (g.zt.length > 4 && g.zt[2].s < cut - 300) g.zt.shift();
    g.scen = g.scen.filter(sc => sc.s > cut - (sc.k === 'bld' || sc.k === 'hill' || sc.k === 'ped' ? 30 : 0));
  }
  genAhead(g);
}

function airCoins(g) { const P = g.p, L = P.v * g.dur.glide * 1.05; let lane = P.lane; for (let d = 14, i = 0; d < L; d += 3, i++) { if (i % 9 === 8) lane = clamp(lane + (g.xr() < 0.5 ? -1 : 1), 0, NL - 1); g.coins.push({ lane, x: LX(lane), s: P.s + d, y: 6.9, alive: 1, mag: 0 }); } }
function pickup(g, it) {
  const P = g.p, r = g.xr;
  if (it.k === 'magnet' || it.k === 'turbo' || it.k === 'x2') { P[it.k] = g.dur[it.k]; g.powers++; ev(g, 'power', it.k); }
  else if (it.k === 'glide') { P.glide = g.dur.glide; P.inv = Math.max(P.inv, 0.6); P.air = true; P.crouch = 0; P.brake = 0; g.powers++; g.glides++; airCoins(g); ev(g, 'power', 'glide'); }
  else if (it.k === 'letter') { const ch = g.letters[0]; if (ch) { g.letters = g.letters.slice(1); ev(g, 'letter', ch); } }
  else if (it.k === 'shield') { P.shield = 1; g.powers++; ev(g, 'power', 'shield'); }
  else if (it.k === 'clue') { g.clues++; ev(g, 'clue'); }
  else if (it.k === 'gift') {
    g.gifts++;
    const luck = g.luck * 0.03;
    const k = pickW(r, [['coins', 0.48 - luck], ['power', 0.22], ['star', 0.16 + luck], ['cos', 0.1 + luck * 0.5], ['big', 0.04 + luck * 0.5]]);
    let a;
    if (k === 'coins') a = 50 + Math.floor(r() * 5) * 25 + Math.floor(P.s / 100) * 5;
    else if (k === 'big') a = 500 + Math.floor(r() * 4) * 250;
    else if (k === 'power') { a = pickW(r, [['magnet', 1], ['turbo', 1], ['x2', 1], ['shield', 1]]); if (a === 'shield') P.shield = 1; else P[a] = g.dur[a]; g.powers++; }
    else if (k === 'star') { a = 1; g.starsRun += 1; }
    if (k === 'coins' || k === 'big') g.coinsRun += a;
    ev(g, 'gift', { k, a });
  }
}

/* ===== IA · el mismo bot juega en la portada y en las pruebas ===== */
function aiLane(g, l, h) {
  const P = g.p; let best = null;
  for (const o of g.obs) {
    if (!o.alive || o.fly || o.lane !== l || o.t === 'median' || o.t === 'pad' || (o.t === 'puddle' && g.veh.id === 'inline')) continue;
    let front = o.s - o.hd - (P.s + PHD); const back = o.s + o.hd - (P.s - PHD);
    if (back < 0) continue;
    if (o.T.moving) { const rel = P.v - o.u; if (rel <= 0.5) { if (front > 2.5) continue; } else if (front > 0) front = front / rel * Math.max(P.v, 6); }
    if (front > h) continue;
    let need = o.T.need;
    if (o.t === 'gate') { const gy = gateY(o, g.t + Math.max(0, front) / Math.max(P.v, 1) + 0.06); need = gy >= 1.92 ? 'free' : gy >= 1.14 ? 'duck' : 'jump'; if (need === 'free') continue; }
    if (g.vault && o.T.vault && need === 'jump') need = 'vault';
    if (need !== 'duck' && need !== 'ramp' && P.y >= o.y1 - 0.05) continue;
    if (need === 'ramp' && P.y >= o.y1 - 0.05) continue;
    if (!best || front < best.front) best = { o, front, need };
  }
  for (const c of g.crs) {
    if (c.done) continue; const ahead = c.s - P.s; if (ahead < -1 || ahead > h) continue;
    const tRel = c.t0 >= 0 ? g.t - c.t0 + ahead / Math.max(P.v, 3) : c.trig / Math.max(P.v, 3), xa = c.x0 + c.dir * c.v * tRel;
    if (Math.abs(LX(l) - xa) < c.hw + 1.05 && (!best || ahead - 0.6 < best.front)) best = { o: c, front: ahead - 0.6, need: 'block', crit: 1 };
  }
  return best;
}
function aiThink(g, skill = 1) {
  const P = g.p; if (!P.alive) return null;
  const h = P.v * 1.2 + 8, info = LANES.map(l => aiLane(g, l, h));
  // freno: semáforo en rojo, bajada desbocada o animal sin salida
  let brake = P.over > 0.5, stopAhead = false;
  const dStop = P.v * P.v / (2 * g.brakeDec);
  for (const X of g.xs) {
    const line = X.s - 7.5 - P.s; if (X.pass || line < -1.2 || line > 90) continue;
    const tArr = Math.max(0, line) / Math.max(P.v, 4), tClr = tArr + 17 / Math.max(P.v, 9);
    const red = lightAt(X, g.t + tArr) === 2 || lightAt(X, g.t + tClr) === 2 || lightAt(X, g.t + (tArr + tClr) / 2) === 2 || (lightAt(X, g.t + tArr) === 1 && tClr - tArr > 0.9);
    if (red) stopAhead = true;
    if (P.v < 1.5 && line < 8) { const p = lightP(X, g.t); if (!(p < TG - 1.7)) brake = true; }
    else if (red && line <= dStop + P.v * 0.12 + 1.5) brake = true;
  }
  const cn = g.corners.find(c => !c.done && c.s - P.s < 75 && c.s - P.s > -1);
  const cost = info.map((f, l) => {
    let c = Math.abs(l - P.lane) * 0.7 + (l < 2 ? 0.5 : 0) + (stopAhead && l < 2 ? 4 : 0);
    if (cn) { if (cn.ai == null) cn.ai = [-1, 0, 1, -1, 1][Math.floor(g.xr() * 5)]; if ((cn.ai < 0 && l === 0) || (cn.ai > 0 && l === 3)) c -= 6; }
    const fa = g.forks.find(f => P.s > f.a - 70 && P.s < f.b); if (fa) { if (P.s > fa.a - 8 && (l < 2) !== (P.lane < 2)) c += 300; else if ((l < 2) === !(fa.dl ^ (g.aiPad ? 1 : 0))) c -= 2.5; }
    if (f) {
      if (f.need === 'block') c += f.front < 0.5 ? 200 : f.front < P.v * 0.75 + 3 ? 60 + Math.max(0, 40 - f.front) : 5;
      else if (f.need === 'ramp') c += f.front < 0 && P.lane !== l ? 200 : -0.3;
      else if (f.need === 'vault') c += 1.2;
      else c += f.need === 'jump' ? (f.o.T.minor ? 3 : 2) : 2.4;
      if (l !== P.lane && f.need !== 'ramp' && f.front < P.v * 0.42) c += 40;
      if (f.need !== 'block' && f.front < 0 && P.lane !== l) c += 150;
    }
    if (g.free && f && f.o.t === 'rail') c -= 5;
    let n = 0; for (const cn of g.coins) if (cn.alive && cn.lane === l && cn.s > P.s && cn.s < P.s + 22) n++;
    return c - Math.min(1.5, n * 0.18);
  });
  let bl = P.lane;
  for (const l of LANES) if (cost[l] < cost[bl] - 0.25) bl = l;
  if (bl !== P.lane && !laneOk(g, P.lane, P.lane + Math.sign(bl - P.lane), P.s + P.v * 0.4)) bl = P.lane;
  if (bl !== P.lane) { const nx = P.lane + Math.sign(bl - P.lane), m = info[nx]; if (nx !== bl && m && m.need === 'block' && m.front < P.v * 0.3) bl = P.lane; }
  const cur = info[bl === P.lane ? P.lane : P.lane + Math.sign(bl - P.lane)];
  if (cur && cur.need === 'block' && (cur.crit || (cur.o.T.moving && cur.o.u > 0) || P.v > 3) && cur.front < dStop + 1.5 && cost[bl] > 50) brake = true;
  if (brake !== !!P.brake) return brake ? 'K' : 'k';
  const tx = LX(P.lane);
  if (bl !== P.lane && Math.abs(P.x - tx) < 0.3) return bl < P.lane ? 'L' : 'R';
  const f = info[P.lane];
  if (f) {
    const lead = P.v * (0.2 + (1 - skill) * 0.08) + 0.35;
    if (f.need === 'jump' && !P.air && f.front <= lead && f.front > -0.3) return 'U';
    if (f.need === 'jump' && P.air && P.vy < 2 && !P.fastFall && f.front > 0.5) { const tl = (P.vy + Math.sqrt(P.vy * P.vy + 2 * GRAV * Math.max(0, P.y - P.gy))) / GRAV; if (f.front / P.v < tl + 0.16) return 'D'; }
    if (f.need === 'duck' && f.front <= P.v * 0.3 + 0.4 && P.crouch < 0.18 && f.front > -0.5) return 'D';
  }
  for (const d of g.dels) if (!d.done && !d.miss) { const a = d.s - P.s; if (a > 3 && a < 8.5) return d.side < 0 ? 'Q' : 'E'; }
  if (g.free) { if (!P.air && !P.grind && (!f || f.front > 7) && g.xr() < 0.05) return 'U'; if (P.air && P.airT > 0.12 && P.trN < 1 && P.jumps >= g.maxJ && P.y > 0.9 && P.vy > -1) return 'U'; }
  return null;
}

/* Simulación rápida sin render (bot de pruebas) */
function simulate(o) {
  const g = newGame({ seed: o.seed, veh: o.veh || 'foot', ai: true, up: o.up, mult: 1, cluesLeft: 12, pet: o.pet, letters: 'EMSAY', fit: o.fit == null ? 50 : o.fit, inj: o.inj, perks: o.perks, skill: o.skill2 || 0, tut: o.tut, evt: o.evt, vup: o.vup, free: o.free });
  const maxT = o.maxT || 240; let n = 0, inp = null, errs = [], stuck = 0; g.aiPad = !!o.padRoute;
  while (g.p.alive && g.t < maxT) {
    if (n % 3 === 0) inp = aiThink(g, o.skill == null ? 1 : o.skill); else inp = null;
    if (!inp && o.boost && n % 30 === 7) inp = 'B';
    step(g, DT, inp); n++;
    g.ev.length = 0;
    const P = g.p;
    if (!Number.isFinite(P.s + P.x + P.y + P.v + g.score + P.en)) { errs.push('NaN en estado a t=' + g.t.toFixed(2)); break; }
    if (g.obs.length > 500 || g.coins.length > 900 || g.scen.length > 600 || g.dels.length > 80) { errs.push('fuga de objetos'); break; }
    if (P.y < -0.01 || P.y > 12) { errs.push('altura fuera de rango ' + P.y); break; }
    if (P.v < 0.3 && !g.tutWait) { if ((stuck += DT) > 14) { errs.push('atascado en s=' + Math.round(P.s)); break; } } else stuck = 0;
    if (o.revive && !P.alive && g.revives < 1) { revive(g); }
  }
  return { seed: o.seed, veh: g.veh.id, dist: Math.round(g.p.s), t: +g.t.toFixed(1), score: Math.round(g.score), coins: g.coinsRun, cause: g.p.alive ? 'tiempo' : g.cause, pat: g.causePat || '', bad: g.bad, rows: g.rows,
    jumps: g.jumps, ducks: g.ducks, tricks: g.tricks, trucks: g.trucks, gifts: g.gifts, clues: g.clues, powers: g.powers, deliv: g.deliv, pads: g.pads, forks: g.forksN, perf: g.perf, cross: g.crossN, red: g.redRuns, civic: g.civic, fines: g.fines, esc: g.escapes,
    badK: g.badK || '', near: g.near, vaults: g.vaults, grind: Math.round(g.grindM), duels: g.duels, rivLost: g.rivLost, crit: g.critOk, turns: g.turns, drills: g.drills, falls: g.falls, ed: g.edition, errs };
}

/* ---- RunRunZero/src/models.js ---- */
/* ===== MODELOS low-poly + atlas estilo revista EMSAY ===== */
const PC = (i, sh = 1) => [i / 4, sh, 0];           // color de paleta (índice 0..4, sombra)
const DK = hex('#1c1c22'), GR = hex('#8a8f96'), WH = hex('#f4f1e6'), SKIN = hex('#c98e62');
const AR = (x, y, w, h) => { const p = 1; return [(x + p) / 1024, (y + p) / 2048, (x + w - p) / 1024, (y + h - p) / 2048]; };
const BILL = i => AR((i % 2) * 512, Math.floor(i / 2) * 192, 512, 192);
const ATR = { fork: AR(384, 1920, 512, 128), sign: [0, 1, 2, 3, 4, 5, 6, 7].map(i => AR((i % 2) * 512, 1024 + Math.floor(i / 2) * 128, 512, 128)), event: [0, 1, 2, 3].map(i => AR((i % 2) * 512, 1536 + Math.floor(i / 2) * 192, 512, 192)), poster: [0, 1, 2, 3].map(i => AR(i * 96, 1920, 96, 128)), L: { E: AR(464, 960, 64, 64), M: AR(528, 960, 64, 64), S: AR(592, 960, 64, 64), A: AR(656, 960, 64, 64), Y: AR(720, 960, 64, 64) }, shadow: AR(32, 960, 64, 64), bike: AR(96, 960, 64, 64), arrow: AR(160, 960, 64, 64), x2: AR(224, 960, 64, 64), cover: AR(288, 960, 48, 64), star: AR(336, 960, 64, 64), eye: AR(400, 960, 64, 64) };

function makeAtlas() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 2048;
  const x = c.getContext('2d'), TT = '"Titulos","Arial Narrow",Impact,sans-serif', CU = '"Cuerpo",system-ui,sans-serif', SE = 'Georgia,"Times New Roman",serif', MO = 'ui-monospace,Consolas,monospace';
  x.textBaseline = 'middle'; x.textAlign = 'center';
  const sp = (t, n) => t.split('').join(String.fromCharCode(8202).repeat(n));
  const fit = (t, f, maxW, size) => { let s = size; do { x.font = f.replace('#', s); s -= 2; } while (x.measureText(t).width > maxW && s > 8); };
  const D = [
    (X, Y) => { x.fillStyle = '#0e6378'; x.fillRect(X, Y, 512, 192); x.fillStyle = '#fff'; fit(sp('EMSAY', 3), '800 #px ' + CU, 250, 64); x.fillText(sp('EMSAY', 3), X + 140, Y + 92);
      x.fillStyle = '#e8e4c4'; x.fillRect(X + 286, Y + 40, 206, 112); x.fillStyle = '#0e6378'; fit('DISPONIBLE', '600 #px ' + CU, 180, 30); x.fillText('DISPONIBLE', X + 389, Y + 76); x.fillText('CADA DOMINGO', X + 389, Y + 116);
      x.fillStyle = '#e8e4c4'; x.fillRect(X, Y + 176, 512, 6); },
    (X, Y) => { x.fillStyle = '#f3efe0'; x.fillRect(X, Y, 512, 192); x.fillStyle = '#1d4e79'; fit('RUN SCOOTER', '#px ' + TT, 480, 132); x.fillText('RUN SCOOTER', X + 256, Y + 84);
      x.fillStyle = '#e03a2f'; x.font = 'italic 26px ' + SE; x.fillText('¿Sabes a dónde lleva?', X + 256, Y + 160); },
    (X, Y) => { x.fillStyle = '#fbe7a9'; x.fillRect(X, Y, 512, 192); x.lineWidth = 10; x.strokeStyle = '#111'; x.strokeRect(X + 14, Y + 14, 484, 164);
      x.fillStyle = '#111'; fit(sp('SESIÓN 1:', 2), '800 #px ' + CU, 440, 40); x.fillText(sp('SESIÓN 1:', 2), X + 256, Y + 66); fit(sp('ESCUCHAR & OÍR', 2), '800 #px ' + CU, 440, 40); x.fillText(sp('ESCUCHAR & OÍR', 2), X + 256, Y + 126); },
    (X, Y) => { x.fillStyle = '#9a9ea6'; x.fillRect(X, Y, 512, 192); x.lineWidth = 8; x.strokeStyle = '#111'; x.strokeRect(X + 12, Y + 12, 488, 168);
      x.lineWidth = 2.5; fit(sp('ORALIDAD', 3), '700 #px ' + CU, 330, 46); x.strokeText(sp('ORALIDAD', 3), X + 200, Y + 58); x.fillStyle = '#111'; x.fillRect(X + 40, Y + 94, 300, 8);
      fit(sp('COMPONENTES & TÉCNICAS', 1), '800 #px ' + CU, 330, 22); x.fillText(sp('COMPONENTES & TÉCNICAS', 1), X + 196, Y + 136);
      x.lineWidth = 4; x.font = '150px ' + TT; x.strokeText('7', X + 430, Y + 100); },
    (X, Y) => { x.fillStyle = '#c0191c'; x.fillRect(X, Y, 512, 192); x.fillStyle = '#111'; x.textAlign = 'left'; x.font = 'italic 46px ' + SE; x.fillText('Niveles de', X + 22, Y + 56); x.fillText('Lectura', X + 22, Y + 108);
      x.font = '300 24px ' + CU; x.fillText('DESENTRAÑAR EL TEXTO', X + 22, Y + 160); x.textAlign = 'center';
      x.fillStyle = '#f2f2f2'; x.beginPath(); x.ellipse(X + 410, Y + 96, 82, 60, 0, 0, 7); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.arc(X + 410, Y + 96, 40, 0, 7); x.fill();
      x.fillStyle = '#c0191c'; x.beginPath(); x.arc(X + 410, Y + 96, 14, 0, 7); x.fill(); },
    (X, Y) => { x.fillStyle = '#1b4459'; x.fillRect(X, Y, 512, 192); x.strokeStyle = '#ff5a2a'; x.lineWidth = 9; x.lineCap = 'round';
      for (const yy of [Y + 26, Y + 168]) { x.beginPath(); for (let i = 0; i <= 40; i++) { const xx = X + 30 + i * 11.3; const w = yy + Math.sin(i * 0.9) * 8; i ? x.lineTo(xx, w) : x.moveTo(xx, w); } x.stroke(); }
      fit('TIPOLOGÍAS', '#px ' + TT, 440, 96); x.fillStyle = '#0b1d27'; x.fillText('TIPOLOGÍAS', X + 261, Y + 91); x.fillStyle = '#ff5a2a'; x.fillText('TIPOLOGÍAS', X + 256, Y + 86);
      x.fillStyle = '#e8c25a'; x.font = '800 20px ' + CU; x.fillText(sp('¡SIN FIN!', 2), X + 256, Y + 142); },
    (X, Y) => { x.fillStyle = '#c49a2c'; x.fillRect(X, Y, 512, 192); x.fillStyle = '#111'; x.fillRect(X, Y + 140, 512, 52); x.fillStyle = '#c49a2c';
      for (let i = 0; i < 22; i++) { x.fillRect(X + 8 + i * 23, Y + 146, 12, 10); x.fillRect(X + 8 + i * 23, Y + 176, 12, 10); }
      x.fillStyle = '#fff'; x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowOffsetY = 4; fit('En la Ruta y', '800 #px ' + CU, 460, 50); x.fillText('En la Ruta y', X + 256, Y + 46); x.fillText('la Ciclovía', X + 256, Y + 102); x.shadowColor = 'transparent';
      x.fillStyle = '#fff'; x.font = '600 15px ' + MO; x.fillText('FILM KJ188 PLUS · VIVE A TU ESTILO', X + 256, Y + 166); },
    (X, Y) => { x.fillStyle = '#000'; x.fillRect(X, Y, 512, 192); x.strokeStyle = '#a42cff'; x.lineWidth = 8; x.shadowColor = '#a42cff'; x.shadowBlur = 18; x.strokeRect(X + 12, Y + 12, 488, 168);
      x.shadowColor = '#39c8ff'; x.fillStyle = '#39c8ff'; fit('RUN SCOOTER', '#px ' + TT, 440, 104); x.fillText('RUN SCOOTER', X + 256, Y + 86); x.shadowBlur = 8; x.shadowColor = '#ff2fb3'; x.fillStyle = '#ff2fb3';
      x.font = '700 20px ' + MO; x.fillText(sp('DOC ELEMENT EDITION', 1), X + 256, Y + 152); x.shadowBlur = 0; x.shadowColor = 'transparent'; },
    (X, Y) => { x.fillStyle = '#f3efe0'; x.fillRect(X, Y, 512, 192); x.lineWidth = 10; x.strokeStyle = '#c0191c'; x.strokeRect(X + 10, Y + 10, 492, 172);
      x.fillStyle = '#c0191c'; fit('KILÓMETRO CERO', '#px ' + TT, 460, 100); x.fillText('KILÓMETRO CERO', X + 256, Y + 84); x.fillStyle = '#1d4e79'; x.font = '800 20px ' + CU; x.fillText(sp('LA CICLOVÍA SIN FIN', 2), X + 256, Y + 148); },
    (X, Y) => { x.fillStyle = '#e8e4c4'; x.fillRect(X, Y, 512, 192); x.fillStyle = '#0e6378'; x.fillRect(X, Y, 512, 34); x.fillRect(X, Y + 158, 512, 34);
      x.fillStyle = '#1d4e79'; fit('LA REVISTA SOBRE RUEDAS', '#px ' + TT, 480, 70); x.fillText('LA REVISTA SOBRE RUEDAS', X + 256, Y + 78); fit('MÁS ACTUAL', '#px ' + TT, 480, 56); x.fillText('MÁS ACTUAL', X + 256, Y + 128); }
  ];
  D.forEach((f, i) => { x.save(); x.beginPath(); x.rect((i % 2) * 512, Math.floor(i / 2) * 192, 512, 192); x.clip(); f((i % 2) * 512, Math.floor(i / 2) * 192); x.restore(); });
  // tira inferior: blanco, sombra, símbolos
  x.clearRect(0, 960, 1024, 64); x.fillStyle = '#fff'; x.fillRect(0, 960, 32, 64);
  const gr = x.createRadialGradient(64, 992, 2, 64, 992, 31); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(32, 960, 64, 64);
  x.strokeStyle = '#fff'; x.lineWidth = 4; x.lineCap = 'round';
  x.beginPath(); x.arc(110, 1000, 11, 0, 7); x.stroke(); x.beginPath(); x.arc(146, 1000, 11, 0, 7); x.stroke();
  x.beginPath(); x.moveTo(110, 1000); x.lineTo(122, 980); x.lineTo(140, 980); x.lineTo(146, 1000); x.moveTo(122, 980); x.lineTo(128, 1000); x.lineTo(140, 980); x.moveTo(118, 974); x.lineTo(126, 974); x.moveTo(138, 974); x.lineTo(144, 972); x.stroke();
  x.fillStyle = '#fff'; x.beginPath(); x.moveTo(192, 966); x.lineTo(214, 996); x.lineTo(201, 996); x.lineTo(201, 1020); x.lineTo(183, 1020); x.lineTo(183, 996); x.lineTo(170, 996); x.closePath(); x.fill();
  x.fillStyle = '#ffc23a'; x.beginPath(); x.arc(256, 992, 30, 0, 7); x.fill(); x.fillStyle = '#111'; x.font = '38px ' + TT; x.fillText('×2', 256, 994);
  x.fillStyle = '#e8e4c4'; x.fillRect(288, 960, 48, 64); x.fillStyle = '#0e6378'; x.fillRect(288, 960, 48, 9); x.fillStyle = '#1d4e79'; x.font = '24px ' + TT; x.fillText('RS', 312, 988);
  x.fillStyle = '#c0191c'; x.fillRect(294, 1004, 36, 4); x.fillRect(294, 1012, 26, 3);
  x.fillStyle = '#ffc23a'; x.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 10 : 30; x.lineTo(368 + Math.cos(a) * r, 992 + Math.sin(a) * r); } x.closePath(); x.fill();
  x.strokeStyle = '#fff'; x.lineWidth = 5; x.beginPath(); x.arc(432, 992, 26, 0, 7); x.stroke(); x.fillStyle = '#c0191c'; x.beginPath(); x.arc(432, 992, 10, 0, 7); x.fill();
  'EMSAY'.split('').forEach((ch, i) => { const cx = 496 + i * 64; x.fillStyle = '#ffc23a'; x.beginPath(); x.arc(cx, 992, 30, 0, 7); x.fill(); x.lineWidth = 4; x.strokeStyle = '#111'; x.stroke(); x.fillStyle = '#1d4e79'; x.font = '46px ' + TT; x.fillText(ch, cx, 995); });
  // ---- mitad inferior: letreros de locales, eventos de Orbe y pósters de la editorial ----
  const SG = [['FERRETERÍA', '#ffc23a', '#111', 'EL TORNILLO FELIZ'], ['MADERAS', '#6b4226', '#f5e6c0', 'DEPÓSITO EL ROBLE'], ['TIENDA', '#c0191c', '#fff', 'MECATO Y GASEOSA'], ['LIMONADA', '#2dbd5a', '#fff', 'BIEN FRÍA'], ['GUARAPO', '#8c6d1f', '#fff', 'DE CAÑA'], ['AREPAS', '#ff5a2a', '#fff', 'Y EMPANADAS'], ['PARQUE', '#2f8a3f', '#fff7d6', 'ZONA LIBRE · TRUCOS · DESCANSO'], ['KIOSCO EMSAY', '#0e6378', '#e8e4c4', 'LAS NUEVAS NUEVAS']];
  SG.forEach((q, i) => { const X = (i % 2) * 512, Y = 1024 + Math.floor(i / 2) * 128; x.fillStyle = q[1]; x.fillRect(X, Y, 512, 128); x.strokeStyle = q[2]; x.lineWidth = 6; x.strokeRect(X + 8, Y + 8, 496, 112); x.fillStyle = q[2]; fit(q[0], '#px ' + TT, 470, 92); x.fillText(q[0], X + 256, Y + 54); x.font = '800 17px ' + CU; x.fillText(sp(q[3], 2), X + 256, Y + 104); });
  const EV = [['FERIA DEL LIBRO', 'DE ORBE', '#fbe7a9', '#c0191c', '#111'], ['CARNAVAL', 'DE LAS MIL RUEDAS', '#a42cff', '#ffc23a', '#fff'], ['MARATÓN', 'DE LA CICLOVÍA', '#0e6378', '#e8e4c4', '#ffc23a'], ['FESTIVAL', 'DE COMETAS', '#5cc6ee', '#fff', '#c0191c']];
  EV.forEach((q, i) => { const X = (i % 2) * 512, Y = 1536 + Math.floor(i / 2) * 192; x.fillStyle = q[2]; x.fillRect(X, Y, 512, 192); x.fillStyle = q[4]; x.font = '800 15px ' + CU; x.fillText(sp('EMSAY PRESENTA', 3), X + 256, Y + 26); x.fillStyle = q[3]; fit(q[0], '#px ' + TT, 470, 104); x.fillText(q[0], X + 256, Y + 88); x.fillStyle = q[4]; fit(q[1], '#px ' + TT, 440, 46); x.fillText(q[1], X + 256, Y + 152); });
  { const X = 384, Y = 1920; x.fillStyle = '#ffc23a'; x.fillRect(X, Y, 512, 128); x.strokeStyle = '#111'; x.lineWidth = 7; x.strokeRect(X + 7, Y + 7, 498, 114); x.fillStyle = '#111'; fit('BIFURCACIÓN', '#px ' + TT, 460, 78); x.fillText('BIFURCACIÓN', X + 256, Y + 50); x.font = '800 20px ' + CU; x.fillText(sp('◀ ELIGE TU RUTA ▶', 2), X + 256, Y + 100); }
  const PO = [['LAS', 'NUEVAS', 'NUEVAS', '#0e6378', '#e8e4c4'], ['LEE', 'EMSAY', 'HOY', '#c0191c', '#fff'], ['RUEDA', 'Y', 'LEE', '#ffc23a', '#111'], ['ORBE', 'TE', 'LEE', '#1b4459', '#ff5a2a']];
  PO.forEach((q, i) => { const X = i * 96, Y = 1920; x.fillStyle = q[3]; x.fillRect(X, Y, 96, 128); x.strokeStyle = q[4]; x.lineWidth = 3; x.strokeRect(X + 5, Y + 5, 86, 118); x.fillStyle = q[4]; for (let k = 0; k < 3; k++) { fit(q[k], '#px ' + TT, 78, 40); x.fillText(q[k], X + 48, Y + 28 + k * 36); } });
  return c;
}

/* barra entre dos puntos en el plano y-z (x fijo) */
function bar(mb, x, y0, z0, y1, z1, t, col, e = 0) {
  const dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dy, dz);
  mb.at(x, (y0 + y1) / 2, (z0 + z1) / 2, 0, Math.atan2(dz, dy), 0, 1, 1, 1, m => m.box(0, 0, 0, t, L, t, col, e));
}
const wheelX = (mb, x, y, z, r, w, col, seg = 12) => mb.at(x, y, z, 0, 0, Math.PI / 2, 1, 1, 1, m => m.cyl(0, -w / 2, 0, r, w, seg, col));

const MOD = {
  road() {
    const m = new MB(), S = 4;
    for (let k = -11; k < 60; k++) {
      const z0 = -k * S, z1 = z0 - S, alt = k & 1, q = (x0, x1, y, col, e = 0, uv) => m.quad([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], col, e, uv);
      q(-3.2, 3.2, 0, PC(0, alt ? 1 : 0.955));
      for (const lx of [-1.6, 1.6]) { m.quad([lx - 0.05, 0.012, z0], [lx + 0.05, 0.012, z0], [lx + 0.05, 0.012, z0 - 2], [lx - 0.05, 0.012, z0 - 2], PC(3), 1); }
      for (const lx of [-0.1, 0.1]) q(lx - 0.035, lx + 0.035, 0.012, PC(4, 1.1), 1);
      for (const sd of [-1, 1]) {
        const a = sd * 3.02, b = sd * 3.12; q(Math.min(a, b), Math.max(a, b), 0.012, PC(3), 1);
        const c0 = sd * 3.2, c1 = sd * 3.5; q(Math.min(c0, c1), Math.max(c0, c1), 0.16, PC(4), 1);
        m.quad([c0, 0, z0], [c0, 0.16, z0], [c0, 0.16, z1], [c0, 0, z1], PC(4, 0.8), 1);
        const w0 = sd * 3.5, w1 = sd * 5.3; q(Math.min(w0, w1), Math.max(w0, w1), 0.16, PC(1, alt ? 1 : 0.92));
        m.quad([w1, 0.16, z0], [w1, 0, z0], [w1, 0, z1], [w1, 0.16, z1], PC(1, 0.75));
        const g0 = sd * 5.3, g1 = sd * 80; q(Math.min(g0, g1), Math.max(g0, g1), 0, PC(2, (k >> 1) & 1 ? 1 : 0.9));
      }
      if (k % 10 === 0) {
        const fl = u => [u[0], u[3], u[2], u[1]];
        m.quad([0.25, 0.014, z0 - 1], [1.35, 0.014, z0 - 1], [1.35, 0.014, z0 - 2.3], [0.25, 0.014, z0 - 2.3], PC(3), 1, ATR.bike); m.quad([-1.35, 0.014, z0 - 11], [-0.25, 0.014, z0 - 11], [-0.25, 0.014, z0 - 12.3], [-1.35, 0.014, z0 - 12.3], PC(3), 1, fl(ATR.bike));
        for (const lx of [0.8, 2.4]) m.quad([lx - 0.4, 0.014, z0 - 20], [lx + 0.4, 0.014, z0 - 20], [lx + 0.4, 0.014, z0 - 21.7], [lx - 0.4, 0.014, z0 - 21.7], PC(3), 1, ATR.arrow);
        for (const lx of [-0.8, -2.4]) m.quad([lx - 0.4, 0.014, z0 - 30], [lx + 0.4, 0.014, z0 - 30], [lx + 0.4, 0.014, z0 - 31.7], [lx - 0.4, 0.014, z0 - 31.7], PC(3), 1, fl(ATR.arrow));
      }
    }
    return m;
  },
  tree() { const m = new MB(), r = rngOf(5); m.cyl(0, 0, 0, 0.16, 1.7, 6, PC(1)); m.ico(0, 2.45, 0, 1.15, PC(0), 0, 1, r, 0.25); m.ico(0.45, 3.1, 0.2, 0.75, PC(0, 0.88), 0, 1, r, 0.2); return m; },
  pine() { const m = new MB(); m.cyl(0, 0, 0, 0.14, 1.1, 6, PC(1)); m.cyl(0, 0.9, 0, 1.05, 1.5, 7, PC(0, 0.9), 0, 0, false); m.cyl(0, 1.8, 0, 0.82, 1.3, 7, PC(0), 0, 0, false); m.cyl(0, 2.6, 0, 0.55, 1.2, 7, PC(0, 1.08), 0, 0, false); return m; },
  bush() { const m = new MB(), r = rngOf(9); m.ico(0, 0.45, 0, 0.72, PC(0, 0.9), 0, 0.7, r, 0.3); m.ico(0.5, 0.35, 0.2, 0.5, PC(0, 1.05), 0, 0.75, r, 0.3); return m; },
  lamp() { const m = new MB(); m.cyl(0, 0, 0, 0.08, 4.3, 6, PC(1, 0.8)); m.box(-0.7, 4.25, 0, 1.4, 0.09, 0.09, PC(1, 0.8)); m.box(-1.35, 4.12, 0, 0.5, 0.16, 0.3, PC(1, 0.7)); m.box(-1.35, 4.02, 0, 0.42, 0.05, 0.24, PC(4), 1); m.box(0, 0.15, 0, 0.3, 0.3, 0.3, PC(1, 0.7)); return m; },
  bench() { const m = new MB(); m.box(0, 0.45, 0, 0.5, 0.07, 1.6, PC(1, 1.1)); m.box(0.22, 0.75, 0, 0.06, 0.4, 1.6, PC(1, 1.1)); for (const z of [-0.65, 0.65]) m.box(0, 0.22, z, 0.45, 0.45, 0.08, PC(1, 0.6)); return m; },
  hill() { const m = new MB(); m.ico(0, 0, 0, 11, PC(0, 0.8), 0, 0.4, rngOf(3), 0.3); return m; },
  bld(v, pi) {
    const m = new MB(), dims = [[7, 18, 8, 3, 8], [8, 11, 9, 3, 5], [11, 6.5, 9, 5, 3]][v], [w, h, d, cx, cy] = dims;
    m.box(0, h / 2, 0, w, h, d, PC(pi)); m.box(0, h + 0.3, 0, w + 0.3, 0.6, d + 0.3, PC(1, 0.9));
    for (let i = 0; i < cx; i++) for (let j = 0; j < cy; j++) {
      const wx = -w / 2 + (i + 0.5) * w / cx, wy = 1.6 + j * (h - 2.2) / cy, ww = w / cx * 0.5, wh = (h - 2.2) / cy * 0.5, lit = ((i * 7 + j * 3 + v) % 5) > 1 ? 1 : 0;
      const col = lit ? PC(4) : PC(1, 0.6);
      for (const sz of [-1, 1]) m.quad([wx - ww / 2, wy, sz * (d / 2 + 0.02)], [wx + ww / 2, wy, sz * (d / 2 + 0.02)], [wx + ww / 2, wy + wh, sz * (d / 2 + 0.02)], [wx - ww / 2, wy + wh, sz * (d / 2 + 0.02)], col, lit);
      const zz = -d / 2 + (i + 0.5) * d / cx;
      for (const sx of [-1, 1]) m.quad([sx * (w / 2 + 0.02), wy, zz - ww / 2], [sx * (w / 2 + 0.02), wy, zz + ww / 2], [sx * (w / 2 + 0.02), wy + wh, zz + ww / 2], [sx * (w / 2 + 0.02), wy + wh, zz - ww / 2], col, lit);
    }
    return m;
  },
  billFrame() { const m = new MB(); for (const x of [-2, 2]) m.box(x, 1.6, 0.12, 0.16, 3.2, 0.16, PC(1, 0.8)); m.box(0, 3.95, 0.06, 5.0, 1.95, 0.12, PC(1, 0.7)); return m; },
  billPanelUV(uv) { const m = new MB(); m.quad([-2.4, 3.05, 0], [2.4, 3.05, 0], [2.4, 4.85, 0], [-2.4, 4.85, 0], WH, 1, uv); return m; },
  billPanel(i) { const m = new MB(); m.quad([-2.4, 3.05, 0], [2.4, 3.05, 0], [2.4, 4.85, 0], [-2.4, 4.85, 0], WH, 1, BILL(i)); return m; },
  gateFrame() { const m = new MB(); for (const x of [-4.4, 4.4]) { m.box(x, 3, 0, 0.5, 6, 0.5, PC(1, 0.85)); m.box(x, 0.2, 0, 0.8, 0.4, 0.8, PC(1, 0.7)); } m.box(0, 6.0, 0, 9.4, 0.4, 0.5, PC(1, 0.85)); m.box(0, 5.05, 0.02, 7.1, 2.0, 0.2, PC(1, 0.6)); return m; },
  gatePanel(i) { const m = new MB(); m.quad([-3.4, 4.15, -0.14], [3.4, 4.15, -0.14], [3.4, 5.9, -0.14], [-3.4, 5.9, -0.14], WH, 1, BILL(i)); m.quad([3.4, 4.15, 0.14], [-3.4, 4.15, 0.14], [-3.4, 5.9, 0.14], [3.4, 5.9, 0.14], WH, 1, BILL(i)); return m; },
  rock() { const m = new MB(), r = rngOf(11); m.ico(0, 0.43, 0, 0.62, GR, 0, 0.7, r, 0.3); m.ico(0.45, 0.2, 0.25, 0.3, hex('#6f747b'), 0, 0.7, r, 0.3); return m; },
  cone() { const m = new MB(), o = hex('#ff5a2a'); m.box(0, 0.025, 0, 0.56, 0.05, 0.56, DK); m.cyl(0, 0.05, 0, 0.27, 0.6, 10, o, 0.0, 0.03); m.cyl(0, 0.28, 0, 0.2, 0.12, 10, WH, 0, 0.175, false); return m; },
  barrier() {
    const m = new MB(), red = hex('#c0191c');
    for (const x of [-0.8, 0.8]) { m.box(x, 0.5, 0, 0.08, 1.0, 0.08, GR); m.box(x, 0.03, 0, 0.12, 0.06, 0.5, DK); }
    for (const y of [0.56, 0.9]) for (let i = 0; i < 5; i++) m.box(-0.72 + i * 0.36, y, 0, 0.36, 0.2, 0.06, i % 2 ? WH : red);
    m.box(0.8, 1.06, 0, 0.12, 0.12, 0.12, hex('#ffc23a'), 1); return m;
  },
  pothole() { const m = new MB(), r = rngOf(4); m.at(0, 0, 0, 0, 0, 0, 1, 1, 0.95, q => q.cyl(0, 0.004, 0, 0.78, 0.014, 12, hex('#0d0d10'))); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; m.box(Math.cos(a) * 0.78, 0.03, Math.sin(a) * 0.72, 0.18 + r() * 0.1, 0.06, 0.14, hex('#55585e')); } return m; },
  puddle() { const m = new MB(); m.at(0, 0, 0, 0, 0, 0, 1, 1, 1.55, q => { q.cyl(0, 0.004, 0, 0.85, 0.012, 12, hex('#5fb4e6'), 1); q.cyl(0.25, 0.006, -0.2, 0.3, 0.012, 8, hex('#d8f1ff'), 1); }); return m; },
  branch(side, lanes) {
    const m = new MB(), brown = hex('#5b4636'), leaf = hex('#3f8a4f'), leaf2 = hex('#2f6e3c'), r = rngOf(lanes.length * 7 + side + 20);
    const tx = side * 4.4, xs = lanes.map(l => LX(l)), far = side > 0 ? Math.min(...xs) - 0.8 : Math.max(...xs) + 0.8, near = side > 0 ? Math.max(...xs) + 0.8 : Math.min(...xs) - 0.8;
    m.cyl(tx, 0, 0, 0.32, 4.2, 7, brown); m.ico(tx, 4.6, 0, 1.7, leaf2, 0, 0.85, r, 0.25);
    const len = Math.abs(tx - far); m.at((tx + far) / 2, 3.1, 0, 0, 0, Math.PI / 2, 1, 1, 1, q => q.cyl(0, -len / 2, 0, 0.15, len, 6, brown));
    const lw = Math.abs(near - far); m.at((near + far) / 2, 1.5, 0, 0, 0, Math.PI / 2, 1, 1, 1, q => q.cyl(0, -lw / 2, 0, 0.12, lw, 6, brown));
    for (const x of [near, far]) m.box(x, 2.3, 0, 0.1, 1.6, 0.1, brown);
    for (let x = Math.min(near, far) + 0.3; x < Math.max(near, far); x += 0.62) { m.ico(x, 1.42 + r() * 0.12, (r() - 0.5) * 0.3, 0.36 + r() * 0.1, r() < 0.5 ? leaf : leaf2, 0, 0.8, r, 0.3); }
    return m;
  },
  cart() {
    const m = new MB(), y = hex('#ffd23a'), g = hex('#2f8a3f');
    for (const z of [-0.55, 0.55]) wheelX(m, 0, 0.28, z, 0.28, 1.5, DK, 10);
    m.box(0, 0.85, 0, 1.45, 0.9, 1.6, y); m.box(0, 0.75, 0, 1.47, 0.18, 1.62, g); m.box(0, 1.45, 0, 1.2, 0.3, 1.3, hex('#bfe6ff'), 1);
    m.cyl(0, 1.3, 0, 0.04, 0.8, 5, GR); m.cyl(0, 2.05, 0, 1.15, 0.45, 8, hex('#e03a2f'), 0, 0.05, true); m.cyl(0, 2.07, 0, 0.6, 0.3, 8, WH, 0, 0.05, false);
    return m;
  },
  kiosk() {
    const m = new MB(), t = hex('#0e6378');
    m.box(0, 1.1, 0, 1.75, 2.2, 1.9, t); m.box(0, 2.33, 0, 2.0, 0.18, 2.15, hex('#e8e4c4')); m.box(0, 0.95, 1.0, 1.8, 0.1, 0.3, hex('#e8e4c4'));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const x = -0.55 + i * 0.55, yy = 1.25 + j * 0.6; m.quad([x - 0.2, yy, 0.96], [x + 0.2, yy, 0.96], [x + 0.2, yy + 0.5, 0.96], [x - 0.2, yy + 0.5, 0.96], WH, 1, ATR.cover); }
    m.quad([-0.86, 0.15, 0.96], [0.86, 0.15, 0.96], [0.86, 0.8, 0.96], [-0.86, 0.8, 0.96], WH, 0, BILL(0)); return m;
  },
  truck(col) {
    const m = new MB(), c = hex(['#0e6378', '#c0191c', '#c49a2c'][col]);
    m.box(0, 1.35, 1.4, 1.86, 2.1, 11.2, c); m.box(0, 2.42, 1.4, 1.9, 0.06, 11.25, hex('#d9d2b0'));
    m.box(0, 1.25, -5.6, 1.86, 1.9, 2.8, c); m.box(0, 1.65, -7.02, 1.7, 0.8, 0.06, hex('#bfe6ff'), 1);
    for (const sx of [-1, 1]) {
      m.quad([sx * 0.94, 0.55, 6.8], [sx * 0.94, 0.55, -4.0], [sx * 0.94, 2.25, -4.0], [sx * 0.94, 2.25, 6.8], WH, 0.3, BILL(sx > 0 ? 0 : 9));
      for (const z of [5, 3.4, -5.4]) wheelX(m, sx * 0.82, 0.38, z, 0.38, 0.3, DK, 10);
    }
    m.quad([-0.9, 0.5, 7.02], [0.9, 0.5, 7.02], [0.9, 2.3, 7.02], [-0.9, 2.3, 7.02], WH, 0.3, BILL(1));
    for (const x of [-0.8, 0.8]) m.box(x, 0.55, 7.03, 0.2, 0.12, 0.05, hex('#ff2a2a'), 1);
    m.box(0, 0.28, 7.0, 1.9, 0.12, 0.2, DK);
    return m;
  },
  ramp(h, len, col) {
    const m = new MB(); m.wedge(0, len / 2, 1.84, len, h, hex(col));
    for (let t = 0.1; t < 0.95; t += 0.2) { const z = len / 2 - len * t, yy = h * t + 0.02, dz = len * 0.07, dh = h * 0.07; m.quad([-0.92, yy, z], [0.92, yy, z], [0.92, yy + dh, z - dz], [-0.92, yy + dh, z - dz], DK); }
    for (const sx of [-1, 1]) m.box(sx * 0.95, h * 0.5, -len / 2 + 0.1, 0.08, h, 0.12, GR);
    return m;
  },
  coin() { const m = new MB(), g = hex('#ffc23a'), g2 = hex('#e09a12'); m.at(0, 0, 0, 0, Math.PI / 2, 0, 1, 1, 1, q => { q.cyl(0, -0.045, 0, 0.34, 0.09, 14, g, 1); q.cyl(0, -0.055, 0, 0.2, 0.11, 10, g2, 1); }); return m; },
  gift() { const m = new MB(), mg = hex('#ff2fb3'), au = hex('#ffc23a'); m.box(0, 0, 0, 0.62, 0.62, 0.62, mg, 0.2); m.box(0, 0, 0, 0.66, 0.64, 0.14, au, 1); m.box(0, 0, 0, 0.14, 0.64, 0.66, au, 1); m.at(0, 0.38, 0, 0.6, 0, 0.5, 1, 1, 1, q => q.box(0, 0, 0, 0.32, 0.12, 0.1, au, 1)); m.at(0, 0.38, 0, -0.6, 0, -0.5, 1, 1, 1, q => q.box(0, 0, 0, 0.32, 0.12, 0.1, au, 1)); return m; },
  clue() { const m = new MB(); m.box(0, 0, 0, 0.56, 0.74, 0.04, hex('#e8e4c4')); m.quad([-0.26, -0.35, -0.025], [0.26, -0.35, -0.025], [0.26, 0.35, -0.025], [-0.26, 0.35, -0.025], WH, 1, ATR.eye); m.quad([0.26, -0.35, 0.025], [-0.26, -0.35, 0.025], [-0.26, 0.35, 0.025], [0.26, 0.35, 0.025], WH, 1, ATR.cover); return m; },
  halo(col) { const m = new MB(), c = hex(col); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; m.box(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0, 0.12, 0.12, 0.06, c, 1); } return m; },
  magnet() { const m = new MB(), red = hex('#e03a2f'); for (const x of [-0.18, 0.18]) { m.box(x, 0.05, 0, 0.13, 0.38, 0.14, red); m.box(x, -0.2, 0, 0.13, 0.12, 0.14, WH, 1); } m.box(0, 0.27, 0, 0.5, 0.12, 0.14, red); return m; },
  shield() { const m = new MB(), b = hex('#39c8ff'); m.hemi(0, -0.15, 0, 0.36, 10, 3, b, 0.6); m.box(0, -0.05, -0.33, 0.4, 0.08, 0.1, DK); return m; },
  turbo() { const m = new MB(), y = hex('#ffc23a'); const P = [[-0.05, 0.42], [0.22, 0.42], [0.04, 0.06], [0.2, 0.06], [-0.18, -0.45], [-0.02, -0.05], [-0.2, -0.05]];
    for (const z of [-0.05, 0.05]) { m.tri([P[0][0], P[0][1], z], [P[1][0], P[1][1], z], [P[2][0], P[2][1], z], y, 1); m.tri([P[0][0], P[0][1], z], [P[2][0], P[2][1], z], [P[6][0], P[6][1], z], y, 1); m.tri([P[6][0], P[6][1], z], [P[3][0], P[3][1], z], [P[5][0], P[5][1], z], y, 1); m.tri([P[3][0], P[3][1], z], [P[4][0], P[4][1], z], [P[5][0], P[5][1], z], y, 1); m.tri([P[6][0], P[6][1], z], [P[2][0], P[2][1], z], [P[3][0], P[3][1], z], y, 1); }
    return m; },
  x2() { const m = new MB(); m.quad([-0.34, -0.34, -0.02], [0.34, -0.34, -0.02], [0.34, 0.34, -0.02], [-0.34, 0.34, -0.02], WH, 1, ATR.x2); m.quad([0.34, -0.34, 0.02], [-0.34, -0.34, 0.02], [-0.34, 0.34, 0.02], [0.34, 0.34, 0.02], WH, 1, ATR.x2); return m; },
  cube() { const m = new MB(); m.box(0, 0, 0, 1, 1, 1, [1, 1, 1], 1); return m; },
  shadow() { const m = new MB(); m.quad([-0.5, 0.03, 0.5], [0.5, 0.03, 0.5], [0.5, 0.03, -0.5], [-0.5, 0.03, -0.5], [0, 0, 0], 0, ATR.shadow); return m; },
  /* ---- vehículos (adelante = -z, suelo y=0) ---- */
  veh(id, paint, pe) {
    const m = new MB(), c = hex(paint), e = pe ? 1 : 0, w = hex('#2a2a30'), cr = hex('#e8e4c4');
    if (id === 'scooter') {
      m.box(0, 0.1, 0.02, 0.16, 0.045, 0.66, c, e); m.box(0, 0.13, 0.34, 0.14, 0.03, 0.12, w);
      wheelX(m, 0, 0.09, 0.32, 0.09, 0.05, w, 10); wheelX(m, 0, 0.09, -0.32, 0.09, 0.05, w, 10);
      bar(m, 0, 0.1, -0.32, 1.0, -0.42, 0.05, c, e); m.box(0, 1.0, -0.42, 0.54, 0.04, 0.04, w); m.box(0, 0.98, -0.42, 0.62, 0.06, 0.06, DK);
    } else if (id === 'escooter') {
      m.box(0, 0.15, 0, 0.22, 0.07, 0.86, c, e); m.box(0, 0.1, 0, 0.18, 0.06, 0.6, DK);
      wheelX(m, 0, 0.12, 0.4, 0.12, 0.07, w, 10); wheelX(m, 0, 0.12, -0.42, 0.12, 0.07, w, 10);
      bar(m, 0, 0.16, -0.42, 1.05, -0.48, 0.075, c, e); m.box(0, 1.05, -0.48, 0.56, 0.045, 0.045, w); m.box(0, 0.82, -0.5, 0.12, 0.08, 0.06, hex('#fff6c8'), 1);
      m.box(0, 0.22, 0.46, 0.2, 0.04, 0.1, hex('#ff2a2a'), 1);
    } else if (id === 'bike') {
      for (const z of [0.52, -0.52]) { wheelX(m, 0, 0.34, z, 0.34, 0.04, w, 14); wheelX(m, 0, 0.34, z, 0.08, 0.07, GR, 8); }
      bar(m, 0, 0.36, -0.02, 0.95, -0.42, 0.06, c, e); bar(m, 0, 0.9, 0.12, 0.95, -0.42, 0.055, c, e); bar(m, 0, 0.36, -0.02, 0.92, 0.12, 0.055, c, e);
      bar(m, 0, 0.36, -0.02, 0.34, 0.52, 0.04, c, e); bar(m, 0, 0.9, 0.12, 0.34, 0.52, 0.04, c, e); bar(m, 0, 0.95, -0.42, 0.34, -0.52, 0.045, c, e);
      m.box(0, 0.97, 0.14, 0.14, 0.05, 0.26, DK); m.box(0, 1.05, -0.46, 0.56, 0.04, 0.04, w); bar(m, 0, 0.95, -0.42, 1.05, -0.46, 0.04, w);
      m.box(0, 0.36, -0.02, 0.32, 0.03, 0.06, DK);
      m.box(0, 0.86, -0.72, 0.42, 0.04, 0.34, GR); for (const sx of [-1, 1]) m.box(sx * 0.2, 0.96, -0.72, 0.03, 0.2, 0.34, GR); m.box(0, 0.96, -0.89, 0.42, 0.2, 0.03, GR);
      m.box(0, 0.95, -0.72, 0.34, 0.14, 0.26, cr); m.box(0, 1.03, -0.72, 0.3, 0.04, 0.24, hex('#0e6378'));
    } else if (id === 'skate') {
      m.box(0, 0.12, 0, 0.25, 0.035, 0.6, c, e); m.at(0, 0.15, -0.36, 0, -0.35, 0, 1, 1, 1, q => q.box(0, 0, 0, 0.25, 0.035, 0.16, c, e)); m.at(0, 0.15, 0.36, 0, 0.35, 0, 1, 1, 1, q => q.box(0, 0, 0, 0.25, 0.035, 0.16, c, e));
      m.box(0, 0.14, 0, 0.24, 0.01, 0.58, DK);
      for (const z of [-0.24, 0.24]) { m.box(0, 0.085, z, 0.2, 0.04, 0.05, GR); for (const sx of [-1, 1]) wheelX(m, sx * 0.11, 0.05, z, 0.05, 0.045, cr, 8); }
    } else if (id === 'trike') {
      for (const sx of [-1, 1]) wheelX(m, sx * 0.42, 0.26, -0.62, 0.26, 0.05, w, 12);
      wheelX(m, 0, 0.32, 0.55, 0.32, 0.04, w, 14); m.box(0, 0.33, -0.62, 0.9, 0.05, 0.08, c, e);
      m.box(0, 0.64, -0.62, 0.86, 0.5, 0.6, hex('#0e6378')); m.box(0, 0.9, -0.62, 0.9, 0.04, 0.64, cr);
      for (const sx of [-1, 1]) m.quad([sx * 0.432, 0.45, -0.88], [sx * 0.432, 0.45, -0.36], [sx * 0.432, 0.84, -0.36], [sx * 0.432, 0.84, -0.88], WH, 0.3, ATR.cover);
      m.quad([-0.3, 0.45, -0.922], [0.3, 0.45, -0.922], [0.3, 0.84, -0.922], [-0.3, 0.84, -0.922], WH, 0.3, BILL(0));
      bar(m, 0, 0.36, -0.02, 0.95, -0.36, 0.06, c, e); bar(m, 0, 0.9, 0.12, 0.95, -0.36, 0.055, c, e); bar(m, 0, 0.36, -0.02, 0.92, 0.12, 0.055, c, e);
      bar(m, 0, 0.36, -0.02, 0.32, 0.55, 0.04, c, e); bar(m, 0, 0.9, 0.12, 0.32, 0.55, 0.04, c, e); bar(m, 0, 0.36, -0.02, 0.36, -0.34, 0.05, c, e);
      m.box(0, 0.97, 0.14, 0.14, 0.05, 0.26, DK); m.box(0, 1.08, -0.4, 0.6, 0.04, 0.04, w); bar(m, 0, 0.95, -0.36, 1.08, -0.4, 0.04, w); m.box(0, 0.36, -0.02, 0.32, 0.03, 0.06, DK);
    } else if (id === 'euc') {
      wheelX(m, 0, 0.3, 0, 0.3, 0.1, w, 14); wheelX(m, 0, 0.3, 0, 0.12, 0.13, GR, 8);
      for (const sx of [-1, 1]) { m.box(sx * 0.085, 0.36, 0, 0.05, 0.42, 0.5, c, e); m.box(sx * 0.15, 0.17, 0, 0.12, 0.025, 0.2, DK); }
      m.box(0, 0.6, 0, 0.2, 0.06, 0.36, c, e); m.box(0, 0.45, -0.31, 0.1, 0.05, 0.03, hex('#fff6c8'), 1); m.box(0, 0.45, 0.31, 0.1, 0.04, 0.03, hex('#ff2a2a'), 1);
    } else if (id === 'long') {
      m.box(0, 0.13, 0, 0.27, 0.035, 1.0, c, e); m.box(0, 0.152, 0, 0.26, 0.01, 0.96, DK);
      for (const z of [-0.36, 0.36]) { m.box(0, 0.09, z, 0.24, 0.04, 0.06, GR); for (const sx of [-1, 1]) wheelX(m, sx * 0.13, 0.06, z, 0.06, 0.055, hex('#ff5a2a'), 10); }
    } else if (id === 'inline') {
      m.box(0, 0.2, 0.02, 0.125, 0.24, 0.27, c, e); m.box(0, 0.36, 0.07, 0.13, 0.12, 0.15, c, e); m.box(0, 0.3, 0.075, 0.135, 0.03, 0.155, DK);
      m.box(0, 0.07, 0, 0.045, 0.05, 0.36, GR); m.box(0, 0.055, 0.2, 0.05, 0.07, 0.07, DK);
      for (const z of [-0.135, -0.045, 0.045, 0.135]) wheelX(m, 0, 0.05, z, 0.05, 0.03, hex('#39c8ff'), 8);
    } else if (id === 'quad') {
      m.box(0, 0.16, 0.01, 0.13, 0.2, 0.27, c, e); m.box(0, 0.24, 0.08, 0.12, 0.14, 0.12, c, e); m.box(0, 0.05, 0, 0.14, 0.03, 0.28, GR); m.box(0, 0.035, -0.16, 0.06, 0.06, 0.05, hex('#ff2fb3'));
      for (const z of [-0.09, 0.09]) for (const sx of [-1, 1]) wheelX(m, sx * 0.065, 0.045, z, 0.045, 0.035, cr, 8);
    }
    return m;
  },
  /* ---- repartidor (origen en la cadera) ---- */
  rider(cos) {
    const sh = hex(cos.shirt), pa = hex(cos.pants), he = hex(cos.helmet), se = cos.se ? 1 : 0, hE = cos.he ? 1 : 0, SKIN = hex(cos.skin || '#c98e62'), hc = hex(cos.hc || '#2b2112');
    const t = new MB();
    t.box(0, 0.06, 0, 0.36, 0.16, 0.22, pa); t.box(0, 0.36, 0, 0.4, 0.5, 0.24, sh, se); t.box(0, 0.62, 0, 0.13, 0.08, 0.13, SKIN);
    t.ico(0, 0.82, 0, 0.165, SKIN); for (const x of [-0.055, 0.055]) t.box(x, 0.84, -0.155, 0.04, 0.035, 0.02, DK);
    t.hemi(0, 0.86, 0, 0.19, 10, 3, he, hE); t.box(0, 0.88, -0.18, 0.3, 0.035, 0.1, he, hE);
    const hr = cos.hair || 'corto';
    if (hr === 'afro') t.ico(0, 0.8, 0.03, 0.205, hc, 0, 0.95); else t.box(0, 0.79, 0.12, 0.27, 0.13, 0.08, hc);
    if (hr === 'coleta') { t.box(0, 0.66, 0.2, 0.08, 0.28, 0.07, hc); t.box(0, 0.79, 0.19, 0.09, 0.04, 0.05, hex('#ff2fb3')); }
    if (hr === 'moño') { t.ico(0, 0.97, 0.15, 0.09, hc); t.box(0, 0.7, 0.16, 0.22, 0.1, 0.05, hc); }
    if (hr === 'canoso') { for (const x of [-0.16, 0.16]) t.box(x, 0.82, 0.01, 0.04, 0.1, 0.18, hc); t.box(0, 0.775, -0.165, 0.13, 0.03, 0.03, hc); }
    t.box(0, 0.38, 0.2, 0.36, 0.4, 0.18, hex('#0e6378')); t.box(0, 0.5, 0.295, 0.36, 0.08, 0.01, hex('#e8e4c4'), 0.5);
    for (const x of [-0.13, 0.13]) t.box(x, 0.4, -0.125, 0.04, 0.46, 0.02, DK);
    const th = new MB(); th.box(0, -0.21, 0, 0.155, 0.44, 0.165, pa);
    const sn = new MB(); sn.box(0, -0.2, 0, 0.13, 0.42, 0.14, pa); sn.box(0, -0.44, -0.05, 0.14, 0.09, 0.26, WH); sn.box(0, -0.47, -0.05, 0.145, 0.03, 0.265, DK);
    const ar = new MB(); ar.box(0, -0.13, 0, 0.11, 0.27, 0.12, sh, se); ar.box(0, -0.39, 0, 0.09, 0.26, 0.1, SKIN); ar.box(0, -0.55, 0, 0.1, 0.09, 0.11, SKIN);
    return { t, th, sn, ar };
  },
  ink() {
    const m = new MB(), r = rngOf(31), k = hex('#2b2b33'), k2 = hex('#45454f');
    m.ico(0, 0.72, 0, 0.78, k, 0, 0.85, r, 0.35); for (const sx of [-1, 1]) { m.ico(sx * 0.62, 0.38, 0.05, 0.42, k2, 0, 0.8, r, 0.4); m.box(sx * 0.35, 0.1, -0.2, 0.12, 0.2, 0.12, k); }
    for (const sx of [-1, 1]) { m.box(sx * 0.24, 0.98, -0.66, 0.2, 0.16, 0.06, WH, 1); m.box(sx * 0.24, 0.95, -0.7, 0.08, 0.08, 0.04, hex('#c0191c'), 1); }
    m.box(0, 0.62, -0.7, 0.4, 0.07, 0.05, hex('#c0191c'), 1); return m;
  },
  flowers() {
    const m = new MB(), r = rngOf(17);
    for (let i = 0; i < 9; i++) { const a = r() * 6.28, d = r() * 0.9, x = Math.cos(a) * d, z = Math.sin(a) * d, h = 0.25 + r() * 0.3;
      m.box(x, h / 2, z, 0.03, h, 0.03, PC(0, 0.8)); const pc = i % 3 ? PC(4) : PC(3, 1.15);
      for (let k = 0; k < 4; k++) { const b = k * Math.PI / 2 + r(); m.box(x + Math.cos(b) * 0.06, h, z + Math.sin(b) * 0.06, 0.08, 0.025, 0.08, pc, 1); } m.box(x, h + 0.01, z, 0.05, 0.04, 0.05, PC(1, 1.3), 1); }
    for (let i = 0; i < 4; i++) m.cyl((r() - 0.5) * 1.4, 0, (r() - 0.5) * 1.4, 0.16, 0.3 + r() * 0.2, 5, PC(0, 1.05), 0, 0, false);
    return m;
  },
  wing() { const m = new MB(), W = [1, 1, 1];
    m.quad([0, 0, -0.02], [0.08, 0, -0.17], [0.27, 0, -0.13], [0.24, 0, 0.0], W, 1); m.quad([0, 0, 0.0], [0.2, 0, 0.03], [0.17, 0, 0.16], [0.04, 0, 0.12], W, 1);
    m.tri([0.19, 0.003, -0.13], [0.265, 0.003, -0.125], [0.235, 0.003, -0.05], DK); m.tri([0.12, 0.003, 0.06], [0.16, 0.003, 0.12], [0.1, 0.003, 0.11], DK); return m; },
  bfly() { const m = new MB(); m.box(0, 0, 0.02, 0.035, 0.035, 0.2, DK); m.ico(0, 0.005, -0.1, 0.03, DK); for (const sx of [-1, 1]) m.at(sx * 0.02, 0.02, -0.13, 0, 0.9, sx * 0.4, 1, 1, 1, q => q.box(0, 0.05, 0, 0.008, 0.1, 0.008, DK)); return m; },
  bird() { const m = new MB(), b = hex('#3a3f4a'); m.box(0, 0, 0, 0.12, 0.1, 0.38, b); m.ico(0, 0.05, -0.22, 0.07, b); m.box(0, 0.04, -0.3, 0.03, 0.03, 0.07, hex('#ffb02e')); m.box(0, 0.02, 0.24, 0.16, 0.02, 0.12, b); return m; },
  bwing() { const m = new MB(); m.tri([0, 0, -0.1], [0.5, 0.02, 0.06], [0, 0, 0.12], hex('#2d323c')); return m; },
  rabbit() { const m = new MB(), c = hex('#a08a72'), w = hex('#f4f1e6');
    m.ico(0, 0.22, 0.03, 0.2, c, 0, 0.8); m.ico(0, 0.38, -0.17, 0.13, c); for (const sx of [-1, 1]) { m.at(sx * 0.05, 0.55, -0.15, 0, 0.25, sx * 0.15, 1, 1, 1, q => q.box(0, 0, 0, 0.045, 0.2, 0.05, c)); m.box(sx * 0.07, 0.41, -0.28, 0.025, 0.03, 0.02, DK); m.box(sx * 0.09, 0.06, -0.12, 0.06, 0.08, 0.14, c); }
    m.ico(0, 0.26, 0.23, 0.07, w); m.box(0, 0.36, -0.3, 0.03, 0.025, 0.02, hex('#e8a0a0')); return m; },
  /* ---- escenarios nuevos (modo paleta) ---- */
  palm() { const m = new MB(); let x = 0, y = 0; for (let i = 0; i < 6; i++) { const nx = x + 0.12 * i * 0.25; m.at(nx, y, 0, 0, 0, -0.06 * i, 1, 1, 1, q => q.cyl(0, 0, 0, 0.17 - i * 0.015, 0.75, 6, PC(1, i % 2 ? 0.9 : 1.05))); x = nx + 0.05; y += 0.73; }
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; m.at(x, y, 0, a, 0, 0, 1, 1, 1, q => q.at(0, 0, -0.9, 0, 0.45, 0, 1, 1, 1, f => f.box(0, 0, 0, 0.5, 0.04, 1.9, PC(0, i % 2 ? 0.9 : 1.08)))); }
    for (let i = 0; i < 3; i++) m.ico(x + Math.cos(i * 2) * 0.18, y - 0.18, Math.sin(i * 2) * 0.18, 0.12, PC(1, 0.7)); return m; },
  parasol() { const m = new MB(); m.cyl(0, 0, 0, 0.04, 2.2, 5, PC(3, 1.6)); m.cyl(0, 1.95, 0, 1.25, 0.5, 8, PC(2), 0, 0.05, true); m.cyl(0, 1.97, 0, 0.7, 0.32, 8, PC(4), 0, 0.05, false); m.box(0.9, 0.03, 0.3, 0.8, 0.04, 1.7, PC(4, 1.1)); return m; },
  sea() { const m = new MB(); m.quad([0, 0.03, 7.5], [80, 0.03, 7.5], [80, 0.03, -7.5], [0, 0.03, -7.5], PC(3), 1); for (const x of [2, 7, 15, 26]) m.quad([x, 0.05, 5], [x + 2.5, 0.05, 5], [x + 2.5, 0.05, -5], [x, 0.05, -5], PC(3, 1.3), 1); m.box(-0.2, 0.08, 0, 0.6, 0.16, 15, PC(1, 1.2)); return m; },
  mount() { const m = new MB(); m.cyl(0, -1, 0, 24, 30, 7, PC(0, 0.72), 0, 0, false); m.cyl(0, 19.6, 0, 7.6, 9.4, 7, PC(3, 1.05), 0, 0, false); return m; },
  fence() { const m = new MB(); for (let z = -6; z <= 6; z += 2) m.box(0, 0.55, z, 0.12, 1.1, 0.12, PC(1, 1.1)); for (const y of [0.45, 0.85]) m.box(0, y, 0, 0.06, 0.12, 12.2, PC(1, 1.25)); return m; },
  coffee() { const m = new MB(), r = rngOf(23); for (let i = 0; i < 4; i++) { const z = -4.5 + i * 3; m.ico(0, 0.6, z, 0.75, PC(0, 0.85 + r() * 0.2), 0, 0.9, r, 0.3); for (let k = 0; k < 7; k++) m.box((r() - 0.5) * 1.1, 0.35 + r() * 0.7, z + (r() - 0.5) * 1.1, 0.1, 0.1, 0.1, PC(4), 1); } return m; },
  rail() { const m = new MB(); for (let z = -6; z <= 6; z += 2) m.box(0, 0.55, z, 0.14, 1.1, 0.14, PC(2)); m.box(0, 1.1, 0, 0.2, 0.12, 12.2, PC(2, 1.1)); m.box(0, 0.6, 0, 0.06, 0.08, 12.2, PC(2, 0.9)); m.box(0, -0.6, 0, 0.6, 1.4, 12.2, PC(1, 0.8)); return m; },
  boat() { const m = new MB(); m.box(0, 0.25, 0, 1.6, 0.5, 4.2, PC(2)); m.box(0, 0.52, 0, 1.7, 0.08, 4.3, PC(4)); m.cyl(0, 0.5, 0.3, 0.06, 3.4, 5, PC(1)); m.tri([0, 3.8, 0.28], [0, 0.9, 0.28], [0, 0.9, -1.6], PC(3, 1.2), 1); return m; },
  tunnel() { const m = new MB(); for (const sx of [-1, 1]) { m.box(sx * 5.8, 3.1, 0, 0.5, 6.2, 12.2, PC(2, 0.7)); m.box(sx * 5.53, 1.0, 0, 0.05, 0.12, 12.2, PC(4), 1); m.box(sx * 5.53, 4.6, 0, 0.05, 0.08, 12.2, PC(4, 0.8), 1); }
    m.box(0, 6.35, 0, 12.1, 0.5, 12.2, PC(1, 0.7)); for (const sx of [-1, 1]) m.box(sx * 2.4, 6.08, 0, 0.45, 0.05, 9.5, hex('#fff3c4'), 1); return m; },
  portal() { const m = new MB(); for (const sx of [-1, 1]) m.box(sx * 10, 4.8, 0, 8.4, 9.6, 1.2, PC(2, 0.85)); m.box(0, 8.0, 0, 12, 3.2, 1.2, PC(2, 0.85)); m.box(0, 6.4, -0.62, 12, 0.3, 0.05, PC(4), 1); m.box(0, 9.7, 0, 28.4, 0.3, 1.4, PC(1, 0.8)); return m; },
  pet(k, col) {
    const m = new MB(), c = hex(col), w = hex('#f4f1e6');
    if (k === 'm1') { m.box(0, 0.42, 0, 0.26, 0.24, 0.55, c); m.box(0, 0.58, -0.36, 0.2, 0.2, 0.24, c); m.box(0, 0.53, -0.5, 0.12, 0.09, 0.1, w); m.box(0, 0.56, -0.56, 0.06, 0.05, 0.03, DK);
      for (const sx of [-1, 1]) { m.box(sx * 0.11, 0.66, -0.3, 0.05, 0.16, 0.09, hex('#7a4f2a')); m.box(sx * 0.06, 0.62, -0.48, 0.03, 0.03, 0.02, DK); for (const z of [-0.18, 0.18]) m.box(sx * 0.09, 0.15, z, 0.07, 0.3, 0.07, c); }
      m.box(0, 0.5, -0.12, 0.27, 0.05, 0.06, hex('#c0191c')); }
    else if (k === 'm2') { m.box(0, 0.32, 0, 0.2, 0.2, 0.46, c); m.ico(0, 0.48, -0.3, 0.13, c); for (const sx of [-1, 1]) { m.at(sx * 0.07, 0.6, -0.3, 0, 0, sx * -0.2, 1, 1, 1, q => q.cyl(0, 0, 0, 0.05, 0.11, 4, c, 0, 0)); m.box(sx * 0.05, 0.5, -0.42, 0.035, 0.03, 0.02, hex('#ffd23a'), 1); for (const z of [-0.15, 0.15]) m.box(sx * 0.07, 0.12, z, 0.05, 0.24, 0.05, c); } }
    else { m.ico(0, 0, 0, 0.13, c, 0, 1.3); m.ico(0, 0.17, -0.06, 0.09, c); m.box(0, 0.15, -0.16, 0.04, 0.05, 0.06, hex('#ffc23a')); m.box(0, -0.2, 0.12, 0.07, 0.04, 0.22, hex('#c0191c')); for (const sx of [-1, 1]) m.box(sx * 0.04, 0.2, -0.13, 0.025, 0.025, 0.01, DK); }
    return m;
  },
  petTail(k, col) { const m = new MB(), c = hex(col); if (k === 'm3') { m.tri([0, 0, -0.08], [0.32, 0.02, 0.04], [0, 0, 0.12], c); } else m.at(0, 0, 0, 0, -0.9, 0, 1, 1, 1, q => q.box(0, 0.14, 0, 0.05, 0.28, 0.05, c)); return m; },
  gatepost() { const m = new MB(), y = hex('#ffc23a'); for (const sx of [-1, 1]) { for (let j = 0; j < 6; j++) m.box(sx * 0.98, 0.22 + j * 0.44, 0, 0.16, 0.44, 0.16, j % 2 ? DK : y); } m.box(0, 2.72, 0, 2.2, 0.16, 0.18, DK); m.box(0.9, 2.86, 0, 0.14, 0.12, 0.14, hex('#ff2a2a'), 1); return m; },
  gatebar() { const m = new MB(); for (let i = 0; i < 5; i++) m.box(-0.76 + i * 0.38, 0, 0, 0.38, 0.16, 0.12, i % 2 ? WH : hex('#c0191c'), i % 2 ? 0.3 : 0); return m; },
  bollard() { const m = new MB(); for (const x of [-0.6, 0, 0.6]) { m.cyl(x, 0, 0, 0.11, 0.75, 8, GR); m.cyl(x, 0.5, 0, 0.115, 0.1, 8, WH, 1, 0.115, false); m.cyl(x, 0.75, 0, 0.11, 0.06, 8, DK, 0, 0.06); } return m; },
  umbrella() { const m = new MB(), a = hex('#0e6378'), b = hex('#e8e4c4'); for (let i = 0; i < 8; i++) { const a0 = i / 8 * 6.283, a1 = (i + 1) / 8 * 6.283; m.tri([0, 0.5, 0], [Math.cos(a0) * 1.05, 0, Math.sin(a0) * 1.05], [Math.cos(a1) * 1.05, 0, Math.sin(a1) * 1.05], i % 2 ? a : b, 0.25); }
    m.box(0, -0.45, 0, 0.035, 1.0, 0.035, DK); m.box(0.05, -0.95, 0, 0.12, 0.035, 0.035, DK); m.box(0, 0.55, 0, 0.05, 0.12, 0.05, hex('#ffc23a'), 1); return m; },
  letter(ch) { const m = new MB(), u = ATR.L[ch]; m.quad([-0.36, -0.36, -0.02], [0.36, -0.36, -0.02], [0.36, 0.36, -0.02], [-0.36, 0.36, -0.02], WH, 1, u); m.quad([0.36, -0.36, 0.02], [-0.36, -0.36, 0.02], [-0.36, 0.36, 0.02], [0.36, 0.36, 0.02], WH, 1, u); return m; },
  fountain() { const m = new MB(), st = hex('#c9c2a8'), w = hex('#5fb4e6'); m.cyl(0, 0, 0, 1.6, 0.45, 12, st); m.cyl(0, 0.3, 0, 1.4, 0.18, 12, w, 1, 1.4, true); m.cyl(0, 0, 0, 0.22, 1.3, 8, st); m.cyl(0, 1.3, 0, 0.7, 0.18, 10, st, 0, 0.75); m.cyl(0, 1.42, 0, 0.62, 0.06, 10, w, 1); m.cyl(0, 1.45, 0, 0.06, 1.0, 6, hex('#bfe6ff'), 1, 0.02); return m; },
  playground() { const m = new MB(), r1 = hex('#c0191c'), y = hex('#ffc23a'), b = hex('#39a0ff'), gr = hex('#8a8f96');
    m.box(0, 0.03, 0, 6, 0.06, 4.4, hex('#e9d8b4'));
    for (const z of [-1.6, 0]) for (const x of [-2.4, -1.2]) m.box(x, 1.0, z, 0.1, 2.0, 0.1, gr); m.box(-1.8, 1.4, -0.8, 1.3, 0.12, 1.7, y); m.box(-1.8, 2.05, -0.8, 1.35, 0.1, 1.75, r1);
    m.at(-0.3, 0.7, -0.8, 0, 0, -0.62, 1, 1, 1, q => q.box(0, 0, 0, 2.2, 0.08, 0.7, b)); for (let i = 0; i < 4; i++) m.box(-2.4, 0.3 + i * 0.3, -2.0, 0.5, 0.05, 0.08, gr);
    for (const x of [1.0, 2.6]) { m.at(x, 1.1, 1.0, 0, 0, 0.18, 1, 1, 1, q => q.box(0, 0, 0, 0.1, 2.3, 0.1, r1)); m.at(x, 1.1, 1.0, 0, 0, -0.18, 1, 1, 1, q => q.box(0, 0, 0, 0.1, 2.3, 0.1, r1)); }
    m.box(1.8, 2.2, 1.0, 1.9, 0.1, 0.1, r1); for (const x of [1.45, 2.15]) { m.box(x, 1.4, 1.0, 0.02, 1.6, 0.02, gr); m.box(x, 0.58, 1.0, 0.4, 0.05, 0.25, y); }
    m.box(1.8, 0.12, -1.3, 1.6, 0.24, 1.6, hex('#8a5a32')); m.box(1.8, 0.2, -1.3, 1.4, 0.06, 1.4, hex('#f0d9a0')); return m; },
  pond() { const m = new MB(), w = hex('#4f9fd0'); m.at(0, 0, 0, 0, 0, 0, 1, 1, 1.6, q => { q.cyl(0, 0.02, 0, 3.2, 0.04, 14, w, 0.6); q.cyl(0.6, 0.03, -0.4, 1.4, 0.04, 10, hex('#8fd0f0'), 0.8); });
    const r = rngOf(41); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; m.ico(Math.cos(a) * 3.3, 0.12, Math.sin(a) * 5.2, 0.32 + r() * 0.2, hex('#8a8f96'), 0, 0.6, r, 0.3); }
    for (let i = 0; i < 9; i++) { const a = 3.6 + i * 0.12; m.box(Math.cos(a) * 2.8, 0.45, Math.sin(a) * 4.4, 0.05, 0.9, 0.05, hex('#3f8a4f')); } return m; },
  picnic(v) { const m = new MB(), a = hex(['#c0191c', '#0e6378', '#c49a2c'][v]); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) m.box(-0.75 + i * 0.5, 0.02, -0.75 + j * 0.5, 0.5, 0.02, 0.5, (i + j) % 2 ? a : WH);
    m.box(0.2, 0.2, 0.1, 0.45, 0.3, 0.3, hex('#8a5a32')); m.box(0.2, 0.42, 0.1, 0.45, 0.06, 0.06, hex('#5b4636')); m.cyl(-0.4, 0.04, -0.3, 0.08, 0.28, 6, hex('#2dbd5a')); m.box(0.5, 0.06, -0.5, 0.3, 0.06, 0.2, hex('#ffd23a')); return m; },
  sitter(v) { const m = new MB(), c = hex(['#ff5a2a', '#a42cff', '#2dbd5a', '#39a0ff'][v]), sk = hex(['#c98e62', '#6b4428', '#f0c9a8', '#a8754e'][v]), p = hex('#1b4459');
    m.box(0, 0.28, 0, 0.36, 0.5, 0.24, c); m.ico(0, 0.7, 0, 0.15, sk); m.hemi(0, 0.74, 0.02, 0.16, 8, 2, hex('#2b2112'));
    for (const sx of [-1, 1]) { m.box(sx * 0.1, 0.06, -0.22, 0.14, 0.12, 0.46, p); m.box(sx * 0.1, 0.06, -0.48, 0.14, 0.14, 0.12, WH); m.at(sx * 0.24, 0.45, -0.02, 0, 0.5, 0, 1, 1, 1, q => q.box(0, -0.2, 0, 0.1, 0.4, 0.1, c)); } return m; },
  /* ---- obstáculos con lógica (v2.4): alcantarilla, grieta, resalto, basura, bici parqueada, contenedor, arena y andamio ---- */
  manhole() { const m = new MB(), dk = hex('#0a0a0c'), ir = hex('#55585e'); m.cyl(0, 0.004, 0, 0.46, 0.012, 14, dk); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; m.box(Math.cos(a) * 0.5, 0.025, Math.sin(a) * 0.5, 0.16, 0.05, 0.12, ir); }
    m.at(0.62, 0.07, 0.15, 0.6, 0, 0.32, 1, 1, 1, q => { q.cyl(0, 0, 0, 0.44, 0.05, 14, hex('#3d4048')); for (const z of [-0.2, 0, 0.2]) q.box(0, 0.055, z, 0.7, 0.012, 0.05, hex('#6a6e76')); }); return m; },
  crack() { const m = new MB(), dk = hex('#121214'); let x = -0.76, z = 0; while (x < 0.76) { const nx = Math.min(0.76, x + 0.18 + Math.random() * 0.12), nz = (Math.random() - 0.5) * 0.36; m.at((x + nx) / 2, 0.012, (z + nz) / 2, Math.atan2(-(nz - z), nx - x), 0, 0, 1, 1, 1, q => q.box(0, 0, 0, Math.hypot(nx - x, nz - z) + 0.02, 0.008, 0.07, dk)); if (Math.random() < 0.4) m.box(nx, 0.012, nz + 0.12, 0.05, 0.008, 0.2, dk); x = nx; z = nz; } m.box(0.2, 0.02, -0.15, 0.1, 0.04, 0.08, hex('#4a4d54')); m.box(-0.35, 0.02, 0.18, 0.08, 0.03, 0.06, hex('#4a4d54')); return m; },
  bump() { const m = new MB(); for (let i = 0; i < 6; i++) { const c = i % 2 ? hex('#111') : hex('#ffc23a'); m.box(-0.66 + i * 0.264, 0.05, 0, 0.264, 0.1, 0.5, c, i % 2 ? 0 : 0.3); m.box(-0.66 + i * 0.264, 0.105, 0, 0.26, 0.02, 0.3, c); } return m; },
  trash() { const m = new MB(), r = rngOf(51), b = hex('#1c1d22'), b2 = hex('#2a2c33'); m.ico(-0.2, 0.3, 0.05, 0.32, b, 0, 0.95, r, 0.3); m.ico(0.25, 0.26, -0.1, 0.28, b2, 0, 0.95, r, 0.3); m.ico(0.05, 0.22, 0.28, 0.24, hex('#2f6e3c'), 0, 0.9, r, 0.3);
    for (const [x, y, z] of [[-0.2, 0.64, 0.05], [0.25, 0.55, -0.1]]) m.box(x, y, z, 0.08, 0.12, 0.08, b); m.box(0.42, 0.12, 0.3, 0.3, 0.24, 0.26, hex('#c9935e')); m.box(0.42, 0.25, 0.3, 0.32, 0.02, 0.06, hex('#d8c070')); return m; },
  pbike() { const m = MOD.veh('bike', '#2f9fd1', 0); m.box(0.1, 0.18, 0.1, 0.02, 0.36, 0.02, hex('#8a8f96')); return m; },
  container() { const m = new MB(), g1 = hex('#2f6e3c'), g2 = hex('#245a30'); m.box(0, 0.62, 0, 1.18, 1.0, 1.15, g1); m.box(0, 1.15, 0.03, 1.22, 0.08, 1.22, g2); m.box(0, 1.2, -0.62, 1.1, 0.06, 0.08, hex('#111'));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) wheelX(m, sx * 0.48, 0.08, sz * 0.45, 0.08, 0.06, hex('#111'), 8);
    m.tri([-0.15, 0.55, 0.578], [0.15, 0.55, 0.578], [0, 0.82, 0.578], hex('#f4f1e6'), 0.5); m.box(0, 0.3, 0.58, 1.0, 0.06, 0.01, hex('#f4f1e6')); return m; },
  sand() { const m = new MB(), r = rngOf(61), sd = hex('#e8cf8f'); m.at(0, 0, 0, 0, 0, 0, 1, 1, 2.0, q => q.cyl(0, 0.004, 0, 0.82, 0.016, 12, sd)); for (let i = 0; i < 8; i++) m.ico((r() - 0.5) * 1.2, 0.02, (r() - 0.5) * 2.6, 0.18 + r() * 0.16, hex('#d9bd78'), 0, 0.28, r, 0.4); m.box(0.3, 0.02, 0.5, 0.12, 0.015, 0.22, hex('#ff5a2a')); return m; },
  scaff() { const m = new MB(), tb = hex('#9aa0aa'), y = hex('#ffc23a'), net = hex('#ff6a1a');
    for (const sx of [-1, 1]) { for (const sz of [-0.42, 0.42]) m.box(sx * 0.86, 1.5, sz, 0.07, 3.0, 0.07, tb); m.box(sx * 0.86, 2.4, 0, 0.06, 0.06, 0.92, tb); m.box(sx * 0.86, 0.12, 0, 0.12, 0.06, 1.0, hex('#5b4636')); m.quad([sx * 0.9, 1.45, 0.42], [sx * 0.9, 1.45, -0.42], [sx * 0.9, 2.85, -0.42], [sx * 0.9, 2.85, 0.42], net, 0.15); }
    m.box(0, 1.2, 0.42, 1.8, 0.07, 0.07, tb); m.box(0, 1.2, -0.42, 1.8, 0.07, 0.07, tb); for (const z of [-0.3, 0, 0.3]) m.box(0, 2.88, z, 1.8, 0.05, 0.26, hex('#b5824a'));
    for (let i = 0; i < 7; i++) m.box(-0.78 + i * 0.26, 1.08, 0.44, 0.26, 0.11, 0.015, i % 2 ? hex('#111') : y, i % 2 ? 0 : 0.35);
    m.box(0, 1.75, 0.45, 1.6, 0.42, 0.02, hex('#0e6378')); m.quad([-0.7, 1.58, 0.462], [0.7, 1.58, 0.462], [0.7, 1.92, 0.462], [-0.7, 1.92, 0.462], WH, 0.4, ATR.sign[7]); return m; },
  medseg() { const m = new MB(), g1 = hex('#3f8a4f'), g2 = hex('#2f6e3c'); m.box(0, 0.12, 0, 0.42, 0.24, 4, hex('#c9c2a8')); m.box(0, 0.12, 0, 0.44, 0.04, 4.01, hex('#ffc23a'), 0.4); m.box(0, 0.5, 0, 0.32, 0.55, 3.6, g1); for (const z of [-1.2, 0, 1.2]) m.ico(0, 0.82, z, 0.24, g2, 0, 0.8); return m; },
  forkSign() { const m = new MB(); for (const x of [-1.9, 1.9]) m.box(x, 1.6, 0, 0.14, 3.2, 0.14, DK); m.box(0, 3.25, 0.02, 4.0, 1.05, 0.1, DK); m.quad([-1.95, 2.75, 0.08], [1.95, 2.75, 0.08], [1.95, 3.73, 0.08], [-1.95, 3.73, 0.08], WH, 0.6, ATR.fork); return m; },
  hedgeseg() { const m = new MB(), pl = hex('#b8643c'), g1 = hex('#3f8a4f'), g2 = hex('#2f6e3c');
    m.box(0, 0.2, 0, 0.66, 0.4, 4, pl); m.box(0, 0.41, 0, 0.72, 0.05, 4.02, hex('#d9d2b0'));
    m.box(0, 0.66, 0, 0.56, 0.46, 3.9, g1); for (const z of [-1.45, -0.5, 0.45, 1.4]) m.ico(0, 0.92, z, 0.3, g2, 0, 0.7);
    for (const [x, z, c] of [[0.24, -1.0, '#ff5a8a'], [-0.24, 0.1, '#ffd23a'], [0.24, 1.1, '#ffffff']]) m.ico(x, 0.98, z, 0.07, hex(c), 0.3); return m; },
  bedseg() { const m = new MB(), cu = hex('#c9c2a8'), gr = hex('#5aa04a');
    m.box(0, 0.08, 0, 1.56, 0.16, 4, cu); m.box(0, 0.175, 0, 1.4, 0.04, 3.9, gr);
    for (const [x, z, c] of [[-0.4, -1.2, '#ffd23a'], [0.3, -0.3, '#ff5a8a'], [-0.2, 0.8, '#ffffff'], [0.45, 1.5, '#ffd23a']]) m.ico(x, 0.25, z, 0.08, hex(c), 0.3);
    m.ico(0.1, 0.3, 0.3, 0.24, hex('#3f8a4f'), 0, 0.75); m.ico(-0.35, 0.28, -0.6, 0.18, hex('#2f6e3c'), 0, 0.7); return m; },
  signpost(n) { const m = new MB(), wd = hex('#b5824a'), wk = hex('#6b4a2a');
    m.box(0, 2.1, 0, 0.17, 4.2, 0.17, wk); m.box(0, 0.08, 0, 0.55, 0.16, 0.55, GR); m.box(0, 4.22, 0, 0.26, 0.08, 0.26, wk);
    m.box(-0.8, 2.7, 0, 1.45, 0.56, 0.1, wd); m.at(-1.52, 2.7, 0, 0, 0, Math.PI / 4, 1, 1, 1, q => q.box(0, 0, 0, 0.4, 0.4, 0.1, wd));
    m.box(-0.8, 2.7, 0, 1.47, 0.04, 0.11, wk);
    for (let i = 0; i < n; i++) for (const sz of [-1, 1]) m.box(-0.45 - i * 0.32, 2.7, sz * 0.056, 0.12, 0.4, 0.01, WH, 0.4);
    for (const sz of [-1, 1]) m.tri([-1.2, 2.88, sz * 0.056], [-1.2, 2.52, sz * 0.056], [-1.42, 2.7, sz * 0.056], WH, 0.4);
    return m; },
  chev() { const m = new MB(); m.quad([-0.45, 0.02, 0.85], [0.45, 0.02, 0.85], [0.45, 0.02, -0.85], [-0.45, 0.02, -0.85], [1, 1, 1], 1, ATR.arrow); return m; },
  /* ---- entregas: buzón, casitas, puerta, vecino, revista ---- */
  buzon() { const m = new MB(), t = hex('#0e6378'); m.box(0, 0.55, 0, 0.09, 1.1, 0.09, GR); m.box(0, 1.24, 0, 0.36, 0.34, 0.52, t); m.at(0, 1.4, 0, 0, Math.PI / 2, 0, 1, 1, 1, q => q.cyl(0, -0.26, 0, 0.18, 0.52, 8, t, 0, 0.18, false));
    m.box(-0.182, 1.26, 0, 0.01, 0.06, 0.3, DK); m.quad([0.182, 1.1, 0.2], [0.182, 1.1, -0.2], [0.182, 1.38, -0.2], [0.182, 1.38, 0.2], WH, 0.3, ATR.cover); m.box(0, 1.08, 0, 0.38, 0.05, 0.54, hex('#e8e4c4')); return m; },
  flag() { const m = new MB(); m.box(0, 0.16, 0, 0.025, 0.32, 0.025, GR); m.box(0, 0.3, -0.09, 0.02, 0.12, 0.18, hex('#c0191c'), 1); return m; },
  house(v) {
    const m = new MB(), wall = hex(['#e8e4c4', '#fbe7a9', '#9fd3c7'][v]), roof = hex(['#c0191c', '#1b4459', '#6b3f16'][v]), hx = 2.75;
    m.box(hx, 1.05, 0, 2.6, 2.1, 2.6, wall); m.box(hx, 0.08, 0, 2.8, 0.16, 2.8, hex('#8a8f96'));
    const Y0 = 2.1, Y1 = 3.25; for (const s of [-1, 1]) m.quad([hx - 1.5, Y0, s * 1.5], [hx + 1.5, Y0, s * 1.5], [hx + 1.5, Y1, 0], [hx - 1.5, Y1, 0], roof);
    for (const xx of [hx - 1.3, hx + 1.3]) m.tri([xx, Y0, -1.3], [xx, Y0, 1.3], [xx, Y1, 0], wall);
    m.box(hx + 0.4, 2.9, 0.6, 0.35, 0.8, 0.35, hex('#5b4636'));
    for (const z of [-0.75]) { m.box(hx - 1.31, 1.25, z, 0.04, 0.6, 0.6, hex('#ffd36b'), 1); m.box(hx - 1.33, 1.25, z, 0.04, 0.66, 0.05, DK); m.box(hx - 1.33, 1.25, z, 0.04, 0.05, 0.66, DK); }
    m.box(hx - 1.32, 0.72, 0.4, 0.03, 1.42, 0.78, DK); m.box(hx - 1.5, 0.08, 0.4, 0.4, 0.06, 0.9, hex('#b9bcc2'));
    for (const z of [-1.2, 1.2]) m.ico(hx - 1.5, 0.3, z, 0.32, hex('#3f8a4f'), 0, 0.8); return m;
  },
  door() { const m = new MB(); m.box(0, 0.66, -0.35, 0.05, 1.3, 0.7, hex('#8a5a32')); m.box(-0.04, 0.66, -0.62, 0.04, 0.06, 0.06, hex('#ffc23a'), 1); return m; },
  resi(v) { const m = new MB(), c = hex(['#ff5a2a', '#2dffb3', '#a42cff'][v]); m.box(0, 0.45, 0, 0.32, 0.5, 0.2, hex('#1b4459')); m.box(0, 0.95, 0, 0.36, 0.5, 0.22, c); m.ico(0, 1.38, 0, 0.16, hex('#a8754e')); m.hemi(0, 1.42, 0.02, 0.17, 8, 2, hex('#2b2112'));
    m.box(-0.08, 1.4, -0.15, 0.04, 0.035, 0.02, DK); m.box(0.08, 1.4, -0.15, 0.04, 0.035, 0.02, DK); m.box(0, 1.31, -0.155, 0.1, 0.025, 0.02, hex('#c0191c')); m.at(-0.22, 1.18, 0, 0, 0, -0.2, 1, 1, 1, q => q.box(0, -0.24, 0, 0.09, 0.48, 0.1, c)); return m; },
  rarm() { const m = new MB(); m.box(0, 0.22, 0, 0.09, 0.44, 0.1, hex('#a8754e')); m.box(0, 0.48, 0, 0.11, 0.11, 0.06, hex('#a8754e')); return m; },
  mag() { const m = new MB(); m.at(0, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, q => { q.cyl(0, -0.16, 0, 0.06, 0.32, 8, hex('#e8e4c4')); q.cyl(0, -0.05, 0, 0.065, 0.1, 8, hex('#0e6378'), 0.4); }); return m; },
  npcRun(col, sk) {
    const m = new MB(), c = hex(['#ff5a2a', '#2dffb3', '#a42cff', '#ffc23a'][col]), s = hex(['#a8754e', '#6b4428', '#f0c9a8', '#c98e62'][col]), sh = hex('#1b4459');
    m.box(0, 0.93, 0, 0.34, 0.16, 0.22, sh);
    m.at(0, 1.0, 0, 0, sk ? -0.7 : -0.15, 0, 1, 1, 1, q => { q.box(0, 0.28, 0, 0.38, 0.52, 0.24, c); q.ico(0, 0.7, 0, 0.15, s); q.hemi(0, 0.74, 0, 0.165, 8, 2, sk ? c : hex('#2b2112')); q.box(0, 0.74, -0.08, 0.32, 0.04, 0.2, sk ? DK : c);
      for (const sx of [-1, 1]) q.at(sx * 0.24, 0.5, 0, 0, sk ? 0.4 : 0.9 * sx, 0, 1, 1, 1, a => a.box(0, -0.22, 0, 0.1, 0.46, 0.11, s)); });
    return m;
  },
  npcLeg(sk) { const m = new MB(); m.box(0, -0.44, 0, 0.14, 0.88, 0.15, hex('#1b4459')); m.box(0, -0.9, -0.05, 0.14, 0.09, 0.25, WH);
    if (sk) { m.box(0, -0.99, 0, 0.04, 0.05, 0.32, GR); for (const z of [-0.12, -0.04, 0.04, 0.12]) wheelX(m, 0, -1.0, z, 0.04, 0.03, hex('#39c8ff'), 6); } return m; },
  kite(v) { const m = new MB(), a = hex(['#ff2fb3', '#ffc23a', '#39c8ff'][v]), b = hex(['#ffc23a', '#c0191c', '#2dffb3'][v]);
    m.tri([0, 1.1, 0], [0.75, 0, 0], [0, 0, 0], a, 0.4); m.tri([0, 1.1, 0], [-0.75, 0, 0], [0, 0, 0], b, 0.4); m.tri([0, -1.4, 0], [0.75, 0, 0], [0, 0, 0], b, 0.4); m.tri([0, -1.4, 0], [-0.75, 0, 0], [0, 0, 0], a, 0.4);
    for (let i = 0; i < 6; i++) m.at(Math.sin(i) * 0.15, -1.6 - i * 0.45, 0, 0, 0, 0.6 * (i % 2 ? 1 : -1), 1, 1, 1, q => q.box(0, 0, 0, 0.26, 0.08, 0.02, i % 2 ? a : b, 0.4)); return m; },
  balloon(v) { const m = new MB(), a = hex(['#c0191c', '#0e6378'][v]), b = hex(['#ffc23a', '#e8e4c4'][v]);
    m.ico(0, 6, 0, 3.4, a, 0.2, 1.15); m.cyl(0, 3.4, 0, 2.6, 1.0, 10, b, 0.2, 3.1, false); m.cyl(0, 2.2, 0, 1.2, 1.2, 8, b, 0.2, 2.6, false);
    for (const sx of [-0.4, 0.4]) for (const sz of [-0.4, 0.4]) m.box(sx, 1.5, sz, 0.03, 1.4, 0.03, DK); m.box(0, 0.4, 0, 1.0, 0.7, 1.0, hex('#8a5a32')); return m; },
  npc(col) {
    const m = new MB(), c = hex(['#ff5a2a', '#2dffb3', '#a42cff', '#ffc23a'][col]), w = hex('#2a2a30'), sk = hex('#a8754e');
    for (const z of [0.52, -0.52]) wheelX(m, 0, 0.34, z, 0.34, 0.04, w, 12);
    bar(m, 0, 0.36, -0.02, 0.95, -0.42, 0.06, GR); bar(m, 0, 0.9, 0.12, 0.95, -0.42, 0.055, GR); bar(m, 0, 0.36, -0.02, 0.92, 0.12, 0.055, GR); bar(m, 0, 0.95, -0.42, 0.34, -0.52, 0.045, GR);
    m.box(0, 1.0, 0.1, 0.34, 0.16, 0.22, DK); m.at(0, 1.08, 0.05, 0, -0.5, 0, 1, 1, 1, q => { q.box(0, 0.3, 0, 0.4, 0.55, 0.26, c); q.ico(0, 0.75, 0, 0.16, sk); q.hemi(0, 0.79, 0, 0.18, 8, 2, c, 0); });
    for (const sx of [-1, 1]) { bar(m, sx * 0.1, 1.0, 0.1, 0.62, -0.18, 0.13, DK); bar(m, sx * 0.1, 0.62, -0.18, 0.25, -0.05, 0.11, DK); bar(m, sx * 0.22, 1.42, -0.2, 1.06, -0.46, 0.09, c); }
    return m;
  }
};

/* ---- RunRunZero/src/models2.js ---- */
/* ===== MODELOS v2 · vehículos, tráfico, tiendas y objetos de reparto ===== */
const M2C = { w: hex('#2a2a30'), cr: hex('#e8e4c4'), teal: hex('#0e6378'), glass: hex('#bfe6ff'), lite: hex('#fff6c8'), red: hex('#ff2a2a'), blue: hex('#2a6bff'), wood: hex('#a0703c'), wood2: hex('#7a5230') };

/* auto compacto (z −1.6..1.6, ancho 1.3, alto 1.25 con letrero) */
function m2Car(m, c, e, sign) {
  const { w, glass, lite, red } = M2C;
  m.box(0, 0.47, 0, 1.3, 0.5, 3.2, c, e); m.box(0, 0.24, 0, 1.24, 0.08, 3.0, DK);
  m.box(0, 0.91, 0.15, 1.2, 0.42, 1.8, c, e); m.box(0, 1.125, 0.15, 1.1, 0.03, 1.6, c, e);
  m.box(0, 0.93, -0.756, 1.08, 0.3, 0.02, glass, 0.3); m.box(0, 0.93, 1.056, 1.08, 0.3, 0.02, glass, 0.3);
  for (const sx of [-1, 1]) {
    m.box(sx * 0.605, 0.93, 0.15, 0.02, 0.3, 1.6, glass, 0.3); m.box(sx * 0.606, 0.93, 0.15, 0.02, 0.32, 0.05, c, e);
    for (const z of [-1.05, 1.05]) { wheelX(m, sx * 0.56, 0.28, z, 0.28, 0.16, w, 10); wheelX(m, sx * 0.56, 0.28, z, 0.12, 0.18, GR, 6); }
    m.box(sx * 0.42, 0.56, -1.605, 0.26, 0.12, 0.02, lite, 1); m.box(sx * 0.45, 0.6, 1.605, 0.22, 0.1, 0.02, red, 1);
  }
  for (const z of [-1.57, 1.57]) m.box(0, 0.3, z, 1.32, 0.1, 0.06, DK);
  if (sign) { m.box(0, 1.15, 0.15, 0.06, 0.05, 0.2, DK); m.box(0, 1.2, 0.15, 0.62, 0.1, 0.22, M2C.cr, 0.3); }
}

/* moto (ruedas r 0.3 en z ±0.62) */
function m2Moto(m, c, e, body2) {
  const { w, lite, red } = M2C;
  for (const z of [-0.62, 0.62]) { wheelX(m, 0, 0.3, z, 0.3, 0.12, w, 12); wheelX(m, 0, 0.3, z, 0.12, 0.14, GR, 6); }
  bar(m, 0, 0.3, -0.62, 1.0, -0.4, 0.07, GR); m.box(0, 0.62, -0.58, 0.16, 0.04, 0.36, c, e);
  m.box(0, 0.42, 0, 0.3, 0.3, 0.46, GR); m.box(0, 0.4, 0, 0.32, 0.16, 0.3, DK);
  bar(m, 0, 0.55, 0.22, 0.85, -0.4, 0.07, body2 || DK);
  m.box(0, 0.78, -0.18, 0.32, 0.22, 0.42, c, e); m.box(0, 0.78, 0.22, 0.28, 0.08, 0.5, DK);
  m.box(0, 0.62, 0.32, 0.3, 0.2, 0.4, body2 || c, body2 ? 0 : e); m.box(0, 0.66, 0.7, 0.16, 0.04, 0.34, body2 || c, body2 ? 0 : e);
  m.box(0, 1.02, -0.4, 0.66, 0.04, 0.04, w); m.box(0, 0.9, -0.47, 0.18, 0.18, 0.1, c, e); m.box(0, 0.9, -0.525, 0.13, 0.11, 0.02, lite, 1);
  m.box(0.18, 0.3, 0.38, 0.08, 0.08, 0.6, GR); m.box(0.18, 0.32, 0.7, 0.09, 0.09, 0.06, DK);
  for (const sx of [-1, 1]) m.box(sx * 0.2, 0.3, 0.02, 0.12, 0.03, 0.06, DK);
  m.box(0, 0.7, 0.88, 0.14, 0.06, 0.04, red, 1);
}

/* conductor de moto fusionado: caderas en el asiento, adelante −z */
function m2Rider(m, jacket, pants, helmet, skin) {
  for (const sx of [-1, 1]) { bar(m, sx * 0.12, 0.86, 0.26, 0.66, -0.04, 0.13, pants); bar(m, sx * 0.15, 0.66, -0.04, 0.32, 0.04, 0.11, pants); m.box(sx * 0.15, 0.3, -0.02, 0.12, 0.08, 0.2, DK); }
  m.box(0, 0.88, 0.25, 0.34, 0.14, 0.24, pants);
  m.at(0, 0.88, 0.25, 0, -0.45, 0, 1, 1, 1, q => {
    q.box(0, 0.27, 0, 0.4, 0.5, 0.25, jacket); q.box(0, 0.55, 0, 0.12, 0.08, 0.12, skin); q.ico(0, 0.7, 0, 0.15, skin);
    q.hemi(0, 0.71, 0, 0.18, 8, 2, helmet); q.box(0, 0.68, -0.165, 0.28, 0.1, 0.04, DK);
  });
  for (const sx of [-1, 1]) bar(m, sx * 0.25, 1.3, 0.03, 1.03, -0.38, 0.09, jacket);
}

Object.assign(MOD, {
  veh2(id, paint, pe) {
    const m = new MB(), c = hex(paint), e = pe ? 1 : 0, { w, cr, teal, lite, red } = M2C;
    if (id === 'uni') {
      wheelX(m, 0, 0.33, 0, 0.33, 0.06, w, 14); wheelX(m, 0, 0.33, 0, 0.08, 0.1, GR, 8);
      for (const sx of [-1, 1]) {
        bar(m, sx * 0.065, 0.33, 0, 0.7, 0, 0.035, c, e);
        m.box(sx * 0.1, 0.33, sx * 0.07, 0.03, 0.03, 0.18, GR); m.box(sx * 0.15, 0.33, sx * 0.15, 0.09, 0.03, 0.07, DK);
      }
      m.box(0, 0.71, 0, 0.17, 0.05, 0.08, c, e); bar(m, 0, 0.72, 0, 0.95, 0, 0.04, GR);
      m.box(0, 0.98, 0, 0.14, 0.05, 0.28, DK); m.box(0, 0.99, -0.13, 0.1, 0.06, 0.04, c, e);
    } else if (id === 'ebike') {
      for (const z of [0.52, -0.52]) { wheelX(m, 0, 0.34, z, 0.34, 0.04, w, 14); wheelX(m, 0, 0.34, z, 0.08, 0.07, GR, 8); }
      bar(m, 0, 0.36, -0.02, 0.95, -0.42, 0.06, c, e); bar(m, 0, 0.9, 0.12, 0.95, -0.42, 0.055, c, e); bar(m, 0, 0.36, -0.02, 0.92, 0.12, 0.055, c, e);
      bar(m, 0, 0.36, -0.02, 0.34, 0.52, 0.04, c, e); bar(m, 0, 0.9, 0.12, 0.34, 0.52, 0.04, c, e); bar(m, 0, 0.95, -0.42, 0.34, -0.52, 0.045, c, e);
      m.box(0, 0.97, 0.14, 0.14, 0.05, 0.26, DK); m.box(0, 1.05, -0.46, 0.56, 0.04, 0.04, w); bar(m, 0, 0.95, -0.42, 1.05, -0.46, 0.04, w);
      m.box(0, 0.36, -0.02, 0.32, 0.03, 0.06, DK);
      bar(m, 0, 0.48, -0.1, 0.8, -0.32, 0.11, DK); for (const sx of [-1, 1]) m.box(sx * 0.057, 0.66, -0.22, 0.01, 0.04, 0.05, hex('#2dff6a'), 1);
      m.box(0, 0.8, 0.46, 0.2, 0.03, 0.4, GR); for (const sx of [-1, 1]) { bar(m, sx * 0.09, 0.36, 0.56, 0.8, 0.6, 0.025, GR); m.box(sx * 0.1, 0.83, 0.46, 0.02, 0.05, 0.4, GR); }
      bar(m, 0, 0.92, 0.12, 0.8, 0.3, 0.025, GR);
      m.box(0, 0.92, -0.5, 0.12, 0.09, 0.09, DK); m.box(0, 0.92, -0.55, 0.09, 0.06, 0.02, lite, 1);
    } else if (id === 'moped') {
      for (const z of [-0.5, 0.5]) { wheelX(m, 0, 0.2, z, 0.2, 0.1, w, 12); wheelX(m, 0, 0.2, z, 0.08, 0.12, GR, 6); }
      m.box(0, 0.22, -0.02, 0.32, 0.06, 0.64, c, e); m.box(0, 0.255, -0.02, 0.28, 0.01, 0.58, DK);
      m.box(0, 0.45, 0.32, 0.34, 0.38, 0.42, c, e); m.box(0, 0.42, 0.55, 0.14, 0.04, 0.2, c, e);
      m.box(0, 0.69, 0.3, 0.3, 0.08, 0.42, DK);
      m.at(0, 0.55, -0.36, 0, -0.22, 0, 1, 1, 1, q => q.box(0, 0, 0, 0.38, 0.62, 0.06, c, e));
      bar(m, 0, 0.2, -0.5, 1.0, -0.42, 0.05, GR); m.box(0, 0.42, -0.5, 0.12, 0.03, 0.3, c, e);
      m.box(0, 1.0, -0.42, 0.6, 0.04, 0.04, w); m.box(0, 0.9, -0.44, 0.18, 0.12, 0.08, c, e); m.box(0, 0.9, -0.485, 0.13, 0.08, 0.02, lite, 1);
      m.box(0, 0.58, 0.535, 0.16, 0.06, 0.02, red, 1);
    } else if (id === 'moto') {
      m2Moto(m, c, e);
      m.box(0, 0.79, 0.62, 0.12, 0.04, 0.3, GR);
      m.box(0, 0.95, 0.62, 0.44, 0.4, 0.42, teal); m.box(0, 1.0, 0.62, 0.45, 0.07, 0.43, cr); m.box(0, 1.16, 0.62, 0.46, 0.03, 0.44, teal);
    } else if (id === 'auto') {
      m2Car(m, c, e, true);
    } else if (id === 'camion') {
      const { glass } = M2C;
      m.box(0, 0.3, 0.05, 1.2, 0.16, 4.2, DK);
      m.box(0, 0.95, -1.6, 1.4, 1.3, 1.2, c, e); m.box(0, 1.62, -1.6, 1.3, 0.04, 1.1, c, e);
      m.box(0, 1.3, -2.205, 1.2, 0.45, 0.02, glass, 0.3); for (const sx of [-1, 1]) m.box(sx * 0.705, 1.3, -1.75, 0.02, 0.42, 0.7, glass, 0.3);
      m.box(0, 1.15, 0.625, 1.4, 1.7, 3.15, teal); m.box(0, 1.25, 0.625, 1.41, 0.16, 3.16, cr); m.box(0, 1.99, 0.625, 1.42, 0.02, 3.17, cr);
      for (const sx of [-1, 1]) {
        for (const z of [-1.5, 1.35]) { wheelX(m, sx * 0.58, 0.32, z, 0.32, 0.22, w, 10); wheelX(m, sx * 0.58, 0.32, z, 0.13, 0.24, GR, 6); }
        m.box(sx * 0.5, 0.55, -2.205, 0.26, 0.14, 0.02, lite, 1); m.box(sx * 0.55, 0.5, 2.205, 0.2, 0.14, 0.02, red, 1);
      }
      m.box(0, 0.32, -2.15, 1.42, 0.14, 0.1, DK); m.box(0, 0.3, 2.15, 1.42, 0.12, 0.1, DK);
      m.box(0, 1.15, 2.202, 0.02, 1.5, 0.01, DK);
    } else if (id === 'jetpack') {
      m.box(0, 0.4, 0.15, 0.32, 0.42, 0.05, GR);
      for (const sx of [-1, 1]) {
        m.cyl(sx * 0.11, 0.15, 0.24, 0.09, 0.5, 8, c, e); m.hemi(sx * 0.11, 0.65, 0.24, 0.09, 8, 2, GR);
        m.cyl(sx * 0.11, 0.03, 0.24, 0.075, 0.12, 8, DK, 0, 0.05); m.box(sx * 0.11, 0.4, 0.24, 0.19, 0.04, 0.19, GR);
        m.box(sx * 0.15, 0.6, 0, 0.06, 0.03, 0.27, DK); m.box(sx * 0.15, 0.4, -0.125, 0.06, 0.4, 0.02, DK);
      }
      m.box(0, 0.3, -0.13, 0.36, 0.05, 0.02, DK);
    }
    return m;
  },
  carNpc(col) { const m = new MB(); m2Car(m, hex(['#c0191c', '#1d4e79', '#e8c25a', '#2f8a3f'][col]), 0, false); return m; },
  motoNpc(col) {
    const m = new MB(), c = hex(['#ff5a2a', '#1d4e79', '#a42cff', '#2f8a3f'][col]), j = hex(['#1b4459', '#c0191c', '#3a3f4a', '#c49a2c'][col]);
    m2Moto(m, c, 0); m2Rider(m, j, hex('#2b2b33'), c, hex(['#a8754e', '#6b4428', '#f0c9a8', '#c98e62'][col])); return m;
  },
  policia() {
    const m = new MB(), wt = hex('#f4f4f4'), bl = hex('#1d4e9e'), uni = hex('#1b2a4a');
    m2Moto(m, wt, 0, bl);
    for (const sx of [-1, 1]) m.box(sx * 0.26, 0.62, 0.55, 0.16, 0.3, 0.4, wt);
    for (const sx of [-1, 1]) m.box(sx * 0.345, 0.62, 0.55, 0.01, 0.08, 0.4, bl);
    m.box(0, 0.73, -0.18, 0.33, 0.06, 0.43, bl);
    m.box(0, 1.1, 0.78, 0.04, 0.6, 0.04, GR); m.box(0, 1.4, 0.78, 0.46, 0.04, 0.08, DK);
    m.box(-0.12, 1.46, 0.78, 0.2, 0.09, 0.09, hex('#ff2020'), 1); m.box(0.12, 1.46, 0.78, 0.2, 0.09, 0.09, hex('#2050ff'), 1);
    m2Rider(m, uni, uni, wt, SKIN); m.box(0, 1.15, 0.13, 0.3, 0.06, 0.02, hex('#d6ff3a'), 0.6); return m;
  },
  ducks() {
    const m = new MB(), wt = hex('#f4f1e6'), yl = hex('#ffd23a'), or = hex('#ff8a1a');
    const duck = (x, s, col) => {
      m.at(x, 0, 0, 0, 0, 0, s, s, s, q => {
        q.at(0, 0.14, 0, 0, 0, 0, 1.4, 0.8, 1, b => b.ico(0, 0, 0, 0.17, col));
        q.tri([-0.24, 0.12, -0.06], [-0.24, 0.12, 0.06], [-0.34, 0.24, 0], col);
        q.ico(0.2, 0.27, 0, 0.075, col); q.box(0.3, 0.26, 0, 0.09, 0.03, 0.06, or);
        for (const sz of [-1, 1]) { q.box(0.24, 0.29, sz * 0.055, 0.02, 0.02, 0.02, DK); q.box(0.02, 0.02, sz * 0.06, 0.08, 0.04, 0.04, or); }
      });
    };
    duck(0.5, 1, wt); duck(-0.15, 0.55, yl); duck(-0.7, 0.55, yl); return m;
  },
  shop(v) {
    const m = new MB(), wall = hex(['#d6e3ea', '#e9d3a8', '#fbe7a9'][v]), trim = hex(['#1d4e79', '#6b3f16', '#c0191c'][v]);
    const aw = [hex(['#1d4e79', '#2f8a3f', '#c0191c'][v]), WH], glass = M2C.glass;
    m.box(2.5, 1.8, 0, 5, 3.6, 6, wall); m.box(2.45, 3.62, 0, 5.1, 0.16, 6.1, trim); m.box(-0.01, 0.15, 0, 0.04, 0.3, 6, trim);
    m.box(-0.03, 1.05, 1.8, 0.06, 2.1, 1.0, hex('#5b4636')); m.box(-0.07, 1.05, 1.45, 0.03, 0.06, 0.06, hex('#ffc23a'), 1);
    m.box(-0.03, 1.2, -0.9, 0.06, 1.4, 2.6, glass, 0.3); m.box(-0.05, 0.48, -0.9, 0.06, 0.06, 2.7, trim); m.box(-0.05, 1.92, -0.9, 0.06, 0.06, 2.7, trim); m.box(-0.05, 1.2, -0.9, 0.05, 1.4, 0.06, trim);
    m.box(-0.03, 2.9, 0, 0.06, 1.0, 4.6, DK);
    m.quad([-0.065, 2.45, -2.2], [-0.065, 2.45, 2.2], [-0.065, 3.35, 2.2], [-0.065, 3.35, -2.2], WH, 0.6, ATR.sign[v]);
    for (let i = 0; i < 8; i++) { const z0 = -3 + i * 0.75, z1 = z0 + 0.75, col = aw[i & 1];
      m.quad([0, 2.35, z0], [0, 2.35, z1], [-1.0, 1.95, z1], [-1.0, 1.95, z0], col); m.quad([-1.0, 1.95, z0], [-1.0, 1.95, z1], [-1.0, 1.75, z1], [-1.0, 1.75, z0], col); }
    if (v === 0) {
      const lad = hex('#c0c4ca');
      for (const x of [-0.85, -0.45]) { bar(m, x, 0, -2.75, 1.6, -2.4, 0.05, lad); bar(m, x, 0, -2.05, 1.6, -2.4, 0.05, lad); }
      for (let k = 1; k < 5; k++) { const y = k * 0.32, dz = 0.35 * (1 - y / 1.6); m.box(-0.65, y, -2.4 - dz, 0.42, 0.03, 0.05, lad); }
      const bc = [hex('#c0191c'), hex('#1d4e79'), hex('#ffc23a'), hex('#2f8a3f')];
      [[-0.75, 0, -1.5], [-0.4, 0, -1.55], [-0.6, 0, -1.15], [-0.58, 0.3, -1.38]].forEach((p, i) => { m.cyl(p[0], p[1], p[2], 0.14, 0.28, 8, bc[i]); m.cyl(p[0], p[1] + 0.28, p[2], 0.145, 0.02, 8, GR); });
      for (let r = 0; r < 2; r++) for (let i = 0; i < 4 - r; i++) m.at(-0.9 + i * 0.1 + r * 0.05, 0.05 + r * 0.085, 0.1, 0, Math.PI / 2, 0, 1, 1, 1, q => q.cyl(0, -0.75, 0, 0.045, 1.5, 6, i & 1 ? GR : hex('#e8e4c4')));
    } else if (v === 1) {
      const { wood, wood2 } = M2C;
      for (let k = 0; k < 6; k++) m.box(-0.6 + (k & 1) * 0.04, 0.04 + k * 0.07, -1.6, 0.8, 0.06, 2.2, k & 1 ? wood : hex('#c49a6c'));
      for (let i = 0; i < 4; i++) m.at(-0.1 - i * 0.07, 1.1, -2.6 + i * 0.25, 0, 0, -0.18, 1, 1, 1, q => q.box(0, 0, 0, 0.05, 2.2, 0.22, i & 1 ? hex('#c49a6c') : wood));
      const lp = [[-0.95, 0.15], [-0.65, 0.15], [-0.35, 0.15], [-0.8, 0.41], [-0.5, 0.41], [-0.65, 0.67]];
      for (const [x, y] of lp) { m.at(x, y, 0.4, 0, Math.PI / 2, 0, 1, 1, 1, q => { q.cyl(0, -0.6, 0, 0.15, 1.2, 7, wood2, 0, 0.15, false); q.cyl(0, -0.61, 0, 0.12, 1.22, 7, hex('#e0b878')); }); }
    } else {
      const cr = [hex('#c0191c'), hex('#ffc23a')];
      [[-0.75, 0.15, -2.2, 0], [-0.35, 0.15, -2.2, 1], [-0.55, 0.45, -2.2, 0], [-0.55, 0.15, -1.75, 1]].forEach(([x, y, z, c]) => {
        m.box(x, y, z, 0.38, 0.3, 0.4, cr[c]); for (const dx of [-0.09, 0.09]) for (const dz of [-0.1, 0.1]) m.box(x + dx, y + 0.18, z + dz, 0.07, 0.06, 0.07, hex('#3a2a1a')); });
      m.box(-0.5, 0.75, -0.6, 0.5, 1.5, 0.06, GR); for (const z of [-1.15, -0.05]) m.box(-0.5, 0.75, z, 0.5, 1.5, 0.05, GR);
      const sn = [hex('#ff5a2a'), hex('#2dffb3'), hex('#ffc23a'), hex('#a42cff'), hex('#39c8ff')];
      for (let s = 0; s < 3; s++) { const y = 0.25 + s * 0.45; m.box(-0.5, y, -0.6, 0.5, 0.03, 1.15, GR);
        for (let k = 0; k < 4; k++) m.box(-0.55, y + 0.12, -1.0 + k * 0.26, 0.3, 0.22, 0.18, sn[(s + k) % 5], 0.15); }
    }
    return m;
  },
  stall(v) {
    const m = new MB(), base = hex(['#ffd23a', '#2f8a3f', '#ff5a2a'][v]), aw = [hex(['#ffc23a', '#c49a2c', '#c0191c'][v]), WH], top = hex('#c49a6c');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.box(sx * 0.6, 0.95, sz * 0.6, 0.06, 1.9, 0.06, DK);
    m.box(0, 0.45, 0.25, 1.2, 0.9, 0.7, base); m.box(0, 0.93, 0.3, 1.3, 0.06, 0.8, top); m.box(0, 0.3, 0.605, 1.18, 0.12, 0.02, WH);
    for (let i = 0; i < 4; i++) m.box(-0.525 + i * 0.35, 2.0, 0, 0.35, 0.12, 1.4, aw[i & 1]);
    m.box(0, 1.75, 0.62, 1.26, 0.41, 0.03, DK);
    m.quad([-0.6, 1.575, 0.64], [0.6, 1.575, 0.64], [0.6, 1.925, 0.64], [-0.6, 1.925, 0.64], WH, 0.5, ATR.sign[3 + v]);
    const Y = 0.96;
    if (v === 0) {
      m.cyl(-0.15, Y, 0.3, 0.12, 0.32, 8, hex('#f5ea8a'), 0.25); m.cyl(-0.15, Y + 0.32, 0.3, 0.13, 0.03, 8, GR);
      for (let i = 0; i < 4; i++) m.cyl(0.15 + (i % 2) * 0.16, Y, 0.18 + (i >> 1) * 0.22, 0.045, 0.12, 6, hex('#fff6a0'), 0.3);
      for (let i = 0; i < 3; i++) m.ico(-0.45 + i * 0.09, Y + 0.05, 0.5, 0.05, hex('#9ad23a'));
    } else if (v === 1) {
      m.box(0.15, Y + 0.18, 0.3, 0.34, 0.36, 0.3, hex('#5a5f66')); m.at(0.15, Y + 0.24, 0.3, 0, 0, Math.PI / 2, 1, 1, 1, q => q.cyl(0, -0.22, 0, 0.08, 0.44, 8, GR));
      m.box(0.39, Y + 0.24, 0.3, 0.04, 0.04, 0.24, DK); m.box(0.39, Y + 0.24, 0.42, 0.04, 0.16, 0.04, DK);
      m.cyl(-0.3, Y, 0.35, 0.05, 0.13, 6, hex('#d7d06a'), 0.3);
      for (let i = 0; i < 5; i++) m.at(-0.75, 0.75, -0.3 + i * 0.12, 0, 0, -0.15 - i * 0.03, 1, 1, 1, q => q.box(0, 0, 0, 0.05, 1.5, 0.05, i & 1 ? hex('#7a9a3a') : hex('#c4b04a')));
    } else {
      m.box(0, Y + 0.08, 0.3, 0.8, 0.16, 0.5, DK); for (let i = 0; i < 5; i++) m.box(-0.32 + i * 0.16, Y + 0.165, 0.3, 0.02, 0.01, 0.46, GR);
      m.box(0, Y + 0.17, 0.3, 0.6, 0.01, 0.36, hex('#ff5a2a'), 0.5);
      for (let i = 0; i < 6; i++) m.cyl(-0.24 + (i % 3) * 0.24, Y + 0.17, 0.2 + (i > 2 ? 0.2 : 0), 0.08, 0.03, 8, hex('#f0d68a'));
      m.cyl(0.5, Y, 0.45, 0.07, 0.14, 6, hex('#e8e4c4'));
    }
    return m;
  },
  person(v) {
    const m = new MB(), sh = hex(['#ff5a2a', '#2dffb3', '#a42cff', '#ffc23a'][v]), pa = hex(['#1b4459', '#3a3f4a', '#6b3f16', '#1d4e79'][v]);
    const sk = hex(['#a8754e', '#6b4428', '#f0c9a8', '#c98e62'][v]), hc = hex(['#2b2112', '#1c1c22', '#c49a2c', '#5b4636'][v]);
    for (const sx of [-1, 1]) { m.box(sx * 0.1, 0.45, 0, 0.14, 0.82, 0.16, pa); m.box(sx * 0.1, 0.04, -0.04, 0.15, 0.08, 0.26, WH); }
    m.box(0, 0.92, 0, 0.36, 0.16, 0.22, pa); m.box(0, 1.2, 0, 0.4, 0.44, 0.24, sh); m.box(0, 1.46, 0, 0.11, 0.08, 0.11, sk);
    m.ico(0, 1.56, 0, 0.13, sk); m.hemi(0, 1.57, 0.01, 0.135, 8, 2, hc); m.box(0, 1.53, 0.09, 0.24, 0.12, 0.06, hc);
    for (const x of [-0.045, 0.045]) m.box(x, 1.57, -0.125, 0.03, 0.03, 0.02, DK);
    m.box(-0.25, 1.15, 0, 0.1, 0.5, 0.11, sh); m.box(-0.25, 0.85, 0, 0.08, 0.12, 0.09, sk);
    m.box(0.25, 1.25, 0, 0.1, 0.3, 0.11, sh); bar(m, 0.25, 1.12, 0, 1.05, -0.24, 0.08, sk);
    m.cyl(0.25, 1.03, -0.27, 0.045, 0.13, 6, hex(['#fff6a0', '#d7d06a', '#e8e4c4', '#ff5a2a'][v]), 0.3); return m;
  },
  tlight() {
    const m = new MB(), k = hex('#25272c');
    m.cyl(0, 0, 0, 0.08, 4, 6, k); m.box(0, 0.1, 0, 0.3, 0.2, 0.3, k);
    m.box(0, 3.25, 0.01, 0.34, 1.0, 0.24, k); m.box(0, 3.25, -0.12, 0.5, 1.14, 0.02, hex('#f4f1e6'));
    for (const y of [3.55, 3.25, 2.95]) { m.box(0, y + 0.13, 0.19, 0.28, 0.025, 0.12, k); for (const sx of [-1, 1]) m.box(sx * 0.135, y + 0.06, 0.19, 0.012, 0.14, 0.12, k); }
    m.box(0, 4.0, 0, 0.18, 0.04, 0.18, k); return m;
  },
  wallseg() {
    const m = new MB(), con = hex('#b9bcc2'), P = [[0.25, 0], [0.25, 0.08], [0.15, 0.33], [0.085, 0.85]];
    const prof = [...P.map(p => [-p[0], p[1]]).reverse(), ...P];
    for (let i = 0; i < prof.length; i++) { const a = prof[i], b = prof[(i + 1) % prof.length]; m.quad([a[0], a[1], -2], [b[0], b[1], -2], [b[0], b[1], 2], [a[0], a[1], 2], con); }
    for (const z of [-2, 2]) for (let i = 1; i < prof.length - 1; i++) m.tri([prof[0][0], prof[0][1], z], [prof[i][0], prof[i][1], z], [prof[i + 1][0], prof[i + 1][1], z], con);
    for (let i = 0; i < 8; i++) m.box(0, 0.925, -1.75 + i * 0.5, 0.17, 0.15, 0.5, i & 1 ? DK : hex('#ffc23a'), i & 1 ? 0 : 0.3);
    return m;
  },
  railseg() {
    const m = new MB(), mt = hex('#c0c4ca');
    m.box(0, 0.55, 0, 0.08, 0.08, 4, mt, 0.15); m.box(0, 0.03, 0, 0.12, 0.06, 4, GR);
    for (const z of [-1, 1]) { m.box(0, 0.28, z, 0.06, 0.48, 0.06, GR); m.box(0, 0.035, z, 0.42, 0.07, 0.26, DK); }
    return m;
  },
  posterWall() {
    const m = new MB(), br = hex('#a5533a'), mo = hex('#7d3e2b');
    m.box(0, 1.3, 0, 0.2, 2.6, 3, br); m.box(0, 2.66, 0, 0.3, 0.12, 3.1, hex('#d9d2b0')); m.box(0, 0.06, 0, 0.26, 0.12, 3.06, GR);
    for (let y = 0.3; y < 2.5; y += 0.25) for (const sx of [-1, 1]) m.box(sx * 0.101, y, 0, 0.004, 0.025, 2.98, mo);
    return m;
  },
  poster(v) { const m = new MB(); m.quad([0, 0.8, -0.45], [0, 0.8, 0.45], [0, 2.1, 0.45], [0, 2.1, -0.45], WH, 0.3, ATR.poster[v]); return m; },
  bundle() {
    const m = new MB(), { cr, teal } = M2C, cu = hex('#b08a4a');
    m.box(0, -0.08, 0, 0.4, 0.14, 0.3, teal); m.box(0, 0.07, 0, 0.39, 0.16, 0.29, cr); m.box(0, 0.0, 0, 0.41, 0.015, 0.31, hex('#c0191c'));
    m.box(0, 0, 0, 0.42, 0.32, 0.04, cu); m.box(0, 0, 0, 0.04, 0.32, 0.32, cu); m.box(0, 0.17, 0, 0.1, 0.03, 0.06, cu); return m;
  },
  envelope() {
    const m = new MB(), cr = hex('#efe9d2');
    m.box(0, 0, 0, 0.3, 0.02, 0.2, cr); m.tri([-0.15, 0.011, -0.1], [0.15, 0.011, -0.1], [0, 0.011, 0.02], hex('#d9d2b0'));
    m.box(0.1, 0.012, 0.05, 0.05, 0.006, 0.06, hex('#c0191c'), 0.4); return m;
  },
  paper() {
    const m = new MB();
    m.at(0, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, q => { q.cyl(0, -0.17, 0, 0.05, 0.34, 8, hex('#d6d6d0')); q.cyl(0, -0.03, 0, 0.053, 0.06, 8, hex('#0e6378')); }); return m;
  },
  xroad() {
    const m = new MB(), y = hex('#ffc23a');
    m.quad([-60, 0.02, 5], [60, 0.02, 5], [60, 0.02, -5], [-60, 0.02, -5], hex('#33363d'));
    for (let x = -59; x < 60; x += 3) m.quad([x, 0.025, 0.07], [x + 1.5, 0.025, 0.07], [x + 1.5, 0.025, -0.07], [x, 0.025, -0.07], y, 0.3);
    for (const [z0, z1] of [[5.3, 6.5], [-6.5, -5.3]]) for (let i = 0; i < 7; i++) { const cx = -2.95 + i * 5.9 / 6;
      m.quad([cx - 0.25, 0.03, z1], [cx + 0.25, 0.03, z1], [cx + 0.25, 0.03, z0], [cx - 0.25, 0.03, z0], WH, 0.3); }
    return m;
  },
  parkArch() {
    const m = new MB(), y = hex('#ffc23a');
    for (const sx of [-1, 1]) { for (let j = 0; j < 6; j++) m.box(sx * 4.3, 0.375 + j * 0.75, -0.25, 0.4, 0.75, 0.4, j & 1 ? DK : y); m.box(sx * 4.3, 0.1, -0.25, 0.7, 0.2, 0.7, GR); }
    m.box(0, 4.4, -0.25, 9.0, 0.3, 0.3, DK); m.box(0, 4.2, -0.05, 5.2, 1.3, 0.1, DK);
    m.quad([-2.5, 3.65, 0.01], [2.5, 3.65, 0.01], [2.5, 4.75, 0.01], [-2.5, 4.75, 0.01], WH, 0.6, ATR.sign[6]); return m;
  },
  quarter() {
    const m = new MB(), wd = hex('#c49a6c'), gy = hex('#8a8f96'), P = [];
    for (let i = 0; i <= 4; i++) { const t = i / 4 * Math.PI / 2; P.push([1 - 2 * Math.sin(t), 2 - 2 * Math.cos(t)]); }
    for (let i = 0; i < 4; i++) { const [z0, y0] = P[i], [z1, y1] = P[i + 1]; m.quad([-1.5, y0, z0], [1.5, y0, z0], [1.5, y1, z1], [-1.5, y1, z1], i & 1 ? wd : hex('#b88c5e')); }
    for (const x of [-1.5, 1.5]) for (let i = 0; i < 4; i++) m.tri([x, 0, -1], [x, P[i][1], P[i][0]], [x, P[i + 1][1], P[i + 1][0]], gy);
    m.box(0, 1.0, -1.4, 3, 2, 0.8, gy); m.box(0, 2.02, -1.4, 3.02, 0.04, 0.82, hex('#5b4636'));
    m.at(0, 2.0, -1.0, 0, 0, Math.PI / 2, 1, 1, 1, q => q.cyl(0, -1.5, 0, 0.05, 3, 6, hex('#c0c4ca'))); return m;
  }
});

/* ---- RunRunZero/src/render.js ---- */
/* ===== ESCENA · cámara, ediciones, jugador animado, partículas ===== */
const v3 = () => [0, 0, 0];
const RN = {
  env: { top: v3(), hor: v3(), sunC: v3(), sun: v3(), stars: 0, amb: 1, sunI: 0.4, emit: 0.2, fogR: [60, 180], L: [-0.42, 0.78, 0.46], bend: [0, -0.00032], hill: [0, 0, 0, 0], h0: 0, hy: 0.5, road: [v3(), v3(), v3(), v3(), v3()], scen: [v3(), v3(), v3(), v3(), v3()] },
  cam: { ex: 0, ey: 3, ez: 6, cx: 0, cy: 1, cz: -10, fov: 1 }, camY: 0, shake: 0, cr: 0,
  M: new Float32Array(16), A: new Float32Array(16), B: new Float32Array(16), C: new Float32Array(16), D: new Float32Array(16), E: new Float32Array(16),
  parts: [], mo: {}, branches: {}, pl: null, plKey: '', trailT: 0, quality: 1,
  init() {
    const mk = b => R.mesh(b), mo = this.mo;
    for (const k of ['road', 'tree', 'pine', 'bush', 'lamp', 'bench', 'hill', 'billFrame', 'gateFrame', 'rock', 'cone', 'barrier', 'pothole', 'puddle', 'kiosk', 'coin', 'gift', 'clue', 'magnet', 'shield', 'turbo', 'x2', 'cube', 'shadow', 'ink', 'flowers', 'wing', 'bfly', 'bird', 'bwing', 'rabbit', 'palm', 'parasol', 'sea', 'mount', 'fence', 'coffee', 'rail', 'boat', 'buzon', 'flag', 'door', 'rarm', 'mag', 'tunnel', 'portal']) mo[k] = mk(MOD[k]());
    mo.runB = [0, 1, 2, 3].map(c => mk(MOD.npcRun(c, 0))); mo.skB = [0, 1, 2, 3].map(c => mk(MOD.npcRun(c, 1))); mo.runL = mk(MOD.npcLeg(0)); mo.skL = mk(MOD.npcLeg(1));
    mo.kite = [0, 1, 2].map(v => mk(MOD.kite(v))); mo.balloon = [0, 1].map(v => mk(MOD.balloon(v)));
    for (const k of ['tlight', 'wallseg', 'railseg', 'posterWall', 'bundle', 'envelope', 'paper', 'xroad', 'parkArch', 'quarter', 'policia', 'ducks', 'medseg', 'forkSign', 'chev', 'fountain', 'playground', 'pond', 'hedgeseg', 'bedseg', 'manhole', 'crack', 'bump', 'trash', 'pbike', 'container', 'sand', 'scaff']) mo[k] = mk(MOD[k]());
    mo.signpost = [null, mk(MOD.signpost(1)), mk(MOD.signpost(2))];
    this.NEWO = new Set(['manhole', 'crack', 'bump', 'trash', 'pbike', 'container', 'sand', 'scaff']);
    mo.picnic = [0, 1, 2].map(v => mk(MOD.picnic(v))); mo.sitter = [0, 1, 2, 3].map(v => mk(MOD.sitter(v)));
    mo.shop = [0, 1, 2].map(v => mk(MOD.shop(v))); mo.stall = [0, 1, 2].map(v => mk(MOD.stall(v))); mo.person = [0, 1, 2, 3].map(v => mk(MOD.person(v))); mo.poster = [0, 1, 2, 3].map(v => mk(MOD.poster(v)));
    mo.carNpc = [0, 1, 2, 3].map(v => mk(MOD.carNpc(v))); mo.motoNpc = [0, 1, 2, 3].map(v => mk(MOD.motoNpc(v)));
    mo.dogA = mk(MOD.pet('m1', '#c9935e')); mo.dogT = mk(MOD.petTail('m1', '#c9935e')); mo.catA = mk(MOD.pet('m2', '#3a3a46')); mo.catT = mk(MOD.petTail('m2', '#3a3a46')); this.cars = [];
    mo.house = [0, 1, 2].map(v => mk(MOD.house(v))); mo.resi = [0, 1, 2].map(v => mk(MOD.resi(v))); this.proj = [];
    mo.bld = []; for (let v = 0; v < 3; v++) mo.bld.push([mk(MOD.bld(v, 2)), mk(MOD.bld(v, 3))]);
    mo.bill = []; mo.gate = []; for (let i = 0; i < 10; i++) { mo.bill.push(mk(MOD.billPanel(i))); mo.gate.push(mk(MOD.gatePanel(i))); }
    for (let i = 0; i < 4; i++) mo.bill.push(mk(MOD.billPanelUV(ATR.event[i])));
    mo.truck = [0, 1, 2].map(c => mk(MOD.truck(c))); mo.npc = [0, 1, 2, 3].map(c => mk(MOD.npc(c)));
    mo.ramp = mk(MOD.ramp(2.4, 6, '#ffc23a')); mo.jramp = mk(MOD.ramp(1.1, 4, '#ff5a2a'));
    mo.halo = { magnet: mk(MOD.halo('#ff5a2a')), turbo: mk(MOD.halo('#ffc23a')), x2: mk(MOD.halo('#ff2fb3')), shield: mk(MOD.halo('#39c8ff')), gift: mk(MOD.halo('#ff2fb3')), clue: mk(MOD.halo('#2dffb3')), glide: mk(MOD.halo('#2dffb3')), letter: mk(MOD.halo('#ffc23a')) };
    for (const k of ['gatepost', 'gatebar', 'bollard', 'umbrella']) mo[k] = mk(MOD[k]()); mo.glide = mo.umbrella; mo.letter = {}; for (const ch of 'EMSAY') mo.letter[ch] = mk(MOD.letter(ch));
  },
  branch(v) { const k = v.side + ':' + v.lanes.join(''); return this.branches[k] || (this.branches[k] = R.mesh(MOD.branch(v.side, v.lanes))); },
  setPlayer(cos, vid) {
    const key = JSON.stringify(cos) + vid; if (key === this.plKey) return; this.plKey = key;
    if (this.pl) for (const k in this.pl) if (this.pl[k]) R.free(this.pl[k]);
    const r = MOD.rider(cos);
    const v2 = ['uni', 'ebike', 'moped', 'moto', 'auto', 'camion'].includes(vid), nov = vid === 'foot' || vid === 'jetpack';
    this.pl = { veh: nov ? null : R.mesh(v2 ? MOD.veh2(vid, cos.paint, cos.pe) : MOD.veh(vid, cos.paint, cos.pe)), jet: vid === 'jetpack' ? R.mesh(MOD.veh2('jetpack', cos.paint, cos.pe)) : null, t: R.mesh(r.t), th: R.mesh(r.th), sn: R.mesh(r.sn), ar: R.mesh(r.ar) };
    const pc = COSI[cos.pet]; if (pc && pc.c) { this.pl.pet = R.mesh(MOD.pet(cos.pet, pc.c)); this.pl.ptail = R.mesh(MOD.petTail(cos.pet, pc.c)); } this.petK = pc && pc.c ? cos.pet : null;
    this.vid = vid;
  },
  zoneEnv(g, s) {
    const Zi = zinfo(g, s), u = Math.max(0, s) - Zi.s0, a = ZONES[Zi.pz], b = ZONES[Zi.z];
    let t = Zi.s0 > 0 && u < 70 ? u / 70 : 1; t = t * t * (3 - 2 * t);
    const E = this.env;
    lerp3(E.top, a.top, b.top, t); lerp3(E.hor, a.hor, b.hor, t); lerp3(E.sunC, a.sunC, b.sunC, t);
    for (let i = 0; i < 3; i++) E.sun[i] = lerp(a.sun[i], b.sun[i], t);
    E.stars = lerp(a.stars, b.stars, t); E.amb = lerp(a.amb, b.amb, t); E.sunI = lerp(a.sunI, b.sunI, t); E.emit = lerp(a.emit, b.emit, t);
    E.fogR[0] = lerp(a.fog[0], b.fog[0], t) * this.quality; E.fogR[1] = lerp(a.fog[1], b.fog[1], t) * (0.7 + 0.3 * this.quality);
    for (let k = 0; k < 5; k++) { lerp3(E.road[k], a.road[k], b.road[k], t); lerp3(E.scen[k], a.scen[k], b.scen[k], t); }
    return t < 0.5 ? a : b;
  },
  camera(g, mode, time, dt) {
    const P = g.p, c = this.cam, asp = R.w / R.h, k = clamp((1.05 - asp) / 0.55, 0, 1);
    if (mode === 'garage') { const a = time * 0.45 + 0.6, rr = (g.veh.id === 'auto' || g.veh.id === 'camion' ? 7.5 : 4.9) + k * 0.6; c.ex = P.x + Math.sin(a) * rr; c.ez = Math.cos(a) * rr; c.ey = 1.7 + (rr > 7 ? 1.2 : 0); c.cx = P.x; c.cy = -0.85 - k * 0.2; c.cz = 0; c.fov = 0.9 + k * 0.2; }
    else if (mode === 'menu') { c.ex = P.x * 0.6 + 1.6; c.ey = 1.85 + P.y * 0.5; c.ez = 4.4 + k * 1.6; c.cx = P.x * 0.6; c.cy = 1.0 + P.y * 0.4; c.cz = -8; c.fov = 1.0 + k * 0.15; }
    else {
      this.camY = lerp(this.camY, P.y, Math.min(1, dt * 6));
      const hf = clamp((this.camY - 2.4) / 2, 0, 1);
      c.ex = P.x * 0.72; c.ey = lerp(3.15, 3.75, k) + this.camY * lerp(0.62, 0.92, hf); c.ez = lerp(5.9, 7.3, k);
      c.cx = P.x * 0.86; c.cy = 1.1 + this.camY * lerp(0.5, 0.86, hf); c.cz = -10;
      c.fov = (lerp(58, 66, k) + clamp(P.v - 14, 0, 30) * 0.28 + (P.turbo > 0 ? 6 : 0)) * Math.PI / 180;
    }
    if (mode !== 'garage') { this.slS = lerp(this.slS || 0, this.sl || 0, Math.min(1, dt * 4)); c.cy += this.slS * 10; }
    if (this.turnA) { const a = this.turnA, cs = Math.cos(a), sn = Math.sin(a), px = P.x; for (const [kx, kz] of [['ex', 'ez'], ['cx', 'cz']]) { const dx = c[kx] - px, dz = c[kz]; c[kx] = px + dx * cs + dz * sn; c[kz] = -dx * sn + dz * cs; } this.turnA *= Math.exp(-dt * 4.2); if (Math.abs(this.turnA) < 0.004 || mode !== 'play') this.turnA = 0; }
    c.ey -= (this.land || 0) * 0.22;
    if (this.shake > 0) { c.ex += (Math.random() - 0.5) * this.shake; c.ey += (Math.random() - 0.5) * this.shake; this.shake = Math.max(0, this.shake - dt * 2.5); }
    // horizonte en pantalla (para el degradado del cielo)
    const E = this.env; M4.persp(R.P, c.fov, asp, 0.1, 400); M4.look(R.V, c.ex, c.ey, c.ez, c.cx, c.cy, c.cz);
    const V = R.V, P2 = R.P, wx = c.ex, wy = 0, wz = -190;
    const vx = V[0] * wx + V[4] * wy + V[8] * wz + V[12], vz = V[2] * wx + V[6] * wy + V[10] * wz + V[14];
    let vy = V[1] * wx + V[5] * wy + V[9] * wz + V[13]; vy += E.bend[1] * vz * vz;
    const cy = P2[5] * vy, cw = -vz; E.hy = clamp(0.5 + 0.5 * cy / cw, 0.05, 0.95); void vx;
  },
  emit(n, x, y, s, col, spd, sz, life, up = 3, gr = 1) {
    if (this.quality < 0.7) n = Math.ceil(n / 2);
    for (let i = 0; i < n && this.parts.length < 140; i++) this.parts.push({ x, y, s, vx: (Math.random() - 0.5) * spd, vy: up * (0.4 + Math.random()), vs: (Math.random() - 0.5) * spd, life, max: life, col, sz: sz * (0.6 + Math.random() * 0.6), gr, sx: 1, sz2: 1 });
  },
  events(g, e) {
    const P = g.p;
    if (e.k === 'coin') this.emit(3, e.a.x, e.a.y, e.a.s, hex('#ffc23a'), 3, 0.09, 0.35);
    else if (e.k === 'smash') { const o = e.a; this.emit(10, o.x, 0.8, o.s, o.t === 'cone' ? hex('#ff5a2a') : hex('#e8e4c4'), 7, 0.16, 0.8, 5); }
    else if (e.k === 'stumble') { this.emit(8, P.x, 0.2, P.s, hex('#b9a88a'), 4, 0.12, 0.5, 2); this.shake = 0.35; }
    else if (e.k === 'crash') { this.emit(16, P.x, 0.8, P.s, hex('#e8e4c4'), 8, 0.15, 1, 5); this.shake = 0.9; }
    else if (e.k === 'clue') this.emit(14, P.x, 1.2, P.s + 1, hex('#2dffb3'), 5, 0.1, 0.9, 4, 0.2);
    else if (e.k === 'power' || e.k === 'gift') this.emit(10, P.x, 1.4, P.s + 0.5, hex(e.k === 'gift' ? '#ff2fb3' : '#39c8ff'), 3, 0.06, 0.45, 3.5, 0.4);
    else if (e.k === 'land') { this.land = Math.min(1, 0.35 + e.a); if (e.a > 0.35) this.emit(6, P.x, 0.1, P.s, hex('#cfc4a8'), 3, 0.1, 0.4, 1.5); }
    else if (e.k === 'sand' && Math.random() < 0.5) this.emit(3, P.x, 0.1, P.s, hex('#e8cf8f'), 2.5, 0.08, 0.4, 1.5);
    else if (e.k === 'bump') this.land = 0.5;
    else if (e.k === 'turn') { this.turnA = e.a.dir * Math.PI / 2 * 0.85; this.shake = Math.max(this.shake || 0, 0.15); }
    else if (e.k === 'deliver') { const d = e.a; this.proj.push({ x0: P.x + d.side * 0.3, y0: P.y + 1.4, s0: P.s, x1: d.side * (d.obj === 'kiosko' ? 3.8 : 4.35), y1: d.obj === 'muro' ? 1.5 : 1.3, s1: d.s, t: 0, T: d.T, m: d.k === 'per' ? 'paper' : d.k === 'cor' ? 'envelope' : d.k === 'kio' ? 'bundle' : 'mag' }); this.throwT = 0.32; this.throwSide = d.side; }
    else if (e.k === 'grind' || e.k === 'grindOn') this.emit(6, P.x, P.y + 0.05, P.s, hex('#ffc23a'), 4, 0.06, 0.35, 2.5);
    else if (e.k === 'vault') this.emit(5, P.x, 0.4, P.s, hex('#cfc4a8'), 3, 0.09, 0.4, 2);
    else if (e.k === 'near') this.emit(4, (P.x + e.a.x) / 2, 1, P.s, hex('#ffffff'), 2, 0.05, 0.3, 1, 0);
    else if (e.k === 'critHit') { this.emit(10, e.a.x, 0.4, e.a.s, hex('#f4f1e6'), 5, 0.08, 0.7, 4); }
    else if (e.k === 'shield') { this.emit(14, P.x, 1, P.s, hex('#39c8ff'), 6, 0.12, 0.8, 4); this.shake = 0.5; }
  },
  trail(g, dt, id) {
    const P = g.p; if (!P.alive || id === 't0') return;
    this.trailT -= dt; if (this.trailT > 0) return;
    if (id === 't1') { this.trailT = 0.05; if (!P.air) this.emit(1, P.x + (Math.random() - 0.5) * 0.3, 0.08, P.s - 0.4, hex('#cbbf9f'), 1, 0.1, 0.5, 0.8); }
    else if (id === 't2') { this.trailT = 0.04; this.emit(1, P.x, 0.4 + P.y, P.s - 0.5, hex(['#0e6378', '#c0191c', '#c49a2c', '#e8e4c4', '#ff5a2a'][Math.floor(Math.random() * 5)]), 2.5, 0.09, 0.7, 2); }
    else if (id === 't3') { this.trailT = 0.016; this.parts.push({ x: P.x, y: P.y + 0.15, s: P.s - 0.3, vx: 0, vy: 0, vs: 0, life: 0.45, max: 0.45, col: hex(Math.floor(g.t * 4) % 2 ? '#39c8ff' : '#a42cff'), sz: 0.07, gr: 0, sx: 1, sz2: 6 }); }
    else if (id === 't4') { this.trailT = 0.05; this.emit(1, P.x + (Math.random() - 0.5) * 0.6, 0.6 + P.y + Math.random(), P.s - 0.4, hex('#ffc23a'), 1, 0.07, 0.8, 0.6, -0.2); }
  },
  drawPlayer(g, time, dt) {
    const P = g.p, id = g.veh.id, pl = this.pl; if (!pl) return;
    const M = this.M, A = this.A, B = this.B, C = this.C, D = this.D, Ee = this.E, TAU = Math.PI * 2;
    this.cr = lerp(this.cr, P.crouch > 0 ? 1 : P.grind ? 0.45 : 0, Math.min(1, dt * 18)); const cr = this.cr;
    this.brk = lerp(this.brk || 0, P.brake ? 1 : 0, Math.min(1, dt * 10)); const brk = this.brk;
    const big = id === 'auto' || id === 'camion', tx = LX(P.lane), roll = clamp((tx - P.x) * 0.16, -0.32, 0.32) * (big ? 0.3 : 1), pitch = P.air ? clamp(-P.vy * 0.012, -0.25, 0.25) : 0;
    let spin = 0, vspin = 0, vflip = 0, flip = 0;
    if (P.air && !P.trickHit && P.airT > 0.15 && P.alive && !big && P.glide <= 0 && !P.trN) { const k = clamp((P.airT - 0.15) / 0.38, 0, 1), e = k * k * (3 - 2 * k) * TAU; if (id === 'skate') vflip = e; else if (id === 'scooter' || id === 'long') vspin = e; else if (id !== 'foot' && id !== 'jetpack') spin = e; }
    if (P.trN > 0 && P.air && !big) { const k = clamp(P.trT / 0.3, 0, 1), e = k * k * (3 - 2 * k) * TAU; if (P.trN === 1) flip = -e; else spin = e; }
    let dead = 0, slide = 0; if (!P.alive) { dead = Math.min(1.5, P.deadT * 4); slide = Math.min(3.5, P.deadT * 6); }
    if (P.inv > 0 && P.alive && Math.floor(time * 14) % 2) return;
    const rx = pitch - dead * 0.2 + Math.atan(this.sl || 0) + (big ? -brk * 0.03 : 0);
    if (flip) { M4.trs(B, P.x, P.y + 0.95, 0, spin + (this.turnA || 0), rx + flip, roll); M4.trs(A, 0, -0.95, 0); M4.mul(B, B, A); } else M4.trs(B, P.x, P.y, 0, spin + (this.turnA || 0), rx, roll);
    const sq = this.land || 0; if (sq > 0.01) { this.land = Math.max(0, sq - dt * 4.5); M4.trs(A, 0, 0, 0, 0, 0, 0, 1 + 0.1 * sq, 1 - 0.16 * sq, 1 + 0.1 * sq); M4.mul(B, B, A); }
    // vehículo
    const sk = id === 'quad' || id === 'inline';
    if (!sk && pl.veh) { M4.trs(A, 0, 0, -slide, vspin, 0, vflip + dead * 0.6); M4.mul(M, B, A); R.draw(pl.veh, M); }
    if (big) return;
    // pose
    let hy, hz = 0, yaw = 0, lean, feet, arms, splay = 0.04;
    const ph = P.phase, grounded = !P.air && P.alive;
    if (id === 'foot' || id === 'jetpack') {
      hy = 0.9 - 0.3 * cr; lean = 0.22 + 0.45 * cr; const run = clamp(P.v / 9, 0.12, 1), f = ph * 0.9;
      if (!grounded) { feet = [[0.44, -0.2], [0.3, 0.22]]; arms = id === 'jetpack' ? [[0.35, 0.25], [0.35, -0.25]] : [[-0.5, 0.5], [-0.5, -0.5]]; }
      else { feet = [0, 1].map(i => { const a = f + i * Math.PI; return [0.08 + Math.max(0, -Math.cos(a)) * 0.3 * run, 0.36 * Math.sin(a) * run]; }); arms = [[0.85 * Math.sin(f) * run, 0.08], [-0.85 * Math.sin(f) * run, -0.08]]; }
    }
    else if (id === 'scooter') { hy = 0.98 - 0.34 * cr; hz = 0.02; lean = 0.18 + 0.5 * cr; const f = time * 7.5, lift = Math.max(0, Math.cos(f)) * 0.16; feet = [[0.19, -0.06], grounded && cr < 0.5 && !P.brake ? [0.07 + lift, 0.2 + 0.25 * Math.sin(f)] : [0.19, 0.2]]; arms = [[0.72 + 0.3 * cr, 0.05], [0.72 + 0.3 * cr, -0.05]]; }
    else if (id === 'escooter') { hy = 1.02 - 0.34 * cr; hz = 0.03; lean = 0.12 + 0.5 * cr; feet = [[0.255, -0.17], [0.255, 0.2]]; arms = [[0.7 + 0.3 * cr, 0.05], [0.7 + 0.3 * cr, -0.05]]; }
    else if (id === 'bike' || id === 'trike' || id === 'ebike') { hy = 1.03 - 0.08 * cr; hz = 0.12; lean = 0.55 + 0.3 * cr; const f = ph * 0.7; feet = [[0.36 - 0.17 * Math.cos(f) + 0.07, -0.02 + 0.17 * Math.sin(f)], [0.36 + 0.17 * Math.cos(f) + 0.07, -0.02 - 0.17 * Math.sin(f)]]; arms = [[1.0, 0.08], [1.0, -0.08]]; }
    else if (id === 'uni') { hy = 1.12 - 0.12 * cr; lean = 0.1 + 0.5 * cr; const f = ph * 1.2; feet = [[0.4 - 0.13 * Math.cos(f), 0.13 * Math.sin(f)], [0.4 + 0.13 * Math.cos(f), -0.13 * Math.sin(f)]]; arms = [[0.2, -0.9 + 0.15 * Math.sin(time * 5)], [0.2, 0.9 + 0.15 * Math.sin(time * 5)]]; splay = 0.1; }
    else if (id === 'moped' || id === 'moto') { const mt = id === 'moto'; hy = (mt ? 0.94 : 0.88) - 0.1 * cr; hz = mt ? 0.2 : 0.28; lean = (mt ? 0.38 : 0.2) + 0.35 * cr; feet = mt ? [[0.4, -0.02], [0.4, -0.02]] : [[0.3, -0.12], [0.3, -0.12]]; arms = [[1.02, 0.1], [1.02, -0.1]]; splay = 0.16; }
    else if (id === 'euc') { hy = 1.02 - 0.34 * cr; lean = 0.1 + 0.5 * cr; feet = [[0.25, -0.02], [0.25, 0.02]]; arms = [[0.3, -0.6], [0.3, 0.6]]; splay = 0.12; }
    else if (id === 'skate' || id === 'long') { hy = 0.9 - 0.3 * cr; yaw = -1.35; lean = 0.15 + 0.4 * cr; feet = null; arms = [[0.25, 0.95], [0.25, -0.95]]; }
    else { hy = (id === 'inline' ? 1.0 : 0.97) - 0.32 * cr; lean = 0.3 + 0.45 * cr; const f = time * (id === 'inline' ? 5.2 : 6.5) * (P.brake ? 0 : 1); feet = [[0.17 + Math.max(0, -Math.cos(f)) * 0.08, 0.22 * Math.sin(f)], [0.17 + Math.max(0, Math.cos(f)) * 0.08, -0.22 * Math.sin(f)]]; arms = [[0.45 * Math.sin(f), 0.15], [-0.45 * Math.sin(f), -0.15]]; splay = 0.1; }
    lean -= brk * 0.28; if (!P.alive) lean += dead * 0.6;
    // cadera
    M4.trs(A, 0, hy, hz, yaw, 0, 0); M4.mul(C, B, A);
    for (let i = 0; i < 2; i++) {
      const sx = i ? 0.1 : -0.1; let a1, a2, rz = i ? -splay : splay;
      if (feet) { const f = feet[i], r = ik(f[0] - hy, f[1] - hz); a1 = r[0]; a2 = r[1]; }
      else { a1 = 0.3 + 0.5 * cr; a2 = -0.6 - 0.9 * cr; rz = i ? -0.26 : 0.26; }
      M4.trs(A, sx, 0, 0, 0, a1, rz); M4.mul(D, C, A); R.draw(pl.th, D);
      M4.trs(A, 0, -0.42, 0, 0, a2, 0); M4.mul(Ee, D, A); R.draw(pl.sn, Ee);
      if (sk) { M4.trs(A, 0, -0.42, 0, 0, -(a1 + a2), -rz); M4.mul(D, Ee, A); M4.trs(A, 0, -0.09, -0.02, 0, 0, 0, 1.08); M4.mul(M, D, A); R.draw(pl.veh, M); }
    }
    // torso y brazos
    M4.trs(A, 0, 0, 0, 0, -lean, 0); M4.mul(D, C, A); R.draw(pl.t, D);
    if (pl.jet) { R.draw(pl.jet, D); if (P.air && P.alive && Math.random() < 0.7) this.emit(1, P.x + (Math.random() - 0.5) * 0.2, P.y + 0.75, P.s - 0.3, hex(Math.random() < 0.5 ? '#ff8a1e' : '#ffd23a'), 1, 0.13, 0.22, -4, 0); }
    if (P.glide > 0) arms = [[2.95, 0.12], [2.95, -0.12]];
    if (this.throwT > 0) { this.throwT = Math.max(0, this.throwT - dt); const k = Math.sin((1 - this.throwT / 0.32) * Math.PI), i = this.throwSide > 0 ? 1 : 0; arms = arms.slice(); arms[i] = [2.3 * k - lean * 0.6, this.throwSide * 0.9 * k]; }
    const stand = id === 'skate' || id === 'long';
    for (let i = 0; i < 2; i++) { const ar = arms[i], sx = i ? 0.255 : -0.255; M4.trs(A, sx, 0.58, 0, 0, ar[0] + (stand ? 0 : lean * 0.6), ar[1]); M4.mul(M, D, A); R.draw(pl.ar, M); }
    if (P.glide > 0) { M4.trs(A, 0, 2.25, 0.05, time * 0.6, Math.sin(time * 2) * 0.08, Math.sin(time * 1.7) * 0.1, 1.35); M4.mul(M, B, A); R.draw(this.mo.umbrella, M); }
  },
  /* fauna silvestre: mariposas, pájaros, conejos, luciérnagas y semillas (solo decoración) */
  wild(g, mode, time, dt) {
    if (mode === 'garage') return;
    const P = g.p, M = this.M, A = this.A, B = this.B, mo = this.mo, L = this.crit || (this.crit = []);
    const zi = zinfo(g, P.s).z, night = ZONES[zi].stars > 0.5, urban = zi === 2;
    if (L.length < (this.quality < 0.7 ? 6 : 13) && Math.random() < dt * 3.2) {
      const r = Math.random(), sd = Math.random() < 0.5 ? -1 : 1, s = P.s + 35 + Math.random() * 85;
      const k = night ? (r < 0.8 ? 'fly' : 'bird') : r < (urban ? 0.3 : 0.55) ? 'bfly' : r < 0.75 ? 'bird' : 'seed';
      const BF = ['#ff8a1e', '#ffd23a', '#39a0ff', '#f4f1e6', '#ff2fb3', '#2dffb3'];
      L.push({ k, s, x: sd * (k === 'bird' ? 10 : 3 + Math.random() * 4), y: k === 'bird' ? 6 + Math.random() * 4 : k === 'rabbit' ? 0 : 0.8 + Math.random() * 1.4,
        vx: -sd * (k === 'bird' ? 4 + Math.random() * 3 : k === 'rabbit' ? 2.6 + Math.random() : 0.7 + Math.random() * 1.3), vs: k === 'bird' ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 1.2,
        vy: 0, t: 0, ph: Math.random() * 6.28, col: hex(k === 'fly' ? '#d8ff5a' : k === 'seed' ? '#ffffff' : BF[Math.floor(Math.random() * BF.length)]) });
    }
    // cielo festivo: cometas y globos aerostáticos (días sin lluvia)
    const SK = this.sky || (this.sky = []);
    if (!night && (this.rk || 0) < 0.3 && SK.length < 4 && Math.random() < dt * 0.35) { const b = Math.random() < 0.3, sd = Math.random() < 0.5 ? -1 : 1; SK.push({ b, s: P.s + 110 + Math.random() * 70, x: sd * (b ? 30 + Math.random() * 30 : 12 + Math.random() * 22), y: b ? 22 + Math.random() * 14 : 11 + Math.random() * 8, v: Math.floor(Math.random() * (b ? 2 : 3)), ph: Math.random() * 6 }); }
    for (let i = SK.length - 1; i >= 0; i--) { const k = SK[i], z = -(k.s - P.s); if (z > 30) { SK.splice(i, 1); continue; } if (z < -200) continue;
      if (k.b) { k.y += dt * 0.3; M4.trs(M, k.x, k.y, z, time * 0.1, 0, 0); R.draw(mo.balloon[k.v], M); } else { M4.trs(M, k.x + Math.sin(time * 0.8 + k.ph) * 1.2, k.y + Math.sin(time * 1.3 + k.ph), z, 0.4 * Math.sin(k.ph), 0, Math.sin(time * 1.1 + k.ph) * 0.35, 1.4); R.draw(mo.kite[k.v], M); } }
    for (let i = L.length - 1; i >= 0; i--) {
      const c = L[i]; c.t += dt; c.x += c.vx * dt; c.s += c.vs * dt; c.y += c.vy * dt;
      if (c.s < P.s - 8 || Math.abs(c.x) > 16 || c.t > 35 || c.y > 16) { L.splice(i, 1); continue; }
      const z = -(c.s - P.s); if (z < -130) continue;
      const near = z > -9 && z < 2 && Math.abs(c.x - P.x) < 2.6;
      if (c.k === 'bfly') {
        if (near) c.vy += dt * 10;
        const fl = Math.sin(time * 17 + c.ph) * 1.1, y = c.y + Math.sin(time * 2.4 + c.ph) * 0.35, yaw = Math.atan2(-c.vx, c.vs);
        M4.trs(M, c.x, y, z, yaw, 0, 0, 1.7); R.draw(mo.bfly, M);
        M4.trs(A, 0, 0, 0, 0, 0, fl); M4.mul(B, M, A); R.draw(mo.wing, B, ONE, c.col);
        M4.trs(A, 0, 0, 0, 0, 0, -fl, -1, 1, 1); M4.mul(B, M, A); R.draw(mo.wing, B, ONE, c.col);
      } else if (c.k === 'bird') {
        const fl = Math.sin(time * 9 + c.ph) * 0.7, yaw = Math.atan2(-c.vx, c.vs);
        M4.trs(M, c.x, c.y + Math.sin(time * 1.5 + c.ph) * 0.4, z, yaw, 0, 0, 1.3); R.draw(mo.bird, M);
        M4.trs(A, 0.05, 0.02, 0, 0, 0, fl); M4.mul(B, M, A); R.draw(mo.bwing, B);
        M4.trs(A, -0.05, 0.02, 0, 0, 0, -fl, -1, 1, 1); M4.mul(B, M, A); R.draw(mo.bwing, B);
      } else if (c.k === 'rabbit') {
        if (near && !c.fled) { c.fled = 1; c.vx = Math.sign(c.x - P.x || 1) * 7; }
        M4.trs(M, c.x, Math.abs(Math.sin(c.t * 7 + c.ph)) * 0.32, z, c.vx > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0, 1.25); R.draw(mo.rabbit, M);
      } else {
        const fly = c.k === 'fly', k = fly ? 0.07 * (0.55 + 0.45 * Math.sin(time * 5 + c.ph)) : 0.05;
        c.x += Math.sin(time * 1.3 + c.ph) * dt * 0.6; if (!fly) c.vy = 0.25;
        M4.trs(M, c.x, c.y + Math.sin(time * 1.7 + c.ph) * 0.3, z, time, time * 0.7, 0, k); R.draw(mo.cube, M, ONE, c.col, 1);
      }
    }
  },
  frame(g, mode, time, dt, cos) {
    const P = g.p; if (!R.gl) return;
    this.zoneEnv(g, P.s); if (RUNV.cielo && mode !== 'garage') RUNV.cielo(this.env, g);
    const E = this.env;
    // en modo calle (moto, auto, camión) la vía es asfalto con líneas amarillas
    if (g.street && mode !== 'garage') { lerp3(E.road[0], E.road[0], [0.2, 0.21, 0.24], 0.85); lerp3(E.road[3], E.road[3], [1, 1, 1], 0.7); lerp3(E.road[4], E.road[4], [1, 0.8, 0.15], 0.85); }
    // clima (lluvia) y túneles: oscurecen el ambiente
    const Zr = zinfo(g, P.s), ed = Zr.ed, u = P.s - Zr.s0, rt = mode === 'garage' ? 0 : RUNV.lluvia != null ? RUNV.lluvia : RAINY(ed) ? clamp(Math.min(u, Zr.s1 - P.s) / 60, 0, 1) : 0;
    this.rk = lerp(this.rk || 0, rt, Math.min(1, dt * 2)); const rk = this.rk;
    if (rk > 0.01) { const gr = [0.42, 0.45, 0.5]; lerp3(E.top, E.top, gr, 0.55 * rk); lerp3(E.hor, E.hor, [0.55, 0.58, 0.62], 0.45 * rk); E.amb *= 1 - 0.2 * rk; E.sunI *= 1 - 0.5 * rk; E.fogR[1] *= 1 - 0.25 * rk; E.fogR[0] *= 1 - 0.4 * rk; E.sun[2] *= 1 - rk; E.emit = Math.max(E.emit, 0.45 * rk); }
    const inT = mode !== 'garage' && g.tuns && g.tuns.some(t => P.s > t[0] - 3 && P.s < t[1] + 2); this.tk = lerp(this.tk || 0, inT ? 1 : 0, Math.min(1, dt * 3)); const tk = this.tk;
    if (tk > 0.01) { E.amb *= 1 - 0.5 * tk; E.sunI *= 1 - 0.85 * tk; E.emit = Math.max(E.emit, 0.9 * tk); lerp3(E.hor, E.hor, [0.08, 0.08, 0.1], 0.5 * tk); E.fogR[1] *= 1 - 0.3 * tk; }
    E.bend[0] = mode === 'garage' ? 0 : (RUNV.bend ? RUNV.bend(P.s) : 0.0017 * Math.sin(P.s / 520) * Math.sin(P.s / 190 + 0.7)) * (1 - Math.min(1, Math.abs(this.turnA || 0)));
    E.bend[1] = mode === 'garage' ? 0 : -0.00032;
    const hOn = mode === 'garage' ? 0 : 1, TAU = Math.PI * 2; E.hill[0] = (P.s * 0.0105) % TAU; E.hill[1] = (P.s * 0.027 + 1.7) % TAU; E.hill[2] = P.s; E.hill[3] = hOn; E.h0 = HILL(P.s); this.sl = hOn ? HILLD(P.s) : 0; if (RUNV.hr && hOn) { const q = RUNV.hr(P.s); E.hill[3] = 2; E.hr = q.h; E.hr0 = q.o; } else E.hr = null;
    this.camera(g, mode, time, dt);
    if (!R.begin(this.cam, E, time)) return;
    const mo = this.mo, M = this.M, zs = s => -(s - P.s), FAR = -E.fogR[1] - 12;
    // carretera (1 sola llamada, paleta de la edición)
    R.pal(true, E.road); M4.trs(M, 0, 0, P.s % 40); R.draw(mo.road, M);
    // escenario
    R.pal(true, E.scen); const panels = [];
    const peds = this.peds || (this.peds = []); peds.length = 0;
    for (const sc of g.scen) {
      if (sc.k === 'ped') { const zz = zs(sc.s + sc.mv * (g.t - sc.t0)); if (zz > FAR && zz < 12) peds.push(sc, zz); continue; }
      const z = zs(sc.s); if (z < FAR || z > 14) continue;
      if (sc.nr && (g.xs.some(X => Math.abs(X.s - sc.s) < 9) || g.corners.some(C => Math.abs(C.s - sc.s) < 9) || g.parks.some(p => sc.s > p[0] - 6 && sc.s < p[1] + 6) || g.shops.some(q => q.side === sc.side && Math.abs(q.s - sc.s) < 5) || g.dels.some(d => d.side === sc.side && Math.abs(d.s - sc.s) < 3.5))) continue;
      let m = null, kx = sc.sc, ky = sc.sc, ry = sc.ry, sh = [sc.sh, sc.sh, sc.sh];
      switch (sc.k) {
        case 'bld': m = mo.bld[sc.v][sc.pi - 2]; ky = sc.h; break;
        case 'bill': m = mo.billFrame; panels.push([mo.bill[sc.v % 14], sc.x, z, ry]); break;
        case 'gate': m = mo.gateFrame; panels.push([mo.gate[ZONES[sc.z].bill], 0, z, 0]); break;
        case 'lamp': m = mo.lamp; ry = sc.side > 0 ? 0 : Math.PI; break;
        case 'bench': m = mo.bench; ry = sc.side > 0 ? 0 : Math.PI; break;
        default: m = mo[sc.k];
      }
      if (!m) continue;
      M4.trs(M, sc.x, 0, z, ry, 0, 0, kx, ky, kx); R.draw(m, M, sh);
    }
    // parques: arboleda, bancas, faroles y flores (con la paleta de la edición)
    const PH = (a, b) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };
    for (const p of g.parks) { if (zs(p[1]) > 20 || zs(p[0]) < FAR - 200) continue;
      for (let q = p[0] - 2; q < p[1] + 4; q += 7) { const z = zs(q); if (z < FAR || z > 16) continue;
        for (const sd of [-1, 1]) { const h = PH(q, sd); const k = h < 0.42 ? 'tree' : h < 0.55 ? 'pine' : h < 0.7 ? 'bush' : h < 0.82 ? 'flowers' : 'lamp'; const far = sd * (11.5 + PH(q + 3, sd) * 9);
          M4.trs(M, sd * (h > 0.82 ? 5.6 : 6.4 + h * 1.5), 0, z, k === 'lamp' ? (sd > 0 ? 0 : Math.PI) : h * 6.28, 0, 0, 0.9 + h * 0.4); R.draw(mo[k], M, ONE);
          if (PH(q, sd + 5) < 0.6) { M4.trs(M, far, 0, zs(q + 3), h * 6.28, 0, 0, 1 + PH(q, 9) * 0.6); R.draw(PH(q, sd + 7) < 0.7 ? mo.tree : mo.pine, M, ONE); }
          if (PH(q, sd + 2) < 0.3) { M4.trs(M, sd * 5.0, 0, zs(q + 2), sd > 0 ? 0 : Math.PI, 0, 0, 1); R.draw(mo.bench, M, ONE); } } } }
    R.pal(false);
    for (const p of panels) { M4.trs(M, p[1], 0, p[2], p[3]); R.draw(p[0], M); }
    for (let i = 0; i < peds.length; i += 2) { const sc = peds[i], ph = time * 5.5 + sc.s; M4.trs(M, sc.x, 0.16, peds[i + 1], sc.mv > 0 ? 0 : Math.PI, 0, 0, 0.95); R.draw(mo.runB[sc.v], M); for (const sx of [-1, 1]) { M4.trs(this.A, sx * 0.1, 0.95, 0, 0, 0.42 * Math.sin(ph) * sx, 0); M4.mul(this.B, M, this.A); R.draw(mo.runL, this.B); } }
    // locales con camiones descargando, cruces con semáforo y zonas libres
    for (const q of g.shops) { const z = zs(q.s); if (z < FAR || z > 20) continue; M4.trs(M, q.side * 5.35, 0, z, q.side > 0 ? 0 : Math.PI); R.draw(mo.shop[q.v], M); }
    const LC = this.LC || (this.LC = [hex('#ff2a2a'), hex('#ffc23a'), hex('#2dff6a'), hex('#1a1a1e')]);
    for (const X of g.xs) {
      const z = zs(X.s); if (z < FAR - 10 || z > 30) continue;
      M4.trs(M, 0, 0, z); R.draw(mo.xroad, M);
      const st = lightAt(X, g.t), HP = Math.PI / 2;
      for (let k = 0; k < 2; k++) { const lx = k ? -3.8 : 3.8, lz = zs(X.s + (k ? 7.4 : -7.4)); M4.trs(M, lx, 0, lz); R.draw(mo.tlight, M); for (let i = 0; i < 3; i++) { const on = 2 - i === st; M4.trs(M, lx, 3.55 - 0.3 * i, lz + 0.15, 0, 0, 0, on ? 0.2 : 0.15); R.draw(mo.cube, M, ONE, on ? LC[i] : LC[3], on ? 1 : 0); } }
      for (const c of crossCars(X, g.t, this.cars)) { M4.trs(M, c.x, 0, zs(c.s), c.dir > 0 ? -HP : HP); R.draw(c.moto ? mo.motoNpc[c.col] : mo.carNpc[c.col], M); }
      if (st !== 2) for (let row = 0; row < 2; row++) { const dir = row ? -1 : 1; M4.trs(M, -dir * 8.8, 0, zs(X.s + (row ? 2.2 : -2.2)), dir > 0 ? -HP : HP); R.draw(mo.carNpc[(X.id + row) % 4], M); }
    }
    // esquinas: calles a izquierda y derecha hacia otras zonas, letreros de madera y flechas de giro
    for (const C of g.corners) {
      const z = zs(C.s); if (z < FAR - 10 || z > 40) continue;
      M4.trs(M, 0, 0, z); R.draw(mo.xroad, M);
      for (const sd of [-1, 1]) { const B = sd < 0 ? C.L : C.R, zz = zs(C.s - 8.5); M4.trs(M, sd * 4.7, 0, zz, sd < 0 ? 0 : Math.PI); R.draw(mo.signpost[B.n], M); M4.trs(M, sd * 4.7, 2.15, zz, 0, 0, 0, 0.3); R.draw(mo.gate[ZONES[B.z].bill], M); }
      if (!C.done) { const pulse = 0.8 + 0.2 * Math.sin(time * 6), CC = this.CA || (this.CA = { d: hex('#ffc23a'), o: hex('#39c8ff') }); for (let q = C.s - 46; q < C.s - 4; q += 8) { const zq = zs(q); if (zq < FAR || zq > 12) continue; M4.trs(M, LX(0), 0, zq, 0.55, 0, 0, pulse); R.draw(mo.chev, M, ONE, CC.o, 1); M4.trs(M, LX(3), 0, zq, -0.55, 0, 0, pulse); R.draw(mo.chev, M, ONE, CC.d, 1); } }
    }
    // bifurcaciones: separador con matas, letrero y la ruta de entregas marcada con flechas
    const CA = this.CA || (this.CA = { d: hex('#ffc23a'), o: hex('#39c8ff') });
    for (const f of g.forks) {
      const z0 = zs(f.a); if (z0 < FAR - 300 || zs(f.b) > 14) continue;
      if (z0 > FAR && z0 < 30) { M4.trs(M, 0, 0, zs(f.a - 4)); R.draw(mo.forkSign, M); }
      const dx = f.dl ? 1.6 : -1.6, pulse = 0.75 + 0.25 * Math.sin(time * 6);
      for (let q = f.a - 36; q < f.b; q += 9) { const zq = zs(q); if (zq < FAR || zq > 12) continue; M4.trs(M, dx, 0, zq, 0, 0, 0, pulse); R.draw(mo.chev, M, ONE, CA.d, 1); if (q < f.a) { M4.trs(M, -dx, 0, zq, 0, 0, 0, 0.8); R.draw(mo.chev, M, ONE, CA.o, 1); } }
      for (const sd of [-1, 1]) { const zz = zs(f.a - 14); if (zz > FAR && zz < 14) { M4.trs(M, sd * 1.6, 3.6 + Math.sin(time * 3) * 0.15, zz, time * 2, 0, 0, 0.42); R.draw(mo.cube, M, ONE, (sd > 0) === !!f.dl ? CA.d : CA.o, 1); } }
    }
    // parques: fuente, juegos infantiles, lago con patos, picnics, gente descansando y rampas de skate
    for (const p of g.parks) { const z = zs(p[0]); if (!(z > FAR - 200 && zs(p[1]) < 20)) continue;
      if (z > FAR && z < 20) { M4.trs(M, 0, 0, z); R.draw(mo.parkArch, M); M4.trs(M, 0, 0, zs(p[1])); R.draw(mo.parkArch, M); }
      let i = 0; for (let q = p[0] + 14; q < p[1] - 6; q += 24, i++) { const zq = zs(q); if (zq < FAR - 6 || zq > 18) continue;
        for (const sd of [-1, 1]) { const k = (i * 2 + (sd > 0 ? 1 : 0) + Math.floor(p[0])) % 6, ry = sd > 0 ? -Math.PI / 2 : Math.PI / 2, X = sd * 7.9;
          if (k === 0) { M4.trs(M, X, 0, zq); R.draw(mo.fountain, M); for (let j = 0; j < 2; j++) { M4.trs(M, X - sd * 2.2, 0.45, zq + (j ? 1.4 : -1.4), ry); R.draw(mo.sitter[(i + j) % 4], M); } }
          else if (k === 1) { M4.trs(M, sd * 8.9, 0, zq, ry); R.draw(mo.playground, M); M4.trs(M, sd * 6.5, 0, zq + 2.5, ry + Math.sin(time + i) * 0.5); R.draw(mo.runB[i % 4], M); }
          else if (k === 2) { M4.trs(M, sd * 10.2, 0, zq); R.draw(mo.pond, M); M4.trs(M, sd * 10.2 + Math.sin(time * 0.4 + i) * 1.4, 0.02, zq + Math.cos(time * 0.4 + i) * 2.2, time * 0.4 + i, 0, 0, 0.9); R.draw(mo.ducks, M); }
          else if (k === 3) { M4.trs(M, sd * 6.9, 0, zq, i); R.draw(mo.picnic[i % 3], M); for (let j = 0; j < 2; j++) { M4.trs(M, sd * 6.9 + (j ? 0.7 : -0.7), 0.04, zq + (j ? 0.4 : -0.3), j ? -1.2 : 1.6); R.draw(mo.sitter[(i + j + 1) % 4], M); } }
          else if (k === 4) { M4.trs(M, sd * 6.9, 0, zq, ry); R.draw(mo.quarter, M); }
          else { for (let j = 0; j < 3; j++) { M4.trs(M, sd * (6.1 + j * 0.8), 0, zq + j * 0.7, sd > 0 ? Math.PI * 0.8 : -Math.PI * 0.2); R.draw(mo.person[(i + j) % 4], M); } } } } }
    // obstáculos (los modelos de carril se estrechan a 0,8 para carriles de 1,6 m)
    for (const o of g.obs) {
      if (!o.alive && !o.fly) continue;
      const z = zs(o.s); if (z < FAR - o.hd || z > 14 + o.hd) continue;
      let m, kx = this.NEWO.has(o.t) ? 1 : 0.8, ry = 0;
      if (o.t === 'branch') { if (!o.vis) continue; M4.trs(M, 0, 0, z); R.draw(this.branch(o.vis), M); continue; }
      if (o.t === 'gate' && !o.fly) { M4.trs(M, o.x, 0, z, 0, 0, 0, 0.8, 1, 1); R.draw(mo.gatepost, M); M4.trs(M, o.x, gateY(o, g.t), z, 0, 0, 0, 0.8, 1, 1); R.draw(mo.gatebar, M); continue; }
      if (o.t === 'pad') { if (!o.used) for (const dz of [-0.9, 0.9]) { M4.trs(M, o.x, 0, z + dz, 0, 0, 0, 0.9 + 0.1 * Math.sin(time * 9 + dz)); R.draw(mo.chev, M, ONE, this.CA.o, 1); } continue; }
      if (o.t === 'wall' || o.t === 'rail' || o.t === 'median') { const sm = o.t === 'wall' ? (o.st ? (o.adj ? mo.hedgeseg : mo.bedseg) : mo.wallseg) : o.t === 'median' ? mo.medseg : mo.railseg, a0 = o.s - o.hd, a1 = o.s + o.hd; for (let k = Math.max(0, Math.floor((P.s - 12 - a0) / 4)); a0 + 4 * k < a1 && a0 + 4 * k < P.s - FAR; k++) { M4.trs(M, o.x, 0, zs(a0 + 4 * k + 2)); R.draw(sm, M); } continue; }
      if (o.T.moving && !o.fly) {
        const yaw = o.u < 0 ? Math.PI : 0;
        if (o.t === 'car') { M4.trs(M, o.x, 0, z, yaw, 0, 0, 0.95, 1, 1); R.draw(mo.carNpc[o.col], M); }
        else if (o.nk === 5) { M4.trs(M, o.x, 0, z, yaw); R.draw(mo.motoNpc[o.col], M); }
        else if (o.nk === 0) { M4.trs(M, o.x, 0, z, yaw, 0, 0, 0.9); R.draw(mo.npc[o.col], M); }
        else {
          const sk = o.nk === 2, wk = o.nk === 3, ph = time * (sk ? 5 : wk ? 5.5 : 10) + o.R, am = wk ? 0.4 : 0.75;
          M4.trs(M, o.x, 0, z, yaw); R.draw((sk ? mo.skB : mo.runB)[o.col], M);
          for (const sx of [-1, 1]) { const a = Math.sin(ph) * sx; M4.trs(this.A, sx * 0.1, 0.95, 0, 0, sk ? 0.2 + 0.15 * a : am * a, sk ? sx * (0.12 + 0.18 * Math.max(0, a)) : 0); M4.mul(this.B, M, this.A); R.draw(sk ? mo.skL : mo.runL, this.B); }
        }
        continue;
      }
      if (o.t === 'truck') m = mo.truck[o.col || 0]; else if (o.t === 'stall') { m = mo.stall[o.v || 0]; kx = 1; } else if (o.t === 'person') { m = mo.person[o.v || 0]; kx = 1; ry = o.ry || 0; } else if (o.T.moving) m = o.t === 'car' ? mo.carNpc[o.col] : mo.npc[o.col]; else m = mo[o.t];
      if (!m) continue;
      if (o.fly) { const f = o.fly; f.t += dt; const t = f.t; M4.trs(M, o.x + f.vx * t, Math.max(0, f.vy * t - GRAV * 0.5 * t * t), z - f.vz * t, f.ry * t, f.rx * t, 0); }
      else M4.trs(M, o.x, 0, z, ry, 0, 0, kx, 1, 1);
      R.draw(m, M);
    }
    // entregas: buzones, casitas, muros para pósters y kioscos EMSAY
    const DC = this.DC || (this.DC = { per: hex('#f4f1e6'), rev: hex('#39c8ff'), cor: hex('#ffc23a'), pos: hex('#ff2fb3'), kio: hex('#2dffb3') });
    for (const d of g.dels) {
      const z = zs(d.s); if (z < FAR || z > 16) continue;
      const sd = d.side, HP = Math.PI / 2; if (d.done && d.ta == null) d.ta = time;
      const up = d.done ? clamp((time - d.ta - (d.T || 0)) / 0.25, 0, 1) : 0;
      if (d.obj === 'muro') { M4.trs(M, sd * 4.7, 0, z, sd > 0 ? 0 : Math.PI); R.draw(mo.posterWall, M); if (up > 0) { M4.trs(M, sd * 4.58, 1.45 * (1 - up), z, sd > 0 ? 0 : Math.PI, 0, 0, 1, up, 1); R.draw(mo.poster[d.v % 4], M); } }
      else if (d.obj === 'kiosko') { M4.trs(M, sd * 4.75, 0, z, sd > 0 ? -HP : HP); R.draw(mo.kiosk, M); M4.trs(M, sd * 4.75, 0, z + 1.5, sd > 0 ? -HP : HP); R.draw(mo.person[d.v % 4], M); if (up > 0) for (let i = 0; i < 2; i++) { M4.trs(M, sd * 3.75, 0.17 + i * 0.3 * up, z - 0.3 + i * 0.1, i * 0.4); R.draw(mo.bundle, M); } }
      else {
        M4.trs(M, sd * 4.35, 0, z, 0, 0, 0, sd, 1, 1); R.draw(mo.buzon, M);
        M4.trs(this.A, 0.12, 1.22, 0.27, 0, (1 - up) * HP, 0); M4.mul(this.B, M, this.A); R.draw(mo.flag, this.B);
        if (d.obj === 'casita') {
          R.draw(mo.house[d.v], M);
          M4.trs(this.A, 1.36, 0, 0.79, -up * 1.7, 0, 0); M4.mul(this.B, M, this.A); R.draw(mo.door, this.B);
          if (up > 0) {
            const k = clamp((time - d.ta - (d.T || 0)) / 0.35, 0, 1), wv = Math.sin(time * 9) * 0.5;
            M4.trs(this.A, 1.12, 0, 0.42, HP, 0, 0, 0.3 + 0.7 * k); M4.mul(this.B, M, this.A); R.draw(mo.resi[d.v], this.B);
            M4.trs(this.A, 0.22, 1.18, 0, 0, 0, -0.45 + wv * 0.7); M4.mul(this.C, this.B, this.A); R.draw(mo.rarm, this.C);
          }
        }
      }
      if (!d.done && !d.miss) { M4.trs(M, sd * 4.35, 3.3 + Math.sin(time * 6) * 0.15, z, time * 3, 0.6, 0, 0.3); R.draw(mo.cube, M, ONE, DC[d.k], 1); }
    }
    for (let i = this.proj.length - 1; i >= 0; i--) {
      const p = this.proj[i]; p.t += dt; const k = Math.min(1, p.t / p.T);
      if (k >= 1) { this.emit(8, p.x1, p.y1, p.s1, hex('#ffc23a'), 3, 0.07, 0.5, 2.5); this.proj.splice(i, 1); continue; }
      M4.trs(M, lerp(p.x0, p.x1, k), lerp(p.y0, p.y1, k) + 1.1 * 4 * k * (1 - k), zs(lerp(p.s0, p.s1, k)), time * 12, 0, time * 7); R.draw(mo[p.m] || mo.mag, M);
    }
    // animalitos que cruzan
    for (const c of g.crs) {
      const z = zs(c.s); if (z < FAR || z > 12 || (c.done && Math.abs(c.x) > 6)) continue;
      const run = c.t0 >= 0 ? 1 : 0, b = Math.abs(Math.sin(time * 12)) * 0.1 * run;
      if (c.kind === 'duck') { M4.trs(M, c.x, b * 0.3, z, c.dir > 0 ? 0 : Math.PI); R.draw(mo.ducks, M); }
      else { const dg = c.kind === 'dog'; M4.trs(M, c.x, b, z, c.dir > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0, dg ? 1.1 : 1); R.draw(dg ? mo.dogA : mo.catA, M); M4.trs(this.A, 0, dg ? 0.5 : 0.4, 0.26, Math.sin(time * 12) * 0.6, 0, 0); M4.mul(this.B, M, this.A); R.draw(dg ? mo.dogT : mo.catT, this.B); }
    }
    // rival de turno
    if (g.riv) { const Rv = g.riv, z = zs(Rv.s); if (z > FAR && z < 14) { const ph = time * 5 + Rv.i, c = Rv.i % 4; M4.trs(M, Rv.x, Rv.y, z); R.draw(mo.skB[c], M); for (const sx of [-1, 1]) { const a = Math.sin(ph) * sx; M4.trs(this.A, sx * 0.1, 0.95, 0, 0, 0.2 + 0.15 * a, sx * (0.12 + 0.18 * Math.max(0, a))); M4.mul(this.B, M, this.A); R.draw(mo.skL, this.B); } M4.trs(M, Rv.x, Rv.y + 2.35, z, time * 2, 0.6, 0, 0.24); R.draw(mo.cube, M, ONE, (this.rc || (this.rc = RIV.map(r => hex(r[1]))))[Rv.i], 1); } }
    // policía o perro que te persigue
    if (g.pol && mode === 'play') {
      const c = g.pol, zc = Math.min(c.d, 30); this.polX = lerp(this.polX == null ? P.x : this.polX, P.x, Math.min(1, dt * 2.5));
      if (c.k === 'pol') { M4.trs(M, this.polX, 0, zc); R.draw(mo.policia, M, ONE, Math.floor(time * 8) % 2 ? this.pc1 || (this.pc1 = [1.7, 0.3, 0.3]) : this.pc2 || (this.pc2 = [0.3, 0.5, 1.9]), 1); }
      else { M4.trs(M, this.polX, Math.abs(Math.sin(time * 14)) * 0.12, zc, 0, 0, 0, 1.1); R.draw(mo.dogA, M); M4.trs(this.A, 0, 0.5, 0.26, Math.sin(time * 12) * 0.6, 0, 0); M4.mul(this.B, M, this.A); R.draw(mo.dogT, this.B); }
    } else this.polX = null;
    // monedas y objetos
    const spin = time * 4;
    for (const c of g.coins) { if (!c.alive) continue; const z = zs(c.s); if (z < -125 || z > 8) continue; M4.trs(M, c.x, c.y, z, spin + c.s * 0.2); R.draw(mo.coin, M); }
    for (const it of g.items) {
      if (!it.alive) continue; const z = zs(it.s); if (z < -140 || z > 8) continue;
      const y = it.y + Math.sin(time * 3 + it.s) * 0.12;
      M4.trs(M, it.x, y, z, time * 2, 0, 0, it.k === 'glide' ? 0.55 : 1); R.draw(it.k === 'letter' ? mo.letter[it.ch] || mo.clue : mo[it.k], M);
      M4.trs(M, it.x, y, z, 0, 0, time * 1.5); R.draw(mo.halo[it.k], M);
    }
    this.drawPlayer(g, time, dt);
    this.wild(g, mode, time, dt);
    // mascota que corre al lado
    if (this.petK && this.pl.pet && P.alive) {
      const sd = mode === 'garage' ? 1 : g.petSide, pk = this.petK, py = P.air ? (P.gy || 0) : P.y; this.petX = lerp(this.petX == null ? P.x + sd : this.petX, P.x + sd * 0.95, Math.min(1, dt * 8));
      if (pk === 'm3') { const f = Math.sin(time * 16) * 0.8; M4.trs(M, this.petX * 0.9 + sd * 0.1, P.y + 2.05 + Math.sin(time * 3) * 0.12, 0.25, 0, 0, 0, 1.3); R.draw(this.pl.pet, M); M4.trs(this.A, 0.08, 0.05, 0, 0, 0, f); M4.mul(this.B, M, this.A); R.draw(this.pl.ptail, this.B); M4.trs(this.A, -0.08, 0.05, 0, 0, 0, -f, -1, 1, 1); M4.mul(this.B, M, this.A); R.draw(this.pl.ptail, this.B); }
      else { const run = mode === 'garage' ? 0.3 : 1, ph = time * 14, b = Math.abs(Math.sin(ph)) * 0.12 * run; M4.trs(M, this.petX, py + b, 0.3, 0, Math.sin(ph) * 0.12 * run, 0, 1.15); R.draw(this.pl.pet, M); M4.trs(this.A, 0, 0.5, 0.26, Math.sin(time * 12) * 0.6, 0, 0); M4.mul(this.B, M, this.A); R.draw(this.pl.ptail, this.B); }
    }
    // partículas
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i]; p.life -= dt; if (p.life <= 0) { this.parts.splice(i, 1); continue; }
      p.vy -= 9 * p.gr * dt; p.x += p.vx * dt; p.y = Math.max(0.02, p.y + p.vy * dt); p.s += p.vs * dt;
      const k = p.sz * (0.4 + 0.6 * p.life / p.max); M4.trs(M, p.x, p.y, zs(p.s), 0, 0, 0, k * p.sx, k, k * p.sz2); R.draw(mo.cube, M, ONE, p.col, 1);
    }
    if ((P.turbo > 0 || P.boost > 0.4) && mode === 'play') for (let i = 0; i < (P.turbo > 0 ? 3 : 1); i++) this.parts.push({ x: P.x + (Math.random() - 0.5) * 9, y: Math.random() * 5, s: P.s + 6 + Math.random() * 12, vx: 0, vy: 0, vs: 0, life: 0.12, max: 0.12, col: hex('#ffffff'), sz: 0.05, gr: 0, sx: 1, sz2: 40 });
    if (mode === 'play' && P.brake && P.v > 4 && !P.air && Math.random() < 0.7) this.emit(1, P.x + (Math.random() - 0.5) * 0.3, 0.06, P.s - 0.25, hex(g.veh.kind === 'h' ? '#cfc4a8' : '#ffd27a'), 1.5, g.veh.kind === 'h' ? 0.1 : 0.05, 0.35, 1);
    // sombras
    R.blend(true, 0.42);
    for (const o of g.obs) { if (!o.alive || o.fly || o.T.moving || o.T.ground || o.y1 < 0.5 || o.t === 'wall' || o.t === 'median' || o.t === 'rail' || o.t === 'branch' || o.t === 'scaff') continue; const z = zs(o.s); if (z < -70 || z > 10) continue; M4.trs(M, o.x + 0.25, 0, z - 0.2, 0, 0, 0, o.hw * 2.6, 1, Math.min(o.hd, 3) * 2.6); R.draw(mo.shadow, M, ONE, ONE, 0); }
    for (const c of g.crs) { if (c.done) continue; const z = zs(c.s); if (z > -60 && z < 10) { M4.trs(M, c.x, 0, z, 0, 0, 0, c.kind === 'duck' ? 2 : 0.9, 1, 0.8); R.draw(mo.shadow, M, ONE, ONE, 0); } }
    if (g.riv) { const z = zs(g.riv.s); if (z > -70 && z < 10) { M4.trs(M, g.riv.x, 0, z, 0, 0, 0, 1, 1, 1.6); R.draw(mo.shadow, M, ONE, ONE, 0); } }
    M4.trs(M, P.x, (P.gy || 0), 0, 0, 0, 0, 1.1 / (1 + Math.max(0, P.y - (P.gy || 0)) * 0.4)); R.draw(mo.shadow, M, ONE, ONE, 0);
    for (const o of g.obs) if (o.T.moving && o.alive && !o.fly) { const z = zs(o.s); if (z > -80 && z < 10) { M4.trs(M, o.x, 0, z, 0, 0, 0, 1.2, 1, 2); R.draw(mo.shadow, M, ONE, ONE, 0); } }
    R.blend(false);
  }
};
function ik(dy, dz) {
  const L = 0.42; let d = Math.hypot(dy, dz); d = Math.min(Math.max(d, 0.05), 2 * L * 0.999);
  const aT = Math.atan2(-dz, -dy), al = Math.acos(clamp(d / (2 * L), -1, 1)), be = Math.acos(clamp((2 * L * L - d * d) / (2 * L * L), -1, 1));
  return [aT + al, -(Math.PI - be)];
}

/* ---- RunRunZero/src/audio.js ---- */
/* ===== AUDIO · todo sintetizado con WebAudio (sin archivos) ===== */
const AU = {
  ctx: null, out: null, sg: null, mg: null, nb: null, sfxOn: 1, musOn: 1, playing: false, nextT: 0, stepN: 0, tempo: 116, zone: 0, combo: 0, comboT: 0, timer: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { return; }
    const c = this.ctx; this.out = c.createGain(); this.out.gain.value = 0.8; this.out.connect(c.destination);
    this.sg = c.createGain(); this.sg.gain.value = this.sfxOn ? 0.7 : 0; this.sg.connect(this.out);
    this.mg = c.createGain(); this.mg.gain.value = this.musOn ? 0.3 : 0; this.mg.connect(this.out);
    const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.nb = b;
    if (this.want) this.music(true);
  },
  set(sfx, mus) { this.sfxOn = sfx; this.musOn = mus; if (!this.ctx) return; const t = this.ctx.currentTime; this.sg.gain.setTargetAtTime(sfx ? 0.7 : 0, t, 0.03); this.mg.gain.setTargetAtTime(mus ? 0.3 : 0, t, 0.05); },
  tone(f, t, dur, type = 'square', vol = 0.15, f2 = 0, dest = null) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type;
    o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sg); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(t, dur, vol, fc, type = 'bandpass', dest = null, q = 1) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.nb; f.type = type; f.frequency.value = fc; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sg); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  },
  sfx(k) {
    const c = this.ctx; if (!c || !this.sfxOn || c.state !== 'running') return; const t = c.currentTime + 0.005;
    switch (k) {
      case 'coin': { if (t - this.comboT > 0.6) this.combo = 0; this.combo = Math.min(12, this.combo + 1); this.comboT = t; const f = 988 * Math.pow(1.0595, this.combo); this.tone(f, t, 0.07, 'triangle', 0.13); this.tone(f * 1.5, t + 0.05, 0.12, 'triangle', 0.11); break; }
      case 'jump': this.tone(220, t, 0.13, 'square', 0.07, 540); this.noise(t, 0.12, 0.05, 2500); break;
      case 'jump2': this.tone(330, t, 0.13, 'square', 0.07, 800); break;
      case 'land': this.tone(130, t, 0.09, 'sine', 0.16, 60); break;
      case 'duck': this.noise(t, 0.16, 0.08, 900, 'bandpass', null, 2); break;
      case 'lane': this.noise(t, 0.07, 0.035, 5000, 'highpass'); break;
      case 'stumble': this.tone(240, t, 0.1, 'square', 0.1, 150); this.tone(200, t + 0.1, 0.14, 'square', 0.09, 110); break;
      case 'crash': this.noise(t, 0.6, 0.38, 700, 'lowpass'); this.tone(170, t, 0.5, 'sawtooth', 0.14, 38); break;
      case 'smash': this.noise(t, 0.25, 0.22, 1600); this.tone(620, t, 0.18, 'square', 0.06, 180); break;
      case 'power': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, t + i * 0.06, 0.1, 'square', 0.07)); break;
      case 'pEnd': this.tone(784, t, 0.1, 'square', 0.06); this.tone(523, t + 0.09, 0.14, 'square', 0.06); break;
      case 'gift': [1319, 1568, 2093, 2637].forEach((f, i) => this.tone(f, t + i * 0.05, 0.16, 'triangle', 0.08)); break;
      case 'clue': [880, 1320, 1760].forEach((f, i) => this.tone(f, t + i * 0.02, 1.1, 'sine', 0.09)); break;
      case 'trick': this.tone(660, t, 0.08, 'square', 0.06, 990); this.tone(990, t + 0.07, 0.1, 'square', 0.05); break;
      case 'zone': [0, 4, 7, 12].forEach((s, i) => this.tone(392 * Math.pow(1.0595, s), t + i * 0.03, 0.5, 'triangle', 0.07)); break;
      case 'click': this.tone(1200, t, 0.03, 'square', 0.05); break;
      case 'revive': this.tone(300, t, 0.4, 'triangle', 0.12, 1200); break;
      case 'shield': this.noise(t, 0.3, 0.2, 3000); this.tone(1500, t, 0.3, 'sine', 0.1, 700); break;
      case 'pump': this.tone(260 + 520 * (this.pumpLv || 0), t, 0.05, 'square', 0.045, 380 + 620 * (this.pumpLv || 0)); break;
      case 'deliver': this.noise(t, 0.18, 0.08, 2200, 'bandpass', null, 1.5); this.tone(1319, t + 0.16, 0.18, 'sine', 0.1); this.tone(1760, t + 0.24, 0.3, 'sine', 0.09); break;
      case 'dmiss': this.tone(240, t, 0.18, 'triangle', 0.08, 150); break;
      case 'thunder': this.noise(t, 1.6, 0.35, 180, 'lowpass'); this.noise(t + 0.05, 0.5, 0.2, 600, 'lowpass'); break;
      case 'near': this.noise(t, 0.12, 0.09, 3200, 'bandpass', null, 3); break;
      case 'grind': this.noise(t, 0.1, 0.07, 5200, 'bandpass', null, 6); break;
      case 'brake': this.noise(t, 0.16, 0.07, 2400, 'bandpass', null, 5); break;
      case 'combo': this.tone(880, t, 0.06, 'square', 0.05); this.tone(1320, t + 0.05, 0.09, 'square', 0.05); break;
      case 'siren': this.tone(700, t, 0.25, 'square', 0.06, 1000); this.tone(1000, t + 0.25, 0.25, 'square', 0.06, 700); break;
      case 'bark': this.tone(420, t, 0.07, 'sawtooth', 0.12, 260); this.tone(440, t + 0.14, 0.08, 'sawtooth', 0.12, 250); break;
      case 'warn': this.tone(990, t, 0.09, 'square', 0.07); this.tone(990, t + 0.16, 0.09, 'square', 0.07); break;
      case 'tut': this.tone(880, t, 0.12, 'sine', 0.1); break;
      case 'rank': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, t + i * 0.09, 0.22, 'square', 0.07)); break;
      case 'buy': this.tone(784, t, 0.08, 'square', 0.07); this.tone(1175, t + 0.07, 0.16, 'square', 0.07); break;
    }
  },
  rainOn(on) {
    if (!this.ctx) return; const c = this.ctx;
    if (!this.rainG) { const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.nb; s.loop = true; f.type = 'highpass'; f.frequency.value = 1400; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(this.sg); s.start(); this.rainG = g; }
    this.rainG.gain.setTargetAtTime(on ? 0.09 : 0, c.currentTime, 0.6);
  },
  music(on) {
    this.want = on; if (!this.ctx) return;
    if (on && !this.playing) { this.playing = true; this.nextT = this.ctx.currentTime + 0.1; this.stepN = 0; this.timer = setInterval(() => this.sched(), 30); }
    else if (!on && this.playing) { this.playing = false; clearInterval(this.timer); this.timer = null; }
  },
  /* guitarra con distorsión: quinta + octava en diente de sierra → saturación → pasa-bajos */
  gtr(f, t, dur, vol, mute) {
    const c = this.ctx;
    if (!this.dist) { const ws = c.createWaveShaper(), n = 256, cv = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; cv[i] = Math.tanh(x * 7); } ws.curve = cv; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2800; const og = c.createGain(); og.gain.value = 0.2; ws.connect(lp); lp.connect(og); og.connect(this.mg); this.dist = ws; }
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006);
    if (mute) g.gain.exponentialRampToValueAtTime(0.0001, t + dur); else { g.gain.setValueAtTime(vol, t + dur * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
    g.connect(this.dist);
    for (const m of [1, 1.498, 2.005]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * m; o.connect(g); o.start(t); o.stop(t + dur + 0.02); }
  },
  /* bajo/sintetizador con filtro que se abre y cierra */
  pluck(f, t, dur, vol, fc, type = 'sawtooth') {
    const c = this.ctx, o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain(); o.type = type; o.frequency.value = f;
    fl.type = 'lowpass'; fl.Q.value = 7; fl.frequency.setValueAtTime(fc, t); fl.frequency.exponentialRampToValueAtTime(Math.max(120, fc * 0.18), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(this.mg); o.start(t); o.stop(t + dur + 0.02);
  },
  sirenOn(on) {
    if (!this.ctx) return; const c = this.ctx;
    if (!this.sirG) { const o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain(); o.type = 'square'; o.frequency.value = 760; l.frequency.value = 2.2; lg.gain.value = 180; l.connect(lg); lg.connect(o.frequency); g.gain.value = 0; o.connect(g); g.connect(this.sg); o.start(); l.start(); this.sirG = g; }
    this.sirG.gain.setTargetAtTime(on ? 0.035 : 0, c.currentTime, 0.15);
  },
  /* banda sonora: rock (guitarras y batería) y electrónica (bombo a negras, bajo y arpegios); en «mezcla» alterna por edición */
  sched() {
    const c = this.ctx; if (!c || c.state !== 'running') return;
    const mix = this.style || 'mix', rock = mix === 'rock' || (mix === 'mix' && this.inPlay && this.zone % 2 === 0), mg = this.mg, ST = 1.0595;
    const bpm = rock ? 132 + (this.tempo - 112) * 1.3 : 120 + (this.tempo - 112) * 0.7;
    const RP = [[0, 3, 5, 8], [0, 8, 3, 10], [0, 5, 3, 7], [0, 10, 8, 5]], EP = [[0, 8, 3, 10], [0, 5, 8, 7], [0, 3, 10, 5], [0, 7, 8, 10]], KEY = [0, 2, -2, 3, 5, -3, 1];
    const RIFF = [0, -1, 3, 5, -1, 7, 5, 3, 0, -1, 10, 7, 5, -1, 3, 5], ARP = [0, 7, 12, 15, 12, 7, 19, 12, 0, 7, 12, 15, 24, 19, 15, 12];
    while (this.nextT < c.currentTime + 0.15) {
      const n = this.stepN, s = n % 16, bar = Math.floor(n / 16), b4 = bar % 4, sect = Math.floor(bar / 8), t = this.nextT, key = KEY[(this.zone + sect) % 7], fill = b4 === 3 && s >= 12;
      if (rock) {
        const root = 82.41 * Math.pow(ST, key + RP[this.zone % 4][b4]);
        if ([0, 6, 8, 10].includes(s) && !fill) { this.tone(165, t, 0.13, 'sine', 0.55, 45, mg); this.noise(t, 0.03, 0.1, 3000, 'highpass', mg); }
        if (s === 4 || s === 12 || fill) { this.noise(t, fill ? 0.09 : 0.17, fill ? 0.16 : 0.24, 1900, 'bandpass', mg, 0.8); this.tone(200, t, 0.09, 'triangle', 0.13, 120, mg); }
        if (s % 2 === 0) this.noise(t, s % 8 === 6 ? 0.12 : 0.04, 0.05, 8000, 'highpass', mg);
        if (s === 0 || s === 8) this.gtr(root, t, 60 / bpm * 0.9, 0.5, false);
        else if (s % 2 === 0 || s === 3 || s === 11) this.gtr(root, t, 0.09, 0.42, true);
        if (s % 2 === 0) this.pluck(root / 2, t, 0.2, 0.22, 500, 'sawtooth');
        if (sect % 2 === 1 && RIFF[s] >= 0 && (b4 === 1 || b4 === 3)) this.tone(root * 4 * Math.pow(ST, RIFF[s]), t, 0.13, 'square', 0.035, 0, mg);
      } else {
        const root = 55 * Math.pow(ST, key + EP[this.zone % 4][b4]), drop = sect % 4 !== 3 || b4 < 2;
        if (s % 4 === 0 && drop) this.tone(170, t, 0.16, 'sine', 0.6, 40, mg);
        if ((s === 4 || s === 12) && drop) { this.noise(t, 0.13, 0.17, 1500, 'bandpass', mg, 0.7); this.noise(t + 0.012, 0.1, 0.1, 2400, 'bandpass', mg, 0.7); }
        if (s % 4 === 2) this.noise(t, 0.09, 0.07, 9000, 'highpass', mg); else if (s % 2 === 1) this.noise(t, 0.025, 0.035, 9500, 'highpass', mg);
        if (s % 4 !== 0) this.pluck(root * (s % 8 === 6 ? 2 : 1), t, 0.17, 0.2, 900 + 500 * Math.sin(n * 0.05), 'sawtooth');
        this.pluck(root * 4 * Math.pow(ST, ARP[(s + b4 * 4) % 16]), t, 0.14, s % 4 === 0 ? 0.035 : 0.06, 2600 + 1400 * Math.sin(n * 0.02), 'square');
        if (s === 0) for (const iv of [0, 7, 15]) this.tone(root * 2 * Math.pow(ST, iv), t, 60 / bpm * 3.6, 'triangle', 0.035, 0, mg);
        if (!drop && s % 2 === 0) this.noise(t, 0.08, 0.02 + 0.012 * s, 2000 + 400 * s, 'bandpass', mg, 2);
        if (fill && drop) this.noise(t, 0.06, 0.13, 1800, 'bandpass', mg);
      }
      this.nextT += 60 / bpm / 4; this.stepN++;
    }
  }
};

MC.RunScooter = { version: "5b2f85d", RUNV, R, RN, AU, MOD, VEH, VEHI, ZONES, newGame, step, input, aiThink, revive, makeAtlas, LX, NL, DT, HILLD: s => HILLD(s), GRAV };
})(typeof window !== 'undefined' ? window.MC : globalThis.MC);
