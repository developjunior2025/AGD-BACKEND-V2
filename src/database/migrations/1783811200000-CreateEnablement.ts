import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnablement1783811200000 implements MigrationInterface {
  name = 'CreateEnablement1783811200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`agd_user_enablement_request\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`partner_id\` int NOT NULL,
        \`requested_group_id\` int NOT NULL,
        \`status\` enum('in_review','active','rejected') NOT NULL DEFAULT 'in_review',
        \`current_step\` int NOT NULL DEFAULT 1,
        \`user_id\` int NULL,
        \`submitted_at\` timestamp NOT NULL,
        \`decided_at\` timestamp NULL,
        \`decided_by_id\` int NULL,
        \`rejection_reason\` text NULL,
        \`rejected_at_step\` int NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_enablement_request_user\` (\`user_id\`),
        KEY \`IDX_enablement_request_partner\` (\`partner_id\`),
        CONSTRAINT \`FK_enablement_request_partner\` FOREIGN KEY (\`partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_enablement_request_group\` FOREIGN KEY (\`requested_group_id\`) REFERENCES \`res_groups\` (\`id\`),
        CONSTRAINT \`FK_enablement_request_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`res_users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_user_enablement_step\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`request_id\` int NOT NULL,
        \`step_number\` int NOT NULL,
        \`step_code\` enum(
          'solicitud','verificacion','validacion_documentos','asignacion_perfil',
          'asignacion_roles','creacion_cuenta','cambio_password','capacitacion','activacion'
        ) NOT NULL,
        \`status\` enum('pending','done') NOT NULL DEFAULT 'pending',
        \`completed_at\` timestamp NULL,
        \`completed_by_id\` int NULL,
        \`notes\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_enablement_step\` (\`request_id\`, \`step_code\`),
        CONSTRAINT \`FK_enablement_step_request\` FOREIGN KEY (\`request_id\`) REFERENCES \`agd_user_enablement_request\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_policy_acceptance\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`partner_id\` int NOT NULL,
        \`policy_code\` enum('terms','privacy','security') NOT NULL,
        \`policy_version\` varchar(32) NOT NULL,
        \`accepted_at\` timestamp NOT NULL,
        \`ip_address\` varchar(64) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_policy_acceptance\` (\`partner_id\`, \`policy_code\`, \`policy_version\`),
        CONSTRAINT \`FK_policy_acceptance_partner\` FOREIGN KEY (\`partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_user_training_acceptance\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`user_id\` int NOT NULL,
        \`group_id\` int NOT NULL,
        \`accepted_at\` timestamp NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_training_acceptance_user\` (\`user_id\`),
        CONSTRAINT \`FK_training_acceptance_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`res_users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_training_acceptance_group\` FOREIGN KEY (\`group_id\`) REFERENCES \`res_groups\` (\`id\`)
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `agd_user_training_acceptance`');
    await queryRunner.query('DROP TABLE `agd_policy_acceptance`');
    await queryRunner.query('DROP TABLE `agd_user_enablement_step`');
    await queryRunner.query('DROP TABLE `agd_user_enablement_request`');
  }
}
