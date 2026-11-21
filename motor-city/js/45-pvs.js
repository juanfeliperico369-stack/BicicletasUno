/* =====================================================================
   PVS · conjunto potencialmente visible, calculado por adelantado (4.5, C‑M37)
   Idea de Quake (id Software, 1996), rehecha desde cero (sala limpia): el mapa se parte en celdas y, antes de jugar,
   se calcula desde cada celda qué otras se alcanzan a ver. En el juego basta con mirar una tabla de bits.
   Aquí la ciudad es un campo de alturas (suelo + edificios, 2,5D), así que el cálculo es el del horizonte de Comanche:
   desde unos ojos repartidos por las calles de cada celda de 160 m se lanzan rayos en 720 direcciones y se marca toda
   columna cuya cima asoma por encima del horizonte que va dejando lo más alto que el rayo ya cruzó
   (herramientas/pvs.mjs, con varios núcleos). La comprobación (pruebas/pvs.mjs) usa cámaras al azar que no son esos ojos.
   Formato (datos/<mundo>/pvs.bin): 'PVS1' · u32 largo del JSON · JSON { P, r, nx, ny, he, bytes, ... } · bits (deflate crudo).
   Cada celda guarda una ventana de (2r+1)² bits alrededor suyo: 1 = se puede ver. Lo que cae fuera de la ventana no se
   recorta con el PVS (lo recorta la niebla). Una celda sin ojos (agua, un edificio enorme) tiene la ventana llena de unos.
   Uso: M.pvs = MC.PVS.leer(bytes); y en la vista 3D: const V = M.pvs.desde(x, y); V.ve(x2, y2)
   ===================================================================== */
class PVS {
  constructor(meta, bits) {
    this.meta = meta; this.P = meta.P; this.r = meta.r; this.nx = meta.nx; this.ny = meta.ny; this.he = meta.he || 16;
    this.lado = 2 * this.r + 1; this.porCelda = Math.ceil(this.lado * this.lado / 8); this.bits = bits;
    if (bits.length !== this.nx * this.ny * this.porCelda) throw new Error('PVS: tamaño inconsistente');
  }
  static leer(fuente) {
    const u8 = typeof fuente === 'string' ? deB64(fuente) : fuente;
    if (String.fromCharCode(u8[0], u8[1], u8[2], u8[3]) !== 'PVS1') throw new Error('no es un PVS1');
    const n = u8[4] | u8[5] << 8 | u8[6] << 16 | u8[7] << 24, meta = JSON.parse(new TextDecoder().decode(u8.subarray(8, 8 + n)));
    return new PVS(meta, inflarSync(u8.subarray(8 + n), meta.bytes));
  }
  /* del HTML de un juego: <script type="text/plain" id="pvs-<mundo>"> (si no está, null y todo sigue igual) */
  static deElemento(id) { try { const el = typeof document !== 'undefined' && document.getElementById('pvs-' + id); return el ? PVS.leer(el.textContent.trim()) : null; } catch (e) { MC.falla && MC.falla('pvs ' + id, e); return null; } }
  celda(x, y) { return [Math.floor(x / this.P), Math.floor(y / this.P)]; }
  /* ¿desde la celda (cx, cy) se ve la celda (tx, ty)? */
  veCelda(cx, cy, tx, ty) {
    const dx = tx - cx, dy = ty - cy, r = this.r;
    if (dx < -r || dx > r || dy < -r || dy > r || cx < 0 || cy < 0 || cx >= this.nx || cy >= this.ny) return true;
    const b = (dy + r) * this.lado + dx + r, o = (cy * this.nx + cx) * this.porCelda;
    return (this.bits[o + (b >> 3)] >> (b & 7) & 1) === 1;
  }
  /* desde un punto: la unión de las celdas que toca un cuadrado de ±margen (la cámara se mueve entre celdas y queda
     unos metros detrás del jugador). Devuelve { ve(x, y), celdas } para preguntar por puntos del mundo. */
  desde(x, y, margen = 28) {
    const P = this.P, cs = [], vistas = new Set();
    for (const [ax, ay] of [[-margen, -margen], [margen, -margen], [-margen, margen], [margen, margen]]) { const cx = Math.floor((x + ax) / P), cy = Math.floor((y + ay) / P), k = cx + ',' + cy; if (!vistas.has(k)) { vistas.add(k); cs.push([cx, cy]); } }
    return { celdas: cs, ve: (px, py) => { const tx = Math.floor(px / P), ty = Math.floor(py / P); for (const [cx, cy] of cs) if (this.veCelda(cx, cy, tx, ty)) return true; return false; } };
  }
  /* cuántas celdas de la ventana se ven, en promedio (para el informe y las pruebas) */
  resumen() {
    let tot = 0, llenas = 0; const W2 = this.lado * this.lado;
    for (let c = 0; c < this.nx * this.ny; c++) { let n = 0; const o = c * this.porCelda; for (let b = 0; b < W2; b++) n += this.bits[o + (b >> 3)] >> (b & 7) & 1; if (n === W2) llenas++; else tot += n; }
    const conDatos = this.nx * this.ny - llenas;
    return { celdas: this.nx * this.ny, conDatos, ventana: W2, vistasMedia: conDatos ? +(tot / conDatos).toFixed(1) : W2, recorteMedio: conDatos ? +(1 - tot / conDatos / W2).toFixed(3) : 0 };
  }
}
MC.PVS = PVS;
