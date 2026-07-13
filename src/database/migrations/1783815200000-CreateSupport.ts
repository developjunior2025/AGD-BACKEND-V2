import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupport1783815200000 implements MigrationInterface {
  name = 'CreateSupport1783815200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`helpdesk_ticket\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`partner_id\` int NOT NULL,
        \`subject\` varchar(255) NOT NULL,
        \`description\` text NOT NULL,
        \`status\` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
        \`resolved_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_helpdesk_ticket_partner\` FOREIGN KEY (\`partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `helpdesk_ticket`');
  }
}
