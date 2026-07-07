# Audit Excel Structure
  
## Sheets List
Total sheets: 49
Auxiliary sheets: Resumen, Resultados, Evolucion_Puntos, Evolucion_Ranking
Participant sheets: 45

## Rango de Fase de Grupos
- Las hojas de participantes tienen una cabecera en la fila 3 (índice 2).
- Los partidos de Fase de Grupos van de la fila 5 (índice 4) a la fila 76 (índice 75). Son 72 partidos.
- **Validación Estructural**: ✅ Todas las hojas de participantes mantienen la misma alineación de partidos para la fase de grupos.

## Rango de Eliminatorias (Pendiente Fase 2)
- Los cruces de eliminatorias se encuentran inmediatamente después de la fila 76.
- Suele haber separadores como "Octavos", "Cuartos", etc.
- Habrá que extraer usando índices estructurales para evitar problemas con nombres divergentes.

## Columnas Detectadas (Índices)
- B (1): Date (puede incluir hora en fracción decimal)
- C (2): Home Team
- D (3): Predicted Home Goals
- F (5): Predicted Away Goals
- G (6): Away Team
- H (7): Real Home Goals
- I (8): Real Away Goals
- J (9): Points Calculated (Puntos Excel por partido)
- J3 (9): Total Puntos Excel por participante.

## Observaciones de Resultados
- La hoja `Resultados` es auxiliar.
- Los resultados también están replicados en cada hoja de participante (columnas 7 y 8).
- La extracción actual toma los resultados directamente de las hojas de participante, asumiendo que están sincronizados. Si hubiera discrepancias entre ellos, el motor JS validaría contra la primera aparición encontrada. 
- Para la Fase 2 es recomendable unificar o advertir si las fuentes difieren.

## Riesgos de Extracción
- Usar nombres de equipo como IDs causa fragmentación si difieren. Cambiado a `GROUP-XXX`.
- Formularios rígidos asumen que todos los Excel se exportarán con la misma cantidad de filas.
