# Revisión de Reglas de Puntuación de Eliminatorias

## A. Texto oficial de reglas

A partir de eliminatorias se puntuará por equipo acertado que pase de ronda.
Si se acierta el cruce y el resultado exacto se obtendrán puntos extras.

Dieciseisavos:
- Acertar un clasificado: 10 puntos.
- Acertar clasificado y posición en el cruce: 20 puntos / o según admin 10 + extra si coincide ruta.
- 20 puntos extra si se acierta el cruce y resultado.

Octavos:
- Por cada clasificado acertado: 40 puntos.
- 40 puntos extra si se acierta el cruce y resultado.

Cuartos:
- Por cada clasificado acertado: 60 puntos.
- 60 puntos extra si se acierta el cruce y resultado.

Semis:
- Por cada clasificado acertado: 80 puntos.
- 80 puntos extra si se acierta el cruce y resultado.

3er/4º:
- Por cada clasificado acertado: 100 puntos.
- 100 puntos extra si se acierta el cruce y resultado.

Final:
- Por cada clasificado acertado: 150 puntos.
- 150 puntos extra si se acierta el cruce y resultado.

Campeón:
- 400 puntos.

## B. Regla implementada actualmente

La lógica implementada actualmente en `src/scoring/knockout.js` interpreta los puntos base para R16 (y rondas posteriores) de la siguiente manera:

R16 actual:
- Solo mira el `winner` real del partido R16.
- Si ese winner aparece en los equipos QF apostados por el participante (es decir, equipos que el participante predijo que avanzarían a cuartos), suma 40.
- No mira el otro equipo del partido R16.
- No suma por un equipo apostado que sí aparece en el cruce real pero pierde.

**Ejemplo:**
Juan R16-03:
- Apuesta: Brasil vs Ecuador
- Real: Brasil vs Noruega
- Winner real: Noruega
- QF apostados por Juan: no contiene Noruega
- Resultado actual web: 0

## C. Interpretación alternativa a validar

Propuesta:

**Nuevo código implementado:**
Se ha unificado la lógica para que R16, QF, SF, THIRD_PLACE y FINAL evalúen lo mismo: dar `def.base` si el `predHome` coincide con `actHome` o `actAway`, y otro `def.base` si el `predAway` coincide con `actHome` o `actAway`. Básicamente, se cruzan los equipos presentes en la apuesta contra los equipos presentes en el partido real, sin importar el ganador futuro.

**Estado Actual:**
Esta regla ha sido adoptada oficialmente e implementada en el motor de puntuación desde R16 en adelante. Los puntos base se otorgan por equipo acertado en el cruce real de la ronda correspondiente, y no por ganador que avanza a la siguiente ronda.

- Si además se acierta el cruce completo y el resultado exacto: +40 extra.

**Ejemplo:**
Juan R16-03:
- Apuesta: Brasil vs Ecuador
- Real: Brasil vs Noruega
- Brasil está acertado en el cruce => +40
- Ecuador no está => +0
- Resultado no exacto => +0
- Total R16-03 alternativo = 40
