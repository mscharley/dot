import { describe, expect } from '@jest/globals';
import { experimental, forDecoratorsIt, tc39 } from '../__utils__/DecoratorTypes.js';
import { Container } from '../Container.js';
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

describe('Invalid decorator', () => {
	tc39.it('can successfully build a service', async () => {
		const c = new Container();
		c.bind(leaf).to(Leaf);
		c.bind(node).to(Node);
		c.bind(service).to(Service);

		await expect(c.get(service)).resolves.toMatchObject({ node: { leaf: { n: 1 } } });
	});

	experimental.it('fails to build a correct service', async () => {
		const c = new Container();
		c.bind(leaf).to(Leaf);
		c.bind(node).to(Node);
		c.bind(service).to(Service);

		await expect(c.get(service)).resolves.toMatchObject({ leaf: { n: 1 }, node: { leaf: undefined } });
	});

	forDecoratorsIt('fails to build a node', {
		tc39: async () => {
			const c = new Container();
			c.bind(leaf).to(Leaf);
			c.bind(node).to(Node);

			await expect(c.get(node)).rejects.toMatchObject({
				cause: {
					message: "Token hasn't been created yet: Symbol(leaf)",
				},
			});
		},
		experimental: async () => {
			const c = new Container();
			c.bind(leaf).to(Leaf);
			c.bind(node).to(Node);

			await expect(c.get(node)).resolves.toMatchObject({ leaf: undefined });
		},
	});
});
