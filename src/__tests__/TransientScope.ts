import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../Container';
import { inject } from '../decorators/inject';
import { injectable } from '../decorators/injectable';
import { Token } from '../Token';

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
	let c: Container;

	beforeEach(() => {
		c = new Container({ defaultScope: 'transient' });
		c.bind(LeafToken).inTransientScope().to(Leaf);
		c.bind(NodeToken).to(Node);
	});

	it('default scope is transient', () => {
		const c2 = new Container();
		c2.bind(LeafToken).to(Leaf);
		c2.bind(NodeToken).to(Node);

		const node = c2.get(NodeToken);
		expect(node.left).not.toBe(node.right);
	});

	it('returns different things in two requests', () => {
		const first = c.get(LeafToken);
		const second = c.get(LeafToken);

		expect(first).not.toBe(second);
	});

	it('returns a different thing in the same request', () => {
		const node = c.get(NodeToken);

		expect(node.left).not.toBe(node.right);
	});
});
