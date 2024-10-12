import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('rooms')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('description', 'text', (col) => col.notNull())
		.addColumn('status', 'text', (col) => col.notNull())
		.addColumn('created_at', 'timestamp', (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.execute()

	await db.schema.createTable('room_users')
		.addColumn('room_id', 'text', (col) => col.references('rooms.id'))
		.addColumn('user_id', 'serial', (col) => col.references('users.id'))
		.execute()

	await db.schema.createTable('room_games')
		.addColumn('room_id', 'text', (col) => col.references('rooms.id'))
		.addColumn('game_id', 'serial', (col) => col.references('games.id'))
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('room_games').execute()
	await db.schema.dropTable('room_users').execute()
	await db.schema.dropTable('rooms').execute()
}
