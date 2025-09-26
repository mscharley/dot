/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-title */
/* eslint-disable @typescript-eslint/no-type-alias */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import type { GuardedType } from 'generic-type-guard';
import { isSingletonStringUnion } from 'generic-type-guard';
import { it } from '@jest/globals';

type ExtractCallSignature<T>
	= T extends (...args: infer Args) => infer ReturnValue ? (...args: Args) => ReturnValue : never;

const isDecoratorType = isSingletonStringUnion('tc39', 'experimental');
type DecoratorType = GuardedType<typeof isDecoratorType>;
type ItProxy = { it: ExtractCallSignature<typeof it> };

const decoratorType: DecoratorType = isDecoratorType(process.env.DECORATOR_TYPE) ? process.env.DECORATOR_TYPE : 'tc39';

export const tc39: ItProxy
	= decoratorType === 'tc39' ? { it } : { it: (name: string | number | Function) => it.todo(name) };
export const experimental: ItProxy
	= decoratorType === 'experimental' ? { it } : { it: (name: string | number | Function) => it.todo(name) };

export const forDecoratorsIt = (name: string, tests: Record<DecoratorType, () => void | Promise<void>>): void => {
	it(name, tests[decoratorType]);
};
