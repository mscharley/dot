/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Checks if a value is a promise of a value.
 */
export const isPromise = <T = unknown>(v: T | Promise<T>): v is Promise<T> =>
	v != null
	&& (v instanceof Promise
		|| (typeof (v as unknown as Promise<T>).then === 'function'
			&& typeof (v as unknown as Promise<T>).catch === 'function'));
