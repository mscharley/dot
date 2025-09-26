/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import { createContainer, inject, injectable, Token } from '../index.js';
import type { interfaces } from '../index.js';
import { tc39 } from '../__utils__/DecoratorTypes.js';

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
	let c: interfaces.Container;

	beforeEach(() => {
		c = createContainer();
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
