/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* c8 ignore start */

import { InvalidOperationError } from '../Error.js';

/**
 * Helper for sufficiency testing of switch statements.
 */
export const isNever = (value: never, prefix: string): never => {
	throw new InvalidOperationError(`${prefix}: ${value as string}`);
};
