import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`expertises\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`version\` text,
  	\`category\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE INDEX \`expertises_updated_at_idx\` ON \`expertises\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`expertises_created_at_idx\` ON \`expertises\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`expertises__status_idx\` ON \`expertises\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`expertises_locales\` (
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`expertises\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`expertises_locales_locale_parent_id_unique\` ON \`expertises_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`expertises_locales_parent_id_idx\` ON \`expertises_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`expertises_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`case_studies_id\` integer,
  	\`notes_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`expertises\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`notes_id\`) REFERENCES \`notes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`expertises_rels_order_idx\` ON \`expertises_rels\` (\`order\`);`)
  await db.run(
    sql`CREATE INDEX \`expertises_rels_parent_idx\` ON \`expertises_rels\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`expertises_rels_path_idx\` ON \`expertises_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`expertises_rels_case_studies_id_idx\` ON \`expertises_rels\` (\`case_studies_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`expertises_rels_notes_id_idx\` ON \`expertises_rels\` (\`notes_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_expertises_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_name\` text,
  	\`version_version\` text,
  	\`version_category\` text,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`expertises\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_expertises_v_parent_idx\` ON \`_expertises_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_expertises_v_version_version_updated_at_idx\` ON \`_expertises_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_version_version_created_at_idx\` ON \`_expertises_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_version_version__status_idx\` ON \`_expertises_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_created_at_idx\` ON \`_expertises_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_updated_at_idx\` ON \`_expertises_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_snapshot_idx\` ON \`_expertises_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_published_locale_idx\` ON \`_expertises_v\` (\`published_locale\`);`,
  )
  await db.run(sql`CREATE INDEX \`_expertises_v_latest_idx\` ON \`_expertises_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_expertises_v_locales\` (
  	\`version_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_expertises_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_expertises_v_locales_locale_parent_id_unique\` ON \`_expertises_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_locales_parent_id_idx\` ON \`_expertises_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_expertises_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`case_studies_id\` integer,
  	\`notes_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_expertises_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`notes_id\`) REFERENCES \`notes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_expertises_v_rels_order_idx\` ON \`_expertises_v_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_rels_parent_idx\` ON \`_expertises_v_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_rels_path_idx\` ON \`_expertises_v_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_rels_case_studies_id_idx\` ON \`_expertises_v_rels\` (\`case_studies_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_expertises_v_rels_notes_id_idx\` ON \`_expertises_v_rels\` (\`notes_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`case_studies\` ADD \`kind\` text DEFAULT 'client';`)
  await db.run(sql`ALTER TABLE \`case_studies\` ADD \`status\` text DEFAULT 'live';`)
  await db.run(sql`ALTER TABLE \`case_studies\` ADD \`visual\` text DEFAULT 'cover';`)
  await db.run(sql`ALTER TABLE \`case_studies_locales\` ADD \`team\` text;`)
  await db.run(sql`ALTER TABLE \`_case_studies_v\` ADD \`version_kind\` text DEFAULT 'client';`)
  await db.run(sql`ALTER TABLE \`_case_studies_v\` ADD \`version_status\` text DEFAULT 'live';`)
  await db.run(sql`ALTER TABLE \`_case_studies_v\` ADD \`version_visual\` text DEFAULT 'cover';`)
  await db.run(sql`ALTER TABLE \`_case_studies_v_locales\` ADD \`version_team\` text;`)
  await db.run(sql`ALTER TABLE \`notes\` ADD \`featured\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_notes_v\` ADD \`version_featured\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`albums\` ADD \`category\` text DEFAULT 'enduro';`)
  await db.run(sql`ALTER TABLE \`albums_locales\` ADD \`place\` text;`)
  await db.run(sql`ALTER TABLE \`_albums_v\` ADD \`version_category\` text DEFAULT 'enduro';`)
  await db.run(sql`ALTER TABLE \`_albums_v_locales\` ADD \`version_place\` text;`)
  await db.run(
    sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`expertises_find\` integer DEFAULT false;`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`expertises_create\` integer DEFAULT false;`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_mcp_api_keys\` ADD \`expertises_update\` integer DEFAULT false;`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`expertises_id\` integer REFERENCES expertises(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_expertises_id_idx\` ON \`payload_locked_documents_rels\` (\`expertises_id\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`expertises\`;`)
  await db.run(sql`DROP TABLE \`expertises_locales\`;`)
  await db.run(sql`DROP TABLE \`expertises_rels\`;`)
  await db.run(sql`DROP TABLE \`_expertises_v\`;`)
  await db.run(sql`DROP TABLE \`_expertises_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_expertises_v_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`case_studies_id\` integer,
  	\`notes_id\` integer,
  	\`albums_id\` integer,
  	\`experiences_id\` integer,
  	\`skills_id\` integer,
  	\`payload_mcp_api_keys_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`notes_id\`) REFERENCES \`notes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`albums_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`experiences_id\`) REFERENCES \`experiences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`skills_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_mcp_api_keys_id\`) REFERENCES \`payload_mcp_api_keys\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "case_studies_id", "notes_id", "albums_id", "experiences_id", "skills_id", "payload_mcp_api_keys_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "case_studies_id", "notes_id", "albums_id", "experiences_id", "skills_id", "payload_mcp_api_keys_id" FROM \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_case_studies_id_idx\` ON \`payload_locked_documents_rels\` (\`case_studies_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_notes_id_idx\` ON \`payload_locked_documents_rels\` (\`notes_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_albums_id_idx\` ON \`payload_locked_documents_rels\` (\`albums_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_experiences_id_idx\` ON \`payload_locked_documents_rels\` (\`experiences_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_skills_id_idx\` ON \`payload_locked_documents_rels\` (\`skills_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_payload_mcp_api_keys_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_mcp_api_keys_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`case_studies\` DROP COLUMN \`kind\`;`)
  await db.run(sql`ALTER TABLE \`case_studies\` DROP COLUMN \`status\`;`)
  await db.run(sql`ALTER TABLE \`case_studies\` DROP COLUMN \`visual\`;`)
  await db.run(sql`ALTER TABLE \`case_studies_locales\` DROP COLUMN \`team\`;`)
  await db.run(sql`ALTER TABLE \`_case_studies_v\` DROP COLUMN \`version_kind\`;`)
  await db.run(sql`ALTER TABLE \`_case_studies_v\` DROP COLUMN \`version_status\`;`)
  await db.run(sql`ALTER TABLE \`_case_studies_v\` DROP COLUMN \`version_visual\`;`)
  await db.run(sql`ALTER TABLE \`_case_studies_v_locales\` DROP COLUMN \`version_team\`;`)
  await db.run(sql`ALTER TABLE \`notes\` DROP COLUMN \`featured\`;`)
  await db.run(sql`ALTER TABLE \`_notes_v\` DROP COLUMN \`version_featured\`;`)
  await db.run(sql`ALTER TABLE \`albums\` DROP COLUMN \`category\`;`)
  await db.run(sql`ALTER TABLE \`albums_locales\` DROP COLUMN \`place\`;`)
  await db.run(sql`ALTER TABLE \`_albums_v\` DROP COLUMN \`version_category\`;`)
  await db.run(sql`ALTER TABLE \`_albums_v_locales\` DROP COLUMN \`version_place\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`expertises_find\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`expertises_create\`;`)
  await db.run(sql`ALTER TABLE \`payload_mcp_api_keys\` DROP COLUMN \`expertises_update\`;`)
}
