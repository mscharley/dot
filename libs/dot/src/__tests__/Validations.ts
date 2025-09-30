/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @typescript-eslint/require-await */

import { createContainer, createContext, inContext, injectable, inNoContext, Token, unmanaged, withOptions } from '../index.js';
import { describe, expect, it } from '@jest/globals';

const token = new Token<{ id: number }>('test');
const dependency = new Token<string>('dep');

const context = createContext('TestContext');
const orphanedContext = createContext('OrphanedContext');

@injectable()
@inContext(context)
class Test {
	public id = 10;
}

@injectable(Test)
@inContext(orphanedContext)
class OrphanedWrapper {
	public constructor(public test: Test) {}
}

@injectable(Test)
@inNoContext()
class ExplicitBoundOnly {
	public id = 20;

	public constructor(public test: Test) {}
}

describe('container validations', () => {
	it('succeeds for an empty container', () => {
		const c = createContainer();
		expect(() => c.validate()).not.toThrow();
	});

	it('succeeds for a constant value', () => {
		const c = createContainer();
		c.load((bind) => bind(token).toConstantValue({ id: 10 }));

		expect(() => c.validate()).not.toThrow();
	});

	it('succeeds for a dynamic value', () => {
		const c = createContainer();
		c.load((bind) => {
			bind(token).toConstantValue({ id: 10 });
			bind(dependency).toDynamicValue([token], ({ id }) => id.toString());
		});

		expect(() => c.validate()).not.toThrow();
	});

	it('succeeds for a constructor', () => {
		@injectable(token)
		@inNoContext()
		class LocalTest {
			public constructor(public id: { id: number }) {}
		}

		const c = createContainer();
		c.load((bind) => {
			bind(token).toConstantValue({ id: 10 });
			bind(LocalTest).toSelf();
		});

		expect(() => c.validate()).not.toThrow();
	});

	it('succeeds for unbound optional dependencies', () => {
		const c = createContainer();
		c.load((bind) => bind(dependency).toDynamicValue([withOptions(token, { optional: true })], (v) =>
		// eslint-disable-next-line jest/no-conditional-in-test
			(v?.id ?? 20).toString(),
		));

		expect(() => c.validate()).not.toThrow();
	});

	it('fails for a dynamic value with a missing dependency', async () => {
		const c = createContainer();
		c.load((bind) => bind(dependency).toDynamicValue([token], ({ id }) => id.toString()));

		await expect((async (): Promise<void> => c.validate(true))()).rejects.toMatchObject({
			errors: [
				{ message: 'Unbound dependency: Token<Symbol(dep)> => Token<Symbol(test)>' },
			],
		});
	});

	it('fails for a constructor with a missing dependency', async () => {
		@injectable(token)
		@inNoContext()
		class LocalTest {
			public constructor(public id: { id: number }) {}
		}

		const c = createContainer();
		c.load((bind) => bind(LocalTest).toSelf());

		await expect((async (): Promise<void> => c.validate(true))()).rejects.toMatchObject({
			errors: [
				{ message: 'Unbound dependency: Constructor<LocalTest> => Token<Symbol(test)>' },
			],
		});
	});

	it('succeeds for unmanaged dependencies', () => {
		@injectable(unmanaged('Hello, world!'))
		@inNoContext()
		class LocalTest {
			public constructor(public value: string) {}
		}

		const c = createContainer();
		c.load((bind) => bind(LocalTest).toSelf());

		expect(() => c.validate()).not.toThrow();
	});

	describe('contexts', () => {
		it('handles simple case', () => {
			const c = createContainer({ autobindClasses: false });
			expect(c.validate(true)).toBeUndefined();
		});

		it('handles contexts with explicit -> autobound bindings', async () => {
			const c = createContainer({ autobindClasses: false });
			const child = c.createChild({ autobindClasses: true, contexts: [context] });
			child.load((bind) => {
				// Add an explicit binding to something autobound.
				bind(ExplicitBoundOnly).toSelf();
			});
			expect(child.validate(true)).toBeUndefined();
		});

		it('fails if a context doesn\'t have all the needed bindings', async () => {
			const c = createContainer({ autobindClasses: false });
			const child = c.createChild({ autobindClasses: true, contexts: [orphanedContext] });
			expect(child.has(OrphanedWrapper)).toBe(true);

			await expect((async (): Promise<void> => child.validate(true))()).rejects.toMatchObject({
				errors: [
					{ message: 'Unbound dependency (context: Context<OrphanedContext:1>): Constructor<OrphanedWrapper> => Constructor<Test>' },
				],
			});
		});

		it('handles cross-context requests', async () => {
			const c = createContainer({ autobindClasses: false });
			const child = c.createChild({ autobindClasses: true, contexts: [context, orphanedContext] });
			expect(child.validate(true)).toBeUndefined();
		});
	});
});
