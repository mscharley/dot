import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';
import { unmanaged } from '../decorators/unmanaged.js';

const nameToken = new Token<string>('name');
const greetingToken = new Token<string>('greeting');

@injectable(greetingToken, [nameToken, { optional: true }])
class Test {
	public readonly greeting;

	public constructor(greeting: string, name?: string) {
		this.greeting = `${greeting}, ${name ?? 'world'}.`;
	}
}

@injectable(unmanaged('こんにちは'), [nameToken, { optional: true }])
class UnmanagedTest {
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
		c.bind(UnmanagedTest).toSelf();
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
		await expect(c.get(Test)).rejects.toMatchObject({
			cause: {
				message: 'No bindings exist for token: Token<Symbol(greeting)>',
			},
			message: 'Unable to resolve token',
			resolutionPath: [tokenForIdentifier(Test), greetingToken],
		});
	});

	it('can handle unmanaged dependencies', async () => {
		await expect(c.get(UnmanagedTest)).resolves.toMatchObject({ greeting: 'こんにちは, world.' });
	});
});
