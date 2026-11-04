import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`media_locales\` (
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_locales_parent_id_idx\` ON \`media_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`case_studies_metrics\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`case_studies_metrics_order_idx\` ON \`case_studies_metrics\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`case_studies_metrics_parent_id_idx\` ON \`case_studies_metrics\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`case_studies_metrics_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies_metrics\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`case_studies_metrics_locales_locale_parent_id_unique\` ON \`case_studies_metrics_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`case_studies_metrics_locales_parent_id_idx\` ON \`case_studies_metrics_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`case_studies\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`period_start\` text,
  	\`period_end\` text,
  	\`cover_id\` integer,
  	\`diagram_id\` integer,
  	\`slug\` text,
  	\`featured\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`diagram_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`case_studies_cover_idx\` ON \`case_studies\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX \`case_studies_diagram_idx\` ON \`case_studies\` (\`diagram_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`case_studies_slug_idx\` ON \`case_studies\` (\`slug\`);`)
  await db.run(
    sql`CREATE INDEX \`case_studies_updated_at_idx\` ON \`case_studies\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`case_studies_created_at_idx\` ON \`case_studies\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`case_studies__status_idx\` ON \`case_studies\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`case_studies_locales\` (
  	\`title\` text,
  	\`summary\` text,
  	\`sector\` text,
  	\`role\` text,
  	\`context\` text,
  	\`challenge\` text,
  	\`work\` text,
  	\`result\` text,
  	\`learnings\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`case_studies_meta_meta_image_idx\` ON \`case_studies_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`case_studies_locales_locale_parent_id_unique\` ON \`case_studies_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`case_studies_locales_parent_id_idx\` ON \`case_studies_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`case_studies_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`skills_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`skills_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`case_studies_rels_order_idx\` ON \`case_studies_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`case_studies_rels_parent_idx\` ON \`case_studies_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`case_studies_rels_path_idx\` ON \`case_studies_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`case_studies_rels_skills_id_idx\` ON \`case_studies_rels\` (\`skills_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_case_studies_v_version_metrics\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_metrics_order_idx\` ON \`_case_studies_v_version_metrics\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_metrics_parent_id_idx\` ON \`_case_studies_v_version_metrics\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_case_studies_v_version_metrics_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v_version_metrics\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_case_studies_v_version_metrics_locales_locale_parent_id_uni\` ON \`_case_studies_v_version_metrics_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_metrics_locales_parent_id_idx\` ON \`_case_studies_v_version_metrics_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_case_studies_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_period_start\` text,
  	\`version_period_end\` text,
  	\`version_cover_id\` integer,
  	\`version_diagram_id\` integer,
  	\`version_slug\` text,
  	\`version_featured\` integer DEFAULT false,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_diagram_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_parent_idx\` ON \`_case_studies_v\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_version_cover_idx\` ON \`_case_studies_v\` (\`version_cover_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_version_diagram_idx\` ON \`_case_studies_v\` (\`version_diagram_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_version_slug_idx\` ON \`_case_studies_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_version_updated_at_idx\` ON \`_case_studies_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_version_created_at_idx\` ON \`_case_studies_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_version__status_idx\` ON \`_case_studies_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_created_at_idx\` ON \`_case_studies_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_updated_at_idx\` ON \`_case_studies_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_snapshot_idx\` ON \`_case_studies_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_published_locale_idx\` ON \`_case_studies_v\` (\`published_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_latest_idx\` ON \`_case_studies_v\` (\`latest\`);`,
  )
  await db.run(sql`CREATE TABLE \`_case_studies_v_locales\` (
  	\`version_title\` text,
  	\`version_summary\` text,
  	\`version_sector\` text,
  	\`version_role\` text,
  	\`version_context\` text,
  	\`version_challenge\` text,
  	\`version_work\` text,
  	\`version_result\` text,
  	\`version_learnings\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_meta_version_meta_image_idx\` ON \`_case_studies_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`_case_studies_v_locales_locale_parent_id_unique\` ON \`_case_studies_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_locales_parent_id_idx\` ON \`_case_studies_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_case_studies_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`skills_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_case_studies_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`skills_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_rels_order_idx\` ON \`_case_studies_v_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_rels_parent_idx\` ON \`_case_studies_v_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_rels_path_idx\` ON \`_case_studies_v_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_rels_skills_id_idx\` ON \`_case_studies_v_rels\` (\`skills_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`notes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cover_id\` integer,
  	\`slug\` text,
  	\`published_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`notes_cover_idx\` ON \`notes\` (\`cover_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`notes_slug_idx\` ON \`notes\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`notes_updated_at_idx\` ON \`notes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`notes_created_at_idx\` ON \`notes\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`notes__status_idx\` ON \`notes\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`notes_locales\` (
  	\`title\` text,
  	\`excerpt\` text,
  	\`body\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`notes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`notes_meta_meta_image_idx\` ON \`notes_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`notes_locales_locale_parent_id_unique\` ON \`notes_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`notes_locales_parent_id_idx\` ON \`notes_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`notes_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`notes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`notes_texts_order_parent\` ON \`notes_texts\` (\`order\`,\`parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_notes_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_cover_id\` integer,
  	\`version_slug\` text,
  	\`version_published_at\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`notes\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_notes_v_parent_idx\` ON \`_notes_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_notes_v_version_version_cover_idx\` ON \`_notes_v\` (\`version_cover_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_notes_v_version_version_slug_idx\` ON \`_notes_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_notes_v_version_version_updated_at_idx\` ON \`_notes_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_notes_v_version_version_created_at_idx\` ON \`_notes_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_notes_v_version_version__status_idx\` ON \`_notes_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_notes_v_created_at_idx\` ON \`_notes_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_notes_v_updated_at_idx\` ON \`_notes_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_notes_v_snapshot_idx\` ON \`_notes_v\` (\`snapshot\`);`)
  await db.run(
    sql`CREATE INDEX \`_notes_v_published_locale_idx\` ON \`_notes_v\` (\`published_locale\`);`,
  )
  await db.run(sql`CREATE INDEX \`_notes_v_latest_idx\` ON \`_notes_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_notes_v_locales\` (
  	\`version_title\` text,
  	\`version_excerpt\` text,
  	\`version_body\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_notes_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_notes_v_version_meta_version_meta_image_idx\` ON \`_notes_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`_notes_v_locales_locale_parent_id_unique\` ON \`_notes_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_notes_v_locales_parent_id_idx\` ON \`_notes_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_notes_v_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_notes_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_notes_v_texts_order_parent\` ON \`_notes_v_texts\` (\`order\`,\`parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`albums\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`season\` numeric,
  	\`cover_id\` integer,
  	\`slug\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`albums_cover_idx\` ON \`albums\` (\`cover_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`albums_slug_idx\` ON \`albums\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`albums_updated_at_idx\` ON \`albums\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`albums_created_at_idx\` ON \`albums\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`albums__status_idx\` ON \`albums\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`albums_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`albums_meta_meta_image_idx\` ON \`albums_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`albums_locales_locale_parent_id_unique\` ON \`albums_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`albums_locales_parent_id_idx\` ON \`albums_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`albums_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`albums_rels_order_idx\` ON \`albums_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`albums_rels_parent_idx\` ON \`albums_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_rels_path_idx\` ON \`albums_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`albums_rels_media_id_idx\` ON \`albums_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_albums_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_season\` numeric,
  	\`version_cover_id\` integer,
  	\`version_slug\` text,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_albums_v_parent_idx\` ON \`_albums_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_albums_v_version_version_cover_idx\` ON \`_albums_v\` (\`version_cover_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_albums_v_version_version_slug_idx\` ON \`_albums_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_albums_v_version_version_updated_at_idx\` ON \`_albums_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_albums_v_version_version_created_at_idx\` ON \`_albums_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_albums_v_version_version__status_idx\` ON \`_albums_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_albums_v_created_at_idx\` ON \`_albums_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_updated_at_idx\` ON \`_albums_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_albums_v_snapshot_idx\` ON \`_albums_v\` (\`snapshot\`);`)
  await db.run(
    sql`CREATE INDEX \`_albums_v_published_locale_idx\` ON \`_albums_v\` (\`published_locale\`);`,
  )
  await db.run(sql`CREATE INDEX \`_albums_v_latest_idx\` ON \`_albums_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_albums_v_locales\` (
  	\`version_title\` text,
  	\`version_description\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_albums_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_albums_v_version_meta_version_meta_image_idx\` ON \`_albums_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`_albums_v_locales_locale_parent_id_unique\` ON \`_albums_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_albums_v_locales_parent_id_idx\` ON \`_albums_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_albums_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_albums_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_albums_v_rels_order_idx\` ON \`_albums_v_rels\` (\`order\`);`)
  await db.run(
    sql`CREATE INDEX \`_albums_v_rels_parent_idx\` ON \`_albums_v_rels\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`_albums_v_rels_path_idx\` ON \`_albums_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_albums_v_rels_media_id_idx\` ON \`_albums_v_rels\` (\`media_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`experiences_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`experiences\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`experiences_highlights_order_idx\` ON \`experiences_highlights\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`experiences_highlights_parent_id_idx\` ON \`experiences_highlights\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`experiences_highlights_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`experiences_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`experiences_highlights_locales_locale_parent_id_unique\` ON \`experiences_highlights_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`experiences_highlights_locales_parent_id_idx\` ON \`experiences_highlights_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`experiences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'job',
  	\`organization\` text,
  	\`start\` text,
  	\`end\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(
    sql`CREATE INDEX \`experiences_updated_at_idx\` ON \`experiences\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`experiences_created_at_idx\` ON \`experiences\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`experiences__status_idx\` ON \`experiences\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`experiences_locales\` (
  	\`location\` text,
  	\`role\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`experiences\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`experiences_locales_locale_parent_id_unique\` ON \`experiences_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`experiences_locales_parent_id_idx\` ON \`experiences_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`experiences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`case_studies_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`experiences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`experiences_rels_order_idx\` ON \`experiences_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`experiences_rels_parent_idx\` ON \`experiences_rels\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`experiences_rels_path_idx\` ON \`experiences_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`experiences_rels_case_studies_id_idx\` ON \`experiences_rels\` (\`case_studies_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_experiences_v_version_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_experiences_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_experiences_v_version_highlights_order_idx\` ON \`_experiences_v_version_highlights\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_version_highlights_parent_id_idx\` ON \`_experiences_v_version_highlights\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_experiences_v_version_highlights_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_experiences_v_version_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_experiences_v_version_highlights_locales_locale_parent_id_u\` ON \`_experiences_v_version_highlights_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_version_highlights_locales_parent_id_idx\` ON \`_experiences_v_version_highlights_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_experiences_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_kind\` text DEFAULT 'job',
  	\`version_organization\` text,
  	\`version_start\` text,
  	\`version_end\` text,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`experiences\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_experiences_v_parent_idx\` ON \`_experiences_v\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_version_version_updated_at_idx\` ON \`_experiences_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_version_version_created_at_idx\` ON \`_experiences_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_version_version__status_idx\` ON \`_experiences_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_created_at_idx\` ON \`_experiences_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_updated_at_idx\` ON \`_experiences_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_snapshot_idx\` ON \`_experiences_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_published_locale_idx\` ON \`_experiences_v\` (\`published_locale\`);`,
  )
  await db.run(sql`CREATE INDEX \`_experiences_v_latest_idx\` ON \`_experiences_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_experiences_v_locales\` (
  	\`version_location\` text,
  	\`version_role\` text,
  	\`version_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_experiences_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_experiences_v_locales_locale_parent_id_unique\` ON \`_experiences_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_locales_parent_id_idx\` ON \`_experiences_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_experiences_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`case_studies_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_experiences_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`case_studies_id\`) REFERENCES \`case_studies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_experiences_v_rels_order_idx\` ON \`_experiences_v_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_rels_parent_idx\` ON \`_experiences_v_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_rels_path_idx\` ON \`_experiences_v_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_experiences_v_rels_case_studies_id_idx\` ON \`_experiences_v_rels\` (\`case_studies_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`skills\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`category\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`skills_name_idx\` ON \`skills\` (\`name\`);`)
  await db.run(sql`CREATE INDEX \`skills_updated_at_idx\` ON \`skills\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`skills_created_at_idx\` ON \`skills\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`skills__status_idx\` ON \`skills\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_skills_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_name\` text,
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_skills_v_parent_idx\` ON \`_skills_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_skills_v_version_version_name_idx\` ON \`_skills_v\` (\`version_name\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_skills_v_version_version_updated_at_idx\` ON \`_skills_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_skills_v_version_version_created_at_idx\` ON \`_skills_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_skills_v_version_version__status_idx\` ON \`_skills_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_skills_v_created_at_idx\` ON \`_skills_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_skills_v_updated_at_idx\` ON \`_skills_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_skills_v_snapshot_idx\` ON \`_skills_v\` (\`snapshot\`);`)
  await db.run(
    sql`CREATE INDEX \`_skills_v_published_locale_idx\` ON \`_skills_v\` (\`published_locale\`);`,
  )
  await db.run(sql`CREATE INDEX \`_skills_v_latest_idx\` ON \`_skills_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`payload_mcp_api_keys\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`label\` text,
  	\`description\` text,
  	\`case_studies_find\` integer DEFAULT false,
  	\`case_studies_create\` integer DEFAULT false,
  	\`case_studies_update\` integer DEFAULT false,
  	\`notes_find\` integer DEFAULT false,
  	\`notes_create\` integer DEFAULT false,
  	\`notes_update\` integer DEFAULT false,
  	\`albums_find\` integer DEFAULT false,
  	\`albums_create\` integer DEFAULT false,
  	\`albums_update\` integer DEFAULT false,
  	\`experiences_find\` integer DEFAULT false,
  	\`experiences_create\` integer DEFAULT false,
  	\`experiences_update\` integer DEFAULT false,
  	\`skills_find\` integer DEFAULT false,
  	\`skills_create\` integer DEFAULT false,
  	\`skills_update\` integer DEFAULT false,
  	\`media_find\` integer DEFAULT false,
  	\`profile_find\` integer DEFAULT false,
  	\`profile_update\` integer DEFAULT false,
  	\`site_settings_find\` integer DEFAULT false,
  	\`site_settings_update\` integer DEFAULT false,
  	\`payload_mcp_tool_write_rich_text\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`enable_a_p_i_key\` integer,
  	\`api_key\` text,
  	\`api_key_index\` text,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_user_idx\` ON \`payload_mcp_api_keys\` (\`user_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_updated_at_idx\` ON \`payload_mcp_api_keys\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_created_at_idx\` ON \`payload_mcp_api_keys\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE TABLE \`profile_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`kind\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profile\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profile_links_order_idx\` ON \`profile_links\` (\`_order\`);`)
  await db.run(
    sql`CREATE INDEX \`profile_links_parent_id_idx\` ON \`profile_links\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`profile_links_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profile_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`profile_links_locales_locale_parent_id_unique\` ON \`profile_links_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`profile_links_locales_parent_id_idx\` ON \`profile_links_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`profile_languages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profile\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`profile_languages_order_idx\` ON \`profile_languages\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`profile_languages_parent_id_idx\` ON \`profile_languages\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`profile_languages_locales\` (
  	\`language\` text,
  	\`level\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profile_languages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`profile_languages_locales_locale_parent_id_unique\` ON \`profile_languages_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`profile_languages_locales_parent_id_idx\` ON \`profile_languages_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`profile_certifications\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`issuer\` text,
  	\`date\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profile\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`profile_certifications_order_idx\` ON \`profile_certifications\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`profile_certifications_parent_id_idx\` ON \`profile_certifications\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`profile\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`avatar_id\` integer,
  	\`email\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`profile_avatar_idx\` ON \`profile\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`profile__status_idx\` ON \`profile\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`profile_locales\` (
  	\`location\` text,
  	\`headline\` text,
  	\`bio\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profile\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`profile_meta_meta_image_idx\` ON \`profile_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`profile_locales_locale_parent_id_unique\` ON \`profile_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`profile_locales_parent_id_idx\` ON \`profile_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_profile_v_version_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profile_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_links_order_idx\` ON \`_profile_v_version_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_links_parent_id_idx\` ON \`_profile_v_version_links\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_profile_v_version_links_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profile_v_version_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_profile_v_version_links_locales_locale_parent_id_unique\` ON \`_profile_v_version_links_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_links_locales_parent_id_idx\` ON \`_profile_v_version_links_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_profile_v_version_languages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profile_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_languages_order_idx\` ON \`_profile_v_version_languages\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_languages_parent_id_idx\` ON \`_profile_v_version_languages\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_profile_v_version_languages_locales\` (
  	\`language\` text,
  	\`level\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profile_v_version_languages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_profile_v_version_languages_locales_locale_parent_id_unique\` ON \`_profile_v_version_languages_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_languages_locales_parent_id_idx\` ON \`_profile_v_version_languages_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_profile_v_version_certifications\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`issuer\` text,
  	\`date\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profile_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_certifications_order_idx\` ON \`_profile_v_version_certifications\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_certifications_parent_id_idx\` ON \`_profile_v_version_certifications\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_profile_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_name\` text,
  	\`version_avatar_id\` integer,
  	\`version_email\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_version_avatar_idx\` ON \`_profile_v\` (\`version_avatar_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_version__status_idx\` ON \`_profile_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_profile_v_created_at_idx\` ON \`_profile_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_updated_at_idx\` ON \`_profile_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_snapshot_idx\` ON \`_profile_v\` (\`snapshot\`);`)
  await db.run(
    sql`CREATE INDEX \`_profile_v_published_locale_idx\` ON \`_profile_v\` (\`published_locale\`);`,
  )
  await db.run(sql`CREATE INDEX \`_profile_v_latest_idx\` ON \`_profile_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_profile_v_locales\` (
  	\`version_location\` text,
  	\`version_headline\` text,
  	\`version_bio\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profile_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_meta_version_meta_image_idx\` ON \`_profile_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`_profile_v_locales_locale_parent_id_unique\` ON \`_profile_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_profile_v_locales_parent_id_idx\` ON \`_profile_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`default_og_image_id\` integer,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`default_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`site_settings_default_og_image_idx\` ON \`site_settings\` (\`default_og_image_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`site_settings__status_idx\` ON \`site_settings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`default_title\` text,
  	\`default_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`site_settings_locales_parent_id_idx\` ON \`site_settings_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_site_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_default_og_image_id\` integer,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_default_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_version_version_default_og_image_idx\` ON \`_site_settings_v\` (\`version_default_og_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_version_version__status_idx\` ON \`_site_settings_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_snapshot_idx\` ON \`_site_settings_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_published_locale_idx\` ON \`_site_settings_v\` (\`published_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_latest_idx\` ON \`_site_settings_v\` (\`latest\`);`,
  )
  await db.run(sql`CREATE TABLE \`_site_settings_v_locales\` (
  	\`version_default_title\` text,
  	\`version_default_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_site_settings_v_locales_locale_parent_id_unique\` ON \`_site_settings_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_locales_parent_id_idx\` ON \`_site_settings_v_locales\` (\`_parent_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`media\` ADD \`cloudinary_public_id\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`blur_data_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`_objectkey\` text;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`alt\`;`)
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`case_studies_id\` integer REFERENCES case_studies(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`notes_id\` integer REFERENCES notes(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`albums_id\` integer REFERENCES albums(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`experiences_id\` integer REFERENCES experiences(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`skills_id\` integer REFERENCES skills(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`payload_mcp_api_keys_id\` integer REFERENCES payload_mcp_api_keys(id);`,
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
  await db.run(
    sql`ALTER TABLE \`payload_preferences_rels\` ADD \`payload_mcp_api_keys_id\` integer REFERENCES payload_mcp_api_keys(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_payload_mcp_api_keys_id_idx\` ON \`payload_preferences_rels\` (\`payload_mcp_api_keys_id\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`case_studies_metrics\`;`)
  await db.run(sql`DROP TABLE \`case_studies_metrics_locales\`;`)
  await db.run(sql`DROP TABLE \`case_studies\`;`)
  await db.run(sql`DROP TABLE \`case_studies_locales\`;`)
  await db.run(sql`DROP TABLE \`case_studies_rels\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_version_metrics\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_version_metrics_locales\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_rels\`;`)
  await db.run(sql`DROP TABLE \`notes\`;`)
  await db.run(sql`DROP TABLE \`notes_locales\`;`)
  await db.run(sql`DROP TABLE \`notes_texts\`;`)
  await db.run(sql`DROP TABLE \`_notes_v\`;`)
  await db.run(sql`DROP TABLE \`_notes_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_notes_v_texts\`;`)
  await db.run(sql`DROP TABLE \`albums\`;`)
  await db.run(sql`DROP TABLE \`albums_locales\`;`)
  await db.run(sql`DROP TABLE \`albums_rels\`;`)
  await db.run(sql`DROP TABLE \`_albums_v\`;`)
  await db.run(sql`DROP TABLE \`_albums_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_albums_v_rels\`;`)
  await db.run(sql`DROP TABLE \`experiences_highlights\`;`)
  await db.run(sql`DROP TABLE \`experiences_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`experiences\`;`)
  await db.run(sql`DROP TABLE \`experiences_locales\`;`)
  await db.run(sql`DROP TABLE \`experiences_rels\`;`)
  await db.run(sql`DROP TABLE \`_experiences_v_version_highlights\`;`)
  await db.run(sql`DROP TABLE \`_experiences_v_version_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`_experiences_v\`;`)
  await db.run(sql`DROP TABLE \`_experiences_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_experiences_v_rels\`;`)
  await db.run(sql`DROP TABLE \`skills\`;`)
  await db.run(sql`DROP TABLE \`_skills_v\`;`)
  await db.run(sql`DROP TABLE \`payload_mcp_api_keys\`;`)
  await db.run(sql`DROP TABLE \`profile_links\`;`)
  await db.run(sql`DROP TABLE \`profile_links_locales\`;`)
  await db.run(sql`DROP TABLE \`profile_languages\`;`)
  await db.run(sql`DROP TABLE \`profile_languages_locales\`;`)
  await db.run(sql`DROP TABLE \`profile_certifications\`;`)
  await db.run(sql`DROP TABLE \`profile\`;`)
  await db.run(sql`DROP TABLE \`profile_locales\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_version_links\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_version_links_locales\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_version_languages\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_version_languages_locales\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_version_certifications\`;`)
  await db.run(sql`DROP TABLE \`_profile_v\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_locales\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`,
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
  await db.run(sql`CREATE TABLE \`__new_payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_preferences_rels\`("id", "order", "parent_id", "path", "users_id") SELECT "id", "order", "parent_id", "path", "users_id" FROM \`payload_preferences_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_preferences_rels\` RENAME TO \`payload_preferences_rels\`;`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`media\` ADD \`alt\` text NOT NULL DEFAULT '';`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`cloudinary_public_id\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`blur_data_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`_objectkey\`;`)
}
