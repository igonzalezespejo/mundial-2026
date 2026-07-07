# Phase 1B: Hardening Report

Este documento detalla los ajustes y refuerzos realizados en la Fase 1B, orientados a robustecer la base del proyecto antes de abordar la lógica de eliminatorias.

## Cambios Realizados

1. **Nuevo Formato de `matchId` (Estructurales)**
   - **Motivo**: Generar un ID en formato `GROUP-HomeTeam-AwayTeam` era frágil. Pequeñas variaciones, tildes o espacios extras introducían duplicados (se creaban IDs paralelos para un mismo partido si alguien lo escribía distinto). Para las eliminatorias, esto sería inviable ya que los equipos pronosticados varían por participante.
   - **Solución**: Los IDs de fase de grupos ahora son deterministas y se basan en el índice real de aparición: `GROUP-001` hasta `GROUP-072`.

2. **Fechas y Horas del Excel (`kickoffTime`)**
   - **Motivo**: Perder la precisión de las fracciones decimales en los seriales numéricos de fechas del Excel.
   - **Solución**: El parser ahora decodifica la fracción y genera `kickoffTime` (ej. `21:00`) y `kickoffDateTime` (ej. `2026-06-11T21:00:00`), conservando el valor nativo exacto en `excelRawDate`.

3. **Validación Partido a Partido**
   - **Motivo**: Validar únicamente la suma total por participante (ej. 320 vs 320 puntos) permitía que errores en la suma u omisiones compensadas pasaran desapercibidos (un falso positivo de acierto global).
   - **Solución**: `scripts/validateGroupScoring.mjs` ahora coteja el puntaje extraído de `J5...J76` de Excel, contra el puntaje JS para *cada predicción de partido individualmente*. 

4. **Auditoría Documental y Privacidad**
   - **Motivo**: Las hojas previas carecían de detalle para futuros cruces de eliminatorias y el filtro PII era corto, además reportaba el PII en claro.
   - **Solución**: Se amplió el escáner para ocultar y **redactar** (`<redacted-email>`) cualquier hallazgo sensible (email, teléfono, URL) en los reportes públicos de Markdown. Los falsos positivos de `LONGID` (como alias con guiones) se rebajaron de severidad a simple 'Review', permitiendo la compilación correcta. Se incorporó `scripts/checkPublicDataPrivacy.mjs` para garantizar que la carpeta `data/` y `docs/` son seguras antes de publicar.

5. **Estado de `.gitignore`**
   - **Motivo**: No versionar accidentalmente información sensible o que engrose el tamaño del repositorio.
   - **Estado actual**: Se excluyen `.env`, `node_modules/`, `data_raw/` y cualquier `*.xlsx`. Todo JSON se almacena limpio en `data/` y **será versionado/publicado** ya que es lo que la web consumirá directamente. Si se desea en el futuro, se aislarán datos sensibles en `data_private/`.

## Resultado de Validación
- **Total por Participante**: 45/45 coincidencias.
- **Partido a Partido**: 3.240/3.240 coincidencias exactas.
- **Discrepancias JS vs Excel**: **0**

## Riesgos Restantes antes de Fase 2 (Eliminatorias)
- **Desviación de Plantillas**: Si un usuario alteró el número de filas en su hoja (insertando una fila vacía para separar algo), se romperá el mapping estructural (`GROUP-0XX`). Para la fase 2 se requerirá comprobar marcadores de texto (ej. "Octavos de final").
- **Falta de Resultados Centralizados**: Aunque se usó la hoja de Resultados en una prueba, es vital que todas las celdas de resultado se encuentren perfectamente sincronizadas para la validación per-match en cruces eliminatorios.
