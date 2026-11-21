/* C-M34 · Caché acotada de sectores de 1 km para edificios ED1.
   El mundo MC4 y las capas de suelo permanecen en memoria: esto NO es
   streaming de bytes. El cargador de chunks queda como etapa independiente.
   Prioridad por proximidad: con radio > presupuesto, no recorrer/descartar
   sectores lejanos cada actualización. Funciona sin red y no toca guardados. */
class Sectores1km {
  constructor(mundo, op = {}) {
    const positivo = (v, defecto, minimo, nombre) => {
      if (v === undefined) return defecto;
      if (!Number.isFinite(v) || v < minimo) throw new RangeError(nombre + ' inválido');
      return Math.max(minimo, Math.floor(v));
    };
    this.mundo = mundo;
    this.lado = positivo(op.lado, 1000, 250, 'lado');
    this.maxSectores = positivo(op.maxSectores, 9, 1, 'maxSectores');
    this.maxRegiones = positivo(op.maxRegiones, 36, 4, 'maxRegiones');
    this.radio = op.radio === undefined ? 1 : positivo(op.radio, 1, 0, 'radio');
    if (this.radio > 3) throw new RangeError('radio superior a 3');
    this.cache = new Map();
    this.ultimo = { sx: 0, sy: 0, antes: 0, despues: 0, evictas: 0, sectores: 0 };
    /* Se calcula una vez: distancia al centro, después prioridad axial.
       Así siempre conserva el centro aun si maxSectores < (2*radio+1)^2. */
    this.cercanos = [];
    for (let dy = -this.radio; dy <= this.radio; dy++) {
      for (let dx = -this.radio; dx <= this.radio; dx++) {
        this.cercanos.push({ dx, dy, d: dx * dx + dy * dy });
      }
    }
    this.cercanos.sort((a, b) => a.d - b.d || Math.abs(a.dx) + Math.abs(a.dy) - Math.abs(b.dx) - Math.abs(b.dy) || a.dy - b.dy || a.dx - b.dx);
    this.cercanos.length = Math.min(this.cercanos.length, this.maxSectores);
  }
  zona(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new RangeError('Coordenadas de sector inválidas');
    return { sx: Math.floor(x / this.lado), sy: Math.floor(y / this.lado) };
  }
  pedir(sx, sy) {
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) return null;
    sx = Math.floor(sx); sy = Math.floor(sy);
    const clave = sx + ',' + sy;
    if (this.cache.has(clave)) {
      const c = this.cache.get(clave);
      this.cache.delete(clave); this.cache.set(clave, c);
      return c;
    }
    const x0 = sx * this.lado, y0 = sy * this.lado, x1 = x0 + this.lado, y1 = y0 + this.lado, m = this.mundo;
    const sector = {
      id: clave, sx, sy, x0, y0, x1, y1,
      /* Geometría a petición, nunca dos copias por sector. */
      edificios: () => typeof m?.edificiosEn === 'function' ? m.edificiosEn(x0, y0, x1, y1, []) : []
    };
    this.cache.set(clave, sector);
    while (this.cache.size > this.maxSectores) this.cache.delete(this.cache.keys().next().value);
    return sector;
  }
  actualizar(x, y) {
    const { sx, sy } = this.zona(x, y);
    for (const { dx, dy } of this.cercanos) this.pedir(sx + dx, sy + dy);
    const E = this.mundo?._ED;
    if (!E || !E.cache || typeof E.cache.keys !== 'function' || typeof E.cache.delete !== 'function' || !Number.isFinite(E.R) || E.R <= 0 || !Number.isInteger(E.nx) || E.nx <= 0) {
      return (this.ultimo = { sx, sy, antes: 0, despues: 0, evictas: 0, sectores: this.cache.size });
    }
    const ids = [...E.cache.keys()], antes = ids.length, max = this.maxRegiones;
    const dist2 = k => {
      const rx = k % E.nx, ry = Math.floor(k / E.nx), dx = (rx + .5) * E.R - x, dy = (ry + .5) * E.R - y;
      return dx * dx + dy * dy;
    };
    ids.sort((a, b) => dist2(a) - dist2(b));
    const distanciaMax = Math.pow((this.radio + 1.4) * this.lado, 2), conservar = new Set();
    for (const k of ids) if (conservar.size < max && dist2(k) <= distanciaMax) conservar.add(k);
    for (const k of ids) if (!conservar.has(k)) E.cache.delete(k);
    return (this.ultimo = { sx, sy, antes, despues: E.cache.size, evictas: antes - E.cache.size, sectores: this.cache.size });
  }
  limpiar() { this.cache.clear(); }
}
MC.Sectores1km = Sectores1km;
