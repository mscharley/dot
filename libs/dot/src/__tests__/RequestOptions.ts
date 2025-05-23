/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';
import { withOptions } from '../decorators/withOptions.js';

const token = new Token<string>('str');

describe('request options', () => {
	let c: interfaces.Container;

	beforeEach(() => {
		c = new Container();
	});

	it('is optional', async () => {
		c.load((bind) => bind(token).toConstantValue('Hello!'));
		await expect(c.get(token)).resolves.toBe('Hello!');
	});

	it('allows for optional fetches', async () => {
		await expect(c.get(token, { optional: true })).resolves.toBeUndefined();
	});

	it('allows for multiple fetches', async () => {
		c.load((bind) => {
			bind(token).toConstantValue('Hello,');
			bind(token).toConstantValue('world!');
		});
		await expect(c.get(token, { multiple: true })).resolves.toStrictEqual(['Hello,', 'world!']);
	});

	it('allows for multiple, optional fetches', async () => {
		await expect(c.get(token, { multiple: true, optional: true })).resolves.toStrictEqual([]);
	});

	describe('toDynamicValue', () => {
		const token2 = new Token<number>('num');

		it('allows for optional fetches', async () => {
			c.load((bind) => bind(token)
				// eslint-disable-next-line jest/no-conditional-in-test
				.toDynamicValue([withOptions(token2, { optional: true })], (num) => (num ?? 10).toString()));

			await expect(c.get(token)).resolves.toBe('10');
		});

		it('allows for multiple fetches', async () => {
			c.load((bind) => {
				bind(token2).toConstantValue(10);
				bind(token2).toConstantValue(20);
				bind(token).toDynamicValue([withOptions(token2, { multiple: true })], (nums) =>
					nums.map((_) => _.toString()).join(', '),
				);
			});

			await expect(c.get(token)).resolves.toBe('10, 20');
		});

		it('allows for multiple, optional fetches', async () => {
			c.load((bind) => bind(token)
				.toDynamicValue([withOptions(token2, { multiple: true, optional: true })], (nums) =>
					nums.map((_) => _.toString()).join(', '),
				));

			await expect(c.get(token)).resolves.toBe('');
		});
	});

	describe('@injectable', () => {
		it('allows for optional fetches', async () => {
			@injectable(withOptions(token, { optional: true }))
			class Test {
				public constructor(public str?: string) {}
			}

			c.load((bind) => bind(Test).toSelf());

			await expect(c.get(Test)).resolves.toMatchObject({ str: undefined });
		});

		it('allows for multiple fetches', async () => {
			@injectable(withOptions(token, { multiple: true }))
			class Test {
				public constructor(public str: string[]) {}
			}

			c.load((bind) => {
				bind(token).toConstantValue('Hello');
				bind(token).toConstantValue('world');
				bind(Test).toSelf();
			});

			await expect(c.get(Test)).resolves.toMatchObject({ str: ['Hello', 'world'] });
		});

		it('allows for multiple, optional fetches', async () => {
			@injectable(withOptions(token, { multiple: true, optional: true }))
			class Test {
				public constructor(public str: string[]) {}
			}

			c.load((bind) => bind(Test).toSelf());

			await expect(c.get(Test)).resolves.toMatchObject({ str: [] });
		});
	});
});
