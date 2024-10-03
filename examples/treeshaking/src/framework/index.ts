import { createContainer } from '@mscharley/dot';
import { DatabaseModule } from '../database.js';
import type { interfaces } from '@mscharley/dot';
import { RedisModule } from '../redis.js';

export interface EntryPoint<Tokens extends Array<interfaces.ServiceIdentifier<unknown>>> {
	dependencies: [...Tokens];
	handler: interfaces.Fn<void | Promise<void>, interfaces.ArgsForInjectionIdentifiers<Tokens>>;
}

export const generateContainer = async (): Promise<interfaces.Container> => {
	const container = createContainer();

	await container.load(DatabaseModule);
	await container.load(RedisModule);

	return container;
};

export const entry = <Tokens extends Array<interfaces.ServiceIdentifier<unknown>>>(
	dependencies: [...Tokens],
	handler: EntryPoint<Tokens>['handler'],
): EntryPoint<Tokens> => ({ dependencies, handler });

export const run = async <Tokens extends Array<interfaces.ServiceIdentifier<unknown>>>(def: EntryPoint<Tokens>): Promise<void> => {
	const c = await generateContainer();
	const deps = await Promise.all(def.dependencies.map(async (d) => c.get(d))) as interfaces.ArgsForInjectionIdentifiers<Tokens>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	await def.handler(...(deps as any));
};
