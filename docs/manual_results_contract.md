# Contrato de Resultados Manuales

El archivo `data/manual_results.json` es la fuente de la verdad para actualizar los resultados reales del torneo.

## Estructura

```json
{
  "metadata": {
    "updatedAt": "2026-07-06T20:00:00",
    "source": "manual",
    "notes": "Resultados introducidos manualmente"
  },
  "groupResults": [
    {
      "matchId": "GROUP-001",
      "homeGoals": 2,
      "awayGoals": 0,
      "status": "FINISHED"
    }
  ],
  "knockoutResults": [
    {
      "slotId": "R32-01",
      "matchNo": 73,
      "round": "R32",
      "homeTeam": "México",
      "awayTeam": "Canadá",
      "homeGoals": 1,
      "awayGoals": 1,
      "winner": "México",
      "status": "FINISHED",
      "decidedByPenalties": true,
      "penaltiesHome": null,
      "penaltiesAway": null,
      "notes": "México pasa por penaltis"
    }
  ],
  "champion": null
}
```

## Reglas Obligatorias
- **Goles**: `homeGoals` y `awayGoals` son los goles al final del partido (incluyendo prórroga, pero **NO** penaltis).
- **Penaltis**: Los goles de penaltis NO se suman al marcador principal ni puntúan. Si un partido se decide por penaltis, pon `decidedByPenalties: true` e indica obligatoriamente quién es el `winner`.
- **Desempates**: Si `status` es `"FINISHED"` y los goles están empatados, el campo `winner` es **obligatorio**.
- **Estados**: Usa `"PENDING"` para partidos no jugados, y `"FINISHED"` para partidos terminados.
- **champion**: Puedes indicar el nombre del equipo ganador al final del torneo en el campo `"champion"`.
