/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { IsInjectableSubclass } from '../decorators/metadata.js';
import { isToken } from './isToken.js';

/**
 * Turn a service identifier into a string
 *
 * @public
 */
export const stringifyIdentifier = <T>(id: interfaces.ServiceIdentifier<T>): string => {
	if (isToken(id)) {
		return `Token<${id.identifier.toString()}>`;
	} else {
		let count = 0;
		let proto = id as interfaces.Constructor<unknown> | null;
		while (proto != null && (proto.name === '' || proto.name === '_class')) {
			if (!Object.prototype.hasOwnProperty.call(proto, IsInjectableSubclass)) {
				count += 1;
			}
			proto = Object.getPrototypeOf(proto) as typeof proto;
		}

		if (proto?.name == null) {
			return 'Constructor<Anonymous>';
		} else {
			return `Constructor<${'Anonymous extends '.repeat(count)}${proto.name}>`;
		}
	}
};
