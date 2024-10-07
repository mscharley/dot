/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';
import { isConstructor } from '../isConstructor.js';

describe('isConstructor', () => {
	it('detects if something is a constructor', () => {
		expect(isConstructor(class {})).toBe(true);
		expect(isConstructor(Symbol)).toBe(true);

		expect(isConstructor('hello world')).toBe(false);
		expect(isConstructor(1)).toBe(false);
		expect(isConstructor(true)).toBe(false);
	});
});
