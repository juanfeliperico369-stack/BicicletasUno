# Auditoría G-H21, G-H22 y G-H23 · Turno Cero 4.0.1
**Fecha:** 20-nov-2026. **Entregable:** mejoras del código + prueba Node automatizada. **Estado:** veredictos pendientes de CI.

## G-H21 · 19 referencias de la historia
Se inventariaron 8 de Manhattan, 7 del Valle de Aburrá y 4 de Guatapé. Hallazgo de **riesgo alto**: el refugio ficticio de El Contador utilizaba como ancla de mundo el nombre de un hospedaje real de Guatapé. Se elimina, se marca el punto como `ficcion: true` y se adopta una coordenada narrativa **aproximada**, no un predio verificado. Ninguna escena debe atribuir actividades delictivas a instalaciones existentes.

**Situaciones que requieren verificación adicional:** puntos de Cherry Street/East River, rutas de Chelsea y Lower Manhattan, instalaciones de Itagüí, azotea de radio y los lugares en el embalse. Para cada ubicación se requiere revisión GIS/parcelaria, comprobar acceso y excluir memoriales, colegios, iglesias y hospitales. No se proclama la verificación de 19/19.

Fuentes de contexto: https://edc.nyc/project/nyc-public-piers ; https://www.nyc.gov/assets/escr/downloads/pdf/20250724-ESCR-CAG-Meeting-59.pdf ; https://directorio.turismoguatape.com/dormir/.

## G-H22 · 28 paradas
En `contenido/paradas-carretera.json`: 4 por cada bioma de costa, llanura, desierto, bosque, montaña, nieve y lagos. Nombre original en español, variante en inglés y ambiente; integración determinista por bioma en `MC.Generador.carretera`. Los talleres y bombas siguen siendo reconocidos por el juego.

## G-H23 · lenguaje
Se corrigen escapes y variantes de groserías en `LENGUAJE_SUAVE`. La opción de lenguaje fuerte no se altera. Test de regresión `node pruebas/getaway-contenido.mjs`.

## Falta
G-H20 y G-H24 requieren GPU, termometría y RAM de **teléfono real**: no equivalen a Chromium headless. G-H21 continúa abierto a cotejo parcelario. C-M31–36, C-A16–17 precisan trabajo técnico y artístico adicional.
