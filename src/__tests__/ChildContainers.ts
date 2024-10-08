/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Container } from '../container/Container.js';
import type { ErrorCode } from '../Error.js';
import { Token } from '../Token.js';

const token = new Token<string>('str');

describe('child containers', () => {
	let container: interfaces.Container;
	const log = jest.fn<interfaces.LoggerFn>();
	const warn = jest.fn<interfaces.LoggerFn>();

	beforeEach(() => {
		container = new Container({
			logger: {
				warn: warn as unknown as interfaces.LoggerFn,
				debug: log as unknown as interfaces.LoggerFn,
				info: log as unknown as interfaces.LoggerFn,
				trace: log as unknown as interfaces.LoggerFn,
			},
			logLevel: 'info',
		});
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
		container.load((bind) => bind(token).toConstantValue('Hello world!'));
		const child = container.createChild();

		await expect(child.get(token)).resolves.toBe('Hello world!');
	});

	it('can request things from the parent from a dynamic value', async () => {
		const name = new Token<string>('name');
		container.load((bind) => bind(name).toConstantValue('world'));
		const child = container.createChild();
		child.load((bind) => bind(token).toDynamicValue([name], (n) => `Hello ${n}!`));

		await expect(child.get(token)).resolves.toBe('Hello world!');
	});

	it('can cache things in the parent container', async () => {
		const factory = jest.fn<() => string>(() => 'Hello world!');
		container.load((bind) => bind(token).inSingletonScope().toDynamicValue([], factory));

		const child1 = container.createChild();
		await expect(child1.get(token)).resolves.toBe('Hello world!');

		const child2 = container.createChild();
		await expect(child2.get(token)).resolves.toBe('Hello world!');

		expect(factory.mock.calls).toHaveLength(1);
	});

	it('will not do multi-injections across levels of the containers', async () => {
		container.load((bind) => bind(token).toConstantValue('Hello, world!'));
		const child = container.createChild();
		child.load((bind) => bind(token).toConstantValue('Goodbye, world!'));

		await expect(child.get(token, { multiple: true })).resolves.toStrictEqual(['Goodbye, world!']);
	});

	it('will check parent containers for bindings', () => {
		container.load((bind) => bind(token).toConstantValue('Hello, world!'));
		const child = container.createChild();

		expect(child.has(token)).toBe(true);
	});

	describe('optional injections', () => {
		it('will request optional injections from it\'s parent', async () => {
			container.load((bind) => bind(token).toConstantValue('Hello, world!'));
			const child = container.createChild();

			await expect(child.get(token, { optional: true })).resolves.toBe('Hello, world!');
		});

		it('will requests multiple optional injections from it\'s parent if it has no explicit bindings', async () => {
			container.load((bind) => bind(token).toConstantValue('Hello, world!'));
			const child = container.createChild();

			await expect(child.get(token, { optional: true, multiple: true })).resolves.toStrictEqual(['Hello, world!']);
		});
	});

	it('will inherit configuration from its parent', async () => {
		const child = container.createChild();
		child.load((bind) => bind(token).toConstantValue('Hello, world!'));

		await child.get(token);

		expect(log).toHaveBeenCalledTimes(1);
	});

	it('will allow rebind if only the parent container has bindings available', async () => {
		container.load((bind) => bind(token).toConstantValue('Hello, world!'));
		const child = container.createChild();
		child.load((_bind, _unbind, _isBound, rebind) => rebind(token).toConstantValue('Goodbye, world!'));

		await expect(child.get(token)).resolves.toBe('Goodbye, world!');
	});
});
