import type { AsyncContainerModule, SyncContainerModule } from './ContainerModule.js';
import type { BindFunction, IsBoundFunction, RebindFunction, UnbindFunction } from './Functions.js';
import type { Token } from '../Token.js';

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
	get: <T>(token: Token<T>) => Promise<T>;
}
