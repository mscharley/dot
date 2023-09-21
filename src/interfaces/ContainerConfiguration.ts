import type { Logger, LoggerLevel } from './Logger.js';
import type { Container } from './Container.js';
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
	readonly defaultScope: ScopeOptions;

	/**
	 * If provided, this will write trace logs
	 */
	readonly logger: Logger;

	/**
	 * Level to log all messages at (default: `"debug"`)
	 */
	readonly logLevel: LoggerLevel;

	/**
	 * The parent of the current container
	 *
	 * @internal
	 */
	readonly parent?: Container;
}
