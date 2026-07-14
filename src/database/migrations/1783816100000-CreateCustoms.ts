import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustoms1783816100000 implements MigrationInterface {
  name = 'CreateCustoms1783816100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`agd_customs_license\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`partner_id\` int NOT NULL,
        \`license_number\` varchar(64) NOT NULL,
        \`issued_at\` date NOT NULL,
        \`expires_at\` date NULL,
        \`status\` enum('active','suspended','revoked','expired') NOT NULL DEFAULT 'active',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_customs_license_partner\` (\`partner_id\`),
        CONSTRAINT \`FK_customs_license_partner\` FOREIGN KEY (\`partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_customs_declaration\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`customs_agent_partner_id\` int NOT NULL,
        \`status\` enum('draft','submitted','in_review','cleared','rejected') NOT NULL DEFAULT 'draft',
        \`description\` text NULL,
        \`declared_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_customs_declaration_case\` FOREIGN KEY (\`case_id\`) REFERENCES \`agd_case\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_customs_declaration_agent\` FOREIGN KEY (\`customs_agent_partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_customs_declaration_item\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`customs_declaration_id\` int NOT NULL,
        \`description\` varchar(255) NOT NULL,
        \`tariff_code\` varchar(32) NULL,
        \`quantity\` decimal(12,2) NOT NULL DEFAULT 1,
        \`unit_value\` decimal(18,2) NOT NULL,
        \`subtotal\` decimal(18,2) NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_declaration_item_declaration\` FOREIGN KEY (\`customs_declaration_id\`) REFERENCES \`agd_customs_declaration\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_customs_regime_assignment\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`customs_declaration_id\` int NOT NULL,
        \`customs_regime_id\` int NOT NULL,
        \`assigned_at\` timestamp NOT NULL,
        \`assigned_by_id\` int NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_regime_assignment_declaration\` (\`customs_declaration_id\`),
        CONSTRAINT \`FK_regime_assignment_declaration\` FOREIGN KEY (\`customs_declaration_id\`) REFERENCES \`agd_customs_declaration\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_regime_assignment_regime\` FOREIGN KEY (\`customs_regime_id\`) REFERENCES \`agd_sidunea_customs_regime\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_customs_tax_liquidation\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`customs_declaration_id\` int NOT NULL,
        \`total_taxes\` decimal(18,2) NOT NULL,
        \`total_duties\` decimal(18,2) NULL,
        \`currency_id\` int NOT NULL,
        \`calculated_at\` timestamp NOT NULL,
        \`details\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_tax_liquidation_declaration\` (\`customs_declaration_id\`),
        CONSTRAINT \`FK_tax_liquidation_declaration\` FOREIGN KEY (\`customs_declaration_id\`) REFERENCES \`agd_customs_declaration\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_tax_liquidation_currency\` FOREIGN KEY (\`currency_id\`) REFERENCES \`res_currency\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `agd_customs_tax_liquidation`');
    await queryRunner.query('DROP TABLE `agd_customs_regime_assignment`');
    await queryRunner.query('DROP TABLE `agd_customs_declaration_item`');
    await queryRunner.query('DROP TABLE `agd_customs_declaration`');
    await queryRunner.query('DROP TABLE `agd_customs_license`');
  }
}
