# Scoring Contract

Este documento define las reglas de puntuación para la Porra Mundial 2026.

## Reglas Definitivas - Fase de Grupos
Implementadas y validadas en \`src/scoring/groupStage.js\`.

Para cada partido de la fase de grupos:
- **15 puntos**: Se acierta el resultado exacto y hay un ganador (ej. Real 2-1, Apuesta 2-1).
- **20 puntos**: Se acierta el resultado exacto y es empate (ej. Real 1-1, Apuesta 1-1).
- **5 puntos**: Se acierta el signo/ganador, pero no el resultado exacto (ej. Real 2-1, Apuesta 3-0).
- **10 puntos**: Se acierta que es un empate, pero no el resultado exacto (ej. Real 1-1, Apuesta 2-2).
- **0 puntos**: Resto de casos, fallos completos o partidos pendientes sin disputar.

### Casos especiales
- Resultados pendientes (sin valores reales): otorgan 0 puntos y no rompen la ejecución.
- Apuesta vacía: 0 puntos con un warning interno.
- Valores no numéricos en predicciones se procesan como fallos (0 puntos).

## Reglas Previstas - Eliminatorias (Pendiente de Fase 2)
*(No implementadas todavía, a documentar y desarrollar a futuro cuando haya suficientes datos)*
- En eliminatorias cuenta el resultado hasta la prórroga, no la tanda de penaltis.
- La tanda de penaltis solo determina qué equipo pasa.
- Un cruce invertido no debe considerarse el mismo cruce.
- **Dieciseisavos**: 10 puntos clasificado, 20 exacto posición, +20 cruce y resultado.
- **Octavos**: 40 puntos.
- **Cuartos**: 60 puntos.
- **Semifinales**: 80 puntos.
- **Tercer/cuarto puesto**: 100 puntos.
- **Final**: 150 puntos.
- **Campeón**: 400 puntos.

## Estado de Implementación
- [x] Motor de puntuación puro en JavaScript para la fase de grupos.
- [x] Extracción de puntos pre-calculados del Excel original.
- [x] Script de validación (Excel vs JS).
- [ ] Motor de puntuación puro para eliminatorias.
- [ ] Generación de ranking global.

## Diferencias Detectadas entre Excel y JS
**No se encontraron discrepancias** en los 45 participantes para la fase de grupos tras realizar el procesamiento exacto de los 72 partidos de grupo. El total de coincidencias es del 100% (45/45).
