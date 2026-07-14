import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWarehouse1783817000000 implements MigrationInterface {
  name = 'CreateWarehouse1783817000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`stock_warehouse\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(128) NOT NULL,
        \`code\` varchar(16) NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_stock_warehouse_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_location\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(128) NOT NULL,
        \`warehouse_id\` int NULL,
        \`parent_id\` int NULL,
        \`usage\` enum('internal','customer','supplier','inventory','view') NOT NULL DEFAULT 'internal',
        \`zone_code\` varchar(32) NULL,
        \`slot_code\` varchar(32) NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_stock_location_warehouse\` FOREIGN KEY (\`warehouse_id\`) REFERENCES \`stock_warehouse\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_stock_location_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`stock_location\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_picking_type\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(128) NOT NULL,
        \`code\` enum('incoming','outgoing','internal') NOT NULL,
        \`warehouse_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_stock_picking_type_warehouse\` FOREIGN KEY (\`warehouse_id\`) REFERENCES \`stock_warehouse\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_picking\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`reference\` varchar(32) NOT NULL,
        \`picking_type_id\` int NOT NULL,
        \`case_id\` int NULL,
        \`manifest_number\` varchar(64) NULL,
        \`bl_number\` varchar(64) NULL,
        \`state\` enum('draft','waiting','assigned','done','cancelled') NOT NULL DEFAULT 'draft',
        \`scheduled_date\` timestamp NULL,
        \`done_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_stock_picking_reference\` (\`reference\`),
        KEY \`IDX_stock_picking_case\` (\`case_id\`),
        CONSTRAINT \`FK_stock_picking_type\` FOREIGN KEY (\`picking_type_id\`) REFERENCES \`stock_picking_type\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_lot\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(64) NOT NULL,
        \`product_template_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_stock_lot_name\` (\`name\`),
        CONSTRAINT \`FK_stock_lot_product\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_package_type\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(64) NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_quant_package\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(64) NOT NULL,
        \`package_type_id\` int NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_stock_quant_package_name\` (\`name\`),
        CONSTRAINT \`FK_stock_quant_package_type\` FOREIGN KEY (\`package_type_id\`) REFERENCES \`stock_package_type\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_move\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`picking_id\` int NOT NULL,
        \`product_template_id\` int NOT NULL,
        \`quantity\` decimal(12,2) NOT NULL,
        \`source_location_id\` int NOT NULL,
        \`dest_location_id\` int NOT NULL,
        \`state\` enum('draft','confirmed','done','cancelled') NOT NULL DEFAULT 'draft',
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_stock_move_picking\` FOREIGN KEY (\`picking_id\`) REFERENCES \`stock_picking\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_stock_move_product\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_stock_move_source_location\` FOREIGN KEY (\`source_location_id\`) REFERENCES \`stock_location\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_stock_move_dest_location\` FOREIGN KEY (\`dest_location_id\`) REFERENCES \`stock_location\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_move_line\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`move_id\` int NOT NULL,
        \`lot_id\` int NULL,
        \`package_id\` int NULL,
        \`quantity\` decimal(12,2) NOT NULL,
        \`location_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_stock_move_line_move\` FOREIGN KEY (\`move_id\`) REFERENCES \`stock_move\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_stock_move_line_lot\` FOREIGN KEY (\`lot_id\`) REFERENCES \`stock_lot\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_stock_move_line_package\` FOREIGN KEY (\`package_id\`) REFERENCES \`stock_quant_package\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_stock_move_line_location\` FOREIGN KEY (\`location_id\`) REFERENCES \`stock_location\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_quant\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`product_template_id\` int NOT NULL,
        \`location_id\` int NOT NULL,
        \`lot_id\` int NULL,
        \`package_id\` int NULL,
        \`case_id\` int NULL,
        \`quantity\` decimal(12,2) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_stock_quant_case\` (\`case_id\`),
        CONSTRAINT \`FK_stock_quant_product\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_stock_quant_location\` FOREIGN KEY (\`location_id\`) REFERENCES \`stock_location\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_stock_quant_lot\` FOREIGN KEY (\`lot_id\`) REFERENCES \`stock_lot\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_stock_quant_package\` FOREIGN KEY (\`package_id\`) REFERENCES \`stock_quant_package\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `stock_quant`');
    await queryRunner.query('DROP TABLE `stock_move_line`');
    await queryRunner.query('DROP TABLE `stock_move`');
    await queryRunner.query('DROP TABLE `stock_quant_package`');
    await queryRunner.query('DROP TABLE `stock_package_type`');
    await queryRunner.query('DROP TABLE `stock_lot`');
    await queryRunner.query('DROP TABLE `stock_picking`');
    await queryRunner.query('DROP TABLE `stock_picking_type`');
    await queryRunner.query('DROP TABLE `stock_location`');
    await queryRunner.query('DROP TABLE `stock_warehouse`');
  }
}
