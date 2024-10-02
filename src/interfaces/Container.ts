/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ContainerModule, ContainerModuleMeta } from './ContainerModule.js';
import type { IsBoundFunction, UnbindFunction } from './Functions.js';
import type { MetadataForIdentifier, ServiceIdentifier } from './ServiceIdentifier.js';
import type { ContainerConfiguration } from './ContainerConfiguration.js';
import type { ContainerFactory } from './ContainerFactory.js';
import type { InjectedType } from './InjectionIdentifier.js';
import type { InjectOptions } from './InjectOptions.js';

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

	/** {@inheritdoc interfaces.UnbindFunction} */
	readonly unbind: UnbindFunction;
	/** {@inheritdoc interfaces.IsBoundFunction} */
	readonly has: IsBoundFunction;

	/**
	 * Load a preconfigured module into this container
	 */
	readonly load: <M extends ContainerModule>(module: M) => ReturnType<M>;
	/**
	 * Create a child container
	 */
	readonly createChild: ContainerFactory;
	/**
	 * Fetch a list of all the container modules necessary to satisfy a particular set of requests
	 *
	 * @remarks
	 *
	 * This is mostly useful for build systems to generate partial containers to satisfy particular entrypoints.
	 *
	 * @beta
	 */
	readonly getRequiredContainerModules: (injections: ReadonlyArray<ServiceIdentifier<unknown>>) => ContainerModuleMeta[];

	/**
	 * Make a request from this container
	 */
	readonly get: {
		/* eslint-disable @typescript-eslint/unified-signatures */
		<Id extends ServiceIdentifier<unknown>>(
			id: Id,
			options: { multiple: true } & Partial<InjectOptions<MetadataForIdentifier<Id>>>,
		): Promise<InjectedType<[Id, typeof options]>>;
		<Id extends ServiceIdentifier<unknown>>(
			id: Id,
			options: { optional: true } & Partial<InjectOptions<MetadataForIdentifier<Id>>>,
		): Promise<InjectedType<[Id, typeof options]>>;
		<Id extends ServiceIdentifier<unknown>>(
			id: Id,
			options?: Partial<InjectOptions<MetadataForIdentifier<Id>>>,
		): Promise<InjectedType<[Id, typeof options]>>;
		/* eslint-enable @typescript-eslint/unified-signatures */
	};

	/**
	 * Check that all bindings have no missing dependencies
	 *
	 * @example
	 *
	 * ```typescript
	 * const container = createContainer();
	 * const Name = new Token<string>();
	 *
	 * @injectable(Name)
	 * class Greeter {
	 *   public constructor(private name: string) { }
	 *
	 *   public greet() {
	 *     console.log(`Hello, ${this.name}`);
	 *   }
	 * }
	 *
	 * container.bind(Greeter).toSelf();
	 * container.validate(); // Throws an exception
	 *
	 * container.bind(Name).toConstantValue("John Doe");
	 * container.validate(); // Works
	 * ```
	 */
	readonly validate: (validateAutobindings?: boolean) => void;
}
