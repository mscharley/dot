import type { BindFunction, IsBoundFunction, RebindFunction, UnbindFunction } from './Functions.js';
import type { ContainerConfiguration } from './ContainerConfiguration.js';
import type { ContainerFactory } from './ContainerFactory.js';
import type { ContainerModule } from './ContainerModule.js';
import type { InjectOptions } from './InjectOptions.js';
import type { ServiceIdentifier } from './ServiceIdentifier.js';

/**
 * An IOC container
 *
 * @remarks
 *
 * You can either manage bindings directly on a container or use {@link @mscharley/dot#interfaces.ContainerModule | ContainerModules }
 * to manage bindings in a reusable and modular way.
 *
 * @public
 */
export interface Container {
	/**
	 * The configuration used by this container
	 */
	readonly config: ContainerConfiguration;

	/** {@inheritdoc interfaces.BindFunction} */
	bind: BindFunction;
	/** {@inheritdoc interfaces.UnbindFunction} */
	unbind: UnbindFunction;
	/** {@inheritdoc interfaces.RebindFunction} */
	rebind: RebindFunction;
	/** {@inheritdoc interfaces.IsBoundFunction} */
	has: IsBoundFunction;

	/**
	 * Load a preconfigured module into this container
	 */
	load: <M extends ContainerModule>(module: M) => ReturnType<M>;
	/**
	 * Create a child container
	 */
	createChild: ContainerFactory;

	/**
	 * Make a request from this container
	 */
	get: {
		<T>(id: ServiceIdentifier<T>, options: Partial<InjectOptions> & { multiple: true }): Promise<T[]>;
		<T>(id: ServiceIdentifier<T>, options: Partial<InjectOptions> & { optional: true }): Promise<T | undefined>;
		<T>(id: ServiceIdentifier<T>, options?: Partial<InjectOptions>): Promise<T>;
	};

	/**
	 * Check that all bindings have no missing dependencies
	 */
	validate: (validateAutobindings?: boolean) => void;
}
