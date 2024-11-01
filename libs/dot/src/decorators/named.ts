/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import type { NamedToken } from '../Token.js';

/**
 * Helper to provide a simple way to interact with named bindings
 *
 * @example
 *
 * ```typescript
 * @injectable(named(MyToken, "test"))
 * class Test {
 *   public constructor(private tokens: MyToken) {}
 * }
 * ```
 *
 * @public
 */
export const named = <Id extends NamedToken<unknown>>(
	id: Id,
	name: string,
	options?: Partial<interfaces.InjectOptions<{ name: string }>>,
): [Id, Partial<interfaces.InjectOptions<{ name: string }>>] =>
	[id, { ...options, metadata: { name } }];
