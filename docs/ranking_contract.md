# Ranking Contract

El ranking global de la porra se construye combinando los puntos de la fase de grupos y los puntos de las fases eliminatorias.

## Estructura
`ranking.json` contiene la clasificación ordenada por:
1. `totalPoints` (descendente)
2. `groupPoints` (descendente, en caso de empate)
3. `displayName` (alfabético ascendente)

## Puntuación Dinámica
- Si no existen resultados reales de eliminatorias (`actual_knockout_bracket.json` marca "PENDING"), el ranking omitirá calcular puntos nulos de eliminatorias y basará su puntuación total solo en la fase de grupos.
- Cada participante recibe un registro en el ranking con su desglose exacto: `groupPoints`, `knockoutPoints` y `totalPoints`.
