# Local Testing Guide

Antes de desplegar en producción, es vital ejecutar la web en un servidor local para sortear las restricciones CORS de `fetch()` con archivos locales.

## Comandos a ejecutar en orden

```bash
npm run extract
npm run validate
npm run validate:knockout
npm run privacy
npm run check:frontend
npm test
npm run serve
```

El script `npm run serve` levantará un servidor local minimalista en `http://localhost:4173/`. 
Abre esta URL en tu navegador para interactuar con la aplicación completa con todos los datos actualizados.
