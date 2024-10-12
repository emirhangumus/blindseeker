import { defineConfig } from 'kysely-ctl'
import { Pool } from 'pg'

export default defineConfig({
	// replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
	dialect: 'pg',
	dialectConfig: {
		pool: new Pool({
			connectionString: process.env.DATABASE_URL,
		}),
	},
	migrations: {
		migrationFolder: "src/lib/db/migrations",
	},
	//   plugins: [],
	seeds: {
		seedFolder: "src/lib/db/seeds",
	}
})
