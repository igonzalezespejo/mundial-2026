# Porra Mundial 2026

Proyecto para gestionar y visualizar las apuestas del Mundial 2026.

## Fase 1: Arquitectura y Extracción Base
Una aplicación estática y sin dependencias de base de datos para visualizar el ranking y las predicciones de los participantes de una Porra para la Copa Mundial de la FIFA 2026. Este proyecto extrae los datos desde una matriz de Excel y genera JSONs estáticos para ser consumidos por una página web desplegada de forma gratuita vía GitHub Pages.

## Instalación

1. Clona el repositorio e instala las dependencias locales.
```bash
npm install
```
*(Nota: Las dependencias solo se utilizan localmente para extraer el Excel, realizar pruebas unitarias y levantar el servidor de pruebas. La página final no requiere Node.js)*

## Generación de Datos
Para generar todos los archivos `json` que necesita la UI a partir de la carpeta `data_raw/`:
```bash
npm run extract
```

## Validación Completa (Preflight)
Para validar la estructura matemática, asegurar la privacidad (ausencia de PII en repositorios públicos) y correr pruebas de regresión, utiliza el atajo maestro:
```bash
npm run check:all
```

## Pruebas en Servidor Local
Para evitar restricciones CORS al visualizar la web con `fetch()` local, sirve el directorio ejecutando:
```bash
npm run serve
```
Abre tu navegador en: [http://localhost:4173/](http://localhost:4173/)

## Publicación en GitHub Pages

Consulta la [Guía de Despliegue en GitHub Pages](docs/github_pages_deployment.md) y asegúrate de verificar todo con el [Checklist de Despliegue](docs/deployment_checklist.md). 

Para actualizar resultados a futuro, sigue el [Flujo de actualización de resultados](docs/update_results_workflow.md).

> [!CAUTION]
> **Archivos a excluir siempre**: Nunca hagas commit de la carpeta `data_raw/`, ni de archivos `*.xlsx`, `.env` o la carpeta `node_modules/`. El archivo `.gitignore` ya está configurado para evitarlos.
