# Resumen de tablas del modelo de datos — Marketplace + AGD

Estado depurado del modelo de datos tras comparar las 176 tablas propuestas contra el modelo nativo de Odoo. Quedan **142 tablas físicas**: 64 nativas de Odoo (22 de ellas con campos propios agregados por herencia) y 78 propias del Marketplace AGD, sin equivalente nativo.

| Origen | Cantidad |
|---|---|
| Tablas nativas de Odoo ERP | 64 |
| — de las cuales, extendidas con campos propios | 22 |
| Tablas propias del Marketplace AGD | 78 |
| **Total tablas físicas del desarrollo** | **142** |

> Nota: 62 tablas adicionales propuestas originalmente resultaron redundantes con Odoo (se descartaron) y 36 se resuelven extendiendo un modelo Odoo existente en vez de crear tabla nueva. Ambos grupos están documentados en el Excel `listado_tablas_odoo_vs_agd_marketplace.xlsx`.

## Tablas nativas de Odoo ERP

64 tablas, sin desarrollo propio salvo donde se indica extensión.

### Accounting / Invoicing

| Tabla | Extendida con campos propios |
|---|---|
| `account_move` | No |
| `account_move_line` | No |
| `account_payment` | No |
| `account_tax` | No |

### CRM

| Tabla | Extendida con campos propios |
|---|---|
| `crm_lead` | No |

### Calendar

| Tabla | Extendida con campos propios |
|---|---|
| `calendar_event` | Sí — agd_tos_appointment |

### Companies

| Tabla | Extendida con campos propios |
|---|---|
| `res_company` | No |

### Contacts

| Tabla | Extendida con campos propios |
|---|---|
| `res_partner` | Sí — agd_user_profile, agd_company_profile, agd_provider_public_profile, agd_customs_agent_profile, agd_transport_driver |

### Currency

| Tabla | Extendida con campos propios |
|---|---|
| `res_currency` | No |
| `res_currency_rate` | No |

### Documents / Attachments

| Tabla | Extendida con campos propios |
|---|---|
| `ir_attachment` | No |

### Documents / DMS

| Tabla | Extendida con campos propios |
|---|---|
| `documents_document` | No |
| `documents_folder` | Sí — agd_case_folder |
| `documents_tag` | No |

### Fleet

| Tabla | Extendida con campos propios |
|---|---|
| `fleet_vehicle` | Sí — agd_tos_vehicle_validation, agd_transport_vehicle |
| `fleet_vehicle_log_services` | No |
| `fleet_vehicle_model` | No |
| `fleet_vehicle_odometer` | No |

### Groups / Access rights

| Tabla | Extendida con campos propios |
|---|---|
| `res_groups` | Sí — agd_profile_type |
| `res_groups_users_rel` | No |

### Helpdesk

| Tabla | Extendida con campos propios |
|---|---|
| `helpdesk_ticket` | Sí — agd_tos_incident |

### Inventory / WMS

| Tabla | Extendida con campos propios |
|---|---|
| `stock_location` | Sí — agd_wms_location_zone, agd_wms_location_slot |
| `stock_location_route` | No |
| `stock_lot` | Sí — agd_wms_inventory_unit |
| `stock_move` | No |
| `stock_move_line` | Sí — agd_wms_receipt_line |
| `stock_package_type` | No |
| `stock_picking` | Sí — agd_wms_receipt_notice, agd_wms_receipt, agd_wms_inbound_order, agd_transport_delivery |
| `stock_picking_type` | No |
| `stock_quant` | Sí — agd_wms_inventory_unit, agd_wms_inventory_balance |
| `stock_quant_package` | No |
| `stock_rule` | No |
| `stock_scrap` | No |
| `stock_warehouse` | No |

### Mail / Activities

| Tabla | Extendida con campos propios |
|---|---|
| `mail_activity` | Sí — agd_governance_approval |
| `mail_message` | No |
| `mail_template` | No |

### Products / Pricelists

| Tabla | Extendida con campos propios |
|---|---|
| `product_attribute` | No |
| `product_attribute_value` | No |
| `product_category` | No |
| `product_pricelist` | No |
| `product_pricelist_item` | No |
| `product_product` | No |
| `product_template` | Sí — agd_service, agd_service_detail |

### Products / UoM

| Tabla | Extendida con campos propios |
|---|---|
| `uom_category` | No |
| `uom_uom` | No |

### Ratings

| Tabla | Extendida con campos propios |
|---|---|
| `rating_rating` | No |

### Resource Calendar

| Tabla | Extendida con campos propios |
|---|---|
| `resource_calendar` | Sí — agd_service_availability |
| `resource_calendar_attendance` | No |

### Sales / Quotations

| Tabla | Extendida con campos propios |
|---|---|
| `sale_order` | Sí — agd_quote, agd_service_contract |
| `sale_order_line` | Sí — agd_quote_line, agd_service_contract_line |
| `sale_report` | No |

### System / Access rights

| Tabla | Extendida con campos propios |
|---|---|
| `ir_model` | No |
| `ir_model_access` | Sí — agd_service_publication_permission, agd_document_permission_matrix |
| `ir_model_fields` | No |
| `ir_rule` | Sí — agd_user_access_scope, agd_service_publication_permission, agd_document_permission_matrix, agd_document_permission_rule |

### System / Configuration

| Tabla | Extendida con campos propios |
|---|---|
| `ir_config_parameter` | Sí — agd_governance_matrix_config |
| `ir_sequence` | No |

### Users

| Tabla | Extendida con campos propios |
|---|---|
| `res_users` | Sí — agd_user_profile |

### Website / Portal

| Tabla | Extendida con campos propios |
|---|---|
| `website` | No |
| `website_menu` | Sí — agd_external_platform_link |
| `website_page` | Sí — agd_public_notice, agd_faq |
| `website_track` | No |
| `website_visitor` | No |

## Tablas propias del Marketplace AGD

78 tablas de desarrollo propio, sin equivalente nativo en Odoo.

### Agente de aduanas (5)

- `agd_customs_declaration`
- `agd_customs_declaration_item`
- `agd_customs_license`
- `agd_customs_regime_assignment`
- `agd_customs_tax_liquidation`

### Catalogo y servicios (6)

- `agd_service_coverage`
- `agd_service_evidence_type`
- `agd_service_publication`
- `agd_service_publication_version`
- `agd_service_requirement`
- `agd_service_sla`

### Configuracion (4)

- `agd_deadline_rule`
- `agd_external_integration_reference`
- `agd_sla_rule`
- `agd_tariff_rule`

### Cotizacion y contratacion (5)

- `agd_quote_comparison`
- `agd_quote_request`
- `agd_quote_request_line`
- `agd_service_cart`
- `agd_service_cart_item`

### Expediente y documentos (8)

- `agd_case`
- `agd_case_party`
- `agd_case_semaphore`
- `agd_document_checklist`
- `agd_document_profile_matrix`
- `agd_document_relation`
- `agd_document_requirement`
- `agd_document_status`

### Gobernanza y matriz (8)

- `agd_escalation_matrix`
- `agd_governance_matrix`
- `agd_governance_matrix_version`
- `agd_governance_workflow`
- `agd_governance_workflow_instance`
- `agd_process_raci_matrix`
- `agd_raci_assignment`
- `agd_segregation_rule`

### HOME / Portal publico (3)

- `agd_legal_policy`
- `agd_legal_policy_version`
- `agd_portal_version`

### Nucleo de usuarios y seguridad (3)

- `agd_user_enablement_request`
- `agd_user_enablement_step`
- `agd_user_training_acceptance`

### Otro (1)

- `agd_policy_acceptance`

### Reportes y estadisticas (5)

- `agd_analytics_event`
- `agd_dashboard_profile_layout`
- `agd_kpi_definition`
- `agd_kpi_measurement`
- `agd_report_snapshot`

### SIDUNEA Mirror (8)

- `agd_sidunea_customs_regime`
- `agd_sidunea_dua`
- `agd_sidunea_dua_item`
- `agd_sidunea_mirror_record`
- `agd_sidunea_modai_inspection`
- `agd_sidunea_modcar_manifest`
- `agd_sidunea_modshd_exit_pass`
- `agd_sidunea_tax_simulation`

### TOS y transporte (13)

- `agd_tos_appointment_line`
- `agd_tos_authorization`
- `agd_tos_driver_validation`
- `agd_tos_gate`
- `agd_tos_gate_assignment`
- `agd_tos_gate_slot`
- `agd_tos_queue`
- `agd_tos_turn`
- `agd_transport_order`
- `agd_transport_order_line`
- `agd_transport_pod`
- `agd_transport_route`
- `agd_transport_trip`

### WMS AGD (9)

- `agd_discrepancy_item`
- `agd_discrepancy_matrix`
- `agd_wms_cargo_handling_task`
- `agd_wms_consolidation_order`
- `agd_wms_custody_record`
- `agd_wms_deconsolidation_order`
- `agd_wms_receipt_discrepancy`
- `agd_wms_storage_period`
- `agd_wms_weighing_ticket`

## Fuente

Clasificación completa (incluyendo tablas redundantes y de extensión, con justificación por tabla) en `listado_tablas_odoo_vs_agd_marketplace.xlsx`, pestañas *AGD - Necesarias (dev)*, *AGD - Extender modelo* y *AGD - Redundantes (no crear)*.
