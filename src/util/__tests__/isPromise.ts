/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';
import { isPromise } from '../isPromise.js';

const noop = (): void => {
	/* no op */
};

describe('isPromise', () => {
	it('null is not a Promise', () => {
		expect(isPromise(null)).toBe(false);
	});

	it('returns false if something is not a promise', () => {
		expect(isPromise('foo')).toBe(false);
	});

	it('returns true for a Promise', () => {
		expect(isPromise(Promise.resolve('foo'))).toBe(true);
	});

	it('returns true for a PromiseLike', () => {
		expect(isPromise({ then: noop })).toBe(false);
		expect(isPromise({ catch: noop })).toBe(false);
		expect(isPromise({ then: noop, catch: noop })).toBe(true);
	});
});
