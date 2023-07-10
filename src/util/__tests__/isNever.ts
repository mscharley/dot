import { describe, expect, it } from '@jest/globals';
import { isNever } from '../isNever.js';

describe('isNever', () => {
	it('throws an exception', () => {
		expect(() => isNever('foo' as unknown as never, 'Unknown value')).toThrowErrorMatchingInlineSnapshot(
			'"Unknown value: foo"',
		);
	});
});
