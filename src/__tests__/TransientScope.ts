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
		c.bind(LeafToken).inTransientScope().to(Leaf);
		c.bind(NodeToken).to(Node);
	});

	it('default scope is transient', async () => {
		const c2 = new Container();
		c2.bind(LeafToken).to(Leaf);
		c2.bind(NodeToken).to(Node);

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
		c.bind(NodeToken).inTransientScope().to(Node);
		c.bind(NodeToken).inTransientScope().to(Node);

		const vs = await c.get(NodeToken, { multiple: true });
		expect(vs).toHaveLength(2);
		expect(vs[0]).not.toBe(vs[1]);
	});
});
