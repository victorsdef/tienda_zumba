# Docker local y Render

Tienes dos caminos separados:

- local: `docker-compose.yml`
- Render: `render.yaml`

No uses `docker-compose` para Render.

## Para local con Docker

1. Crea un archivo `.env` basado en `.env.production.example`
2. Ajusta al menos:
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - `PAYPHONE_TOKEN`
   - `PAYPHONE_STORE_ID`
3. Levanta todo:

```bash
docker compose up --build
```

Queda pensado para que:

- frontend use `http://backend:8080` dentro de Docker
- backend use Postgres del servicio `db`
- Payphone vuelva a `http://localhost:${FRONTEND_PORT}`

Puertos por defecto:

- frontend: `http://localhost`
- backend: `http://localhost:8080`
- postgres: interno al compose

Si quieres cambiar el backend del frontend local, usa:

- `FRONTEND_BACKEND_URL=http://backend:8080`

## Lo que ya está preparado

- `render.yaml` crea:
  - `sofia-couture-frontend`
  - `sofia-couture-backend`
  - `sofia-couture-db`
- El backend tiene health check en `/api/health`
- El frontend se conecta al backend usando la URL pública de Render
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

Si ya habías creado los servicios antes con otra configuración:

- entra al frontend en Render
- revisa la variable `BACKEND_URL`
- debe apuntar a la URL pública real del backend
- si sigue teniendo algo como `sofia-couture-backend`, actualízala o vuelve a sincronizar el Blueprint

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

## Resumen rápido

- desarrollo local con contenedores: `docker-compose.yml`
- despliegue en Render: `render.yaml`
