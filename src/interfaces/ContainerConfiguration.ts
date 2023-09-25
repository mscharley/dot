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
	 * Whether to automatically bind class to themselves in this container (default: `false`)
	 *
	 * @remarks
	 *
	 * This still requires the `@injectable` annotation on the class in order to be considered a valid thing to be
	 * injected. Otherwise this is the same as calling `bind(MyClass).toSelf()` on all classes.
	 */
	readonly autobindClasses: boolean;

	/**
	 * The default scope for all bindings in this container (default: `"transient"`)
	 */
	readonly defaultScope: ScopeOptions;

	/**
	 * If provided, the container will write logs using this interface
	 */
	readonly logger: Logger;

	/**
	 * Level to log most messages at (default: `"debug"`)
	 *
	 * @remarks
	 *
	 * There are some cases where other levels will be used, like warn for any warnings.
	 */
	readonly logLevel: LoggerLevel;

	/**
	 * The parent of the current container
	 *
	 * @internal
	 */
	readonly parent?: Container;
}
