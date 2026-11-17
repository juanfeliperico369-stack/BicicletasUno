#!/usr/bin/env node
/* Compila el documento único para IA (dist/ENCICLA-TODO.md):
   docs/IA-ENCICLA.md + el script de entregas + anexos (textos actuales de la historia, guía y bitácora).
   Lo llama tools/build.js; también se puede correr solo: node tools/todo-ia.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* literal de objeto que abre en s[i] (salta cadenas y comentarios) */
function literal(s, i) {
  let d = 0, q = null;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (q) { if (c === '\\') j++; else if (c === q) q = null; continue; }
    if (c === '/' && s[j + 1] === '/') { j = s.indexOf('\n', j); if (j < 0) return null; continue; }
    if (c === '/' && s[j + 1] === '*') { j = s.indexOf('*/', j + 2) + 1; if (j <= 0) return null; continue; }
    if (c === "'" || c === '"' || c === '`') q = c;
    else if (c === '{' || c === '[') d++;
    else if ((c === '}' || c === ']') && --d === 0) return s.slice(i, j + 1);
  }
  return null;
}
/* une los objetos de `const NOMBRE = {` y de `Object.assign(NOMBRE, {` */
function objeto(src, nombre) {
  const re = new RegExp(`(?:const ${nombre} = |Object\\.assign\\(${nombre}, )\\{`, 'g'), out = {}; let m;
  while ((m = re.exec(src))) { const t = literal(src, m.index + m[0].length - 1); if (t) Object.assign(out, vm.runInNewContext('(' + t + ')')); }
  return out;
}
/* baja un nivel los títulos de un documento anexo (fuera de los bloques de código) */
const bajar = t => { let f = false; return t.split('\n').map(l => { if (/^\s*```/.test(l)) f = !f; return !f && /^#{1,5} /.test(l) ? '#' + l : l; }).join('\n'); };

function compilar() {
  const src = ['66-historia.js', '72-oficios2.js', '80-limpieza.js'].map(f => rd('src/js/' + f)).join('\n');
  const H = objeto(src, 'HISTORIA'), C = objeto(src, 'CAST');
  let anexoA = '# Anexo A · Textos actuales de la historia\n\n> Lo que hoy dice cada personaje en sus turnos. *Antes*: al empezar el turno · *Después*: al aprobarlo. El Guionista los continúa y mejora (H-20).\n\n';
  for (const [rol, arr] of Object.entries(H)) {
    const c = C[rol] || [rol, ''];
    anexoA += `## ${c[0]} · ${c[1]} (\`${rol}\`)\n\n` + arr.map((e, i) => `${i + 1}. **${e.t}**\n   - Antes: ${e.a}\n   - Después: ${e.d}`).join('\n') + '\n\n';
  }
  const version = (rd('src/js/00-core.js').match(/version: '([^']+)'/) || [])[1] || '';
  const d = new Date(), fecha = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const doc = rd('docs/IA-ENCICLA.md').replace(/\{\{VERSION\}\}/g, version).replace(/\{\{FECHA\}\}/g, fecha)
    .replace(/<!-- incluir:([\w./-]+) -->/g, (_, f) => rd(f).trimEnd()).trimEnd()
    + '\n\n---\n\n' + anexoA.trimEnd()
    + '\n\n---\n\n# Anexo B · Guía del juego\n\n' + bajar(rd('docs/GUIA.md')).trimEnd()
    + '\n\n---\n\n# Anexo C · Bitácora de desarrollo\n\n' + bajar(rd('docs/BITACORA.md')).trimEnd()
    + '\n\n---\n\n# FIN DEL DOCUMENTO\n';
  fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'dist', 'ENCICLA-TODO.md'), doc);
  return { bytes: Buffer.byteLength(doc), roles: Object.keys(H).length, turnos: Object.values(H).reduce((n, a) => n + a.length, 0) };
}
module.exports = compilar;
if (require.main === module) { const r = compilar(); console.log('dist/ENCICLA-TODO.md ·', (r.bytes / 1024).toFixed(0), 'KB ·', r.roles, 'oficios ·', r.turnos, 'textos de historia'); }
