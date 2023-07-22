import { describe, expect, it } from '@jest/globals';
import { isConstructor } from '../isConstructor.js';

describe('isConstructor', () => {
	it('detects if something is a constructor', () => {
		expect(isConstructor(class {})).toBe(true);
		expect(isConstructor(Symbol)).toBe(true);

		expect(isConstructor('hello world')).toBe(false);
		expect(isConstructor(1234)).toBe(false);
		expect(isConstructor(true)).toBe(false);
	});
});
