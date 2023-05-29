/* eslint-disable @typescript-eslint/no-magic-numbers */
import { describe, expect, it, jest } from '@jest/globals';
import { Container } from '../Container';
import { Token } from '../Token';
import type { TokenType } from '../Token';

const token = new Token<{ id: number }>('test');

describe('Bindings', () => {
	it('enforces finalising bindings', () => {
		const c = new Container();
		c.bind(token);

		expect(() => c.get(token)).toThrowErrorMatchingInlineSnapshot(
			'"Some bindings were started but not completed: Symbol(test)"',
		);
	});

	it('throws an error if no binding is found for a token', () => {
		const c = new Container();

		expect(() => c.get(token)).toThrowErrorMatchingInlineSnapshot(
			'"Unable to resolve token as no bindings exist: Symbol(test)"',
		);
	});

	it('can check if a token has been bound', () => {
		const c = new Container();
		expect(c.has(token)).toBe(false);
		c.bind(token).toConstantValue({ id: 10 });
		expect(c.has(token)).toBe(true);
	});

	describe('toConstantValue()', () => {
		it("can't be scoped", () => {
			const c = new Container();
			// @ts-expect-error This error is the actual test
			c.bind(token).inSingletonScope().toConstantValue;
		});

		it('acts like singleton scope', () => {
			const c = new Container();
			c.bind(token).toConstantValue({ id: 10 });
			expect(c.get(token)).toBe(c.get(token));
		});

		it('can handle async bindings', async () => {
			const c = new Container();
			await c.bind(token).toConstantValue(Promise.resolve({ id: 10 }));
			expect(c.get(token)).not.toBeNull();
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

			expect(c.get(token)).toBe(c.get(token));
			expect(fn.mock.calls.length).toBe(1);
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

			expect(c.get(token)).toBe(c.get(token));
		});
	});
});
