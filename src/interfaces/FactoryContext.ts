import type { Container } from './Container.js';

/**
 * Extra context passed to factory bindings
 *
 * @public
 */
export interface FactoryContext {
	/**
	 * A partial container which can only be used for a few read-only operations
	 */
	container: Pick<Container, 'createChild' | 'config'>;
}
