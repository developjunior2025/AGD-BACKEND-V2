/**
 * Identificadores lógicos usados por ir_model_access / ir_rule.
 * No son nombres de tabla física — son el "modelo de negocio" al que
 * se le aplican permisos, igual que en Odoo (ir.model.access.model_id).
 */
export const ModelName = {
  ENABLEMENT_REQUEST: 'agd_user_enablement_request',
  USER: 'res_users',
  CONFIG: 'agd_config',
  GOVERNANCE_MATRIX: 'agd_governance_matrix',
  CASE: 'agd_case',
  DOCUMENT: 'documents_document',
  HOME_CONTENT: 'website_page',
  CRM_LEAD: 'crm_lead',
  SERVICE_PUBLICATION: 'agd_service_publication',
  CATALOG: 'product_template',
  SIDUNEA_MIRROR: 'agd_sidunea_mirror_record',
  /** Consulta de expediente por referencia SIDUNEA (perfil Consultor) — capacidad separada de CASE (listado administrativo). */
  CASE_LOOKUP: 'agd_case_lookup',
  /** GET /cases/me — ver solo los expedientes propios (Importador/Exportador), no un listado abierto como CASE. */
  CASE_OWN: 'agd_case_own',
  INVOICE: 'account_move',
  QUOTE_REQUEST: 'agd_quote_request',
  ORDER: 'sale_order',
  CART: 'agd_service_cart',
  HELPDESK: 'helpdesk_ticket',
  CUSTOMS_LICENSE: 'agd_customs_license',
  CUSTOMS_DECLARATION: 'agd_customs_declaration',
  /** Operación de depósito/almacén (recepción, picking, custodia, pesaje, consolidación, discrepancias). */
  WMS: 'agd_wms_operation',
} as const;

export type ModelName = (typeof ModelName)[keyof typeof ModelName];
