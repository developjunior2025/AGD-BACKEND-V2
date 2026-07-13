import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGovernance1783812200000 implements MigrationInterface {
  name = 'CreateGovernance1783812200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`ir_model\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`model_name\` varchar(128) NOT NULL,
        \`display_name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_ir_model_model_name\` (\`model_name\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`ir_model_fields\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`model_id\` int NOT NULL,
        \`field_name\` varchar(128) NOT NULL,
        \`field_label\` varchar(128) NOT NULL,
        \`field_type\` varchar(32) NOT NULL,
        \`required\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_ir_model_fields\` (\`model_id\`, \`field_name\`),
        CONSTRAINT \`FK_model_fields_model\` FOREIGN KEY (\`model_id\`) REFERENCES \`ir_model\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_governance_matrix\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_governance_matrix_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_governance_matrix_version\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`governance_matrix_id\` int NOT NULL,
        \`version_number\` int NOT NULL,
        \`status\` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
        \`content\` text NOT NULL,
        \`published_at\` timestamp NULL,
        \`published_by_id\` int NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_governance_matrix_version\` (\`governance_matrix_id\`, \`version_number\`),
        CONSTRAINT \`FK_matrix_version_matrix\` FOREIGN KEY (\`governance_matrix_id\`) REFERENCES \`agd_governance_matrix\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_document_profile_matrix\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`group_id\` int NOT NULL,
        \`document_requirement_id\` int NOT NULL,
        \`mandatory\` tinyint NOT NULL DEFAULT 1,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_document_profile_matrix\` (\`group_id\`, \`document_requirement_id\`),
        CONSTRAINT \`FK_dpm_group\` FOREIGN KEY (\`group_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_dpm_requirement\` FOREIGN KEY (\`document_requirement_id\`) REFERENCES \`agd_document_requirement\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_process_raci_matrix\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_process_raci_matrix_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_raci_assignment\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`process_raci_matrix_id\` int NOT NULL,
        \`group_id\` int NOT NULL,
        \`role\` enum('responsible','accountable','consulted','informed') NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_raci_assignment\` (\`process_raci_matrix_id\`, \`group_id\`),
        CONSTRAINT \`FK_raci_process\` FOREIGN KEY (\`process_raci_matrix_id\`) REFERENCES \`agd_process_raci_matrix\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_raci_group\` FOREIGN KEY (\`group_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_segregation_rule\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`group_a_id\` int NOT NULL,
        \`group_b_id\` int NOT NULL,
        \`description\` text NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_segregation_rule\` (\`group_a_id\`, \`group_b_id\`),
        CONSTRAINT \`FK_segregation_group_a\` FOREIGN KEY (\`group_a_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_segregation_group_b\` FOREIGN KEY (\`group_b_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_escalation_matrix\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`from_group_id\` int NOT NULL,
        \`to_group_id\` int NOT NULL,
        \`after_hours\` int NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_escalation_matrix_code\` (\`code\`),
        CONSTRAINT \`FK_escalation_from_group\` FOREIGN KEY (\`from_group_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_escalation_to_group\` FOREIGN KEY (\`to_group_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_governance_workflow\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`approver_group_id\` int NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_governance_workflow_code\` (\`code\`),
        CONSTRAINT \`FK_workflow_approver_group\` FOREIGN KEY (\`approver_group_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_governance_workflow_instance\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`governance_workflow_id\` int NOT NULL,
        \`res_model\` varchar(128) NOT NULL,
        \`res_id\` int NOT NULL,
        \`status\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        \`started_at\` timestamp NOT NULL,
        \`completed_at\` timestamp NULL,
        \`decided_by_id\` int NULL,
        \`notes\` text NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_workflow_instance_res\` (\`res_model\`, \`res_id\`),
        CONSTRAINT \`FK_workflow_instance_workflow\` FOREIGN KEY (\`governance_workflow_id\`) REFERENCES \`agd_governance_workflow\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`mail_activity\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`res_model\` varchar(128) NOT NULL,
        \`res_id\` int NOT NULL,
        \`activity_type\` enum('approval','task','reminder') NOT NULL,
        \`summary\` varchar(255) NOT NULL,
        \`assigned_to_group_id\` int NULL,
        \`assigned_to_user_id\` int NULL,
        \`due_at\` timestamp NULL,
        \`status\` enum('pending','done','cancelled') NOT NULL DEFAULT 'pending',
        \`done_at\` timestamp NULL,
        \`done_by_id\` int NULL,
        \`decision\` enum('approve','reject') NULL,
        \`notes\` text NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_mail_activity_res\` (\`res_model\`, \`res_id\`),
        CONSTRAINT \`FK_activity_group\` FOREIGN KEY (\`assigned_to_group_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_activity_user\` FOREIGN KEY (\`assigned_to_user_id\`) REFERENCES \`res_users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `mail_activity`');
    await queryRunner.query('DROP TABLE `agd_governance_workflow_instance`');
    await queryRunner.query('DROP TABLE `agd_governance_workflow`');
    await queryRunner.query('DROP TABLE `agd_escalation_matrix`');
    await queryRunner.query('DROP TABLE `agd_segregation_rule`');
    await queryRunner.query('DROP TABLE `agd_raci_assignment`');
    await queryRunner.query('DROP TABLE `agd_process_raci_matrix`');
    await queryRunner.query('DROP TABLE `agd_document_profile_matrix`');
    await queryRunner.query('DROP TABLE `agd_governance_matrix_version`');
    await queryRunner.query('DROP TABLE `agd_governance_matrix`');
    await queryRunner.query('DROP TABLE `ir_model_fields`');
    await queryRunner.query('DROP TABLE `ir_model`');
  }
}
