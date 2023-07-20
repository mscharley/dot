/* eslint-disable @typescript-eslint/no-magic-numbers */
import { createContainer, Token } from '../index.js';
import { describe, expect, it } from '@jest/globals';

const token = new Token<{ id: number }>('error-handling');

describe('ExceptionHandling', () => {
	describe('should allow errors from client code to be transparent to client code', () => {
		it('class constructor', async () => {
			const c = createContainer();
			c.bind(token).to(
				class Test {
					public constructor() {
						throw new Error('Oops, something bad happened.');
					}

					public id = 10;
				},
			);

			await expect(c.get(token)).rejects.toThrow('Oops, something bad happened.');
		});

		it('dynamic value', async () => {
			const c = createContainer();
			c.bind(token).toDynamicValue(() => {
				throw new Error('Oops, something bad happened.');
			});

			await expect(c.get(token)).rejects.toThrow('Oops, something bad happened.');
		});
	});
});
