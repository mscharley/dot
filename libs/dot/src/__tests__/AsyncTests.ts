/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContainer, inject, injectable } from '../index.js';
import { describe, expect, it, jest } from '@jest/globals';

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

@injectable()
class GreeterProp {
	@inject(Name)
	public readonly name!: Name;
}

describe('async tests', () => {
	describe('singleton scope', () => {
		it('works correctly with caches', async () => {
			const c = createContainer({ autobindClasses: true, defaultScope: 'singleton' });

			const [g1, g2] = await Promise.all([c.get(Greeter), c.get(Greeter)]);
			expect(g1).toBe(g2);
		});
	});

	describe('request scope', () => {
		it('works correctly with caches', async () => {
			const c = createContainer({ autobindClasses: true, defaultScope: 'request' });

			const [g1, g2] = await Promise.all([c.get(GreeterProp), c.get(GreeterProp)]);
			expect(g1).not.toBe(g2);
			expect(g1.name).not.toBe(g2.name);
		});
	});

	it('releases correctly if errors occur', async () => {
		const c = createContainer({ autobindClasses: true, defaultScope: 'singleton' });
		const factory = jest.fn<() => Greeter>();
		c.load((bind) => bind(Greeter).toDynamicValue([], factory));

		factory.mockImplementationOnce(() => {
			throw new Error('Oops!');
		});
		await expect(c.get(Greeter)).rejects.toThrow('Encountered an error while creating a class');

		factory.mockImplementationOnce(() => new Greeter(new Name()));
		const g2 = await c.get(Greeter);
		expect(g2).toBeInstanceOf(Greeter);
	});
});
