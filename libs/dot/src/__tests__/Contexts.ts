/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContainer, createContext, inContext, injectable } from '../index.js';
import { describe, expect, it } from '@jest/globals';

const context = createContext('TestContext');
const orphanedContext = createContext('OrphanedContext');

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
@inContext(orphanedContext)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class OrphanedWrapper {
	public constructor(public test: Test) {}
}

describe('autobinding contexts', () => {
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

	it('passes strict validation', async () => {
		const c = createContainer({ autobindClasses: false });
		expect(c.validate(true)).toBeUndefined();

		const child1 = c.createChild({ autobindClasses: true, contexts: [context] });
		expect(child1.validate(true)).toBeUndefined();

		const child2 = c.createChild({ autobindClasses: true, contexts: [orphanedContext] });
		// eslint-disable-next-line @typescript-eslint/require-await
		await expect((async (): Promise<void> => child2.validate(true))()).rejects.toMatchObject({
			errors: [
				{ message: 'Unbound dependency (context: Context<OrphanedContext:1>): Constructor<OrphanedWrapper> => Constructor<Test>' },
			],
		});

		const child3 = c.createChild({ autobindClasses: true, contexts: [context, orphanedContext] });
		expect(child3.validate(true)).toBeUndefined();
	});
});
