import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSidUnea1783814000000 implements MigrationInterface {
  name = 'CreateSidUnea1783814000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`agd_sidunea_mirror_record\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`record_type\` enum('dua','manifest','exit_pass','regime','inspection','tax_simulation') NOT NULL,
        \`reference_number\` varchar(64) NOT NULL,
        \`mirrored_at\` timestamp NOT NULL,
        \`raw_payload\` text NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_sidunea_mirror_record_case\` (\`case_id\`),
        CONSTRAINT \`FK_sidunea_mirror_case\` FOREIGN KEY (\`case_id\`) REFERENCES \`agd_case\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_sidunea_dua\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`dua_number\` varchar(64) NOT NULL,
        \`status\` enum('registered','in_review','cleared','rejected') NOT NULL DEFAULT 'registered',
        \`registered_at\` timestamp NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_sidunea_dua_number\` (\`dua_number\`),
        CONSTRAINT \`FK_sidunea_dua_case\` FOREIGN KEY (\`case_id\`) REFERENCES \`agd_case\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_sidunea_modcar_manifest\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`manifest_number\` varchar(64) NOT NULL,
        \`carrier_name\` varchar(128) NULL,
        \`arrival_date\` date NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_sidunea_manifest_number\` (\`manifest_number\`),
        CONSTRAINT \`FK_sidunea_manifest_case\` FOREIGN KEY (\`case_id\`) REFERENCES \`agd_case\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_sidunea_modshd_exit_pass\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`case_id\` int NOT NULL,
        \`exit_pass_number\` varchar(64) NOT NULL,
        \`issued_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_sidunea_exit_pass_number\` (\`exit_pass_number\`),
        CONSTRAINT \`FK_sidunea_exit_pass_case\` FOREIGN KEY (\`case_id\`) REFERENCES \`agd_case\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `agd_sidunea_modshd_exit_pass`');
    await queryRunner.query('DROP TABLE `agd_sidunea_modcar_manifest`');
    await queryRunner.query('DROP TABLE `agd_sidunea_dua`');
    await queryRunner.query('DROP TABLE `agd_sidunea_mirror_record`');
  }
}
