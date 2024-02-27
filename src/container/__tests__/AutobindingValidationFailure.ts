import { describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import { injectable } from '../../decorators/injectable.js';
import { Token } from '../../Token.js';

describe('autobindingValidationFailure', () => {
	it('will validate autobound classes', async () => {
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
		await expect((async (): Promise<void> => c.validate())()).rejects.toMatchObject({
			code: 'INVALID_OPERATION',
			message: 'Unbound dependency: Constructor<HelloWorld> => Token<Symbol(failing-token)>',
		});
	});
});
