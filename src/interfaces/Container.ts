import type { Binder } from './Binder';
import type { BindingScope } from './BindingScope';
import type { Token } from '../Token';

/**
 * @public
 */
export interface Container {
	bind: <T>(token: Token<T>) => Binder<T> & BindingScope<T>;
	get: <T>(token: Token<T>) => T;
}
