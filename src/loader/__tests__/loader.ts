/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable jest/expect-expect */
import { describe, expect, it, jest } from '@jest/globals';
import { load } from '../index.js';
import type { LoadResult } from '../index.js';

describe('node-loader', () => {
	const next = jest.fn<(url: string, context: unknown) => Promise<LoadResult>>();

	const expectLoadContents = (contents: string): ReturnType<typeof expect<Promise<string>>> => {
		next.mockImplementationOnce(async () => Promise.resolve({
			source: Buffer.from(contents, 'utf8'),
		}));

		// eslint-disable-next-line jest/valid-expect
		return expect(load('test.js', { format: 'module' }, next).then((v) => v.source.toString('utf8')));
	};

	it('passes through non-module results', async () => {
		const result = {
			source: Buffer.from('Hello world!', 'utf8'),
		};
		next.mockImplementationOnce(async () => Promise.resolve(result));

		await expect(load('test.txt', { format: 'text' }, next)).resolves.toBe(result);
	});

	it('can inject for a constant export', async () => {
		await expectLoadContents('export const foo = {};').resolves.toMatchInlineSnapshot(`
"export const foo = {};
if (foo != null && ['function', 'object'].includes(typeof foo)) foo[Symbol.for('__dot_import_stats')] = {"url":"test.js","name":"foo"};"
`);
	});

	it('can inject for a let export', async () => {
		await expectLoadContents('export let foo = {};').resolves.toMatchInlineSnapshot(`
"export let foo = {};
if (foo != null && ['function', 'object'].includes(typeof foo)) foo[Symbol.for('__dot_import_stats')] = {"url":"test.js","name":"foo"};"
`);
	});

	it('can inject for an exported class', async () => {
		await expectLoadContents('export class Test {};').resolves.toMatchInlineSnapshot(`
"export class Test {};
if (Test != null && ['function', 'object'].includes(typeof Test)) Test[Symbol.for('__dot_import_stats')] = {"url":"test.js","name":"Test"};"
`);
	});

	it('can inject for an exported function', async () => {
		await expectLoadContents('export function test() {};').resolves.toMatchInlineSnapshot(`
"export function test() {};
if (test != null && ['function', 'object'].includes(typeof test)) test[Symbol.for('__dot_import_stats')] = {"url":"test.js","name":"test"};"
`);
	});

	it('can inject an exported object destructure', async () => {
		await expectLoadContents('export const { test } = { test: {} };').resolves.toMatchInlineSnapshot(`
"export const { test } = { test: {} };
if (test != null && ['function', 'object'].includes(typeof test)) test[Symbol.for('__dot_import_stats')] = {"url":"test.js","name":"test"};"
`);
	});

	it('can inject an exported array destructure', async () => {
		await expectLoadContents('export const [test] = [{}];').resolves.toMatchInlineSnapshot(`
"export const [test] = [{}];
if (test != null && ['function', 'object'].includes(typeof test)) test[Symbol.for('__dot_import_stats')] = {"url":"test.js","name":"test"};"
`);
	});

	it('can\'t inject for a default export of an expression', async () => {
		await expectLoadContents('export default ``;').resolves.toMatchInlineSnapshot(`
"export default \`\`;
"
`);
		await expectLoadContents('export default "";').resolves.toMatchInlineSnapshot(`
"export default "";
"
`);
		await expectLoadContents('export default {};').resolves.toMatchInlineSnapshot(`
"export default {};
"
`);
		await expectLoadContents('export default [];').resolves.toMatchInlineSnapshot(`
"export default [];
"
`);
		await expectLoadContents('export default function() {};').resolves.toMatchInlineSnapshot(`
"export default function() {};
"
`);
		await expectLoadContents('export default (function foo() {});').resolves.toMatchInlineSnapshot(`
"export default (function foo() {});
"
`);
	});

	it('can inject for a default export of a named function', async () => {
		await expectLoadContents('export default function foo() {};').resolves.toMatchInlineSnapshot(`
"export default function foo() {};
if (foo != null && ['function', 'object'].includes(typeof foo)) foo[Symbol.for('__dot_import_stats')] = {"url":"test.js","name":"foo"};"
`);
	});

	it('can inject for a default export of an identifier', async () => {
		await expectLoadContents('const foo = {}; export default foo;').resolves.toMatchInlineSnapshot(`
"const foo = {}; export default foo;
if (foo != null && ['function', 'object'].includes(typeof foo)) foo[Symbol.for('__dot_import_stats')] = {"url":"test.js","name":"foo"};"
`);
	});
});
