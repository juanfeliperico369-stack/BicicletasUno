#!/usr/bin/env node
/* MOTOR CITY · skills externas (catálogo en skills-externas.json)
   node motor.mjs skills                         lista las skills, para qué sirven y quién las usa
   node motor.mjs skills --instalar [--agente codex,antigravity,gemini-cli,claude-code] [--global]
                                                 las instala con el instalador oficial (npx skills add …), en .agents/skills/ o .claude/skills/
   node motor.mjs skills --comandos              solo imprime los comandos (para copiarlos en otra máquina)
   Claude Code no necesita instalarlas: .claude/settings.json las trae como plugins (se aceptan al abrir el proyecto).
   Las carpetas instaladas no se suben (están en .gitignore): cada IA las instala en su máquina. */
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), args = process.argv.slice(2), val = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const C = JSON.parse(fs.readFileSync(path.join(RAIZ, 'skills-externas.json'), 'utf8'));
const agentes = (val('--agente') || 'codex,antigravity,gemini-cli').split(',').map(s => s.trim()).filter(Boolean);
/* El catálogo fija commits para evitar instalar accidentalmente otra versión. */
const fuenteFijada = s => {
  if (!/^[0-9a-f]{40}$/.test(s.commit) || !/^[\w.-]+\/[\w.-]+$/.test(s.repo)) throw new Error('Referencia no fijada o repositorio inválido para ' + s.id);
  return s.repo + '@' + s.commit;
};
const cmd = s => ['-y', 'skills', 'add', fuenteFijada(s), '--skill', s.skill, ...agentes.flatMap(a => ['-a', a]), '-y', ...(args.includes('--global') ? ['-g'] : [])];
if (args.includes('--instalar') || args.includes('--comandos')) {
  let mal = 0;
  for (const s of C.skills) {
    const c = cmd(s); console.log('npx ' + c.join(' '));
    if (args.includes('--comandos')) continue;
    const r = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', c, { cwd: RAIZ, stdio: 'inherit' }); if (r.status !== 0) { mal++; console.error('✗ no se pudo instalar ' + s.id + ' (¿hay internet y Node 22?)'); }
  }
  if (!args.includes('--comandos')) console.log(mal ? '✗ ' + mal + ' skill(s) sin instalar' : '✓ ' + C.skills.length + ' skills externas instaladas para ' + agentes.join(', '));
  process.exit(mal ? 1 : 0);
}
console.log('Skills externas de Motor City (' + C.skills.length + '):\n');
for (const s of C.skills) console.log('· ' + s.id + '  (' + s.repo + ', ' + s.licencia + (s.plugin ? ', plugin de Claude Code ' + s.plugin : '') + ')\n    para: ' + s.para + '\n    no:   ' + s.no_para + '\n    quién: ' + s.quien.join(', ') + '\n');
for (const s of C.solo_idea || []) console.log('· ' + s.id + ' (solo la idea): ' + s.por_que_no);
console.log('\nInstalar: node motor.mjs skills --instalar --agente codex   (o antigravity, gemini-cli, claude-code)');
