import type { AsyncContainerModule, SyncContainerModule } from './ContainerModule.js';
import type { BindFunction, IsBoundFunction, RebindFunction, UnbindFunction } from './Functions.js';
import type { ContainerConfiguration } from './ContainerConfiguration.js';
import type { InjectOptions } from './InjectOptions.js';
import type { ServiceIdentifier } from './ServiceIdentifier.js';

/**
 * An IOC container
 *
 * @remarks
 *
 * You can either manage bindings directly on a container or use {@link @mscharley/ioc#interfaces.ContainerModule | ContainerModules }
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
	load: {
		(module: AsyncContainerModule): Promise<void>;
		(module: SyncContainerModule): void;
	};
	/**
	 * Create a child container
	 */
	createChild: (options?: Partial<ContainerConfiguration>) => Container;

	/**
	 * Make a request from this container
	 */
	get: {
		<T>(id: ServiceIdentifier<T>, options: Partial<InjectOptions> & { multiple: true }): Promise<T[]>;
		<T>(id: ServiceIdentifier<T>, options: Partial<InjectOptions> & { optional: true }): Promise<T | undefined>;
		<T>(id: ServiceIdentifier<T>, options?: Partial<InjectOptions>): Promise<T>;
	};
}
