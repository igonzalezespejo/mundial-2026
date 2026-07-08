# Próximos Pasos (Next Steps)

## Fase 5B: Automatización futura

Para el futuro, este flujo de actualización de resultados manuales puede automatizarse:

- **Evaluar API fiable** de resultados FIFA 2026.
- **Crear script `fetchResults.mjs`**: Un script que descargue los datos de la API y genere el contenido para `manual_results.json` automáticamente, mapeando los IDs o nombres a los internos.
- **Integrar GitHub Actions programado**: Un action que corra de forma programada (ej. cada hora o cada día al terminar jornada), ejecutando `fetchResults.mjs`, seguido de `npm run check:all` y, si pasa, haga un commit automático con los nuevos datos.
- **Revisar nombres de equipos y mapping**: Como las APIs suelen usar distintas convenciones (ej. USA vs Estados Unidos, NED vs Países Bajos), crear un mapping robusto.
- **Mantener fallback manual**: La automatización debe estar diseñada de forma que `manual_results.json` todavía se pueda editar a mano si la API se cae, tal cual se define en la Fase 5A.
