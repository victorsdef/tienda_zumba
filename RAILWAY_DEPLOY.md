# Despliegue en Railway — Sofia Couture EC

Guía paso a paso para desplegar el proyecto en [Railway](https://railway.app).

Railway detecta los `Dockerfile` automáticamente. No hace falta configurar builder, solo variables y conectar el repo.

---

## 1. Crear el proyecto

1. Entra a [railway.app](https://railway.app), inicia sesión con GitHub.
2. **New Project** → **Deploy from GitHub repo** → elige `tu-usuario/tienda`.
3. Al crearlo Railway detectará un solo servicio (el frontend o backend según el `rootDir`). Vamos a agregar los 3 servicios manualmente.

## 2. Crear la base de datos PostgreSQL

1. En el proyecto → **+ New** → **Database** → **PostgreSQL**.
2. Railway crea la BD y expone las variables:
   - `DATABASE_URL` = `postgresql://user:pass@host:port/db`
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
3. Espera 30s a que arranque. En la pestaña **Data** puedes ver las tablas (aún vacía).

## 3. Servicio Backend (Spring Boot)

1. **+ New** → **GitHub Repo** → elige tu repo otra vez.
2. En **Settings**:
   - **Root Directory**: `back/backend`
   - **Watch Paths**: `back/backend/**`
   - **Custom Start Command**: (dejar vacío, usa el Dockerfile)
3. En **Variables** agrega:

```bash
SPRING_PROFILES_ACTIVE=prod

# JWT — genera tu propio valor de 64+ chars
JWT_SECRET=REEMPLAZA_CON_UNA_CADENA_LARGA_ALEATORIA_MINIMO_64_CARACTERES_ABCDEF
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Base de datos — Railway la inyecta como referencia (mira paso 3.1)
DB_URL=jdbc:${{Postgres.DATABASE_URL_JDBC}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Cloudinary — para imágenes y backups
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email Gmail (para verificaciones y reseteos de contraseña)
SPRING_MAIL_USERNAME=tu_correo@gmail.com
SPRING_MAIL_PASSWORD=tu_password_app_gmail
APP_MAIL_FROM=Sofia Couture EC <tu_correo@gmail.com>
ADMIN_EMAIL=admin@sofia-couture.com

# Payphone (producción o prueba)
PAYPHONE_TOKEN=tu_token
PAYPHONE_STORE_ID=tu_store_id

# URLs — reemplaza con los dominios de Railway después del primer deploy
APP_BASE_URL=https://tu-backend.up.railway.app
APP_FRONTEND_URL=https://tu-frontend.up.railway.app
PAYPHONE_RESPONSE_BASE_URL=https://tu-frontend.up.railway.app
APP_CORS_ALLOWED_ORIGINS=https://tu-frontend.up.railway.app

# Upload local (Railway tiene sistema de archivos efímero, mejor usar Cloudinary)
APP_UPLOAD_DIR=/tmp/uploads
```

### 3.1 Sobre `DB_URL`

Railway no incluye el prefijo `jdbc:` en `DATABASE_URL`. Spring Boot lo requiere. Hay 2 formas:

**Opción A (recomendada):** usa las variables individuales:
```bash
DB_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
```

**Opción B:** deja que `application-prod.properties` use los defaults `PGHOST/PGPORT/PGUSER/...` (ya está configurado como fallback).

4. En **Settings → Networking → Generate Domain** para exponer el backend públicamente.
5. Copia la URL generada (ej: `https://sofia-couture-backend-production.up.railway.app`) y actualiza `APP_BASE_URL` y `APP_CORS_ALLOWED_ORIGINS`.

## 4. Servicio Frontend (Vite + Nginx)

1. **+ New** → **GitHub Repo** → elige tu repo.
2. En **Settings**:
   - **Root Directory**: `front/frontend`
   - **Watch Paths**: `front/frontend/**`
3. En **Variables**:

```bash
# API pública que usa el frontend en el navegador
VITE_API_URL=https://tu-backend.up.railway.app/api/nueva-arquitectura

# Payphone (mismo valor que el backend)
VITE_PAYPHONE_TOKEN=tu_token
VITE_PAYPHONE_STORE_ID=tu_store_id

# Nginx: proxy interno al backend (uso alternativo con /api del mismo dominio)
BACKEND_URL=https://tu-backend.up.railway.app
BACKEND_HOST=tu-backend.up.railway.app
```

4. **Settings → Networking → Generate Domain**.
5. Copia la URL y actualiza el `APP_FRONTEND_URL` del backend.

> ⚠️ **Importante**: los cambios en variables del backend requieren **Redeploy** manual (Deployments → ⋯ → Redeploy).

## 5. Primer deploy — verificar

1. En cada servicio, pestaña **Deployments** → espera que ambos muestren **Success**.
2. Abre la URL del frontend en el navegador.
3. Deberías ver la home. Prueba iniciar sesión con:
   - Email: `gsofiiazaru@gmail.com`
   - Password: `24..SofiaZaruma`
4. Si el login falla con 401, revisa los logs del backend (**Deployments → View Logs**).

## 6. Configuración post-deploy

Desde el panel admin de la tienda:

- **Configuración → Contacto WhatsApp**: pon tu número real
- **Configuración → Redes sociales**: pega URLs de Instagram/TikTok/Facebook/Pinterest
- **Categorías**: activa las que necesites
- **Cupones/Descuentos**: configura promos
- **Editor Home**: personaliza los bloques

## 7. Base de datos: acceso directo

Para conectarte con DBeaver / TablePlus / pgAdmin:
1. En el servicio **Postgres** → **Data** → **Connect** → copia el string de conexión pública.
2. Ojo: los backups automáticos ya guardan snapshots diarios en Cloudinary desde el propio backend.

## 8. Costos aproximados (Nov 2026)

- Railway plan **Hobby**: $5/mes usage-based
- Con este stack (2 servicios + Postgres):
  - ~$5-10/mes si la tienda tiene tráfico bajo/moderado
  - Postgres 500 MB gratis en Hobby
  - Trafico y build minutes según uso

## 9. Diferencias con Render

| | Render | Railway |
|---|---|---|
| BD URL | `DB_URL` con `jdbc:` prefix | `DATABASE_URL` sin prefix |
| Puerto backend | `$PORT` inyectado | `$PORT` inyectado |
| Puerto frontend nginx | 80 fijo | `$PORT` dinámico ✅ (ya soportado) |
| SSL | Automático | Automático |
| Cold start free | Sí, ~30s | No en Hobby |
| Backup PG automático | Solo en pago | Solo en pago |
| Precio | $7/mes por servicio pago | $5/mes usage-based total |

## Troubleshooting

**Backend arranca pero da 401 en todo**: probablemente el `DB_URL` no tiene `jdbc:` al inicio o las credenciales son de otra BD. Revisa los logs.

**Frontend muestra 502 en las peticiones a /api**: la variable `BACKEND_URL` en el frontend está mal o el backend está caído. Verifica que ambos servicios estén "Active".

**pg_dump not found en los backups**: reconstruye la imagen del backend (`Redeploy`). El Dockerfile ya instala `postgresql16-client`.

**CORS bloquea el frontend**: agrega la URL del frontend a `APP_CORS_ALLOWED_ORIGINS` en el backend y redeploya.
