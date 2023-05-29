import type { BindFunction, IsBoundFunction, RebindFunction, UnbindFunction } from './Functions';

/** @public */
export type AsyncContainerModule = (
	bind: BindFunction,
	unbind: UnbindFunction,
	isBound: IsBoundFunction,
	rebind: RebindFunction,
) => Promise<void>;
/** @public */
export type SyncContainerModule = (
	bind: BindFunction,
	unbind: UnbindFunction,
	isBound: IsBoundFunction,
	rebind: RebindFunction,
) => void;

/** @public */
export type ContainerModule = AsyncContainerModule | SyncContainerModule;
