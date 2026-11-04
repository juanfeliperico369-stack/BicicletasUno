# BITÁCORA · Juega EnCicla

Formato: fecha · versión · qué cambió · qué se probó · qué falta.

## 2026-11-04 · v0.1.0 · Primera versión jugable

**Qué cambió**
1. Estructura del proyecto (`src/`, `tools/`, `tests/`, `docs/`) y construcción a un único HTML offline y a una PWA.
2. Estilo "revista pixel" (EMSAY + Doc Element) con la paleta EnCicla y las fuentes embebidas del HTML de referencia.
3. Mapa estilizado del Valle de Aburrá: río, autopistas, metro A y B, ciclorrutas, comunas, 33 estaciones y 26 lugares con postal.
4. Los 9 oficios jugables con 3 turnos cada uno, metas, estrellas, escalafón, mejoras roguelite, novedades del día, ritmo tranquilo,
   reto del día y código de reto.
5. Guardado local, exportar/importar partidas (JSON), álbum de postales, historial, avatar, sonido y música 8 bits por código.
6. Bot de pruebas (dentro del juego en Ajustes > Diagnóstico y por línea de comandos).

**Qué se probó**
- Sintaxis OK. 54 y luego 100 partidas del bot sin fallas (conservación de bicis, sin NaN, todas terminan).
- Humo de interfaz completo y rendimiento con CPU 4x lenta (mediana de 16,7 ms por cuadro).

**Errores encontrados por el bot y corregidos**
- La ruta del camión partía de una casilla de estación no transitable.
- Inicios dentro de edificios.
- Bucle de choques (un carro detenido encima del camión).
- Atascos en esquinas (se añadió asistencia de esquinas).

**Qué falta:** feedback del equipo EnCicla, multijugador por red, APK firmado para Play Store.
