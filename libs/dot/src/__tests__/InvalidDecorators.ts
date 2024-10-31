/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import type { ErrorCode } from '../Error.js';
import { inject } from '../decorators/inject.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

const leaf = new Token<Leaf>('leaf');
const node = new Token<Node>('node');
const service = new Token<Service>('service');

@injectable()
class Leaf {
	public n = 1;
}

class Node {
	@inject(leaf)
	public leaf!: Leaf;
}

@injectable()
class Service {
	@inject(node)
	public node!: Node;
}

describe('invalid decorator', () => {
	it('fails to build a service', async () => {
		const c = new Container();
		c.load((bind) => {
			bind(leaf).to(Leaf);
			bind(node).to(Node);
			bind(service).to(Service);
		});

		await expect(c.get(service)).rejects.toMatchObject({
			code: 'INVALID_OPERATION' satisfies ErrorCode,
			message: 'No @injectable() decorator for class: Constructor<Node>',
		});
	});

	it('fails to build a node', async () => {
		const c = new Container();
		c.load((bind) => {
			bind(leaf).to(Leaf);
			bind(node).to(Node);
		});

		await expect(c.get(node)).rejects.toMatchObject({
			code: 'INVALID_OPERATION' satisfies ErrorCode,
			message: 'No @injectable() decorator for class: Constructor<Node>',
		});
	});

	it('fails to construct a service without @injectable', async () => {
		class Test {}

		const c = new Container();

		c.load((bind) => bind(Test).toSelf());
		await expect(c.get(Test)).rejects.toMatchObject({
			message: 'No @injectable() decorator for class: Constructor<Test>',
			code: 'INVALID_OPERATION' satisfies ErrorCode,
		});

		c.load((_bind, _unbind, _isBound, rebind) => rebind(Test).to(Test));
		await expect(c.get(Test)).rejects.toMatchObject({
			message: 'No @injectable() decorator for class: Constructor<Test>',
			code: 'INVALID_OPERATION' satisfies ErrorCode,
		});
	});

	it('allows user provided values for a service without @injectable', async () => {
		class Test {}

		const c = new Container();

		c.load((bind) => bind(Test).toConstantValue(new Test()));
		await expect(c.get(Test)).resolves.toBeInstanceOf(Test);

		c.load((_bind, _unbind, _isBound, rebind) => rebind(Test).toDynamicValue([], () => new Test()));
		await expect(c.get(Test)).resolves.toBeInstanceOf(Test);
	});
});
