import { describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import { injectable } from '../../decorators/injectable.js';
import { Token } from '../../Token.js';

describe('AutobindingValidationSuccess', () => {
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
