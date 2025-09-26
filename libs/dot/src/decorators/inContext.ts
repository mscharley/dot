/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @stylistic/max-len */
import type * as interfaces from '../interfaces/index.js';
import { type ClassDecorator, MetadataContext } from './decorators.js';

export const inContext
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	= (context: interfaces.Context): ClassDecorator<any, any> =>
		(target, ctx) => {
			/* c8 ignore start */
			if (ctx == null) {
				// experimental
				(target as unknown as Record<typeof MetadataContext, undefined | interfaces.Context[]>)[MetadataContext] ??= [];
				(target as unknown as Record<typeof MetadataContext, interfaces.Context[]>)[MetadataContext].push(context);

				return target;
				/* c8 ignore end */
			} else {
				// tc39
				if (ctx.metadata == null) {
					throw new Error('Your JavaScript runtime doesn\'t support decorator metadata');
				}
				ctx.metadata[MetadataContext] ??= [];
				(ctx.metadata as Record<typeof MetadataContext, interfaces.Context[]>)[MetadataContext].push(context);

				return undefined;
			}
		};
