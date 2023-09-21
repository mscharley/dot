/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Partial interface for building bindings that contains options for types identified by a constructor
 *
 * @public
 */
export interface ClassBinder<in T> {
	/**
	 * Binds this class identifier to itself
	 *
	 * @example
	 *
	 * ```typescript
	 * // These two bindings are equivalent
	 * bind(Foo).toSelf();
	 * bind(Foo).to(Foo);
	 * ```
	 */
	toSelf: () => void;
}
