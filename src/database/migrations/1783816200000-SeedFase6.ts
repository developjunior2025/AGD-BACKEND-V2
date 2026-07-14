import { MigrationInterface, QueryRunner } from 'typeorm';

const ADMIN_FULL_ACCESS_MODELS = [
  'agd_customs_license',
  'agd_customs_declaration',
];

const AGENTE_ADUANAS_MODELS: Array<{
  model: string;
  read: boolean;
  write: boolean;
  create: boolean;
}> = [
  { model: 'agd_customs_license', read: true, write: false, create: false },
  { model: 'agd_customs_declaration', read: true, write: true, create: true },
  { model: 'agd_sidunea_mirror_record', read: true, write: true, create: true },
  { model: 'product_template', read: true, write: true, create: true },
  { model: 'agd_service_publication', read: true, write: true, create: true },
];

export class SeedFase6Customs1783816200000 implements MigrationInterface {
  name = 'SeedFase6Customs1783816200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [adminGroup] = (await queryRunner.query(
      'SELECT id FROM `res_groups` WHERE code = ?',
      ['admin'],
    )) as Array<{ id: number }>;
    const [agenteAduanasGroup] = (await queryRunner.query(
      'SELECT id FROM `res_groups` WHERE code = ?',
      ['agente_aduanas'],
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

    for (const { model, read, write, create } of AGENTE_ADUANAS_MODELS) {
      await queryRunner.query(
        'INSERT INTO `ir_model_access` (`group_id`, `model_name`, `perm_read`, `perm_write`, `perm_create`, `perm_unlink`) VALUES (?, ?, ?, ?, ?, 0)',
        [agenteAduanasGroup.id, model, read, write, create],
      );
      await queryRunner.query(
        'INSERT INTO `ir_rule` (`group_id`, `model_name`, `scope`, `active`) VALUES (?, ?, ?, 1)',
        [agenteAduanasGroup.id, model, 'own'],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const agenteModels = AGENTE_ADUANAS_MODELS.map((entry) => entry.model);
    await queryRunner.query(
      `DELETE FROM \`ir_rule\` WHERE model_name IN (${ADMIN_FULL_ACCESS_MODELS.map(() => '?').join(',')})`,
      ADMIN_FULL_ACCESS_MODELS,
    );
    await queryRunner.query(
      `DELETE FROM \`ir_model_access\` WHERE model_name IN (${ADMIN_FULL_ACCESS_MODELS.map(() => '?').join(',')})`,
      ADMIN_FULL_ACCESS_MODELS,
    );
    await queryRunner.query(
      `DELETE FROM \`ir_rule\` WHERE group_id = (SELECT id FROM \`res_groups\` WHERE code = 'agente_aduanas') AND model_name IN (${agenteModels.map(() => '?').join(',')})`,
      agenteModels,
    );
    await queryRunner.query(
      `DELETE FROM \`ir_model_access\` WHERE group_id = (SELECT id FROM \`res_groups\` WHERE code = 'agente_aduanas') AND model_name IN (${agenteModels.map(() => '?').join(',')})`,
      agenteModels,
    );
  }
}
