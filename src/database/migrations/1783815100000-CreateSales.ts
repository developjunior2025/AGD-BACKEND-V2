import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSales1783815100000 implements MigrationInterface {
  name = 'CreateSales1783815100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`sale_order\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`partner_id\` int NOT NULL,
        \`provider_partner_id\` int NOT NULL,
        \`quote_request_id\` int NULL,
        \`order_type\` enum('quote','contract') NOT NULL DEFAULT 'quote',
        \`state\` enum('draft','sent','confirmed','done','cancelled') NOT NULL DEFAULT 'draft',
        \`currency_id\` int NOT NULL,
        \`amount_total\` decimal(18,2) NOT NULL DEFAULT 0,
        \`confirmed_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_sale_order_quote_request\` (\`quote_request_id\`),
        CONSTRAINT \`FK_sale_order_partner\` FOREIGN KEY (\`partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_sale_order_provider\` FOREIGN KEY (\`provider_partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_sale_order_currency\` FOREIGN KEY (\`currency_id\`) REFERENCES \`res_currency\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`sale_order_line\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`sale_order_id\` int NOT NULL,
        \`product_template_id\` int NOT NULL,
        \`quantity\` decimal(12,2) NOT NULL DEFAULT 1,
        \`unit_price\` decimal(18,2) NOT NULL,
        \`subtotal\` decimal(18,2) NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_sale_order_line_order\` FOREIGN KEY (\`sale_order_id\`) REFERENCES \`sale_order\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_sale_order_line_template\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_quote_request\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`requester_partner_id\` int NOT NULL,
        \`category_id\` int NULL,
        \`description\` text NULL,
        \`status\` enum('open','compared','closed','cancelled') NOT NULL DEFAULT 'open',
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_quote_request_requester\` FOREIGN KEY (\`requester_partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_quote_request_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`product_category\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_quote_request_line\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`quote_request_id\` int NOT NULL,
        \`product_template_id\` int NULL,
        \`quantity\` int NOT NULL DEFAULT 1,
        \`notes\` text NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_quote_request_line_request\` FOREIGN KEY (\`quote_request_id\`) REFERENCES \`agd_quote_request\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_quote_request_line_template\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_quote_comparison\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`quote_request_id\` int NOT NULL,
        \`selected_sale_order_id\` int NULL,
        \`compared_at\` timestamp NULL,
        \`notes\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_quote_comparison_request\` (\`quote_request_id\`),
        CONSTRAINT \`FK_quote_comparison_request\` FOREIGN KEY (\`quote_request_id\`) REFERENCES \`agd_quote_request\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_quote_comparison_order\` FOREIGN KEY (\`selected_sale_order_id\`) REFERENCES \`sale_order\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_service_cart\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`partner_id\` int NOT NULL,
        \`status\` enum('open','checked_out','abandoned') NOT NULL DEFAULT 'open',
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_service_cart_partner\` FOREIGN KEY (\`partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_service_cart_item\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`cart_id\` int NOT NULL,
        \`product_template_id\` int NOT NULL,
        \`quantity\` int NOT NULL DEFAULT 1,
        \`unit_price_snapshot\` decimal(18,2) NOT NULL,
        \`currency_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_service_cart_item\` (\`cart_id\`, \`product_template_id\`),
        CONSTRAINT \`FK_cart_item_cart\` FOREIGN KEY (\`cart_id\`) REFERENCES \`agd_service_cart\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_cart_item_template\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_cart_item_currency\` FOREIGN KEY (\`currency_id\`) REFERENCES \`res_currency\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `agd_service_cart_item`');
    await queryRunner.query('DROP TABLE `agd_service_cart`');
    await queryRunner.query('DROP TABLE `agd_quote_comparison`');
    await queryRunner.query('DROP TABLE `agd_quote_request_line`');
    await queryRunner.query('DROP TABLE `agd_quote_request`');
    await queryRunner.query('DROP TABLE `sale_order_line`');
    await queryRunner.query('DROP TABLE `sale_order`');
  }
}
