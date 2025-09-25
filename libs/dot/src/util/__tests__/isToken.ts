/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';
import { IsInterface, isString } from 'generic-type-guard';
import { isMetadataToken, isToken } from '../isToken.js';
import { MetadataToken, Token } from '../../Token.js';

describe('isToken', () => {
	it('behaves as expected', () => {
		expect(isToken(new Token('testing'))).toBe(true);
		expect(isToken({ identifier: Symbol('testing') })).toBe(true);
		expect(isToken({ identifier: 'foo' })).toBe(false);
	});
});

describe('isMetadataToken', () => {
	it('behaves as expected', () => {
		const isTestMetadata = new IsInterface().withProperties({ test: isString }).get();
		expect(isMetadataToken(new MetadataToken<string, { test: string }>('testing', isTestMetadata))).toBe(true);
		expect(isMetadataToken({ identifier: Symbol('testing'), guard: isTestMetadata })).toBe(true);
		expect(isMetadataToken({ identifier: Symbol('testing'), guard: 'helloworld' })).toBe(false);
		expect(isMetadataToken({ identifier: Symbol('testing') })).toBe(false);
		expect(isMetadataToken({ identifier: 'foo' })).toBe(false);
	});
});
