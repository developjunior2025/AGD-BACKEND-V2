import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthSession1783811100000 implements MigrationInterface {
  name = 'CreateAuthSession1783811100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`agd_auth_session\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`user_id\` int NOT NULL,
        \`secret_hash\` varchar(255) NOT NULL,
        \`user_agent\` varchar(255) NULL,
        \`ip_address\` varchar(64) NULL,
        \`expires_at\` timestamp NOT NULL,
        \`revoked_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_agd_auth_session_user\` (\`user_id\`),
        CONSTRAINT \`FK_agd_auth_session_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`res_users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `agd_auth_session`');
  }
}
