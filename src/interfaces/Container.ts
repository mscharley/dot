import type { BindingBuilder } from './BindingBuilder';
import type { Token } from '../Token';

/**
 * @public
 */
export interface Container {
	bind: <T>(token: Token<T>) => BindingBuilder<T>;
	get: <T>(token: Token<T>) => T;
	has: (token: Token<unknown>) => boolean;
}
