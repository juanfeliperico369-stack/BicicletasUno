/* =====================================================================
   PARALAJE DE BIOMAS PARA ARCADE (V4 · Gemini Antigravity — Motor City V4)
   Seis biomas (costa, desierto, bosque, montana, nieve, lagos) × 3 capas
   de paralaje (lejos 0.12, medio 0.35, cerca 0.70) en 1024 × 256 RGBA WebP.
   - Integrado con MC.Arcade sobre el mismo mundo 3D y carretera real.
   - Ciclo día/noche, bruma y niebla dinámicos desde cieloRetro(E).
   - Transiciones suaves entre biomas a lo largo de la carretera.
   - Caché LRU por bioma, reducción automática de calidad y respaldo procedural
     para llanura, ciudades o si falta cualquier textura.
   - Dirección visual Fase 3: lectura anticipada de curvas y sensación de velocidad.
   ===================================================================== */
const ParalajeBiomas = {
  version: '4.9.0-v4',
  autor: 'Gemini Antigravity — Motor City V4',
  activo: true,
  soloCarretera: false,
  maxBiomasCache: 2,
  VEL: { lejos: .12, medio: .35, cerca: .7 },
  NIVELES: ['lejos', 'medio', 'cerca'],
  BIOMAS: ['costa', 'desierto', 'bosque', 'montana', 'nieve', 'lagos'],
  MANIFIESTO: {"nombre":"Motor City V4 — Paisajes Paralaje por Bioma para MC.Arcade","autor":"Gemini Antigravity — Motor City V4","version":"4.9.0-v4","dimensiones":[1024,256],"formato":"image/webp (RGBA lossless)","velocidades":{"lejos":0.12,"medio":0.35,"cerca":0.7},"biomas":["costa","desierto","bosque","montana","nieve","lagos"],"fallback_biomas":["llanura"],"total_texturas":18,"total_bytes":553550,"total_kb":540.58,"texturas":{"costa_lejos":{"id":"costa_lejos","bioma":"costa","capa":"lejos","ruta":"arte/arcade/biomas/costa_lejos.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":38.5,"opacidad_pct":61.5,"costura_mae":0,"velocidad":0.12,"bytes":23708,"kb":23.15,"sha256_16":"6c65f3744bda1f19","color_medio_rgb":[83,133,156],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"costa_medio":{"id":"costa_medio","bioma":"costa","capa":"medio","ruta":"arte/arcade/biomas/costa_medio.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":56.9,"opacidad_pct":43.1,"costura_mae":0,"velocidad":0.35,"bytes":38248,"kb":37.35,"sha256_16":"37ee4ea2230f60df","color_medio_rgb":[104,136,92],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"costa_cerca":{"id":"costa_cerca","bioma":"costa","capa":"cerca","ruta":"arte/arcade/biomas/costa_cerca.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":71.7,"opacidad_pct":28.3,"costura_mae":0,"velocidad":0.7,"bytes":53156,"kb":51.91,"sha256_16":"7cc89551ebeab919","color_medio_rgb":[128,139,94],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"desierto_lejos":{"id":"desierto_lejos","bioma":"desierto","capa":"lejos","ruta":"arte/arcade/biomas/desierto_lejos.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":38,"opacidad_pct":62,"costura_mae":0,"velocidad":0.12,"bytes":29876,"kb":29.18,"sha256_16":"0f32ee979206de23","color_medio_rgb":[169,119,86],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"desierto_medio":{"id":"desierto_medio","bioma":"desierto","capa":"medio","ruta":"arte/arcade/biomas/desierto_medio.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":55.1,"opacidad_pct":44.9,"costura_mae":0,"velocidad":0.35,"bytes":27116,"kb":26.48,"sha256_16":"a235b20632085cad","color_medio_rgb":[189,138,86],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"desierto_cerca":{"id":"desierto_cerca","bioma":"desierto","capa":"cerca","ruta":"arte/arcade/biomas/desierto_cerca.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":77.8,"opacidad_pct":22.2,"costura_mae":0,"velocidad":0.7,"bytes":18300,"kb":17.87,"sha256_16":"c3ef90531ea8dcf6","color_medio_rgb":[150,120,73],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"bosque_lejos":{"id":"bosque_lejos","bioma":"bosque","capa":"lejos","ruta":"arte/arcade/biomas/bosque_lejos.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":31,"opacidad_pct":69,"costura_mae":0,"velocidad":0.12,"bytes":30058,"kb":29.35,"sha256_16":"6a0246181a43ebdb","color_medio_rgb":[68,111,97],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"bosque_medio":{"id":"bosque_medio","bioma":"bosque","capa":"medio","ruta":"arte/arcade/biomas/bosque_medio.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":56,"opacidad_pct":44,"costura_mae":0,"velocidad":0.35,"bytes":31290,"kb":30.56,"sha256_16":"d1b56e63573c48b9","color_medio_rgb":[54,99,60],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"bosque_cerca":{"id":"bosque_cerca","bioma":"bosque","capa":"cerca","ruta":"arte/arcade/biomas/bosque_cerca.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":72.7,"opacidad_pct":27.3,"costura_mae":0,"velocidad":0.7,"bytes":27824,"kb":27.17,"sha256_16":"236f3467dd11cafd","color_medio_rgb":[54,91,49],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"montana_lejos":{"id":"montana_lejos","bioma":"montana","capa":"lejos","ruta":"arte/arcade/biomas/montana_lejos.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":25.5,"opacidad_pct":74.5,"costura_mae":0,"velocidad":0.12,"bytes":37250,"kb":36.38,"sha256_16":"1a912edc6b78eeb9","color_medio_rgb":[90,101,114],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"montana_medio":{"id":"montana_medio","bioma":"montana","capa":"medio","ruta":"arte/arcade/biomas/montana_medio.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":51.7,"opacidad_pct":48.3,"costura_mae":0,"velocidad":0.35,"bytes":29752,"kb":29.05,"sha256_16":"8545a05a0268fc23","color_medio_rgb":[93,104,76],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"montana_cerca":{"id":"montana_cerca","bioma":"montana","capa":"cerca","ruta":"arte/arcade/biomas/montana_cerca.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":76.3,"opacidad_pct":23.7,"costura_mae":0,"velocidad":0.7,"bytes":27288,"kb":26.65,"sha256_16":"c6513bb0668a83f4","color_medio_rgb":[86,99,68],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"nieve_lejos":{"id":"nieve_lejos","bioma":"nieve","capa":"lejos","ruta":"arte/arcade/biomas/nieve_lejos.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":24.6,"opacidad_pct":75.4,"costura_mae":0,"velocidad":0.12,"bytes":37556,"kb":36.68,"sha256_16":"095bf5448dfbcddc","color_medio_rgb":[182,195,213],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"nieve_medio":{"id":"nieve_medio","bioma":"nieve","capa":"medio","ruta":"arte/arcade/biomas/nieve_medio.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":57.7,"opacidad_pct":42.3,"costura_mae":0,"velocidad":0.35,"bytes":34726,"kb":33.91,"sha256_16":"8a8f509fcdbc162e","color_medio_rgb":[181,194,207],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"nieve_cerca":{"id":"nieve_cerca","bioma":"nieve","capa":"cerca","ruta":"arte/arcade/biomas/nieve_cerca.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":79,"opacidad_pct":21,"costura_mae":0,"velocidad":0.7,"bytes":28586,"kb":27.92,"sha256_16":"c20b7cc05492086d","color_medio_rgb":[178,190,199],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"lagos_lejos":{"id":"lagos_lejos","bioma":"lagos","capa":"lejos","ruta":"arte/arcade/biomas/lagos_lejos.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":34.1,"opacidad_pct":65.9,"costura_mae":0,"velocidad":0.12,"bytes":26068,"kb":25.46,"sha256_16":"ac0ba97ef0851802","color_medio_rgb":[74,114,116],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"lagos_medio":{"id":"lagos_medio","bioma":"lagos","capa":"medio","ruta":"arte/arcade/biomas/lagos_medio.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":60.5,"opacidad_pct":39.5,"costura_mae":0,"velocidad":0.35,"bytes":23134,"kb":22.59,"sha256_16":"5e926edc3ea1a349","color_medio_rgb":[83,125,77],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"},"lagos_cerca":{"id":"lagos_cerca","bioma":"lagos","capa":"cerca","ruta":"arte/arcade/biomas/lagos_cerca.webp","ancho":1024,"alto":256,"alpha":true,"transparencia_pct":76.8,"opacidad_pct":23.2,"costura_mae":0,"velocidad":0.7,"bytes":29614,"kb":28.92,"sha256_16":"14d58c86d157914c","color_medio_rgb":[66,107,63],"licencia":"CC0-1.0 / Original Motor City V4 (Gemini Antigravity, sala limpia)"}}},
  /* 5.1 (Claude): las 18 imágenes ya no van escritas aquí: herramientas/construir.mjs las toma de arte/arcade/biomas/ (manifiesto.json)
     y las deja en MC_BIOMAS_V4 dentro de motor.js, igual que las fachadas R1. El código fuente pasa de 769 KB a unos 30. */
  DATA: typeof MC_BIOMAS_V4 !== 'undefined' ? MC_BIOMAS_V4 : {},
  _eliminados: new Set(),
  _imgs: new Map(),
  _tintes: new Map(),
  _ordenLRU: [],
  _estado: { bioma: null, anterior: null, mezcla: 1, mundo: null, yUlt: null },
  metricas: {
    decodificadas: 0,
    aciertosCache: 0,
    expulsiones: 0,
    drawCallsUltimoCuadro: 0,
    capasActivas: 0,
    biomaActivo: null,
    biomaAnterior: null,
    mezcla: 1,
    modoCalidad: 'alta',
    fallbackActivo: false,
    msUltimoCuadro: 0
  },

  /* Resuelve el bioma real del mundo en la posición del jugador */
  biomaDe(M, C) {
    if (!M) return null;
    if (M.biomaForzado) return M.biomaForzado;
    if (M.carretera && typeof M.carretera.bioma === 'function') {
      return M.carretera.bioma(C ? C.y : 0);
    }
    if (this.soloCarretera) return null;
    const id = M.planetaId || (M.meta && M.meta.ciudad) || '';
    if (id === 'guatape') return 'lagos';
    if (id === 'medellin') return 'montana';
    if (id === 'nueva_york') return 'costa';
    return null;
  },

  /* Calcula el bioma principal y, si se acerca una frontera en la carretera, el bioma de transición */
  muestrearTransicion(M, C, dt) {
    const actual = this.biomaDe(M, C);
    const est = this._estado;
    if (est.mundo !== M) {
      est.mundo = M;
      est.bioma = actual;
      est.anterior = null;
      est.mezcla = 1;
    } else if (actual !== est.bioma) {
      est.anterior = est.bioma;
      est.bioma = actual;
      est.mezcla = 0;
    }
    if (est.mezcla < 1) {
      est.mezcla = clamp(est.mezcla + clamp((dt || 1 / 60) * 1.1, .02, .25), 0, 1);
      if (est.mezcla >= 1) est.anterior = null;
    }
    /* Además, en carretera anticipamos la frontera a ±380 m para suavizar el cambio */
    let vecino = est.anterior, pesoVecino = 1 - est.mezcla;
    if (!vecino && M && M.carretera && typeof M.carretera.bioma === 'function' && C) {
      const bAdelante = M.carretera.bioma(C.y + 360);
      const bAtras = M.carretera.bioma(C.y - 360);
      if (bAdelante && bAdelante !== actual) {
        const bMedio = M.carretera.bioma(C.y + 180);
        vecino = bAdelante;
        pesoVecino = bMedio === bAdelante ? .38 : .18;
      } else if (bAtras && bAtras !== actual) {
        const bMedio = M.carretera.bioma(C.y - 180);
        vecino = bAtras;
        pesoVecino = bMedio === bAtras ? .38 : .18;
      }
    }
    this.metricas.biomaActivo = actual;
    this.metricas.biomaAnterior = vecino || null;
    this.metricas.mezcla = +(1 - pesoVecino).toFixed(3);
    return { actual, vecino, pesoVecino };
  },

  esBiomaSoportado(bioma) {
    if (!bioma || !this.BIOMAS.includes(bioma)) return false;
    for (const nv of this.NIVELES) {
      const id = bioma + '_' + nv;
      if (this._eliminados.has(id) || !this.DATA[id] || !this.MANIFIESTO.texturas[id]) return false;
    }
    return true;
  },

  /* Determina cuántas capas dibujar según calidad del motor y presupuesto del dispositivo */
  nivelesPorCalidad(E) {
    const cal = (E && E.calidad != null) ? E.calidad : (typeof TURNO !== 'undefined' && TURNO.vistas && TURNO.vistas.calidad != null) ? TURNO.vistas.calidad : 1;
    if (cal < .38) { this.metricas.modoCalidad = 'procedural'; return []; }
    if (cal < .62) { this.metricas.modoCalidad = 'media'; return ['lejos', 'cerca']; }
    this.metricas.modoCalidad = 'alta';
    return this.NIVELES;
  },

  /* Inicia o recupera las 3 imágenes de un bioma en la caché LRU */
  _asegurarImagenes(bioma) {
    if (!this.esBiomaSoportado(bioma)) return null;
    if (typeof Image === 'undefined') return null;
    const i0 = this._ordenLRU.indexOf(bioma);
    if (i0 >= 0) this._ordenLRU.splice(i0, 1);
    this._ordenLRU.push(bioma);
    while (this._ordenLRU.length > this.maxBiomasCache) {
      const viejo = this._ordenLRU.shift();
      if (viejo && viejo !== bioma) {
        for (const nv of this.NIVELES) {
          this._imgs.delete(viejo + '_' + nv);
          this._tintes.delete(viejo + '_' + nv);
        }
        this.metricas.expulsiones++;
      }
    }
    if (this._imgs.size > this.maxBiomasCache * 3) {
      const permitidos = new Set(this._ordenLRU);
      for (const k of [...this._imgs.keys()]) {
        const bKey = k.split('_')[0];
        if (!permitidos.has(bKey)) {
          this._imgs.delete(k);
          this._tintes.delete(k);
        }
      }
    }
    const res = {};
    let todasListas = true;
    for (const nv of this.NIVELES) {
      const id = bioma + '_' + nv;
      let rec = this._imgs.get(id);
      if (!rec) {
        const img = new Image();
        rec = { id, img, ok: false, err: false, p: null };
        img.onload = () => {
          rec.ok = img.naturalWidth === 1024 && img.naturalHeight === 256;
          if (rec.ok) this.metricas.decodificadas++;
          else rec.err = true;
        };
        img.onerror = () => { rec.err = true; };
        img.src = this.DATA[id];
        if (img.complete && img.naturalWidth === 1024 && img.naturalHeight === 256) {
          rec.ok = true;
          this.metricas.decodificadas++;
        }
        this._imgs.set(id, rec);
      } else {
        this.metricas.aciertosCache++;
        if (!rec.ok && !rec.err && rec.img.complete && rec.img.naturalWidth === 1024) {
          rec.ok = true;
          this.metricas.decodificadas++;
        }
      }
      if (!rec.ok || rec.err) todasListas = false;
      res[nv] = rec;
    }
    return todasListas ? res : null;
  },

  /* Precarga asíncrona verificable para pruebas o inicio de tramo */
  async precargar(bioma) {
    const lista = bioma ? [bioma] : this.BIOMAS;
    if (typeof Image === 'undefined') return false;
    const promesas = [];
    for (const b of lista) {
      if (!this.esBiomaSoportado(b)) continue;
      for (const nv of this.NIVELES) {
        const id = b + '_' + nv;
        let rec = this._imgs.get(id);
        if (!rec) {
          const img = new Image();
          rec = { id, img, ok: false, err: false };
          this._imgs.set(id, rec);
          img.src = this.DATA[id];
        }
        if (rec.img.complete && rec.img.naturalWidth === 1024) {
          rec.ok = true;
        } else {
          promesas.push(new Promise(r => {
            rec.img.onload = () => { rec.ok = rec.img.naturalWidth === 1024 && rec.img.naturalHeight === 256; this.metricas.decodificadas++; r(rec.ok); };
            rec.img.onerror = () => { rec.err = true; r(false); };
          }));
        }
      }
    }
    await Promise.all(promesas);
    return true;
  },

  /* Devuelve un lienzo 1024×256 con el tinte atmosférico de hora, bruma y niebla aplicado con source-atop */
  _capaEntintada(bioma, nivel, recImg, cielo, niebla) {
    const id = bioma + '_' + nivel;
    const noche = clamp(cielo && cielo.noche || 0, 0, 1);
    const br = (cielo && cielo.bruma) || [200, 214, 230];
    const hr = (cielo && cielo.hor) || [175, 210, 245];
    const nb = clamp(niebla || 0, 0, 1);
    const clave = [Math.round(noche * 20), Math.round(nb * 12), br[0] >> 3, br[1] >> 3, br[2] >> 3, hr[0] >> 3].join(':');
    let ct = this._tintes.get(id);
    if (ct && ct.clave === clave && ct.cv) return ct.cv;
    const cv = (ct && ct.cv) || lienzo(1024, 256);
    if (!cv) return recImg.img;
    const q = cv.getContext('2d');
    q.globalCompositeOperation = 'source-over';
    q.clearRect(0, 0, 1024, 256);
    q.drawImage(recImg.img, 0, 0);
    q.globalCompositeOperation = 'source-atop';
    /* Bruma atmosférica por profundidad (lejos recibe más atmósfera que medio y cerca) */
    const kBruma = nivel === 'lejos' ? clamp(.26 + nb * .44, .18, .76) : nivel === 'medio' ? clamp(.14 + nb * .32, .08, .58) : clamp(.05 + nb * .20, .03, .40);
    const mez = rgbMez(hr, br, nivel === 'lejos' ? .35 : .7);
    q.fillStyle = 'rgba(' + Math.round(mez[0]) + ',' + Math.round(mez[1]) + ',' + Math.round(mez[2]) + ',' + kBruma.toFixed(3) + ')';
    q.fillRect(0, 0, 1024, 256);
    /* Oscurecimiento nocturno y crepuscular */
    if (noche > .02) {
      const aNoche = clamp(noche * (nivel === 'lejos' ? .58 : nivel === 'medio' ? .64 : .68), 0, .74);
      q.fillStyle = 'rgba(10,18,40,' + aNoche.toFixed(3) + ')';
      q.fillRect(0, 0, 1024, 256);
    }
    q.globalCompositeOperation = 'source-over';
    this._tintes.set(id, { clave, cv });
    return cv;
  },

  /* Comprueba si el bioma actual tiene sus 3 capas listas para reemplazar las montañas procedurales */
  listoPara(M, C, E) {
    if (!this.activo) { this.metricas.fallbackActivo = true; return false; }
    const niveles = this.nivelesPorCalidad(E);
    if (!niveles.length) { this.metricas.fallbackActivo = true; return false; }
    const tr = this.muestrearTransicion(M, C, E && E.dt);
    if (!this.esBiomaSoportado(tr.actual)) { this.metricas.fallbackActivo = true; return false; }
    const imgs = this._asegurarImagenes(tr.actual);
    if (!imgs) { this.metricas.fallbackActivo = true; return false; }
    if (tr.vecino && this.esBiomaSoportado(tr.vecino)) this._asegurarImagenes(tr.vecino);
    this.metricas.fallbackActivo = false;
    return true;
  },

  /* Dibuja las 3 capas de paralaje (y transición entre biomas si aplica) ancladas al horizonte hor */
  dibujarCapas(arcade, g, W, H, hor, E) {
    const t0 = MC.ahora();
    const M = arcade.M, C = cuerpoRetro(E), cielo = cieloRetro(E);
    const niebla = E && E.clima ? E.clima.niebla || 0 : 0, lluvia = E && E.clima ? E.clima.lluvia || 0 : 0, noche = cielo.noche || 0;
    const niveles = this.nivelesPorCalidad(E);
    const tr = this.muestrearTransicion(M, C, E && E.dt);
    const imgsA = this._asegurarImagenes(tr.actual);
    if (!imgsA || !niveles.length) { this.metricas.fallbackActivo = true; return 0; }
    const imgsB = (tr.vecino && tr.pesoVecino > .02 && this.esBiomaSoportado(tr.vecino)) ? this._asegurarImagenes(tr.vecino) : null;

    const a = arcade.h != null ? arcade.h : (C.a || 0), t = (E && E.t) || 0;
    const giro = clamp(Math.sin((C.a || 0) - a), -1, 1);
    /* Pendiente longitudinal de la vía adelante para paralaje vertical sutil en lomas */
    const P = arcade._ultCamino || [];
    let pend = 0;
    if (P.length > 10) {
      const k = Math.min(18, P.length - 1);
      pend = clamp((P[k].z - P[0].z) / Math.max(12, k * arcade.paso), -.16, .16);
    }
    /* Escala vertical proporcional a la pantalla manteniendo relación 4:1 del lienzo 1024×256 */
    const altoCapa = Math.round(clamp(hor * .78, 118, 256));
    const anchoCapa = Math.max(512, Math.round(altoCapa * 4));
    const despBase = (a / TAU) * 2.2 + ((C.x || 0) * Math.cos(a) - (C.y || 0) * Math.sin(a)) / 1100 + (C.y || 0) / 3800 + giro * .018;

    let draws = 0;
    const pintarBiomaNivel = (bioma, imgs, nv, alfa) => {
      const rec = imgs[nv];
      if (!rec || !rec.ok) return;
      const src = this._capaEntintada(bioma, nv, rec, cielo, niebla + lluvia * .35);
      const vel = this.VEL[nv] || .35;
      const ky = nv === 'lejos' ? 22 : nv === 'medio' ? 36 : 52;
      const dy = Math.round(-pend * ky);
      const yDest = Math.round(hor - altoCapa + (nv === 'cerca' ? 6 : nv === 'medio' ? 3 : 1) + dy);
      const shift = (((despBase * vel * anchoCapa) % anchoCapa) + anchoCapa) % anchoCapa;
      let x = -shift;
      if (alfa < .995) { g.save(); g.globalAlpha = alfa; }
      while (x < W) {
        g.drawImage(src, Math.round(x), yDest, anchoCapa, altoCapa);
        draws++;
        x += anchoCapa;
      }
      if (alfa < .995) g.restore();
    };

    const br = cielo.bruma || [200, 214, 230], osc = 1 - noche * .62;
    const cBr = Math.round(clamp(br[0] * osc, 0, 255)) + ',' + Math.round(clamp(br[1] * osc, 0, 255)) + ',' + Math.round(clamp(br[2] * osc, 0, 255));

    g.save();
    /* Recortar estrictamente en el horizonte (0..hor) para jamás invadir la calzada inferior */
    g.beginPath();
    g.rect(0, 0, W, Math.ceil(hor));
    g.clip();

    /* Capa 0 ultra-lejana (vel 0.04): cirros altos y bandadas lejanas en V de día/crepúsculo */
    if (niveles.length >= 3 && noche < .65) {
      const shiftNube = (((despBase * .04 * W + t * 1.4) % W) + W) % W;
      g.fillStyle = 'rgba(' + cBr + ',' + ((1 - noche) * .16).toFixed(3) + ')';
      for (let i = 0; i < 4; i++) {
        const cx = ((i * W * .27 - shiftNube) % W + W) % W;
        const cy = hor * (.18 + (i % 2) * .09);
        const rw = W * (.11 + (i % 3) * .04), rh = Math.max(4, hor * .025);
        g.beginPath();
        g.ellipse(cx, cy, rw, rh, 0, 0, TAU);
        g.fill();
      }
      if (noche < .35 && (tr.actual === 'costa' || tr.actual === 'lagos' || tr.actual === 'bosque' || tr.actual === 'montana')) {
        const bx = ((W * .64 - shiftNube * 1.6) % W + W) % W, by = hor * .26;
        g.strokeStyle = 'rgba(45,62,78,' + ((.38 - noche) * .7).toFixed(3) + ')';
        g.lineWidth = 1.1;
        g.beginPath();
        for (let b = 0; b < 3; b++) {
          const ox = bx + b * 11, oy = by + (b % 2) * 4, aleteo = Math.sin(t * 5 + b * 1.4) * 1.8;
          g.moveTo(ox - 4, oy - aleteo);
          g.lineTo(ox, oy + 1.5);
          g.lineTo(ox + 4, oy - aleteo);
        }
        g.stroke();
      }
    }

    /* Aureola solar atmosférica detrás de la cordillera lejana al amanecer/atardecer */
    if (cielo.sol && cielo.sol.alt > -.08 && cielo.sol.alt < .42) {
      let ds = Math.atan2(cielo.sol.y, cielo.sol.x) - a;
      ds = Math.atan2(Math.sin(ds), Math.cos(ds));
      if (Math.abs(ds) < 1.15) {
        const foc = Math.max(W, H * .62) * .5 / Math.tan(.62);
        const sx = W / 2 + Math.tan(ds) * foc, sy = clamp(hor - Math.tan(cielo.sol.alt) * foc, hor * .15, hor);
        const rg = g.createRadialGradient(sx, sy, 4, sx, sy, W * .34);
        const kSol = clamp(1 - Math.abs(cielo.sol.alt - .12) / .32, .15, .85) * (1 - lluvia * .6);
        rg.addColorStop(0, 'rgba(255,220,145,' + (kSol * .32).toFixed(3) + ')');
        rg.addColorStop(1, 'rgba(255,190,120,0)');
        g.fillStyle = rg;
        g.fillRect(0, 0, W, hor);
      }
    }

    for (let idx = 0; idx < niveles.length; idx++) {
      const nv = niveles[idx];
      if (imgsB) {
        pintarBiomaNivel(tr.actual, imgsA, nv, 1);
        pintarBiomaNivel(tr.vecino, imgsB, nv, clamp(tr.pesoVecino, 0, 1));
      } else {
        pintarBiomaNivel(tr.actual, imgsA, nv, 1);
      }
      /* Velo de neblina de valle entre planos (se intensifica en bosque/lagos/montaña o con niebla/lluvia) */
      if (idx < niveles.length - 1) {
        const hum = (tr.actual === 'bosque' || tr.actual === 'lagos' || tr.actual === 'montana') ? .11 : .05;
        const aMist = clamp(hum + niebla * .18 + lluvia * .14, .04, .32);
        const yM = hor - altoCapa * (idx === 0 ? .46 : .24);
        const gm = g.createLinearGradient(0, yM - 16, 0, yM + 16);
        gm.addColorStop(0, 'rgba(' + cBr + ',0)');
        gm.addColorStop(.5, 'rgba(' + cBr + ',' + aMist.toFixed(3) + ')');
        gm.addColorStop(1, 'rgba(' + cBr + ',0)');
        g.fillStyle = gm;
        g.fillRect(0, yM - 16, W, 32);
      }
    }

    /* Bruma suave de costura en la línea del horizonte para fundir la capa cercana con la carretera lejana */
    const gh = g.createLinearGradient(0, hor - 14, 0, hor);
    gh.addColorStop(0, 'rgba(' + cBr + ',0)');
    gh.addColorStop(1, 'rgba(' + cBr + ',.24)');
    g.fillStyle = gh;
    g.fillRect(0, hor - 14, W, 14);
    g.restore();

    this.metricas.drawCallsUltimoCuadro = draws;
    this.metricas.capasActivas = niveles.length;
    this.metricas.msUltimoCuadro = +(MC.ahora() - t0).toFixed(3);
    return draws;
  },

  /* Fase 3 · Jugabilidad y dirección visual: anticipación de curvas en el horizonte y sensación de velocidad */
  dibujarDireccionVisual(arcade, g, W, H, hor, E) {
    const P = arcade._ultCamino;
    if (!P || P.length < 12) return;
    const C = cuerpoRetro(E), a = arcade.h != null ? arcade.h : (C.a || 0);
    const k1 = Math.min(8, P.length - 1), k2 = Math.min(28, P.length - 1);
    const aLejos = Math.atan2(P[k2].y - P[k1].y, P[k2].x - P[k1].x);
    const curva = Math.atan2(Math.sin(aLejos - a), Math.cos(aLejos - a));
    /* 1. Lectura de curvas: chevrones diegéticos sobre la cresta exterior del horizonte cuando la curva supera 0.14 rad */
    if (Math.abs(curva) > .14) {
      const dir = curva > 0 ? 1 : -1;
      const fuerza = clamp((Math.abs(curva) - .14) / .45, .25, 1);
      g.save();
      g.beginPath();
      g.rect(0, 0, W, Math.ceil(hor));
      g.clip();
      const yC = Math.round(hor - 14);
      const xBase = Math.round(W * .5 + dir * W * .24);
      for (let i = 0; i < 3; i++) {
        const cx = xBase + dir * i * 16;
        const al = (.35 + .45 * fuerza) * (1 - i * .22);
        g.fillStyle = 'rgba(255,214,64,' + al.toFixed(3) + ')';
        g.beginPath();
        g.moveTo(cx - dir * 4, yC - 6);
        g.lineTo(cx + dir * 5, yC);
        g.lineTo(cx - dir * 4, yC + 6);
        g.closePath();
        g.fill();
      }
      g.restore();
    }
    /* 2. Sensación de velocidad: estelas periféricas sutiles en el cielo cercano al horizonte (> 19 m/s) */
    const vel = Math.abs(C.v || 0);
    if (vel > 19 && !(typeof G !== 'undefined' && G.pocosDestellos)) {
      const kVel = clamp((vel - 19) / 24, 0, 1), t = (E && E.t) || 0;
      g.save();
      g.beginPath();
      g.rect(0, 0, W, Math.ceil(hor));
      g.clip();
      g.strokeStyle = 'rgba(255,255,255,' + (.08 + kVel * .16).toFixed(3) + ')';
      g.lineWidth = 1.2;
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const lado = i % 2 === 0 ? -1 : 1;
        const fase = ((t * (2.4 + i * .35) + i * .27) % 1);
        const y0 = hor - 8 - (i >> 1) * 18;
        const x0 = W * .5 + lado * W * (.28 + fase * .20);
        const x1 = x0 + lado * W * (.04 + kVel * .06);
        const y1 = y0 - 3;
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
      }
      g.stroke();
      g.restore();
    }
  },

  /* Simulación de falta de textura para probar el respaldo procedural en vivo */
  eliminarAssetTemporal(id) {
    this._eliminados.add(id);
    this._imgs.delete(id);
    this._tintes.delete(id);
  },
  restaurarAssets() {
    this._eliminados.clear();
  },

  /* Libera lienzos e imágenes en caché al cambiar de mundo o cerrar la vista */
  liberar() {
    this._imgs.clear();
    this._tintes.clear();
    this._ordenLRU.length = 0;
    this.metricas.drawCallsUltimoCuadro = 0;
    this.metricas.capasActivas = 0;
  }
};

/* Envoltura limpia y no invasiva sobre MC.Arcade (cero modificaciones en js/47-clasicos.js) */
if (typeof Arcade !== 'undefined') {
  const _caminoOrig = Arcade.prototype.camino;
  Arcade.prototype.camino = function (x, y, a) {
    const P = _caminoOrig.call(this, x, y, a);
    this._ultCamino = P;
    return P;
  };

  const _dibujarOrig = Arcade.prototype.dibujar;
  Arcade.prototype.dibujar = function (g, W, H, E, op = {}) {
    const arcade = this;
    const C = cuerpoRetro(E);
    const usarParalaje = ParalajeBiomas.listoPara(arcade.M, C, E);
    if (!usarParalaje) {
      ParalajeBiomas.metricas.drawCallsUltimoCuadro = 0;
      ParalajeBiomas.metricas.capasActivas = 0;
      return _dibujarOrig.call(arcade, g, W, H, E, op);
    }
    const hor = H * .5;
    const origFill = g.fill, origFillRect = g.fillRect, origArc = g.arc;
    let fase = 0, enArco = false;
    const restaurar = () => {
      g.fill = origFill;
      g.fillRect = origFillRect;
      g.arc = origArc;
    };
    g.arc = function (...args) {
      enArco = true;
      return origArc.apply(this, args);
    };
    g.fill = function (...args) {
      /* Entre el cielo (fase 1) y el suelo bajo el horizonte (fase 2), omitimos las 2 bandas de montañas procedurales, pero conservamos el sol (enArco) */
      if (fase === 1) {
        if (enArco) { enArco = false; return origFill.apply(this, args); }
        return;
      }
      enArco = false;
      return origFill.apply(this, args);
    };
    g.fillRect = function (x, y, w, h) {
      const r = origFillRect.call(this, x, y, w, h);
      if (fase === 0 && x === 0 && y === 0 && Math.abs(h - (hor + 2)) < 1.5) {
        fase = 1;
      } else if (fase === 1 && x === 0 && Math.abs(y - (hor - 1)) < 1.5) {
        fase = 2;
        restaurar();
        try {
          ParalajeBiomas.dibujarCapas(arcade, g, W, H, hor, E);
        } catch (e) {
          MC.falla('paralaje-biomas', e);
        }
      }
      return r;
    };
    let out;
    try {
      out = _dibujarOrig.call(arcade, g, W, H, E, op);
      if (!op.pixel) ParalajeBiomas.dibujarDireccionVisual(arcade, g, W, H, hor, E);
    } finally {
      restaurar();
    }
    return out;
  };

  if (typeof Vistas !== 'undefined') {
    if (Vistas.prototype.dibujar) {
      const _dibVistas = Vistas.prototype.dibujar;
      Vistas.prototype.dibujar = function (g, W, H, E, dt = 1 / 60) {
        if (E && this.calidad != null) E.calidad = this.calidad;
        return _dibVistas.call(this, g, W, H, E, dt);
      };
    }
    if (Vistas.prototype.liberar) {
      const _liberarVistas = Vistas.prototype.liberar;
      Vistas.prototype.liberar = function () {
        ParalajeBiomas.liberar();
        return _liberarVistas.call(this);
      };
    }
  }
  /* 5.1 (Claude): aquí había una envoltura de VistaTres.dibujar que, con menos de 24 regiones, subía el presupuesto a 28 regiones
     por cuadro: al empezar, al teletransportarse o con el 🆘 rescate armaba la ciudad de un golpe (un tirón de segundos y el juego
     en cámara lenta: fallaban las pruebas humana y de modos). El presupuesto lo decide MC.Vistas según la calidad; las pruebas
     esperan a que la escena esté armada. */
}

MC.ParalajeBiomas = ParalajeBiomas;
