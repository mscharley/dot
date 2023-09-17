import type { Token } from '../Token.js';

/**
 * A simple way to deal with direct injections.
 *
 * @public
 */
export type DirectInjection<T> = {
	token: Token<T>;
	generator: () => T;
};
