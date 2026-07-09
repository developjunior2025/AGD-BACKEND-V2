/**
 * Formato de RIF venezolano validado en RegisterEnablementDto (letra + 8
 * dígitos [+ dígito verificador opcional]). No implementa el algoritmo de
 * dígito verificador real del SENIAT ni valida contra el padrón oficial —
 * esa verificación externa queda fuera del alcance de este backend standalone.
 */
export function normalizeRif(rif: string): string {
  return rif.trim().toUpperCase().replace(/-/g, '');
}
