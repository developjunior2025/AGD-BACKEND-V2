import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConfig1783812000000 implements MigrationInterface {
  name = 'CreateConfig1783812000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`res_currency\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(3) NOT NULL,
        \`name\` varchar(64) NOT NULL,
        \`symbol\` varchar(8) NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_res_currency_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`res_currency_rate\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`currency_id\` int NOT NULL,
        \`rate_date\` date NOT NULL,
        \`rate\` decimal(18,6) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_res_currency_rate\` (\`currency_id\`, \`rate_date\`),
        CONSTRAINT \`FK_currency_rate_currency\` FOREIGN KEY (\`currency_id\`) REFERENCES \`res_currency\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`account_tax\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(32) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`percentage\` decimal(5,2) NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_account_tax_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`mail_template\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`subject\` varchar(255) NOT NULL,
        \`body\` text NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_mail_template_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_tariff_rule\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`currency_id\` int NULL,
        \`amount\` decimal(18,2) NULL,
        \`percentage\` decimal(5,2) NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_tariff_rule_code\` (\`code\`),
        CONSTRAINT \`FK_tariff_rule_currency\` FOREIGN KEY (\`currency_id\`) REFERENCES \`res_currency\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_sla_rule\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`duration_hours\` int NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_sla_rule_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_deadline_rule\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`days_to_deadline\` int NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_deadline_rule_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_external_integration_reference\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`base_url\` varchar(255) NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_external_integration_reference_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`ir_sequence\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`prefix\` varchar(32) NULL,
        \`padding\` int NOT NULL DEFAULT 6,
        \`last_number\` int NOT NULL DEFAULT 0,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_ir_sequence_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `ir_sequence`');
    await queryRunner.query('DROP TABLE `agd_external_integration_reference`');
    await queryRunner.query('DROP TABLE `agd_deadline_rule`');
    await queryRunner.query('DROP TABLE `agd_sla_rule`');
    await queryRunner.query('DROP TABLE `agd_tariff_rule`');
    await queryRunner.query('DROP TABLE `mail_template`');
    await queryRunner.query('DROP TABLE `account_tax`');
    await queryRunner.query('DROP TABLE `res_currency_rate`');
    await queryRunner.query('DROP TABLE `res_currency`');
  }
}
