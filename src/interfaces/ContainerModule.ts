import type { BindFunction, IsBoundFunction, RebindFunction, UnbindFunction } from './Functions.js';

/**
 * Loadable module which contains asynchronous bindings
 *
 * @public
 */
export type AsyncContainerModule = (
	bind: BindFunction,
	unbind: UnbindFunction,
	isBound: IsBoundFunction,
	rebind: RebindFunction,
) => Promise<void>;

/**
 * Loadable module which contains synchronous bindings
 *
 * @public
 */
export type SyncContainerModule = (
	bind: BindFunction,
	unbind: UnbindFunction,
	isBound: IsBoundFunction,
	rebind: RebindFunction,
) => void;

/**
 * A generic module which contains bindings for a container
 *
 * @public
 */
export type ContainerModule = AsyncContainerModule | SyncContainerModule;
