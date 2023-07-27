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
	defaultScope: ScopeOptions;

	/**
	 * If provided, this will write trace logs
	 */
	logger: Logger;

	/**
	 * Level to log all messages at (default: `"debug"`)
	 */
	logLevel: LoggerLevel;

	/**
	 * The parent of the current container
	 *
	 * @internal
	 */
	parent?: Container;
}
