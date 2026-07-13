import { MigrationInterface, QueryRunner } from 'typeorm';

const CASE_LOOKUP_MODEL = 'agd_case_lookup';
const SIDUNEA_MIRROR_MODEL = 'agd_sidunea_mirror_record';

export class SeedFase4CaseLookup1783814100000 implements MigrationInterface {
  name = 'SeedFase4CaseLookup1783814100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [adminGroup] = (await queryRunner.query(
      'SELECT id FROM `res_groups` WHERE code = ?',
      ['admin'],
    )) as Array<{ id: number }>;
    const [consultorGroup] = (await queryRunner.query(
      'SELECT id FROM `res_groups` WHERE code = ?',
      ['consultor'],
    )) as Array<{ id: number }>;

    // Admin: CRUD completo sobre el espejo SIDUNEA, y también puede usar la
    // consulta por referencia (además de su acceso general a agd_case).
    await queryRunner.query(
      'INSERT INTO `ir_model_access` (`group_id`, `model_name`, `perm_read`, `perm_write`, `perm_create`, `perm_unlink`) VALUES (?, ?, 1, 1, 1, 1)',
      [adminGroup.id, SIDUNEA_MIRROR_MODEL],
    );
    await queryRunner.query(
      'INSERT INTO `ir_rule` (`group_id`, `model_name`, `scope`, `active`) VALUES (?, ?, ?, 1)',
      [adminGroup.id, SIDUNEA_MIRROR_MODEL, 'all'],
    );
    await queryRunner.query(
      'INSERT INTO `ir_model_access` (`group_id`, `model_name`, `perm_read`, `perm_write`, `perm_create`, `perm_unlink`) VALUES (?, ?, 1, 0, 0, 0)',
      [adminGroup.id, CASE_LOOKUP_MODEL],
    );
    await queryRunner.query(
      'INSERT INTO `ir_rule` (`group_id`, `model_name`, `scope`, `active`) VALUES (?, ?, ?, 1)',
      [adminGroup.id, CASE_LOOKUP_MODEL, 'all'],
    );

    // Consultor: solo puede resolver un expediente si conoce su referencia
    // SIDUNEA (DUA/manifiesto/hoja de salida) — no un listado abierto de casos.
    await queryRunner.query(
      'INSERT INTO `ir_model_access` (`group_id`, `model_name`, `perm_read`, `perm_write`, `perm_create`, `perm_unlink`) VALUES (?, ?, 1, 0, 0, 0)',
      [consultorGroup.id, CASE_LOOKUP_MODEL],
    );
    await queryRunner.query(
      'INSERT INTO `ir_rule` (`group_id`, `model_name`, `scope`, `active`) VALUES (?, ?, ?, 1)',
      [consultorGroup.id, CASE_LOOKUP_MODEL, 'all'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM `ir_rule` WHERE model_name IN (?, ?)',
      [CASE_LOOKUP_MODEL, SIDUNEA_MIRROR_MODEL],
    );
    await queryRunner.query(
      'DELETE FROM `ir_model_access` WHERE model_name IN (?, ?)',
      [CASE_LOOKUP_MODEL, SIDUNEA_MIRROR_MODEL],
    );
  }
}
