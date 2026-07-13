import { MigrationInterface, QueryRunner } from 'typeorm';

const CASE_SEQUENCE = { code: 'agd_case', prefix: 'CASE-', padding: 6 };

const ADMIN_FULL_ACCESS_MODELS = [
  'agd_config',
  'agd_governance_matrix',
  'agd_case',
  'documents_document',
];

export class SeedFase2Config1783812400000 implements MigrationInterface {
  name = 'SeedFase2Config1783812400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `ir_sequence` (`code`, `prefix`, `padding`, `last_number`, `active`) VALUES (?, ?, ?, 0, 1)',
      [CASE_SEQUENCE.code, CASE_SEQUENCE.prefix, CASE_SEQUENCE.padding],
    );

    const [adminGroup] = (await queryRunner.query(
      'SELECT id FROM `res_groups` WHERE code = ?',
      ['admin'],
    )) as Array<{ id: number }>;

    for (const modelName of ADMIN_FULL_ACCESS_MODELS) {
      await queryRunner.query(
        'INSERT INTO `ir_model_access` (`group_id`, `model_name`, `perm_read`, `perm_write`, `perm_create`, `perm_unlink`) VALUES (?, ?, 1, 1, 1, 1)',
        [adminGroup.id, modelName],
      );
      await queryRunner.query(
        'INSERT INTO `ir_rule` (`group_id`, `model_name`, `scope`, `active`) VALUES (?, ?, ?, 1)',
        [adminGroup.id, modelName, 'all'],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM `ir_rule` WHERE model_name IN (?, ?, ?, ?)',
      ADMIN_FULL_ACCESS_MODELS,
    );
    await queryRunner.query(
      'DELETE FROM `ir_model_access` WHERE model_name IN (?, ?, ?, ?)',
      ADMIN_FULL_ACCESS_MODELS,
    );
    await queryRunner.query('DELETE FROM `ir_sequence` WHERE code = ?', [
      CASE_SEQUENCE.code,
    ]);
  }
}
