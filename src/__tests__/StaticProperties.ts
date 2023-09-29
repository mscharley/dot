import { describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import { injectable } from '../index.js';

@injectable()
class Test {
	public static value = 'Hello, world!';

	public check(): string {
		return Test.value;
	}
}

describe('StaticProperties', () => {
	it('can be accessed without @injectable interfering', async () => {
		const c = new Container();
		c.bind(Test).toSelf();
		expect(Test.value).toBe('Hello, world!');
		await expect(c.get(Test).then((_) => _.check())).resolves.toBe('Hello, world!');
	});
});
