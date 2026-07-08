# Pruebas Locales

Para probar los resultados localmente sin subirlos a producción, sigue los siguientes pasos:

1. Actualiza los datos de prueba en `data/manual_results.json`.
2. Ejecuta el proceso de recálculo:
   ```bash
   npm run build:results
   npm run validate:knockout
   ```
   *Alternativa recomendada: `npm run check:all` que ejecutará todas las pruebas y actualizaciones en cadena.*
3. Lanza el servidor local:
   ```bash
   npm run serve
   ```
4. Ingresa a `http://localhost:4173/`.
5. Verifica los puntos y la información en la pestaña "Eliminatorias" en la ficha individual de un participante.
