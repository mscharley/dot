import { describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import { inject } from '../decorators/inject.js';
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';

const numberToken = new Token<number>('nested.number');
const stringToken = new Token<string>('nested.string');
@injectable()
class TestClass {
	@inject(stringToken)
	public test!: string;
}
const classToken = new Token<TestClass>('nested.class');

describe('nested requests', () => {
	it('can handle nested requests without loosing track', async () => {
		const container = new Container();
		container.bind(numberToken).toConstantValue(10);
		container
			.bind(stringToken)
			.inTransientScope()
			.toDynamicValue([numberToken], (n) => n.toFixed(2));
		container.bind(classToken).to(TestClass);

		await expect(container.get(classToken)).resolves.toMatchObject({ test: '10.00' });
	});
});
