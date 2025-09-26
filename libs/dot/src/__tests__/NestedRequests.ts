/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContainer, inject, injectable, Token } from '../index.js';
import { describe, expect, it } from '@jest/globals';

const numberToken = new Token<number>('nested.number');
const stringToken = new Token<string>('nested.string');
@injectable()
class TestClass {
	@inject(stringToken)
	public test!: string;
}
const classToken = new Token<TestClass>('nested.class');

describe('nested requests', () => {
	it('can handle nested requests without loosing track', async () => {
		const container = createContainer();
		container.load((bind) => {
			bind(numberToken).toConstantValue(10);
			bind(stringToken).inTransientScope().toDynamicValue([numberToken], (n) => n.toFixed(2));
			bind(classToken).to(TestClass);
		});

		await expect(container.get(classToken)).resolves.toMatchObject({ test: '10.00' });
	});
});
