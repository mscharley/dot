/* eslint-disable @typescript-eslint/no-type-alias */

import type { GuardedType } from 'generic-type-guard';
import { isSingletonStringUnion } from 'generic-type-guard';
import { it } from '@jest/globals';

const isDecoratorType = isSingletonStringUnion('tc39', 'experimental');
type DecoratorType = GuardedType<typeof isDecoratorType>;
type ItProxy = { it: (name: string, test: () => void | Promise<void>) => void };

const decoratorType: DecoratorType = isDecoratorType(process.env.DECORATOR_TYPE) ? process.env.DECORATOR_TYPE : 'tc39';

export const tc39: ItProxy = process.env.DECORATOR_TYPE === 'tc39' ? { it } : { it: (name: string) => it.todo(name) };
export const experimental: ItProxy =
	process.env.DECORATOR_TYPE === 'experimental' ? { it } : { it: (name: string) => it.todo(name) };

export const forDecoratorsIt = (name: string, tests: Record<DecoratorType, () => void | Promise<void>>): void => {
	it(name, tests[decoratorType]);
};
