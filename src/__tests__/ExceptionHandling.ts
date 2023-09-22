/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { createContainer, injectable, Token } from '../index.js';
import { describe, expect, it } from '@jest/globals';

const token = new Token<{ id: number }>('error-handling');
class Test {
	public constructor() {
		throw new Error('Oops, something bad happened.');
	}

	public id = 10;
}

describe('ExceptionHandling', () => {
	describe('should allow errors from client code to be accessible to client code', () => {
		it('class constructor', async () => {
			const c = createContainer();
			c.bind(token).to(Test);

			await expect(c.get(token)).rejects.toMatchObject({
				cause: {
					message: 'Oops, something bad happened.',
				},
				message: 'Encountered an error while creating a class',
			});
		});

		it('dynamic value', async () => {
			const c = createContainer();
			c.bind(token)
				.inTransientScope()
				.toDynamicValue(() => {
					throw new Error('Oops, something bad happened.');
				});

			await expect(c.get(token)).rejects.toMatchObject({
				cause: {
					message: 'Oops, something bad happened.',
				},
				message: 'Encountered an error while creating a class',
			});
		});

		it('async dynamic value', async () => {
			const c = createContainer();

			c.bind(token)
				.inTransientScope()
				.toDynamicValue(async () => {
					throw new Error('Oops, something bad happened.');
				});

			await expect(c.get(token)).rejects.toMatchObject({
				cause: {
					message: 'Oops, something bad happened.',
				},
				message: 'Encountered an error while creating a class',
			});
		});
	});

	describe('resolution errors should include a path to where the error happened', () => {
		it('should return a simple error', async () => {
			const c = createContainer();
			c.bind(token).to(Test);

			await expect(c.get(token)).rejects.toMatchObject({
				cause: {
					message: 'Oops, something bad happened.',
				},
				resolutionPath: [token],
			});
		});

		it('nested requests should include the full tree of errors', async () => {
			const c = createContainer();
			const nameToken = new Token<string>('name');
			@injectable(nameToken)
			class Greeter {
				public constructor(private readonly name: string) {}

				public greet = (): string => `Hello, ${this.name}`;
			}
			const greeterToken = new Token<Greeter>('greeter');

			c.bind(token).to(Test);
			c.bind(nameToken)
				.inTransientScope()
				.toDynamicValue(async (ctx) => `dummy-${(await ctx.container.get(token)).id}`);
			c.bind(greeterToken).to(Greeter);

			await expect(c.get(greeterToken)).rejects.toMatchObject({
				cause: {
					cause: {
						message: 'Oops, something bad happened.',
					},
					message: 'Encountered an error while creating a class',
					resolutionPath: [token],
				},
				message: 'Encountered an error while creating a class',
				resolutionPath: [greeterToken, nameToken],
			});
		});
	});
});
