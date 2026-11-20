#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · DOCUMENTO · arma dist/MOTOR-CITY-TODO.md: el documento único (docs/DOCUMENTO-UNICO.md) y, como anexos,
   todo lo demás (manual, contrato, contexto, guía, investigación, optimización, negocio, contribuir y bitácora).
   Una IA que lea este archivo tiene TODO el contexto del motor en un solo documento.
     node motor.mjs documento
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const R = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), V = JSON.parse(fs.readFileSync(path.join(R, 'VERSION.json'), 'utf8')).version;
const partes = [['CONTEXTO-RELEVO.md', null], ['docs/DOCUMENTO-UNICO.md', null], ['TAREAS-IA.md', '0. Tareas de cada IA'], ['docs/INVESTIGACION-CAMARA.md', '0d. Cámara, mundo único y jugabilidad (investigación 3.0)'], ['docs/PROXIMO-NUEVA-YORK.md', '0e. Lo que sigue: Getaway Nueva York y las reglas del feedback'], ['.claude/skills/motor-city-skills-externas/SKILL.md', '0c. Skills y plugins externos (Hallmark, Modern Web Guidance, find-skills, HyperFrames) y público simulado'], ['docs/PEDIDOS.md', '0b. Todos los pedidos y su estado'], ['docs/MANUAL.md', 'A. Manual'], ['MOTOR.md', 'B. Contrato técnico'], ['CONTEXTO-IA.md', 'C. Contexto para la IA que retome'], ['docs/GUIA.md', 'D. Guía'], ['docs/INVESTIGACION.md', 'E. Investigación'], ['docs/INSPIRACION-VISUAL.md', 'E2. Inspiración visual'], ['docs/MOTORES-POTENTES.md', 'E3. Motores potentes'], ['docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md', 'E4. Entrega maestra de referencias (del autor)'], ['docs/OPTIMIZACION.md', 'F. Optimización'], ['docs/NEGOCIO-Y-USOS.md', 'G. Usos y negocio'], ['CONTRIBUIR.md', 'H. Cómo contribuir'], ['BITACORA.md', 'I. Bitácora']];
let out = '<!-- Generado por node motor.mjs documento · Motor City ' + V + ' · no se edita a mano: edita los documentos de origen -->\n\n';
for (const [f, titulo] of partes) { const p = path.join(R, f); if (!fs.existsSync(p)) continue; let t = fs.readFileSync(p, 'utf8'); if (titulo) t = '\n---\n\n# ANEXO ' + titulo + ' (`' + f + '`)\n\n' + t.replace(/^# .*\n/, '').replace(/^(#{1,5}) /gm, '#$1 '); out += t + '\n'; }
fs.mkdirSync(path.join(R, 'dist'), { recursive: true }); fs.writeFileSync(path.join(R, 'dist/MOTOR-CITY-TODO.md'), out);
console.log('✓ dist/MOTOR-CITY-TODO.md · ' + Math.round(out.length / 1024) + ' KB · ' + partes.length + ' partes');
