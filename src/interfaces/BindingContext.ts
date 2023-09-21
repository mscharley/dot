import type { Container } from './Container.js';
import type { ServiceIdentifier } from './ServiceIdentifier.js';

/**
 * Context provided to dynamic value bindings
 *
 * @public
 */
export interface BindingContext<out T> {
	/**
	 * The container used to resolve this dynamic binding
	 *
	 * @remarks
	 *
	 * You can use this to request any dependencies this dynamic binding may require.
	 */
	container: Container;

	/**
	 * The identifier of the service being requested using this dynamic binding
	 *
	 * @remarks
	 *
	 * This may be useful if you want to reuse a generic factory method across multiple bindings.
	 */
	id: ServiceIdentifier<T>;
}
