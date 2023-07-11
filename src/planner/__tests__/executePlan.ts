import { describe, expect, it } from '@jest/globals';
import { executePlan } from '../executePlan.js';
import type { Request } from '../../models/Request.js';
import { Token } from '../../Token.js';

const basicRequest = <T>(token: Token<T>): Request<T> => ({
	singletonCache: {},
	stack: {},
	token,
});

const strToken = new Token<string>('string');
const numToken = new Token<number>('number');

describe('executePlan', () => {
	it('throws an error if the plan creates too many things', async () => {
		await expect(async () =>
			executePlan(
				[
					{
						type: 'createClass',
						cache: undefined,
						expectedTokensUsed: [],
						token: strToken,
						generate: (): string => 'Hello',
					},
					{
						type: 'createClass',
						cache: undefined,
						expectedTokensUsed: [],
						token: numToken,
						generate: (): number => 1,
					},
					{
						type: 'createClass',
						cache: undefined,
						expectedTokensUsed: [],
						token: strToken,
						generate: (): string => 'world',
					},
				],
				basicRequest(strToken),
			),
		).rejects.toThrow(
			'Unresolved dependecies created, this is probably a bug. Please report this! Extra dependencies: Symbol(string), Symbol(number)',
		);
	});

	it("throws an error if the plan doesn't generate the type of thing it is supposed to", async () => {
		await expect(async () => executePlan([], basicRequest(strToken))).rejects.toThrow(
			'Unable to resolve final request: Symbol(string)',
		);
	});

	it("throws an error if there aren't enough services in the stack", async () => {
		await expect(async () =>
			executePlan(
				[
					{
						type: 'createClass',
						cache: undefined,
						expectedTokensUsed: [],
						token: strToken,
						generate: (): string => 'Hello world!',
					},
					{
						type: 'aggregateMultiple',
						count: 2,
						token: strToken,
					},
				],
				basicRequest(strToken),
			),
		).rejects.toThrow('Unable to load expected number of injected services: 1 !== 2');
	});
});
