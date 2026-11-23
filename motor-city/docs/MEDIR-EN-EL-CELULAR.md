# 📏 Medir el rendimiento en tu celular (Turno Cero 5.2)

Sirve para saber cómo corre el juego en **tu** teléfono y pasárselo a las IA sin cables ni programas.

## Cómo se hace (2 minutos)
1. Conecta el celular al cargador y cierra las otras aplicaciones.
2. Abre Turno Cero de una de estas dos formas:
   - **en el navegador:** <https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/getaway.html?medir> (el `?medir` del final hace que empiece solo);
   - **en la APK o en el juego ya abierto:** ⏸ **Menú → 📏 Medir el rendimiento**.
3. **No toques la pantalla durante 60 s.** Un bot maneja solo por el centro de Medellín: 20 s con la cámara cenital, 20 s en tercera persona y 20 s con la ciudad en 3D.
4. Al final sale el panel **📏 Resultados de la medición**. Toca **📋 Copiar resultados** y pega el texto en el chat de Claude, ChatGPT o Gemini.
   - Si el celular no deja copiar solo, sale el texto en un cuadro: mantenlo presionado para copiarlo.

## Qué dice el panel
| Dato | Qué es | Bueno en un celular |
|---|---|---|
| **fps** | cuadros por segundo (mediana) | 30 o más |
| **p50** | lo que tarda un cuadro normal, en ms | 33 ms o menos |
| **p95 / p99** | los cuadros lentos (5 % y 1 % peores) | p95 por debajo de 50 ms |
| **tirones** | cuadros de más de 50 ms (se sienten como saltos) | pocos: menos de 10 en 60 s |
| **memoria** | memoria de JavaScript (solo algunos navegadores la dan) | que no suba sin parar |
| **GPU** | el nivel que el juego detectó (alta, media, baja o por software) y su nombre | — |

## Para medir otra vez
- **↻ Otra vez** repite la medición.
- Para probar otra calidad, cambia ⏸ Menú → ⚙️ Flexibilidad → calidad, o ⚙️ Gráficos (automáticos, realistas o clásicos), y vuelve a medir.

No se envía nada a internet: los resultados solo salen si tú los copias.
