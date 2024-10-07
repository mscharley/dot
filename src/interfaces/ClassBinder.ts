/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
