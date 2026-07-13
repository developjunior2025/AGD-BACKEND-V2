import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBilling1783815000000 implements MigrationInterface {
  name = 'CreateBilling1783815000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`account_move\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`partner_id\` int NOT NULL,
        \`sale_order_id\` int NULL,
        \`move_type\` enum('out_invoice','out_refund') NOT NULL DEFAULT 'out_invoice',
        \`state\` enum('draft','posted','cancelled') NOT NULL DEFAULT 'draft',
        \`currency_id\` int NOT NULL,
        \`amount_total\` decimal(18,2) NOT NULL,
        \`invoice_date\` date NULL,
        \`due_date\` date NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_account_move_sale_order\` (\`sale_order_id\`),
        CONSTRAINT \`FK_account_move_partner\` FOREIGN KEY (\`partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_account_move_currency\` FOREIGN KEY (\`currency_id\`) REFERENCES \`res_currency\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`account_move_line\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`account_move_id\` int NOT NULL,
        \`sale_order_line_id\` int NULL,
        \`description\` varchar(255) NOT NULL,
        \`quantity\` decimal(12,2) NOT NULL DEFAULT 1,
        \`unit_price\` decimal(18,2) NOT NULL,
        \`subtotal\` decimal(18,2) NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_account_move_line_move\` FOREIGN KEY (\`account_move_id\`) REFERENCES \`account_move\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`account_payment\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`account_move_id\` int NOT NULL,
        \`amount\` decimal(18,2) NOT NULL,
        \`payment_date\` timestamp NOT NULL,
        \`method\` varchar(32) NULL,
        \`state\` enum('draft','posted') NOT NULL DEFAULT 'posted',
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_account_payment_move\` FOREIGN KEY (\`account_move_id\`) REFERENCES \`account_move\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `account_payment`');
    await queryRunner.query('DROP TABLE `account_move_line`');
    await queryRunner.query('DROP TABLE `account_move`');
  }
}
