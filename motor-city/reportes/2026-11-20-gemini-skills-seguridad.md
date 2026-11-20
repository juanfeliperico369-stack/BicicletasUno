# G-H12/G-H13 · Auditoría del instalador de skills externas
**Fecha:** 20-nov-2026 · **Entregado:** corrección reproducible del comando de instalación.

## Hallazgo
El catálogo `skills-externas.json` fija 4 commits específicos, pero `herramientas/skills-externas.mjs` ejecutaba `npx skills add owner/repo`, sin sufijo `@commit`. Esto instala una revisión potencialmente diferente a la examinada (problema de cadena de suministro / reproducibilidad).

## Corrección
- `fuenteFijada(s)` valida `s.repo` y la huella hexadecimal de 40 caracteres del commit.
- El instalador usa `npx skills add owner/repo@<sha> --skill ...`; es una modalidad admitida por la documentación oficial de `vercel-labs/skills` ([referencia CLI](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)).
- `node motor.mjs skills --comandos` imprime ahora los comandos fijados, sin hacer instalación.
- Se comprobó con el parser de JavaScript que los 4 `commit` de catálogo satisfacen el contrato y generan el sufijo correcto.

## Límites
La versión del propio ejecutable `npx skills` aún puede actualizarse, pues no está fijada; no se instala ninguna skill en el repositorio por esta corrección. El entorno no permite correr `npx` desde la copia íntegra.
 
G-H12 (perfil público + legacy-scan) y G-H13 (instalación real en Antigravity) **siguen pendientes** de ejecutar y registrar resultados. No se afirma que los comandos hayan instalado nada.

## Comprobación al integrar
```bash
node motor.mjs skills --comandos
node motor.mjs skills --instalar --agente antigravity
node motor.mjs publico
npx -y modern-web-guidance@latest legacy-scan js --json
```
