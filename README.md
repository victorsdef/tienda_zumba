# Sofia Couture EC — Documentación del proyecto

Tienda de ropa en línea con panel de administración, pagos con Payphone, imágenes en Cloudinary y despliegue en Render.

---

## Cuentas y servicios externos

> Todas las cuentas están registradas con el correo **sofia1278zamura@gmail.com** (Google).

| Servicio | URL | Cuenta | Qué hace |
|---|---|---|---|
| **Render** | https://render.com | sofia1278zamura@gmail.com | Hospeda el backend (Java) y la base de datos PostgreSQL |
| **Cloudinary** | https://cloudinary.com | sofia1278zamura@gmail.com | Almacena todas las imágenes de productos y banners |
| **Payphone** | https://payphone.com | sofia1278zamura@gmail.com | Pasarela de pago con tarjeta para Ecuador |
| **Gmail SMTP** | smtp.gmail.com | sofia1278zamura@gmail.com | Envío de correos (verificación de email, confirmación de pedidos) |

---

## Arquitectura general

```
┌─────────────────────┐        ┌───────────────────────┐
│  Frontend (React)   │◄──────►│  Backend (Spring Boot)│
│  Vercel / Render    │  REST  │  Render (Java 17)     │
│  Puerto: 5173       │        │  Puerto: 8080         │
└─────────────────────┘        └──────────┬────────────┘
                                          │
                      ┌───────────────────┼───────────────┐
                      │                   │               │
             ┌────────▼──────┐   ┌────────▼──────┐  ┌─────▼──────────┐
             │  PostgreSQL   │   │  Cloudinary   │  │   Payphone     │
             │  (Render DB)  │   │  (imágenes)   │  │   (pagos)      │
             └───────────────┘   └───────────────┘  └────────────────┘
```

---

## Variables de entorno

### Backend (configurar en Render → Environment)

| Variable | Descripción |
|---|---|
| `DB_URL` | URL de conexión PostgreSQL (la da Render automáticamente) |
| `DB_USERNAME` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña de la base de datos |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `APP_BASE_URL` | URL pública del backend en Render (ej: `https://sofia-couture-backend.onrender.com`) |
| `APP_FRONTEND_URL` | URL del frontend (para CORS y redirecciones) |
| `APP_CORS_ALLOWED_ORIGINS` | Orígenes permitidos separados por coma |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `SPRING_MAIL_USERNAME` | Email desde el que se envían correos |
| `SPRING_MAIL_PASSWORD` | Contraseña de aplicación de Gmail |
| `PAYPHONE_TOKEN` | Bearer token de la API de Payphone |
| `PAYPHONE_STORE_ID` | ID de la tienda en Payphone |
| `PAYPHONE_RESPONSE_BASE_URL` | URL del frontend a donde Payphone redirige tras el pago |

### Cómo obtener las credenciales de Cloudinary

1. Iniciar sesión en https://cloudinary.com con la cuenta de Google
2. En el Dashboard aparecen directamente: **Cloud name**, **API Key** y **API Secret**
3. Las imágenes se suben automáticamente a la carpeta `sofia-couture` en el cloud

---

## Tecnologías

### Backend
- **Java 17** + **Spring Boot 3.2**
- Arquitectura hexagonal (domain → ports → usecases → adapters)
- **PostgreSQL** como base de datos
- **JWT** para autenticación (access token + refresh token)
- **MapStruct** para mapeo de objetos
- **Cloudinary SDK** para almacenamiento de imágenes

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** para estilos
- **TanStack Query** para fetch y caché de datos
- **React Hook Form** para formularios
- **React Router v6** para navegación

---

## Roles y permisos

El sistema tiene 4 roles. Se asignan desde el panel de admin → Usuarios.

### ADMIN
Acceso total al panel de administración.
- Ver y gestionar todos los pedidos
- Crear, editar y eliminar productos
- Gestionar categorías
- Gestionar banners y el bloque editorial del home
- Ver y modificar usuarios y sus roles
- Configurar comisiones, costos de envío y datos de la tienda
- Exportar reportes en PDF
- Subir imágenes

### VENDEDOR
Acceso parcial orientado a ventas.
- Ver y gestionar pedidos (cambiar estado, marcar como enviado)
- Ver productos (sin crear ni eliminar)
- Subir imágenes
- Ver reportes de ventas
- Gestionar banners (crear y editar)

### BODEGUERO
Acceso orientado a inventario.
- Ver y gestionar el stock de productos
- Ver pedidos
- Subir imágenes

### CLIENTE
Usuario registrado en la tienda (no tiene acceso al panel admin).
- Navegar el catálogo
- Agregar al carrito y hacer pedidos
- Pagar con tarjeta (Payphone)
- Ver sus propios pedidos
- Gestionar sus direcciones de envío

---

## Módulos del panel de administración

| Módulo | Ruta | Roles con acceso |
|---|---|---|
| Dashboard | `/admin` | ADMIN |
| Reportes | `/admin/reportes` | ADMIN |
| Productos | `/admin/productos` | ADMIN, BODEGUERO |
| Categorías | `/admin/categorias` | ADMIN |
| Banners | `/admin/banners` | ADMIN, VENDEDOR |
| Editor Home | `/admin/home-editor` | ADMIN, VENDEDOR |
| Órdenes | `/admin/ordenes` | ADMIN, VENDEDOR, BODEGUERO |
| Usuarios | `/admin/usuarios` | ADMIN |
| Configuración | `/admin/configuracion` | ADMIN |

---

## Flujo de compra

```
Cliente agrega producto al carrito
        ↓
Checkout → elige dirección de envío o retiro en tienda
        ↓
Elige método de entrega (envío a domicilio / retiro Cuenca / envío nacional)
        ↓
Payphone genera botón de pago → cliente paga con tarjeta
        ↓
Payphone redirige al frontend con confirmación
        ↓
El pedido queda en estado PAGADO
        ↓
Admin/Vendedor cambia estado: EN_PREPARACION → ENVIADO → ENTREGADO
        ↓
Cliente recibe email en cada cambio de estado
```

### Estados de un pedido

| Estado | Color en el panel | Significado |
|---|---|---|
| PENDIENTE | Amarillo | Pedido creado, sin pago confirmado |
| PAGADO | Azul | Pago confirmado por Payphone |
| EN_PREPARACION | Naranja | En proceso en bodega |
| ENVIADO | Índigo | Entregado al courier |
| ENTREGADO | Verde | Recibido por el cliente |
| CANCELADO | Rojo | Cancelado por admin o cliente |

---

## Flujo de imágenes

```
Admin sube imagen desde el panel
        ↓
Backend recibe el archivo (MultipartFile)
        ↓
CloudinaryStorageAdapter sube la imagen a Cloudinary
        ↓
Cloudinary devuelve una URL pública (CDN)
        ↓
Esa URL se guarda en la base de datos
        ↓
El frontend carga la imagen directamente desde Cloudinary (rápido, sin pasar por el backend)
```

Las imágenes se almacenan en la carpeta `sofia-couture` dentro del cloud de Cloudinary.

---

## Configuración editable sin código

Desde **Admin → Configuración** se pueden modificar estos valores en tiempo real:

| Clave | Descripción |
|---|---|
| `comision_payphone` | Porcentaje que cobra Payphone por transacción |
| `costo_envio` | Costo de envío a domicilio (USD) |
| `costo_envio_cuenca` | Costo de envío dentro de Cuenca (USD) |
| `retiro_direccion` | Dirección del punto de retiro |
| `retiro_horario` | Horario de atención para retiro |
| `retiro_whatsapp` | Número de WhatsApp de contacto |

Desde **Admin → Editor Home** se pueden modificar:

| Clave | Descripción |
|---|---|
| `home_editorial_titulo` | Título del bloque central del home |
| `home_editorial_subtitulo` | Párrafo descriptivo del home |
| `home_editorial_boton` | Texto del botón principal del home |
| `home_editorial_link` | Destino del botón (catálogo, género, categoría, producto o URL libre) |

---

## Usuario administrador por defecto

Al iniciar el backend por primera vez en modo `dev`, se crea automáticamente:

| Campo | Valor |
|---|---|
| Email | `gsofiiazaru@gmail.com` |
| Contraseña | `24..SofiaZaruma` |
| Rol | ADMIN |

---

## Estructura del repositorio

```
tienda/
├── back/
│   └── backend/                    # Spring Boot (Java 17)
│       ├── src/main/java/
│       │   └── com/tiendaropa/backend/
│       │       ├── domain/         # Modelos y enums del dominio
│       │       ├── application/    # Puertos (interfaces) y casos de uso
│       │       └── infrastructure/ # Adaptadores REST, JPA, email, storage
│       └── src/main/resources/
│           ├── application.properties       # Config general
│           └── application-dev.properties   # Config local (base de datos dev)
└── front/
    └── frontend/                   # React + TypeScript + Vite
        └── src/
            ├── api/                # Llamadas al backend
            ├── pages/              # Páginas (Home, Catálogo, Admin, etc.)
            ├── components/         # Componentes reutilizables
            └── store/              # Estado global (Zustand)
```

---

## Cómo correr el proyecto en local

### Backend
```bash
cd back/backend
./mvnw spring-boot:run
```
Requiere PostgreSQL corriendo en `localhost:5432` con la base de datos `sofiacouture`.

### Frontend
```bash
cd front/frontend
npm install
npm run dev
```
El frontend corre en `http://localhost:5173` y apunta al backend en `http://localhost:8080`.
