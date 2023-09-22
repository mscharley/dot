import { describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import { inject } from '../decorators/inject.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

const t1 = new Token<{ id: number }>('t1');
const t2 = new Token<{ name: string }>('t2');

describe('CircularDependencies', () => {
	it('throws an error for simple recursion', async () => {
		@injectable(t2)
		class Id {
			public constructor(public readonly name: { name: string }) {}
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			public id = 10;
		}

		@injectable(t1)
		class Name {
			public constructor(public readonly id: { id: number }) {}
			public name = 'world';
		}

		const c = new Container();
		c.bind(t1).to(Id);
		c.bind(t2).to(Name);

		await expect(c.get(t1)).rejects.toMatchObject({
			message: 'Recursive binding detected',
			resolutionPath: [t1, t2, t1],
		});
	});

	it('throws an error for recursion across dynamic bindings', async () => {
		const c = new Container();

		c.bind(t1)
			.inTransientScope()
			.toDynamicValue([t2], ({ name }) => {
				return { id: 0, name };
			});
		c.bind(t2)
			.inTransientScope()
			.toDynamicValue([t1], ({ id }) => {
				return { id, name: 'world' };
			});

		await expect(c.get(t1)).rejects.toMatchObject({
			message: 'Recursive binding detected',
			resolutionPath: [t1, t2, t1],
		});
	});

	it('throws an error for recursion via property injections', async () => {
		@injectable()
		class Id {
			@inject(t2)
			public readonly name!: { name: string };
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			public id = 10;
		}

		@injectable(t1)
		class Name {
			@inject(t1)
			public readonly id!: { id: number };
			public name = 'world';
		}

		const c = new Container();
		c.bind(t1).to(Id);
		c.bind(t2).to(Name);

		await expect(c.get(t1)).rejects.toMatchObject({
			message: 'Recursive binding detected',
			resolutionPath: [t1, t2, t1],
		});
	});
});
