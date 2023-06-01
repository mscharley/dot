import type { AsyncContainerModule, SyncContainerModule } from './ContainerModule';
import type { BindFunction, IsBoundFunction, RebindFunction, UnbindFunction } from './Functions';
import type { Token } from '../Token';

/**
 * @public
 */
export interface Container {
	bind: BindFunction;
	unbind: UnbindFunction;
	rebind: RebindFunction;
	has: IsBoundFunction;
	load: {
		(module: AsyncContainerModule): Promise<void>;
		(module: SyncContainerModule): void;
	};
	get: <T>(token: Token<T>) => T;
}
