# Group Standings Contract

Dado que la plantilla de Excel no almacena en celdas fijas el resultado matemático de la fase de grupos del usuario (ni la columna "1A" ni "Puntos"), el backend recrea esta clasificación de forma independiente usando puro JavaScript (`groupStandings.js`).

## Criterios de Desempate
El orden en la fase de grupos se determina estrictamente en esta secuencia:
1. **Puntos (Points):** 3 por victoria, 1 por empate.
2. **Diferencia de goles (Goal Difference):** Goles a Favor - Goles en Contra.
3. **Goles a favor (Goals For)**

### Situación de Empate Irresoluble
Dado que la plantilla no provee tarjetas (Fair Play), un empate irresoluble requeriría un sorteo.
Para resolver esto dinámicamente y respetar la decisión del usuario:
- El motor inspeccionará la predicción de dieciseisavos de final (`knockout_predictions.json` R32).
- Si el usuario colocó a uno de los equipos empatados en el slot que corresponde al primer lugar (ej. `1A`), el motor le otorgará el liderato del grupo a dicho equipo. La propiedad `tieBreakSource` marcará esto como `extracted_knockout_slot`.
- Si esto falla, el motor aplica orden alfabético y marca el campo con `fallback_warning`.
