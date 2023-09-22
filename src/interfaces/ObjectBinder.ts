import type { Constructor } from './Functions.js';

/**
 * Partial interface for building bindings that contains options for types which are some kind of object type
 *
 * @public
 */
export interface ObjectBinder<in out T extends object> {
	/**
	 * Binds an interface identifier to a concrete class implementation
	 */
	to: (fn: Constructor<T>) => void;
}
