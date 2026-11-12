import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`profile_languages\` ADD \`test\` text;`)
  await db.run(sql`ALTER TABLE \`profile_languages\` ADD \`score\` numeric;`)
  await db.run(sql`ALTER TABLE \`profile_languages\` ADD \`score_max\` numeric;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` ADD \`test\` text;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` ADD \`score\` numeric;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` ADD \`score_max\` numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`profile_languages\` DROP COLUMN \`test\`;`)
  await db.run(sql`ALTER TABLE \`profile_languages\` DROP COLUMN \`score\`;`)
  await db.run(sql`ALTER TABLE \`profile_languages\` DROP COLUMN \`score_max\`;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` DROP COLUMN \`test\`;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` DROP COLUMN \`score\`;`)
  await db.run(sql`ALTER TABLE \`_profile_v_version_languages\` DROP COLUMN \`score_max\`;`)
}
