# Auditoría del mapa de Juega EnCicla (medir siempre igual)

**Fecha:** 18‑nov‑2026 · **Versiones:** 1.6.0, 1.7.0 y 1.7.1.

Responde a la [auditoría que hizo El Metro de Juega EnCicla v1.2.0](#de-donde-sale), punto por punto. Las cifras salen de una herramienta nueva que mide el mapa que de verdad se juega (`JE.map`), no los datos de origen.

```bash
node tools/auditoria-mapa.js [dist/juega-encicla.html] [--json salida.json]
```

## Antes y después
| Medida | v1.2.0 (auditoría de El Metro, 20 m) | v1.5.0 (10 m) | **v1.6.0 (10 m)** |
|---|---|---|---|
| Cortes del agua del río, de Caldas a Barbosa | 70 | 5 | **1** (el nacimiento) |
| Tramos de 200 m del río que suben más de 3 m | 36 (máx. 27 m) | 19 (máx. 22 m) | **1 (máx. 3 m)** |
| Manchones de agua de 1 a 4 casillas | 2.086 | 1.116 (290 en plena ciudad) | **1.145 (283)**: casi todos son lagos de parque o tramos angostos del río, que se dejan |
| Escaleras de una sola casilla | 330 | 63 de 9.930 | **63 de 9.933** |
| Estaciones EnCicla en el mapa | 133 | 133 | **133** |
| Lugares con postal con su forma real | — | 19 | **24 de 45** |
| Content‑Security‑Policy | no | no | **sí, y sin *referrer*** |

**v1.7.0 y v1.7.1** (misma herramienta):

| Medida | v1.6.0 | v1.7.0 | **v1.7.1** |
|---|---|---|---|
| Metroplús: trazado sobre la calzada (L1 · L2 · O) | 93 % · 92 % · 91 % | 99 % · 98 % · 100 % | **100 % · 99 % · 100 %** (corredor de OSM, como en El Metro) |
| Metroplús: estaciones sobre la calzada | 43 de 55 | 48 de 55 | **46 de 55**: cada una en su andén real; las que faltan quedan en el separador central, que en la cuadrícula no es calzada |
| Metro en viaducto (A · B) | dibujado en el suelo | 6,9 km · 4,4 km, 13 estaciones elevadas | **igual, con el dibujo de El Metro** |
| Puentes en alto (sobre agua · peatonales) | — | 1.435 (43 · 450) | **1.435 (43 · 450)** |

## Qué se arregló de cada hallazgo
**Mapa**
1. **El relieve y los puentes del río**, la mejora más barata según la auditoría:
   - Al cargar el mapa, el perfil del río se ajusta con una regresión isotónica decreciente, como en El Metro. Ese ajuste se «quema» en las cuatro esquinas del relieve de cada punto del cauce.
   - Los huecos del cauce junto al agua pasan a agua, o a puente si son vía.
   - Así, una bici que bordea el río ya no pedalea cuesta arriba donde no debe.
2. **Andenes y barrios oficiales:** ya estaban desde la v1.3.0, con las manzanas, la malla vial y los barrios de la Alcaldía.
3. **Quebradas y escaleras:**
   - Las quebradas son un hilo de agua en su retiro verde desde la v1.4.0.
   - Ahora, donde van cubiertas bajo una calle (la Santa Elena bajo La Playa), se ve una línea tenue sobre la calzada.
   - Las escaleras sueltas pasaron a paso peatonal en la v1.3.1.
4. **Patio‑taller del Metro y talleres del Ferrocarril:**
   - Entran como sitios reales, con sus naves y su patio de rieles: el Patio‑Taller del Metro en Bello, los Talleres del Ferrocarril de Antioquia, el patio del Metro de la 80 y el del tranvía.
   - Los talleres del Ferrocarril tienen además su placa.
5. **Medir siempre igual:** `tools/auditoria-mapa.js` (esta tabla).

**Interfaz** (412 px de ancho)
- Los botones redondos ya no tapan el minimapa: si no caben, pasan a una segunda columna.
- En pantallas bajas, los botones son más pequeños.
- Los textos largos (RENOVAR, DEVOLVER, SENTARSE) usan una letra que cabe en el círculo, y cada botón tiene su `aria-label`.
- La mano de ayuda del modo libre se cierra sola con el primer movimiento (o a los 6 s).

**Seguridad**
1. **Content‑Security‑Policy** en el HTML: `default-src 'self'`, scripts y estilos en línea, imágenes y fuentes `data:`/`blob:`, `frame-src`, `object-src`, `base-uri` y `form-action` en `none`, y `referrer: no-referrer`.
2. **Guardado saneado:** `Save.load`, `importText` y los mensajes de red usan `JSON.parse` con un *reviver* que quita `__proto__`, `constructor` y `prototype`. `Save.merge` además las salta.
3. **Invitaciones con tope de 64 KB:** desde la v1.3.0.

**Ideas**
- **Placas de lo poco conocido:**
  - 16 datos curiosos en su lugar real, entre ellos la quebrada bajo La Playa, los talleres del Ferrocarril, el sentido de las calles y carreras, el Coltejer, la Catedral y el Palacio de la Cultura;
  - aparecen al pasar cerca en el modo libre, quedan en el álbum y dan 2 logros.
- **Horario real del Metro:**
  - de lunes a sábado de 4:30 a. m. a 11 p. m.; domingos y festivos de 5 a. m. a 10 p. m.;
  - fuera de ese horario los trenes no corren;
  - «Antes del primer tren» usa las 5:00 los domingos y festivos.
- Direcciones paisas, valle común y maqueta 2:1: hechas desde las v1.3.

## De dónde sale
La auditoría la escribió El Metro sobre Juega EnCicla v1.2.0 (17‑nov‑2026). Sus cifras de v1.2 son de la cuadrícula de 20 m; las de v1.5 y v1.6 son de la de 10 m, medidas con esta herramienta.

*Datos del mapa: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps Foundation; Subsecretaría de Catastro del Municipio de Medellín; relieve SRTM (NASA, AWS Terrain Tiles).*
