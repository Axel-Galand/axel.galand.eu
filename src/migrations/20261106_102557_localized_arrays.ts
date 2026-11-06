import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// Highlights, metrics and profile languages become one list per language; profile links become
// shared with a plain label. Their per-language texts are dropped first, and the localized tables
// gain a NOT NULL `_locale` column, which SQLite only adds to an empty table. Without transactions
// a failure halfway would lose texts, so stop before any change if a row exists (none did in
// production on 2026-11-06).
const arrayTables = [
  'case_studies_metrics',
  '_case_studies_v_version_metrics',
  'experiences_highlights',
  '_experiences_v_version_highlights',
  'profile_links',
  '_profile_v_version_links',
  'profile_languages',
  '_profile_v_version_languages',
]

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  for (const table of arrayTables) {
    const row = await db.get<{ n: number }>(sql.raw(`SELECT count(*) AS n FROM \`${table}\``))

    if (Number(row?.n) > 0) {
      throw new Error(
        `localized_arrays: ${table} has ${row?.n} rows; this migration only runs on empty arrays`,
      )
    }
  }

  await db.run(sql`DROP TABLE \`case_studies_metrics_locales\`;`)
  await db.run(sql`DROP TABLE \`_case_studies_v_version_metrics_locales\`;`)
  await db.run(sql`DROP TABLE \`experiences_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`_experiences_v_version_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`profile_links_locales\`;`)
  await db.run(sql`DROP TABLE \`profile_languages_locales\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_version_links_locales\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_version_languages_locales\`;`)
  await db.run(sql`ALTER TABLE \`case_studies_metrics\` ADD \`_locale\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`case_studies_metrics\` ADD \`label\` text;`)
  await db.run(
    sql`CREATE INDEX \`case_studies_metrics_locale_idx\` ON \`case_studies_metrics\` (\`_locale\`);`,
  )
  await db.run(sql`ALTER TABLE \`_case_studies_v_version_metrics\` ADD \`_locale\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`_case_studies_v_version_metrics\` ADD \`label\` text;`)
  await db.run(
    sql`CREATE INDEX \`_case_studies_v_version_metrics_locale_idx\` ON \`_case_studies_v_version_metrics\` (\`_locale\`);`,
  )
  await db.run(sql`ALTER TABLE \`experiences_highlights\` ADD \`_locale\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`experiences_highlights\` ADD \`text\` text;`)
  await db.run(
    sql`CREATE INDEX \`experiences_highlights_locale_idx\` ON \`experiences_highlights\` (\`_locale\`);`,
  )
  await db.run(
    sql`ALTER TABLE \`_experiences_v_version_highlights\` ADD \`_locale\` text NOT NULL;`,
  )
  await db.run(sql`ALTER TABLE \`_experiences_v_version_highlights\` ADD \`text\` text;`)
  await db.run(
    sql`CREATE INDEX \`_experiences_v_version_highlights_locale_idx\` ON \`_experiences_v_version_highlights\` (\`_locale\`);`,
  )
  await db.run(sql`ALTER TABLE \`profile_links\` ADD \`label\` text;`)
  await db.run(sql`ALTER TABLE \`profile_languages\` ADD \`_locale\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`profile_languages\` ADD \`language\` text;`)
  await db.run(sql`ALTER TABLE \`profile_languages\` ADD \`level\` text;`)
  await db.run(
    sql`CREATE INDEX \`profile_languages_locale_idx\` ON \`profile_languages\` (\`_locale\`);`,
  )
  await db.run(sql`ALTER TABLE \`_profile_v_version_links\` ADD \`label\` text;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` ADD \`_locale\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` ADD \`language\` text;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` ADD \`level\` text;`)
  await db.run(
    sql`CREATE INDEX \`_profile_v_version_languages_locale_idx\` ON \`_profile_v_version_languages\` (\`_locale\`);`,
  )
}

// For development only: rows keep no language, and the texts recreated tables lose are not restored.
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  await db.run(sql`DROP INDEX \`case_studies_metrics_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`case_studies_metrics\` DROP COLUMN \`_locale\`;`)
  await db.run(sql`ALTER TABLE \`case_studies_metrics\` DROP COLUMN \`label\`;`)
  await db.run(sql`DROP INDEX \`_case_studies_v_version_metrics_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`_case_studies_v_version_metrics\` DROP COLUMN \`_locale\`;`)
  await db.run(sql`ALTER TABLE \`_case_studies_v_version_metrics\` DROP COLUMN \`label\`;`)
  await db.run(sql`DROP INDEX \`experiences_highlights_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`experiences_highlights\` DROP COLUMN \`_locale\`;`)
  await db.run(sql`ALTER TABLE \`experiences_highlights\` DROP COLUMN \`text\`;`)
  await db.run(sql`DROP INDEX \`_experiences_v_version_highlights_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`_experiences_v_version_highlights\` DROP COLUMN \`_locale\`;`)
  await db.run(sql`ALTER TABLE \`_experiences_v_version_highlights\` DROP COLUMN \`text\`;`)
  await db.run(sql`DROP INDEX \`profile_languages_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`profile_languages\` DROP COLUMN \`_locale\`;`)
  await db.run(sql`ALTER TABLE \`profile_languages\` DROP COLUMN \`language\`;`)
  await db.run(sql`ALTER TABLE \`profile_languages\` DROP COLUMN \`level\`;`)
  await db.run(sql`DROP INDEX \`_profile_v_version_languages_locale_idx\`;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` DROP COLUMN \`_locale\`;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` DROP COLUMN \`language\`;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` DROP COLUMN \`level\`;`)
  await db.run(sql`ALTER TABLE \`profile_links\` DROP COLUMN \`label\`;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_links\` DROP COLUMN \`label\`;`)
}
