/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import type { AnyToken } from '../Token.js';
import type { Container } from '../interfaces/Container.js';
import type { ResolutionCache } from '../container/ResolutionCache.js';

export interface Request<T> {
	container: Container;
	stack: Record<symbol, unknown[]>;
	singletonCache: ResolutionCache;
	token: AnyToken<T>;
	id: interfaces.ServiceIdentifier<T>;
}
