import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../Container';
import { inject } from '../decorators/inject';
import { injectable } from '../decorators/injectable';
import { Token } from '../Token';

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

	it('can be accessed publically from outside the class', () => {
		const n = c.get(foo);
		expect(n.prop).toBe('Hello world!');
	});

	if (process.env.DECORATOR_TYPE === 'tc39') {
		it('can access injected properties from the constructor', () => {
			const n = c.get(foo);
			expect(n.constructorValue).toBe('Hello world!');
		});
	} else {
		it.todo('can access injected properties from the constructor');
	}

	it('can access injected properties from other methods', () => {
		const n = c.get(foo);
		expect(n.getProp()).toBe('Hello world!');
	});
});
