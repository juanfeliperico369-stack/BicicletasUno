/* 3.12.1 · Código tragado por un comentario.
   Tres veces (18, 21 y 23‑nov) una IA agregó un comentario // al final de una línea que seguía con código, y ese código quedó muerto
   (la pausa de El Metro, el final de la caminata y los árboles de las montañas de EnCicla; El Metro 3.12.1 y EnCicla 3.11.1). Este revisor busca, en src/js, un
   comentario de línea que contenga órdenes de JavaScript (if (…) x = …; · ; const · return; · st.algo = …;). Lo corren las pruebas.
   Uso: node tools/comentarios-tragados.mjs [carpeta…] → imprime los hallazgos; sale con 1 si hay alguno. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const RE = /(\bif \([^)]{1,80}\)\s*[\w.$[\]]+\s*(=|\+=|-=)[^;]{0,80};)|(;\s*(if|const|let|return|for)\b[ (])|(\breturn;)|(\b(st|this|G|C)\.[\w.]+\s*=\s*[^=;]{1,60};)/;
export function tragados(dirs) {
  const hall = [];
  const revisar = f => fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
    let k = -1, q = null;
    for (let j = 0; j < l.length - 1; j++) { const c = l[j]; if (q) { if (c === '\\') j++; else if (c === q) q = null; continue; } if (c === '"' || c === "'" || c === '`') { q = c; continue; } if (c === '/' && l[j + 1] === '/' && l[j - 1] !== ':') { k = j; break; } }
    if (k >= 0 && l.slice(0, k).trim() && RE.test(l.slice(k + 2))) hall.push(path.relative(RAIZ, f) + ':' + (i + 1) + ' · ' + l.slice(k + 2).trim().slice(0, 120));
  });
  const andar = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) andar(p); else if (/\.m?js$/.test(e.name)) revisar(p); } };
  for (const d of dirs) andar(d);
  return hall;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const h = tragados(process.argv.length > 2 ? process.argv.slice(2) : [path.join(RAIZ, 'src/js')]);
  console.log(h.length ? '✗ código tragado por un comentario:\n' + h.join('\n') : '✓ ningún comentario de línea se traga código'); process.exit(h.length ? 1 : 0);
}
