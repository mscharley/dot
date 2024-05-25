import type { Container } from './Container.js';
import type { MetadataObject } from './MetadataObject.js';

/**
 * Extra context passed to factory bindings
 *
 * @public
 */
export interface FactoryContext<Metadata extends MetadataObject> {
	/**
	 * A partial container which can only be used for a few read-only operations
	 */
	container: Pick<Container, 'createChild' | 'config'>;

	/**
	 * The metadata provided with the get request
	 */
	metadata: Partial<Metadata>;
}
