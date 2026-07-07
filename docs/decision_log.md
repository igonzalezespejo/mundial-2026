# Decision Log

Este documento registra las decisiones de producto y arquitectura ya cerradas para el proyecto "Porra Mundial 2026".

## Producto y Privacidad
- **Web pública**: La web final será accesible públicamente mediante un enlace, desplegada en GitHub Pages.
- **Sin login**: No se implementará autenticación de usuarios.
- **Transparencia**: Todos los visitantes podrán ver las apuestas de todos los participantes.
- **Vistas**: Debe existir un ranking global y una vista de ficha individual por participante.
- **Identidad**: Los IDs y nombres de los participantes deben conservarse según constan en el Excel original para asegurar la trazabilidad. No obstante, si se detectan datos personales sensibles (ej. emails), estos se reportarán **redactados** (`<redacted>`) en los informes y bloquearán la publicación hasta su corrección manual o decisión expresa, garantizando un escaneo seguro preventivo.
- **Anonimización**: No se aplicará anonimización de forma automática a los nombres sin instrucción expresa del usuario.

## Arquitectura y Datos
- **Fuente inicial**: El archivo Excel original (`PORRAS_Combinadas - copia.xlsx`) es la fuente exclusiva de datos de inicio y se usa para la extracción y validación.
- **Base de Datos Limpia**: La web final consumirá JSON estáticos generados a partir de la extracción, no leerá el Excel en el frontend. La carpeta `data/` con sus JSON **será pública y versionada** en el repositorio.
- **Validación Fórmulas**: Las macros y fórmulas de puntuación del Excel no se asumen correctas. Se auditan y comparan contra un motor de reglas puras en JavaScript.
- **Hoja Resultados**: La hoja de resultados actual del Excel puede cambiar o sustituirse por una estructura JSON en un futuro.
- **Timestamps**: Las fechas conservan su valor crudo original (`excelRawDate`) en los JSON y se les asigna un valor en formato ISO 8601 (`date`, `kickoffDateTime`) para facilitar su manipulación de forma estructurada.
