import { MigrationInterface, QueryRunner } from 'typeorm';

const ADMIN_FULL_ACCESS_MODELS = [
  'agd_quote_request',
  'sale_order',
  'agd_service_cart',
  'account_move',
  'helpdesk_ticket',
];

const IMPORTADOR_OWN_READ_WRITE_MODELS = [
  { model: 'agd_quote_request', create: true, write: true },
  { model: 'agd_service_cart', create: true, write: true },
  { model: 'sale_order', create: false, write: false },
  { model: 'agd_case_own', create: false, write: false },
];

export class SeedFase5Commerce1783815300000 implements MigrationInterface {
  name = 'SeedFase5Commerce1783815300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [adminGroup] = (await queryRunner.query(
      'SELECT id FROM `res_groups` WHERE code = ?',
      ['admin'],
    )) as Array<{ id: number }>;
    const [importadorGroup] = (await queryRunner.query(
      'SELECT id FROM `res_groups` WHERE code = ?',
      ['importador_exportador'],
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

    for (const { model, create, write } of IMPORTADOR_OWN_READ_WRITE_MODELS) {
      await queryRunner.query(
        'INSERT INTO `ir_model_access` (`group_id`, `model_name`, `perm_read`, `perm_write`, `perm_create`, `perm_unlink`) VALUES (?, ?, 1, ?, ?, 0)',
        [importadorGroup.id, model, write, create],
      );
      await queryRunner.query(
        'INSERT INTO `ir_rule` (`group_id`, `model_name`, `scope`, `active`) VALUES (?, ?, ?, 1)',
        [importadorGroup.id, model, 'own'],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const importadorModels = IMPORTADOR_OWN_READ_WRITE_MODELS.map(
      (entry) => entry.model,
    );
    await queryRunner.query(
      `DELETE FROM \`ir_rule\` WHERE model_name IN (${ADMIN_FULL_ACCESS_MODELS.map(() => '?').join(',')})`,
      ADMIN_FULL_ACCESS_MODELS,
    );
    await queryRunner.query(
      `DELETE FROM \`ir_model_access\` WHERE model_name IN (${ADMIN_FULL_ACCESS_MODELS.map(() => '?').join(',')})`,
      ADMIN_FULL_ACCESS_MODELS,
    );
    await queryRunner.query(
      `DELETE FROM \`ir_rule\` WHERE model_name IN (${importadorModels.map(() => '?').join(',')})`,
      importadorModels,
    );
    await queryRunner.query(
      `DELETE FROM \`ir_model_access\` WHERE model_name IN (${importadorModels.map(() => '?').join(',')})`,
      importadorModels,
    );
  }
}
