# AGD Backend — Marketplace + AGD

Backend NestJS del ecosistema Marketplace + AGD (comercio exterior). Ver el plan completo por fases en [plans_phases/PLAN_FASES.md](plans_phases/PLAN_FASES.md).

Arquitectura: backend standalone (sin integración en vivo con Odoo), persistencia con **TypeORM + MySQL**.

## Fase 0 — Fundamentos técnicos

Lo que ya existe en esta fase:

- `ConfigModule` global con validación de variables de entorno (`src/config/env.validation.ts`, esquema Joi).
- `DatabaseModule` con TypeORM contra MySQL (`src/database/database.module.ts`), sin `synchronize` — el esquema se gestiona por migraciones.
- `DataSource` de TypeORM para la CLI de migraciones (`src/database/data-source.ts`).
- Infraestructura común (`src/common/`): entidad base (`id`, `created_at`, `updated_at`, `deleted_at`), filtro global de excepciones, interceptor de logging HTTP, DTOs de paginación estándar.
- `main.ts`: prefijo global `/api`, `ValidationPipe` global, CORS, Swagger en `/docs`.
- Módulo de ejemplo `health` (`src/modules/health/`) que recorre el pipeline completo — entidad → repositorio → servicio → controlador → test e2e — y sirve de plantilla para los módulos de negocio de las fases siguientes.

## Fase 1 — Identidad, usuarios y seguridad

- **`identity`** (`src/modules/identity/`): entidades núcleo — `Partner` (res_partner), `User` (res_users), `Group` (res_groups, los 5 perfiles autoservicio + `admin`), `UserGroup`, `ModelAccess` (ir_model_access) y `AccessRule` (ir_rule, alcance `own`/`company`/`all`), `ConfigParameter`, `Attachment`, `Message` (auditoría). `AccessControlService` es el motor de autorización real: `hasPermission()` y `getScope()` consultan estas tablas.
- **`auth`** (`src/modules/auth/`): login/refresh/logout con rotación de refresh tokens (`AuthSession`, tokens opacos, no JWT), recuperación/cambio de contraseña, bloqueo por intentos fallidos, gestión de sesiones activas. Guards globales: `JwtAuthGuard` (respeta `@Public()` y bloquea rutas si `must_change_password=true`, salvo `@AllowPasswordChangeRequired()`), `RolesGuard` (`@Roles(...)`), `PermissionsGuard` (`@RequirePermission(model, action)`, la aplicación real de `ir_model_access`).
- **`users`** (`src/modules/users/`): `GET /users/me`, historial de accesos, y centro de seguridad admin (`block`/`unblock`, listado).
- **`enablement`** (`src/modules/enablement/`): máquina de estados de los 9 pasos de habilitación (`agd_user_enablement_request/step`, `agd_policy_acceptance`, `agd_user_training_acceptance`). Pasos 2-5 los aprueba/rechaza un admin (`PATCH /enablement/requests/:id/steps/:stepCode`); el paso 6 (creación de cuenta) se dispara automáticamente al aprobar el paso 5; el paso 7 (cambio de contraseña) se sincroniza solo al consultar la solicitud una vez que el usuario cambia su contraseña; el paso 8 lo confirma el propio usuario (`POST /enablement/requests/training/accept`) y dispara la activación automática (paso 9).

**Bootstrap del primer admin** — el registro público rechaza el perfil `admin` a propósito, así que no hay forma de crearlo vía API:

```bash
ADMIN_EMAIL=admin@agd.local ADMIN_RIF=V-00000000-0 ADMIN_PASSWORD='ClaveSegura123' npm run seed:admin
```

**Nota de alcance**: sin proveedor de correo/SMS real (backend standalone), la contraseña temporal generada al crear una cuenta (paso 6) se entrega en las notas del propio paso, visibles vía el seguimiento de la solicitud (`GET /enablement/requests/:id?rif=...`) o la vista admin. Una integración de notificaciones reemplazaría esto en una fase futura.

## Requisitos

- Node.js 20+
- MySQL 8 (local o vía Docker)

## Configuración

```bash
npm install
cp .env.example .env   # ajustar credenciales si es necesario
```

Variables de entorno (`.env`): ver `.env.example`. `DB_SYNCHRONIZE` debe permanecer en `false` — el esquema se aplica solo con migraciones.

## Base de datos local

Con Docker (recomendado):

```bash
docker compose up -d mysql
```

Esto levanta MySQL 8.4 en `localhost:3306` con las credenciales de `.env.example` (`agd` / `agd`, base `agd_backend`). Si usas un MySQL instalado localmente en su lugar, crea el usuario/base y ajusta `.env` acorde.

Aplicar migraciones:

```bash
npm run migration:run
```

## Levantar el proyecto

```bash
# desarrollo (watch)
npm run start:dev

# producción
npm run build
npm run start:prod
```

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`
- Health check: `GET /api/health`, historial: `GET /api/health/history`

## Migraciones

```bash
npm run migration:generate -- src/database/migrations/NombreMigracion   # genera diff contra entidades (requiere DB conectada)
npm run migration:create -- src/database/migrations/NombreMigracion    # migración vacía
npm run migration:run
npm run migration:revert
```

## Tests

```bash
npm run test        # unitarios (no requieren DB)
npm run test:e2e     # e2e (requieren MySQL disponible según .env, con migraciones aplicadas)
npm run test:cov
```

## Convenciones de módulos de negocio

Cada dominio (fase del plan) vive en `src/modules/<dominio>/` con la misma forma que `health`:

```
modules/<dominio>/
  entities/*.entity.ts   # @Entity('nombre_tabla_snake_case'), extiende BaseEntity
  dto/*.dto.ts
  <dominio>.service.ts
  <dominio>.controller.ts
  <dominio>.module.ts
```

Los nombres de tabla siguen la nomenclatura del modelo de datos documentado en `plans_phases/RESUME_1.MD` (tablas `agd_*` propias, o nombres estilo Odoo para las entidades equivalentes).
