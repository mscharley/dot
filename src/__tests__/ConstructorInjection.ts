import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

const nameToken = new Token<string>('name');

@injectable(nameToken)
class Test {
	public readonly greeting;

	public constructor(name: string) {
		this.greeting = `Hello, ${name}`;
	}
}

describe('ConstructorInjection', () => {
	let c: Container;

	beforeEach(() => {
		c = new Container();
		c.bind(nameToken).toConstantValue('John');
		c.bind(Test).toSelf();
	});

	it('can do a basic constructor parameter injection', async () => {
		await expect(c.get(Test)).resolves.toMatchObject({ greeting: 'Hello, John' });
	});
});
