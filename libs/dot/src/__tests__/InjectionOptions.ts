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

const strToken = new Token<string>('string');

describe('injection options', () => {
	describe('optional', () => {
		it('can handle missing bindings as optional', async () => {
			const token = new Token<{ id?: string }>('token1');
			@injectable()
			class Token1 {
				@inject(strToken, { optional: true })
				public id?: string;
			}

			const c = new Container();
			c.load((bind) => bind(token).to(Token1));

			await expect(c.get(token)).resolves.toMatchObject({ id: undefined });
		});
	});

	describe('multiple', () => {
		it('generates an error if no bindings are available', async () => {
			const token = new Token<{ id: string[] }>('token1');
			@injectable()
			class Token1 {
				@inject(strToken, { multiple: true })
				public id!: string[];
			}

			const c = new Container();
			c.load((bind) => bind(token).to(Token1));

			await expect(c.get(token)).rejects.toMatchObject({
				cause: {
					code: 'INVALID_OPERATION' satisfies ErrorCode,
					message: 'No bindings exist for token: Token<Symbol(string)>',
				},
				code: 'TOKEN_RESOLUTION' satisfies ErrorCode,
				message: 'Unable to resolve token',
				resolutionPath: [token, strToken],
			});
		});

		it('resolves no bindings to an empty array if also an optional injection', async () => {
			const token = new Token<{ id: string[] }>('token1');
			@injectable()
			class Token1 {
				@inject(strToken, { multiple: true, optional: true })
				public id!: string[];
			}

			const c = new Container();
			c.load((bind) => bind(token).to(Token1));

			await expect(c.get(token)).resolves.toMatchObject({ id: [] });
		});

		it('resolves one bindings to a single element array', async () => {
			const token = new Token<{ id: string[] }>('token1');
			@injectable()
			class Token1 {
				@inject(strToken, { multiple: true })
				public id!: string[];
			}

			const c = new Container();
			c.load((bind) => {
				bind(token).to(Token1);
				bind(strToken).toConstantValue('Hello');
			});

			await expect(c.get(token)).resolves.toMatchObject({ id: ['Hello'] });
		});

		it('resolves multiple bindings to an array', async () => {
			const token = new Token<{ id: string[] }>('token1');
			@injectable()
			class Token1 {
				@inject(strToken, { multiple: true })
				public id!: string[];
			}

			const c = new Container();
			c.load((bind) => {
				bind(token).to(Token1);
				bind(strToken).toConstantValue('Hello');
				bind(strToken).toConstantValue('world');
			});

			await expect(c.get(token)).resolves.toMatchObject({ id: ['Hello', 'world'] });
		});

		it('throws an error if multiple bindings exist for a non-multiple injections', async () => {
			const token = new Token<{ id: string }>('token1');
			@injectable()
			class Token1 {
				@inject(strToken)
				public id!: string;
			}

			const c = new Container();
			c.load((bind) => {
				bind(token).to(Token1);
				bind(strToken).toConstantValue('Hello');
				bind(strToken).toConstantValue('world');
			});

			await expect(c.get(token)).rejects.toMatchObject({
				cause: {
					code: 'INVALID_OPERATION' satisfies ErrorCode,
					message: 'Multiple bindings exist for this token but multiple injection was not allowed',
				},
				code: 'TOKEN_RESOLUTION' satisfies ErrorCode,
				message: 'Unable to resolve token',
				resolutionPath: [token, strToken],
			});
		});
	});
});
