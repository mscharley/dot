import type { ImplicitScopeBindingOptions } from './Binder.js';

/**
 * Partial interface for building bindings which specifies scope options
 *
 * @public
 */
export interface BindingScope<in T, out Builder> {
	/**
	 * Bind in singleton scope
	 *
	 * @remarks
	 *
	 * Singleton bindings will only ever be created once per container and reused
	 */
	inSingletonScope: () => Omit<Builder, ImplicitScopeBindingOptions | keyof BindingScope<T, unknown>>;

	/**
	 * Bind in transient scope
	 *
	 * @remarks
	 *
	 * Transient bindings will be created as many times as they're requested and can create multiple copies of a binding
	 * even in a single request.
	 */
	inTransientScope: () => Omit<Builder, ImplicitScopeBindingOptions | keyof BindingScope<T, unknown>>;

	/**
	 * Bind in request scope
	 *
	 * @remarks
	 *
	 * Request bindings will be created once per request to a container even if the binding is needed multiple times to
	 * resolve the request.
	 */
	inRequestScope: () => Omit<Builder, ImplicitScopeBindingOptions | keyof BindingScope<T, unknown>>;
}
