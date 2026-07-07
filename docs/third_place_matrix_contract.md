# Third Place Matrix Contract

La asignación de equipos que clasifican como mejores terceros a los distintos cruces de dieciseisavos (R32) no es aleatoria. Depende de las 495 combinaciones posibles de los 8 grupos (de 12 totales) que aportan un mejor tercero.

## Origen (`data/third_place_matrix_2026.json`)
La matriz de combinaciones ha sido extraída de la hoja `3er` de la plantilla Excel original suministrada por el usuario, desde la fila 35 hasta la 529.

## Estructura
El objeto JSON tiene la combinación de letras (ej. `ABCDEFGH`) como clave, y los slots de destino como atributos:
```json
{
  "ABCDEFGH": {
    "3ABCDF": "D",
    "3CDFGH": "F",
    "3CEFHI": "C",
    "3EHIJK": "H",
    "3AEHIJ": "A",
    "3BEFIJ": "E",
    "3EFGIJ": "G",
    "3DEIJL": "B"
  }
}
```

Este mapa se consulta durante la extracción de cada participante después de haber recalculado su fase de grupos (`groupStandings.js`). El string de combinación (ej. `ABCDEFGH`) se construye con la letra de los grupos de los 8 mejores terceros ordenados alfabéticamente.
