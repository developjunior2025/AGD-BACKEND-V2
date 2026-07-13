import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHome1783813000000 implements MigrationInterface {
  name = 'CreateHome1783813000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`website\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(128) NOT NULL,
        \`domain\` varchar(255) NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`website_page\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`website_id\` int NOT NULL,
        \`slug\` varchar(128) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`body\` text NOT NULL,
        \`page_type\` enum('generic','notice','faq') NOT NULL DEFAULT 'generic',
        \`is_published\` tinyint NOT NULL DEFAULT 0,
        \`published_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_website_page\` (\`website_id\`, \`slug\`),
        CONSTRAINT \`FK_website_page_website\` FOREIGN KEY (\`website_id\`) REFERENCES \`website\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`website_menu\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`website_id\` int NOT NULL,
        \`label\` varchar(128) NOT NULL,
        \`parent_id\` int NULL,
        \`page_id\` int NULL,
        \`is_external\` tinyint NOT NULL DEFAULT 0,
        \`external_url\` varchar(255) NULL,
        \`sequence\` int NOT NULL DEFAULT 0,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_website_menu_website\` FOREIGN KEY (\`website_id\`) REFERENCES \`website\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_website_menu_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`website_menu\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_website_menu_page\` FOREIGN KEY (\`page_id\`) REFERENCES \`website_page\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`website_visitor\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`session_token\` varchar(64) NOT NULL,
        \`first_visit_at\` timestamp NOT NULL,
        \`last_visit_at\` timestamp NOT NULL,
        \`ip_address\` varchar(64) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_website_visitor_session\` (\`session_token\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`website_track\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`visitor_id\` int NOT NULL,
        \`url\` varchar(255) NOT NULL,
        \`visited_at\` timestamp NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_website_track_visitor\` (\`visitor_id\`),
        CONSTRAINT \`FK_website_track_visitor\` FOREIGN KEY (\`visitor_id\`) REFERENCES \`website_visitor\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_legal_policy\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`code\` enum('terms','privacy','security') NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_legal_policy_code\` (\`code\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_legal_policy_version\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`legal_policy_id\` int NOT NULL,
        \`version_label\` varchar(32) NOT NULL,
        \`content\` text NOT NULL,
        \`status\` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
        \`published_at\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_legal_policy_version\` (\`legal_policy_id\`, \`version_label\`),
        CONSTRAINT \`FK_legal_policy_version_policy\` FOREIGN KEY (\`legal_policy_id\`) REFERENCES \`agd_legal_policy\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`agd_portal_version\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`version_label\` varchar(32) NOT NULL,
        \`release_notes\` text NULL,
        \`released_at\` timestamp NOT NULL,
        \`active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_agd_portal_version_label\` (\`version_label\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`crm_lead\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        \`name\` varchar(128) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`phone\` varchar(32) NULL,
        \`message\` text NULL,
        \`source\` varchar(64) NULL,
        \`status\` enum('new','contacted','converted','discarded') NOT NULL DEFAULT 'new',
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `crm_lead`');
    await queryRunner.query('DROP TABLE `agd_portal_version`');
    await queryRunner.query('DROP TABLE `agd_legal_policy_version`');
    await queryRunner.query('DROP TABLE `agd_legal_policy`');
    await queryRunner.query('DROP TABLE `website_track`');
    await queryRunner.query('DROP TABLE `website_visitor`');
    await queryRunner.query('DROP TABLE `website_menu`');
    await queryRunner.query('DROP TABLE `website_page`');
    await queryRunner.query('DROP TABLE `website`');
  }
}
