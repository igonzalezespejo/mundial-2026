# Frontend Contract

## Arquitectura
- Vanilla JS, HTML5, y CSS3 puro. Sin frameworks para garantizar ligereza y compatibilidad estática.
- Estructura SPA (Single Page Application) basada en `<template>` nativo y montado dinámico en `app.js`.

## Rutas y Datos
Todos los archivos de datos se cargan desde `./data/` mediante `fetch()`. Esto garantiza que la web pueda ejecutarse:
1. En un servidor de desarrollo local (ej. `http://localhost:4173/`).
2. En GitHub Pages bajo subrutas (`https://user.github.io/repo/`).

## Vistas
1. **Ranking Global (`rankingView.js`)**: Lista principal.
2. **Participante (`participantView.js`)**: Controlador maestro de la vista individual.
3. **Fase de Grupos (`groupView.js`)**: Renderiza los grupos y los partidos pronosticados.
4. **Eliminatorias (`bracketView.js`)**: Renderiza por rondas los cruces con datos enriquecidos provenientes de los JSON (ej. origen 1A vs 2B).
