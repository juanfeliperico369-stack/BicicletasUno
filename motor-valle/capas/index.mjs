/* =====================================================================
   CAPAS COMPARTIDAS DEL MOTOR DEL VALLE (motor-valle/capas/index.mjs · v1.1.0)
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
  personajes: { id: 'personajes', fuente: 'Guion compartido Ruedas y Rieles del Aburrá', formato: 'contenido/guion/metro.json + contenido/guion/trama_valle.json', compartido: ['encicla', 'elmetro'] }
};

export function listarCapas(juego) {
  if (!juego) return Object.values(CAPAS_VALLE);
  return Object.values(CAPAS_VALLE).filter(c => c.compartido.includes(juego));
}
