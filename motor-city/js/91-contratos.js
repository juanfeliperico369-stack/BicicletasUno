/* =====================================================================
   CONTRATOS · datos versionados para que el mundo y el estado viajen entre motores (2.8; entrega maestra §12.3 y §16)
   - Cada formato que sale del motor lleva `schema_version` y tiene su esquema JSON en schemas/:
       escena.schema.json (MC.Exportar.escena) · puente.schema.json (MC.Puente.instantanea) · entidad.schema.json
   - MC.Contratos.validar(dato, esquema) revisa un subconjunto de JSON Schema (type, required, properties, items,
     enum, minimum, maximum, minItems, const) sin librerías, para que lo que produzca una IA pase antes de entrar.
   - La física y el estado no cambian con la calidad gráfica: el contrato describe el mundo, no cómo se ve.
   Uso: const errores = MC.Contratos.validar(MC.Exportar.escena(M, caja), esquema)   // [] si está bien
   ===================================================================== */
const Contratos = {
  VERSION: 1,
  tipoDe(v) { return v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v; },
  validar(v, S, ruta = '$', err = [], max = 50) {
    if (!S || err.length >= max) return err;
    if (S.const !== undefined && v !== S.const) err.push(ruta + ': debe ser ' + JSON.stringify(S.const));
    if (S.enum && !S.enum.includes(v)) err.push(ruta + ': no es uno de ' + S.enum.join(', '));
    if (S.type) { const t = this.tipoDe(v), ok = [].concat(S.type).some(x => x === t || (x === 'number' && t === 'integer')); if (!ok) { err.push(ruta + ': se esperaba ' + [].concat(S.type).join('|') + ' y llegó ' + t); return err; } }
    if (typeof v === 'number') { if (S.minimum !== undefined && v < S.minimum) err.push(ruta + ': menor que ' + S.minimum); if (S.maximum !== undefined && v > S.maximum) err.push(ruta + ': mayor que ' + S.maximum); }
    if (Array.isArray(v)) { if (S.minItems !== undefined && v.length < S.minItems) err.push(ruta + ': menos de ' + S.minItems + ' elementos'); if (S.maxItems !== undefined && v.length > S.maxItems) err.push(ruta + ': más de ' + S.maxItems + ' elementos'); if (S.items) for (let i = 0; i < v.length && err.length < max; i++) this.validar(v[i], S.items, ruta + '[' + i + ']', err, max); }
    if (v && typeof v === 'object' && !Array.isArray(v)) { for (const k of S.required || []) if (!(k in v)) err.push(ruta + ': falta «' + k + '»'); if (S.properties) for (const [k, s2] of Object.entries(S.properties)) if (k in v) this.validar(v[k], s2, ruta + '.' + k, err, max); }
    return err;
  }
};
MC.Contratos = Contratos;
