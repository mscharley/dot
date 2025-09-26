/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import { createContainer, injectable, Token, unmanaged } from '../index.js';
import type { ErrorCode, interfaces } from '../index.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

const nameToken = new Token<string>('name');
const greetingToken = new Token<string>('greeting');

@injectable(greetingToken, [nameToken, { optional: true }])
class Test {
	public readonly greeting;

	public constructor(greeting: string, name?: string) {
		this.greeting = `${greeting}, ${name ?? 'world'}.`;
	}
}

@injectable(unmanaged('こんにちは'), [nameToken, { optional: true }])
class UnmanagedTest {
	public readonly greeting;

	public constructor(greeting: string, name?: string) {
		this.greeting = `${greeting}, ${name ?? 'world'}.`;
	}
}

describe('constructor injection', () => {
	let c: interfaces.Container;

	beforeEach(() => {
		c = createContainer();
		c.load((bind) => {
			bind(Test).toSelf();
			bind(UnmanagedTest).toSelf();
		});
	});

	it('can do a basic constructor parameter injection', async () => {
		c.load((bind) => {
			bind(greetingToken).toConstantValue('Hello');
			bind(nameToken).toConstantValue('John');
		});
		await expect(c.get(Test)).resolves.toMatchObject({ greeting: 'Hello, John.' });
	});

	it('can resolve optional dependencies', async () => {
		c.load((bind) => bind(greetingToken).toConstantValue('Hello'));
		await expect(c.get(Test)).resolves.toMatchObject({ greeting: 'Hello, world.' });
	});

	it('fails for non-optional dependencies', async () => {
		await expect(c.get(Test)).rejects.toMatchObject({
			cause: {
				code: 'INVALID_OPERATION' satisfies ErrorCode,
				message: 'No bindings exist for token: Token<Symbol(greeting)>',
			},
			code: 'TOKEN_RESOLUTION' satisfies ErrorCode,
			message: 'Unable to resolve token',
			resolutionPath: [tokenForIdentifier(Test), greetingToken],
		});
	});

	it('can handle unmanaged dependencies', async () => {
		await expect(c.get(UnmanagedTest)).resolves.toMatchObject({ greeting: 'こんにちは, world.' });
	});
});
