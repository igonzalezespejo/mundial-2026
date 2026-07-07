# Bracket Template Contract

La plantilla del cuadro oficial de la fase final se ha extraído de la hoja `FaseFinal` del Excel original (`Porra Mundial FIFA 2026 - Plantilla.xlsx`).

## Estructura del JSON (`data/bracket_template_2026.json`)
Cada slot del cuadro cumple con el siguiente formato, independiente de nombres de equipos:

```json
{
  "slotId": "R32-01",
  "matchNo": 73,
  "round": "R32",
  "homeSource": "2A",
  "awaySource": "2B",
  "homeSourceType": "GROUP_POSITION",
  "awaySourceType": "GROUP_POSITION",
  "thirdPlacePool": null,
  "nextWinnerSlotId": "R16-01"
}
```

Para cruces con mejores terceros, el formato especifica el grupo de pool:
```json
{
  "slotId": "R32-02",
  "matchNo": 74,
  "homeSource": "1E",
  "awaySource": "3ABCDF",
  "awaySourceType": "BEST_THIRD_COMBINATION",
  "thirdPlacePool": ["A", "B", "C", "D", "F"]
}
```

## Propósito
Este contrato asegura que el motor de la Porra Mundial respeta el cuadro de cruces del torneo y no depende de los nombres que el participante haya colocado, sino de la arquitectura posicional subyacente.
