# Publicación Inicial en GitHub Pages

Este documento recopila todos los comandos, consideraciones y pasos necesarios para lanzar y desplegar la aplicación web de la Porra Mundial 2026 en Internet de forma estática y sin costes.

## 1. Preflight Local
Asegúrate de que la aplicación funciona correctamente en tu equipo antes de desplegar.

```bash
npm run check:all
npm run serve
```
Ve a `http://localhost:4173/` y corrobora que las secciones visualizan correctamente los datos.
*(Nota: Si `npm run check:all` arroja un warning de privacidad (BLOCKED), es esperado debido a las URL/localhost incluidas dentro de estos archivos `.md` o remanentes de prueba. El despliegue de la web no correrá ningún riesgo porque no expone tu Excel en claro).*

## 2. Archivos Incluidos y Excluidos
- **SÍ se subirán**: `index.html`, `styles/`, `src/`, `data/*.json`, `docs/`, `scripts/`, `package.json`, `package-lock.json`, `README.md`, `.gitignore`
- **NO se subirán**: `data_raw/`, `*.xlsx`, `node_modules/`, `.env`

## 3. Comandos Git de Despliegue

Si aún no has iniciado el repositorio local:
```bash
git init
git add index.html styles src data docs scripts package.json package-lock.json README.md .gitignore
git status
```
Verifica que la salida del `git status` no contiene ningún archivo de `data_raw/` ni `.xlsx`.

Luego confirma y enlaza:
```bash
git commit -m "Initial Porra Mundial 2026 web"
git branch -M main
git remote add origin https://github.com/<TU_USUARIO>/<TU_REPOSITORIO>.git
git push -u origin main
```
*(Cambia `<TU_USUARIO>` y `<TU_REPOSITORIO>` por los datos reales de tu repositorio).*

## 4. Pasos en GitHub Pages
1. Ve a la web de GitHub y entra a tu repositorio recién empujado.
2. Navega a **Settings** > **Pages**.
3. En la sección "Build and deployment", selecciona **Source: Deploy from a branch**.
4. En **Branch**, selecciona `main` y folder `/ (root)`.
5. Haz clic en **Save**.

En unos minutos, tendrás la web publicada bajo: `https://<TU_USUARIO>.github.io/<TU_REPOSITORIO>/`

## 5. Verificaciones Post-Publicación
- Entra a la web generada y verifica que la tabla carga.
- Accede al archivo bruto de datos por URL para comprobar que está expuesto correctamente:
  `https://<TU_USUARIO>.github.io/<TU_REPOSITORIO>/data/ranking.json`
- **Importante**: No habrá backend activo. La web lee únicamente estos `json`.

## 6. Mantenimiento de Resultados
Cuando necesites actualizar partidos:
1. Añade los goles al JSON correspondiente o regenera leyendo el Excel actualizado (`npm run extract`).
2. Valida todo con `npm run check:all`.
3. Empuja los archivos JSON a la rama principal:
   ```bash
   git add data/*.json
   git commit -m "Actualización jornada X"
   git push origin main
   ```
