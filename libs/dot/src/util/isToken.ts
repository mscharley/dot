/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import type { AnyToken, MetadataToken } from '../Token.js';

/**
 * Type guard to check if something is a token
 *
 * @public
 */
export const isToken = (o: unknown): o is AnyToken<unknown> =>
	typeof o === 'object' && o != null && 'identifier' in o && typeof o.identifier === 'symbol';

/**
 * Type guard to check if something is a token that supports metadata
 *
 * @public
 */
export const isMetadataToken = (o: unknown): o is MetadataToken<unknown, interfaces.MetadataObject> =>
	isToken(o) && 'guard' in o && typeof o.guard === 'function';
