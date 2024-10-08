import { DatabaseConnection } from './database.js';
import { entry } from './framework/index.js';

export const main = entry([DatabaseConnection, DatabaseConnection], async (db, _db2) => {
	await db.migrate();
});

export { run } from './framework/index.js';

// eslint-disable-next-line no-console
console.log('Code loaded.');
