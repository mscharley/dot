/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { describe, expect, it, jest } from '@jest/globals';
import { ImportTest, ImportTestDependency } from '../__utils__/ImportTest.js';
import { Container } from '../container/Container.js';
import type { ErrorCode } from '../Error.js';
import { injectable } from '../decorators/injectable.js';
import type { LoggerFn } from '../interfaces/Logger.js';
import { noop } from '../util/noop.js';
import { Token } from '../Token.js';
import type { TokenType } from '../Token.js';
import { unmanaged } from '../decorators/unmanaged.js';
import { withOptions } from '../decorators/withOptions.js';

const token = new Token<{ id: number }>('test');

describe('bindings', () => {
	it('enforces finalising bindings', async () => {
		const c = new Container();
		c.load((bind) => {
			bind(token);
			bind(new Token('foo'));
		});

		await expect(async () => c.get(token)).rejects.toMatchObject({
			code: 'INVALID_OPERATION' satisfies ErrorCode,
			message: 'Some bindings were started but not completed: Symbol(test), Symbol(foo)',
		});
	});

	it('throws an error if no binding is found for a token', async () => {
		const c = new Container();

		await expect(async () => c.get(token)).rejects.toMatchObject({
			cause: {
				code: 'INVALID_OPERATION' satisfies ErrorCode,
				message: 'No bindings exist for token: Token<Symbol(test)>',
			},
			code: 'TOKEN_RESOLUTION' satisfies ErrorCode,
			message: 'Unable to resolve token',
			resolutionPath: [token],
		});
	});

	it('fails if attempting a resolution outside a request', () => {
		expect(() => Container.resolvePropertyInjection(token, [])).toThrowErrorMatchingInlineSnapshot(
			'"Unable to resolve token as no container is currently making a request: Token<Symbol(test)>"',
		);
	});

	describe('bind()', () => {
		describe('toConstantValue()', () => {
			it('can\'t be scoped', () => {
				expect.assertions(0);
				const c = new Container();
				c.load((bind) => {
					/* eslint-disable @typescript-eslint/no-unused-expressions */
					// @ts-expect-error This error is the actual test
					bind(token).inSingletonScope().toConstantValue;
					/* eslint-enable @typescript-eslint/no-unused-expressions */
				});
			});

			it('acts like singleton scope', async () => {
				const c = new Container();
				const result = c.load((bind) => bind(token).toConstantValue({ id: 10 }));
				expect(result).not.toBeInstanceOf(Promise);
				const resolved = await c.get(token);
				expect(resolved).toMatchObject({ id: 10 });
				expect(resolved).toBe(await c.get(token));
			});

			it('can handle async bindings', async () => {
				const c = new Container();
				const result = c.load(async (bind) => bind(token).toConstantValue(Promise.resolve({ id: 10 })));
				expect(result).toBeInstanceOf(Promise);
				await result;
				expect(await c.get(token)).toMatchObject({ id: 10 });
			});

			it('supports binding proxies', async () => {
				const c = new Container();
				c.load((bind) => {
					bind(token).toConstantValue(new Proxy({ id: 10 }, {}) as never);
				});
				await expect(c.get(token)).resolves.toMatchObject({ id: 10 });
			});
		});

		describe('toDynamicValue()', () => {
			it('transient scope will always run the function', async () => {
				const c = new Container();
				const fn = jest.fn<() => TokenType<typeof token>>().mockImplementation(() => ({ id: 10 }));
				c.load((bind) => bind(token).inTransientScope().toDynamicValue([], fn));

				expect(await c.get(token)).not.toBe(await c.get(token));
				expect(fn.mock.calls).toHaveLength(2);
			});

			it('singleton scope will only run the function once', async () => {
				const c = new Container();
				const fn = jest.fn<() => TokenType<typeof token>>().mockImplementation(() => ({ id: 10 }));
				c.load((bind) => bind(token).inSingletonScope().toDynamicValue([], fn));

				const resolved = await c.get(token);
				expect(resolved).toMatchObject({ id: 10 });
				expect(resolved).toBe(await c.get(token));
				expect(fn.mock.calls).toHaveLength(1);
			});

			it('can handle async errors', async () => {
				const c = new Container();
				const subrequest = new Token<string>('subrequest');
				c.load((bind) => {
					bind(token)
						.inSingletonScope()
						.toDynamicValue([], async (): Promise<{ id: number }> => {
							return Promise.reject(new Error('Hello, world!'));
						});
					bind(subrequest).toConstantValue('Hello world!');
				});

				await expect(c.get(token)).rejects.toMatchObject({
					cause: {
						message: 'Hello, world!',
					},
				});
			});

			it('doesn\'t print warnings if used with any kind of explicit scope', () => {
				const warn = jest.fn<LoggerFn>();
				const c = new Container({
					logger: { warn: warn as unknown as LoggerFn, debug: noop, info: noop, trace: noop },
				});

				c.load((bind) => {
					bind(token)
						.inTransientScope()
						.toDynamicValue([], () => ({ id: 10 }));
					bind(token)
						.inRequestScope()
						.toDynamicValue([], () => ({ id: 10 }));
					bind(token)
						.inSingletonScope()
						.toDynamicValue([], () => ({ id: 10 }));
				});

				expect(warn).toHaveBeenCalledTimes(0);
			});

			it('prints a warning if used without an explicit scope', async () => {
				const warn = jest.fn<LoggerFn>();
				const c = new Container({
					logger: { warn: warn as unknown as LoggerFn, debug: noop, info: noop, trace: noop },
				});
				c.load((bind) => bind(token).toDynamicValue([], () => ({ id: 10 })));

				expect(warn).toHaveBeenCalledTimes(1);
				expect(warn).toHaveBeenCalledWith(
					{ id: 'Token<Symbol(test)>' },
					'Using toDynamicValue() or toFactory() without an explicit scope can lead to performance issues. See https://github.com/mscharley/dot/discussions/80 for details.',
				);

				await c.get(token);

				expect(warn).toHaveBeenCalledTimes(1);
			});

			it('works properly for multiple dependencies', async () => {
				const c = new Container();
				const token2 = new Token<{ name: string }>('token2');
				const output = new Token<{ greeting: string }>('greeting');

				c.load((bind) => {
					bind(token).toConstantValue({ id: 10 });
					bind(token2).toConstantValue({ name: 'world' });
					bind(output)
						.inTransientScope()
						.toDynamicValue([token, token2], ({ id }, { name }) => ({
							greeting: `Hello, ${name} - id: ${id}`,
						}));
				});

				await expect(c.get(output)).resolves.toMatchObject({ greeting: 'Hello, world - id: 10' });
			});

			it('supports binding proxies', async () => {
				const c = new Container();
				c.load((bind) => {
					bind(token).toDynamicValue([], () => new Proxy({ id: 10 }, {}) as never);
				});
				await expect(c.get(token)).resolves.toMatchObject({ id: 10 });
			});
		});

		describe('toFactory()', () => {
			it('transient scope will always run the function', async () => {
				const c = new Container();
				const fn = jest.fn(() => (): TokenType<typeof token> => ({ id: 10 }));
				c.load((bind) => bind(token).inTransientScope().toFactory([], fn));

				expect(await c.get(token)).not.toBe(await c.get(token));
				expect(fn.mock.calls).toHaveLength(2);
			});

			it('singleton scope will only run the function once', async () => {
				const c = new Container();
				const fn = jest.fn(() => (): TokenType<typeof token> => ({ id: 10 }));
				c.load((bind) => bind(token).inSingletonScope().toFactory([], fn));

				const resolved = await c.get(token);
				expect(resolved).toMatchObject({ id: 10 });
				expect(resolved).toBe(await c.get(token));
				expect(fn.mock.calls).toHaveLength(1);
			});

			it('can create a child container', async () => {
				const c = new Container();
				const childFactory = new Token<() => interfaces.Container>('childFactory');
				const testToken = new Token<string>('test-child');

				c.load((bind) => {
					bind(token).toConstantValue({ id: 10 });
					bind(childFactory)
						.inSingletonScope()
						.toFactory([], ({ container }) => () => (): interfaces.Container => {
							const child = container.createChild();
							child.load((childBind) => {
								childBind(testToken)
									.inTransientScope()
									.toDynamicValue([token], ({ id }) => id.toString());
							});

							return child;
						});
				});

				const v = c.get(childFactory).then(async (cc) => cc().get(testToken));
				await expect(v).resolves.toBe('10');
			});

			it('doesn\'t print warnings if used with any kind of explicit scope', () => {
				const warn = jest.fn<LoggerFn>();
				const c = new Container({
					logger: { warn: warn as unknown as LoggerFn, debug: noop, info: noop, trace: noop },
				});

				c.load((bind) => {
					bind(token)
						.inTransientScope()
						.toFactory([], () => (): TokenType<typeof token> => ({ id: 10 }));
					bind(token)
						.inRequestScope()
						.toFactory([], () => (): TokenType<typeof token> => ({ id: 10 }));
					bind(token)
						.inSingletonScope()
						.toFactory([], () => (): TokenType<typeof token> => ({ id: 10 }));
				});

				expect(warn).toHaveBeenCalledTimes(0);
			});

			it('prints a warning if used without an explicit scope', async () => {
				const warn = jest.fn<LoggerFn>();
				const c = new Container({
					logger: { warn: warn as unknown as LoggerFn, debug: noop, info: noop, trace: noop },
				});
				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				c.load((bind) => bind(token).toFactory([], () => () => ({
					id: 10,
				})));

				expect(warn).toHaveBeenCalledTimes(1);
				expect(warn).toHaveBeenCalledWith(
					{ id: 'Token<Symbol(test)>' },
					'Using toDynamicValue() or toFactory() without an explicit scope can lead to performance issues. See https://github.com/mscharley/dot/discussions/80 for details.',
				);

				await c.get(token);

				expect(warn).toHaveBeenCalledTimes(1);
			});

			it('works properly for multiple dependencies', async () => {
				const c = new Container();
				const token2 = new Token<{ name: string }>('token2');
				const output = new Token<{ greeting: string }>('greeting');

				c.load((bind) => {
					bind(token).toConstantValue({ id: 10 });
					bind(token2).toConstantValue({ name: 'world' });
					bind(output)
						.inTransientScope()
						.toFactory([token, token2], () => ({ id }, { name }): TokenType<typeof output> => ({
							greeting: `Hello, ${name} - id: ${id}`,
						}));
				});

				await expect(c.get(output)).resolves.toMatchObject({ greeting: 'Hello, world - id: 10' });
			});

			it('supports binding proxies', async () => {
				const c = new Container();
				c.load((bind) => {
					bind(token).toFactory([], () => (): TokenType<typeof token> => new Proxy({ id: 10 }, {}) as never);
				});
				await expect(c.get(token)).resolves.toMatchObject({ id: 10 });
			});
		});

		describe('to()', () => {
			it('constructs a new instance', async () => {
				@injectable()
				class Test {
					public id = 10;
				}

				const c = new Container();
				c.load((bind) => bind(token).inSingletonScope().to(Test));

				const resolved = await c.get(token);
				expect(resolved).toMatchObject({ id: 10 });
				expect(resolved).toBe(await c.get(token));
			});
		});
	});

	describe('has()', () => {
		it('can check if a token has been bound', () => {
			const c = new Container();
			c.load((bind) => bind(new Token<undefined>('random.token')).toConstantValue(undefined));
			expect(c.has(token)).toBe(false);
			c.load((bind) => bind(token).toConstantValue({ id: 10 }));
			expect(c.has(token)).toBe(true);
		});

		it('can check if a class is autobound', () => {
			const c = new Container({ autobindClasses: true });
			expect(c.has(ImportTest)).toBe(true);
		});
	});

	describe('unbind()', () => {
		it('can unbind a token that has been bound', () => {
			const c = new Container();
			const t = new Token<undefined>('random.token');
			c.load((bind) => {
				bind(t).toConstantValue(undefined);
				bind(token).toConstantValue({ id: 10 });
			});
			expect(c.has(token)).toBe(true);
			c.unbind(token);
			expect(c.has(token)).toBe(false);
			expect(c.has(t)).toBe(true);
		});

		it('throws an error if the token has not been bound', () => {
			const c = new Container();
			c.load((bind) => bind(new Token<undefined>('random.token')).toConstantValue(undefined));
			expect(() => c.unbind(token)).toThrowErrorMatchingInlineSnapshot(
				'"Unable to unbind token because it is not bound: Symbol(test)"',
			);
		});
	});

	describe('rebind()', () => {
		it('is unbind then bind', async () => {
			const c = new Container();
			c.load((bind, _unbind, _isBound, rebind) => {
				bind(token).toConstantValue({ id: 10 });
				rebind(token).toConstantValue({ id: 20 });
			});

			await expect(c.get(token)).resolves.toMatchObject({ id: 20 });
		});

		it('can rebind tokens from other modules', async () => {
			const c = new Container();

			c.load((bind) => {
				bind(token).toConstantValue({ id: 10 });
			});
			c.load((_bind, _unbind, _isBound, rebind) => {
				rebind(token).toConstantValue({ id: 20 });
			});

			await expect(c.get(token)).resolves.toMatchObject({ id: 20 });
		});
	});

	describe('load()', () => {
		it('can bind tokens via a module', async () => {
			const c = new Container();
			const value = { id: 10 };
			c.load((bind) => {
				bind(token).toConstantValue(value);
				return undefined;
			});
			await expect(c.get(token)).resolves.toBe(value);
		});

		it('returns the correct types for sync and async loads', async () => {
			const c = new Container();
			const ambiguous = (async () => {
				/* no op */
			}) as interfaces.ContainerModule;

			expect(
				c.load(() => {
					/* no op */
				}),
			).toBeUndefined();
			await expect(
				c.load(async () => {
					/* no op */
				}),
			).resolves.toBeUndefined();
			await expect(c.load(ambiguous)).resolves.toBeUndefined();
		});
	});

	describe('constructor service identifier', () => {
		it('can use a class as a service identifier', async () => {
			const c = new Container();

			c.load((bind) => {
				bind(ImportTestDependency).toConstantValue('Hello world!');
				bind(ImportTest).toSelf();
			});

			await expect(c.get(ImportTest)).resolves.toMatchObject({ dep: 'Hello world!', id: 10 });
		});
	});

	describe('validate()', () => {
		it('succeeds for an empty container', () => {
			const c = new Container();
			expect(() => c.validate()).not.toThrow();
		});

		it('succeeds for a constant value', () => {
			const c = new Container();
			c.load((bind) => bind(token).toConstantValue({ id: 10 }));

			expect(() => c.validate()).not.toThrow();
		});

		it('succeeds for a dynamic value', () => {
			const c = new Container();
			c.load((bind) => {
				bind(token).toConstantValue({ id: 10 });
				bind(ImportTestDependency).toDynamicValue([token], ({ id }) => id.toString());
			});

			expect(() => c.validate()).not.toThrow();
		});

		it('succeeds for a constructor', () => {
			@injectable(token)
			class Test {
				public constructor(public id: { id: number }) {}
			}

			const c = new Container();
			c.load((bind) => {
				bind(token).toConstantValue({ id: 10 });
				bind(Test).toSelf();
			});

			expect(() => c.validate()).not.toThrow();
		});

		it('succeeds for unbound optional dependencies', () => {
			const c = new Container();
			c.load((bind) => bind(ImportTestDependency).toDynamicValue([withOptions(token, { optional: true })], (v) =>
				// eslint-disable-next-line jest/no-conditional-in-test
				(v?.id ?? 20).toString(),
			));

			expect(() => c.validate()).not.toThrow();
		});

		it('fails for a dynamic value with a missing dependency', () => {
			const c = new Container();
			c.load((bind) => bind(ImportTestDependency).toDynamicValue([token], ({ id }) => id.toString()));

			expect(() => c.validate()).toThrow('Unbound dependency: Token<Symbol(dep)> => Token<Symbol(test)>');
		});

		it('fails for a constructor with a missing dependency', () => {
			@injectable(token)
			class Test {
				public constructor(public id: { id: number }) {}
			}

			const c = new Container();
			c.load((bind) => bind(Test).toSelf());

			expect(() => c.validate()).toThrow('Unbound dependency: Constructor<Test> => Token<Symbol(test)>');
		});

		it('succeeds for unmanaged dependencies', () => {
			@injectable(unmanaged('Hello, world!'))
			class Test {
				public constructor(public value: string) {}
			}

			const c = new Container();
			c.load((bind) => bind(Test).toSelf());

			expect(() => c.validate()).not.toThrow();
		});
	});
});
