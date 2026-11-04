/* =====================================================================
   MAPA: Valle de Aburrá en miniatura (norte arriba, río de sur a norte)
   ===================================================================== */
const MW = 150, MH = 260, TS = 8, CH = 32;
const TT = { GRASS: 0, MOUNT: 1, BRICK: 2, BLDG: 3, ROAD: 4, AVE: 5, WALK: 6, CICLO: 7, WATER: 8, CANAL: 9, PLAZA: 10, BRIDGE: 11, STATION: 12, LAND: 13, AUTO: 14, DEPOT: 15 };
const SOLID = [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0];
const TRUCK_OK = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1];
const SURF = [.55, 0, 0, 0, 1, 1, .62, 1.3, 0, 0, .8, 1, .75, 0, .92, .9];
const PATHC = [6, 0, 0, 0, 3, 3, 4, 2, 0, 0, 3, 3, 3, 0, 6, 3];
const MINI_COL = ['#4f8f45', '#24502c', '#8a4a30', '#56657c', '#2b3240', '#384257', '#7d8696', '#9bd341', '#3d8cb0', '#777777', '#cfc4a6', '#384257', '#ffffff', '#c9a24a', '#1e2430', '#56c7ff'];
const RX = new Float32Array(MH); for (let y = 0; y < MH; y++) RX[y] = 66 + (MH - y) * .07 + 3 * Math.sin(y / 19);
const rxi = y => Math.round(RX[clamp(Math.floor(y), 0, MH - 1)]);
const rxf = py => { const ty = clamp(py / TS, 0, MH - 1.001), i = Math.floor(ty); return lerp(RX[i], RX[Math.min(MH - 1, i + 1)], ty - i); };

const CALLES = []; for (let k = 0; k < 22; k++) CALLES.push(4 + 12 * k);
const CARRERAS = []; for (let k = 0; k < 14; k++) CARRERAS.push(3 + 11 * k);
const AVE_EW = { 16: 'Calle 44 · Bello', 52: 'Calle 67 Barranquilla', 88: 'Avenida Colombia', 100: 'Calle San Juan', 124: 'Calle 33', 136: 'Calle 30', 160: 'Calle 10', 184: 'Calle 4 Sur', 208: 'Calle 37 Sur · Envigado', 232: 'Calle 75 Sur · Sabaneta' };
const CIC_EW = { 52: [0, MW], 100: [0, MW], 160: [0, MW], 208: [0, MW] };
const AVE_NS = { 25: 'Avenida 80', 47: 'Carrera 65', 91: 'Avenida Las Vegas', 102: 'Avenida El Poblado' };
const CIC_NS = { 25: [56, 204], 47: [0, MH], 102: [118, 236] };
const nsName = (x, y) => x === 91 && y < 128 ? 'Avenida Oriental' : x === 102 && y < 118 ? 'Carrera 46' : AVE_NS[x];

/* Lugares (postales). x,y,w,h en baldosas. */
const LANDMARKS = [
  { id: 'bello', name: 'Parque de Bello', muni: 'Bello', x: 52, y: 12, w: 12, h: 10, k: 'iglesia', fact: 'Bello, al norte del valle, es la tierra natal del presidente Marco Fidel Suárez.' },
  { id: 'terminalN', name: 'Terminal del Norte', muni: 'Medellín', x: 62, y: 42, w: 10, h: 7, k: 'terminal', fact: 'Desde aquí salen buses hacia el norte y la costa de Colombia.' },
  { id: 'volador', name: 'Cerro El Volador', muni: 'Medellín', x: 20, y: 52, w: 14, h: 14, k: 'volador', fact: 'Parque natural en medio de la ciudad y sitio arqueológico de los antiguos pobladores del valle.' },
  { id: 'unal', name: 'Universidad Nacional', muni: 'Medellín', x: 39, y: 56, w: 12, h: 8, k: 'campus', fact: 'La sede Medellín de la Nacional queda al pie del Cerro El Volador.' },
  { id: 'moravia', name: 'Moravia', muni: 'Medellín', x: 97, y: 44, w: 10, h: 7, k: 'moravia', fact: 'Antiguo basurero que la comunidad convirtió en jardines, huertas y cultura.' },
  { id: 'botanico', name: 'Jardín Botánico', muni: 'Medellín', x: 93, y: 56, w: 13, h: 10, k: 'botanico', fact: 'Su Orquideorama es un gran techo de madera con forma de flores gigantes.' },
  { id: 'udea', name: 'Ciudad Universitaria UdeA', muni: 'Medellín', x: 109, y: 60, w: 13, h: 12, k: 'campus', fact: 'La Universidad de Antioquia, fundada en 1803, es una de las más antiguas del país.' },
  { id: 'explora', name: 'Parque Explora', muni: 'Medellín', x: 94, y: 69, w: 9, h: 7, k: 'explora', fact: 'Museo interactivo de ciencia con acuario; al lado está el Planetario.' },
  { id: 'estadio', name: 'Estadio Atanasio Girardot', muni: 'Medellín', x: 31, y: 85, w: 14, h: 12, k: 'estadio', fact: 'Casa del fútbol paisa, rodeado por la Unidad Deportiva Atanasio Girardot.' },
  { id: 'botero', name: 'Plaza Botero', muni: 'Medellín', x: 97, y: 91, w: 9, h: 7, k: 'botero', fact: '23 esculturas gigantes de Fernando Botero frente al Museo de Antioquia.' },
  { id: 'coltejer', name: 'Edificio Coltejer', muni: 'Medellín', x: 107, y: 103, w: 4, h: 6, k: 'coltejer', fact: 'Su punta recuerda una aguja de máquina de coser: homenaje a la industria textil.' },
  { id: 'teatro', name: 'Teatro Metropolitano', muni: 'Medellín', x: 88, y: 103, w: 9, h: 7, k: 'teatro', fact: 'Hogar de la Orquesta Filarmónica de Medellín, junto a Plaza Mayor.' },
  { id: 'laureles', name: 'Primer Parque de Laureles', muni: 'Medellín', x: 32, y: 114, w: 9, h: 8, k: 'lleras', fact: 'Laureles tiene calles circulares y muchos árboles: ¡ideal para pedalear!' },
  { id: 'pies', name: 'Parque de los Pies Descalzos', muni: 'Medellín', x: 88, y: 114, w: 9, h: 7, k: 'pies', fact: 'Quítate los zapatos y camina sobre arena, agua y piedras.' },
  { id: 'luces', name: 'Parque de las Luces', muni: 'Medellín', x: 99, y: 114, w: 8, h: 7, k: 'luces', fact: 'Cientos de postes de luz que de noche iluminan la plaza.' },
  { id: 'depot', name: 'Centro de Operaciones EnCicla', muni: 'Medellín', x: 52, y: 116, w: 10, h: 7, k: 'depot', fact: 'Base de la flota: bodega, taller, camiones y la sala de monitoreo (del juego).' },
  { id: 'cerro', name: 'Cerro Nutibara · Pueblito Paisa', muni: 'Medellín', x: 49, y: 128, w: 14, h: 14, k: 'cerro', fact: 'En su cima está el Pueblito Paisa, réplica de un pueblo antioqueño.' },
  { id: 'mamm', name: 'MAMM · Ciudad del Río', muni: 'Medellín', x: 89, y: 139, w: 9, h: 7, k: 'mamm', fact: 'El Museo de Arte Moderno ocupa una antigua siderúrgica.' },
  { id: 'poblado', name: 'Parque del Poblado', muni: 'Medellín', x: 108, y: 140, w: 10, h: 8, k: 'iglesia', fact: 'Aquí, según la historia, comenzó el poblamiento de Medellín en 1616.' },
  { id: 'aeropuerto', name: 'Aeropuerto Olaya Herrera', muni: 'Medellín', x: 35, y: 142, w: 11, h: 34, k: 'aeropuerto', fact: 'Aeropuerto en plena ciudad, con vuelos regionales desde 1932.' },
  { id: 'lleras', name: 'Parque Lleras', muni: 'Medellín', x: 115, y: 150, w: 7, h: 6, k: 'lleras', fact: 'Corazón de la Zona Rosa de El Poblado.' },
  { id: 'terminalS', name: 'Terminal del Sur', muni: 'Medellín', x: 53, y: 151, w: 8, h: 6, k: 'terminal', fact: 'Buses hacia el sur y el occidente, junto al Olaya Herrera.' },
  { id: 'eafit', name: 'Universidad EAFIT', muni: 'Medellín', x: 86, y: 166, w: 12, h: 10, k: 'campus', fact: 'EnCicla nació en 2011 como piloto que conectaba universidades y el metro.' },
  { id: 'envigado', name: 'Parque de Envigado', muni: 'Envigado', x: 96, y: 200, w: 12, h: 10, k: 'iglesia', fact: 'Envigado tiene su propio parque principal y estaciones EnCicla.' },
  { id: 'itagui', name: 'Parque de Itagüí', muni: 'Itagüí', x: 40, y: 210, w: 12, h: 10, k: 'iglesia', fact: 'Itagüí es una ciudad industrial y comercial del sur del valle.' },
  { id: 'sabaneta', name: 'Parque de Sabaneta', muni: 'Sabaneta', x: 84, y: 236, w: 10, h: 8, k: 'iglesia', fact: 'Sabaneta es el municipio más pequeño de Colombia en extensión.' },
  { id: 'estrella', name: 'Parque de La Estrella', muni: 'La Estrella', x: 40, y: 244, w: 10, h: 8, k: 'iglesia', fact: 'La Estrella mira al valle desde el suroccidente.' }
];
const LM = {}; LANDMARKS.forEach(l => LM[l.id] = l);

/* Estaciones EnCicla (inspiradas en el sistema real; ubicaciones estilizadas) */
const STATIONS_DEF = [
  ['niquia', 'Niquía', 'Bello', 97, 10, 'a', 'res'], ['bello', 'Parque de Bello', 'Bello', 57, 24, 'm', 'res'],
  ['terminalN', 'Terminal del Norte', 'Medellín', 66, 51, 'm', 'mix'], ['moravia', 'Moravia', 'Medellín', 99, 42, 'm', 'res'],
  ['unal', 'Universidad Nacional', 'Medellín', 44, 67, 'm', 'uni'], ['botanico', 'Jardín Botánico', 'Medellín', 99, 54, 'a', 'mix'],
  ['udea', 'Universidad de Antioquia', 'Medellín', 114, 74, 'm', 'uni'], ['explora', 'Parque Explora', 'Medellín', 96, 78, 'a', 'mix'],
  ['carlose', 'Carlos E. Restrepo', 'Medellín', 58, 80, 'm', 'uni'], ['estadio', 'Estadio', 'Medellín', 37, 82, 'm', 'mix'],
  ['prado', 'Prado', 'Medellín', 110, 86, 'a', 'work'], ['floresta', 'Floresta', 'Medellín', 18, 105, 'a', 'res'],
  ['suramericana', 'Suramericana', 'Medellín', 57, 106, 'm', 'work'], ['berrio', 'Parque Berrío', 'Medellín', 109, 96, 'm', 'work'],
  ['sanantonio', 'San Antonio', 'Medellín', 100, 108, 'm', 'work'], ['plazamayor', 'Plaza Mayor', 'Medellín', 92, 111, 'a', 'work'],
  ['ayacucho', 'Ayacucho', 'Medellín', 119, 110, 'm', 'res'], ['laureles', 'Laureles', 'Medellín', 36, 123, 'm', 'res'],
  ['parquesrio', 'Parques del Río', 'Medellín', 86, 126, 'a', 'mix'], ['industriales', 'Industriales', 'Medellín', 90, 132, 'a', 'work'],
  ['ciudadrio', 'Ciudad del Río', 'Medellín', 92, 148, 'a', 'work'], ['poblado', 'Parque del Poblado', 'Medellín', 106, 139, 'm', 'work'],
  ['lleras', 'Parque Lleras', 'Medellín', 120, 158, 'm', 'mix'], ['terminalS', 'Terminal del Sur', 'Medellín', 57, 160, 'm', 'mix'],
  ['belen', 'Belén', 'Medellín', 22, 150, 'm', 'res'], ['guayabal', 'Guayabal', 'Medellín', 55, 177, 'a', 'res'],
  ['eafit', 'EAFIT', 'Medellín', 92, 178, 'm', 'uni'], ['aguacatala', 'Aguacatala', 'Medellín', 86, 187, 'a', 'mix'],
  ['ayura', 'Ayurá', 'Envigado', 84, 198, 'a', 'res'], ['envigado', 'Parque de Envigado', 'Envigado', 100, 212, 'm', 'res'],
  ['itagui', 'Parque de Itagüí', 'Itagüí', 46, 222, 'm', 'res'], ['sabaneta', 'Parque de Sabaneta', 'Sabaneta', 88, 247, 'm', 'res'],
  ['estrella', 'La Estrella', 'La Estrella', 44, 255, 'a', 'res']
];
const METRO_A = ['Niquía', 'Bello', 'Madera', 'Acevedo', 'Tricentenario', 'Caribe', 'Universidad', 'Hospital', 'Prado', 'Parque Berrío', 'San Antonio', 'Alpujarra', 'Exposiciones', 'Industriales', 'Poblado', 'Aguacatala', 'Ayurá', 'Envigado', 'Itagüí', 'Sabaneta', 'La Estrella'];
const METRO_B = ['San Antonio', 'Cisneros', 'Suramericana', 'Estadio', 'Floresta', 'Santa Lucía', 'San Javier'];
const LINEB_Y = 106;

const CityMap = JE.map = {
  t: null, mark: null, lid: null, lanes: [], stations: [], depot: null, chunks: new Map(), lmCanvas: {}, mini: null, flows: new Map(), metroA: [], metroB: [],
  idx(x, y) { return y * MW + x; },
  get(x, y) { return (x < 0 || y < 0 || x >= MW || y >= MH) ? TT.MOUNT : this.t[y * MW + x]; },
  set(x, y, v) { if (x >= 0 && y >= 0 && x < MW && y < MH) this.t[y * MW + x] = v; },
  rect(x0, y0, w, h, v, only) { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { if (x < 0 || y < 0 || x >= MW || y >= MH) continue; const c = this.get(x, y); if (!only || only.includes(c)) this.set(x, y, v); } },
  mW(y) { return Math.round(4 + 2.5 * Math.sin(y / 14) + 1.5 * Math.sin(y / 5.1) + (y > 215 ? (y - 215) * .38 : 0) + (y < 14 ? (14 - y) * .4 : 0)); },
  mE(y) { return MW - 1 - Math.round(5 + 2.5 * Math.sin(y / 11 + 1) + 1.5 * Math.sin(y / 4.3) + (y > 215 ? (y - 215) * .34 : 0) + (y < 14 ? (14 - y) * .4 : 0)); },
  district(x, y) {
    const c = rxi(y);
    if (y < 38) return 'bello'; if (y >= 196) return x < c ? 'sur' : 'envigado';
    if (x > c && y >= 86 && y <= 126 && x < c + 42) return 'centro'; if (x > c && y > 126) return 'poblado';
    if (x < c && y >= 80 && y <= 132) return 'laureles'; return 'barrio';
  },

  generate() {
    const t = this.t = new Uint8Array(MW * MH).fill(TT.BLDG);
    this.mark = new Uint8Array(MW * MH); this.lid = new Int8Array(MW * MH).fill(-1);
    const bandsEW = [], bandsNS = [];
    for (const y of CALLES) bandsEW.push({ r: y, w: AVE_EW[y] ? 3 : 2, cic: CIC_EW[y] });
    for (const x of CARRERAS) bandsNS.push({ r: x, w: AVE_NS[x] ? 3 : 2, cic: CIC_NS[x] });
    this.bandsEW = bandsEW; this.bandsNS = bandsNS;
    // aceras y ciclorrutas
    for (const b of bandsEW) {
      this.rect(0, b.r - 1, MW, 1, TT.WALK, [TT.BLDG]);
      if (b.cic) { this.rect(b.cic[0], b.r + b.w, b.cic[1] - b.cic[0], 2, TT.CICLO, [TT.BLDG, TT.WALK]); this.rect(0, b.r + b.w + 2, MW, 1, TT.WALK, [TT.BLDG]); }
      this.rect(0, b.r + b.w, MW, 1, TT.WALK, [TT.BLDG]);
    }
    for (const b of bandsNS) {
      this.rect(b.r - 1, 0, 1, MH, TT.WALK, [TT.BLDG]);
      if (b.cic) { this.rect(b.r + b.w, b.cic[0], 2, b.cic[1] - b.cic[0], TT.CICLO, [TT.BLDG, TT.WALK]); this.rect(b.r + b.w + 2, 0, 1, MH, TT.WALK, [TT.BLDG]); }
      this.rect(b.r + b.w, 0, 1, MH, TT.WALK, [TT.BLDG]);
    }
    // calzadas
    for (const b of bandsEW) this.rect(0, b.r, MW, b.w, b.w === 3 ? TT.AVE : TT.ROAD);
    for (const b of bandsNS) this.rect(b.r, 0, b.w, MH, b.w === 3 ? TT.AVE : TT.ROAD);
    // río, canal, autopistas, ciclorruta del río
    for (let y = 0; y < MH; y++) {
      const c = rxi(y);
      for (let d = -8; d <= 8; d++) {
        const ad = Math.abs(d); let v;
        if (ad <= 1) v = TT.WATER; else if (ad === 2) v = TT.CANAL; else if (ad <= 5) v = TT.AUTO; else if (ad <= 7) v = d < 0 ? TT.CICLO : TT.GRASS; else v = TT.WALK;
        this.set(c + d, y, v);
      }
    }
    // puentes en las avenidas
    for (const b of bandsEW) if (b.w === 3) {
      const rows = [b.r - 1, b.r, b.r + 1, b.r + 2, b.r + 3]; if (b.cic) rows.push(b.r + 4, b.r + 5);
      for (const y of rows) { const c = rxi(y); for (let d = -8; d <= 8; d++) { const x = c + d, v = this.get(x, y), main = y >= b.r && y < b.r + 3; if (v === TT.WATER || v === TT.CANAL) this.set(x, y, main ? TT.BRIDGE : TT.WALK); else if (main && v !== TT.AUTO) this.set(x, y, TT.AVE); } }
    }
    // montañas y comunas (casas de ladrillo)
    for (let y = 0; y < MH; y++) {
      const a = this.mW(y), e = this.mE(y), bw = 7 + Math.round(3 * Math.sin(y / 30) + (y < 90 ? 3 : 0)), be = 8 + Math.round(3 * Math.sin(y / 26 + 2) + (y < 110 ? 4 : 0));
      for (let x = 0; x < MW; x++) {
        if (x < a || x > e) this.set(x, y, TT.MOUNT);
        else if ((x < a + bw || x > e - be) && this.get(x, y) === TT.BLDG) this.set(x, y, TT.BRICK);
      }
    }
    // parques de barrio
    for (let i = 0; i < CALLES.length - 1; i++) for (let j = 0; j < CARRERAS.length - 1; j++) {
      if (h2(i, j, 11) > .085) continue;
      const y0 = CALLES[i] + (AVE_EW[CALLES[i]] ? 3 : 2) + 1, y1 = CALLES[i + 1] - 2, x0 = CARRERAS[j] + (AVE_NS[CARRERAS[j]] ? 3 : 2) + 1, x1 = CARRERAS[j + 1] - 2;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (this.get(x, y) === TT.BLDG) this.set(x, y, ((x - x0) === ((x1 - x0) >> 1) || (y - y0) === ((y1 - y0) >> 1)) ? TT.PLAZA : TT.GRASS);
    }
    // lugares emblemáticos
    LANDMARKS.forEach((L, i) => this.paintLandmark(L, i));
    // parque lineal del río
    for (let y = 116; y <= 134; y++) { const c = rxi(y); for (let d = 6; d <= 10; d++) { const v = this.get(c + d, y); if (v !== TT.AVE && v !== TT.ROAD && v !== TT.BRIDGE) this.set(c + d, y, (d === 8 || y % 6 === 0) ? TT.PLAZA : TT.GRASS); } }
    // estaciones
    this.stations = STATIONS_DEF.map((s, i) => this.carveStation(s, i));
    this.marks(); this.buildLights(); this.buildLanes(); this.buildMetro(); this.buildMini();
    const dp = LM.depot; this.depot = { x: (dp.x + dp.w / 2) * TS, y: (dp.y + dp.h - 1) * TS, name: dp.name };
  },
  paintLandmark(L, i) {
    const keep = [TT.WATER, TT.CANAL, TT.AUTO];
    const base = { iglesia: TT.PLAZA, terminal: TT.PLAZA, volador: TT.LAND, campus: TT.GRASS, moravia: TT.LAND, botanico: TT.GRASS, explora: TT.PLAZA, estadio: TT.LAND, botero: TT.PLAZA, coltejer: TT.LAND, teatro: TT.PLAZA, lleras: TT.PLAZA, pies: TT.PLAZA, luces: TT.PLAZA, depot: TT.DEPOT, cerro: TT.LAND, mamm: TT.GRASS, aeropuerto: TT.LAND }[L.k];
    for (let y = L.y; y < L.y + L.h; y++) for (let x = L.x; x < L.x + L.w; x++) { if (keep.includes(this.get(x, y))) continue; this.set(x, y, base); this.lid[this.idx(x, y)] = i; }
    const solid = (x, y, w, h) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (this.lid[this.idx(L.x + xx, L.y + yy)] === i) this.set(L.x + xx, L.y + yy, TT.LAND); };
    const W = L.w, H = L.h;
    switch (L.k) {
      case 'iglesia': solid((W >> 1) - 2, 1, 4, 4); break;
      case 'terminal': solid(1, 1, W - 2, 3); break;
      case 'campus': solid(1, 1, 3, 3); solid(W - 4, 1, 3, 3); solid(1, H - 4, 3, 3); solid(W - 4, H - 4, 3, 3); break;
      case 'botanico': solid(3, 2, 5, 4); break;
      case 'explora': solid(1, 1, 3, 3); solid(5, 1, 3, 2); solid(5, 4, 3, 2); break;
      case 'botero': solid(0, 0, W, 2); break;
      case 'teatro': solid(1, 1, 5, 4); break;
      case 'mamm': solid(1, 1, 5, 3); break;
      case 'depot': solid(0, 0, W, 2); for (let x = 3; x < 7; x++) for (let y = L.y + L.h; y < L.y + L.h + 3; y++) { const v = this.get(L.x + x, y); if (v === TT.WALK || v === TT.BLDG || v === TT.CICLO) this.set(L.x + x, y, TT.DEPOT); } break;
    }
    // perímetro transitable
    for (let y = L.y - 1; y <= L.y + L.h; y++) for (let x = L.x - 1; x <= L.x + L.w; x++) {
      if (y >= L.y && y < L.y + L.h && x >= L.x && x < L.x + L.w) continue;
      const v = this.get(x, y); if (v === TT.BLDG || v === TT.BRICK) this.set(x, y, TT.WALK);
    }
  },
  carveStation(s, i) {
    const [id, name, muni, tx, ty, type, kind] = s, ok = [TT.BLDG, TT.BRICK, TT.GRASS, TT.PLAZA];
    let best = null, bd = 1e9;
    for (let y = ty - 7; y <= ty + 7; y++) for (let x = tx - 7; x <= tx + 7; x++) {
      let good = true; for (let yy = y; yy < y + 3 && good; yy++) for (let xx = x; xx < x + 4; xx++) if (!ok.includes(this.get(xx, yy)) || this.lid[this.idx(clamp(xx, 0, MW - 1), clamp(yy, 0, MH - 1))] >= 0 && this.get(xx, yy) === TT.LAND) { good = false; break; }
      if (!good) continue;
      let acc = false; for (let xx = x - 1; xx <= x + 4 && !acc; xx++) for (const yy of [y - 1, y + 3]) { const v = this.get(xx, yy); if (v === TT.WALK || v === TT.CICLO || v === TT.PLAZA || v === TT.ROAD) acc = true; }
      for (let yy = y; yy < y + 3 && !acc; yy++) for (const xx of [x - 1, x + 4]) { const v = this.get(xx, yy); if (v === TT.WALK || v === TT.CICLO || v === TT.PLAZA || v === TT.ROAD) acc = true; }
      if (!acc) continue;
      const d = Math.abs(x + 2 - tx) + Math.abs(y + 1 - ty); if (d < bd) { bd = d; best = { x, y }; }
    }
    if (!best) best = { x: tx - 2, y: ty - 1 };
    this.rect(best.x, best.y, 4, 3, TT.STATION);
    const cap = type === 'm' ? 14 + Math.floor(h2(i, 3) * 3) * 2 : 10 + Math.floor(h2(i, 4) * 2) * 2;
    const zone = ty < 84 ? 'norte' : ty < 134 ? 'centro' : 'sur';
    return { i, id, name, muni, type, kind, cap, zone, tx: best.x, ty: best.y, x: (best.x + 2) * TS, y: (best.y + 1.5) * TS };
  },
  marks() {
    const M = this.mark, road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE;
    for (const b of this.bandsEW) for (let x = 0; x < MW; x++) {
      if (b.w === 2) { if (road(this.get(x, b.r + 1))) M[this.idx(x, b.r + 1)] |= 1; }
      else { if (road(this.get(x, b.r + 1))) M[this.idx(x, b.r + 1)] |= 1; if (road(this.get(x, b.r + 2))) M[this.idx(x, b.r + 2)] |= 1; }
      if (b.cic && this.get(x, b.r + b.w + 1) === TT.CICLO) M[this.idx(x, b.r + b.w + 1)] |= 1;
    }
    for (const b of this.bandsNS) for (let y = 0; y < MH; y++) {
      if (b.w === 2) { if (road(this.get(b.r + 1, y))) M[this.idx(b.r + 1, y)] |= 2; }
      else { if (road(this.get(b.r + 1, y))) M[this.idx(b.r + 1, y)] |= 2; if (road(this.get(b.r + 2, y))) M[this.idx(b.r + 2, y)] |= 2; }
      if (b.cic && this.get(b.r + b.w + 1, y) === TT.CICLO) M[this.idx(b.r + b.w + 1, y)] |= 2;
    }
    // intersecciones: sin rayas; cebras a los lados
    for (const be of this.bandsEW) for (const bn of this.bandsNS) {
      for (let y = be.r; y < be.r + be.w; y++) for (let x = bn.r; x < bn.r + bn.w; x++) if (road(this.get(x, y))) M[this.idx(x, y)] = 16;
      for (let y = be.r; y < be.r + be.w; y++) { for (const x of [bn.r - 1, bn.r + bn.w]) if (road(this.get(x, y))) M[this.idx(x, y)] = 4; }
      for (let x = bn.r; x < bn.r + bn.w; x++) { for (const y of [be.r - 1, be.r + be.w]) if (road(this.get(x, y))) M[this.idx(x, y)] = 8; }
    }
  },
  /* semáforos en los cruces con avenida */
  buildLights() {
    this.lights = []; this.lightAt = new Int16Array(MW * MH).fill(-1);
    const road = v => v === TT.ROAD || v === TT.AVE || v === TT.BRIDGE;
    this.bandsEW.forEach((be, i) => this.bandsNS.forEach((bn, j) => {
      if (be.w !== 3 || bn.w !== 3) return;
      for (let y = be.r; y < be.r + be.w; y++) for (let x = bn.r; x < bn.r + bn.w; x++) if (!road(this.get(x, y))) return;
      const id = this.lights.length;
      this.lights.push({ id, x0: bn.r * TS, x1: (bn.r + bn.w) * TS, y0: be.r * TS, y1: (be.r + be.w) * TS, off: h2(i, j, 77) * 10 });
      for (let y = be.r; y < be.r + be.w; y++) for (let x = bn.r; x < bn.r + bn.w; x++) this.lightAt[this.idx(x, y)] = id;
    }));
  },
  /* ciclo de 10 s: [estado este-oeste, estado norte-sur]  g=verde a=amarillo r=rojo */
  lightState(L, t) { const p = ((t + L.off) % 10 + 10) % 10; return p < 4.2 ? 'gr' : p < 5 ? 'ar' : p < 9.2 ? 'rg' : 'ra'; },
  buildLanes() {
    const L = this.lanes = [], drive = v => v === TT.ROAD || v === TT.AVE || v === TT.BRIDGE || v === TT.AUTO;
    const scan = (axis, fixed, dir, spd, name) => {
      const n = axis === 'x' ? MW : MH; let s = -1;
      for (let i = 0; i <= n; i++) {
        const ok = i < n && drive(axis === 'x' ? this.get(i, fixed) : this.get(fixed, i));
        if (ok && s < 0) s = i;
        if (!ok && s >= 0) { if (i - s >= 8) L.push({ ax: axis, c: fixed * TS + 4, a: s * TS, b: i * TS, dir, spd, name }); s = -1; }
      }
    };
    for (const b of this.bandsEW) { scan('x', b.r, -1, b.w === 3 ? 34 : 26, AVE_EW[b.r]); scan('x', b.r + b.w - 1, 1, b.w === 3 ? 34 : 26, AVE_EW[b.r]); }
    for (const b of this.bandsNS) { scan('y', b.r, 1, b.w === 3 ? 34 : 26, AVE_NS[b.r]); scan('y', b.r + b.w - 1, -1, b.w === 3 ? 34 : 26, AVE_NS[b.r]); }
    for (const ln of L) {
      ln.lights = [];
      for (const g of this.lights) {
        if (ln.ax === 'x' && ln.c >= g.y0 && ln.c < g.y1 && g.x1 > ln.a && g.x0 < ln.b) ln.lights.push({ p0: g.x0, p1: g.x1, g });
        if (ln.ax === 'y' && ln.c >= g.x0 && ln.c < g.x1 && g.y1 > ln.a && g.y0 < ln.b) ln.lights.push({ p0: g.y0, p1: g.y1, g });
      }
      ln.lights.sort((a, b) => a.p0 - b.p0);
    }
    for (const [d, dir] of [[-5, 1], [-3, 1], [3, -1], [5, -1]]) L.push({ ax: 'r', d, a: 0, b: MH * TS, dir, spd: 46, lights: [], name: d < 0 ? 'Avenida Regional' : 'Autopista Norte-Sur' });
  },
  buildMetro() {
    this.metroA = METRO_A.map((n, i) => { const y = Math.round(8 + i * (244 / (METRO_A.length - 1))); return { name: n, py: y * TS + 4, px: (RX[y] + 9) * TS }; });
    const x0 = (RX[LINEB_Y] + 9) * TS, x1 = 12 * TS;
    this.metroB = METRO_B.map((n, i) => ({ name: n, px: lerp(x0, x1, i / (METRO_B.length - 1)), py: LINEB_Y * TS + 4 }));
  },
  buildMini() {
    this.mini = Art.mk(MW, MH, c => {
      const img = c.createImageData(MW, MH), d = img.data;
      for (let i = 0; i < MW * MH; i++) { const col = parseInt(MINI_COL[this.t[i]].slice(1), 16); d[i * 4] = col >> 16; d[i * 4 + 1] = col >> 8 & 255; d[i * 4 + 2] = col & 255; d[i * 4 + 3] = 255; }
      c.putImageData(img, 0, 0);
      c.fillStyle = '#d6dde6'; for (let y = 0; y < MH; y++) c.fillRect(Math.round(RX[y] + 9), y, 1, 1);
      c.fillRect(12, LINEB_Y, Math.round(RX[LINEB_Y] + 9) - 12, 1);
    });
  },

  /* ---------- flujo de ruta (Dial) para GPS y bot ---------- */
  flow(tx, ty, truck) {
    tx = clamp(tx | 0, 0, MW - 1); ty = clamp(ty | 0, 0, MH - 1);
    const key = tx + ',' + ty + (truck ? 't' : 'b'); let f = this.flows.get(key); if (f) return f;
    const ok0 = v => truck ? TRUCK_OK[v] : !SOLID[v];
    if (!ok0(this.get(tx, ty))) { const n = this.nearestOpen(tx, ty, truck); tx = n.x; ty = n.y; }
    const N = MW * MH, D = new Int32Array(N).fill(1e9), buckets = []; let cur = 0;
    const cost = v => truck ? (TRUCK_OK[v] ? (v === TT.AUTO ? 2 : 3) : 0) : PATHC[v];
    const push = (i, d) => { (buckets[d] || (buckets[d] = [])).push(i); };
    const s = ty * MW + tx; D[s] = 0; push(s, 0);
    let maxB = 0;
    while (cur <= maxB + 8) {
      const B = buckets[cur]; if (!B || !B.length) { cur++; continue; }
      const i = B.pop(); if (D[i] !== cur) continue;
      const x = i % MW, y = (i / MW) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
        const j = ny * MW + nx, c = cost(this.t[j]); if (!c) continue;
        const nd = cur + c; if (nd < D[j]) { D[j] = nd; push(j, nd); if (nd > maxB) maxB = nd; }
      }
    }
    if (this.flows.size > 40) this.flows.delete(this.flows.keys().next().value);
    this.flows.set(key, D); return D;
  },
  nextStep(D, x, y) {
    let best = null, bv = D[y * MW + x];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
      let v = D[ny * MW + nx]; if (dx && dy) { if (D[y * MW + nx] >= 1e9 || D[ny * MW + x] >= 1e9) continue; v += .5; }
      if (v < bv) { bv = v; best = { x: nx, y: ny }; }
    }
    return best;
  },
  nearestOpen(x, y, truck) {
    const ok = v => truck ? TRUCK_OK[v] : !SOLID[v];
    for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (ok(this.get(x + dx, y + dy))) return { x: x + dx, y: y + dy };
    return { x, y };
  },

  /* ---------- dibujo por bloques (caché) ---------- */
  chunk(cx, cy) {
    const k = cx + ',' + cy; let c = this.chunks.get(k);
    if (c) { this.chunks.delete(k); this.chunks.set(k, c); return c; }
    c = Art.mk(CH * TS, CH * TS, x => this.drawChunk(x, cx, cy));
    this.chunks.set(k, c); if (this.chunks.size > 30) this.chunks.delete(this.chunks.keys().next().value);
    return c;
  },
  drawChunk(c, cx, cy) {
    const x0 = cx * CH, y0 = cy * CH;
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) this.drawTile(c, x, y, (x - x0) * TS, (y - y0) * TS);
    LANDMARKS.forEach((L, i) => {
      if (L.x + L.w < x0 || L.x > x0 + CH || L.y + L.h < y0 || L.y > y0 + CH) return;
      c.drawImage(this.landmarkCanvas(i), (L.x - x0) * TS, (L.y - y0) * TS);
    });
    // árboles (decoración)
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) {
      const v = this.get(x, y), r = h2(x, y, 5); let rad = 0;
      if (v === TT.GRASS && r < .3 && this.lid[this.idx(x, y)] < 0) rad = 3 + (r < .1 ? 1 : 0);
      else if (v === TT.WALK && r < .1) rad = 2;
      if (!rad) continue;
      const px = (x - x0) * TS + 4, py = (y - y0) * TS + 4, g = h2(x, y, 6);
      const col = g < .05 ? '#f2c230' : g < .09 ? '#e88ab8' : '#3f8a3f';
      pdisc(c, px + 1, py + 1, rad, '#0003'); pdisc(c, px, py, rad, col); pdisc(c, px - 1, py - 1, Math.max(1, rad - 2), g < .09 ? '#fff3a066' : '#5fae4f');
    }
    // metro (viaducto elevado)
    const py0 = y0 * TS, px0 = x0 * TS;
    for (let py = py0; py < py0 + CH * TS; py++) {
      const mx = Math.round(rxf(py) * TS + 9 * TS) - px0;
      if (mx < -8 || mx > CH * TS + 8) continue;
      prect(c, mx - 2, py - py0, 6, 1, '#00000033'); prect(c, mx - 3, py - py0, 6, 1, '#c9ccd1'); prect(c, mx - 2, py - py0, 1, 1, '#7d838c'); prect(c, mx + 1, py - py0, 1, 1, '#7d838c');
      if (py % 48 === 0) prect(c, mx - 1, py - py0 + 1, 3, 3, '#00000044');
    }
    const by = LINEB_Y * TS + 4 - py0, bx1 = (RX[LINEB_Y] + 9) * TS - px0, bx0 = 12 * TS - px0;
    if (by > -6 && by < CH * TS + 6) { prect(c, bx0, by - 2, bx1 - bx0, 6, '#00000033'); prect(c, bx0, by - 3, bx1 - bx0, 6, '#c9ccd1'); prect(c, bx0, by - 2, bx1 - bx0, 1, '#7d838c'); prect(c, bx0, by + 1, bx1 - bx0, 1, '#7d838c'); }
    for (const st of this.metroA) { const sx = st.px - px0, sy = st.py - py0; if (sx > -20 && sx < CH * TS + 20 && sy > -30 && sy < CH * TS + 30) { prect(c, sx - 6, sy - 10, 12, 20, '#e8ebef'); prect(c, sx - 6, sy - 10, 12, 2, PAL.vd); prect(c, sx - 6, sy + 8, 12, 2, PAL.vd); prect(c, sx - 2, sy - 8, 4, 16, '#7d838c'); } }
    for (const st of this.metroB) { const sx = st.px - px0, sy = st.py - py0; if (sx > -30 && sx < CH * TS + 30 && sy > -20 && sy < CH * TS + 20) { prect(c, sx - 10, sy - 6, 20, 12, '#e8ebef'); prect(c, sx - 10, sy - 6, 2, 12, PAL.cie); prect(c, sx + 8, sy - 6, 2, 12, PAL.cie); prect(c, sx - 8, sy - 2, 16, 4, '#7d838c'); } }
  },
  drawTile(c, x, y, px, py) {
    const v = this.get(x, y), r = h2(x, y), R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(px + a, py + b, w, h); };
    const m = this.mark[this.idx(clamp(x, 0, MW - 1), clamp(y, 0, MH - 1))];
    switch (v) {
      case TT.GRASS: R(0, 0, 8, 8, r < .5 ? '#5d9c4b' : '#62a350'); if (h2(x, y, 1) < .6) R((h2(x, y, 2) * 7) | 0, (h2(x, y, 3) * 7) | 0, 1, 1, '#78b862'); if (h2(x, y, 4) < .05) R(3, 3, 1, 1, h2(x, y, 7) < .5 ? '#ffd84a' : '#ff8fc7'); break;
      case TT.MOUNT: R(0, 0, 8, 8, '#2f6b3a'); for (let i = 0; i < 3; i++) { const a = (h2(x, y, 10 + i) * 8) | 0, b = (h2(x, y, 20 + i) * 8) | 0; R(a, b, 2, 2, i ? '#275a31' : '#3a7d44'); } if (r < .04) R(3, 2, 2, 2, '#c9683f'); break;
      case TT.BRICK: {
        const cols = ['#b45a36', '#c9683f', '#8e959c', '#d8d2c4', '#a84f30', '#9c6b4e'];
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const col = cols[(h2(x * 2 + i, y * 2 + j, 3) * cols.length) | 0]; R(i * 4, j * 4, 4, 4, col); R(i * 4 + 3, j * 4, 1, 4, shade(col, -.25)); R(i * 4, j * 4 + 3, 4, 1, shade(col, -.25)); if (h2(x * 2 + i, y * 2 + j, 4) < .2) R(i * 4 + 1, j * 4 + 1, 1, 1, '#2b2f38'); }
        break;
      }
      case TT.BLDG: {
        const d = this.district(x, y), lk = (xx, yy) => (Math.floor((xx + ((h2(Math.floor(yy / 3), 9) * 2) | 0)) / 3)) * 1000 + Math.floor(yy / 3);
        const my = lk(x, y), pal = d === 'centro' ? ['#c9c5bd', '#b3b7bd', '#8fa6bf', '#d8d4cb', '#a5aab2', '#c0623b'] : d === 'poblado' ? ['#e6e6e1', '#9fb8cf', '#c9ced6', '#7f9cb8', '#d9d4c8'] : d === 'laureles' ? ['#c0623b', '#b4552f', '#cf7a4f', '#d9d2c4', '#a85b3c'] : ['#b9653f', '#c9683f', '#9aa0a6', '#d8d2c4', '#a84f30', '#c4b49a'];
        const hh = h2(my, 7, 1), col = pal[(hh * pal.length) | 0], tall = (d === 'centro' || d === 'poblado') && h2(my, 8, 2) < .4;
        R(0, 0, 8, 8, col);
        if (tall) { for (let i = 1; i < 8; i += 3) R(i, 1, 1, 6, shade(col, -.12)); }
        else if (h2(x, y, 9) < .18) R(2 + ((h2(x, y, 8) * 3) | 0), 2, 2, 2, '#2b2f38');
        const n = (xx, yy) => this.get(xx, yy) === TT.BLDG && lk(xx, yy) === my;
        if (!n(x, y - 1)) R(0, 0, 8, 1, shade(col, .25)); if (!n(x - 1, y)) R(0, 0, 1, 8, shade(col, .15));
        if (!n(x, y + 1)) R(0, 7, 8, 1, shade(col, tall ? -.5 : -.3)); if (!n(x + 1, y)) R(7, 0, 1, 8, shade(col, tall ? -.45 : -.25));
        break;
      }
      case TT.ROAD: case TT.AVE: case TT.AUTO: case TT.BRIDGE: case TT.DEPOT: {
        const base = v === TT.AUTO ? '#30364a' : v === TT.DEPOT ? '#8d97a5' : v === TT.AVE ? '#3a4152' : '#3d4454';
        R(0, 0, 8, 8, base); if (r < .3) R((h2(x, y, 2) * 7) | 0, (h2(x, y, 3) * 7) | 0, 1, 1, shade(base, .08));
        if (m & 1) for (let i = 0; i < 8; i += 4) R(i, 0, 2, 1, v === TT.AUTO ? '#ffd166' : '#e8e8e0');
        if (m & 2) for (let i = 0; i < 8; i += 4) R(0, i, 1, 2, v === TT.AUTO ? '#ffd166' : '#e8e8e0');
        if (m === 4) for (let i = 1; i < 8; i += 2) R(1, i, 6, 1, '#e8e8e0');
        if (m === 8) for (let i = 1; i < 8; i += 2) R(i, 1, 1, 6, '#e8e8e0');
        if (v === TT.BRIDGE) { if (this.get(x, y - 1) !== TT.BRIDGE) R(0, 0, 8, 1, '#c9ccd1'); if (this.get(x, y + 1) !== TT.BRIDGE) R(0, 7, 8, 1, '#c9ccd1'); }
        if (v === TT.AUTO) { const w = this.get(x - 1, y), e = this.get(x + 1, y); if (w !== TT.AUTO && w !== TT.AVE) R(0, 0, 1, 8, '#ffd166'); if (e !== TT.AUTO && e !== TT.AVE) R(7, 0, 1, 8, '#ffd166'); }
        if (v === TT.DEPOT && (x + y) % 3 === 0) R(1, 3, 6, 1, '#ffd166');
        break;
      }
      case TT.WALK: {
        R(0, 0, 8, 8, '#bdb9ab'); R(0, 3, 8, 1, '#b0ac9d'); R(3, 0, 1, 8, '#b0ac9d');
        const rd = vv => vv === TT.ROAD || vv === TT.AVE || vv === TT.AUTO;
        if (rd(this.get(x, y - 1))) R(0, 0, 8, 1, '#8f8b7e'); if (rd(this.get(x, y + 1))) R(0, 7, 8, 1, '#8f8b7e');
        if (rd(this.get(x - 1, y))) R(0, 0, 1, 8, '#8f8b7e'); if (rd(this.get(x + 1, y))) R(7, 0, 1, 8, '#8f8b7e');
        break;
      }
      case TT.CICLO: {
        R(0, 0, 8, 8, '#4a9a2c'); if (r < .4) R((h2(x, y, 2) * 7) | 0, (h2(x, y, 3) * 7) | 0, 1, 1, '#55a634');
        const cc = vv => vv === TT.CICLO;
        if (!cc(this.get(x, y - 1))) R(0, 0, 8, 1, '#9bd341'); if (!cc(this.get(x, y + 1))) R(0, 7, 8, 1, '#9bd341');
        if (!cc(this.get(x - 1, y))) R(0, 0, 1, 8, '#9bd341'); if (!cc(this.get(x + 1, y))) R(7, 0, 1, 8, '#9bd341');
        if (m & 1) { for (let i = 0; i < 8; i += 4) R(i, 0, 2, 1, '#eaf7d4'); }
        if (m & 2) { for (let i = 0; i < 8; i += 4) R(0, i, 1, 2, '#eaf7d4'); }
        if (h2(x, y, 31) < .045) { R(2, 3, 1, 2, '#eaf7d4'); R(5, 3, 1, 2, '#eaf7d4'); R(3, 2, 2, 1, '#eaf7d4'); }
        break;
      }
      case TT.WATER: R(0, 0, 8, 8, '#3d7c8c'); if (r < .5) R((h2(x, y, 2) * 5) | 0, (h2(x, y, 3) * 7) | 0, 3, 1, '#5b9aa8'); if (r > .85) R(1, 5, 2, 1, '#7fb6c0'); break;
      case TT.CANAL: R(0, 0, 8, 8, '#9a9a92'); R(0, 0, 8, 1, '#b4b4ac'); { const w1 = this.get(x - 1, y) === TT.WATER, w2 = this.get(x + 1, y) === TT.WATER; if (w1) R(0, 0, 2, 8, '#6f6f68'); if (w2) R(6, 0, 2, 8, '#6f6f68'); } break;
      case TT.PLAZA: R(0, 0, 8, 8, '#ddd3b8'); if ((x + y) & 1) R(0, 0, 4, 4, '#d3c8aa'), R(4, 4, 4, 4, '#d3c8aa'); break;
      case TT.STATION: {
        R(0, 0, 8, 8, '#eef2f5'); R(0, 7, 8, 1, '#dde3e8');
        if (this.get(x, y - 1) !== TT.STATION) R(0, 0, 8, 2, PAL.vd); if (this.get(x, y + 1) !== TT.STATION) R(0, 7, 8, 1, PAL.vd2);
        if (this.get(x - 1, y) !== TT.STATION) R(0, 0, 1, 8, PAL.vd); if (this.get(x + 1, y) !== TT.STATION) R(7, 0, 1, 8, PAL.vd);
        break;
      }
      case TT.LAND: R(0, 0, 8, 8, '#7e8a99'); break;
    }
  },
  landmarkCanvas(i) {
    if (this.lmCanvas[i]) return this.lmCanvas[i];
    const L = LANDMARKS[i], W = L.w * TS, H = L.h * TS;
    const cv = Art.mk(W, H, c => {
      const R = (a, b, w, h, col) => prect(c, a, b, w, h, col), cx = W >> 1, cy = H >> 1;
      const trees = (n, seed, area) => { for (let k = 0; k < n; k++) { const tx = area[0] + h2(k, seed) * area[2], ty = area[1] + h2(k, seed + 1) * area[3], g = h2(k, seed + 2); pdisc(c, tx + 1, ty + 1, 3, '#0003'); pdisc(c, tx, ty, 3, g < .15 ? '#f2c230' : g < .25 ? '#e88ab8' : '#3f8a3f'); pdisc(c, tx - 1, ty - 1, 1, '#5fae4f'); } };
      const roofHouse = (x, y, w, h, col) => { R(x, y, w, h, col); R(x, y + h - 1, w, 1, shade(col, -.3)); R(x + w - 1, y, 1, h, shade(col, -.25)); R(x, y, w, 1, shade(col, .2)); };
      switch (L.k) {
        case 'iglesia': case 'lleras': {
          if (L.k === 'iglesia') { const ix = cx - 16, iy = 8; roofHouse(ix, iy, 32, 32, '#b85a36'); R(ix + 12, iy - 2, 8, 36, '#c9683f'); R(ix, iy + 10, 32, 8, '#c9683f'); roofHouse(ix + 10, iy + 30, 12, 8, '#efe9dc'); R(ix + 14, iy + 32, 4, 4, '#9aa7b8'); }
          trees(L.k === 'lleras' ? 14 : 10, i * 7, [4, L.k === 'iglesia' ? 44 : 6, W - 8, H - (L.k === 'iglesia' ? 48 : 12)]);
          if (L.k === 'lleras') { pdisc(c, cx, cy, 6, '#cfc4a6'); pdisc(c, cx, cy, 3, PAL.cie); }
          break;
        }
        case 'terminal': roofHouse(8, 8, W - 16, 24, '#d9dde3'); for (let x = 12; x < W - 16; x += 12) R(x, 10, 6, 20, '#bfc6cf'); for (let k = 0; k < 4; k++) c.drawImage(Art.carTop(k % 2 ? PAL.vd2 : '#e9eef3', 'bus'), 10 + k * 14, 34); break;
        case 'volador': case 'cerro': case 'moravia': {
          const rr = Math.min(W, H) / 2 - 1;
          pdisc(c, cx, cy, rr, L.k === 'moravia' ? '#4e8f3e' : '#2f6b3a'); pdisc(c, cx - 2, cy - 2, rr * .72, L.k === 'moravia' ? '#62a350' : '#3a7d44'); pdisc(c, cx - 3, cy - 3, rr * .42, L.k === 'moravia' ? '#78b862' : '#4a8f4f');
          for (let k = 0; k < 18; k++) { const a = k / 18 * TAU, d = rr * (.5 + .45 * h2(k, i)); pdisc(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2, h2(k, 3) < .2 ? '#f2c230' : '#275a31'); }
          if (L.k === 'cerro') { R(cx - 12, cy - 10, 24, 18, '#d8cfb6'); roofHouse(cx - 10, cy - 8, 8, 6, '#b85a36'); roofHouse(cx + 2, cy - 8, 8, 6, '#c9683f'); roofHouse(cx - 10, cy + 1, 8, 6, '#c9683f'); roofHouse(cx + 1, cy, 10, 7, '#f1ece0'); R(cx + 4, cy - 3, 4, 4, '#f1ece0'); R(cx + 5, cy - 4, 2, 1, '#b85a36'); }
          if (L.k === 'moravia') for (let k = 0; k < 5; k++) R(cx - 16, cy - 12 + k * 6, 32, 2, ['#ff8fc7', '#ffd84a', '#ff6b5a', '#b07cff', '#fff'][k]);
          if (L.k === 'volador') { for (let k = 0; k < 40; k++) { const a = k / 40 * TAU * 2, d = rr * k / 44; R(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1, 1, '#c8b88a'); } }
          break;
        }
        case 'campus': {
          for (const [x, y] of [[8, 8], [W - 32, 8], [8, H - 32], [W - 32, H - 32]]) roofHouse(x, y, 24, 24, i % 2 ? '#b4552f' : '#c9c5bd');
          R(cx - 10, cy - 6, 20, 12, '#ddd3b8'); pdisc(c, cx, cy, 4, PAL.cie); trees(10, i * 5, [30, 6, W - 60, H - 12]);
          break;
        }
        case 'botanico': {
          for (let k = 0; k < 7; k++) { const hx = 26 + (k % 3) * 10 + (k > 2 ? 5 : 0) - (k > 5 ? 10 : 0), hy = 18 + Math.floor(k / 3) * 9; pdisc(c, hx, hy, 5, '#a8743c'); pdisc(c, hx, hy, 3, '#c89552'); R(hx, hy, 1, 1, '#6a4420'); }
          trees(16, 77, [4, 52, W - 8, H - 56]); trees(6, 78, [70, 4, 28, 40]); pdisc(c, W - 18, H - 16, 6, PAL.cie);
          break;
        }
        case 'explora': roofHouse(8, 8, 24, 24, '#d8432f'); roofHouse(40, 8, 24, 16, '#e05a3a'); roofHouse(40, 32, 24, 16, '#c43a26'); pdisc(c, 20, 46, 7, '#f1f3f6'); pring(c, 20, 46, 7, '#9aa7b8'); break;
        case 'estadio': {
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const ex = (x - cx) / (cx - 1), ey = (y - cy) / (cy - 1), e = ex * ex + ey * ey;
            if (e <= 1) { let col; if (e > .55) col = (Math.floor(Math.sqrt(e) * 14) % 2) ? '#c9cfd8' : '#8e98a6'; else col = (Math.floor(x / 6) % 2) ? '#4f9a3a' : '#5aa845'; c.fillStyle = col; c.fillRect(x, y, 1, 1); }
            else { c.fillStyle = '#62a350'; c.fillRect(x, y, 1, 1); }
          }
          R(cx, cy - 22, 1, 44, '#f4f4f4'); pring(c, cx, cy, 6, '#f4f4f4'); R(cx - 30, cy - 10, 1, 20, '#f4f4f4'); R(cx + 30, cy - 10, 1, 20, '#f4f4f4');
          break;
        }
        case 'botero': roofHouse(0, 0, W, 16, '#cdb27a'); R(4, 4, W - 8, 2, '#a8894f'); for (let k = 0; k < 9; k++) { const sx = 8 + (k % 5) * 14 + (k > 4 ? 7 : 0), sy = 26 + (k > 4 ? 14 : 0); pdisc(c, sx + 1, sy + 1, 4, '#0003'); pdisc(c, sx, sy, 4, '#5a4632'); pdisc(c, sx - 1, sy - 1, 2, '#7a6248'); } break;
        case 'coltejer': R(0, 0, W, H, '#ddd3b8'); R(4, 6, 24, 36, '#cfd5dc'); for (let y = 8; y < 40; y += 3) R(6, y, 20, 1, '#9fb0c4'); pline(c, 4, 6, 16, 0, '#eef1f4'); pline(c, 28, 6, 16, 0, '#eef1f4'); R(28, 10, 4, 34, '#0003'); break;
        case 'teatro': roofHouse(8, 8, 40, 32, '#a34e2c'); pline(c, 8, 8, 48, 40, '#c46a44'); pline(c, 8, 40, 48, 8, '#8a3f22'); R(26, 22, 4, 4, '#c46a44'); break;
        case 'pies': R(6, 6, 30, 22, '#e6d29a'); R(40, 6, 26, 6, PAL.cie); R(40, 16, 26, 6, PAL.cie); for (let k = 0; k < 14; k++) pdisc(c, 10 + h2(k, 9) * 50, 34 + h2(k, 8) * 16, 2, '#3d7d3a'); break;
        case 'luces': for (let y = 4; y < H; y += 7) for (let x = 4; x < W; x += 7) { R(x + 1, y + 1, 2, 2, '#0002'); R(x, y, 2, 2, '#ffffff'); R(x, y, 1, 1, PAL.vd1); } break;
        case 'mamm': roofHouse(8, 8, 40, 24, '#8e4a2a'); for (let x = 10; x < 46; x += 6) R(x, 10, 2, 20, '#a85b3c'); roofHouse(50, 10, 16, 16, '#9fb8cf'); trees(6, 33, [6, 38, W - 12, H - 42]); break;
        case 'depot': roofHouse(0, 0, W, 16, '#f2f5f8'); for (let x = 2; x < W - 2; x += 10) R(x, 3, 6, 10, PAL.vd); R(0, 15, W, 1, PAL.az2); for (let k = 0; k < 2; k++) { c.save(); c.translate(14 + k * 18, 22); c.drawImage(Art.truckTop(10, 20), 0, 0); c.restore(); } for (let x = 52; x < W - 6; x += 5) c.drawImage(Art.bikeTop(), x, 24); break;
        case 'aeropuerto': {
          R(0, 0, W, H, '#6aa356'); R(cx - 12, 4, 24, H - 8, '#4a505c'); for (let y = 16; y < H - 16; y += 14) R(cx - 1, y, 2, 7, '#f4f4f4');
          for (let k = 0; k < 6; k++) { R(cx - 10 + k * 4, 8, 2, 8, '#f4f4f4'); R(cx - 10 + k * 4, H - 16, 2, 8, '#f4f4f4'); }
          R(cx + 14, 40, 8, H - 80, '#5a606c'); roofHouse(W - 12, 60, 10, 50, '#e9eef3');
          const p = (x, y) => { R(x - 1, y - 8, 3, 16, '#f4f7fa'); R(x - 8, y - 2, 17, 3, '#f4f7fa'); R(x - 3, y + 5, 7, 2, '#f4f7fa'); R(x, y - 8, 1, 2, PAL.vd); };
          p(cx + 18, 130); p(cx, 60);
          break;
        }
      }
    });
    this.lmCanvas[i] = cv; return cv;
  }
};
