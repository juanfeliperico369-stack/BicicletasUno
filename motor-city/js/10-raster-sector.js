/* =====================================================================
   C-M34 · RASTER MC4 POR SECTORES (aprox. 1 km)
   Lee suelo/nivel desde bloques DEFLATE independientes dentro del HTML
   offline. No descarga bytes externos ni cambia los MC4 de origen.
   Un sector = `lado` casillas, con bordes parciales exactos y LRU acotada.
   La cuadrícula completa solo se reconstruye si un consumidor pide
   explícitamente `Mundo.capa('suelo'/'nivel')`.
   ===================================================================== */
class RasterMC4 {
  constructor(spec, obtener, op = {}) {
    const entero = v => Number.isSafeInteger(v) && v > 0;
    if (!spec || !entero(spec.w) || !entero(spec.h) || !entero(spec.lado) ||
      !entero(spec.nx) || !entero(spec.ny) ||
      spec.nx !== Math.ceil(spec.w / spec.lado) || spec.ny !== Math.ceil(spec.h / spec.lado) ||
      !['u8', 'i8'].includes(spec.tipo) || !Array.isArray(spec.indices) ||
      spec.indices.length !== spec.nx * spec.ny + 1 ||
      spec.indices[0] !== 0 || typeof obtener !== 'function') {
      throw new Error('Manifiesto de raster MC4 inválido');
    }
    for (let i = 1; i < spec.indices.length; i++) {
      if (!Number.isSafeInteger(spec.indices[i]) || spec.indices[i] <= spec.indices[i - 1]) {
        throw new Error('Índices de raster MC4 inválidos');
      }
    }
    const max = op.maxSectores === undefined ? 16 : op.maxSectores;
    if (!entero(max) || max > 512) throw new RangeError('Presupuesto de sectores raster inválido');
    this.spec = spec; this.obtener = obtener; this.maxSectores = max;
    this.cache = new Map(); this._ultimoId = -1; this._ultimo = null;
    this._hot = 0; this.aciertos = 0; this.fallos = 0; this.expulsiones = 0;
    this.bytesResidentes = 0;
  }
  _dim(ix, iy) {
    return { w: Math.min(this.spec.lado, this.spec.w - ix * this.spec.lado),
      h: Math.min(this.spec.lado, this.spec.h - iy * this.spec.lado) };
  }
  _pedir(ix, iy) {
    const id = iy * this.spec.nx + ix;
    if (id === this._ultimoId && this._ultimo) {
      this.aciertos++;
      /* No hacer delete/set del Map por cada píxel: relajar el LRU de la
         casilla caliente y renovar su recencia amortizada. */
      if ((++this._hot & 255) === 0 && this.cache.has(id)) {
        this.cache.delete(id); this.cache.set(id, this._ultimo);
      }
      return this._ultimo;
    }
    let datos = this.cache.get(id);
    if (datos) {
      this.aciertos++; this.cache.delete(id); this.cache.set(id, datos);
    } else {
      const comprimidos = this.obtener(id);
      if (!(typeof comprimidos === 'string' || (comprimidos && typeof comprimidos.subarray === 'function'))) {
        throw new Error('Sector raster MC4 ausente: ' + id);
      }
      const { w, h } = this._dim(ix, iy);
      const raw = inflarSync(typeof comprimidos === 'string' ? deB64(comprimidos) : comprimidos, w * h);
      if (raw.byteLength !== w * h) throw new Error('Sector raster MC4 corrupto: ' + id);
      datos = this.spec.tipo === 'i8'
        ? new Int8Array(raw.buffer, raw.byteOffset, raw.byteLength) : raw;
      this.cache.set(id, datos); this.bytesResidentes += datos.byteLength; this.fallos++;
      while (this.cache.size > this.maxSectores) {
        const k = this.cache.keys().next().value, viejo = this.cache.get(k);
        this.cache.delete(k); this.bytesResidentes -= viejo.byteLength; this.expulsiones++;
      }
    }
    this._ultimoId = id; this._ultimo = datos; this._hot = 0;
    return datos;
  }
  valor(tx, ty) {
    if (!Number.isSafeInteger(tx) || !Number.isSafeInteger(ty) ||
      tx < 0 || ty < 0 || tx >= this.spec.w || ty >= this.spec.h) return undefined;
    return this.valorSeguro(tx, ty);
  }
  /* Llamado solamente cuando Mundo.suelo/nivel ya comprobaron los límites.
     Elimina dos Number.isSafeInteger por casilla en la ruta de render. */
  valorSeguro(tx, ty) {
    const lado = this.spec.lado, ix = Math.floor(tx / lado), iy = Math.floor(ty / lado);
    const w = Math.min(lado, this.spec.w - ix * lado);
    const sector = this._pedir(ix, iy);
    return sector[(ty - iy * lado) * w + tx - ix * lado];
  }
  /* Compatibilidad de `capa(nombre)`: materialización EXPLÍCITA de la
     cuadrícula completa. No ocurre durante la precarga normal del paquete. */
  completa() {
    const S = this.spec, resultado = S.tipo === 'i8'
      ? new Int8Array(S.w * S.h) : new Uint8Array(S.w * S.h);
    for (let iy = 0; iy < S.ny; iy++) for (let ix = 0; ix < S.nx; ix++) {
      const d = this._dim(ix, iy), chunk = this._pedir(ix, iy);
      for (let y = 0; y < d.h; y++) {
        const desde = y * d.w, hasta = desde + d.w, destino = (iy * S.lado + y) * S.w + ix * S.lado;
        resultado.set(chunk.subarray(desde, hasta), destino);
      }
    }
    this.limpiar(); // Los sectores ya no son necesarios cuando la capa está completa.
    return resultado;
  }
  diagnostico() {
    return { residentes: this.cache.size, maxSectores: this.maxSectores,
      bytesResidentes: this.bytesResidentes, aciertos: this.aciertos,
      descompresiones: this.fallos, expulsiones: this.expulsiones };
  }
  limpiar() {
    this.cache.clear(); this.bytesResidentes = 0; this._ultimo = null;
    this._ultimoId = -1; this._hot = 0;
  }
}
MC.RasterMC4 = RasterMC4;
