import type * as interfaces from '../interfaces/index.js';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Container } from '../container/Container.js';
import type { ErrorCode } from '../Error.js';
import { Token } from '../Token.js';

const token = new Token<string>('str');

describe('ChildContainers', () => {
	let container: interfaces.Container;

	beforeEach(() => {
		container = new Container();
	});

	it('fails if not bound anywhere', async () => {
		const child = container.createChild();
		await expect(child.get(token)).rejects.toMatchObject({
			cause: {
				code: 'INVALID_OPERATION' satisfies ErrorCode,
				message: 'No bindings exist for token: Token<Symbol(str)>',
			},
			code: 'TOKEN_RESOLUTION' satisfies ErrorCode,
			message: 'Unable to resolve token',
			resolutionPath: [token],
		});
	});

	it('can request things from the parent', async () => {
		container.bind(token).toConstantValue('Hello world!');
		const child = container.createChild();

		await expect(child.get(token)).resolves.toBe('Hello world!');
	});

	it('can request things from the parent from a dynamic value', async () => {
		const name = new Token<string>('name');
		container.bind(name).toConstantValue('world');
		const child = container.createChild();
		child.bind(token).toDynamicValue([name], (n) => `Hello ${n}!`);

		await expect(child.get(token)).resolves.toBe('Hello world!');
	});

	it('can cache things in the parent container', async () => {
		const factory = jest.fn<() => string>(() => 'Hello world!');
		container.bind(token).inSingletonScope().toDynamicValue([], factory);

		const child1 = container.createChild();
		await expect(child1.get(token)).resolves.toBe('Hello world!');

		const child2 = container.createChild();
		await expect(child2.get(token)).resolves.toBe('Hello world!');

		expect(factory.mock.calls.length).toBe(1);
	});

	it('will not do multi-injections across levels of the containers', async () => {
		container.bind(token).toConstantValue('Hello, world!');
		const child = container.createChild();
		child.bind(token).toConstantValue('Goodbye, world!');

		await expect(child.get(token, { multiple: true })).resolves.toStrictEqual(['Goodbye, world!']);
	});
});
