/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import type { ErrorCode } from '../Error.js';
import { inject } from '../decorators/inject.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

const t1 = new Token<{ id: number }>('t1');
const t2 = new Token<{ name: string }>('t2');

describe('circular dependencies', () => {
	it('throws an error for simple recursion', async () => {
		@injectable(t2)
		class Id {
			public constructor(public readonly name: { name: string }) {}

			public id = 10;
		}

		@injectable(t1)
		class Name {
			public constructor(public readonly id: { id: number }) {}
			public name = 'world';
		}

		const c = new Container();
		c.load((bind) => {
			bind(t1).to(Id);
			bind(t2).to(Name);
		});

		await expect(c.get(t1)).rejects.toMatchObject({
			code: 'RECURSIVE_RESOLUTION' satisfies ErrorCode,
			message: 'Recursive binding detected',
			resolutionPath: [t1, t2, t1],
		});
	});

	it('throws an error for recursion across dynamic bindings', async () => {
		const c = new Container();

		c.load((bind) => {
			bind(t1)
				.inTransientScope()
				.toDynamicValue([t2], ({ name }) => {
					return { id: 0, name };
				});
			bind(t2)
				.inTransientScope()
				.toDynamicValue([t1], ({ id }) => {
					return { id, name: 'world' };
				});
		});

		await expect(c.get(t1)).rejects.toMatchObject({
			code: 'RECURSIVE_RESOLUTION' satisfies ErrorCode,
			message: 'Recursive binding detected',
			resolutionPath: [t1, t2, t1],
		});
	});

	it('throws an error for recursion via property injections', async () => {
		@injectable()
		class Id {
			@inject(t2)
			public readonly name!: { name: string };

			public id = 10;
		}

		@injectable(t1)
		class Name {
			@inject(t1)
			public readonly id!: { id: number };

			public name = 'world';
		}

		const c = new Container();
		c.load((bind) => {
			bind(t1).to(Id);
			bind(t2).to(Name);
		});

		await expect(c.get(t1)).rejects.toMatchObject({
			code: 'RECURSIVE_RESOLUTION' satisfies ErrorCode,
			message: 'Recursive binding detected',
			resolutionPath: [t1, t2, t1],
		});
	});
});
