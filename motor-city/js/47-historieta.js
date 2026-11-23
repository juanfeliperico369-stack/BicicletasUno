/* =====================================================================
   VISTA «HISTORIETA» (5.0 · G5-01 · Gemini Antigravity)
   Idea de GTA: Chinatown Wars en sala limpia:
   1. Perfil de cámara 'historieta' en js/34-camara.js: inclinada a ~55° (0.96 rad)
      desde arriba, que gira suave con el rumbo del carro (giraRumbo: true).
   2. Opción 'historieta' en ⚙️ Flexibilidad → 🖼️ Gráficos (js/37-flexibilidad.js).
   3. Contorno negro con casco invertido 3D (THREE.BackSide expandido en el plano
      horizontal con sesgo de profundidad en vista para no tapar techos CW) sobre
      las mallas dinámicas en three.js (sin tocar js/45-tres.js) + pase de colores
      planos (cel-shading en bandas) y contorno Sobel/Roberts en tinta negra
      (#0c0e14) legible a 412 px.
   ===================================================================== */
const Historieta = {
  version: '5.0.0-g5-01',
  umbralBorde: 44,
  umbralTintaFuerte: 98,
  bandasCel: 4,
  saturacion: 1.25,
  grosorCasco: .18,
  _lum: null,
  _bufOrig: null,
  _cvProc: null,
  _ctxProc: null,
  metricas: {
    activo: false,
    cascoTres: false,
    pixelesContorno: 0,
    pctContorno: 0,
    coloresPlanos: 0,
    msUltimoCuadro: 0
  },

  /* Determina si el modo Historieta está activo por ⚙️ Gráficos o por perfil de cámara */
  activo(E) {
    const porGraf = !!(MC.opciones && MC.opciones.graficos === 'historieta');
    const porCam = !!(E && E.camara && E.camara.perfil === 'historieta');
    return porGraf || porCam;
  },

  /* Crea el material de casco invertido 3D (THREE.BackSide) que expande la silueta horizontal sin tapar caras superiores CW */
  _crearMatCasco(T, grosor, sesgoZ) {
    const m = new T.MeshBasicMaterial({
      color: 0x0c0e14,
      side: T.BackSide,
      fog: true,
      polygonOffset: true,
      polygonOffsetFactor: 4,
      polygonOffsetUnits: 4
    });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\ntransformed.xz += normal.xz * ' + grosor.toFixed(3) + ';\ntransformed.y -= 0.04;'
        )
        .replace(
          '#include <project_vertex>',
          'vec4 mvPosition = vec4( transformed, 1.0 );\n#ifdef USE_BATCHING\n  mvPosition = batchingMatrix * mvPosition;\n#endif\n#ifdef USE_INSTANCING\n  mvPosition = instanceMatrix * mvPosition;\n#endif\nmvPosition = modelViewMatrix * mvPosition;\nmvPosition.z -= ' + sesgoZ.toFixed(3) + ';\ngl_Position = projectionMatrix * mvPosition;'
        );
    };
    return m;
  },

  /* Crea o actualiza el casco invertido 3D (THREE.BackSide) para vehículos y actores dinámicos en VistaTres sin tocar matCosas */
  aplicarCascoTres(vt, encender) {
    if (!vt || !vt.tres || typeof THREE === 'undefined') return false;
    const T = THREE;
    if (!encender || !vt.dyn || !vt.dyn.visible) {
      if (vt._cascoDyn) vt._cascoDyn.visible = false;
      this.metricas.cascoTres = false;
      return false;
    }

    if (!vt._cascoMat) {
      vt._cascoMat = this._crearMatCasco(T, this.grosorCasco, .95);
    }

    if (!vt._cascoDyn) {
      vt._cascoDyn = new T.Mesh(vt.dyn.geometry, vt._cascoMat);
      vt._cascoDyn.frustumCulled = false;
      vt._cascoDyn.castShadow = false;
      vt._cascoDyn.receiveShadow = false;
      vt.escena.add(vt._cascoDyn);
    } else if (vt._cascoDyn.geometry !== vt.dyn.geometry) {
      vt._cascoDyn.geometry = vt.dyn.geometry;
    }
    vt._cascoDyn.visible = true;
    this.metricas.cascoTres = true;
    return true;
  },

  /* 5.1 (Claude) · EL CONTORNO EN LA GPU. Antes todo el cuadro pasaba por la CPU (getImageData, Sobel y putImageData: unos 8 ms en
     un computador y varias veces más en un celular), y el borde salía del color: el grano de las fachadas y del suelo se llenaba
     de puntos negros. Ahora, con el 3D realista:
     - la escena se dibuja a una textura con su profundidad, y un solo pase en la GPU pone la tinta donde cambia la GEOMETRÍA:
       la profundidad guardada es lineal en 1/z, así que en un plano su laplaciano es cero; en una arista o una silueta no lo es
       (borde relativo a 1 − d, el mismo en todas las distancias), y se apaga con la niebla;
     - colores planos: la luz por bandas (4) y algo más de saturación; los muros y el suelo sin grano ni juntas (uPlano) y sin las
       texturas de fachada (paredes lisas, como Chinatown Wars). La CPU queda para el 3D clásico y el software. */
  gpu: true,
  _post: null,
  bandas: 5,
  umbralGeo: [.0032, .0115],
  umbralPrimera: [.012, .034],
  renderGPU(vt, r, esc, cam) {
    const T = THREE; let P = this._post;
    if (!P) P = this._post = this._crearPost(T);
    const sz = P.sz || (P.sz = new T.Vector2());
    r.getDrawingBufferSize(sz);
    const W = Math.max(4, sz.x | 0), H = Math.max(4, sz.y | 0);
    if (P.rt.width !== W || P.rt.height !== H) P.rt.setSize(W, H);
    const t0 = MC.ahora();
    r.setRenderTarget(P.rt); r.render(esc, cam); r.setRenderTarget(null);
    const u = P.mat.uniforms; u.tColor.value = P.rt.texture; u.tDepth.value = P.rt.depthTexture; u.uTexel.value.set(1 / W, 1 / H);
    u.cNear.value = cam.near; u.cFar.value = cam.far; u.uNiebla.value.set(esc.fog ? esc.fog.near : 1e9, esc.fog ? esc.fog.far : 2e9);
    u.uBandas.value = this.bandas;
    const primera = !!vt._histPrimera;   /* en primera persona la calzada va al ras: zona muerta quita rayas cebra de cuantización */
    const um = primera ? this.umbralPrimera : this.umbralGeo;
    u.uUmbral.value.set(um[0], um[1]);
    u.uRasante.value.set(primera ? 8.5e-5 : 0.0, primera ? 2.4e-3 : 1e-7);
    r.render(P.escena, P.cam);
    this.metricas.gpu = true; this.metricas.msUltimoCuadro = +(MC.ahora() - t0).toFixed(2);
  },
  _crearPost(T) {
    const rt = new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType, depthBuffer: true });
    rt.depthTexture = new T.DepthTexture(4, 4); rt.depthTexture.type = T.UnsignedIntType;
    const mat = new T.ShaderMaterial({
      uniforms: { tColor: { value: null }, tDepth: { value: null }, uTexel: { value: new T.Vector2() }, cNear: { value: .3 }, cFar: { value: 9000 }, uNiebla: { value: new T.Vector2(1e9, 2e9) }, uBandas: { value: 5 }, uUmbral: { value: new T.Vector2(.0032, .0115) }, uRasante: { value: new T.Vector2(0, 1e-7) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `#include <packing>
        uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 uTexel; uniform float cNear; uniform float cFar; uniform vec2 uNiebla; uniform float uBandas; uniform vec2 uUmbral; uniform vec2 uRasante;
        varying vec2 vUv;
        float prof(vec2 q){ return texture2D(tDepth, q).x; }
        void main(){
          /* el color, suavizado en cruz antes de las bandas (sin esto el grano de la textura del suelo salta de banda en banda) */
          vec2 ex = vec2(uTexel.x, 0.0), ey = vec2(0.0, uTexel.y);
          vec3 c = (texture2D(tColor, vUv).rgb * 2.0 + texture2D(tColor, vUv - ex).rgb + texture2D(tColor, vUv + ex).rgb + texture2D(tColor, vUv - ey).rgb + texture2D(tColor, vUv + ey).rgb) / 6.0;
          /* la profundidad a 1,5 píxeles; en primera persona uRasante suprime escalones de cuantización en la calzada */
          vec2 px = ex * 1.5, py = ey * 1.5;
          float d0 = prof(vUv), dL = prof(vUv - px), dR = prof(vUv + px), dD = prof(vUv - py), dU = prof(vUv + py);
          float cielo0 = step(.9999995, d0), cieloV = step(.9999995, max(max(dL, dR), max(dD, dU)));
          float lx = max(0.0, abs(dL + dR - 2.0 * d0) - uRasante.x);
          float ly = max(0.0, abs(dD + dU - 2.0 * d0) - uRasante.x);
          float lap = (lx + ly) / max(1.0 - d0, uRasante.y);
          float borde = max(smoothstep(uUmbral.x, uUmbral.y, lap), cieloV) * (1.0 - cielo0);
          float z = -perspectiveDepthToViewZ(d0, cNear, cFar);
          borde *= 1.0 - smoothstep(uNiebla.x, uNiebla.y, z);
          /* bandas perceptuales (potencia 0.55) y tope de ganancia para que la noche siga siendo noche y las ventanas brillen */
          float l = dot(c, vec3(.2126, .7152, .0722));
          float t = pow(l / (1.0 + l), .55);
          float b = t * uBandas, fb = fract(b);
          float tq = (floor(b) + .42 + smoothstep(.84, 1.0, fb)) / uBandas;
          float ts = pow(clamp(tq, 0.0, .98), 1.818);
          float lq = ts / max(1e-3, 1.0 - ts);
          float gan = clamp(lq / max(l, 1e-4), .55, 1.45);
          vec3 plano = c * gan;
          float sat = mix(1.12, 1.26, smoothstep(.03, .18, l));
          plano = mix(vec3(dot(plano, vec3(.2126, .7152, .0722))), plano, sat);
          vec3 col = mix(c, max(plano, 0.0), .82 * (1.0 - cielo0));
          gl_FragColor = vec4(mix(col, vec3(.0032, .0042, .0068), borde * .94), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      depthTest: false, depthWrite: false
    });
    const escena = new T.Scene(), q = new T.Mesh(new T.PlaneGeometry(2, 2), mat); q.frustumCulled = false; escena.add(q);
    return { rt, mat, escena, cam: new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), sz: new T.Vector2() };
  },
  /* encender o apagar lo de la GPU en el 3D realista (colores planos, sin texturas de fachada, el pase propio) */
  _ponerTres(vt, on) {
    const gpu = on && this.gpu && vt.tres && typeof THREE !== 'undefined';
    vt.posRender = gpu ? (r, e, c) => { try { this.renderGPU(vt, r, e, c); } catch (err) { this.gpu = false; vt.posRender = null; r.setRenderTarget(null); r.render(e, c); } } : null;
    if (vt.uPlano) vt.uPlano.value = gpu ? 1 : 0;
    if (vt._fachadas) for (const f of Object.values(vt._fachadas)) if (f.material) f.material.visible = !gpu;
    return gpu;
  },

  /* Pase de colores planos (posterización cel-shading) y contorno negro Sobel/Roberts en búfer con willReadFrequently */
  procesarLienzo(g, W, H) {
    if (!g || !g.canvas || W < 16 || H < 16) return;
    const t0 = MC.ahora();
    const esc = Math.min(1, 360 / Math.min(W, H));
    const w = Math.max(64, Math.round(W * esc)), h = Math.max(64, Math.round(H * esc));
    if (!this._cvProc || this._cvProc.width !== w || this._cvProc.height !== h) {
      this._cvProc = document.createElement('canvas');
      this._cvProc.width = w;
      this._cvProc.height = h;
      this._ctxProc = this._cvProc.getContext('2d', { willReadFrequently: true });
    }
    const q = this._ctxProc;
    if (!q) return;
    q.globalCompositeOperation = 'copy';
    q.imageSmoothingEnabled = true;
    q.drawImage(g.canvas, 0, 0, w, h);

    let img;
    try { img = q.getImageData(0, 0, w, h); } catch (e) { return; }
    const d = img.data, nPx = w * h;
    if (!this._lum || this._lum.length < nPx) {
      this._lum = new Uint8Array(nPx);
      this._bufOrig = new Uint8ClampedArray(nPx * 4);
    }
    const L = this._lum, orig = this._bufOrig;
    orig.set(d);
    for (let p = 0, i = 0; p < nPx; p++, i += 4) {
      L[p] = (orig[i] * 77 + orig[i + 1] * 150 + orig[i + 2] * 29) >> 8;
    }

    const w4 = w << 2, umb = this.umbralBorde, span = Math.max(1, this.umbralTintaFuerte - umb);
    const sat = this.saturacion;
    let nContorno = 0, nPlanos = 0;

    for (let y = 1; y < h - 1; y++) {
      const fila = y * w;
      for (let x = 1; x < w - 1; x++) {
        const p = fila + x, i = p << 2;
        const l0 = L[p];
        const gx = Math.abs(L[p + 1] - L[p - 1]) + (Math.abs(L[p - w + 1] - L[p - w - 1]) >> 1) + (Math.abs(L[p + w + 1] - L[p + w - 1]) >> 1);
        const gy = Math.abs(L[p + w] - L[p - w]) + (Math.abs(L[p + w - 1] - L[p - w - 1]) >> 1) + (Math.abs(L[p + w + 1] - L[p - w + 1]) >> 1);
        const dc = (Math.abs(orig[i + 4] - orig[i - 4]) + Math.abs(orig[i + 5] - orig[i - 3]) + Math.abs(orig[i + w4] - orig[i - w4])) >> 2;
        const borde = gx + gy + dc;

        if (borde > umb) {
          nContorno++;
          const t = borde >= this.umbralTintaFuerte ? .94 : ((borde - umb) / span) * .94;
          const k = 1 - t;
          d[i] = (orig[i] * k + 12 * t) | 0;
          d[i + 1] = (orig[i + 1] * k + 14 * t) | 0;
          d[i + 2] = (orig[i + 2] * k + 20 * t) | 0;
        } else {
          nPlanos++;
          const lq = (((l0 + 22) / 52) | 0) * 52 + 18;
          const kLuz = l0 > 6 ? lq / l0 : 1;
          let r = orig[i] * kLuz, gg = orig[i + 1] * kLuz, b = orig[i + 2] * kLuz;
          r = lq + (r - lq) * sat;
          gg = lq + (gg - lq) * sat;
          b = lq + (b - lq) * sat;
          d[i] = ((clamp(r, 0, 255) | 0) & 240) + 8;
          d[i + 1] = ((clamp(gg, 0, 255) | 0) & 240) + 8;
          d[i + 2] = ((clamp(b, 0, 255) | 0) & 240) + 8;
        }
      }
    }
    q.putImageData(img, 0, 0);
    g.save();
    g.imageSmoothingEnabled = true;
    g.drawImage(this._cvProc, 0, 0, W, H);
    g.restore();

    this.metricas.pixelesContorno = nContorno;
    this.metricas.pctContorno = +(nContorno / Math.max(1, (w - 2) * (h - 2)) * 100).toFixed(2);
    this.metricas.coloresPlanos = nPlanos;
    this.metricas.msUltimoCuadro = +(MC.ahora() - t0).toFixed(2);
  }
};

/* Envolturas limpias sobre VistaTres y Vistas sin tocar js/45-tres.js */
if (typeof VistaTres !== 'undefined' && VistaTres.prototype) {
  if (VistaTres.prototype._ponerDinamico) {
    const _ponerDynOrig = VistaTres.prototype._ponerDinamico;
    VistaTres.prototype._ponerDinamico = function (D) {
      const r = _ponerDynOrig.call(this, D);
      Historieta.aplicarCascoTres(this, MC.opciones && MC.opciones.graficos === 'historieta');
      return r;
    };
  }
  if (VistaTres.prototype.dibujar) {
    const _dibTresOrig = VistaTres.prototype.dibujar;
    VistaTres.prototype.dibujar = function (W, H, E, op = {}) {
      const activo = Historieta.activo(E);
      this._histPrimera = !!(E && E.camara && E.camara.perfil === 'primera');
      this._histGPU = Historieta._ponerTres(this, activo);
      /* 5.1: sin subir el presupuesto de regiones (armar 95 de un golpe era un tirón de segundos al prender la vista) */
      return _dibTresOrig.call(this, W, H, E, op);
    };
  }
  if (VistaTres.prototype.liberar) {
    const _libTresOrig = VistaTres.prototype.liberar;
    VistaTres.prototype.liberar = function () {
      if (this._cascoDyn) {
        try { this.escena.remove(this._cascoDyn); } catch (e) {}
        this._cascoDyn = null;
      }
      return _libTresOrig.call(this);
    };
  }
}

if (typeof Vistas !== 'undefined' && Vistas.prototype) {
  const _hayGLOrig = Vistas.prototype.hayGL;
  Vistas.prototype.hayGL = function () {
    const gr = MC.opciones && MC.opciones.graficos;
    if (gr === 'historieta' && !this.glIntentado) {
      MC.opciones.graficos = 'realistas';
      const ok = _hayGLOrig.call(this);
      MC.opciones.graficos = 'historieta';
      return ok;
    }
    return _hayGLOrig.call(this);
  };

  const _dibujarVistasOrig = Vistas.prototype.dibujar;
  Vistas.prototype.dibujar = function (g, W, H, E, dt = 1 / 60) {
    const activo = Historieta.activo(E);
    Historieta.metricas.activo = activo;
    if (this.gl && this.gl.tres) {
      Historieta.aplicarCascoTres(this.gl, activo);
    }
    const ms = _dibujarVistasOrig.call(this, g, W, H, E, dt);
    if (activo && !(this.gl && this.gl.tres && this.gl._histGPU)) {   /* con la GPU (3D realista) ya está hecho; si no, la CPU */
      Historieta.metricas.gpu = false;
      Historieta.procesarLienzo(g, W, H);
    } else {
      Historieta.metricas.pixelesContorno = 0;
      Historieta.metricas.pctContorno = 0;
    }
    return ms;
  };
}

MC.Historieta = Historieta;
