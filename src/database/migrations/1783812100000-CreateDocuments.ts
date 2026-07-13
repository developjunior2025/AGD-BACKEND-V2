import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocuments1783812100000 implements MigrationInterface {
  name = 'CreateDocuments1783812100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`documents_folder\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(128) NOT NULL,
        \`parent_id\` int NULL,
        \`case_id\` int NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_documents_folder_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`documents_folder\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`documents_tag\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(64) NOT NULL,
        \`color\` varchar(16) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_documents_tag_name\` (\`name\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`documents_document\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(255) NOT NULL,
        \`folder_id\` int NULL,
        \`attachment_id\` int NULL,
        \`res_model\` varchar(128) NULL,
        \`res_id\` int NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_documents_document_res\` (\`res_model\`, \`res_id\`),
        CONSTRAINT \`FK_documents_document_folder\` FOREIGN KEY (\`folder_id\`) REFERENCES \`documents_folder\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_documents_document_attachment\` FOREIGN KEY (\`attachment_id\`) REFERENCES \`ir_attachment\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`documents_document_tag_rel\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`document_id\` int NOT NULL,
        \`tag_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_documents_document_tag_rel\` (\`document_id\`, \`tag_id\`),
        CONSTRAINT \`FK_ddtr_document\` FOREIGN KEY (\`document_id\`) REFERENCES \`documents_document\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_ddtr_tag\` FOREIGN KEY (\`tag_id\`) REFERENCES \`documents_tag\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_document_status\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`document_id\` int NOT NULL,
        \`status\` enum('pending','submitted','approved','rejected') NOT NULL DEFAULT 'pending',
        \`reviewed_at\` timestamp NULL,
        \`reviewed_by_id\` int NULL,
        \`notes\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_document_status_document\` (\`document_id\`),
        CONSTRAINT \`FK_document_status_document\` FOREIGN KEY (\`document_id\`) REFERENCES \`documents_document\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_document_relation\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`source_document_id\` int NOT NULL,
        \`target_document_id\` int NOT NULL,
        \`relation_type\` enum('amends','replaces','supports') NOT NULL,
        \`notes\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_document_relation\` (\`source_document_id\`, \`target_document_id\`, \`relation_type\`),
        CONSTRAINT \`FK_document_relation_source\` FOREIGN KEY (\`source_document_id\`) REFERENCES \`documents_document\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_document_relation_target\` FOREIGN KEY (\`target_document_id\`) REFERENCES \`documents_document\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_document_requirement\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`mandatory\` tinyint NOT NULL DEFAULT 1,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_document_requirement_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_document_checklist\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`res_model\` varchar(128) NOT NULL,
        \`res_id\` int NOT NULL,
        \`document_requirement_id\` int NOT NULL,
        \`fulfilled\` tinyint NOT NULL DEFAULT 0,
        \`document_id\` int NULL,
        \`due_at\` timestamp NULL,
        \`notes\` text NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_agd_document_checklist_res\` (\`res_model\`, \`res_id\`),
        UNIQUE KEY \`UQ_agd_document_checklist\` (\`res_model\`, \`res_id\`, \`document_requirement_id\`),
        CONSTRAINT \`FK_checklist_requirement\` FOREIGN KEY (\`document_requirement_id\`) REFERENCES \`agd_document_requirement\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_checklist_document\` FOREIGN KEY (\`document_id\`) REFERENCES \`documents_document\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `agd_document_checklist`');
    await queryRunner.query('DROP TABLE `agd_document_requirement`');
    await queryRunner.query('DROP TABLE `agd_document_relation`');
    await queryRunner.query('DROP TABLE `agd_document_status`');
    await queryRunner.query('DROP TABLE `documents_document_tag_rel`');
    await queryRunner.query('DROP TABLE `documents_document`');
    await queryRunner.query('DROP TABLE `documents_tag`');
    await queryRunner.query('DROP TABLE `documents_folder`');
  }
}
