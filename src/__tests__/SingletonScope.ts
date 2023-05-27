import { describe, expect, it } from '@jest/globals';
import { Container } from '../Container';
import { Token } from '../Token';

const token = new Token<{ foo: string }>('jest.token');

describe('singleton scope', () => {
	it('returns the same thing in two requests', () => {
		const c = new Container();
		c.bind(token)
			.inSingletonScope()
			.toDynamicValue(() => ({ foo: 'Hello world!' }));

		const first = c.get(token);
		const second = c.get(token);

		expect(first).toBe(second);
	});
});
