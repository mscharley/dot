/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
