import type { Binder } from './Binder';

export interface BindingScope<T> {
	inSingletonScope: () => Binder<T>;
	inTransientScope: () => Binder<T>;
	inRequestScope: () => Binder<T>;
}
