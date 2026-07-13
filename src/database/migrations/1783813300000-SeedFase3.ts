import { MigrationInterface, QueryRunner } from 'typeorm';

const ADMIN_FULL_ACCESS_MODELS = [
  'website_page',
  'crm_lead',
  'agd_service_publication',
  'product_template',
];

export class SeedFase3Content1783813300000 implements MigrationInterface {
  name = 'SeedFase3Content1783813300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `website` (`name`, `domain`, `active`) VALUES (?, ?, 1)',
      ['Marketplace AGD', null],
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
    await queryRunner.query('DELETE FROM `website` WHERE `name` = ?', [
      'Marketplace AGD',
    ]);
  }
}
