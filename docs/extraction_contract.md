# Extraction Contract

Este documento define la estructura de los datos extraídos (JSON) generados a partir del Excel original, y las convenciones utilizadas.

## Esquema de JSONs Generados

### \`data/participants.json\`
Lista de participantes de la porra.
\`\`\`json
{
  "participantId": "string (nombre de hoja)",
  "sheetName": "string",
  "displayName": "string",
  "source": "excel"
}
\`\`\`

### \`data/matches.json\`
Catálogo de partidos únicos extraídos.
\`\`\`json
{
  "matchId": "GROUP-Mxico-Sudfrica",
  "round": "GROUP",
  "group": null,
  "date": "2026-06-11", // ISO 8601 YYYY-MM-DD
  "kickoffTime": null,
  "kickoffDateTime": null,
  "timezone": null,
  "excelRawDate": 46184.875, // Valor crudo del Excel para trazabilidad
  "homeTeam": "México",
  "awayTeam": "Sudáfrica",
  "status": "FINISHED | PENDING"
}
\`\`\`

### \`data/predictions.json\`
Apuestas realizadas por cada participante.
\`\`\`json
{
  "participantId": "string",
  "matchId": "string",
  "round": "GROUP",
  "homeTeam": "string",
  "awayTeam": "string",
  "predictedHomeGoals": 2,
  "predictedAwayGoals": 1
}
\`\`\`

### \`data/results.json\`
Resultados reales de los partidos extraídos.
\`\`\`json
{
  "matchId": "string",
  "homeGoals": 2,
  "awayGoals": 1
}
\`\`\`

## Tratamiento de Datos Específicos
- **Generación de IDs de Partidos**: Se utiliza una composición estable del tipo \`GROUP-HomeTeam-AwayTeam\` donde los nombres de los equipos son sanitizados (eliminando caracteres especiales y espacios) para asegurar unicidad y reproducibilidad.
- **Fechas**: Se preserva el valor crudo en la propiedad \`excelRawDate\`. Si el Excel provee fecha válida (serial de excel o cadena de texto), se transforma al formato \`YYYY-MM-DD\` y se guarda en \`date\`. El horario \`kickoffTime\` se deja nulo al no disponer de certidumbre en la fuente.
- **Resultados Pendientes**: Partidos sin goles reales asignados se marcan con estado \`PENDING\`. Las predicciones asociadas devuelven 0 puntos en la validación, sin generar error.
- **Datos Inválidos / Vacíos**: Si un participante deja un campo de predicción vacío, no se añade al JSON (o se excluye durante la validación de JS), devolviendo 0 puntos con un "warning".
