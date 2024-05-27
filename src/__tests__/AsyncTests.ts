import { describe, expect, it, jest } from '@jest/globals';
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

describe('async tests', () => {
	it('works correctly with caches', async () => {
		const c = new Container({ autobindClasses: true, defaultScope: 'singleton' });

		const [g1, g2] = await Promise.all([c.get(Greeter), c.get(Greeter)]);
		expect(g1).toBe(g2);
	});

	it('releases correctly if errors occur', async () => {
		const c = new Container({ autobindClasses: true, defaultScope: 'singleton' });
		const factory = jest.fn<() => Greeter>();
		c.bind(Greeter).toDynamicValue([], factory);

		factory.mockImplementationOnce(() => {
			throw new Error('Oops!');
		});
		await expect(c.get(Greeter)).rejects.toThrow('Encountered an error while creating a class');

		factory.mockImplementationOnce(() => new Greeter(new Name()));
		const g2 = await c.get(Greeter);
		expect(g2).toBeInstanceOf(Greeter);
	});
});
