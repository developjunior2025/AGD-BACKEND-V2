import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCases1783812300000 implements MigrationInterface {
  name = 'CreateCases1783812300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`agd_case\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` varchar(32) NOT NULL,
        \`owner_partner_id\` int NOT NULL,
        \`profile_group_id\` int NOT NULL,
        \`status\` enum('open','in_progress','closed','cancelled') NOT NULL DEFAULT 'open',
        \`description\` text NULL,
        \`opened_at\` timestamp NOT NULL,
        \`closed_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_case_code\` (\`code\`),
        CONSTRAINT \`FK_case_owner_partner\` FOREIGN KEY (\`owner_partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_case_profile_group\` FOREIGN KEY (\`profile_group_id\`) REFERENCES \`res_groups\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_case_party\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`partner_id\` int NOT NULL,
        \`role\` enum('owner','counterpart','agent','transporter','consultant') NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_case_party\` (\`case_id\`, \`partner_id\`, \`role\`),
        CONSTRAINT \`FK_case_party_case\` FOREIGN KEY (\`case_id\`) REFERENCES \`agd_case\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_case_party_partner\` FOREIGN KEY (\`partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_case_semaphore\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`color\` enum('green','yellow','red') NOT NULL DEFAULT 'green',
        \`reason\` text NULL,
        \`due_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_case_semaphore_case\` (\`case_id\`),
        CONSTRAINT \`FK_case_semaphore_case\` FOREIGN KEY (\`case_id\`) REFERENCES \`agd_case\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `agd_case_semaphore`');
    await queryRunner.query('DROP TABLE `agd_case_party`');
    await queryRunner.query('DROP TABLE `agd_case`');
  }
}
