/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { Token } from '../Token.js';

/**
 * Used to label a constructor parameter as unmanaged by the IOC container.
 *
 * @remarks
 *
 * This is most useful when the simplest option is to pass in a full external API for production code, but you
 * still want to be able to pass in something custom for testing your code.
 *
 * @example
 *
 * ```typescript
 * import newrelic from "newrelic";
 *
 * @injectable(unmanaged(newrelic, "newrelic api"))
 * export class Test {
 *   public constructor(private nr: typeof newrelic) {}
 * }
 * ```
 *
 * @public
 */
export const unmanaged = <T>(defaultValue: T, name?: string): interfaces.DirectInjection<T> => ({
	token: new Token(`unmanaged:${name ?? `${defaultValue as string}`}`),
	generator: () => defaultValue,
});
