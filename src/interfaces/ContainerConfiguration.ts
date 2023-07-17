import type { ScopeOptions } from './ScopeOptions.js';

/**
 * A configuration object for creating a new container
 *
 * @public
 */
export interface ContainerConfiguration {
	/**
	 * The default scope for all bindings in this container (default: `"transient"`)
	 */
	defaultScope: ScopeOptions;
}
