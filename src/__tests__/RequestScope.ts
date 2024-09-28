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

describe('request scope', () => {
	let c: interfaces.Container;

	beforeEach(() => {
		c = new Container({ defaultScope: 'transient' });
		c.load((bind) => {
			bind(LeafToken).inRequestScope().to(Leaf);
			bind(NodeToken).to(Node);
		});
	});

	it('returns different things in two requests', async () => {
		const first = await c.get(LeafToken);
		const second = await c.get(LeafToken);

		expect(first).not.toBe(second);
	});

	it('returns the same thing in the same request', async () => {
		const node = await c.get(NodeToken);

		expect(node.left).toBe(node.right);
	});

	it('returns multiple values bound to the same token as request scope', async () => {
		c.unbind(NodeToken);
		c.load((bind) => {
			bind(NodeToken).inRequestScope().to(Node);
			bind(NodeToken).inRequestScope().to(Node);
		});

		const vs = await c.get(NodeToken, { multiple: true });
		expect(vs).toHaveLength(2);
		expect(vs[0]).not.toBe(vs[1]);
	});
});
