/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import { inject } from '../decorators/inject.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

const LeafToken = new Token<Leaf>('leaf');
@injectable()
class Leaf {}

const NodeToken = new Token<Node>('node');
@injectable()
class Node {
	@inject(LeafToken)
	public left!: Leaf;

	@inject(LeafToken)
	public right!: Leaf;
}

describe('transient scope', () => {
	let c: interfaces.Container;

	beforeEach(() => {
		c = new Container({ defaultScope: 'transient' });
		c.load((bind) => {
			bind(LeafToken).inTransientScope().to(Leaf);
			bind(NodeToken).to(Node);
		});
	});

	it('default scope is transient', async () => {
		const c2 = new Container();
		c2.load((bind) => {
			bind(LeafToken).to(Leaf);
			bind(NodeToken).to(Node);
		});

		const node = await c2.get(NodeToken);
		expect(node.left).not.toBe(node.right);
	});

	it('returns different things in two requests', async () => {
		const first = await c.get(LeafToken);
		const second = await c.get(LeafToken);

		expect(first).not.toBe(second);
	});

	it('returns a different thing in the same request', async () => {
		const node = await c.get(NodeToken);

		expect(node.left).not.toBe(node.right);
	});

	it('returns multiple values bound to the same token as transient scope', async () => {
		c.unbind(NodeToken);
		c.load((bind) => {
			bind(NodeToken).inTransientScope().to(Node);
			bind(NodeToken).inTransientScope().to(Node);
		});

		const vs: Node[] = await c.get(NodeToken, { multiple: true });
		expect(vs).toHaveLength(2);
		expect(vs[0]).not.toBe(vs[1]);
	});
});
