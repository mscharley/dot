/* eslint-disable @typescript-eslint/no-magic-numbers */
import { describe, expect, it, jest } from '@jest/globals';
import { BindingBuilder } from '../BindingBuilder';
import { Container } from '../Container';
import type { ScopeOptions } from '../interfaces/ScopeOptions';
import { Token } from '../Token';
import type { TokenType } from '../Token';

const token = new Token<{ id: number }>('test');

describe('Bindings', () => {
	it('enforces finalising bindings', () => {
		const c = new Container();
		c.bind(token);
		c.bind(new Token('foo'));

		expect(() => c.get(token)).toThrowErrorMatchingInlineSnapshot(
			'"Some bindings were started but not completed: Symbol(test), Symbol(foo)"',
		);
	});

	it('throws an error if no binding is found for a token', () => {
		const c = new Container();

		expect(() => c.get(token)).toThrowErrorMatchingInlineSnapshot(
			'"Unable to resolve token as no bindings exist: Symbol(test)"',
		);
	});

	it('invalid bindings trigger an error', () => {
		const c = new Container();
		c.addBinding(token, 'foo' as ScopeOptions, new BindingBuilder(token, c.addBinding), () => ({ id: 10 }));

		expect(() => c.get(token)).toThrowErrorMatchingInlineSnapshot('"Invalid scope for binding: foo"');
	});

	it('fails if attempting a resolution outside a request', () => {
		expect(() => Container.resolve(token)).toThrowErrorMatchingInlineSnapshot(
			'"Unable to resolve token as no container is currently making a request: Symbol(test)"',
		);
	});

	describe('isProcessingRequest', () => {
		it('can display if a request is running', () => {
			const c = new Container();
			c.bind(token).toDynamicValue(() => {
				expect(Container.isProcessingRequest).toBe(true);
				return { id: 10 };
			});
			expect(c.get(token)).toMatchObject({ id: 10 });
		});

		it('properly ends the current request if it fails', () => {
			const c = new Container();
			expect(() => c.get(token)).toThrowError();
			expect(Container.isProcessingRequest).toBe(false);
		});
	});

	describe('bind()', () => {
		describe('toConstantValue()', () => {
			it("can't be scoped", () => {
				const c = new Container();
				// @ts-expect-error This error is the actual test
				c.bind(token).inSingletonScope().toConstantValue;
			});

			it('acts like singleton scope', () => {
				const c = new Container();
				const result = c.bind(token).toConstantValue({ id: 10 });
				expect(result).not.toBeInstanceOf(Promise);
				const resolved = c.get(token);
				expect(resolved).toMatchObject({ id: 10 });
				expect(resolved).toBe(c.get(token));
			});

			it('can handle async bindings', async () => {
				const c = new Container();
				const result = c.bind(token).toConstantValue(Promise.resolve({ id: 10 }));
				expect(result).toBeInstanceOf(Promise);
				await result;
				expect(c.get(token)).toMatchObject({ id: 10 });
			});
		});

		describe('toDynamicValue()', () => {
			it('transient scope will always run the function', () => {
				const c = new Container();
				const fn = jest.fn<() => TokenType<typeof token>>().mockImplementation(() => ({ id: 10 }));
				c.bind(token).inTransientScope().toDynamicValue(fn);

				expect(c.get(token)).not.toBe(c.get(token));
				expect(fn.mock.calls.length).toBe(2);
			});

			it('singleton scope will only run the function once', () => {
				const c = new Container();
				const fn = jest.fn<() => TokenType<typeof token>>().mockImplementation(() => ({ id: 10 }));
				c.bind(token).inSingletonScope().toDynamicValue(fn);

				const resolved = c.get(token);
				expect(resolved).toMatchObject({ id: 10 });
				expect(resolved).toBe(c.get(token));
				expect(fn.mock.calls.length).toBe(1);
			});

			it('can handle nested requests', () => {
				const c = new Container();
				const subrequest = new Token<string>('subrequest');
				c.bind(token)
					.inSingletonScope()
					.toDynamicValue(({ container }) => {
						expect(container.get(subrequest)).toBe('Hello world!');
						return { id: 10 };
					});
				c.bind(subrequest).toConstantValue('Hello world!');

				expect(c.get(token)).toMatchObject({ id: 10 });
			});
		});

		describe('to()', () => {
			it('constructs a new instance', () => {
				const c = new Container();
				c.bind(token)
					.inSingletonScope()
					.to(
						class {
							public id = 10;
						},
					);

				const resolved = c.get(token);
				expect(resolved).toMatchObject({ id: 10 });
				expect(resolved).toBe(c.get(token));
			});
		});
	});

	describe('has()', () => {
		it('can check if a token has been bound', () => {
			const c = new Container();
			expect(c.has(token)).toBe(false);
			c.bind(token).toConstantValue({ id: 10 });
			expect(c.has(token)).toBe(true);
		});
	});

	describe('unbind()', () => {
		it('can unbind a token that has been bound', () => {
			const c = new Container();
			c.bind(token).toConstantValue({ id: 10 });
			expect(c.has(token)).toBe(true);
			c.unbind(token);
			expect(c.has(token)).toBe(false);
		});

		it('throws an error if the token has not been bound', () => {
			const c = new Container();
			expect(() => c.unbind(token)).toThrowErrorMatchingInlineSnapshot(
				'"Unable to unbind token because it is not bound: Symbol(test)"',
			);
		});
	});

	describe('rebind()', () => {
		it('is unbind then bind', () => {
			const c = new Container();
			c.bind(token).toConstantValue({ id: 10 });
			c.rebind(token).toConstantValue({ id: 20 });

			expect(c.get(token)).toMatchObject({ id: 20 });
		});
	});

	describe('load()', () => {
		it('can bind tokens via a module', () => {
			const c = new Container();
			const value = { id: 10 };
			c.load((bind) => {
				bind(token).toConstantValue(value);
				return undefined;
			});
			expect(c.get(token)).toBe(value);
		});

		it('returns the correct types for sync and async loads', async () => {
			const c = new Container();

			c.load(() => {
				/* no op */
			});
			await c.load(async () => {
				/* no op */
			});
		});
	});
});
