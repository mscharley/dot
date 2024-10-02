import { DatabaseConnection, DatabaseModule } from './database.js';
import { createContainer } from '@mscharley/dot';
import type { interfaces } from '@mscharley/dot';
import { RedisModule } from './redis.js';

export const generateContainer = async (): Promise<interfaces.Container> => {
	const container = createContainer();

	await container.load(DatabaseModule);
	await container.load(RedisModule);

	return container;
};

export const main = {
	dependencies: [DatabaseConnection],
	handler: async (db: DatabaseConnection) => {
		await db.migrate();
	},
} as const;

export const run = async (def: typeof main): Promise<void> => {
	const c = await generateContainer();
	const deps = await Promise.all(def.dependencies.map(async (d) => c.get(d))) as [DatabaseConnection];
	await def.handler(...deps);
};

// eslint-disable-next-line no-console
console.log('Code loaded.');
