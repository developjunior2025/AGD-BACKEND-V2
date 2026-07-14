import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWms1783817100000 implements MigrationInterface {
  name = 'CreateWms1783817100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`agd_wms_receipt_discrepancy\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`stock_picking_id\` int NOT NULL,
        \`discrepancy_type\` enum('shortage','excess','damage','other') NOT NULL,
        \`description\` text NOT NULL,
        \`quantity\` decimal(12,2) NULL,
        \`resolved_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_wms_receipt_discrepancy_picking\` FOREIGN KEY (\`stock_picking_id\`) REFERENCES \`stock_picking\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_wms_custody_record\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`location_id\` int NOT NULL,
        \`start_at\` timestamp NOT NULL,
        \`end_at\` timestamp NULL,
        \`status\` enum('active','released') NOT NULL DEFAULT 'active',
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_wms_custody_record_location\` FOREIGN KEY (\`location_id\`) REFERENCES \`stock_location\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_wms_storage_period\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`start_date\` date NOT NULL,
        \`legal_deadline\` date NOT NULL,
        \`extended_deadline\` date NULL,
        \`status\` enum('within_period','overdue') NOT NULL DEFAULT 'within_period',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_wms_storage_period_case\` (\`case_id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_wms_weighing_ticket\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`stock_picking_id\` int NULL,
        \`gross_weight\` decimal(12,2) NOT NULL,
        \`tare_weight\` decimal(12,2) NULL,
        \`net_weight\` decimal(12,2) NOT NULL,
        \`weighed_at\` timestamp NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_wms_consolidation_order\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`status\` enum('draft','in_progress','done') NOT NULL DEFAULT 'draft',
        \`notes\` text NULL,
        \`completed_at\` timestamp NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_wms_deconsolidation_order\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`status\` enum('draft','in_progress','done') NOT NULL DEFAULT 'draft',
        \`notes\` text NULL,
        \`completed_at\` timestamp NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_wms_cargo_handling_task\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`task_type\` enum('loading','unloading','relocation','other') NOT NULL,
        \`assigned_to_user_id\` int NULL,
        \`status\` enum('pending','in_progress','done') NOT NULL DEFAULT 'pending',
        \`scheduled_at\` timestamp NULL,
        \`completed_at\` timestamp NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_discrepancy_matrix\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`total_discrepancies\` int NOT NULL DEFAULT 0,
        \`status\` enum('pending','reconciled') NOT NULL DEFAULT 'pending',
        \`reconciled_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_discrepancy_matrix_case\` (\`case_id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_discrepancy_item\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`discrepancy_matrix_id\` int NOT NULL,
        \`sidunea_reference\` varchar(64) NULL,
        \`description\` text NOT NULL,
        \`quantity_difference\` decimal(12,2) NULL,
        \`resolved\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_discrepancy_item_matrix\` FOREIGN KEY (\`discrepancy_matrix_id\`) REFERENCES \`agd_discrepancy_matrix\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `agd_discrepancy_item`');
    await queryRunner.query('DROP TABLE `agd_discrepancy_matrix`');
    await queryRunner.query('DROP TABLE `agd_wms_cargo_handling_task`');
    await queryRunner.query('DROP TABLE `agd_wms_deconsolidation_order`');
    await queryRunner.query('DROP TABLE `agd_wms_consolidation_order`');
    await queryRunner.query('DROP TABLE `agd_wms_weighing_ticket`');
    await queryRunner.query('DROP TABLE `agd_wms_storage_period`');
    await queryRunner.query('DROP TABLE `agd_wms_custody_record`');
    await queryRunner.query('DROP TABLE `agd_wms_receipt_discrepancy`');
  }
}
