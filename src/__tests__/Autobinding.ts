/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import { injectable } from '../decorators/injectable.js';

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

describe('autobinding', () => {
	it('allows for autobinding classes', async () => {
		const c = new Container({ autobindClasses: true });

		await expect(c.get(Greeter)).resolves.toBeInstanceOf(Greeter);
	});

	it('dynamic bindings work with autobinding', async () => {
		const c = new Container({ autobindClasses: true });
		c.bind(Greeter).toDynamicValue([Name], (name) => new Greeter(name));

		await expect(c.get(Greeter)).resolves.toBeInstanceOf(Greeter);
	});

	it('works correctly with caches', async () => {
		const c = new Container({ autobindClasses: true, defaultScope: 'singleton' });

		const g1 = await c.get(Greeter);
		const g2 = await c.get(Greeter);
		expect(g1).toBe(g2);
	});

	it('will prefer to load something from a parent container', async () => {
		const c = new Container();
		c.bind(Greeter).toConstantValue(new Greeter({ name: 'John' }));

		const child = c.createChild({ autobindClasses: true });
		await expect(child.get(Greeter)).resolves.toMatchObject({ greeting: 'Hello, John!' });
	});

	it('respects the default scope of a container', async () => {
		const container = new Container({ autobindClasses: true, defaultScope: 'singleton' });

		@injectable()
		class Test {
			public id = 10;
		}

		expect(await container.get(Test)).toBe(await container.get(Test));
	});
});
