import type { Binder, BindingScope } from '.';
import type { Token } from '../Token';

/**
 * @public
 */
export interface Container {
	bind: <T>(token: Token<T>) => Binder<T> & BindingScope<T>;
	get: <T>(token: Token<T>) => T;
}
