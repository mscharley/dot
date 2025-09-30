/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { type ClassDecorator, MetadataContext } from './decorators.js';
import { Context } from '../container/Context.js';
import { InvalidOperationError } from '../Error.js';

// eslint-disable-next-line @typescript-eslint/no-type-alias
type Metadata = Record<typeof MetadataContext, undefined | interfaces.Context[] | symbol>;

/**
 * Adds the autobinding of this class into a specific context
 *
 * @remarks
 *
 * It is possible to list multiple contexts by using the decorator multiple times.
 *
 * @example
 *
 * ```typescript
 * const myContext = createContext("MyContext");
 *
 * @injectable()
 * class GlobalClass {}
 *
 * @injectable()
 * @inContext(myContext)
 * class Test {}
 *
 * const container = createContainer({ autobindClasses: true });
 * container.get(Test) // This will fail, Test is not bound in the global context as it has an explicit context
 * const childContainer = container.createChild({ autobindClasses: true, contexts: [myContext] });
 * childContainer.get(Test) // This will succeed, as the context for the autobinding is available to this container.
 * childContainer.get(GlobalClass) // This will also succeed, all containers always have access to the global context.
 * ```
 *
 * @public
 */
export const inContext
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	= (context: interfaces.Context): ClassDecorator<any, any> =>
		(target, ctx) => {
			/* c8 ignore start */
			if (ctx == null) {
				// experimental
				const meta = (target as unknown as Metadata)[MetadataContext] ??= [];
				if (!Array.isArray(meta)) {
					throw new InvalidOperationError('@inContext should be specified after @injectable');
				}
				meta.push(context);

				return target;
				/* c8 ignore end */
			} else {
				// tc39
				if (ctx.metadata == null) {
					throw new Error('Your JavaScript runtime doesn\'t support decorator metadata');
				}
				const meta: interfaces.Context[] | symbol = (ctx.metadata as Metadata)[MetadataContext] ??= [];
				if (!Array.isArray(meta)) {
					throw new InvalidOperationError('@inContext should be specified after @injectable');
				}
				meta.push(context);

				return undefined;
			}
		};

/**
 * Always include this injectable in the global context
 *
 * @remarks
 *
 * This effectively disables contexts for this injectable as the global context is always available in all
 * containers, but is included for completeness.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const inGlobalContext = (): ClassDecorator<any, any> => inContext(Context.global);

/**
 * Don't include this injectable in any contexts, including the global one
 *
 * @remarks
 *
 * This is useful for things you want to explicitly bind using `toSelf()` or `to()` which both require an
 * `@injectable` decorator in order to specify the dependency list for the binding.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const inNoContext = (): ClassDecorator<any, any> => (target, ctx) => {
	/* c8 ignore start */
	if (ctx == null) {
		// experimental
		const meta = (target as unknown as Metadata)[MetadataContext] ??= [];
		if (!Array.isArray(meta)) {
			throw new InvalidOperationError('@inContext should be specified after @injectable');
		}

		return target;
		/* c8 ignore end */
	} else {
		// tc39
		if (ctx.metadata == null) {
			throw new Error('Your JavaScript runtime doesn\'t support decorator metadata');
		}
		const meta: interfaces.Context[] | symbol = (ctx.metadata as Metadata)[MetadataContext] ??= [];
		if (!Array.isArray(meta)) {
			throw new InvalidOperationError('@inContext should be specified after @injectable');
		}

		return undefined;
	}
};
