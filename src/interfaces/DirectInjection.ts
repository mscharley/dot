import type { Token } from '../container/Token.js';

/**
 * A way to allow for injections that don't involve a container, eg. unmanaged dependencies
 *
 * @public
 */
export type DirectInjection<T> = {
	token: Token<T>;
	generator: () => T;
};
