/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
