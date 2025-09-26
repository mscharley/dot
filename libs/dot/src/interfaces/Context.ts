/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Constructor } from './Functions.js';

/**
 * A context for autobindings to limit which hierarchical containers can use this binding
 */
export interface Context {
	readonly name: string;
	readonly classesRegistered: number;
	has: <T>(klass: Constructor<T>) => boolean;
}
