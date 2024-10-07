/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Token } from '../Token.js';

/**
 * A way to allow for injections that don't involve a container, eg. unmanaged dependencies
 *
 * @public
 */
export type DirectInjection<T> = {
	token: Token<T>;
	generator: () => T;
};
