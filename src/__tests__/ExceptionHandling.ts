/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @typescript-eslint/require-await */

import { describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import type { ErrorCode } from '../Error.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

const token = new Token<{ id: number }>('error-handling');
@injectable()
class Test {
	public constructor() {
		throw new Error('Oops, something bad happened.');
	}

	public id = 10;
}

describe('exception handling', () => {
	describe('should allow errors from client code to be accessible to client code', () => {
		it('class constructor', async () => {
			const c = new Container();
			c.load((bind) => bind(token).to(Test));

			await expect(c.get(token)).rejects.toMatchObject({
				cause: {
					message: 'Oops, something bad happened.',
				},
				code: 'TOKEN_RESOLUTION' satisfies ErrorCode,
				message: 'Encountered an error while creating a class',
			});
		});

		it('dynamic value', async () => {
			const c = new Container();
			c.load((bind) =>
				bind(token)
					.inTransientScope()
					.toDynamicValue([], () => {
						throw new Error('Oops, something bad happened.');
					}),
			);

			await expect(c.get(token)).rejects.toMatchObject({
				cause: {
					message: 'Oops, something bad happened.',
				},
				code: 'TOKEN_RESOLUTION' satisfies ErrorCode,
				message: 'Encountered an error while creating a class',
			});
		});

		it('async dynamic value', async () => {
			const c = new Container();

			c.load((bind) =>
				bind(token)
					.inTransientScope()
					.toDynamicValue([], async () => {
						throw new Error('Oops, something bad happened.');
					}),
			);

			await expect(c.get(token)).rejects.toMatchObject({
				cause: {
					message: 'Oops, something bad happened.',
				},
				code: 'TOKEN_RESOLUTION' satisfies ErrorCode,
				message: 'Encountered an error while creating a class',
			});
		});
	});

	describe('resolution errors should include a path to where the error happened', () => {
		it('should return a simple error', async () => {
			const c = new Container();
			c.load((bind) => bind(token).to(Test));

			await expect(c.get(token)).rejects.toMatchObject({
				cause: {
					message: 'Oops, something bad happened.',
				},
				code: 'TOKEN_RESOLUTION' satisfies ErrorCode,
				resolutionPath: [token],
			});
		});

		it('nested requests should include the full tree of errors', async () => {
			const c = new Container();
			const nameToken = new Token<string>('name');
			@injectable(nameToken)
			class Greeter {
				public constructor(private readonly name: string) {}

				public greet = (): string => `Hello, ${this.name}`;
			}
			const greeterToken = new Token<Greeter>('greeter');

			c.load((bind) => {
				bind(token).to(Test);
				bind(nameToken)
					.inTransientScope()
					.toDynamicValue([token], ({ id }) => `dummy-${id}`);
				bind(greeterToken).to(Greeter);
			});

			await expect(c.get(greeterToken)).rejects.toMatchObject({
				cause: {
					message: 'Oops, something bad happened.',
				},
				code: 'TOKEN_RESOLUTION' satisfies ErrorCode,
				message: 'Encountered an error while creating a class',
				resolutionPath: [greeterToken, nameToken, token],
			});
		});
	});
});
