import { describe, expect, it } from '@jest/globals';
import { injectable } from '../../decorators/injectable.js';
import { stringifyIdentifier } from '../stringifyIdentifier.js';
import { Token } from '../../Token.js';

describe('stringifyIdentifier', () => {
	it('can stringify a token', () => {
		expect(stringifyIdentifier(new Token('hello'))).toBe('Token<Symbol(hello)>');
	});

	it('can stringify a constructor', () => {
		@injectable()
		class Test {}
		expect(stringifyIdentifier(Test)).toBe('Constructor<Test>');
	});
});
