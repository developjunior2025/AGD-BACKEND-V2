import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServices1783813200000 implements MigrationInterface {
  name = 'CreateServices1783813200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`agd_service_requirement\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`product_template_id\` int NOT NULL,
        \`document_requirement_id\` int NOT NULL,
        \`mandatory\` tinyint NOT NULL DEFAULT 1,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_service_requirement\` (\`product_template_id\`, \`document_requirement_id\`),
        CONSTRAINT \`FK_service_requirement_template\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_service_requirement_document\` FOREIGN KEY (\`document_requirement_id\`) REFERENCES \`agd_document_requirement\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_service_sla\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`product_template_id\` int NOT NULL,
        \`sla_rule_id\` int NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_service_sla\` (\`product_template_id\`, \`sla_rule_id\`),
        CONSTRAINT \`FK_service_sla_template\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_service_sla_rule\` FOREIGN KEY (\`sla_rule_id\`) REFERENCES \`agd_sla_rule\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_service_coverage\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`product_template_id\` int NOT NULL,
        \`zone\` varchar(128) NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_service_coverage\` (\`product_template_id\`, \`zone\`),
        CONSTRAINT \`FK_service_coverage_template\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_service_evidence_type\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_service_evidence_type_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_service_publication\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`product_template_id\` int NOT NULL,
        \`status\` enum('draft','published','unpublished') NOT NULL DEFAULT 'draft',
        \`published_at\` timestamp NULL,
        \`published_by_id\` int NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_service_publication_template\` (\`product_template_id\`),
        CONSTRAINT \`FK_service_publication_template\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_service_publication_version\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`service_publication_id\` int NOT NULL,
        \`version_number\` int NOT NULL,
        \`status\` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
        \`content\` text NOT NULL,
        \`published_at\` timestamp NULL,
        \`published_by_id\` int NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_service_publication_version\` (\`service_publication_id\`, \`version_number\`),
        CONSTRAINT \`FK_publication_version_publication\` FOREIGN KEY (\`service_publication_id\`) REFERENCES \`agd_service_publication\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `agd_service_publication_version`');
    await queryRunner.query('DROP TABLE `agd_service_publication`');
    await queryRunner.query('DROP TABLE `agd_service_evidence_type`');
    await queryRunner.query('DROP TABLE `agd_service_coverage`');
    await queryRunner.query('DROP TABLE `agd_service_sla`');
    await queryRunner.query('DROP TABLE `agd_service_requirement`');
  }
}
