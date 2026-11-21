/* =====================================================================
   MOTOR CITY · Técnicas clásicas en sala limpia (RenderWare, id Tech, Build,
   Voxel Space, Driver PS1, GOAL y Shadow of the Colossus)
   Cero dependencias, cero asignaciones por cuadro en bucles calientes,
   sin comentarios de doble barra de una línea para compatibilidad directa con construir.mjs.
   ===================================================================== */
(function (root) {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const wrapAng = a => {
    a = (a + Math.PI) % TAU;
    return a < 0 ? a + Math.PI : a - Math.PI;
  };

  /* -------------------------------------------------------------------
     1. StreamAnillo (RenderWare CStreaming / GTA SA + GOAL Jak & Daxter)
     Presupuesto estricto en KB, prefetcheo adelantado segun vector de velocidad,
     evacuacion LRU y liberacion total de la ciudad previa al cambiar de mundo.
     ------------------------------------------------------------------- */
  class StreamAnillo {
    constructor(op = {}) {
      this.tamSector = op.tamSector || 1000;
      this.presupuestoKB = op.presupuestoKB || 16384;
      this.radio = op.radio || 1;
      this.ciudad = op.ciudad || 'nueva_york';
      this.cargados = new Map();
      this.usadoKB = 0;
      this.tick = 0;
      this.stats = { cargas: 0, expulsiones: 0, cambiosCiudad: 0, picoKB: 0 };
    }
    clave(ciudad, sx, sy) { return ciudad + ':' + sx + ',' + sy; }
    cambiarCiudad(nuevaCiudad) {
      if (nuevaCiudad === this.ciudad) return 0;
      const antes = this.usadoKB;
      this.cargados.clear();
      this.usadoKB = 0;
      this.ciudad = nuevaCiudad;
      this.stats.cambiosCiudad++;
      return antes;
    }
    actualizar(x, y, vx = 0, vy = 0, proveedor) {
      this.tick++;
      const s = this.tamSector;
      /* GOAL / GTA SA: adelantar el centro de carga segun velocidad del vehiculo */
      const px = x + vx * 3.5;
      const py = y + vy * 3.5;
      const cx = Math.floor(px / s);
      const cy = Math.floor(py / s);
      const necesarios = [];
      for (let dy = -this.radio; dy <= this.radio; dy++) {
        for (let dx = -this.radio; dx <= this.radio; dx++) {
          const sx = cx + dx, sy = cy + dy;
          const k = this.clave(this.ciudad, sx, sy);
          const dist2 = dx * dx + dy * dy;
          necesarios.push({ k, sx, sy, dist2 });
        }
      }
      necesarios.sort((a, b) => a.dist2 - b.dist2);
      const activos = new Set();
      for (const n of necesarios) {
        activos.add(n.k);
        const ex = this.cargados.get(n.k);
        if (ex) {
          ex.ultimo = this.tick;
          continue;
        }
        const item = proveedor ? proveedor(this.ciudad, n.sx, n.sy) : { kb: 512, datos: null };
        const kb = Math.max(1, item.kb || 256);
        this._hacerEspacio(kb, activos);
        this.cargados.set(n.k, { k: n.k, sx: n.sx, sy: n.sy, kb, datos: item.datos, ultimo: this.tick });
        this.usadoKB += kb;
        this.stats.cargas++;
        if (this.usadoKB > this.stats.picoKB) this.stats.picoKB = this.usadoKB;
      }
      return {
        ciudad: this.ciudad,
        centro: [cx, cy],
        sectores: this.cargados.size,
        usadoKB: this.usadoKB,
        presupuestoKB: this.presupuestoKB,
        picoKB: this.stats.picoKB,
        expulsiones: this.stats.expulsiones
      };
    }
    _hacerEspacio(necesarioKB, protegidos) {
      while (this.usadoKB + necesarioKB > this.presupuestoKB && this.cargados.size > 0) {
        let victima = null;
        for (const v of this.cargados.values()) {
          if (protegidos && protegidos.has(v.k)) continue;
          if (!victima || v.ultimo < victima.ultimo) victima = v;
        }
        if (!victima) {
          for (const v of this.cargados.values()) {
            if (!victima || v.ultimo < victima.ultimo) victima = v;
          }
        }
        if (!victima) break;
        this.cargados.delete(victima.k);
        this.usadoKB -= victima.kb;
        this.stats.expulsiones++;
      }
    }
  }

  /* -------------------------------------------------------------------
     2. CulleoUrbano (Silent Hill farPlane=fogEnd + Build Engine 1D portal/horizon)
     Recorta edificios fuera del cono de vision, mas alla del muro de niebla
     y totalmente ocluidos detras de fachadas altas de primera fila.
     ------------------------------------------------------------------- */
  class CulleoUrbano {
    constructor(columnas = 96) {
      this.columnas = columnas;
      this.horizonte = new Float32Array(columnas);
    }
    filtrar(cam, edificios, op = {}) {
      const fov = op.fov || (Math.PI * 0.48);
      const halfFov = fov * 0.5;
      const fogEnd = op.fogEnd || 260;
      const usarNiebla = op.niebla !== false;
      const usarOclusion = op.oclusion !== false;
      const usarFrustum = op.frustum !== false;
      const maxD = usarNiebla ? fogEnd : (op.maxDist || 900);
      const maxD2 = maxD * maxD;
      const cosC = Math.cos(cam.a), sinC = Math.sin(cam.a);
      const camZ = cam.z || 2.2;
      const candidatos = [];

      for (let i = 0; i < edificios.length; i++) {
        const b = edificios[i];
        const dx = b.x - cam.x;
        const dy = b.y - cam.y;
        const d2 = dx * dx + dy * dy;
        const r = b.r || Math.hypot(b.w || 12, b.l || 12) * 0.5;
        if (d2 > (maxD + r) * (maxD + r)) continue;
        const d = Math.sqrt(d2) || 0.001;
        /* proyeccion al espacio de camara */
        const fwd = dx * cosC + dy * sinC;
        const side = -dx * sinC + dy * cosC;
        if (usarFrustum && fwd < -r) continue;
        const ang = Math.atan2(side, Math.max(0.1, fwd));
        const angR = Math.atan2(r, Math.max(r, d));
        if (usarFrustum && Math.abs(ang) - angR > halfFov) continue;
        candidatos.push({ b, i, d, fwd, ang, angR, r });
      }

      /* Build Engine: ordenar de adelante hacia atras (front-to-back) */
      candidatos.sort((a, b) => a.d - b.d);
      this.horizonte.fill(-1e9);

      const visibles = [];
      const N = this.columnas;
      for (let k = 0; k < candidatos.length; k++) {
        const c = candidatos[k];
        const h = c.b.h || 12;
        const slopeTop = (h - camZ) / Math.max(1.0, c.d);
        if (!usarOclusion) {
          visibles.push(c);
          continue;
        }
        /* rango de columnas angulares cubiertas por el edificio */
        const a0 = c.ang - c.angR;
        const a1 = c.ang + c.angR;
        const col0 = clamp(Math.floor(((a0 + halfFov) / fov) * N), 0, N - 1);
        const col1 = clamp(Math.ceil(((a1 + halfFov) / fov) * N), 0, N - 1);
        let seVe = false;
        for (let col = col0; col <= col1; col++) {
          if (slopeTop > this.horizonte[col]) {
            seVe = true;
            break;
          }
        }
        if (seVe) {
          visibles.push(c);
          /* oclusor conservador: solo actualiza columnas interiores para evitar falsos descartes */
          const pad = col1 - col0 >= 3 ? 1 : 0;
          const occSlope = slopeTop * 0.92;
          for (let col = col0 + pad; col <= col1 - pad; col++) {
            if (occSlope > this.horizonte[col]) this.horizonte[col] = occSlope;
          }
        }
      }
      return {
        visibles,
        total: edificios.length,
        enFrustum: candidatos.length,
        dibujados: visibles.length,
        descartadosPct: edificios.length ? +((1 - visibles.length / edificios.length) * 100).toFixed(1) : 0
      };
    }
  }

  /* -------------------------------------------------------------------
     3. PVSRejilla y LuzHorneada (Quake / id Tech 2-3)
     Bitset de visibilidad celda-a-celda con compresion RLE + oclusion
     ambiental horneada por callejon urbano para modelos low-poly.
     ------------------------------------------------------------------- */
  class PVSRejilla {
    constructor(ancho, alto) {
      this.ancho = ancho;
      this.alto = alto;
      this.n = ancho * alto;
      this.palabras = Math.ceil(this.n / 32);
      this.bits = new Uint32Array(this.n * this.palabras);
    }
    construirDesdeBloqueo(bloqueo, radioMax = 10) {
      const W = this.ancho, H = this.alto;
      this.bits.fill(0);
      for (let cy = 0; cy < H; cy++) {
        for (let cx = 0; cx < W; cx++) {
          const orig = cy * W + cx;
          if (bloqueo[orig]) continue;
          this._marcar(orig, orig);
          const y0 = Math.max(0, cy - radioMax), y1 = Math.min(H - 1, cy + radioMax);
          const x0 = Math.max(0, cx - radioMax), x1 = Math.min(W - 1, cx + radioMax);
          for (let ty = y0; ty <= y1; ty++) {
            for (let tx = x0; tx <= x1; tx++) {
              if ((tx - cx) * (tx - cx) + (ty - cy) * (ty - cy) > radioMax * radioMax) continue;
              if (this._lineaLibre(cx, cy, tx, ty, bloqueo)) this._marcar(orig, ty * W + tx);
            }
          }
        }
      }
      return this;
    }
    _lineaLibre(x0, y0, x1, y1, bloqueo) {
      const W = this.ancho;
      let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx - dy, x = x0, y = y0;
      while (!(x === x1 && y === y1)) {
        const e2 = err * 2;
        if (e2 > -dy) { err -= dy; x += sx; }
        if (e2 < dx) { err += dx; y += sy; }
        if (x === x1 && y === y1) return true;
        if (bloqueo[y * W + x]) return false;
      }
      return true;
    }
    _marcar(orig, dest) {
      this.bits[orig * this.palabras + (dest >>> 5)] |= (1 << (dest & 31));
    }
    visible(orig, dest) {
      if (orig < 0 || orig >= this.n || dest < 0 || dest >= this.n) return false;
      return (this.bits[orig * this.palabras + (dest >>> 5)] & (1 << (dest & 31))) !== 0;
    }
    /* Compresion RLE estilo vis.exe de Quake sobre los bytes de la fila PVS */
    comprimirFila(orig) {
      const base = orig * this.palabras;
      const bytes = new Uint8Array(this.bits.buffer, base * 4, this.palabras * 4);
      const out = [];
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] !== 0) {
          out.push(bytes[i]);
        } else {
          let ceros = 1;
          while (i + 1 < bytes.length && bytes[i + 1] === 0 && ceros < 255) { i++; ceros++; }
          out.push(0, ceros);
        }
      }
      return new Uint8Array(out);
    }
    descomprimirFila(rle) {
      const out = new Uint8Array(this.palabras * 4);
      let p = 0;
      for (let i = 0; i < rle.length && p < out.length; i++) {
        if (rle[i] !== 0) {
          out[p++] = rle[i];
        } else {
          const ceros = rle[++i] || 0;
          p += ceros;
        }
      }
      return new Uint32Array(out.buffer);
    }
  }

  function hornearAOUrbano(edificios, radio = 38) {
    const r2 = radio * radio;
    const out = new Float32Array(edificios.length);
    for (let i = 0; i < edificios.length; i++) {
      const a = edificios[i];
      let sombra = 0;
      for (let j = 0; j < edificios.length; j++) {
        if (i === j) continue;
        const b = edificios[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2 || d2 < 1) continue;
        const d = Math.sqrt(d2);
        const factorAltura = clamp((b.h || 12) / (d + 8), 0, 1.4);
        sombra += factorAltura * (1 - d / radio) * 0.22;
      }
      out[i] = clamp(1 - sombra, 0.34, 1.0);
    }
    return out;
  }

  /* -------------------------------------------------------------------
     4. VoxelTerreno (NovaLogic Comanche / Outcast Voxel Space)
     Raycaster puro en CPU sobre mapa de alturas + color (Uint32Array RGBA).
     Corre a 60 FPS en Canvas 2D sin requerir WebGL.
     ------------------------------------------------------------------- */
  class VoxelTerreno {
    constructor(tam = 256) {
      this.tam = tam;
      this.mascara = tam - 1;
      this.alturas = new Uint8Array(tam * tam);
      this.colores = new Uint32Array(tam * tam);
      this.generarGuatape();
    }
    cargarDesdeSnapshot(snap) {
      const N = snap.tam || 128;
      this.tam = N;
      this.mascara = N - 1;
      this.alturas = new Uint8Array(N * N);
      this.colores = new Uint32Array(N * N);
      const binH = typeof atob === 'function' ? atob(snap.alturasB64) : Buffer.from(snap.alturasB64, 'base64').toString('binary');
      const binS = typeof atob === 'function' ? atob(snap.suelosB64) : Buffer.from(snap.suelosB64, 'base64').toString('binary');
      for (let i = 0; i < N * N; i++) {
        const h = binH.charCodeAt(i);
        const s = binS.charCodeAt(i);
        this.alturas[i] = h;
        let r, g, b;
        if (s === 8 || s === 9) { r = 24; g = 74; b = 88; } /* agua / embalse / rio */
        else if (s === 4 || s === 5 || s === 14 || s === 11) { r = 74; g = 76; b = 82; } /* vias y puentes */
        else if (s === 2 || s === 3 || s === 10 || s === 12) { r = 166; g = 112; b = 92; } /* urbano ladrillo/edificios */
        else if (s === 6 || s === 7) { r = 118; g = 114; b = 104; } /* anden / ciclorruta */
        else if (h > 195) { r = 92; g = 96; b = 92; } /* roca alta / monolito / cumbre */
        else if (h > 125) { r = 52; g = 96; b = 56; } /* ladera verde andina */
        else { r = 44; g = 86; b = 48; } /* valle / pasto */
        /* toque sutil de guayacanes en laderas verdes */
        if ((s === 0 || s === 1) && ((i * 37) & 127) === 0) { r = 218; g = 172; b = 54; }
        this.colores[i] = (255 << 24) | (b << 16) | (g << 8) | r;
      }
      return this;
    }
    generarGuatape() {
      const N = this.tam;
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const nx = x / N, ny = y / N;
          /* colinas andinas suaves + embalse + monolito Piedra del Penol */
          let h = 42
            + Math.sin(nx * TAU * 2) * 18
            + Math.cos(ny * TAU * 2) * 16
            + Math.sin((nx + ny) * TAU * 4) * 10
            + Math.cos((nx * 3 - ny * 2) * TAU) * 7;
          /* brazo del embalse */
          const rio = Math.abs(Math.sin(nx * TAU) * 0.22 + 0.5 - ny);
          if (rio < 0.14) h -= (0.14 - rio) * 260;
          /* Piedra del Penol centrada cerca de (0.62, 0.34) */
          const dp = Math.hypot((nx - 0.62) * 1.15, ny - 0.34);
          if (dp < 0.13) {
            const t = 1 - dp / 0.13;
            h += t * t * 155;
          }
          const hh = clamp(Math.round(h), 18, 245);
          const idx = y * N + x;
          this.alturas[idx] = hh;
          /* paleta realista Guatape: agua esmeralda, guayacan/verde andino, granito */
          let r, g, b;
          if (hh <= 24) {
            r = 22; g = 68; b = 78;
          } else if (dp < 0.12 && hh > 95) {
            const gTone = 58 + ((x * 7 + y * 13) & 15);
            r = gTone; g = gTone + 2; b = gTone + 6;
          } else if (hh < 46) {
            r = 56; g = 104; b = 52;
          } else if (hh < 82) {
            const flor = ((x * 31 + y * 17) & 63) === 0;
            r = flor ? 218 : 42 + ((hh - 46) >> 1);
            g = flor ? 174 : 88 + ((hh - 46) >> 2);
            b = flor ? 58 : 46;
          } else {
            r = 92; g = 98; b = 82;
          }
          /* ABGR para ImageData little-endian */
          this.colores[idx] = (255 << 24) | (b << 16) | (g << 8) | r;
        }
      }
    }
    renderizar(buf32, W, H, cam, op = {}) {
      const maxDist = op.distancia || 150;
      const escalaH = op.escalaH || 110;
      const horizonte = op.horizonte != null ? op.horizonte : Math.floor(H * 0.42);
      const fogR = op.fogR != null ? op.fogR : 204;
      const fogG = op.fogG != null ? op.fogG : 182;
      const fogB = op.fogB != null ? op.fogB : 156;

      /* cielo degradado amanecer Guatape */
      for (let y = 0; y < H; y++) {
        const t = clamp(y / Math.max(1, horizonte), 0, 1);
        const r = Math.round(28 + (fogR - 28) * t);
        const g = Math.round(42 + (fogG - 42) * t);
        const b = Math.round(58 + (fogB - 58) * t);
        const col = (255 << 24) | (b << 16) | (g << 8) | r;
        buf32.fill(col, y * W, (y + 1) * W);
      }

      const yBuf = new Int32Array(W);
      yBuf.fill(H);
      const sinA = Math.sin(cam.a), cosA = Math.cos(cam.a);
      const mask = this.mascara, N = this.tam;
      let dz = 1.0, z = 1.0;
      let columnasPintadas = 0;

      while (z < maxDist) {
        const plx = -cosA * z - sinA * z;
        const ply = sinA * z - cosA * z;
        const prx = cosA * z - sinA * z;
        const pry = -sinA * z - cosA * z;
        const dx = (prx - plx) / W;
        const dy = (pry - ply) / W;
        let rx = cam.x + plx;
        let ry = cam.y + ply;
        const invZ = escalaH / z;
        const niebla = clamp((z - maxDist * 0.35) / (maxDist * 0.65), 0, 1);

        for (let i = 0; i < W; i++) {
          const ix = (rx | 0) & mask;
          const iy = (ry | 0) & mask;
          const idx = iy * N + ix;
          const hPant = Math.floor((cam.z - this.alturas[idx]) * invZ + horizonte);
          if (hPant < yBuf[i]) {
            const base = this.colores[idx];
            const br = base & 255;
            const bg = (base >>> 8) & 255;
            const bb = (base >>> 16) & 255;
            const r = Math.round(br + (fogR - br) * niebla);
            const g = Math.round(bg + (fogG - bg) * niebla);
            const b = Math.round(bb + (fogB - bb) * niebla);
            const c = (255 << 24) | (b << 16) | (g << 8) | r;
            const y0 = Math.max(0, hPant);
            const y1 = yBuf[i];
            for (let y = y0; y < y1; y++) buf32[y * W + i] = c;
            yBuf[i] = y0;
            columnasPintadas++;
          }
          rx += dx;
          ry += dy;
        }
        z += dz;
        dz += 0.018;
      }
      return { columnasPintadas, ancho: W, alto: H };
    }
  }

  /* -------------------------------------------------------------------
     5. FisicaDriver (Reflections Driver PS1 1999) + PoolParticulas (Burnout 3)
     Suspension blanda de 4 resortes con cabeceo/balanceo cinematografico
     y pool circular Struct-of-Arrays (cero objetos asignados por cuadro).
     ------------------------------------------------------------------- */
  class FisicaDriver {
    constructor(op = {}) {
      this.rigidez = op.rigidez || 26;
      this.amort = op.amort || 6.4;
      this.pitch = 0; this.vPitch = 0;
      this.roll = 0; this.vRoll = 0;
      this.heave = 0; this.vHeave = 0;
      this.velPrev = 0;
      this.angPrev = 0;
      this.derrape = 0;
    }
    paso(dt, vel, ang, volante = 0, bache = 0) {
      dt = clamp(dt, 0.001, 0.05);
      const accLong = clamp((vel - this.velPrev) / dt, -28, 28);
      const yawRate = wrapAng(ang - this.angPrev) / dt;
      const accLat = clamp(vel * yawRate, -26, 26);
      this.velPrev = vel;
      this.angPrev = ang;

      /* Transferencia de peso: frenar inclina nariz abajo; curva inclina hacia afuera */
      const targetPitch = clamp(-accLong * 0.0085, -0.18, 0.18);
      const targetRoll = clamp(accLat * 0.011 + volante * clamp(Math.abs(vel) / 22, 0, 1) * 0.04, -0.22, 0.22);
      const targetHeave = clamp(bache * 0.14, -0.2, 0.2);

      this.vPitch += ((targetPitch - this.pitch) * this.rigidez - this.vPitch * this.amort) * dt;
      this.pitch = clamp(this.pitch + this.vPitch * dt, -0.24, 0.24);

      this.vRoll += ((targetRoll - this.roll) * this.rigidez - this.vRoll * this.amort) * dt;
      this.roll = clamp(this.roll + this.vRoll * dt, -0.28, 0.28);

      this.vHeave += ((targetHeave - this.heave) * (this.rigidez * 1.4) - this.vHeave * (this.amort * 1.2)) * dt;
      this.heave = clamp(this.heave + this.vHeave * dt, -0.25, 0.25);

      this.derrape = clamp((Math.abs(accLat) - 6.5) / 14, 0, 1);
      return { pitch: this.pitch, roll: this.roll, heave: this.heave, derrape: this.derrape };
    }
  }

  class PoolParticulas {
    constructor(capacidad = 256) {
      this.cap = capacidad;
      this.x = new Float32Array(capacidad);
      this.y = new Float32Array(capacidad);
      this.z = new Float32Array(capacidad);
      this.vx = new Float32Array(capacidad);
      this.vy = new Float32Array(capacidad);
      this.vz = new Float32Array(capacidad);
      this.vida = new Float32Array(capacidad);
      this.maxVida = new Float32Array(capacidad);
      this.tipo = new Uint8Array(capacidad); /* 1=chispa, 2=humo, 3=marca */
      this.cursor = 0;
      this.activas = 0;
    }
    emitir(tipo, x, y, z, vx, vy, vz, dur = 0.6) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % this.cap;
      this.tipo[i] = tipo;
      this.x[i] = x; this.y[i] = y; this.z[i] = z;
      this.vx[i] = vx; this.vy[i] = vy; this.vz[i] = vz;
      this.vida[i] = dur;
      this.maxVida[i] = dur;
    }
    paso(dt) {
      let n = 0;
      for (let i = 0; i < this.cap; i++) {
        const v = this.vida[i];
        if (v <= 0) continue;
        const nv = v - dt;
        this.vida[i] = nv > 0 ? nv : 0;
        if (nv <= 0) continue;
        n++;
        const t = this.tipo[i];
        if (t === 1) {
          this.vz[i] -= 14 * dt;
          this.x[i] += this.vx[i] * dt;
          this.y[i] += this.vy[i] * dt;
          this.z[i] += this.vz[i] * dt;
          if (this.z[i] < 0) { this.z[i] = 0; this.vz[i] = -this.vz[i] * 0.45; }
        } else if (t === 2) {
          this.x[i] += this.vx[i] * dt;
          this.y[i] += this.vy[i] * dt;
          this.z[i] += (this.vz[i] + 1.6) * dt;
          this.vx[i] *= (1 - 2 * dt);
          this.vy[i] *= (1 - 2 * dt);
        }
      }
      this.activas = n;
      return n;
    }
  }

  /* -------------------------------------------------------------------
     6. EscaladorDinamico (Shadow of the Colossus / Burnout 60 FPS lock)
     Ajusta escala de render (DPR) y distancia de niebla suavemente para
     mantener el tiempo de cuadro en objetivo sin oscilaciones bruscas.
     ------------------------------------------------------------------- */
  class EscaladorDinamico {
    constructor(op = {}) {
      this.metaMs = op.metaMs || 16.6;
      this.minEscala = op.minEscala || 0.55;
      this.maxEscala = op.maxEscala || 1.5;
      this.escala = op.inicial || 1.0;
      this.fogMin = op.fogMin || 110;
      this.fogMax = op.fogMax || 320;
      this.fog = op.fogInicial || 240;
      this.emaMs = this.metaMs;
    }
    medir(cuadroMs) {
      this.emaMs = this.emaMs * 0.85 + clamp(cuadroMs, 1, 120) * 0.15;
      if (this.emaMs > this.metaMs * 1.12) {
        this.escala = clamp(this.escala - 0.04, this.minEscala, this.maxEscala);
        this.fog = clamp(this.fog - 10, this.fogMin, this.fogMax);
      } else if (this.emaMs < this.metaMs * 0.82) {
        this.escala = clamp(this.escala + 0.02, this.minEscala, this.maxEscala);
        this.fog = clamp(this.fog + 6, this.fogMin, this.fogMax);
      }
      return { emaMs: +this.emaMs.toFixed(1), escala: +this.escala.toFixed(2), fog: Math.round(this.fog) };
    }
  }

  const API = {
    version: '1.0.0-cleanroom',
    StreamAnillo,
    CulleoUrbano,
    PVSRejilla,
    hornearAOUrbano,
    VoxelTerreno,
    FisicaDriver,
    PoolParticulas,
    EscaladorDinamico
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.MCClasico = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
