import { describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import { inject } from '../decorators/inject.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

const strToken = new Token<string>('string');

describe('InjectionOptions', () => {
	describe('optional', () => {
		it('can handle missing bindings as optional', async () => {
			const token = new Token<{ id?: string }>('token1');
			@injectable()
			class Token1 {
				@inject(strToken, { optional: true })
				public id?: string;
			}

			const c = new Container();
			c.bind(token).to(Token1);

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
			c.bind(token).to(Token1);

			await expect(c.get(token)).rejects.toMatchObject({
				message: 'Unable to resolve token as no bindings exist',
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
			c.bind(token).to(Token1);

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
			c.bind(token).to(Token1);
			c.bind(strToken).toConstantValue('Hello');

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
			c.bind(token).to(Token1);
			c.bind(strToken).toConstantValue('Hello');
			c.bind(strToken).toConstantValue('world');

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
			c.bind(token).to(Token1);
			c.bind(strToken).toConstantValue('Hello');
			c.bind(strToken).toConstantValue('world');

			await expect(c.get(token)).rejects.toMatchObject({
				message: 'Multiple bindings exist for token',
				resolutionPath: [token, strToken],
			});
		});
	});
});
