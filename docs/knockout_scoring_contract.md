# Knockout Scoring Contract (Opción A)

El sistema puntúa las fases eliminatorias (`knockout.js`) no solo verificando quién pasa, sino también considerando si el equipo llegó por la ruta (slot) exacta y si el resultado del partido se acertó, siempre hasta la prórroga (sin contar penaltis).

## Reglas de Penaltis
- Los penaltis NO puntúan.
- Los penaltis NO forman parte del resultado del partido para puntuación exacta.
- El clasificado a la siguiente ronda se infiere puramente porque aparece en la ronda subsiguiente.

## Puntuaciones
- **Dieciseisavos (R32):**
  - Base: 10 pts por acertar un equipo que sobrevive a grupos (aparece en cualquier partido R32).
  - Slot exacto: +20 pts si el equipo está además en la misma posición del cruce oficial.
  - Resultado exacto: +20 pts si el cruce es 100% exacto y se acierta el marcador (máx 80).
- **Octavos (R16):** 40 pts base por equipo acertado en el cruce real. +40 extra si cruce y marcador son exactos (máx 120).
- **Cuartos (QF):** 60 pts base por equipo acertado en el cruce real. +60 extra (máx 180).
- **Semifinales (SF):** 80 pts base por equipo acertado en el cruce real. +80 extra (máx 240).
- **Tercer Puesto:** 100 pts base por equipo acertado en el cruce real. +100 extra (máx 300).
- **Final:** 150 pts base por equipo acertado en el cruce real. +150 extra (máx 450).
- **Campeón:** 400 pts (semejante a un partido de Final extra).
