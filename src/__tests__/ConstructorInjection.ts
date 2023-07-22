import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

const nameToken = new Token<string>('name');
const greetingToken = new Token<string>('greeting');

@injectable(greetingToken, [nameToken, { optional: true }])
class Test {
	public readonly greeting;

	public constructor(greeting: string, name?: string) {
		this.greeting = `${greeting}, ${name ?? 'world'}.`;
	}
}

describe('ConstructorInjection', () => {
	let c: Container;

	beforeEach(() => {
		c = new Container();
		c.bind(Test).toSelf();
	});

	it('can do a basic constructor parameter injection', async () => {
		c.bind(greetingToken).toConstantValue('Hello');
		c.bind(nameToken).toConstantValue('John');
		await expect(c.get(Test)).resolves.toMatchObject({ greeting: 'Hello, John.' });
	});

	it('can resolve optional dependencies', async () => {
		c.bind(greetingToken).toConstantValue('Hello');
		await expect(c.get(Test)).resolves.toMatchObject({ greeting: 'Hello, world.' });
	});

	it('fails for non-optional dependencies', async () => {
		await expect(c.get(Test)).rejects.toThrow('Unable to resolve token as no bindings exist: Symbol(greeting)');
	});
});
