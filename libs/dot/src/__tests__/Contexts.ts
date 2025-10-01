/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContainer, createContext, inContext, inGlobalContext, injectable, inNoContext } from '../index.js';
import { describe, expect, it } from '@jest/globals';
import { Context } from '../container/Context.js';

const context = createContext('TestContext');

@injectable()
@inContext(context)
class Test {
	public id = 10;
}

@injectable(Test)
@inContext(context)
class TestWrapper {
	public constructor(public test: Test) {}
}

@injectable(Test)
@inNoContext()
class ExplicitBoundOnly {
	public id = 20;

	public constructor(public test: Test) {}
}

@injectable()
@inGlobalContext()
@inContext(context)
class AlsoInGlobalContext {
	public id = 30;
}

@injectable()
@inContext(context)
class SubclassTest extends Test {
	public name = 'subclass';
}

describe('autobinding contexts', () => {
	it('can handle subclasses of autobound classes', async () => {
		const c = createContainer({ autobindClasses: true, contexts: [context] });

		await expect(c.get(SubclassTest)).resolves.toMatchObject({ id: 10, name: 'subclass' });
	});

	it('can\'t autobind classes outside their context', async () => {
		const c = createContainer({ autobindClasses: true, contexts: [] });

		await expect(c.get(Test)).rejects.toThrow('Unable to resolve token');
	});

	it('can fetch autobound classes in other contexts, if explicitly bound', async () => {
		const c = createContainer({ autobindClasses: true, contexts: [] });
		c.load((bind) => {
			bind(Test).toSelf();
		});

		await expect(c.get(Test)).resolves.toMatchObject({ id: 10 });
	});

	it('can\'t autobind dependencies outside their context', async () => {
		const c = createContainer({ autobindClasses: true, contexts: [] });
		c.load((bind) => {
			bind(Test).toSelf();
		});

		await expect(c.get(TestWrapper)).rejects.toThrow('Unable to resolve token');
	});

	it('allow containers to fetch autobound classes in their context', async () => {
		const c = createContainer({ autobindClasses: true, contexts: [context] });

		await expect(c.get(Test)).resolves.toMatchObject({ id: 10 });
	});

	it('allow containers to fetch autobound dependencies in their context', async () => {
		const c = createContainer({ autobindClasses: true, contexts: [context] });

		await expect(c.get(TestWrapper)).resolves.toMatchObject({ test: { id: 10 } });
	});

	it('has classes it can autobind in context', () => {
		const c = createContainer({ autobindClasses: true, contexts: [context] });
		expect(c.has(Test)).toBe(true);
	});

	it('does not have classes it can not autobind from other contexts', () => {
		const c = createContainer({ autobindClasses: true, contexts: [] });
		expect(c.has(Test)).toBe(false);
	});

	it('allows @injectable with explicit bindings only for use with to() and toSelf()', async () => {
		expect(Context.global.has(ExplicitBoundOnly)).toBe(false);
		expect(context.has(ExplicitBoundOnly)).toBe(false);

		const c = createContainer({ autobindClasses: true, contexts: [context] });
		c.load((bind) => {
			bind(ExplicitBoundOnly).toSelf();
		});

		await c.get(ExplicitBoundOnly);
		await expect(c.get(ExplicitBoundOnly)).resolves.toMatchObject({ id: 20, test: { id: 10 } });
	});

	it('allows injectables to specify they should be included in the global context', () => {
		expect(Context.global.has(AlsoInGlobalContext)).toBe(true);
		expect(context.has(AlsoInGlobalContext)).toBe(true);
	});
});
