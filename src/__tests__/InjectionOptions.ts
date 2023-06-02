import { describe, expect, it } from '@jest/globals';
import { Container } from '../Container';
import { inject } from '../decorators/inject';
import { injectable } from '../decorators/injectable';
import { Token } from '../Token';

describe('InjectionOptions', () => {
	describe('optional', () => {
		it('can handle missing bindings as optional', () => {
			const token1 = new Token<{ id?: string }>('token1');
			const token2 = new Token<string>('token2');
			@injectable()
			class Token1 {
				@inject(token2, { optional: true })
				public id?: string;
			}

			const c = new Container();
			c.bind(token1).to(Token1);

			expect(c.get(token1)).toMatchObject({ id: undefined });
		});
	});
});
