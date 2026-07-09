import { GroupCode } from '../entities/group.entity';

export interface ProfileSeed {
  code: GroupCode;
  name: string;
  description: string;
  /** Perfil que un visitante puede solicitar en el registro público. */
  isEnablementProfile: boolean;
}

export const PROFILE_SEEDS: ProfileSeed[] = [
  {
    code: GroupCode.CONSULTOR,
    name: 'Consultor / tercero autorizado',
    description:
      'Acceso de solo consulta a expedientes por DUA, BL, AWB o manifiesto.',
    isEnablementProfile: true,
  },
  {
    code: GroupCode.IMPORTADOR_EXPORTADOR,
    name: 'Importador / Exportador',
    description:
      'Cliente del marketplace: cotización, contratación y seguimiento de despachos.',
    isEnablementProfile: true,
  },
  {
    code: GroupCode.AGENTE_ADUANAS,
    name: 'Agente de aduanas',
    description:
      'Publica servicios aduaneros y gestiona el expediente aduanero digital.',
    isEnablementProfile: true,
  },
  {
    code: GroupCode.OPERADOR_AGD,
    name: 'Operador del AGD',
    description: 'Operador del depósito aduanero: recepción, inventario, WMS.',
    isEnablementProfile: true,
  },
  {
    code: GroupCode.AGENTE_TOS,
    name: 'Agente / operador TOS',
    description: 'Gestión de citas, gates, slots y transporte en la terminal.',
    isEnablementProfile: true,
  },
  {
    code: GroupCode.ADMIN,
    name: 'Administrador',
    description:
      'Staff interno: procesa solicitudes de habilitación y administra gobernanza. No es autoasignable en el registro público.',
    isEnablementProfile: false,
  },
];
