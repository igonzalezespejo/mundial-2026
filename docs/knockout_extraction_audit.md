# Knockout Extraction Audit

El sistema extrae los datos de eliminatorias sin basarse en el orden en que el participante introdujo los partidos en la hoja PORRA. 
El orden está garantizado por la vinculación entre los cruces R32 y los slots dinámicos precalculados.

## Mapeo
1. `extractExcel.mjs` lee los resultados de los grupos.
2. Llama a `computeGroupStandings` para decidir posiciones (1A, 2B, 3ABCDF, etc.).
3. Cruza esas posiciones con `bracket_template_2026.json`.
4. Asigna a la predicción del participante el `slotId` correcto (R32-01, R32-02, etc.).

## Trazabilidad
Este método de extracción es robusto e ignora los cambios que haya podido sufrir la fórmula en la hoja PORRA, resolviendo la discrepancia de posiciones de eliminatorias internamente.
