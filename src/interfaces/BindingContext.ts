import type { Container } from './Container';
import type { Token } from '../Token';

/**
 * @public
 */
export interface BindingContext<out T> {
	container: Container;
	token: Token<T>;
}
