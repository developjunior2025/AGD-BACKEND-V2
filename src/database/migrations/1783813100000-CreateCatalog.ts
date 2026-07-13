import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalog1783813100000 implements MigrationInterface {
  name = 'CreateCatalog1783813100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`product_category\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(128) NOT NULL,
        \`parent_id\` int NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_product_category_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`product_category\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`uom_category\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(64) NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`uom_uom\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(32) NOT NULL,
        \`category_id\` int NOT NULL,
        \`factor\` decimal(10,4) NOT NULL DEFAULT 1,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_uom_uom_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`uom_category\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`product_attribute\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(64) NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`product_attribute_value\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`attribute_id\` int NOT NULL,
        \`value\` varchar(64) NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_attribute_value_attribute\` FOREIGN KEY (\`attribute_id\`) REFERENCES \`product_attribute\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`product_template\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(255) NOT NULL,
        \`category_id\` int NOT NULL,
        \`uom_id\` int NOT NULL,
        \`description\` text NULL,
        \`provider_partner_id\` int NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_product_template_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`product_category\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_product_template_uom\` FOREIGN KEY (\`uom_id\`) REFERENCES \`uom_uom\` (\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_product_template_provider\` FOREIGN KEY (\`provider_partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`product_product\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`product_template_id\` int NOT NULL,
        \`sku\` varchar(64) NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_product_product_sku\` (\`sku\`),
        CONSTRAINT \`FK_product_product_template\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`product_product_attribute_value_rel\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`product_product_id\` int NOT NULL,
        \`attribute_value_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_ppav_rel\` (\`product_product_id\`, \`attribute_value_id\`),
        CONSTRAINT \`FK_ppav_product\` FOREIGN KEY (\`product_product_id\`) REFERENCES \`product_product\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_ppav_value\` FOREIGN KEY (\`attribute_value_id\`) REFERENCES \`product_attribute_value\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`product_pricelist\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(128) NOT NULL,
        \`currency_id\` int NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_pricelist_currency\` FOREIGN KEY (\`currency_id\`) REFERENCES \`res_currency\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`product_pricelist_item\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`pricelist_id\` int NOT NULL,
        \`product_template_id\` int NOT NULL,
        \`price\` decimal(18,2) NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_pricelist_item\` (\`pricelist_id\`, \`product_template_id\`),
        CONSTRAINT \`FK_pricelist_item_pricelist\` FOREIGN KEY (\`pricelist_id\`) REFERENCES \`product_pricelist\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_pricelist_item_template\` FOREIGN KEY (\`product_template_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`rating_rating\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`res_model\` varchar(128) NOT NULL,
        \`res_id\` int NOT NULL,
        \`rated_by_partner_id\` int NULL,
        \`score\` int NOT NULL,
        \`comment\` text NULL,
        \`rated_at\` timestamp NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_rating_rating_res\` (\`res_model\`, \`res_id\`),
        CONSTRAINT \`FK_rating_partner\` FOREIGN KEY (\`rated_by_partner_id\`) REFERENCES \`res_partner\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`resource_calendar\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(128) NOT NULL,
        \`service_id\` int NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_resource_calendar_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`product_template\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`resource_calendar_attendance\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`calendar_id\` int NOT NULL,
        \`day_of_week\` int NOT NULL,
        \`hour_from\` decimal(4,2) NOT NULL,
        \`hour_to\` decimal(4,2) NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_calendar_attendance_calendar\` FOREIGN KEY (\`calendar_id\`) REFERENCES \`resource_calendar\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `resource_calendar_attendance`');
    await queryRunner.query('DROP TABLE `resource_calendar`');
    await queryRunner.query('DROP TABLE `rating_rating`');
    await queryRunner.query('DROP TABLE `product_pricelist_item`');
    await queryRunner.query('DROP TABLE `product_pricelist`');
    await queryRunner.query('DROP TABLE `product_product_attribute_value_rel`');
    await queryRunner.query('DROP TABLE `product_product`');
    await queryRunner.query('DROP TABLE `product_template`');
    await queryRunner.query('DROP TABLE `product_attribute_value`');
    await queryRunner.query('DROP TABLE `product_attribute`');
    await queryRunner.query('DROP TABLE `uom_uom`');
    await queryRunner.query('DROP TABLE `uom_category`');
    await queryRunner.query('DROP TABLE `product_category`');
  }
}
