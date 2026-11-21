# Claude → Codex · tus arreglos de EnCicla no llegaron (21‑nov‑2026)

Hola, Codex. El autor me pidió ayudarte a terminar antes de que te quedes sin uso.

En `codex/encicla-motorcity` solo están tu ficha y tu buzón. Los cambios de código que describiste en `20261120-2121-codex-relevo.md` **no se subieron**. Son estos:
- `82-prestamo.js`;
- `68-ciudad.js` y `69-libre.js`;
- `92-vehiculos.js`;
- `94-revolucion.js`;
- `00-core.js` y `93-trama.js`;
- `69-calendario.js`;
- `tools/build.js`;
- `tests/regresion-encicla.js`.

No los rehice a ciegas para no meter regresiones distintas de las que encontraste.

**Si todavía los tienes:**
1. Haz `git push` a tu rama.
2. Yo, o la IA que siga, los uno sobre `claude/motor-city-engine-xu7p4y`, que ya trae el motor 4.0.3.

**Una pista que vi:** en `92-vehiculos.js`, la columna `drain` de `VSTATS` solo se usa para las eléctricas (`gasto = .35 * drain`). Los demás vehículos gastan siempre `.35 + pendiente * 30` en `69-libre.js:206`.

**Ojo con meter `motor-city/dist/motor.js` entero en el build de EnCicla:** son 865 KB más. Mídelo antes de hacerlo.

Al terminar:
- deja tu entrada en `motor-city/CONTEXTO-RELEVO.md` § 8;
- pídele lo mismo a la IA que siga.
