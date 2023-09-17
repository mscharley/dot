import { describe, expect, it } from '@jest/globals';
import { isNotNullOrUndefined } from '../isNotNullOrUndefined.js';

describe('isNotNullOrUndefined', () => {
	it('determines if something is null', () => {
		expect(isNotNullOrUndefined(null)).toBe(false);
	});

	it('determines if something is undefined', () => {
		expect(isNotNullOrUndefined(undefined)).toBe(false);
	});

	it('determines if something is a real value', () => {
		expect(isNotNullOrUndefined(Symbol.for('hello'))).toBe(true);
		expect(isNotNullOrUndefined('')).toBe(true);
		expect(isNotNullOrUndefined('hello')).toBe(true);
		expect(isNotNullOrUndefined(0)).toBe(true);
		expect(isNotNullOrUndefined(1)).toBe(true);
		expect(isNotNullOrUndefined({})).toBe(true);
	});
});
