import type { BindingContext } from './BindingContext.js';

/**
 * Describes which {@link interfaces.Binder | Binder} options are only available when not specifying a scope
 *
 * @public
 */
export type ImplicitScopeBindingOptions = 'toConstantValue';

/**
 * Partial interface which describes the final step of specifying a binding
 *
 * @public
 */
export interface Binder<in out T> {
	/**
	 * Bind this identifier to a constant value
	 *
	 * @remarks
	 *
	 * Use this when you have a precalculated value which should always be used, eg. a database connection object.
	 */
	toConstantValue: ((v: T) => void) & ((v: Promise<T>) => Promise<void>);

	/**
	 * Bind this identifier to a function which can produce the required value later
	 *
	 * @remarks
	 *
	 * Use this when you need to perform some calculations to produce the required value. Be aware that this can be pretty
	 * performance intensive if scoping isn't applied appropriately and you make lots of requests from the container.
	 */
	toDynamicValue: (fn: (context: BindingContext<T>) => T | Promise<T>) => void;
}
