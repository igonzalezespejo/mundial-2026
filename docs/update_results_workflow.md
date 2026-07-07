# Update Results Workflow

Actualmente, el sistema está en una fase estática offline. La automatización con APIs de terceros para el scraping/actualización automática se desarrollará en una fase posterior. Por ahora, **el mantenimiento de resultados es manual**.

## Flujo de Trabajo

### 1. Actualización de Datos (Fuente Original)
Cuando ocurra un nuevo resultado en la vida real, deberás registrarlo. 
Tienes dos opciones:
- Abre el Excel matriz (`data_raw/PORRAS_Combinadas - copia.xlsx`) e ingresa los goles reales en las casillas correspondientes de Resultados.
- O bien, edita los archivos `data/results.json` o `data/actual_knockout_bracket.json` manualmente para volcar temporalmente datos de partido sin tocar el Excel (menos recomendado por pérdida de sincronización futura).

### 2. Extracción y Validación (Terminal Local)
Para calcular los nuevos puntos del ranking y emparejar la clasificación actual, ejecuta tu comando maestro de validación completa:

```bash
npm run check:all
```
Este script se encargará de forma totalmente automatizada de:
1. Extraer los datos (`extract`).
2. Validar Grupos y Eliminatorias (`validate` y `validate:knockout`).
3. Comprobar PII de privacidad (`privacy`).
4. Realizar la validación de estructura frontal (`check:frontend`).
5. Auditar con tests Vitest el motor matemático (`test`).

### 3. Prueba Visual
Asegúrate de que tus modificaciones recientes del Excel o JSON no rompen la UI:

```bash
npm run serve
```
Ve a `http://localhost:4173/` y verifica si el ranking y las tarjetas de partido muestran las actualizaciones sin errores.

### 4. Push a GitHub Pages
Una vez que en local la clasificación luzca como deseas, es hora de publicar:

1. Agrega los cambios de los datos calculados (y evita el Excel crudo):
```bash
git add data/*.json
```
2. Realiza el commit:
```bash
git commit -m "Actualización de resultados a fecha de hoy"
```
3. Empuja a GitHub:
```bash
git push origin main
```

**¡Listo!** GitHub Pages detectará la subida y desplegará la web estática con los resultados al día en cuestión de 1 a 2 minutos.
