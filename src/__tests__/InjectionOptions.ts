import { describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import { inject } from '../decorators/inject.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

describe('InjectionOptions', () => {
	describe('optional', () => {
		it('can handle missing bindings as optional', async () => {
			const token1 = new Token<{ id?: string }>('token1');
			const token2 = new Token<string>('token2');
			@injectable()
			class Token1 {
				@inject(token2, { optional: true })
				public id?: string;
			}

			const c = new Container();
			c.bind(token1).to(Token1);

			await expect(c.get(token1)).resolves.toMatchObject({ id: undefined });
		});
	});
});
