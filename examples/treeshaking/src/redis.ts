import type { interfaces } from '@mscharley/dot';
import { Token } from '@mscharley/dot';

const LOADING_DELAY_MILLISECONDS = 5000;

export const RedisConnection = new Token<{ get: (key: string) => Promise<string> }>('redis.connection');

export const RedisModule: interfaces.AsyncContainerModule = async (bind) => {
	// Pretend to do some complicated work here.
	await new Promise<void>((resolve) => setTimeout(() => {
		resolve();
	}, LOADING_DELAY_MILLISECONDS));

	bind(RedisConnection).toConstantValue({
		get: async (key) => Promise.resolve(key),
	});
};
