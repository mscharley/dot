import type { FixedScopeBindingOptions } from './Binder';

/**
 * @public
 */
export interface BindingScope<T, Builder> {
	inSingletonScope: () => Omit<Builder, FixedScopeBindingOptions | keyof BindingScope<T, unknown>>;
	inTransientScope: () => Omit<Builder, FixedScopeBindingOptions | keyof BindingScope<T, unknown>>;
	inRequestScope: () => Omit<Builder, FixedScopeBindingOptions | keyof BindingScope<T, unknown>>;
}
