/* =====================================================================
   ESCALA · que todo tenga el tamaño y la proporción de la realidad
   Regla de oro: el motor piensa en METROS, SEGUNDOS y KILOGRAMOS. El dibujo solo multiplica por los píxeles por metro
   de cada vista (pxPorMetro). Así una persona, una puerta, una bici, un carro, un bus y un edificio guardan siempre su
   proporción real en todas las vistas y en todos los juegos.
   - MEDIDAS: tamaños de referencia (con su rango) de personas, puertas, pisos, calles, vehículos, árboles y mobiliario.
   - validar(): revisa el registro de vehículos (o cualquier lista) y dice qué se sale de lo real.
   - Ayudas: altura por clase, píxeles por metro enteros para el pixel art, escala de sprites y «arcade» sin deformar.
   ===================================================================== */
const MEDIDAS = {
  /* gente (Colombia: hombres ≈ 1,72 m y mujeres ≈ 1,59 m de estatura media adulta, NCD‑RisC) */
  persona: { alto: [1.45, 1.95], ref: 1.68 }, nino8: { alto: [1.15, 1.40], ref: 1.28 },
  /* arquitectura (NSR‑10 y práctica común) */
  puerta: { alto: [2.0, 2.4], ancho: [.7, 1.2], ref: [2.1, .9] }, piso: { alto: [2.5, 3.6], ref: 3.0 }, escalon: { alto: [.15, .18], fondo: [.28, .30] },
  baranda: { alto: [.9, 1.1] }, ventana: { alto: [1.0, 1.5], antepecho: [.9, 1.1] },
  /* calles */
  carril: { ancho: [2.8, 3.65], ref: 3.25 }, anden: { ancho: [1.2, 4] }, ciclorruta: { ancho: [1.6, 3.0], ref: 2.4 }, poste: { alto: [8, 12] }, semaforo: { alto: [4.5, 6] },
  /* naturaleza */
  arbol: { alto: [4, 30], ref: 10 }, palma: { alto: [8, 25] },
  /* vehículos: largo, ancho, alto (m) y masa (kg) */
  pie: { largo: [.3, .8], ancho: [.3, .8], alto: [1.4, 2], masa: [40, 120] },
  rueda: { largo: [.3, 2.6], ancho: [.15, 1.2], alto: [.1, 1.3], masa: [55, 220] },
  moto: { largo: [1.7, 2.5], ancho: [.6, 1.0], alto: [1, 1.5], masa: [140, 450] },
  auto: { largo: [3.0, 5.6], ancho: [1.5, 2.1], alto: [.95, 2.0], masa: [550, 3000] },
  pesado: { largo: [6, 19], ancho: [2.2, 2.6], alto: [2.6, 4.4], masa: [3500, 52000] },
  riel: { largo: [18, 140], ancho: [2.4, 3.3], alto: [3.2, 4.2], masa: [30000, 250000] },
  cable: { largo: [1.8, 3.5], ancho: [1.6, 2.6], alto: [2, 2.8], masa: [500, 1500] },
  aire: { largo: [.5, 40], ancho: [.5, 40], alto: [1, 12], masa: [80, 80000] },
  agua: { largo: [1.5, 15], ancho: [.5, 4], alto: [.5, 3.5], masa: [5, 12000] }
};
const ALTO_CLASE = { pie: 1.7, rueda: 1.1, moto: 1.2, auto: 1.45, pesado: 3.4, riel: 3.8, cable: 2.4, aire: 2.5, agua: 1.2 };
const Escala = {
  MEDIDAS,
  alto(V) { return V.alto || ALTO_CLASE[V.clase] || 1.5; },
  /* píxeles por metro para que la vista muestre «metros» de alto en «px» de pantalla; con pixel art, entero */
  pxPorMetro(px, metros, entero) { const k = px / Math.max(.01, metros); return entero ? Math.max(1, Math.round(k)) : k; },
  /* cuánto se escala un sprite dibujado con «altoPx» de alto para que mida «altoReal» metros a «pxm» píxeles por metro */
  escalaSprite(altoPx, altoReal, pxm) { return altoReal * pxm / Math.max(1, altoPx); },
  /* ¿está v (un número o [largo, ancho, alto]) dentro del rango real? con tolerancia */
  dentro(v, rango, tol = .05) { return v >= rango[0] * (1 - tol) && v <= rango[1] * (1 + tol); },
  /* revisa una lista de vehículos (por defecto todo el registro) y devuelve lo que no es proporcional */
  validar(lista) {
    const L = lista || (MC.Vehiculos ? [...MC.Vehiculos.lista.values()] : []), malos = [];
    for (const V of L) { const R = MEDIDAS[V.clase]; if (!R) continue; const alto = Escala.alto(V);
      for (const [k, v] of [['largo', V.largo], ['ancho', V.ancho], ['alto', alto], ['masa', V.masa]]) if (v != null && R[k] && !Escala.dentro(v, R[k])) malos.push({ id: V.id, medida: k, valor: v, rango: R[k] }); }
    return malos;
  },
  /* proporción real entre dos cosas (p. ej. Escala.proporcion('auto', 'persona') ≈ 0,86 de alto) */
  proporcion(a, b, medida = 'alto') { const A = MEDIDAS[a], B = MEDIDAS[b], va = A && (Array.isArray(A.ref) ? A.ref[0] : A.ref || (A[medida] && (A[medida][0] + A[medida][1]) / 2)), vb = B && (Array.isArray(B.ref) ? B.ref[0] : B.ref || (B[medida] && (B[medida][0] + B[medida][1]) / 2)); return va && vb ? va / vb : NaN; },
  /* «arcade» sin deformar: un juego puede ir más rápido (tiempo) o comprimir distancias de viaje (mapa), pero los
     cuerpos conservan su tamaño. Devuelve los factores para cada cosa. */
  arcade({ velocidad = 1, distancia = 1 } = {}) { return { velocidad, tiempo: distancia / velocidad, tamano: 1 }; }
};
MC.Escala = Escala;
