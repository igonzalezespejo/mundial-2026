# Checklist de Publicación a GitHub Pages

Sigue este proceso antes de hacer `git push` de tu proyecto a GitHub Pages.

## 1. Antes de publicar

1. Actualiza tus datos de Excel si es necesario.
2. Abre la terminal en la raíz del proyecto.
3. Ejecuta los siguientes comandos:

```bash
npm install
npm run check:all
```
*(Nota: `check:all` equivale a correr de forma secuencial `extract`, `validate`, `validate:knockout`, `privacy`, `check:frontend` y `test`)*

> [!WARNING]
> Si `npm run privacy` falla mostrando estado "BLOCKED", es normal si tu archivo de Excel original aún contiene información personal (emails/teléfonos). **El pipeline reportará el error pero continuará**, ya que GitHub Pages solo usa los JSON limpios de la carpeta `data/`. No te preocupes por este bloqueo siempre que no subas el Excel.

4. Levanta el servidor de pruebas local:
```bash
npm run serve
```

## 2. Revisión local

Abre en tu navegador `http://localhost:4173/` y verifica visualmente:
- [ ] El **Ranking** carga correctamente.
- [ ] El **Buscador** funciona y filtra los participantes.
- [ ] La **Ficha individual** se abre al hacer clic en un participante.
- [ ] En la ficha, los **Puntos por ronda** (Grupos, 16avos, etc.) aparecen separados.
- [ ] En Eliminatorias, el **Campeón** se muestra como texto (ej. "España") y no como un número raro (si es un número la alerta saltará en el frontend checker antes).
- [ ] Los partidos de eliminatorias (ej. R32) muestran correctamente su origen: `M73 · R32-01 · 2A vs 2B`.
- [ ] No hay errores rojos en la consola de tu navegador (F12).

## 3. Archivos a subir (Permitidos)
Asegúrate de que tus *commits* **SÍ** incluyen estos archivos y carpetas:
- `index.html`
- `styles/`
- `src/`
- `data/*.json`
- `docs/`
- `scripts/`
- `package.json`
- `package-lock.json`
- `README.md`
- `.gitignore`

## 4. Archivos a NO subir (Bloqueados)
Estos archivos están ignorados en el `.gitignore`. **NUNCA** debes forzar su subida:
- `data_raw/`
- `*.xlsx` (Cualquier archivo Excel)
- `node_modules/`
- `.env`
