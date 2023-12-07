import { describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

@injectable()
class Name {
	public name = 'World';
}

@injectable(Name)
class Greeter {
	public readonly greeting: string;

	public constructor({ name }: Name) {
		this.greeting = `Hello, ${name}!`;
	}
}

describe('Autobinding', () => {
	it('allows for autobinding classes', async () => {
		const c = new Container({ autobindClasses: true });

		await expect(c.get(Greeter)).resolves.toBeInstanceOf(Greeter);
	});

	it('dynamic bindings work with autobinding', async () => {
		const c = new Container({ autobindClasses: true });
		c.bind(Greeter).toDynamicValue([Name], (name) => new Greeter(name));

		await expect(c.get(Greeter)).resolves.toBeInstanceOf(Greeter);
	});

	it('will prefer to load something from a parent container', async () => {
		const c = new Container();
		c.bind(Greeter).toConstantValue(new Greeter({ name: 'John' }));

		const child = c.createChild({ autobindClasses: true });
		await expect(child.get(Greeter)).resolves.toMatchObject({ greeting: 'Hello, John!' });
	});

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
