import type { Container } from './Container.js';
import type { Token } from '../Token.js';

/**
 * @public
 */
export interface BindingContext<out T> {
	container: Container;
	token: Token<T>;
}
