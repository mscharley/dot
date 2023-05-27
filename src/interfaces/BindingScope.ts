import type { Binder } from './Binder';

/**
 * @public
 */
export interface BindingScope<T> {
	inSingletonScope: () => Binder<T>;
	inTransientScope: () => Binder<T>;
	inRequestScope: () => Binder<T>;
}
