# GitHub Pages Deployment Guide

Este proyecto estático (Vanilla HTML/CSS/JS) no requiere pipelines CI/CD complejos para funcionar en GitHub Pages.

## Paso 1: Preparar tu repositorio en GitHub

1. Entra a tu cuenta de GitHub y crea un nuevo repositorio público (ej. `porra-mundial-2026`).
2. Sube los archivos de tu proyecto siguiendo el [Deployment Checklist](deployment_checklist.md).
3. Asegúrate de que el `.gitignore` esté presente y configurado.

## Paso 2: Activar GitHub Pages

1. Dirígete a la página de tu repositorio en GitHub.
2. Haz clic en la pestaña **Settings** (Configuración) en la barra superior.
3. En el menú lateral izquierdo, en la sección "Code and automation", haz clic en **Pages**.
4. En la sección **Build and deployment**:
   - Para "Source", asegúrate de que esté seleccionado **Deploy from a branch**.
   - En **Branch**, selecciona tu rama principal (normalmente `main` o `master`).
   - En el selector de carpeta, deja `/ (root)`.
5. Haz clic en **Save**.

## Paso 3: Verificar la URL

En un par de minutos, GitHub construirá y publicará la web. Te mostrará un aviso que dice *"Your site is published at..."*.

La URL esperada será similar a:
`https://<usuario>.github.io/<repo>/`

## Paso 4: Comprobación de integridad
Asegúrate de que los archivos de datos sean accesibles comprobando que esta URL directa cargue un JSON:
`https://<usuario>.github.io/<repo>/data/ranking.json`

> [!IMPORTANT]
> Si la página principal carga en blanco o se queda colgada en "Cargando datos...", abre la consola de desarrollo de tu navegador (F12). 
> Si ves errores de tipo 404 para archivos `/data/...`, asegúrate de que tu `src/dataLoader.js` usa la constante de ruta relativa `const DATA_BASE = './data/';` y no rutas absolutas.
