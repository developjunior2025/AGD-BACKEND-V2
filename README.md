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

## Fase 2 — Gobernanza, documentos maestros, configuración y expediente

- **`config`** (`src/modules/config/`, clase `AgdConfigModule` para no chocar con `@nestjs/config`): catálogos de referencia — `Currency`/`CurrencyRate`, `Tax`, `MailTemplate`, `TariffRule`, `SlaRule`, `DeadlineRule`, `ExternalIntegrationReference` — y `SequenceService` (`ir_sequence`), generador atómico de códigos correlativos (`SELECT ... FOR UPDATE` en transacción) usado para el código de expediente.
- **`documents`** (`src/modules/documents/`): `Document`/`Folder`/`Tag` (documents_document/folder/tag), `DocumentStatus` (revisión aprobado/rechazado), `DocumentRelation`, `DocumentRequirement` (catálogo de tipos exigibles) y `DocumentChecklist` (instancia de requisitos para un `resModel`/`resId` concreto, p. ej. un expediente). Subida de archivos a disco local (`uploads/documents/`, gitignored) igual que en `enablement`.
- **`governance`** (`src/modules/governance/`): `ModelCatalog`/`ModelField` (catálogo plano, no introspección real), `GovernanceMatrix` + `GovernanceMatrixVersion` (versionado con publicación — solo una versión `published` por matriz, la anterior pasa a `archived`), `DocumentProfileMatrix` (qué requisitos documentales exige cada perfil), `ProcessRaciMatrix`/`RaciAssignment`, `SegregationRule` (pares de perfiles incompatibles, con `assertNoSegregationConflict()` reutilizable), `EscalationMatrix`, `GovernanceWorkflow`/`GovernanceWorkflowInstance` (aprobación pendiente/aprobada/rechazada sobre cualquier `resModel`/`resId`), `Activity` (mail_activity + `agd_governance_approval` vía `activityType='approval'`).
- **`cases`** (`src/modules/cases/`): `Case` (agd_case, hub central), `CaseParty`, `CaseSemaphore`. `CasesService.createCase()` amarra las tres fases anteriores: genera el código vía `SequenceService`, agrega al dueño como `CaseParty`, crea el semáforo en verde, y **siembra el checklist automáticamente** consultando `GovernanceService.getRequirementCodesForGroup()` según el perfil del expediente. `closeCase()` **bloquea el cierre** si queda algún documento obligatorio del checklist sin cumplir — es la demostración end-to-end de que expediente, documentos y gobernanza quedan realmente conectados, no solo con tablas paralelas.

Permisos nuevos: `ModelName.CONFIG`, `GOVERNANCE_MATRIX`, `CASE`, `DOCUMENT` — el grupo `admin` tiene CRUD completo + alcance `all` sobre los cuatro (migración `SeedFase2Config`). Los perfiles operativos (agente de aduanas, operador AGD, etc.) recibirán sus propios permisos de alcance `own`/`company` en las fases que los necesiten.

## Fase 3 — HOME / portal público + catálogo de servicios

- **`home`** (`src/modules/home/`): `Website` (fila única sembrada por migración), `WebsitePage` (+ext — `agd_public_notice`/`agd_faq` se resuelven aquí vía `pageType`), `WebsiteMenu` (+ext enlaces externos), `WebsiteVisitor`/`WebsiteTrack` (tracking anónimo por token de sesión), `LegalPolicy`/`LegalPolicyVersion` (versionado publicado/archivado igual que la matriz de gobernanza), `PortalVersion`, `CrmLead` (registro de interés público). Todo bajo `@Public()` para lectura; creación/publicación requiere `ModelName.HOME_CONTENT`.
- **`catalog`** (`src/modules/catalog/`): el catálogo estilo Odoo — `ProductCategory`, `Uom`/`UomCategory`, `ProductAttribute`/`ProductAttributeValue`, `ProductTemplate` (+ext `agd_service`, el servicio del marketplace), `ProductProduct` (variante), `ProductPricelist`/`ProductPricelistItem`, `Rating` (reseñas polimórficas), `ResourceCalendar`/`ResourceCalendarAttendance` (+ext `agd_service_availability`). Lectura pública, escritura con `ModelName.CATALOG`.
- **`services`** (`src/modules/services/`, controlador montado en el mismo prefijo `catalog/services` que `catalog`): `ServiceRequirement` (reutiliza `DocumentRequirement` de Fase 2), `ServiceSla` (reutiliza `SlaRule` de config), `ServiceCoverage`, `ServiceEvidenceType`, y el par `ServicePublication`/`ServicePublicationVersion` con el mismo patrón de versionado draft→published→archived. **Un servicio no es visible en el catálogo público hasta que tiene una versión de publicación efectivamente publicada** — `GET /catalog/services` y `GET /catalog/services/:id` filtran por `ServicePublicationStatus.PUBLISHED`, no por el `product_template` crudo.

Nota de diseño: `services` depende de `catalog` (necesita `ProductTemplate`), así que el filtrado público por estado de publicación vive en `ServicesController`, no en `CatalogController` — evita una dependencia circular entre módulos. `CatalogController` conserva sus propios endpoints de servicio (creación, variantes, tarifas) sin el filtro de publicación, pensados para gestión administrativa del catálogo.

Permisos nuevos: `ModelName.HOME_CONTENT`, `CRM_LEAD`, `CATALOG`, `SERVICE_PUBLICATION` — `admin` con CRUD completo + alcance `all` (migración `SeedFase3`).

## Fase 4 — Perfil Consultor (solo lectura sobre expedientes)

- **`sidunea`** (`src/modules/sidunea/`): contrato mínimo de espejo SIDUNEA — `SidUneaMirrorRecord` (bitácora genérica de sincronización), `SidUneaDua`, `SidUneaModcarManifest`, `SidUneaModshdExitPass`. Solo lo necesario para que el Consultor tenga algo que consultar; Fase 6 (agente de aduanas) y Fase 8 (TOS) reemplazan las creaciones administrativas de aquí por los flujos reales de declaración/manifiesto.
- **`cases`** se extiende con tres endpoints de solo lectura, todos auditados vía `mail_message`:
  - `GET /cases/lookup?dua=|manifest=|exitPass=` — resuelve **un** expediente a partir de exactamente una referencia SIDUNEA (no es un listado). Declarado antes de `GET /cases/:id` en el controlador para que `:id` no capture el literal `lookup`.
  - `GET /cases/:id/tracking` — expediente + semáforo + bitácora de espejo SIDUNEA.
  - `GET /cases/:id/documents` — documentos del expediente (mismo `DocumentsService.listByContext`, sin exponer el permiso genérico `DOCUMENT`).

Decisión de permisos clave: el Consultor **no** recibe `ModelName.CASE` (por eso `GET /cases` sin filtro le da 403) — recibe únicamente `ModelName.CASE_LOOKUP` de solo lectura, una capacidad separada que solo permite resolver un expediente conociendo su referencia. Esto reproduce a nivel de RBAC la diferencia real entre "puede administrar expedientes" (admin) y "puede consultar un expediente si conoce su referencia" (consultor) — no es solo una etiqueta de rol, son permisos distintos en `ir_model_access`/`ir_rule`.

## Fase 5 — Cotización, contratación y perfil Importador/Exportador

- **`billing`** (`src/modules/billing/`): `AccountMove`/`AccountMoveLine` (factura) y `AccountPayment` (pago asentado manualmente — sin pasarela real). `BillingService.createInvoice()` es de uso interno, invocado por `sales` al confirmar un contrato; el único endpoint propio es `POST /billing/payments` (admin).
- **`support`** (`src/modules/support/`): `HelpdeskTicket` — autoservicio (`POST /support/tickets`, `GET /support/tickets/me`) sin permiso especial, gestión (`GET /support/tickets`, `PATCH :id/status`) gated por `ModelName.HELPDESK`.
- **`sales`** (`src/modules/sales/`, tres controladores en el mismo módulo por los distintos prefijos de URL del plan): `SaleOrder`/`SaleOrderLine` (+ext `agd_quote`/`agd_service_contract` vía `orderType`), `QuoteRequest`/`QuoteRequestLine`, `QuoteComparison`, `ServiceCart`/`ServiceCartItem`.
  - `QuotesController` (`quotes/requests`): solicitud de cotización multi-prestador, un prestador (hoy: admin en su nombre) responde con `POST provider-quotes`, `GET :id/comparison` compara todas las ofertas, `POST :id/select` elige una y **la convierte en contrato** (mismo camino que el checkout de carrito).
  - `CartController` (`cart`): agregar ítems con snapshot de precio y moneda tomado del tarifario vigente en ese momento, y `POST checkout` que **agrupa el carrito por prestador** — un contrato (y un expediente) por cada prestador presente en el carrito, no uno por todo el carrito.
  - `OrdersController` (`orders`): listado propio, y `GET :id/invoices` / `:id/payments`.
  - Toda contratación (selección de cotización o checkout) dispara `SalesService.confirmContract()`: confirma la orden, crea el `agd_case` (perfil Importador/Exportador) vía `CasesService`, y factura vía `BillingService` — el mismo patrón de orquestación entre módulos que `CasesService.createCase()` ya usaba en Fase 2.
- **`cases`** gana `GET /cases/me`, gated por una capacidad nueva y estrecha (`ModelName.CASE_OWN`, no el `CASE` genérico de admin) — mismo patrón de "permiso separado para acceso propio" que `CASE_LOOKUP` en Fase 4.

Bug real encontrado y corregido durante esta fase: `assertOwnsPartner()` (la verificación de titularidad en `sales`) bloqueaba también al admin, que no es dueño de ningún `partnerId` de cliente — se corrigió para que el grupo `admin` la salte. Otro: `CatalogService.getServiceTariff()` no cargaba la relación `pricelist` (no es eager), así que `priceItem.pricelist.currencyId` habría fallado en tiempo de ejecución al agregar al carrito — se corrigió cargando la relación explícitamente.

## Fase 6 — Agente de aduanas + SIDUNEA Mirror

- **`sidunea` se completa**: `SidUneaCustomsRegime` (catálogo de regímenes), `SidUneaDuaItem` (líneas de una DUA espejo), `SidUneaModaiInspection` (inspección), `SidUneaTaxSimulation` (cálculo estimado no vinculante). `SidUneaDua` (Fase 4) gana `customsDeclarationId` para trazar de qué declaración formal se generó el espejo, y `createDua()` ahora acepta ítems para poblar `SidUneaDuaItem` en el mismo POST.
- **`customs`** (`src/modules/customs/`, nuevo): `CustomsLicense` (habilitación profesional, upsert — un administrador la verifica vía `POST /customs/agents/:partnerId/license`), `CustomsDeclaration` (expediente aduanero digital), `CustomsDeclarationItem`, `CustomsRegimeAssignment` (reutiliza el catálogo de `sidunea`), `CustomsTaxLiquidation` (liquidación simulada — al crearla, la declaración pasa automáticamente a `submitted`).
- **Regla de negocio de dos capas** (no solo RBAC): crear una declaración exige (a) una `CustomsLicense` con `status=active` para ese agente, y (b) que el agente sea `CaseParty` con `role=agent` del expediente — ambas verificadas en `CustomsService`, no en el guard. El permiso `ModelName.CUSTOMS_DECLARATION` solo habilita la *capacidad*; la *pertenencia al caso concreto* es una regla de servicio, igual que `assertOwnsPartner` en `sales` o el chequeo de `CaseParty` que ya usa `CasesService`.
- Permisos nuevos: `ModelName.CUSTOMS_LICENSE`, `CUSTOMS_DECLARATION`. El grupo `agente_aduanas` también recibe por primera vez `CATALOG` y `SERVICE_PUBLICATION` de escritura (antes solo `admin` podía publicar servicios) — necesario para el "publica servicios" del entregable de esta fase.

## Fase 7 — Depósito aduanero / WMS

- **`warehouse`** (`src/modules/warehouse/`, sin controlador — infraestructura interna, mismo patrón que `billing`): réplica fiel del núcleo de inventario estilo Odoo. `StockWarehouse`, `StockLocation` (+ext `agd_wms_location_zone`/`slot` vía `zoneCode`/`slotCode`, ya que esas tablas AGD se descartaron por redundantes), `StockPickingType`, `StockPicking` (+ext `agd_wms_receipt_notice`, `agd_wms_receipt`, `agd_wms_inbound_order`, `agd_transport_delivery`), `StockMove`/`StockMoveLine` (+ext `agd_wms_receipt_line`), `StockLot` (+ext `agd_wms_inventory_unit`), `StockQuant` (+ext `agd_wms_inventory_unit`, `agd_wms_inventory_balance` — `caseId` es la extensión propia: de qué expediente es la mercancía), `StockQuantPackage`, `StockPackageType`. Se descartaron por alcance `stock_location_route`, `stock_rule`, `stock_scrap`: referenciales de Odoo sin desarrollo propio, no consumidos por ningún endpoint de esta fase.
- **Movimiento de doble entrada**: `WarehouseService.executeMove()` decrementa `StockQuant` en la ubicación origen e incrementa en la destino — igual que `stock_move`/`stock_quant` en Odoo. Las ubicaciones "externas" `EXT-PROV` (proveedor) y `EXT-CLI` (cliente) actúan de contraparte de balance: pueden quedar en negativo porque representan el cruce del límite del inventario controlado, no una ubicación física real.
- **`wms`** (`src/modules/wms/`, con controlador — endpoints operativos): `ReceiptDiscrepancy`, `CustodyRecord`, `StoragePeriod` (plazo legal de depósito, con `legalDeadline` calculado desde `DeadlineRule` código `wms_storage_period`, 30 días por defecto si no hay regla configurada), `WeighingTicket`, `ConsolidationOrder`/`DeconsolidationOrder` (comparten el enum `ConsolidationOrderStatus`), `CargoHandlingTask`, `DiscrepancyMatrix`/`DiscrepancyItem` (conciliación SIDUNEA–AGD).
- **Recepción contra manifiesto y BL**: `WmsService.createReceipt()` exige primero `SidUneaService.assertManifestBelongsToCase()` (nuevo método en `sidunea`) — no se puede recibir mercancía contra un manifiesto que no está registrado para ese expediente. Tras la recepción, abre automáticamente (si no existían) el `CustodyRecord` activo y el `StoragePeriod` del expediente.
- Permiso nuevo: `ModelName.WMS` (`agd_wms_operation`), único modelo para todo el controlador `wms` — no se distinguieron capacidades más finas porque todas las operaciones (recepción, picking, pesaje, consolidación, discrepancias) son responsabilidad del mismo perfil operativo (`operador_agd`), sin necesidad de ownership por registro individual.
- Migración de seed: secuencia `stock_picking` (prefijo `PICK-`), un `StockWarehouse` por defecto (`AGD`), las ubicaciones `EXT-PROV`/`EXT-CLI`/`ZONA-A` y los tres `StockPickingType` (incoming/outgoing/internal).

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
