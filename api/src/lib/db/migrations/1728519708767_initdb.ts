import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('users')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('username', 'text', (col) => col.unique().notNull())
		.addColumn('email', 'text', (col) => col.unique().notNull())
		.addColumn('password', 'text', (col) => col.notNull())
		.addColumn('created_at', 'timestamp', (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.execute()

	await db.schema.createTable('games')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('data', 'json', (col) => col.notNull())
		.addColumn('created_at', 'timestamp', (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('games').execute()
	await db.schema.dropTable('users').execute()
}
