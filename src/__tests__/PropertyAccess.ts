import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import { inject } from '../decorators/inject.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

const prop = new Token<string>('bar');
@injectable()
class Foo {
	@inject(prop)
	public prop!: string;
	public constructorValue?: string;

	public constructor() {
		this.constructorValue = this.prop;
	}

	public getProp = (): string => this.prop;
}
const foo = new Token<Foo>('foo');

describe('PropertyAccess', () => {
	let c: Container;

	beforeEach(() => {
		c = new Container();
		c.bind(prop).toConstantValue('Hello world!');
		c.bind(foo).to(Foo);
	});

	it('can be accessed publically from outside the class', async () => {
		const n = await c.get(foo);
		expect(n.prop).toBe('Hello world!');
	});

	if (process.env.DECORATOR_TYPE === 'tc39') {
		it('can access injected properties from the constructor', async () => {
			const n = await c.get(foo);
			expect(n.constructorValue).toBe('Hello world!');
		});
	} else {
		it.todo('can access injected properties from the constructor');
	}

	it('can access injected properties from other methods', async () => {
		const n = await c.get(foo);
		expect(n.getProp()).toBe('Hello world!');
	});
});
