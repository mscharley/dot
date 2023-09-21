import type { ImplicitScopeBindingOptions } from './Binder.js';

/**
 * Partial interface for building bindings which specifies scope options
 *
 * @public
 */
export interface BindingScope<in T, out Builder> {
	inSingletonScope: () => Omit<Builder, ImplicitScopeBindingOptions | keyof BindingScope<T, unknown>>;
	inTransientScope: () => Omit<Builder, ImplicitScopeBindingOptions | keyof BindingScope<T, unknown>>;
	inRequestScope: () => Omit<Builder, ImplicitScopeBindingOptions | keyof BindingScope<T, unknown>>;
}
