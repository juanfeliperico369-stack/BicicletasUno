/* =====================================================================
   VISTA TRES (4.9) · el 3D realista con three.js (MIT, © three.js authors), sobre las mismas mallas del motor
   Pedido del autor: «los gráficos aún son básicos… haz la incrustación [de three.js] y todo lo demás».
   La geometría ya era rica (ventanas con marco, balcones, puertas, cornisas, techos a dos y cuatro aguas, tanques,
   árboles por especie, vehículos y modelos GLB); lo que la hacía ver básica era la luz. Aquí cambia la luz:
   - materiales físicos (MeshStandardMaterial) con el color de siempre, en espacio lineal y salida sRGB;
   - el SOL con sombras de verdad: un mapa de sombras que sigue a la cámara (los edificios sombrean la calle y a otros);
   - luz del cielo hemisférica (cielo arriba, rebote del suelo abajo) y reflejos suaves de un cielo pre-filtrado (PMREM);
   - exposición fílmica ACES, niebla del clima y un domo de cielo con el degradé de MC.Cielo;
   - de noche, las ventanas encendidas brillan (el canal aE de las mallas) y el resto se apaga con el sol;
   - grano procedural en los muros: las fachadas de ladrillo llevan sus juntas (sin texturas descargadas).
   Lo que no cambia: las regiones de 160 m, el relieve, las losas del suelo, el PVS, el recorte por cono y por niebla, y
   todas las mallas (VistaGL arma los datos; esta clase solo los dibuja). Sin WebGL2, o si algo falla, MC.Vistas vuelve
   al VistaGL de siempre; ⚙️ Flexibilidad → Gráficos deja elegir los clásicos en celulares modestos.
   ===================================================================== */
const LIN = (() => { const t = new Float32Array(256); for (let i = 0; i < 256; i++) t[i] = Math.pow(i / 255, 2.2); return t; })();
const linC = c => LIN[Math.max(0, Math.min(255, Math.round(c * 255)))];
class VistaTres extends VistaGL {
  static puede() {
    if (VistaTres._puede != null) return VistaTres._puede;
    try { VistaTres._puede = typeof THREE !== 'undefined' && typeof document !== 'undefined' && !!document.createElement('canvas').getContext('webgl2'); } catch (e) { VistaTres._puede = false; }
    return VistaTres._puede;
  }
  constructor(mundo, losas) {
    super(mundo, losas); this.tres = true;
    const T = THREE; this.cv = document.createElement('canvas'); this.cv.width = this.cv.height = 4;
    try { this.r = new T.WebGLRenderer({ canvas: this.cv, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch (e) { MC.falla('three', e); this.ok = false; return; }
    const r = this.r; this.gl = r.getContext(); this.ok = true;
    r.setPixelRatio(1); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.NeutralToneMapping || T.ACESFilmicToneMapping;   /* «Khronos PBR Neutral»: respeta los colores de la paleta */ r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
    this.escena = new T.Scene(); this.cam = new T.PerspectiveCamera(60, 1, .3, 9000);
    this.escena.fog = new T.Fog(0xc8d2dc, 300, 1500);
    this.hemi = new T.HemisphereLight(0xcfe0ff, 0x6e5f4c, 1.0);
    this.sol = new T.DirectionalLight(0xfff0dc, 3); this.sol.castShadow = true;
    const sh = this.sol.shadow; sh.mapSize.set(2048, 2048); sh.bias = -.0004; sh.normalBias = .5; sh.camera.near = 1; sh.camera.far = 1600;
    this.escena.add(this.hemi, this.sol, this.sol.target);
    /* el material de todas las mallas: color por vértice, luz física, ventanas que brillan de noche y grano en los muros */
    this.uNoche = { value: 0 }; this.uPlano = { value: 0 };   /* uPlano = 1: colores planos (vista Historieta): sin grano ni juntas */
    this.posRender = null;   /* 5.1: un pase propio después de la escena (la vista Historieta lo usa para el contorno en la GPU) */
    this._iniciarFachadas();
    const mat = this.matCosas = new T.MeshStandardMaterial({ vertexColors: true, roughness: .86, metalness: .02, envMapIntensity: .18 });
    mat.onBeforeCompile = s => {
      s.uniforms.uNoche = this.uNoche; s.uniforms.uPlano = this.uPlano;
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute float aE;\nvarying float vE;\nvarying vec3 vMundo;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvE = aE;\nvMundo = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uNoche;\nuniform float uPlano;\nvarying float vE;\nvarying vec3 vMundo;\nfloat hashM(vec3 p){ return fract(sin(dot(floor(p), vec3(12.9898, 78.233, 37.719))) * 43758.5453); }')
        .replace('#include <color_fragment>', `#include <color_fragment>
          {   /* grano del material y juntas del ladrillo en los muros (normal casi horizontal) */
            vec3 nW = normalize(cross(dFdx(vMundo), dFdy(vMundo)));
            float muro = 1.0 - smoothstep(.35, .6, abs(nW.y));
            float g = .94 + .06 * hashM(vMundo * 6.0);
            float ladr = step(.08, diffuseColor.r - diffuseColor.g) * step(diffuseColor.b, diffuseColor.g);
            float junta = muro * ladr * (1.0 - smoothstep(.0, .06, fract(vMundo.y * 4.0))) * .22;
            diffuseColor.rgb *= mix(mix(1.0, g, muro) * (1.0 - junta), 1.0, uPlano);
          }`)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n/* aE = 1: ventana encendida (luz cálida); aE parcial: lo que el clásico aclara de noche (carros, letreros) */\ntotalEmissiveRadiance += uNoche * (step(.9, vE) * vec3(1.0, .74, .38) * 2.2 + (1.0 - step(.9, vE)) * vE * diffuseColor.rgb * .5);');
    };
    /* el suelo: la losa del motor con grano fino (asfalto, andén) y manchas grandes, como en la calle de verdad */
    this._granoSuelo = sh => {
      sh.uniforms.uPlano = this.uPlano;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMundoS;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMundoS = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uPlano;\nvarying vec3 vMundoS;\nfloat hashS(vec2 p){ return fract(sin(dot(floor(p), vec2(127.1, 311.7))) * 43758.5453); }\nfloat ruidoS(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hashS(i), hashS(i + vec2(1, 0)), f.x), mix(hashS(i + vec2(0, 1)), hashS(i + 1.0), f.x), f.y); }')
        .replace('#include <map_fragment>', '#include <map_fragment>\n{ vec2 q = vMundoS.xz; float fino = .9 + .1 * hashS(q * 9.0), mancha = .9 + .14 * ruidoS(q * .07) + .05 * ruidoS(q * .6); diffuseColor.rgb *= mix(fino * mancha, 1.0, uPlano); }');
    };
    this.matLejos = new T.MeshLambertMaterial({ vertexColors: true });
    /* el domo del cielo (degradé de MC.Cielo, sin niebla) */
    const dg = new T.SphereGeometry(7000, 24, 12); dg.setAttribute('color', new T.BufferAttribute(new Float32Array(dg.attributes.position.count * 3), 3));
    this.domo = new T.Mesh(dg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false })); this.domo.renderOrder = -1; this.domo.frustumCulled = false; this.escena.add(this.domo);
    this.pmrem = new T.PMREMGenerator(r); this._envClave = '';
    this.dyn = null; this._dynCap = 0; this.lejosG = null; this.mvp = null;
  }
  /* ---------- datos de VistaGL, sin GL crudo ---------- */
  _vbo(arr) { return { d: arr, n: arr.length }; }
  _textura(L) { if (!L) return null; const T = THREE, t = new T.CanvasTexture(L); t.colorSpace = T.SRGBColorSpace; t.anisotropy = Math.min(8, this.r.capabilities.getMaxAnisotropy()); t.wrapS = t.wrapT = T.ClampToEdgeWrapping; return t; }
  _geo10(arr) {
    const T = THREE, f = arr instanceof Float32Array ? arr : new Float32Array(arr);
    for (let i = 6; i < f.length; i += 10) { f[i] = linC(f[i]); f[i + 1] = linC(f[i + 1]); f[i + 2] = linC(f[i + 2]); }
    const ib = new T.InterleavedBuffer(f, 10), g = new T.BufferGeometry();
    g.setAttribute('position', new T.InterleavedBufferAttribute(ib, 3, 0)); g.setAttribute('normal', new T.InterleavedBufferAttribute(ib, 3, 3));
    g.setAttribute('color', new T.InterleavedBufferAttribute(ib, 3, 6)); g.setAttribute('aE', new T.InterleavedBufferAttribute(ib, 1, 9));
    g.computeBoundingSphere(); return g;
  }
  /* Fachadas R1: superficies agrupadas por región y material. La malla original
     permanece debajo hasta que las dos texturas de cada familia estén listas. */
  _iniciarFachadas() {
    this._fachadas = {};
    if (!this.mundo.cfg || this.mundo.cfg.id !== 'medellin' || typeof Image === 'undefined') return;
    for (const [id, datos] of Object.entries(MC_FACHADAS_R1)) {
      const dia = new Image(), noche = new Image(), f = { datos, dia, noche, listo: false };
      this._fachadas[id] = f;
      const revisar = () => {
        if (f.listo || !dia.complete || !noche.complete || !dia.naturalWidth || !noche.naturalWidth) return;
        const T = THREE, textura = (imagen, tope) => {
          /* El original de 2048 queda en el repositorio; en la GPU, el albedo a 1024 y la emisión (solo ventanas) a 512:
             unos 7 MB por familia en vez de 11 (con mipmaps), pensando en celulares. */
          const lado = Math.min(tope, imagen.naturalWidth || tope), lienzo = document.createElement('canvas'); lienzo.width = lienzo.height = lado;
          lienzo.getContext('2d').drawImage(imagen, 0, 0, lado, lado);
          const t = new T.CanvasTexture(lienzo);
          t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping;
          t.anisotropy = Math.min(4, this.r.capabilities.getMaxAnisotropy());
          t.needsUpdate = true; return t;
        };
        f.albedo = textura(dia, 1024); f.emision = textura(noche, 512);
        f.material = new T.MeshStandardMaterial({ map: f.albedo, emissiveMap: f.emision,
          emissive: 0xffffff, emissiveIntensity: 0, roughness: .9, side: T.DoubleSide });
        this._cuartosR1(f.material, id, datos);
        f.listo = true; dia.onload = noche.onload = null; f.dia = f.noche = null; this._fachadasActualizar = true;
      };
      dia.onload = noche.onload = revisar;
      dia.src = datos.dia; noche.src = datos.noche;
    }
  }
  /* 5.2 · R8 (retomado por Claude): CUARTOS FALSOS detrás de las ventanas encendidas de noche («interior mapping», la idea de
     Joost van Dongen, 2008; código propio). Cada vano de la textura R1 mide 2,7 × 3 m (columnas × pisos del manifiesto): detrás
     de él se traza un rayo dentro de una caja de 2,7 × 3 × (3 a 5) m y se pinta lo que toca (pared del fondo con un cuadro o un
     mueble, piso de madera o baldosa, techo con su lámpara, paredes de los lados), con la luz de una lámpara en el techo. La
     máscara de la ventana (rejas y cortinas incluidas) sale de la textura de emisión; cada cuarto cambia de color, de hondo y de
     luz (cálida, blanca o el azul de un televisor) según su sitio. Solo con GPU media o alta y calidad > 0,35 (uCuartos); en gama
     baja y en la vista Historieta queda la ventana plana de siempre. */
  _cuartosR1(mat, id, datos) {
    const U = this.uCuartos || (this.uCuartos = { value: 0 });
    mat.customProgramCacheKey = () => 'fachadaR1:' + id;
    mat.onBeforeCompile = s => {
      s.uniforms.uCuartos = U; s.uniforms.uRejR1 = { value: new THREE.Vector2(datos.columnas || 4, datos.pisos || 4) };
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aTan;\nattribute float aSem;\nvarying vec3 vMundoF;\nvarying vec2 vTanF;\nvarying float vSemF;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMundoF = (modelMatrix * vec4(transformed, 1.0)).xyz; vTanF = aTan; vSemF = aSem;');
      s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>
uniform float uCuartos; uniform vec2 uRejR1; varying vec3 vMundoF; varying vec2 vTanF; varying float vSemF;
vec3 cuartoR1(vec2 uvc, vec3 pos) {
  vec3 T = normalize(vec3(vTanF.x, 0.0, vTanF.y)), N = vec3(-T.z, 0.0, T.x), rd = normalize(pos - cameraPosition); if (dot(N, rd) > 0.0) N = -N;
  float du = dot(rd, T), dv = rd.y, dw = max(dot(rd, -N), .06);
  vec2 cel = uvc * uRejR1, f = fract(cel) * vec2(2.7, 3.0), k = floor(cel);
  float s = fract(sin(vSemF * 91.7 + k.x * 12.9898 + k.y * 78.233) * 43758.5453), sb = fract(s * 7.13), sc = fract(s * 13.7), sd = fract(s * 3.71);
  float D = 3.0 + 2.0 * sb;
  vec3 pared = s < .55 ? vec3(.86, .79, .66) : s < .8 ? vec3(.62, .73, .8) : s < .92 ? vec3(.8, .62, .54) : vec3(.66, .78, .6);
  vec3 piso = sc < .5 ? vec3(.34, .2, .11) : vec3(.42, .4, .37), techo = vec3(.95, .93, .9);
  vec3 luz = sd < .14 ? vec3(.42, .58, 1.0) : sd < .6 ? vec3(1.0, .76, .48) : vec3(1.0, .93, .82);
  float tU = du > 0.0 ? (2.7 - f.x) / du : -f.x / min(du, -1e-4), tV = dv > 0.0 ? (3.0 - f.y) / dv : -f.y / min(dv, -1e-4), tW = D / dw;
  float t = min(min(tU, tV), tW); vec3 h = vec3(f.x + du * t, f.y + dv * t, dw * t); vec3 c;
  if (t == tW) { c = pared;
    c = mix(c, vec3(.22, .3, .42) + .45 * vec3(sc, s, sb), step(.45, sb) * step(abs(h.x - 1.35 - (sc - .5) * .6), .42) * step(abs(h.y - 1.8), .3));
    c = mix(c, pared * .42, step(h.y, .8) * step(abs(h.x - 1.35 + (s - .5) * .9), .75)); }
  else if (t == tV) c = dv > 0.0 ? techo : piso;
  else c = pared * .62;
  float dl = length(h - vec3(1.35, 2.85, D * .45));
  c *= luz * (.16 + 1.3 / (1.0 + dl * dl * .4));
  return c * (1.0 - .35 * h.z / D) * .74;
}`).replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
#ifdef USE_EMISSIVEMAP
  if (uCuartos > .5) { float masc = clamp(dot(emissiveColor.rgb, vec3(.3, .59, .11)) * 1.9, 0.0, 1.0);
    totalEmissiveRadiance = totalEmissiveRadiance * .3 + emissive * cuartoR1(vEmissiveMapUv, vMundoF) * masc * 1.05; }
#endif`);
    };
  }
  _tipoFachada(e, st, Z) {
    const clase = e.clase || '';
    if (['iglesia', 'invernadero', 'tanque', 'techo', 'parqueadero'].includes(clase)) return null;
    if (clase === 'comercio') return 'local_persiana';
    if (clase === 'torre' || e.h >= 27) return 'vidrio_torre';
    if (Z && Z.nombre === 'Ladera') return 'ladrillo_ladera';
    if (Z && Z.nombre === 'Centro' && !st.plano && e.h <= 12) return 'colonial_madera';
    if (e.h >= 15 || clase === 'edificio') return 'concreto';
    return 'revoque_colores';
  }
  _edificio(m, P, O, zb, e, st, detalle, Z) {
    const tipo = this._tipoFachada(e, st, Z), original = this._fachadas[tipo];
    const disponible = this._paredesR1 && detalle >= 2 && e.h >= 2.5 && original && original.listo &&
      (tipo !== 'local_persiana' || this._fachadas.ladrillo_ladera?.listo);
    if (!disponible) { super._edificio(m, P, O, zb, e, st, detalle, Z); return; }
    /* Se conservan cuerpo y cubierta, evitando ventanas procedurales encima del atlas. */
    m.edificio3d(P, O, zb, e, st, detalle, Z, 0, true);
    let area = 0;
    for (let i = 0; i < P.length; i += 2) {
      const j = (i + 2) % P.length; area += P[i] * P[j + 1] - P[j] * P[i + 1];
    }
    const lado = area > 0 ? 1 : -1;
    const muro = (id, x0, y0, x1, y1, abajo, alto, u0, u1, v0, v1) => {
      const f = this._fachadas[id]; if (!f || !f.listo || alto <= 0) return;
      const k = this._paredesR1[id] || (this._paredesR1[id] = { p: [], uv: [], t: [], s: [] });
      const x = [x0, x1, x1, x0], z = [y0, y1, y1, y0], y = [zb + abajo, zb + abajo, zb + abajo + alto, zb + abajo + alto];
      /* 5.2 · R8: la dirección del muro (hacia donde crece u) y una semilla por muro, para los cuartos falsos */
      const lt = Math.hypot(x1 - x0, y1 - y0) || 1, tx = (x1 - x0) / lt, tz = (y1 - y0) / lt, sem = Math.abs(Math.sin((x0 + O[0]) * 12.9898 + (y0 + O[1]) * 78.233) * 43758.5453) % 1;
      for (const a of [0, 1, 2, 0, 2, 3]) { k.p.push(x[a], y[a], z[a]); k.uv.push(a === 0 || a === 3 ? u0 : u1, a < 2 ? v0 : v1); k.t.push(tx, tz); k.s.push(sem); }
    };
    for (let i = 0; i < P.length; i += 2) {
      const j = (i + 2) % P.length, dx = P[j] - P[i], dy = P[j + 1] - P[i + 1], L = Math.hypot(dx, dy);
      if (L < 1) continue;
      const nx = dy / L * lado * .16, ny = -dx / L * lado * .16;
      const x0 = P[i] - O[0] + nx, y0 = P[i + 1] - O[1] + ny;
      const x1 = P[j] - O[0] + nx, y1 = P[j + 1] - O[1] + ny;
      const bajo = tipo === 'local_persiana' ? Math.min(3, e.h) : 0;
      if (bajo) muro(tipo, x0, y0, x1, y1, 0, bajo, 0, L / (2.7 * original.datos.columnas), 0, bajo / (3 * original.datos.pisos));
      const id = bajo ? 'ladrillo_ladera' : tipo, f = this._fachadas[id];
      if (f && f.listo) muro(id, x0, y0, x1, y1, bajo, e.h - bajo, 0, L / (2.7 * f.datos.columnas), 0, (e.h - bajo) / (3 * f.datos.pisos));
    }
  }
  _region(gx, gy, detalle) {
    this._paredesR1 = {};
    const T = THREE, d = super._region(gx, gy, detalle), grupo = new T.Group();
    { const f = new Float32Array(d.suelo.d), ib = new T.InterleavedBuffer(f, 8), g = new T.BufferGeometry();
      g.setAttribute('position', new T.InterleavedBufferAttribute(ib, 3, 0)); g.setAttribute('normal', new T.InterleavedBufferAttribute(ib, 3, 3)); g.setAttribute('uv', new T.InterleavedBufferAttribute(ib, 2, 6)); g.computeBoundingSphere();
      const mt = new T.MeshStandardMaterial({ map: d.tex, color: d.tex ? 0xffffff : 0x5e8c4a, roughness: 1, metalness: 0 }); mt.onBeforeCompile = this._granoSuelo; mt.customProgramCacheKey = () => 'sueloMC';
      const m = new T.Mesh(g, mt); m.receiveShadow = true; grupo.add(m); }
    if (d.cosas) { const m = new T.Mesh(this._geo10(d.cosas.d), this.matCosas); m.castShadow = m.receiveShadow = detalle >= 1; grupo.add(m); }
    for (const [id, datos] of Object.entries(this._paredesR1)) {
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(datos.p, 3));
      geo.setAttribute('uv', new T.Float32BufferAttribute(datos.uv, 2));
      geo.setAttribute('aTan', new T.Float32BufferAttribute(datos.t, 2)); geo.setAttribute('aSem', new T.Float32BufferAttribute(datos.s, 1));
      geo.computeVertexNormals(); geo.computeBoundingSphere();
      const pared = new T.Mesh(geo, this._fachadas[id].material);
      pared.userData.fachadaR1 = id; pared.receiveShadow = true; grupo.add(pared);
    }
    this._paredesR1 = null;
    this.escena.add(grupo); return { gx, gy, grupo, tex: d.tex, detalle };
  }
  _borrar(r) { if (!r || !r.grupo) return; this.escena.remove(r.grupo); r.grupo.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material !== this.matCosas && !Object.values(this._fachadas).some(f => f.material === o.material)) o.material.dispose(); }); if (r.tex) r.tex.dispose(); }
  liberar() { for (const r of this.regiones.values()) this._borrar(r); this.regiones.clear(); if (this.lejosG) { this.escena.remove(this.lejosG); this.lejosG.traverse(o => o.geometry && o.geometry.dispose()); this.lejosG = null; } this.lejos = null; }
  _lejosATres() { const T = THREE, G = new T.Group(); for (const B of this.lejos || []) { const m = new T.Mesh(this._geo10(B.d), this.matLejos); m.receiveShadow = false; m.userData = { cx: B.cx, cy: B.cy }; G.add(m); } this.lejosG = G; this.escena.add(G); }
  /* ---------- el cielo: domo, luces y reflejos según MC.Cielo ---------- */
  _cielo(S, fog, L) {
    const T = THREE, top = S.top, hor = S.hor, P = this.domo.geometry.attributes.position, Cc = this.domo.geometry.attributes.color, clave = [top, hor, fog].flat().map(v => Math.round(v * 40)).join(',');
    if (clave !== this._domoClave) { this._domoClave = clave;
      for (let i = 0; i < P.count; i++) { const t = P.getY(i) / 7000, k = t < 0 ? 0 : Math.pow(Math.min(1, t * 1.6), .65), a = t < -.02 ? fog : t < .04 ? [0, 1, 2].map(j => fog[j] + (hor[j] - fog[j]) * (t + .02) / .06) : [0, 1, 2].map(j => hor[j] + (top[j] - hor[j]) * k); Cc.setXYZ(i, linC(a[0]), linC(a[1]), linC(a[2])); }
      Cc.needsUpdate = true;
      this.escena.fog.color.setRGB(fog[0], fog[1], fog[2], T.SRGBColorSpace); this.r.setClearColor(this.escena.fog.color, 1);
    }
    /* reflejos: un cielo pre-filtrado, rehecho solo cuando el cielo cambia de verdad (día, tarde, noche) */
    const ce = Math.round((S.noche || 0) * 6) + ':' + Math.round(top[2] * 6);
    if (ce !== this._envClave && !MC.opciones.tresSinEnv) { this._envClave = ce; const esc = new T.Scene(); esc.add(new T.Mesh(this.domo.geometry, this.domo.material)); const viejo = this._envRT; this._envRT = this.pmrem.fromScene(esc, .04, 1, 20000); this.matCosas.envMap = this._envRT.texture; this.matCosas.needsUpdate = true; if (viejo) viejo.dispose(); }   /* el reflejo va por material (con scene.environment, three usa environmentIntensity y el suelo se teñía del azul del cielo) */
  }
  dibujar(W, H, E, op = {}) {
    if (this._fachadasActualizar) { for (const r of this.regiones.values()) this._borrar(r); this.regiones.clear(); this._fachadasActualizar = false; }
    if (!this.ok) return null; const T = THREE, C = E.camara, M = this.mundo, cal = E.calidad ?? 1, r = this.r;
    if (this.cv.width !== W || this.cv.height !== H) r.setSize(W, H, false);
    const ox = Math.round(C.ojo[0] / 2000) * 2000, oy = Math.round(C.ojo[1] / 2000) * 2000;
    if (!this.O || Math.abs(this.O[0] - ox) > 2500 || Math.abs(this.O[1] - oy) > 2500) { this.liberar(); this.O = [ox, oy, M.cota(ox, oy)]; }
    if (!this.lejos) { this._lejos(); this._lejosATres(); }
    /* las regiones a la vista (mismo plan que VistaGL: detalle por distancia y presupuesto de tiempo para construir) */
    const aerea = C.d && C.d.fijo, Da = aerea ? (C.distAerea || 60) : 0, fN = clamp(E.factorNiebla ?? 1, .5, 1);
    this._sinCabeza = C.perfil === 'primera';
    const R = this.R, radio = aerea ? clamp(Da * 2.3 + 50, 140, 640) : (380 + 520 * cal) * fN, cx = aerea ? C.blanco[0] : C.ojo[0], cy = aerea ? C.blanco[1] : C.ojo[1], quiero = new Map();
    for (let gy = Math.floor((cy - radio) / R); gy <= Math.floor((cy + radio) / R); gy++) for (let gx = Math.floor((cx - radio) / R); gx <= Math.floor((cx + radio) / R); gx++) { const d = Math.hypot((gx + .5) * R - cx, (gy + .5) * R - cy); if (d > radio + R) continue; quiero.set(gx + ',' + gy, d < 100 && cal > .7 ? 4 : d < 170 && cal > .5 ? 3 : d < 300 ? 2 : d < 600 ? 1 : 0); }
    for (const [k, rg] of this.regiones) if (!quiero.has(k)) { this._borrar(rg); this.regiones.delete(k); }
    const t0 = MC.ahora(), faltan = [...quiero].filter(([k, d]) => { const rg = this.regiones.get(k); return !rg || rg.detalle < d; }).sort((a, b) => { const [ax, ay] = a[0].split(',').map(Number), [bx, by] = b[0].split(',').map(Number); return Math.hypot((ax + .5) * R - cx, (ay + .5) * R - cy) - Math.hypot((bx + .5) * R - cx, (by + .5) * R - cy); });
    for (const [k, d] of faltan) { if (MC.ahora() - t0 > (op.presupuesto || 8) && this.regiones.size) break; const [gx, gy] = k.split(',').map(Number), viejo = this.regiones.get(k); if (viejo) this._borrar(viejo); const nr = this._region(gx, gy, d); this.regiones.set(k, nr); }
    this.pendientes = faltan.length;
    /* cámara */
    const O = this.O, e = [C.ojo[0] - O[0], C.ojo[2] - O[2], C.ojo[1] - O[1]], b = [C.blanco[0] - O[0], C.blanco[2] - O[2], C.blanco[1] - O[1]], cam = this.cam;
    cam.fov = (C.fov || 1) * 180 / Math.PI; cam.aspect = W / H; cam.near = .3; cam.far = 9000; cam.position.set(e[0], e[1], e[2]); cam.up.set(0, 1, 0); cam.lookAt(b[0], b[1], b[2]); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    this.domo.position.copy(cam.position);
    /* sol, cielo, niebla y noche (los mismos números que VistaGL) */
    const S = E.cielo, sol = S.sol, luz = sol.alt > -.05 ? [sol.x, Math.max(.15, sol.z), sol.y] : [.3, .8, .2], ll = Math.hypot(...luz), L = luz.map(v => v / ll), niebla = E.clima ? E.clima.niebla : 0, lluvia = E.clima ? E.clima.lluvia : 0;
    const fog = S.bruma, fr = aerea ? [Da * (1.55 - niebla * .5), Da * (2.25 - niebla * .6) + 40] : [radio * (.45 - niebla * .35), radio * (1.05 - niebla * .5) + 1500 * fN * fN * (1 - niebla) * (1 - lluvia * .5)];
    this.escena.fog.near = fr[0]; this.escena.fog.far = fr[1]; this._cielo(S, fog, L);
    const noche = S.noche || 0, dia = clamp(S.luzSol ?? .6, 0, 1), bajo = clamp(1 - L[1] * 1.8, 0, 1);
    this.uNoche.value = noche;
    for (const f of Object.values(this._fachadas)) if (f.material) f.material.emissiveIntensity = noche * 1.8;
    if (this.uCuartos) { const nv = GPU.perfil().nivel; this.uCuartos.value = noche > .05 && cal > .35 && nv !== 'baja' && nv !== 'software' && !this.uPlano.value ? 1 : 0; }   /* R8: los cuartos falsos */
    this.hemi.intensity = .2 + 1.35 * clamp(S.ambiente ?? .8, 0, 1.2) + .35 * dia * (1 - L[1]);   /* con el sol bajo (mañana y tarde) el cielo rellena más */ r.toneMappingExposure = 1.12 + .25 * noche;   /* la luz del cielo rellena las sombras (en la calle nunca son negras) */   /* de noche: luz de luna y de la ciudad, sin quedar a oscuras */ this.hemi.color.setRGB(.93 + S.top[0] * .07, .94 + S.top[1] * .06, .95 + S.top[2] * .05, T.SRGBColorSpace);   /* luz de cielo casi neutra: el azul ya lo pone el domo */ this.hemi.groundColor.setRGB(.55, .5, .43, T.SRGBColorSpace);   /* cielo poco saturado: las sombras no se vuelven azules */
    this.sol.intensity = 2.4 * dia * (1 - lluvia * .45) * (1 - niebla * .5); this.sol.color.setRGB(1, .97 - .28 * bajo, .9 - .5 * bajo, T.SRGBColorSpace);
    /* sombras: una caja que sigue a lo que se mira, alineada a la rejilla de texeles (no tiemblan al moverse) */
    const conSombra = cal > .42 && dia > .12 && sol.alt > .03; this.sol.castShadow = conSombra;
    if (conSombra) { const s = aerea ? clamp(Da * 1.3, 120, 420) : clamp(70 + 90 * cal, 90, 170), tam = cal > .74 ? 2048 : 1024, sc = this.sol.shadow.camera, paso = 2 * s / tam;
      if (this.sol.shadow.mapSize.x !== tam) { this.sol.shadow.mapSize.set(tam, tam); if (this.sol.shadow.map) { this.sol.shadow.map.dispose(); this.sol.shadow.map = null; } }
      sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s; sc.updateProjectionMatrix();
      const tx = Math.round((aerea ? b[0] : (e[0] + b[0]) / 2) / paso) * paso, ty = Math.round(b[1] / paso) * paso, tz = Math.round((aerea ? b[2] : (e[2] + b[2]) / 2) / paso) * paso;
      this.sol.target.position.set(tx, ty, tz); this.sol.position.set(tx + L[0] * 800, ty + L[1] * 800, tz + L[2] * 800); this.sol.target.updateMatrixWorld(); }
    /* recorte por niebla, PVS y cono (como VistaGL) */
    const fx = C.blanco[0] - C.ojo[0], fy = C.blanco[1] - C.ojo[1], fl = Math.hypot(fx, fy), rad = R * .75 + 30, finNiebla = fr[1] + rad, medio = Math.atan(Math.tan((C.fov || 1) / 2) * W / H) + .15, conCono = !aerea && fl > 1e-3;
    const pvs = !aerea && M.pvs && C.ojo[2] - M.cota(C.ojo[0], C.ojo[1]) < M.pvs.he ? M.pvs.desde(C.ojo[0], C.ojo[1]) : null; let porPVS = 0, dib = 0;
    for (const rg of this.regiones.values()) { const rx = (rg.gx + .5) * R - C.ojo[0], ry = (rg.gy + .5) * R - C.ojo[1], d = Math.hypot(rx, ry); let ve = d - rad <= finNiebla;
      if (ve && pvs && !pvs.ve((rg.gx + .5) * R, (rg.gy + .5) * R)) { ve = false; porPVS++; }
      if (ve && conCono && d > rad) { const f = (rx * fx + ry * fy) / fl, l = (-rx * fy + ry * fx) / fl; if (Math.abs(Math.atan2(l, f)) - Math.asin(Math.min(1, rad / d)) > medio) ve = false; }
      rg.grupo.visible = ve; if (ve) dib++; }
    if (this.lejosG) for (const m of this.lejosG.children) m.visible = Math.hypot(m.userData.cx - cx, m.userData.cy - cy) >= radio - 1100;
    this.recorte = { regiones: this.regiones.size, dibujadas: dib, porPVS, pvs: !!pvs };
    /* lo que se mueve: una malla por cuadro, reusando el búfer */
    const D = this._dinamico(E); this._ponerDinamico(D);
    if (this.posRender) this.posRender(r, this.escena, cam); else r.render(this.escena, cam);
    const mvp = new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); this.mvp = Float32Array.from(mvp.elements);
    return this.cv;
  }
  _ponerDinamico(D) {
    const T = THREE, n = D.length;
    if (!this.dyn || n > this._dynCap) { if (this.dyn) { this.escena.remove(this.dyn); this.dyn.geometry.dispose(); } this._dynCap = Math.max(20000, Math.ceil(n * 1.5 / 10) * 10); const g = this._geo10(new Float32Array(this._dynCap)); this.dyn = new T.Mesh(g, this.matCosas); this.dyn.castShadow = this.dyn.receiveShadow = true; this.dyn.frustumCulled = false; this.escena.add(this.dyn); }
    const ib = this.dyn.geometry.attributes.position.data, f = ib.array; for (let i = 0; i < n; i++) f[i] = D[i]; for (let i = 6; i < n; i += 10) { f[i] = linC(f[i]); f[i + 1] = linC(f[i + 1]); f[i + 2] = linC(f[i + 2]); }
    ib.needsUpdate = true; this.dyn.geometry.setDrawRange(0, n / 10); this.dyn.visible = n > 0;
  }
}
VistaTres.propio = true;
MC.VistaTres = VistaTres; MC.THREE = typeof THREE !== 'undefined' ? THREE : null;
