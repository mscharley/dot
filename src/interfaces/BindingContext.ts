import type { Container } from './Container.js';
import type { ServiceIdentifier } from './ServiceIdentifier.js';

/**
 * @public
 */
export interface BindingContext<out T> {
	container: Container;
	id: ServiceIdentifier<T>;
}
