import { MigrationInterface, QueryRunner } from 'typeorm';

const PROFILES: Array<{
  code: string;
  name: string;
  description: string;
  isEnablementProfile: boolean;
}> = [
  {
    code: 'consultor',
    name: 'Consultor / tercero autorizado',
    description:
      'Acceso de solo consulta a expedientes por DUA, BL, AWB o manifiesto.',
    isEnablementProfile: true,
  },
  {
    code: 'importador_exportador',
    name: 'Importador / Exportador',
    description:
      'Cliente del marketplace: cotización, contratación y seguimiento de despachos.',
    isEnablementProfile: true,
  },
  {
    code: 'agente_aduanas',
    name: 'Agente de aduanas',
    description:
      'Publica servicios aduaneros y gestiona el expediente aduanero digital.',
    isEnablementProfile: true,
  },
  {
    code: 'operador_agd',
    name: 'Operador del AGD',
    description: 'Operador del depósito aduanero: recepción, inventario, WMS.',
    isEnablementProfile: true,
  },
  {
    code: 'agente_tos',
    name: 'Agente / operador TOS',
    description: 'Gestión de citas, gates, slots y transporte en la terminal.',
    isEnablementProfile: true,
  },
  {
    code: 'admin',
    name: 'Administrador',
    description:
      'Staff interno: procesa solicitudes de habilitación y administra gobernanza. No es autoasignable en el registro público.',
    isEnablementProfile: false,
  },
];

const ENABLEMENT_REQUEST_MODEL = 'agd_user_enablement_request';
const USER_MODEL = 'res_users';

export class SeedIdentityProfiles1783811300000 implements MigrationInterface {
  name = 'SeedIdentityProfiles1783811300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const profile of PROFILES) {
      await queryRunner.query(
        'INSERT INTO `res_groups` (`code`, `name`, `description`, `is_enablement_profile`, `active`) VALUES (?, ?, ?, ?, 1)',
        [
          profile.code,
          profile.name,
          profile.description,
          profile.isEnablementProfile,
        ],
      );
    }

    const [adminGroup] = (await queryRunner.query(
      'SELECT id FROM `res_groups` WHERE code = ?',
      ['admin'],
    )) as Array<{ id: number }>;

    // Admin: control total sobre habilitaciones y cuentas, alcance global.
    await queryRunner.query(
      'INSERT INTO `ir_model_access` (`group_id`, `model_name`, `perm_read`, `perm_write`, `perm_create`, `perm_unlink`) VALUES (?, ?, 1, 1, 1, 0)',
      [adminGroup.id, ENABLEMENT_REQUEST_MODEL],
    );
    await queryRunner.query(
      'INSERT INTO `ir_rule` (`group_id`, `model_name`, `scope`, `active`) VALUES (?, ?, ?, 1)',
      [adminGroup.id, ENABLEMENT_REQUEST_MODEL, 'all'],
    );
    await queryRunner.query(
      'INSERT INTO `ir_model_access` (`group_id`, `model_name`, `perm_read`, `perm_write`, `perm_create`, `perm_unlink`) VALUES (?, ?, 1, 1, 0, 0)',
      [adminGroup.id, USER_MODEL],
    );
    await queryRunner.query(
      'INSERT INTO `ir_rule` (`group_id`, `model_name`, `scope`, `active`) VALUES (?, ?, ?, 1)',
      [adminGroup.id, USER_MODEL, 'all'],
    );

    // Perfiles autoservicio: solo lectura de su propia solicitud de habilitación
    // (uso previsto en fases posteriores, cuando naveguen su propio historial autenticados).
    const enablementProfiles = PROFILES.filter((p) => p.isEnablementProfile);
    for (const profile of enablementProfiles) {
      const [group] = (await queryRunner.query(
        'SELECT id FROM `res_groups` WHERE code = ?',
        [profile.code],
      )) as Array<{ id: number }>;
      await queryRunner.query(
        'INSERT INTO `ir_model_access` (`group_id`, `model_name`, `perm_read`, `perm_write`, `perm_create`, `perm_unlink`) VALUES (?, ?, 1, 0, 0, 0)',
        [group.id, ENABLEMENT_REQUEST_MODEL],
      );
      await queryRunner.query(
        'INSERT INTO `ir_rule` (`group_id`, `model_name`, `scope`, `active`) VALUES (?, ?, ?, 1)',
        [group.id, ENABLEMENT_REQUEST_MODEL, 'own'],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM `ir_rule` WHERE model_name IN (?, ?)',
      [ENABLEMENT_REQUEST_MODEL, USER_MODEL],
    );
    await queryRunner.query(
      'DELETE FROM `ir_model_access` WHERE model_name IN (?, ?)',
      [ENABLEMENT_REQUEST_MODEL, USER_MODEL],
    );
    await queryRunner.query(
      'DELETE FROM `res_groups` WHERE code IN (?, ?, ?, ?, ?, ?)',
      [...PROFILES.map((p) => p.code)],
    );
  }
}
