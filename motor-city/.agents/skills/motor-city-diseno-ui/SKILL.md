---
name: motor-city-diseno-ui
description: "Auditoría de diseño de interfaz, portadas y HUD sin estética genérica de IA («anti-AI-slop»): niveles Piso, Reflejo y Acabado adaptados a juegos móviles de Motor City (412×860, contraste, zona libre central, identidad visual colombiana). Basada en Nutlope/hallmark (MIT). Úsala al diseñar o auditar portadas, menús, HUD y documentos HTML del proyecto."
---
# Motor City · diseño de interfaz sin clichés de IA

Adaptada de [`Nutlope/hallmark`](https://github.com/Nutlope/hallmark) (MIT) a las reglas de interfaz de Motor City (`js/70-interfaz.js`, `MC.UI.verificar`).

## 1. Tres niveles de revisión

### Nivel 1 · Piso (bloquea la entrega si falla)
1. **El centro es del juego:** en móvil vertical (`412 × 860`) y horizontal, `MC.UI.verificar(ui)` debe devolver `[]`. Ningún botón, ficha ni aviso tapa al jugador.
2. **Contraste legible en día, tarde y noche:** todo texto de HUD, barra, ficha o diálogo debe superar contraste WCAG AA (≥ 4,5:1 en texto normal; ≥ 3:1 en texto grande/íconos). Vigila las fichas atenuadas (`$`, calle, clima) sobre fondos claros u oscuros.
3. **Área táctil y recorte:** botones ≥ 44×44 px, textos cortos sin desbordes ni recortes en bordes (`#bcComprar`, pestañas de casa, barras).
4. **Accesibilidad y foco:** estados `:focus-visible` visibles, soporte para movimiento reducido (`sacudida`, `particulas`) y diálogos cerrables.
5. **Sin contenido inventado:** toda cifra, lugar o crédito que aparezca en portadas o fichas debe corresponder a datos reales del motor.

### Nivel 2 · Reflejo (vicios típicos de IA a evitar salvo razón explícita)
- **No** uses degradados genéricos púrpura/neón de plantilla SaaS donde corresponde la paleta del territorio (Guatapé, Medellín, dominio público en `arte/dominio-publico/paletas.json`).
- **No** apiles «cejas» (*eyebrows*) en mayúsculas rastreadas sobre cada título ni llenes la pantalla de tarjetas vacías o insignias decorativas sin acción.
- **No** dejes avisos superpuestos ni etiquetas del mundo sangrando debajo de la columna fija de botones.
- **Diseña alrededor de la acción principal:** en una portada de juego, el botón «Jugar» y una vista viva del mapa mandan; tutoriales y ajustes son secundarios y opcionales.

### Nivel 3 · Acabado (oficio visual)
- Jerarquía clara entre dato primario (hora, misión, velocidad) y secundario (calle, plata en modo libre).
- Ritmo de espaciado uniforme, íconos coherentes y una sola dirección de luz (arriba a la izquierda) entre UI y sprites.
- Verifica siempre el resultado en **capturas reales** (`412 × 860` a 10 h, 17 h, 20:30 h, capa de datos y Mi casa), nunca solo leyendo CSS.

## 2. Skill externa opcional (para rediseños o auditorías de páginas)
- **Instalación global (Claude Code / Codex / Cursor):** `npx skills add nutlope/hallmark -g`
- **Uso en auditoría sin tocar código del motor:** `/hallmark audit <archivo.html>`
