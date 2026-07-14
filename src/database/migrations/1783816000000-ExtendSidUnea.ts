import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendSidUnea1783816000000 implements MigrationInterface {
  name = 'ExtendSidUnea1783816000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `agd_sidunea_dua` ADD COLUMN `customs_declaration_id` int NULL AFTER `case_id`',
    );

    await queryRunner.query(`
      CREATE TABLE \`agd_sidunea_customs_regime\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(32) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_sidunea_customs_regime_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_sidunea_dua_item\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`sidunea_dua_id\` int NOT NULL,
        \`description\` varchar(255) NOT NULL,
        \`tariff_code\` varchar(32) NULL,
        \`quantity\` decimal(12,2) NOT NULL DEFAULT 1,
        \`value\` decimal(18,2) NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_sidunea_dua_item_dua\` FOREIGN KEY (\`sidunea_dua_id\`) REFERENCES \`agd_sidunea_dua\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_sidunea_modai_inspection\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`inspection_number\` varchar(64) NOT NULL,
        \`scheduled_at\` timestamp NULL,
        \`result\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        \`notes\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_sidunea_modai_inspection_number\` (\`inspection_number\`),
        CONSTRAINT \`FK_sidunea_modai_case\` FOREIGN KEY (\`case_id\`) REFERENCES \`agd_case\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_sidunea_tax_simulation\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`simulated_at\` timestamp NOT NULL,
        \`estimated_taxes\` decimal(18,2) NOT NULL,
        \`currency_id\` int NOT NULL,
        \`breakdown\` text NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_sidunea_tax_simulation_case\` FOREIGN KEY (\`case_id\`) REFERENCES \`agd_case\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_sidunea_tax_simulation_currency\` FOREIGN KEY (\`currency_id\`) REFERENCES \`res_currency\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `agd_sidunea_tax_simulation`');
    await queryRunner.query('DROP TABLE `agd_sidunea_modai_inspection`');
    await queryRunner.query('DROP TABLE `agd_sidunea_dua_item`');
    await queryRunner.query('DROP TABLE `agd_sidunea_customs_regime`');
    await queryRunner.query(
      'ALTER TABLE `agd_sidunea_dua` DROP COLUMN `customs_declaration_id`',
    );
  }
}
