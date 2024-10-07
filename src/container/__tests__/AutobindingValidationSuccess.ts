/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import { injectable } from '../../decorators/injectable.js';
import { Token } from '../../Token.js';

describe('autobindingValidationSuccess', () => {
	it('will not validate autobound classes if asked not to', async () => {
		const token = new Token<string>('failing-token');
		const c = new Container({ autobindClasses: true });

		@injectable(token)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		class HelloWorld {
			public readonly greeting: string;

			public constructor(name: string) {
				this.greeting = `Hello, ${name}!`;
			}
		}

		// eslint-disable-next-line @typescript-eslint/require-await
		await expect((async (): Promise<void> => c.validate(false))()).resolves.toBeUndefined();
	});
});
