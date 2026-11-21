/* =====================================================================
   REGISTRO DE CLAVES DEL GUARDADO (v2.1) · tarea 10 de TAREAS-IA.md, traída de la rama `revolucion-v2` (82b242d)
   y puesta al día con las claves de hoy. El guardado es 'juegaencicla.v1' y no cambia.
   Cada módulo que guarde algo nuevo en Save.data lo declara aquí (o con Save.registrar) con su TIPO y su DUEÑO.
   tests/run.js falla si, al final de la batería, aparece una clave sin registrar o con otro tipo: así no se repite
   el choque de `dia` y `diaValle` ni el de `trama` (objeto de la entrega) contra `trama` (lista de misiones.json).
   ===================================================================== */
Object.assign(Save, {
  CLAVES: {
    v: ['number', 'núcleo'], created: ['number', 'núcleo'], profile: ['objeto', 'personaje (67-personaje.js)'], spent: ['number', 'tienda'], owned: ['lista', 'tienda'],
    xp: ['number', 'escalafón'], stars: ['objeto', 'escalafón'], best: ['objeto', 'escalafón'], history: ['lista', 'partidas'], postales: ['lista', 'álbum'],
    perks: ['lista', 'mejoras (roguelite)'], streak: ['number', 'racha'], bestStreak: ['number', 'racha'], logros: ['lista', 'logros'], flags: ['objeto', 'secretos y banderas'],
    settings: ['objeto', 'ajustes'], stats: ['objeto', 'estadísticas'], dia: ['objeto', 'misiones del modo libre (69-libre.js)'], diaValle: ['lista', 'historia «Un día del valle» (83-guion.js)'],
    fotos: ['lista', 'fotos del modo libre'], encicla: ['objeto', 'préstamo, cuenta y reportes (82-prestamo.js)'], placas: ['objeto', 'placas de lo poco conocido vistas (87-placas.js)'],
    trama: ['objeto', 'trama «Ruedas y Rieles» (93-trama.js)'], tramaHechas: ['lista', 'misiones de misiones.json (83-guion.js)'], huevos: ['lista', 'fragmentos escondidos de la trama'],
    leaves: ['number', 'hojas viejas de la trama: se pasan a stats.leaves y quedan en 0 (98o-arreglos.js)'], guatape: ['objeto', 'Ruta a Guatapé en bici (98w-guatape.js)']
  },
  /* para los que vengan: Save.registrar('miClave', 'objeto', 'mi-modulo.js') antes de guardar */
  registrar(k, tipo, dueno) { if (!/^[a-zA-Z][a-zA-Z0-9_]{0,31}$/.test(k) || this.BAD && this.BAD.has(k)) throw new Error('clave inválida: ' + k); const c = this.CLAVES[k]; if (c && c[0] !== tipo) throw new Error('la clave «' + k + '» ya es de ' + c[1] + ' (' + c[0] + ')'); this.CLAVES[k] = [tipo, dueno || '?']; },
  tipoDe(v) { return Array.isArray(v) ? 'lista' : v === null ? 'nulo' : typeof v === 'object' ? 'objeto' : typeof v; },
  revisarClaves() { const mal = []; for (const k of Object.keys(this.data || {})) { const c = this.CLAVES[k], t = this.tipoDe(this.data[k]); if (!c) mal.push(k + ' (sin registrar, ' + t + ')'); else if (c[0] !== t && !(t === 'nulo' && k === 'trama')) mal.push(k + ' (' + t + ', se esperaba ' + c[0] + ')'); } return mal; }
});
