/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';
import { isNever } from '../isNever.js';

describe('isNever', () => {
	it('throws an exception', () => {
		expect(() => isNever('foo' as unknown as never, 'Unknown value')).toThrowErrorMatchingInlineSnapshot(
			'"Unknown value: foo"',
		);
	});
});
