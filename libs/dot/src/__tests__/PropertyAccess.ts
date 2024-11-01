/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import { inject } from '../decorators/inject.js';
import { injectable } from '../decorators/injectable.js';
import { tc39 } from '../__utils__/DecoratorTypes.js';
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

describe('property access', () => {
	let c: Container;

	beforeEach(() => {
		c = new Container();
		c.load((bind) => {
			bind(prop).toConstantValue('Hello world!');
			bind(foo).to(Foo);
		});
	});

	it('can be accessed publically from outside the class', async () => {
		const n = await c.get(foo);
		expect(n.prop).toBe('Hello world!');
	});

	tc39.it('can access injected properties from the constructor', async () => {
		const n = await c.get(foo);
		// eslint-disable-next-line jest/no-standalone-expect
		expect(n.constructorValue).toBe('Hello world!');
	});

	it('can access injected properties from other methods', async () => {
		const n = await c.get(foo);
		expect(n.getProp()).toBe('Hello world!');
	});
});
