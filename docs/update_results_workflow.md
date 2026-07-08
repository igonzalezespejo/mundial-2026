# Flujo para Actualizar Resultados

Para actualizar los resultados reales del torneo y que se vean reflejados en la web pública:

1. **Editar los resultados:**
   Abre y edita el archivo `data/manual_results.json` añadiendo los resultados de los partidos ya finalizados (revisa `docs/manual_results_contract.md` para las reglas).

2. **Generar los datos actualizados y validar:**
   Ejecuta en tu terminal el pipeline completo para recalcular rankings y asegurar que todo es correcto:
   ```bash
   npm run check:all
   ```

3. **Revisar localmente:**
   Verifica que los cambios están bien levantando el servidor local:
   ```bash
   npm run serve
   ```
   Abre `http://localhost:4173/` en tu navegador y revisa el ranking y las eliminatorias de los participantes.

4. **Publicar:**
   Si todo está correcto, sube los cambios a GitHub. GitHub Pages actualizará automáticamente la web.
   ```bash
   git add data/*.json docs README.md package.json scripts src index.html styles
   git commit -m "Actualizar resultados"
   git push
   ```
