import { describe, expect, it } from '@jest/globals';
import { Token } from '../../Token.js';
import { tokenForIdentifier } from '../tokenForIdentifier.js';

describe('tokenForIdentifier', () => {
	it('returns tokens directly', () => {
		const token = new Token('test');
		expect(tokenForIdentifier(token)).toBe(token);
	});

	it('returns a new cached token for constructors', () => {
		const klass = class Test {};
		const token = tokenForIdentifier(klass);
		expect(token.identifier.toString()).toBe('Symbol(Test)');
		expect(tokenForIdentifier(klass)).toBe(token);
	});
});
