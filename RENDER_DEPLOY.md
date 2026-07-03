# Deploy temporal en Render

Usa `render.yaml`. No uses `docker-compose` para Render.

## Lo que ya está preparado

- `render.yaml` crea:
  - `sofia-couture-frontend`
  - `sofia-couture-backend`
  - `sofia-couture-db`
- El backend tiene health check en `/api/health`
- El frontend se conecta al backend por red privada de Render
- En plan gratis, los archivos subidos se guardan de forma temporal

## Planes actuales en el blueprint

El archivo está configurado para pruebas:

- frontend: `free`
- backend: `free`
- postgres: `free`

Esto sirve para validar la app en internet mientras sigues desarrollando.

En este modo:

- `APP_UPLOAD_DIR` apunta a `/tmp/uploads`
- los uploads no son persistentes entre reinicios o nuevos deploys

## Cómo subirlo

1. Sube este repo a GitHub.
2. En Render, elige `New +`.
3. Selecciona `Blueprint`.
4. Conecta tu repo.
5. Render detectará `render.yaml`.
6. Revisa el plan y crea los servicios.

## Variables que debes completar en Render

Estas quedan pendientes a propósito y las llenas en el panel de Render:

- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`
- `PAYPHONE_TOKEN`
- `PAYPHONE_STORE_ID`
- `ADMIN_EMAIL`

## URLs esperadas

- Frontend: URL pública de Render del servicio `sofia-couture-frontend`
- Backend: URL pública de Render del servicio `sofia-couture-backend`

El blueprint ya intenta conectar:

- `APP_FRONTEND_URL` -> frontend
- `PAYPHONE_RESPONSE_BASE_URL` -> frontend
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` -> base Postgres de Render

## Para pruebas mientras desarrollas

Esto es suficiente para probar en internet sin cerrar todavía toda la etapa de desarrollo.

Te conviene:

- usar datos reales solo si es necesario
- probar Payphone con cuidado
- revisar que la URL pública del frontend sea la que debe volver desde Payphone

## Limitaciones del modo gratis

- los servicios web pueden dormirse por inactividad
- el primer request puede tardar mientras despiertan
- la base de datos gratis no es para uso serio o estable a largo plazo
- los archivos subidos pueden perderse porque no hay disco persistente en `free`
- cuando quieras algo más firme, cambia los planes del `render.yaml`

## Para local

Si quieres levantarlo en tu máquina con contenedores:

- usa `docker-compose.yml`
- llena antes un `.env` basado en `.env.production.example`
