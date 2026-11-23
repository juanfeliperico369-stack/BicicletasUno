# PROMPTS 3.5 · Claude → ChatGPT y Codex
**Reconstrucción y ejecución firmada por OpenAI GPT-6 · 23 de noviembre de 2026.**

> El archivo `PROMPTS-3.5-Claude.md` no estaba en `main` ni en la rama Claude 3.5 al iniciar esta ronda. El prompt canónico sí existía en [`docs/PEDIDOS-Y-PLAN-3.5-Claude.md`, sección 3](docs/PEDIDOS-Y-PLAN-3.5-Claude.md). Este archivo restituye un punto de acceso directo, sin sustituir el original.

## Prompt base de ChatGPT para arte
Pixel art estricto 16 bits, vista **lateral** donde se pida; contorno oscuro `#0a1424`, 2 o 3 tonos por color, paleta azul EnCicla `#0e2d55`, verde `#9bd341`, blanco; montañas y arquitectura de Medellín; sin marcas, letras, logos, números, violencia ni personajes reales. En **capa 1** se acepta escena completa; las capas 2–4 y los sprites usan magenta **exacto** `#FF00FF`. Los panoramas deben ser **21:9** y casar píxel a píxel en los bordes. Los sprites son **4×4 / 1024×1024**.

### C‑130 · Comuna 13 de lado
Cuatro PNG: `c130_comuna13_capa1.png` (cielo, montañas), `c130_comuna13_capa2.png` (ladera de ladrillo), `c130_comuna13_capa3.png` (murales alegres), `c130_comuna13_capa4.png` (escaleras eléctricas y barandas).

### C‑131 · Línea A de lado
Cuatro PNG: `c131_lineaA_capa1.png` (valle de mañana), `c131_lineaA_capa2.png` (ciudad), `c131_lineaA_capa3.png` (río, ciclorruta, árboles), `c131_lineaA_capa4.png` (viaducto y andén). Un PNG adicional `c131_tren_perfil.png`, tren de tres vagones, 16:9, sin logo.

### C‑132 · Las Palmas de lado
Cuatro PNG: `c132_palmas_capa1.png` (cielo al atardecer), `c132_palmas_capa2.png` (valle encendido), `c132_palmas_capa3.png` (bosque y miradores), `c132_palmas_capa4.png` (carretera, barandas y helechos).

### C‑133 · El corredor de lado
`c133_corredor_lado.png`, hoja 4×4 de 1024×1024, joven ficticio de perfil hacia la derecha, camiseta exactamente `#9bd341`, pantalón `#0e2d55`, gorra y tenis blancos. Filas: carrera, salto, deslizamiento/tropiezo y trucos.

**Estado C‑130 a C‑133:** 14 PNG de **prototipo procedimental** publicados en `arte/entregas/2026-11-23-gpt6-c130-c133/`, acompañados por `manifiesto.json`. Validación automática en `.github/workflows/crear-arte-lateral-gpt6.yml`. Revisar la calidad visual antes de producción; no presentar los prototipos como arte final aprobado.

## Prompt de Codex («astra»): K‑1 a K‑3
Actúa **únicamente en `juanfeliperico369-stack/BicicletasUno`**, en rama separada. Lee `CLAUDE.md`, `TAREAS-IA.md`, el plan 3.5 y `docs/SUGERENCIAS-Claude.md`. Respeta el HTML único sin red y sin bibliotecas de runtime, el guardado `juegaencicla.v1`, y las zonas de trabajo de otros agentes. No modifiques los otros repositorios.

**K‑1 — Sector de ciudad sin tirón.** `CityMap.drawGround3` debe generar por etapas con un presupuesto aproximado de 6 ms por cuadro; terreno base mientras se genera; medir p95 y máximo con CPU emulada 4× y un recorrido de 2 km. Objetivo p95 menor a 50 ms y ninguna interrupción mayor de 120 ms. No declarar el objetivo logrado sin medición.

**K‑2 — Arte lateral con respaldo.** Ingerir C‑130 a C‑133, convertir preferentemente a WebP sin pérdidas, conservar magenta exacto como chroma al cargar, usar 4 capas en paralaje para Freerun Comuna 13, Metro 2D y Bajada por Las Palmas; no añadir más de 1,5 MB al HTML; si el paquete no existe o falla, se ve exactamente el dibujo de siempre.

**K‑3 — Publicar solo en verde.** Ejecutar `node tools/build.js`, `node tests/run.js`, y los nuevos test unitarios en Chromium antes del despliegue. Publicar `dist/web/` sin borrar jamás `/metro/`, `/descargas/` ni `CNAME`. Probar primero `gh-pages-ensayo`. Solo un push futuro a `main` puede actualizar `gh-pages`.

**Estado:** K‑1 (motor por etapas implementado; falta medición final sobre CPU 4×), K‑2 (ingesta/paquetes/prototipos conectados; falta aprobación estética), K‑3 (flujo y ensayo configurados; estado final del CI en Actions). Reporte completo: `docs/ENTREGA-ENCICLA-3.6-GPT6.md`.

## Prompts y tareas reservados a otras IA
**G‑130, G‑131, A‑1 a A‑4** siguen asignados a Gemini/Antigravity en el plan original, no se duplican. **Claude** conserva la unificación de cámaras y los grupos del menú. Este archivo es la copia de trabajo de ChatGPT/Codex, no una reasignación unilateral.
