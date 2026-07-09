/**
 * Identificadores lógicos usados por ir_model_access / ir_rule.
 * No son nombres de tabla física — son el "modelo de negocio" al que
 * se le aplican permisos, igual que en Odoo (ir.model.access.model_id).
 */
export const ModelName = {
  ENABLEMENT_REQUEST: 'agd_user_enablement_request',
  USER: 'res_users',
} as const;

export type ModelName = (typeof ModelName)[keyof typeof ModelName];
