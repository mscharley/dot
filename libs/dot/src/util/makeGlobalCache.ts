/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Override globalThis for just this file.
declare let globalThis: Record<symbol, Map<object, unknown>>;

export const makeGlobalCache = <K extends object, V>(identifier: symbol): Map<K, V> => {
	const cache = globalThis[identifier] ?? new Map<object, unknown>();
	globalThis[identifier] = cache;

	return cache as Map<K, V>;
};
