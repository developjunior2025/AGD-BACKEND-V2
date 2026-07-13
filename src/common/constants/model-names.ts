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
} as const;

export type ModelName = (typeof ModelName)[keyof typeof ModelName];
