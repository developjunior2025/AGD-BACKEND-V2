# Plan por fases — Backend Marketplace + AGD (NestJS)

> Basado en el análisis completo de `plans_phases/` (infografías del mapa del sitio + `RESUME_1.MD`).
> Decisiones de arquitectura confirmadas con el usuario (2026-07-09):
> - **Backend standalone**: no hay integración en vivo con una instancia Odoo real. Este NestJS modela en su propia base de datos tanto las entidades "nativas de Odoo" (adaptadas a nuestro esquema) como las 78 tablas propias de AGD.
> - **Stack de persistencia**: TypeORM + MySQL.

## Resumen del alcance

- **142 tablas físicas**: 64 inspiradas en modelos nativos de Odoo (22 con campos propios vía herencia/extensión) + 78 tablas propias de AGD en 12 dominios funcionales.
- **6 perfiles de usuario**: Visitante, Consultor/tercero autorizado, Importador/Exportador, Agente de aduanas, Operador del AGD (WMS), Agente/operador TOS (transporte).
- **Módulos globales transversales**: catálogo de servicios, gobernanza, documentos maestros, matriz de gobernanza, reportes, configuración.
- **Proceso transversal**: habilitación de usuarios (9 pasos), matriz de acceso por perfil, footer institucional.

La estrategia de fases sigue el orden de dependencia real del dominio: primero la identidad y el control de acceso (todo lo demás depende de "quién es el usuario y qué puede ver"), luego los módulos globales que reutilizan todos los perfiles (catálogo, gobernanza, documentos, expediente), y después cada perfil transaccional en el orden de complejidad/dependencia con el que aparecen en el mapa del sitio (3.1 → 3.2 → 4.1 → 4.2 → 4.3 → 4.4), cerrando con reportes/analítica (que leen de todo lo anterior) y el endurecimiento final.

---

## Fase 0 — Fundamentos técnicos

**Objetivo:** dejar la base de infraestructura del backend lista para construir dominios de negocio sin retrabajo.

- Configurar TypeORM + MySQL (`@nestjs/typeorm`), variables de entorno (`@nestjs/config`), y estrategia de migraciones (sin `synchronize` en ningún ambiente compartido).
- Definir convenciones: nombres de tabla en `snake_case` calcados de los nombres del modelo (`res_partner`, `agd_case`, etc.), entidad base con `id`, `created_at`, `updated_at`, soft-delete donde aplique.
- Estructura de módulos NestJS por dominio (carpeta por bounded context, no por capa técnica).
- Infraestructura transversal: `ValidationPipe` global, filtro de excepciones, interceptor de logging, paginación/orden estándar para listados, Swagger/OpenAPI.
- Semillas (seed) mínimas: monedas, secuencias, parámetros de configuración base.
- Setup de testing (unit + e2e) y convención de fixtures.

**Entregable:** proyecto arrancando contra MySQL local/Docker, con un módulo de ejemplo (`health`) probando el pipeline completo (entidad → repositorio → servicio → controlador → test e2e).

---

## Fase 1 — Identidad, usuarios y seguridad (Acceso al sistema + Habilitación)

**Objetivo:** implementar el núcleo transversal del que depende todo lo demás: quién entra, con qué perfil, y cómo se habilita.

**Perfiles cubiertos:** transversal (base para los 6 perfiles).

**Tablas:**
- Inspiradas en Odoo: `res_users`, `res_partner` (+ext: datos de perfil persona/empresa), `res_company`, `res_groups` (+ext: `agd_profile_type`), `res_groups_users_rel`, `ir_model_access`, `ir_rule` (+ext: alcance por perfil), `ir_config_parameter`, `ir_attachment`, `mail_message` (auditoría de acceso), `mail_activity`.
- Propias AGD: `agd_user_enablement_request`, `agd_user_enablement_step`, `agd_policy_acceptance`, `agd_user_training_acceptance`.

**Endpoints principales:**
- `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/password/recover`, `/auth/password/change` (incluye cambio obligatorio de contraseña inicial).
- `POST /auth/register` → alta de solicitud con selección de perfil, datos personales/empresa, verificación de RIF, carga de documentos habilitantes.
- `GET/POST /enablement/requests`, `PATCH /enablement/requests/:id/steps/:step` → máquina de estados de los 9 pasos (solicitud → verificación → validación de documentos → asignación de perfil → asignación de roles → creación de cuenta → cambio de contraseña → capacitación/aceptación → activación).
- `GET /users/me`, gestión de sesiones activas, bloqueo/desbloqueo de cuenta, historial de accesos.
- `POST /policies/:id/accept`, `GET /policies/pending` (aceptación de términos, privacidad, seguridad).
- Guards/decoradores de autorización por perfil (`@Roles`, `@RequirePermission`) reutilizables por el resto de fases.

**Entregable / criterio de salida:** un usuario puede registrarse, pasar por el flujo de habilitación completo, autenticarse con JWT, y el sistema puede autorizar endpoints por perfil y por regla de alcance (`ir_rule`-like).

---

## Fase 2 — Capa transversal: gobernanza, documentos maestros, expediente y configuración

**Objetivo:** construir los módulos globales que **todos** los perfiles transaccionales van a reutilizar (sección "5. Módulos globales transversales" del mapa del sitio), incluyendo el expediente (`agd_case`), que es el hub central de todo el negocio.

**Tablas:**
- Gobernanza: `ir_model`, `ir_model_fields`, `agd_governance_matrix`, `agd_governance_matrix_version`, `agd_document_profile_matrix`, `agd_process_raci_matrix`, `agd_raci_assignment`, `agd_segregation_rule`, `agd_escalation_matrix`, `agd_governance_workflow`, `agd_governance_workflow_instance`, `mail_activity` (+ext `agd_governance_approval`).
- Documentos maestros: `documents_document`, `documents_folder` (+ext `agd_case_folder`), `documents_tag`, `agd_document_status`, `agd_document_relation`, `agd_document_requirement`, `agd_document_checklist`.
- Expediente: `agd_case`, `agd_case_party`, `agd_case_semaphore` (semáforo de estado/plazos).
- Configuración: `ir_sequence`, `ir_config_parameter` (+ext `agd_governance_matrix_config`), `res_currency`, `res_currency_rate`, `account_tax`, `mail_template`, `agd_tariff_rule`, `agd_sla_rule`, `agd_deadline_rule`, `agd_external_integration_reference`.

**Endpoints principales:**
- `GET /governance/matrix`, versión vigente vs. histórica, `POST /governance/matrix/:id/publish`.
- CRUD de RACI: `agd_process_raci_matrix`, `agd_raci_assignment`, reglas de segregación de funciones, matriz de escalamiento.
- `GET/POST /cases`, `GET /cases/:id`, `GET /cases/:id/parties`, `GET /cases/:id/semaphore` → expediente como entidad central referenciada por comercial, aduanas, WMS y TOS.
- `GET /documents`, checklist de documentos por expediente/perfil (`agd_document_checklist`), estados (`agd_document_status`), relaciones entre documentos (`agd_document_relation`).
- `GET/POST /config/tariff-rules`, `/config/sla-rules`, `/config/deadline-rules`, `/config/external-integrations`.

**Entregable:** un expediente (`agd_case`) puede crearse, asociar partes, adjuntar documentos con checklist obligatorio por perfil, y quedar sujeto a reglas de gobernanza/SLA/plazos configurables — infraestructura lista para que la usen los módulos de negocio de las fases siguientes.

**Dependencias:** Fase 1 (usuarios, perfiles, permisos).

---

## Fase 3 — HOME / Portal público + Catálogo y servicios

**Objetivo:** habilitar el perfil **Visitante** (3.1) y el catálogo global de servicios que consumen luego todos los perfiles operativos.

**Perfiles cubiertos:** Visitante (público, sin autenticación).

**Tablas:**
- HOME: `website`, `website_page` (+ext), `website_menu` (+ext), `website_visitor`, `website_track`, `agd_legal_policy`, `agd_legal_policy_version`, `agd_portal_version`.
- Catálogo: `product_template` (+ext `agd_service`), `product_product`, `product_category`, `product_pricelist`, `product_pricelist_item`, `product_attribute`, `product_attribute_value`, `uom_uom`, `uom_category`, `rating_rating`, `resource_calendar` (+ext `agd_service_availability`), `agd_service_requirement`, `agd_service_sla`, `agd_service_coverage`, `agd_service_evidence_type`, `agd_service_publication`, `agd_service_publication_version`.
- Conversión pública: `res_partner`, `crm_lead`.

**Endpoints principales:**
- `GET /public/home`, `GET /public/notices`, `GET /public/policies`, `GET /public/policies/:id/versions`.
- `GET /catalog/services` (búsqueda/filtrado público), `GET /catalog/services/:id`, `GET /catalog/services/:id/sla`, `/coverage`, `/requirements`.
- `POST /public/leads` (registro de interés → `crm_lead`).
- `POST/PATCH /catalog/services/:id/publish` (workflow de publicación con versionado, para perfiles internos que gestionan el catálogo).

**Entregable:** catálogo público navegable sin autenticación, con fichas de servicio (SLA, cobertura, requisitos documentales) y flujo de publicación/versionado para administradores del catálogo.

**Dependencias:** Fase 1 (permisos de publicación), Fase 2 (documentos/requisitos referenciados por servicio).

---

## Fase 4 — Perfil Consultor / tercero autorizado (solo lectura)

**Objetivo:** habilitar el perfil 3.2, de consulta controlada sobre expedientes existentes.

**Perfiles cubiertos:** Consultor / tercero autorizado.

**Tablas:** reutiliza `agd_case`, `agd_case_party`, `agd_case_semaphore` (Fase 2) + versiones mínimas de espejo SIDUNEA necesarias para consulta: `agd_sidunea_mirror_record`, `agd_sidunea_dua` (lectura), `agd_sidunea_modcar_manifest`, `agd_sidunea_modshd_exit_pass` (estas dos últimas se completan funcionalmente en Fases 6 y 8; aquí se define el contrato de lectura).

**Endpoints principales:**
- `GET /cases?dua=...&bl=...&awb=...&manifest=...` → búsqueda por expediente.
- `GET /cases/:id/tracking` (seguimiento aduanero de solo lectura, sin acciones de intervención).
- `GET /cases/:id/documents` (descarga controlada, auditada vía `mail_message`).
- Guard específico de solo-lectura + registro de auditoría de cada consulta.

**Entregable:** un consultor autorizado puede buscar y visualizar expedientes y documentos permitidos por la matriz de gobernanza, sin poder mutar ningún dato, con auditoría de cada acceso.

**Dependencias:** Fase 1, Fase 2. (Funcionalidad completa de manifiestos/DUA se enriquece cuando Fases 6 y 8 estén activas.)

---

## Fase 5 — Cotización, contratación y perfil Importador/Exportador

**Objetivo:** habilitar el perfil transaccional 4.1: cotización multi-prestador, carrito, contratación y expediente comercial.

**Perfiles cubiertos:** Importador / Exportador (cliente del marketplace).

**Tablas:**
- Odoo: `sale_order` (+ext `agd_quote`, `agd_service_contract`), `sale_order_line` (+ext), `account_move`, `account_move_line`, `account_payment`, `helpdesk_ticket`, `documents_tag`.
- AGD: `agd_quote_request`, `agd_quote_request_line`, `agd_quote_comparison`, `agd_service_cart`, `agd_service_cart_item`.

**Endpoints principales:**
- `POST /quotes/requests`, `GET /quotes/requests/:id/comparison` (comparación multi-prestador).
- `POST /cart/items`, `GET /cart`, `POST /cart/checkout` → genera `sale_order`/`agd_service_contract` + `agd_case`.
- `GET /orders`, `GET /orders/:id/invoices`, `GET /orders/:id/payments`.
- `GET /me/cases` (expediente comercial propio, trazabilidad AGD → TOS → transporte → destino).
- `POST /support/tickets` (centro de ayuda vía `helpdesk_ticket`).

**Entregable:** un importador/exportador puede cotizar con varios prestadores, comparar, armar carrito, contratar, ver su expediente comercial y su facturación/pagos asociados.

**Dependencias:** Fase 2 (expediente, documentos), Fase 3 (catálogo de servicios).

---

## Fase 6 — Agente de aduanas + SIDUNEA Mirror

**Objetivo:** habilitar el perfil 4.2: publicación de servicios aduaneros, expediente aduanero digital y espejo SIDUNEA (sin integración electrónica directa).

**Perfiles cubiertos:** Agente de aduanas.

**Tablas:**
- Odoo: `res_partner` (+ext `agd_customs_agent_profile` vía perfil), `product_category`, `sale_order`/`sale_order_line`, `account_move*`, `mail_activity` (+ext), `res_groups`, `ir_model_access`, `ir_rule`.
- AGD: `agd_customs_license`, `agd_customs_declaration`, `agd_customs_declaration_item`, `agd_customs_regime_assignment`, `agd_customs_tax_liquidation`, `agd_sidunea_dua`, `agd_sidunea_dua_item`, `agd_sidunea_modai_inspection`, `agd_sidunea_modshd_exit_pass`, `agd_sidunea_tax_simulation`, `agd_sidunea_customs_regime`, `agd_sidunea_mirror_record`.

**Endpoints principales:**
- `POST /customs/agents/:id/license`, verificación de habilitación profesional.
- `POST /customs/declarations`, `GET /customs/declarations/:id`, ítems de declaración, asignación de régimen.
- `POST /customs/declarations/:id/tax-liquidation` (liquidación simulada de tributos).
- `POST /sidunea/dua`, `GET /sidunea/dua/:id`, `POST /sidunea/modai`, `POST /sidunea/modshd`, `POST /sidunea/tax-simulation` — todo como espejo interno, explícitamente sin integración electrónica con el sistema oficial.
- Vinculación de cada declaración a un `agd_case` existente.

**Entregable:** un agente de aduanas habilitado puede publicar servicios, generar y gestionar un expediente aduanero digital completo (DUA, régimen, inspección MODAI, salida MODSHD, liquidación) en modo espejo.

**Dependencias:** Fase 1, Fase 2, Fase 3 (publicación de servicios), Fase 5 (el expediente comercial puede originar el aduanero).

---

## Fase 7 — WMS AGD + perfil Operador del AGD

**Objetivo:** habilitar el perfil 4.3: depósito aduanero — recepción, inventario, pesaje, picking, consolidación y conciliación de discrepancias contra SIDUNEA.

**Perfiles cubiertos:** Operador del AGD.

**Tablas:**
- Odoo: `stock_warehouse`, `stock_location` (+ext), `stock_picking_type`, `stock_picking` (+ext), `stock_move`, `stock_move_line` (+ext), `stock_quant` (+ext), `stock_lot` (+ext), `stock_quant_package`, `stock_package_type`, `stock_location_route`, `stock_rule`, `stock_scrap`, `product_template/product_product`, `uom_uom/uom_category`.
- AGD: `agd_wms_receipt_discrepancy`, `agd_wms_custody_record`, `agd_wms_storage_period`, `agd_wms_weighing_ticket`, `agd_wms_consolidation_order`, `agd_wms_deconsolidation_order`, `agd_wms_cargo_handling_task`, `agd_discrepancy_matrix`, `agd_discrepancy_item`.

**Endpoints principales:**
- `POST /wms/receipts` (recepción contra manifiesto y BL, referenciando `agd_sidunea_modcar_manifest`), líneas de recepción (`stock_move_line`).
- `GET /wms/inventory` (por bulto/ubicación/estado vía `stock_quant`/`stock_lot`), `POST /wms/weighing-tickets`, `POST /wms/picking`.
- `POST /wms/consolidation-orders`, `POST /wms/deconsolidation-orders`, tareas de manipulación de carga (`agd_wms_cargo_handling_task`).
- `POST /wms/discrepancies`, `GET /wms/discrepancies/matrix` (conciliación SIDUNEA–AGD).
- `GET /wms/custody-records`, `GET /wms/storage-periods` (plazos legales de depósito).

**Entregable:** el operador AGD puede ejecutar el ciclo completo de depósito aduanero (recepción → custodia → pesaje/picking → consolidación → salida) con conciliación de discrepancias frente al espejo SIDUNEA.

**Dependencias:** Fase 2 (expediente, documentos), Fase 6 (manifiestos SIDUNEA que originan la recepción).

---

## Fase 8 — TOS y transporte + perfil Agente/operador TOS

**Objetivo:** habilitar el perfil 4.4: terminal operativa — citas, gates, slots, validación de conductor/vehículo y seguimiento de viajes/entregas.

**Perfiles cubiertos:** Agente / operador TOS.

**Tablas:**
- Odoo: `fleet_vehicle` (+ext `agd_tos_vehicle_validation`, `agd_transport_vehicle`), `fleet_vehicle_model`, `fleet_vehicle_log_services`, `fleet_vehicle_odometer`, `calendar_event` (+ext `agd_tos_appointment`), `resource_calendar`, `resource_calendar_attendance`, `helpdesk_ticket` (+ext `agd_tos_incident`), `stock_picking` (+ext `agd_transport_delivery`).
- AGD: `agd_tos_appointment_line`, `agd_tos_gate`, `agd_tos_gate_slot`, `agd_tos_gate_assignment`, `agd_tos_turn`, `agd_tos_queue`, `agd_tos_driver_validation`, `agd_tos_authorization`, `agd_transport_order`, `agd_transport_order_line`, `agd_transport_trip`, `agd_transport_pod`, `agd_transport_route`, `agd_sidunea_modcar_manifest`, `agd_sidunea_modshd_exit_pass` (completar aquí lo definido en Fase 6/4).

**Endpoints principales:**
- `POST /tos/appointments`, `GET /tos/gates`, `POST /tos/gates/:id/slots`, asignación de gate/slot, gestión de turnos y colas.
- `POST /tos/drivers/:id/validate`, `POST /tos/vehicles/:id/validate`, `POST /tos/access/authorize`.
- `POST /transport/orders`, `POST /transport/trips`, `GET /transport/trips/:id/pod` (proof of delivery), rutas.
- `POST /sidunea/modcar`, `POST /sidunea/modshd` (manifiesto y salida, compartidos con WMS).
- `POST /tos/incidents` (vía `helpdesk_ticket` extendido).

**Entregable:** el operador TOS puede gestionar el ciclo de citas/gates/turnos, validar conductor y vehículo, autorizar acceso y dar seguimiento a viajes y entregas hasta el POD.

**Dependencias:** Fase 1, Fase 2, Fase 3, Fase 7 (comparte manifiestos/salida con WMS).

---

## Fase 9 — Reportes, analítica y matriz de acceso por perfil

**Objetivo:** cerrar el ciclo con la capa de reportes que lee de todos los módulos anteriores, y formalizar/verificar la matriz de acceso por perfil (sección 7 del mapa del sitio) sobre el sistema ya construido.

**Tablas:**
- Odoo: `sale_report`, `account_move/account_move_line`, `stock_picking/stock_move/stock_quant`, `mail_message`, `ir_attachment`.
- AGD: `agd_report_snapshot`, `agd_kpi_definition`, `agd_kpi_measurement`, `agd_dashboard_profile_layout`, `agd_analytics_event`.

**Endpoints principales:**
- `GET /reports/kpis`, `GET /reports/kpis/:id/measurements`, `GET /dashboards/:profile` (layout por perfil).
- `POST /analytics/events` (tracking interno), `GET /reports/snapshots`.
- Endpoint/documentación de verificación de la matriz de acceso: qué puede ver/hacer cada perfil sobre marketplace, documentos, gobernanza, WMS, TOS, publicación de servicios y reportes — validado con tests de autorización cruzados por perfil.

**Entregable:** dashboards por perfil con KPIs propios, y suite de tests de autorización que confirma que la matriz de acceso de la Fase 1 se cumple end-to-end en cada módulo construido en fases 3–8.

**Dependencias:** todas las fases anteriores.

---

## Fase 10 — Endurecimiento, documentación y despliegue

**Objetivo:** dejar el backend listo para producción.

- Revisión de seguridad (OWASP top 10: inyección, control de acceso roto, exposición de datos sensibles en documentos/adjuntos).
- Cobertura de tests e2e por perfil (los 6 perfiles + transversales).
- Documentación OpenAPI completa y actualizada, guía de variables de entorno y despliegue.
- Estrategia de migraciones de base de datos para ambientes (dev/staging/prod) y plan de seeds de catálogo/configuración inicial.
- Revisión de rendimiento en consultas de listados grandes (expedientes, inventario, reportes) — índices y paginación.

**Entregable:** backend desplegable, documentado, con cobertura de pruebas por perfil y checklist de seguridad cerrado.

---

## Resumen de dependencias entre fases

```
Fase 0 (fundamentos)
  └─ Fase 1 (usuarios/seguridad)
        └─ Fase 2 (gobernanza/documentos/expediente/config)
              ├─ Fase 3 (HOME + catálogo) ── perfil Visitante
              │     └─ Fase 4 (Consultor, solo lectura)
              │     └─ Fase 5 (Cotización/contratación) ── perfil Importador/Exportador
              │           └─ Fase 6 (Aduanas + SIDUNEA Mirror) ── perfil Agente de aduanas
              │                 └─ Fase 7 (WMS) ── perfil Operador AGD
              │                       └─ Fase 8 (TOS/transporte) ── perfil Agente/operador TOS
              └─ Fase 9 (Reportes + matriz de acceso, lee de 1–8)
                    └─ Fase 10 (Hardening y despliegue)
```

## Notas de alcance

- Las 62 tablas descartadas y las 36 resueltas por extensión (documentadas en `listado_tablas_odoo_vs_agd_marketplace.xlsx`, no incluido en este repo) **no requieren tabla física nueva**: se implementan como campos adicionales en la entidad base o se resuelven reutilizando la entidad equivalente (por ejemplo, `agd_document_permission_matrix` se resuelve con reglas sobre `ir_rule`).
- El footer (sección 8) es contenido mayormente estático (enlaces legales, ayuda, versionado) — se cubre con las tablas de HOME de la Fase 3 (`agd_legal_policy*`, `agd_portal_version`) y no requiere una fase propia.
