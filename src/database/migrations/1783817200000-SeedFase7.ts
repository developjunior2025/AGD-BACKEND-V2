import { MigrationInterface, QueryRunner } from 'typeorm';

const PICKING_SEQUENCE = { code: 'stock_picking', prefix: 'PICK-', padding: 6 };

const ADMIN_FULL_ACCESS_MODELS = ['agd_wms_operation'];

interface WarehouseRow {
  id: number;
}

export class SeedFase71783817200000 implements MigrationInterface {
  name = 'SeedFase71783817200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `ir_sequence` (`code`, `prefix`, `padding`, `last_number`, `active`) VALUES (?, ?, ?, 0, 1)',
      [
        PICKING_SEQUENCE.code,
        PICKING_SEQUENCE.prefix,
        PICKING_SEQUENCE.padding,
      ],
    );

    await queryRunner.query(
      'INSERT INTO `stock_warehouse` (`name`, `code`, `active`) VALUES (?, ?, 1)',
      ['Depósito Aduanero AGD', 'AGD'],
    );
    const [warehouse] = (await queryRunner.query(
      'SELECT id FROM `stock_warehouse` WHERE code = ?',
      ['AGD'],
    )) as WarehouseRow[];

    const locations: Array<{
      name: string;
      zoneCode: string;
      usage: string;
    }> = [
      { name: 'Proveedor externo', zoneCode: 'EXT-PROV', usage: 'supplier' },
      { name: 'Cliente externo', zoneCode: 'EXT-CLI', usage: 'customer' },
      { name: 'Zona de depósito A', zoneCode: 'ZONA-A', usage: 'internal' },
    ];
    for (const location of locations) {
      await queryRunner.query(
        'INSERT INTO `stock_location` (`name`, `warehouse_id`, `usage`, `zone_code`, `active`) VALUES (?, ?, ?, ?, 1)',
        [location.name, warehouse.id, location.usage, location.zoneCode],
      );
    }

    const pickingTypes: Array<{ name: string; code: string }> = [
      { name: 'Recepción', code: 'incoming' },
      { name: 'Despacho', code: 'outgoing' },
      { name: 'Movimiento interno', code: 'internal' },
    ];
    for (const pickingType of pickingTypes) {
      await queryRunner.query(
        'INSERT INTO `stock_picking_type` (`name`, `code`, `warehouse_id`) VALUES (?, ?, ?)',
        [pickingType.name, pickingType.code, warehouse.id],
      );
    }

    const [adminGroup] = (await queryRunner.query(
      'SELECT id FROM `res_groups` WHERE code = ?',
      ['admin'],
    )) as Array<{ id: number }>;
    const [operadorAgdGroup] = (await queryRunner.query(
      'SELECT id FROM `res_groups` WHERE code = ?',
      ['operador_agd'],
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

    await queryRunner.query(
      'INSERT INTO `ir_model_access` (`group_id`, `model_name`, `perm_read`, `perm_write`, `perm_create`, `perm_unlink`) VALUES (?, ?, 1, 1, 1, 0)',
      [operadorAgdGroup.id, 'agd_wms_operation'],
    );
    await queryRunner.query(
      'INSERT INTO `ir_rule` (`group_id`, `model_name`, `scope`, `active`) VALUES (?, ?, ?, 1)',
      [operadorAgdGroup.id, 'agd_wms_operation', 'own'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM `ir_rule` WHERE model_name = ? AND group_id = (SELECT id FROM `res_groups` WHERE code = ?)',
      ['agd_wms_operation', 'operador_agd'],
    );
    await queryRunner.query(
      'DELETE FROM `ir_model_access` WHERE model_name = ? AND group_id = (SELECT id FROM `res_groups` WHERE code = ?)',
      ['agd_wms_operation', 'operador_agd'],
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
      'DELETE FROM `stock_picking_type` WHERE code IN (?, ?, ?)',
      ['incoming', 'outgoing', 'internal'],
    );
    await queryRunner.query(
      'DELETE FROM `stock_location` WHERE zone_code IN (?, ?, ?)',
      ['EXT-PROV', 'EXT-CLI', 'ZONA-A'],
    );
    await queryRunner.query('DELETE FROM `stock_warehouse` WHERE code = ?', [
      'AGD',
    ]);
    await queryRunner.query('DELETE FROM `ir_sequence` WHERE code = ?', [
      PICKING_SEQUENCE.code,
    ]);
  }
}
