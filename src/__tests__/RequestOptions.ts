import type * as interfaces from '../interfaces/index.js';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../container/Container.js';
import { Token } from '../Token.js';

const token = new Token<string>('str');

describe('RequestOptions', () => {
	let c: interfaces.Container;

	beforeEach(() => {
		c = new Container();
	});

	it('is optional', async () => {
		c.bind(token).toConstantValue('Hello!');
		await expect(c.get(token)).resolves.toBe('Hello!');
	});

	it('allows for optional fetches', async () => {
		await expect(c.get(token, { optional: true })).resolves.toBe(undefined);
	});

	it('allows for multiple fetches', async () => {
		c.bind(token).toConstantValue('Hello,');
		c.bind(token).toConstantValue('world!');
		await expect(c.get(token, { multiple: true })).resolves.toStrictEqual(['Hello,', 'world!']);
	});
});
