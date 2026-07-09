import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdentityCore1783811000000 implements MigrationInterface {
  name = 'CreateIdentityCore1783811000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`res_partner\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`kind\` enum('individual','company') NOT NULL,
        \`first_name\` varchar(128) NULL,
        \`last_name\` varchar(128) NULL,
        \`legal_name\` varchar(255) NULL,
        \`rif\` varchar(16) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`phone\` varchar(32) NULL,
        \`address\` varchar(255) NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_res_partner_rif\` (\`rif\`),
        UNIQUE KEY \`UQ_res_partner_email\` (\`email\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`res_users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`partner_id\` int NOT NULL,
        \`login\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`must_change_password\` tinyint NOT NULL DEFAULT 1,
        \`active\` tinyint NOT NULL DEFAULT 0,
        \`failed_login_attempts\` int NOT NULL DEFAULT 0,
        \`locked_until\` timestamp NULL,
        \`last_login_at\` timestamp NULL,
        \`password_reset_token_hash\` varchar(255) NULL,
        \`password_reset_expires_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_res_users_login\` (\`login\`),
        UNIQUE KEY \`UQ_res_users_partner_id\` (\`partner_id\`),
        CONSTRAINT \`FK_res_users_partner\` FOREIGN KEY (\`partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`res_groups\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(64) NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`description\` text NULL,
        \`is_enablement_profile\` tinyint NOT NULL DEFAULT 1,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_res_groups_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`res_groups_users_rel\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`user_id\` int NOT NULL,
        \`group_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_res_groups_users_rel\` (\`user_id\`, \`group_id\`),
        CONSTRAINT \`FK_rgur_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`res_users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_rgur_group\` FOREIGN KEY (\`group_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`ir_model_access\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`group_id\` int NOT NULL,
        \`model_name\` varchar(128) NOT NULL,
        \`perm_read\` tinyint NOT NULL DEFAULT 0,
        \`perm_write\` tinyint NOT NULL DEFAULT 0,
        \`perm_create\` tinyint NOT NULL DEFAULT 0,
        \`perm_unlink\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_ir_model_access\` (\`group_id\`, \`model_name\`),
        CONSTRAINT \`FK_ima_group\` FOREIGN KEY (\`group_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`ir_rule\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`group_id\` int NOT NULL,
        \`model_name\` varchar(128) NOT NULL,
        \`scope\` enum('own','company','all') NOT NULL DEFAULT 'own',
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_ir_rule\` (\`group_id\`, \`model_name\`),
        CONSTRAINT \`FK_ir_rule_group\` FOREIGN KEY (\`group_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`ir_config_parameter\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`key\` varchar(128) NOT NULL,
        \`value\` text NOT NULL,
        \`description\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_ir_config_parameter_key\` (\`key\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`ir_attachment\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`res_model\` varchar(128) NOT NULL,
        \`res_id\` int NOT NULL,
        \`file_name\` varchar(255) NOT NULL,
        \`mime_type\` varchar(128) NOT NULL,
        \`size_bytes\` int NOT NULL,
        \`storage_key\` varchar(512) NOT NULL,
        \`uploaded_by_id\` int NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_ir_attachment_res\` (\`res_model\`, \`res_id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`mail_message\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`res_model\` varchar(128) NOT NULL,
        \`res_id\` int NOT NULL,
        \`message_type\` enum('audit','note','notification') NOT NULL DEFAULT 'note',
        \`subject\` varchar(255) NULL,
        \`body\` text NOT NULL,
        \`author_id\` int NULL,
        \`ip_address\` varchar(64) NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_mail_message_res\` (\`res_model\`, \`res_id\`)
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `mail_message`');
    await queryRunner.query('DROP TABLE `ir_attachment`');
    await queryRunner.query('DROP TABLE `ir_config_parameter`');
    await queryRunner.query('DROP TABLE `ir_rule`');
    await queryRunner.query('DROP TABLE `ir_model_access`');
    await queryRunner.query('DROP TABLE `res_groups_users_rel`');
    await queryRunner.query('DROP TABLE `res_groups`');
    await queryRunner.query('DROP TABLE `res_users`');
    await queryRunner.query('DROP TABLE `res_partner`');
  }
}
