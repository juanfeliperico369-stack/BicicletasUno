/* Estado persistente de sectores. Las coordenadas e identificadores pertenecen al mundo,
   y los cambios son datos JSON que el juego interpreta al activar cada sector. */
class GuardadoSectores {
  constructor(op = {}) {
    this.lado = op.lado ?? 128;
    if (!Number.isFinite(this.lado) || this.lado <= 0) throw new Error('El tamaño del sector debe ser positivo');
    this.mundo = String(op.mundo || '');
    this.sectores = new Map();
    this.activos = new Set();
  }
  sector(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Coordenadas de sector inválidas');
    return Math.floor(x / this.lado) + ',' + Math.floor(y / this.lado);
  }
  /* La identidad no depende del orden de carga ni de la calidad gráfica. */
  static id(mundo, tipo, clave) {
    if (![mundo, tipo, clave].every(v => typeof v === 'string' && v.length)) throw new Error('El ID requiere mundo, tipo y clave');
    return [mundo, tipo, clave].map(encodeURIComponent).join('/');
  }
  cambiar(x, y, id, cambio) {
    if (typeof id !== 'string' || !id) throw new Error('Falta el ID estable del objeto');
    if (!cambio || typeof cambio !== 'object' || Array.isArray(cambio)) throw new Error('El cambio debe ser un objeto JSON');
    const copia = JSON.parse(JSON.stringify(cambio)), clave = this.sector(x, y);
    let datos = this.sectores.get(clave);
    if (!datos) this.sectores.set(clave, datos = new Map());
    datos.set(id, copia);
  }
  obtener(x, y, id) {
    const dato = this.sectores.get(this.sector(x, y))?.get(id);
    return dato === undefined ? null : JSON.parse(JSON.stringify(dato));
  }
  quitar(x, y, id) {
    const clave = this.sector(x, y), datos = this.sectores.get(clave);
    if (!datos || !datos.delete(id)) return false;
    if (!datos.size) this.sectores.delete(clave);
    return true;
  }
  /* Devuelve los cambios de actividad para que el juego cargue o retire sus objetos. */
  actualizar(x, y, radio = 1) {
    if (!Number.isInteger(radio) || radio < 0) throw new Error('El radio debe ser un entero no negativo');
    const [sx, sy] = this.sector(x, y).split(',').map(Number), nuevos = new Set();
    for (let j = sy - radio; j <= sy + radio; j++) for (let i = sx - radio; i <= sx + radio; i++) nuevos.add(i + ',' + j);
    const despiertan = [...nuevos].filter(k => !this.activos.has(k));
    const duermen = [...this.activos].filter(k => !nuevos.has(k));
    this.activos = nuevos;
    return { despiertan, duermen };
  }
  instantanea() {
    const sectores = {};
    for (const [clave, datos] of this.sectores) sectores[clave] = Object.fromEntries(datos);
    return JSON.parse(JSON.stringify({ schema_version: 1, mundo: this.mundo, lado: this.lado, sectores }));
  }
  static restaurar(datos, migradores = {}) {
    let copia = JSON.parse(JSON.stringify(datos));
    if (!copia || typeof copia !== 'object' || Array.isArray(copia)) throw new Error('Guardado inválido');
    if (copia.schema_version === undefined) copia.schema_version = 0;
    while (copia.schema_version !== 1) {
      const v = copia.schema_version, migrar = migradores[v];
      if (!Number.isInteger(v) || v < 0 || v > 1 || typeof migrar !== 'function') throw new Error('Versión de guardado no admitida: ' + v);
      copia = migrar(copia);
      if (!copia || copia.schema_version !== v + 1) throw new Error('El migrador debe avanzar una versión');
    }
    if (typeof copia.mundo !== 'string' || !Number.isFinite(copia.lado) || copia.lado <= 0 || !copia.sectores || typeof copia.sectores !== 'object' || Array.isArray(copia.sectores)) throw new Error('Guardado de sectores inválido');
    const resultado = new GuardadoSectores({ mundo: copia.mundo, lado: copia.lado });
    for (const [clave, objetos] of Object.entries(copia.sectores)) {
      if (!/^-?\d+,-?\d+$/.test(clave) || !objetos || typeof objetos !== 'object' || Array.isArray(objetos)) throw new Error('Sector inválido: ' + clave);
      const lista = new Map();
      for (const [id, valor] of Object.entries(objetos)) {
        if (!id || !valor || typeof valor !== 'object' || Array.isArray(valor)) throw new Error('Cambio inválido: ' + id);
        lista.set(id, valor);
      }
      resultado.sectores.set(clave, lista);
    }
    return resultado;
  }
  guardar(clave, almacenamiento = typeof localStorage !== 'undefined' ? localStorage : null) {
    if (!almacenamiento) return false;
    try { almacenamiento.setItem(clave, JSON.stringify(this.instantanea())); return true; }
    catch (e) { return false; }
  }
  static leer(clave, almacenamiento = typeof localStorage !== 'undefined' ? localStorage : null, migradores = {}) {
    if (!almacenamiento) return null;
    const datos = almacenamiento.getItem(clave);
    return datos === null ? null : GuardadoSectores.restaurar(JSON.parse(datos), migradores);
  }
}
MC.GuardadoSectores = GuardadoSectores;
