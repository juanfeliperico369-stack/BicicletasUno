#!/usr/bin/env node
/* MOTOR CITY · las skills y los plugins de las IA (las externas, con su commit revisado, están en skills-externas.json)
   node motor.mjs skills                    la lista: las propias del repositorio, las externas y los plugins de Claude Code
   node motor.mjs skills --json             la misma lista en JSON (para otras IA y herramientas)
   node motor.mjs skills --integrar [--agente codex,antigravity,gemini-cli,claude-code]
                                            todo de una vez, en el repositorio donde se corre:
                                            1) las propias quedan iguales en .claude/skills (Claude Code) y en .agents/skills (Codex, Antigravity, Gemini CLI);
                                            2) el .gitignore, para que las externas instaladas nunca se suban;
                                            3) las externas, con el instalador oficial (npx skills add) y el commit revisado;
                                            4) la verificación.
   node motor.mjs skills --sincronizar [--desde claude|agents]   solo los pasos 1 y 2, sin internet
   node motor.mjs skills --verificar        revisa los pasos 1 y 2 y el catálogo (lo corre la QA); sale con 1 si algo falla
   node motor.mjs skills --instalar         solo el paso 3   ·   --comandos: solo imprime los comandos de npx
   Opciones:
     --en RUTA        otro repositorio (si no, la raíz git de donde se corre);
     --global         las externas en la carpeta del usuario;
     --sin-externas   salta el paso 3.
   En un juego hermano, desde la raíz del juego: node motor-city/motor.mjs skills --integrar --agente codex
   Las externas necesitan internet y Node 22. Se instalan en la máquina de cada IA y nunca van dentro del HTML de un juego.
   Para editar una skill propia, cámbiala en .claude/skills y corre --sincronizar. Para borrarla, bórrala de las dos carpetas. */
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), args = process.argv.slice(2), tiene = k => args.includes(k), val = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const leerJSON = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
const C = leerJSON(path.join(RAIZ, 'skills-externas.json'));
if (!C || !Array.isArray(C.skills)) { console.error('✗ No se pudo leer skills-externas.json'); process.exit(2); }
const raizGit = d => { const r = spawnSync('git', ['-C', d, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }); return r.status === 0 && r.stdout.trim() ? r.stdout.trim() : null; };
const DEST = val('--en') ? path.resolve(val('--en')) : raizGit(process.cwd()) || RAIZ, rel = p => path.relative(DEST, p) || '.';
if (!fs.existsSync(DEST)) { console.error('✗ No existe ' + DEST); process.exit(2); }
const DIR = { claude: '.claude/skills', agents: '.agents/skills' };
/* Son externas las del catálogo y cualquier otra que el instalador anotó en skills-lock.json. No son propias: no se copian ni se suben. */
const LOCK = Object.keys((leerJSON(path.join(DEST, 'skills-lock.json')) || {}).skills || {}), EXT = new Set([...C.skills.map(s => s.id), ...LOCK]);
const agentes = (val('--agente') || 'codex,antigravity,gemini-cli').split(',').map(s => s.trim()).filter(Boolean);
if (!agentes.every(a => /^[a-z0-9-]+$/.test(a))) { console.error('✗ --agente: nombres como codex, antigravity, gemini-cli o claude-code, separados por comas'); process.exit(2); }

/* ---------- las propias ---------- */
const esSkill = d => { try { return !fs.lstatSync(d).isSymbolicLink() && fs.statSync(d).isDirectory() && fs.existsSync(path.join(d, 'SKILL.md')); } catch (e) { return false; } };
const propias = (k, base = DEST) => { const b = path.join(base, DIR[k]); return fs.existsSync(b) ? fs.readdirSync(b).filter(n => !EXT.has(n) && !n.startsWith('.') && esSkill(path.join(b, n))).sort() : []; };
const archivos = (b, r = '') => fs.readdirSync(b, { withFileTypes: true }).filter(e => e.name !== '.DS_Store').flatMap(e => { const q = r ? r + '/' + e.name : e.name; return e.isDirectory() ? archivos(path.join(b, e.name), q) : [q]; }).sort();
const iguales = (a, b) => { const A = archivos(a), B = archivos(b); return A.length === B.length && A.every((f, i) => f === B[i] && fs.readFileSync(path.join(a, f)).equals(fs.readFileSync(path.join(b, f)))); };
/* name y description del encabezado de SKILL.md (también si la description viene en varias líneas, con > o |) */
const ficha = d => {
  const t = fs.readFileSync(path.join(d, 'SKILL.md'), 'utf8'), m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(t), L = m ? m[1].split(/\r?\n/) : [];
  const campo = k => { const i = L.findIndex(l => l.startsWith(k + ':')); if (i < 0) return ''; let v = L[i].slice(k.length + 1).trim(); if (/^[>|][-+]?$/.test(v)) { v = ''; for (let j = i + 1; j < L.length && /^\s+\S/.test(L[j]); j++) v += (v ? ' ' : '') + L[j].trim(); } return v.replace(/^(["'])(.*)\1$/, '$2'); };
  return { nombre: campo('name'), descripcion: campo('description') };
};
const donde = n => path.join(DEST, propias('claude').includes(n) ? DIR.claude : DIR.agents, n);
/* Copia en las dos direcciones lo que falta. Si una skill está en las dos carpetas y difiere, no pisa nada salvo que se diga --desde claude o --desde agents. */
const sincronizar = desde => {
  const a = propias('claude'), b = propias('agents'), hechos = [], choques = [];
  for (const n of [...new Set([...a, ...b])].sort()) {
    const pc = path.join(DEST, DIR.claude, n), pa = path.join(DEST, DIR.agents, n);
    let de = !b.includes(n) ? pc : !a.includes(n) ? pa : null;
    if (!de && !iguales(pc, pa)) { if (desde === 'claude' || desde === 'agents') de = desde === 'claude' ? pc : pa; else { choques.push(n); continue; } }
    if (!de) continue;
    const a_ = de === pc ? pa : pc; fs.rmSync(a_, { recursive: true, force: true }); fs.mkdirSync(path.dirname(a_), { recursive: true }); fs.cpSync(de, a_, { recursive: true });
    hechos.push(n + ' → ' + rel(path.dirname(a_)));
  }
  return { hechos, choques };
};

/* ---------- el .gitignore (sin barra final: el instalador deja en .claude/skills un enlace, y «carpeta/» no ignora enlaces) ---------- */
const GI = ['# skills externas que instala cada IA (node motor.mjs skills --integrar): no se suben', ...C.skills.flatMap(s => [DIR.agents + '/' + s.id, DIR.claude + '/' + s.id]), 'skills-lock.json', '.skill-lock.json', '.hallmark/'];
const faltanGI = () => { const f = path.join(DEST, '.gitignore'), t = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split(/\r?\n/).map(l => l.trim()) : []; return GI.slice(1).filter(l => !t.includes(l)); };
const arreglarGI = () => { const falta = faltanGI(), f = path.join(DEST, '.gitignore'); if (falta.length) { const t = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : ''; fs.writeFileSync(f, t + (t && !t.endsWith('\n') ? '\n' : '') + GI[0] + '\n' + falta.join('\n') + '\n'); } return falta; };

/* ---------- las externas ---------- */
/* El catálogo fija commits para no instalar por accidente otra versión. */
const fuenteFijada = s => { if (!/^[0-9a-f]{40}$/.test(s.commit) || !/^[\w.-]+\/[\w.-]+$/.test(s.repo) || !/^[\w.-]+$/.test(s.skill)) throw new Error('referencia no fijada o repositorio inválido para ' + s.id); return s.repo + '@' + s.commit; };
const cmd = s => ['-y', 'skills', 'add', fuenteFijada(s), '--skill', s.skill, ...agentes.flatMap(a => ['-a', a]), '-y', ...(tiene('--global') ? ['-g'] : [])];
const sinColor = t => String(t || '').replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').replace(/\r/g, '');
const instalar = soloComandos => {
  let mal = 0;
  for (const s of C.skills) {
    const c = cmd(s); if (soloComandos) { console.log('npx ' + c.join(' ')); continue; }
    const r = spawnSync('npx', c, { cwd: DEST, encoding: 'utf8', timeout: 300000, shell: process.platform === 'win32' });
    /* con Codex, Antigravity, Gemini CLI o Cursor queda en .agents/skills (y Claude Code recibe un enlace); con Claude Code solo, una copia en .claude/skills */
    const enA = fs.existsSync(path.join(DEST, DIR.agents, s.id, 'SKILL.md')), enC = fs.existsSync(path.join(DEST, DIR.claude, s.id, 'SKILL.md'));
    const ok = r.status === 0 && (tiene('--global') || enA || enC);
    if (ok) console.log('   ✓ ' + s.id + (tiene('--global') ? ' (carpeta del usuario)' : ' → ' + (enA ? DIR.agents + '/' + s.id + (enC ? ', con enlace en ' + DIR.claude : '') : DIR.claude + '/' + s.id)));
    else { mal++; const ult = sinColor(r.stderr || r.stdout || (r.error && r.error.message)).split('\n').map(l => l.trim()).filter(Boolean).slice(-3).join(' · '); console.error('   ✗ ' + s.id + ': no se pudo instalar (¿hay internet y Node 22?) ' + ult); }
  }
  return mal;
};

/* ---------- la verificación ---------- */
const verificar = () => {
  const a = propias('claude'), b = propias('agents'), mal = [];
  for (const n of a) if (!b.includes(n)) mal.push('falta en ' + DIR.agents + ': ' + n + ' (corre --sincronizar)');
  for (const n of b) if (!a.includes(n)) mal.push('falta en ' + DIR.claude + ': ' + n + ' (corre --sincronizar)');
  for (const n of a) if (b.includes(n) && !iguales(path.join(DEST, DIR.claude, n), path.join(DEST, DIR.agents, n))) mal.push('distinta en las dos carpetas: ' + n + ' (elige con --sincronizar --desde claude o --desde agents)');
  for (const n of [...new Set([...a, ...b])]) { const f = ficha(donde(n)); if (f.nombre !== n) mal.push(n + '/SKILL.md: el name dice «' + f.nombre + '» y debe ser el nombre de la carpeta'); if (!f.descripcion) mal.push(n + '/SKILL.md: falta la description'); }
  for (const l of faltanGI()) mal.push('falta en .gitignore: ' + l);
  for (const s of C.skills) try { fuenteFijada(s); } catch (e) { mal.push(e.message); }
  for (const n of LOCK) if (!C.skills.some(s => s.id === n)) mal.push('instalada sin estar en el catálogo: ' + n + ' (revísala y anótala en skills-externas.json, o bórrala)');
  return mal;
};

/* ---------- la lista ---------- */
const inventario = () => {
  const a = propias('claude'), b = propias('agents'), set = leerJSON(path.join(DEST, '.claude/settings.json')) || {}, on = set.enabledPlugins || {};
  return {
    repositorio: path.basename(DEST), motor: (leerJSON(path.join(RAIZ, 'VERSION.json')) || {}).version,
    donde_las_busca: { 'claude-code': DIR.claude, codex: DIR.agents, antigravity: DIR.agents, 'gemini-cli': DIR.agents + ' (o .gemini/skills)', cursor: DIR.agents },
    propias: [...new Set([...a, ...b])].sort().map(n => { const f = ficha(donde(n)); return { nombre: n, descripcion: f.descripcion, en_claude: a.includes(n), en_agents: b.includes(n), iguales: a.includes(n) && b.includes(n) && iguales(path.join(DEST, DIR.claude, n), path.join(DEST, DIR.agents, n)) }; }),
    del_motor: path.resolve(DEST) !== path.resolve(RAIZ) ? { carpeta: rel(path.join(RAIZ, DIR.claude)), skills: propias('claude', RAIZ) } : null,
    externas: C.skills.map(s => ({ id: s.id, repo: s.repo, commit: s.commit, licencia: s.licencia, plugin_claude: s.plugin, para: s.para, no_para: s.no_para, quien: s.quien, instalada_aqui: fs.existsSync(path.join(DEST, DIR.agents, s.id, 'SKILL.md')) || fs.existsSync(path.join(DEST, DIR.claude, s.id, 'SKILL.md')) })),
    plugins_claude: Object.keys(on).filter(k => on[k]), marketplaces_claude: Object.fromEntries(Object.entries(set.extraKnownMarketplaces || {}).map(([k, v]) => [k, v && v.source && v.source.repo])),
    solo_idea: C.solo_idea || [], descartado: C.descartado || []
  };
};
const corto = (t, n = 118) => (t = String(t || '').replace(/\s+/g, ' ').trim()).length > n ? t.slice(0, n - 1) + '…' : t;
const listar = () => {
  const I = inventario(), lin = [];
  lin.push('Skills y plugins · ' + I.repositorio + ' (motor ' + I.motor + ')', 'Dónde las busca cada IA: Claude Code → ' + DIR.claude + ' · Codex, Antigravity, Gemini CLI y Cursor → ' + DIR.agents, '');
  lin.push('Propias del repositorio (' + I.propias.length + '), sin instalar nada:');
  for (const p of I.propias) lin.push('  ' + (p.iguales ? '✓ ' : '⚠ ') + p.nombre + ' · ' + corto(p.descripcion) + (p.iguales ? '' : '  [' + (!p.en_agents ? 'falta en ' + DIR.agents : !p.en_claude ? 'falta en ' + DIR.claude : 'distinta en las dos carpetas') + ': corre --sincronizar]'));
  if (!I.propias.length) lin.push('  (ninguna en la raíz)');
  if (I.del_motor) lin.push('', 'Del motor, en la copia de referencia (' + I.del_motor.carpeta + '; léelas si tocas el motor): ' + I.del_motor.skills.join(', '));
  lin.push('', 'Externas fijadas (' + I.externas.length + '); se instalan con node ' + (I.del_motor ? rel(RAIZ) + '/' : '') + 'motor.mjs skills --integrar --agente <tu-agente>:');
  for (const s of I.externas) lin.push('  · ' + s.id + ' · ' + s.repo + '@' + s.commit.slice(0, 7) + ' · ' + s.licencia + (s.plugin_claude ? ' · plugin de Claude Code ' + s.plugin_claude : '') + ' · instalada aquí: ' + (s.instalada_aqui ? 'sí' : 'no'), '      para: ' + corto(s.para, 150), '      no:   ' + corto(s.no_para, 150), '      quién: ' + s.quien.join(', '));
  lin.push('', 'Plugins de Claude Code (.claude/settings.json): ' + (I.plugins_claude.join(', ') || 'ninguno'));
  for (const s of I.solo_idea) lin.push('Solo la idea: ' + s.id + ' · ' + corto(s.por_que_no, 150));
  for (const s of I.descartado) lin.push('Descartado: ' + s.que + ' · ' + corto(s.por_que, 150));
  console.log(lin.join('\n'));
};

/* ---------- los comandos ---------- */
if (tiene('--json')) { console.log(JSON.stringify(inventario(), null, 2)); process.exit(0); }
if (tiene('--comandos')) { instalar(true); process.exit(0); }
if (tiene('--instalar') && !tiene('--integrar')) {
  console.log('Skills externas → ' + DEST + ' (para ' + agentes.join(', ') + ')'); arreglarGI(); const mal = instalar(false);
  console.log(mal ? '✗ ' + mal + ' skill(s) sin instalar' : '✓ ' + C.skills.length + ' skills externas instaladas para ' + agentes.join(', ')); process.exit(mal ? 1 : 0);
}
if (tiene('--integrar') || tiene('--sincronizar')) {
  const integrar = tiene('--integrar'); console.log('Skills · ' + (integrar ? 'integrar' : 'sincronizar') + ' en ' + DEST + (integrar && !tiene('--sin-externas') ? ' (para ' + agentes.join(', ') + ')' : ''));
  const S = sincronizar(val('--desde')), n = new Set([...propias('claude'), ...propias('agents')]).size;
  console.log('1) Propias: ' + (!n ? 'ninguna en la raíz' + (path.resolve(DEST) !== path.resolve(RAIZ) ? ' (las del motor están en ' + rel(path.join(RAIZ, DIR.claude)) + ')' : '') : n + (S.hechos.length ? ' · copiadas: ' + S.hechos.join(', ') : S.choques.length ? '' : ' · ya estaban iguales en las dos carpetas')) + (S.choques.length ? ' · ✗ distintas en las dos carpetas (no se tocaron): ' + S.choques.join(', ') + '. Elige con --desde claude o --desde agents' : ''));
  const g = arreglarGI(); console.log('2) .gitignore: ' + (g.length ? 'agregué ' + g.length + ' línea(s) para que las externas no se suban' : 'al día'));
  let mal = 0;
  if (integrar && !tiene('--sin-externas')) { console.log('3) Externas (' + C.skills.length + ', commit revisado):'); mal = instalar(false); }
  else console.log('3) Externas: no se instalan en este paso' + (integrar ? ' (--sin-externas)' : ' (usa --integrar)'));
  const v = verificar(); console.log('4) Verificación: ' + (v.length ? '✗\n   - ' + v.join('\n   - ') : '✓ todo en orden'));
  if (integrar) console.log('\nConfirma en tu IA que aparecen (la lista de skills, por ejemplo /skills).\nEn Claude Code, los plugins de .claude/settings.json (hallmark, modern-web-guidance, hyperframes) se aceptan al abrir el proyecto; si no aparecen, corre esto mismo con --agente claude-code.\nNo subas las externas: ya están en el .gitignore. Las propias sí se suben (las dos carpetas).');
  process.exit(mal || v.length || S.choques.length ? 1 : 0);
}
if (tiene('--verificar')) {
  const v = verificar(), I = inventario();
  console.log(v.length ? '✗ Skills: ' + v.length + ' problema(s)\n   - ' + v.join('\n   - ') : '✓ Skills: ' + I.propias.length + ' propias iguales en ' + DIR.claude + ' y ' + DIR.agents + ', .gitignore al día y ' + C.skills.length + ' externas con commit fijado');
  process.exit(v.length ? 1 : 0);
}
listar();
