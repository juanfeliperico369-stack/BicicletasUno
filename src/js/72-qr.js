/* =====================================================================
   QR · codificador propio (modo byte UTF-8, versiones 1–40, ECC L–H)
   y ayudante de escaneo con cámara (BarcodeDetector). Sin dependencias.
   ===================================================================== */
// Tablas por versión (índice 0 sin uso). Filas por nivel: L, M, Q, H
const qrECC = [ // codewords de corrección por bloque
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]];
const qrBLK = [ // número de bloques de corrección
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]];
const qrFMT = [1, 0, 3, 2]; // bits de nivel en la información de formato (L, M, Q, H)
const qrMASK = [ // x = columna, y = fila; true = invertir módulo
  (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
  (x, y) => ((x / 3 | 0) + (y / 2 | 0)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
  (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];

// Aritmética en GF(256) con polinomio 0x11D (tablas exp/log)
const qrEXP = new Uint8Array(512), qrLOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) { qrEXP[i] = x; qrLOG[x] = i; x = (x << 1) ^ (x & 0x80 ? 0x11D : 0); }
for (let i = 255; i < 512; i++) qrEXP[i] = qrEXP[i - 255];
const qrMul = (a, b) => a && b ? qrEXP[qrLOG[a] + qrLOG[b]] : 0;

// Reed–Solomon: polinomio generador de grado `deg` (coeficientes sin el término líder)
function qrRSDiv(deg) {
  const r = new Uint8Array(deg); r[deg - 1] = 1;
  for (let i = 0, root = 1; i < deg; i++, root = qrMul(root, 2))
    for (let j = 0; j < deg; j++) { r[j] = qrMul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; }
  return r;
}
function qrRSRem(data, div) { // resto de data·x^deg / generador = codewords ECC
  const n = div.length, r = new Uint8Array(n);
  for (let k = 0; k < data.length; k++) {
    const f = data[k] ^ r[0]; r.copyWithin(0, 1); r[n - 1] = 0;
    if (f) for (let i = 0; i < n; i++) r[i] ^= qrMul(div[i], f);
  }
  return r;
}

// Módulos disponibles para datos+ECC (sin patrones de función ni formato/versión)
function qrRaw(v) {
  let r = (16 * v + 128) * v + 64;
  if (v >= 2) { const n = (v / 7 | 0) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
  return r;
}
const qrDataCW = (v, e) => (qrRaw(v) >> 3) - qrECC[e][v] * qrBLK[e][v];
function qrAlign(v) { // centros de los patrones de alineación
  if (v === 1) return [];
  const n = (v / 7 | 0) + 2, step = ((v * 8 + n * 3 + 5) / (n * 4 - 4) | 0) * 2, r = [6];
  for (let p = v * 4 + 10; r.length < n; p -= step) r.splice(1, 0, p);
  return r;
}
// Divide en bloques, añade ECC a cada uno e intercala
function qrBlocks(data, v, e) {
  const nb = qrBLK[e][v], el = qrECC[e][v], raw = qrRaw(v) >> 3,
    nShort = nb - raw % nb, sLen = raw / nb | 0, div = qrRSDiv(el), blk = [];
  for (let i = 0, k = 0; i < nb; i++) {
    const len = sLen - el + (i < nShort ? 0 : 1), d = data.subarray(k, k + len); k += len;
    blk.push([d, qrRSRem(d, div)]);
  }
  const out = new Uint8Array(raw); let o = 0;
  for (let i = 0; i <= sLen - el; i++) for (const [d] of blk) if (i < d.length) out[o++] = d[i];
  for (let i = 0; i < el; i++) for (const [, c] of blk) out[o++] = c[i];
  return out;
}
// Penalización estándar (reglas N1–N4) para elegir máscara
function qrPenalty(m, n) {
  let p = 0, dark = 0;
  // N3: historial de las últimas 7 rachas para hallar 1:1:3:1:1 con 4 claros a un lado (el borde cuenta como claro)
  const h = new Int32Array(7), add = len => { if (!h[0]) len += n; h.copyWithin(1, 0, 6); h[0] = len; },
    fnd = () => { const u = h[1]; return u > 0 && h[2] === u && h[3] === u * 3 && h[4] === u && h[5] === u ? (h[0] >= u * 4 && h[6] >= u) + (h[6] >= u * 4 && h[0] >= u) : 0; };
  for (let pass = 0; pass < 2; pass++) // 0: filas, 1: columnas
    for (let a = 0; a < n; a++) {
      let col = 0, run = 0; h.fill(0);
      for (let b = 0; b < n; b++) {
        const c = pass ? m[b * n + a] : m[a * n + b];
        if (c === col) { if (++run === 5) p += 3; else if (run > 5) p++; } // N1: rachas de 5+
        else { add(run); if (!col) p += fnd() * 40; col = c; run = 1; }
      }
      if (col) { add(run); run = 0; }
      add(run + n); p += fnd() * 40;
    }
  for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) {
    const i = y * n + x, c = m[i];
    if (c === m[i + 1] && c === m[i + n] && c === m[i + n + 1]) p += 3;
  }
  for (let i = 0; i < n * n; i++) dark += m[i];
  return p + (Math.ceil(Math.abs(dark * 20 - n * n * 10) / (n * n)) - 1) * 10;
}
function qrCamErr(e) {
  const n = (e && e.name) || '';
  if (/NotAllowed|Security|PermissionDenied/.test(n)) return 'Permiso de cámara denegado. Actívalo en la configuración del navegador o escribe el código a mano.';
  if (/NotFound|Overconstrained|DevicesNotFound/.test(n)) return 'No se encontró ninguna cámara en este dispositivo.';
  if (/NotReadable|TrackStart|Abort/.test(n)) return 'La cámara está ocupada por otra aplicación.';
  return 'No se pudo abrir la cámara' + (e && e.message ? ': ' + e.message : '.');
}

const QR = JE.qr = {
  _scan: null, // estado del escaneo activo
  // Matriz QR del texto (UTF-8, modo byte). ecl = nivel mínimo ('L' por defecto);
  // se usa la versión más pequeña que cabe y luego se sube el nivel si sigue cabiendo.
  matrix(text, ecl = 'L') {
    const bytes = new TextEncoder().encode(String(text));
    let e = Math.max(0, 'LMQH'.indexOf(ecl)), ver = 0;
    for (let v = 1; v <= 40 && !ver; v++)
      if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= qrDataCW(v, e) * 8) ver = v;
    if (!ver) throw new Error('QR: texto demasiado largo (' + bytes.length + ' bytes)');
    const cc = ver < 10 ? 8 : 16, used = 4 + cc + bytes.length * 8;
    while (e < 3 && used <= qrDataCW(ver, e + 1) * 8) e++;
    // Flujo de bits: modo 0100, longitud, datos, terminador, relleno
    const nData = qrDataCW(ver, e), data = new Uint8Array(nData); let bl = 0;
    const put = (val, n) => { for (let i = n - 1; i >= 0; i--, bl++) data[bl >> 3] |= (val >>> i & 1) << (7 - (bl & 7)); };
    put(4, 4); put(bytes.length, cc); for (const b of bytes) put(b, 8);
    bl += Math.min(4, nData * 8 - bl); bl = (bl + 7) & ~7; // terminador + alinear a byte
    for (let i = bl >> 3, p = 0xEC; i < nData; i++, p ^= 0xEC ^ 0x11) data[i] = p;
    const cw = qrBlocks(data, ver, e);
    // Patrones de función
    const size = ver * 4 + 17, mod = new Uint8Array(size * size), fn = new Uint8Array(size * size);
    const set = (x, y, d) => { mod[y * size + x] = d ? 1 : 0; fn[y * size + x] = 1; };
    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); } // temporización
    for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) // localizadores + separadores
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
      }
    const al = qrAlign(ver), na = al.length; // alineación (salvo las 3 esquinas de localizadores)
    for (let i = 0; i < na; i++) for (let j = 0; j < na; j++) {
      if ((i === 0 && (j === 0 || j === na - 1)) || (i === na - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
        set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    const drawFmt = mask => { // información de formato (BCH 15,5) en ambas copias
      const d = qrFMT[e] << 3 | mask; let r = d;
      for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = (d << 10 | r) ^ 0x5412, g = i => b >>> i & 1;
      for (let i = 0; i <= 5; i++) set(8, i, g(i));
      set(8, 7, g(6)); set(8, 8, g(7)); set(7, 8, g(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, g(i));
      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, g(i));
      for (let i = 8; i < 15; i++) set(8, size - 15 + i, g(i));
      set(8, size - 8, 1); // módulo oscuro fijo
    };
    drawFmt(0); // reserva
    if (ver >= 7) { // información de versión (BCH 18,6)
      let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      const b = ver << 12 | r;
      for (let i = 0; i < 18; i++) { const bit = b >>> i & 1, a = size - 11 + i % 3, c = i / 3 | 0; set(a, c, bit); set(c, a, bit); }
    }
    // Colocación en zigzag de columnas dobles, de derecha a izquierda
    for (let right = size - 1, i = 0, nb = cw.length * 8; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      const up = ((right + 1) & 2) === 0;
      for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, y = up ? size - 1 - vert : vert, k = y * size + x;
        if (!fn[k] && i < nb) { mod[k] = cw[i >> 3] >>> (7 - (i & 7)) & 1; i++; }
      }
    }
    // Probar las 8 máscaras y quedarse con la de menor penalización
    const flip = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const k = y * size + x; if (!fn[k] && qrMASK[m](x, y)) mod[k] ^= 1; } };
    let best = 0, bestP = Infinity;
    for (let m = 0; m < 8; m++) {
      flip(m); drawFmt(m);
      const p = qrPenalty(mod, size); if (p < bestP) { bestP = p; best = m; }
      flip(m);
    }
    flip(best); drawFmt(best);
    return { size, mod, ver, ecl: 'LMQH'[e], mask: best };
  },
  // Canvas nítido: `scale` px por módulo, `margin` módulos de zona silenciosa
  canvas(text, scale = 4, margin = 4, dark = '#0a2342', light = '#ffffff') {
    const q = text && text.mod ? text : QR.matrix(text), { size, mod } = q;
    scale = Math.max(1, Math.round(scale)); margin = Math.max(0, Math.round(margin));
    const n = (size + margin * 2) * scale, cv = document.createElement('canvas'), g = cv.getContext('2d');
    cv.width = cv.height = n; cv.style.imageRendering = 'pixelated';
    g.fillStyle = light; g.fillRect(0, 0, n, n); g.fillStyle = dark;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      if (!mod[y * size + x]) continue;
      let x2 = x; while (x2 + 1 < size && mod[y * size + x2 + 1]) x2++; // agrupar tramos horizontales
      g.fillRect((margin + x) * scale, (margin + y) * scale, (x2 - x + 1) * scale, scale); x = x2;
    }
    return cv;
  },
  // ---- Escaneo con cámara ----
  canScan() { return typeof window !== 'undefined' && 'BarcodeDetector' in window && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); },
  // Detección única sobre un <video>/<img>/<canvas>: Promise<string|null>
  async scan(src) {
    if (!('BarcodeDetector' in window)) return null;
    const det = QR._det || (QR._det = new BarcodeDetector({ formats: ['qr_code'] }));
    const c = (await det.detect(src) || []).find(c => c.rawValue);
    return c ? c.rawValue : null;
  },
  // Abre la cámara trasera a pantalla completa; llama onText(texto) una sola vez y cierra.
  // Cancelar (botón o Esc) cierra sin llamar a nada. Errores -> onError(mensaje en español).
  startScan(onText, onError) {
    QR.stopScan();
    const err = msg => { QR.stopScan(); if (onError) onError(msg); };
    if (!QR.canScan()) { err('Este navegador no puede leer códigos QR con la cámara. Escribe el código a mano.'); return false; }
    let det;
    try { det = new BarcodeDetector({ formats: ['qr_code'] }); }
    catch (e) { err('Este navegador no puede leer códigos QR con la cámara. Escribe el código a mano.'); return false; }
    const ov = document.createElement('div');
    ov.className = 'qrScan';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0a2342;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:16px;box-sizing:border-box;text-align:center;font:600 17px system-ui,sans-serif';
    ov.innerHTML = '<div>Apunta la cámara al código QR</div>'
      + '<div style="width:min(82vw,62vh,440px);aspect-ratio:1;border:3px solid #fff;border-radius:14px;overflow:hidden;background:#000">'
      + '<video playsinline muted autoplay style="width:100%;height:100%;object-fit:cover;display:block"></video></div>'
      + '<button class="btn gh" type="button">Cancelar</button>';
    const video = $('video', ov);
    video.muted = true;
    $('button', ov).onclick = () => QR.stopScan();
    const st = QR._scan = { ov, video, stream: null, timer: 0, busy: false };
    st.onKey = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); QR.stopScan(); } };
    addEventListener('keydown', st.onKey, true);
    document.body.appendChild(ov);
    navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then(stream => {
        if (QR._scan !== st) { stream.getTracks().forEach(t => t.stop()); return; } // cancelado mientras tanto
        st.stream = stream; video.srcObject = stream;
        const pl = video.play(); if (pl && pl.catch) pl.catch(() => {});
        const tick = () => {
          if (QR._scan !== st) return;
          if (!st.busy && video.readyState >= 2) {
            st.busy = true;
            det.detect(video).then(codes => {
              st.busy = false;
              const c = (codes || []).find(c => c.rawValue);
              if (c && QR._scan === st) { QR.stopScan(); onText(c.rawValue); }
            }, () => { st.busy = false; });
          }
          st.timer = setTimeout(tick, 250);
        };
        tick();
      }, e => { if (QR._scan === st) err(qrCamErr(e)); });
    return true;
  },
  stopScan() {
    const st = QR._scan; if (!st) return;
    QR._scan = null; clearTimeout(st.timer);
    removeEventListener('keydown', st.onKey, true);
    if (st.stream) st.stream.getTracks().forEach(t => t.stop());
    try { st.video.srcObject = null; } catch (e) { /* nada */ }
    st.ov.remove();
  },
};
