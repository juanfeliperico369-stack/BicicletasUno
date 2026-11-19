/* =====================================================================
   CAPAS COMPARTIDAS DE MOTOR CITY (tubería 1.x) (motor-valle/capas/index.mjs · v1.2.0)
   Catálogo descriptivo de las capas que comparten Juega EnCicla y El Metro
   sobre el mismo sistema de coordenadas del Valle de Aburrá.
   ===================================================================== */
export const CAPAS_VALLE = {
  suelo: { id: 'suelo', fuente: 'OpenStreetMap + Overture Maps', formato: 'RLE Uint8Array en VALLE_BIN', compartido: ['encicla', 'elmetro'] },
  relieve: { id: 'relieve', fuente: 'SRTM / Copernicus DEM 30 m', formato: 'Delta-grid cada 40 m en VALLE_BIN', compartido: ['encicla', 'elmetro'] },
  red_sitva: { id: 'red_sitva', fuente: 'Metro de Medellín / OSM', formato: 'Trazados reales Líneas A, B, T-A, Cables K/J/H/M/P/L y Metroplús 1/2/O', compartido: ['encicla', 'elmetro'] },
  estaciones_encicla: { id: 'estaciones_encicla', fuente: 'Área Metropolitana del Valle de Aburrá (AMVA)', formato: '133 estaciones manuales y automáticas con coordenadas reales', compartido: ['encicla'] },
  ciclorrutas: { id: 'ciclorrutas', fuente: 'OSM highway=cycleway + POT Medellín', formato: 'Cadenas de vías tipo 5 y casillas TT.CICLO', compartido: ['encicla'] },
  barrios: { id: 'barrios', fuente: 'GeoMedellín / DANE', formato: 'BARRIOS (388 barrios y veredas con centroide)', compartido: ['encicla', 'elmetro'] },
  comunas: { id: 'comunas', fuente: 'GeoMedellín / AMVA', formato: 'COMUNAS (16 comunas y 5 corregimientos)', compartido: ['encicla', 'elmetro'] },
  alturas: { id: 'alturas', fuente: 'Overture Maps + OSM (is_bridge, level)', formato: 'ALTURAS.metro y ALTURAS.puentes en src/data/alturas.json', compartido: ['encicla', 'elmetro'] },
  tuneles: { id: 'tuneles', fuente: 'Overture Maps + OSM (is_tunnel, level <= -1, cutting)', formato: 'ALTURAS.tuneles (deprimidos y soterrados viales)', compartido: ['encicla', 'elmetro'] },
  sitios: { id: 'sitios', fuente: 'Overture Maps buildings + places', formato: 'SITIOS (1203 sitios reales y 5314 edificios con huella)', compartido: ['encicla', 'elmetro'] },
  /* de El Metro (20 m): salen de la misma tubería, se generan en su repositorio con sus herramientas (por mudar a motor-valle/capas/, F2) */
  ciudad: { id: 'ciudad', fuente: 'Capas oficiales de Medellín', formato: 'src/data/ciudad.js de El Metro', compartido: ['elmetro'] },
  vias_elmetro: { id: 'vias_elmetro', fuente: 'Overture / OSM', formato: 'src/data/vias.js de El Metro (tools/vias_datos.mjs)', compartido: ['elmetro'] },
  edificios: { id: 'edificios', fuente: 'Overture buildings (OSM, Microsoft y Google)', formato: 'src/data/edificios.js de El Metro (todas las huellas)', compartido: ['elmetro'] },
  hitos: { id: 'hitos', fuente: 'Lugares e hitos del valle', formato: 'src/data/hitos.js de El Metro', compartido: ['elmetro'] },
  metroplus_andenes: { id: 'metroplus_andenes', fuente: 'OSM', formato: 'src/data/metroplus_andenes.js de El Metro; en EnCicla, metroplus.json', compartido: ['encicla', 'elmetro'] },
  rieles: { id: 'rieles', fuente: 'OSM railway', formato: 'src/data/rieles.js de El Metro', compartido: ['elmetro'] },
  rutas_calles: { id: 'rutas_calles', fuente: 'Rutas de buses sobre la malla vial', formato: 'src/data/rutas_calles.js de El Metro (tools/rutas_calles.mjs)', compartido: ['elmetro'] },
  /* propuesta (entrega de ChatGPT, EnCicla v2.0): pasos a distinto nivel con nivel firmado */
  pasos: { id: 'pasos', fuente: 'Overture (is_tunnel, is_bridge, between)', formato: 'geo/pasos.py → candidatos; js/red-niveles.mjs (red por casilla y nivel)', compartido: [], propuesta: true },
  personajes: { id: 'personajes', fuente: 'Guion compartido Ruedas y Rieles del Aburrá', formato: 'contenido/guion/metro.json + contenido/guion/trama_valle.json', compartido: ['encicla', 'elmetro'] }
};

export function listarCapas(juego) {
  if (!juego) return Object.values(CAPAS_VALLE);
  return Object.values(CAPAS_VALLE).filter(c => c.compartido.includes(juego));
}
