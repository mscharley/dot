/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { isToken } from './isToken.js';
import type { MetadataToken } from '../Token.js';
import { Token } from '../Token.js';

const _mappings = new Map<interfaces.Constructor<unknown>, Token<unknown>>();

export const tokenForIdentifier = <T, Metadata extends interfaces.MetadataObject>(
	id: interfaces.ServiceIdentifierWithMetadata<T, Metadata> | interfaces.ServiceIdentifier<T>,
): Token<T> | MetadataToken<T, Metadata> => {
	if (isToken(id)) {
		return id;
	} else {
		if (!_mappings.has(id)) {
			// Stryker disable all: Stryker only tests TC39, but this construct operates differently on experimental
			_mappings.set(
				id,
				new Token(id.name !== '' ? id.name : (Object.getPrototypeOf(id) as interfaces.Constructor<unknown>).name),
			);
			// Stryker enable all
		}

		return _mappings.get(id) as Token<T>;
	}
};
