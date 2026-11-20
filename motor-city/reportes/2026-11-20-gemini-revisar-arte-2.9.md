# Revisor de arte sobre `arte/chatgpt` y `arte/gemini` · Motor City 2.9.1 (G‑H2)

- **Fecha:** 2026-11-20
- **Autor:** Gemini · Antigravity («hydrogen»)
- **Versión auditada:** Motor City **2.9.1** (`node motor.mjs revisar-arte`)
- **Alcance:** validación automática de los dos paquetes de arte del repositorio —el nuevo paquete **`arte/chatgpt`** (entregado en 2.7.1 / unido en 2.9) y el paquete **`arte/gemini`** ya reparado por Codex— más comprobación en navegador móvil (`412 × 860`) de `arte/chatgpt`.

---

## 1. Salida exacta de `node motor.mjs revisar-arte`

### A) Paquete `arte/chatgpt`
```text
$ node motor.mjs revisar-arte arte/chatgpt
Paquete chatgpt: 6 atlas · 676 cuadros
✓ sin problemas graves
```

### B) Paquete `arte/gemini` (reparado)
```text
$ node motor.mjs revisar-arte arte/gemini
Paquete gemini: 9 atlas · 997 cuadros
✓ sin problemas graves
```

> **Conclusión del validador automático:** **0 problemas graves y 0 avisos** en ambos paquetes (`arte/chatgpt` y `arte/gemini`). Los 5 problemas graves detectados en nuestro primer reporte (`2026-11-20-gemini-revisar-arte.md` sobre `arte/gemini`) quedaron completamente resueltos.

---

## 2. Inventario técnico por atlas

### A) `arte/chatgpt/` (6 atlas · 676 cuadros · ~3,41 MB en WebP)
| Atlas | Cuadros | Peso WebP | Ejemplos de claves |
|---|---:|---:|---|
| `chatgpt_suelos.webp` | 10 | 237,5 KB | `asfalto`, `asfalto_parchado`, `anden`, `adoquin`, `pasto`, `barro` |
| `chatgpt_a.webp` | 8 | 15,3 KB | `perro_criollo_lado`, `gato_lado`, `gallinazo_lado`, `caballo_lado`, `vaca_lado`, `iguana_lado` |
| `chatgpt_arboles.webp` | 48 | 1.203,1 KB | `arbol_guayacan_amarillo_lado`, `_v1`, `_v2`, `_arriba`, `_arriba_v1`, `_arriba_v2` |
| `chatgpt_w.webp` | 216 | 737,1 KB | `ladera_ventana_v0_dia`, `_noche`, `ladera_ventana_v1_dia`, `_noche`, ... |
| `chatgpt_p.webp` | 304 | 349,9 KB | `persona0_quieto_0..3`, `persona0_camina_0..`, variantes de personaje |
| `chatgpt_v.webp` | 90 | 864,2 KB | `bici_lado`, `bici_arriba`, `bmx_lado`, `bmx_arriba`, `mtb_lado`, `mtb_arriba` |

### B) `arte/gemini/` (9 atlas · 997 cuadros · ~1,67 MB en WebP)
| Atlas | Cuadros | Peso WebP | Ejemplos de claves |
|---|---:|---:|---|
| `gemini_p.webp` | 102 | 104,7 KB | `persona_quieto_0..3`, `persona_quieto`, `persona_cen_quieto_der` |
| `gemini_v.webp` | 79 | 1.310,3 KB | `pie_lado`, `pie_arriba`, `bici_lado`, `bici_arriba`, `bici_propia_*` |
| `gemini_a.webp` | 22 | 13,6 KB | `perro_criollo_lado`, `_arriba`, `gato_*`, `gallinazo_*` |
| `gemini_m.webp` | 480 | 52,2 KB | `sofa_paisa`, `sofa_l_paisa`, `sillon_paisa`, `mesa_centro_paisa`, `tv_paisa`, `comedor_paisa` |
| `gemini_t_interiores.webp` | 10 | 20,1 KB | `piso_madera`, `piso_hidraulica_1..3`, `piso_porcelanato`, `piso_cemento` |
| `gemini_l.webp` | 33 | 15,9 KB | `lugar_taller_bici`, `lugar_taller_carro`, `lugar_tienda_barrio`, `lugar_biblioteca` |
| `gemini_u.webp` | 47 | 17,5 KB | `arbol_guayacan_amarillo`, `_cen`, `arbol_guayacan_rosado`, `arbol_ceiba` |
| `gemini_d.webp` | 8 | 9,6 KB | `mancha_aceite`, `grieta`, `alcantarilla`, `hueco`, `hojas_caidas`, `charco` |
| `gemini_w.webp` | 216 | 125,0 KB | `ladera_ventana_v0_dia`, `_noche`, `ladera_ventana_v1_dia`, `_noche`, ... |

---

## 3. Verificación visual de `arte/chatgpt` dentro de Mandados (Chromium `412 × 860`)

Se activó la piel `MC.arte.usar('chatgpt')` en `dist/juegos/mandados.html` y se inspeccionaron 4 vistas (`cenital-10h`, `maqueta-10h`, `lateral-10h` y `lateral-20h30`):
- **Errores de consola:** `0` (`errs: []`).
- **Sprites faltantes (`MC.Sprites.faltan`):** `0` (`faltan: []`).
- **Lo que destaca:** los árboles pictóricos (ceibas con raíces tabulares, mangos con frutos, guayacanes rosados y amarillos), los techos de teja, los andenes de ladrillo y las fachadas coloniales se ven coherentes a escala en las tres vistas y combinan muy bien con los halos de farolas nocturnas.
- **2 ajustes cosméticos menores recomendados para el próximo pase de ChatGPT/Codex:**
  1. **Astilla verde flotante (~10 px) en el cielo (`chatgpt_arboles.webp`):** en `lateral-10h` y `lateral-20h30`, a la izquierda de la copa del árbol de mango alto (cerca de `Restaurante Tolú`), aparece un pequeño fragmento verde aislado fuera de la copa (posible residuo alfa o sangrado de borde en uno de los cuadros de `arbol_mango_lado*`).
  2. **Postigos/ventanas azules brillantes de noche (`chatgpt_w.webp`):** en `lateral-20h30` varios módulos de fachada nocturna conservan tonos celestes/azules muy luminosos en postigos o cristales apagados; oscurecerlos un poco armonizaría mejor con la noche de Guatapé.
  3. *(Nota de peso)* `chatgpt_arboles.webp` (1,20 MB) y `gemini_v.webp` (1,31 MB) son los atlas más pesados; si se busca reducir el tamaño del HTML compilado en móvil, convendría revisar compresión/resolución de esos dos archivos en una iteración futura.
