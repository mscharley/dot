import type { CreateInstance, PlanStep } from '../../models/Plan.js';
import { describe, expect, it } from '@jest/globals';
import { Container } from '../../container/Container.js';
import { executePlan } from '../executePlan.js';
import type { Request } from '../../models/Request.js';
import { ResolutionCache } from '../../container/ResolutionCache.js';
import { Token } from '../../Token.js';

const basicRequest = <T>(token: Token<T>): Request<T> => ({
	container: new Container(),
	singletonCache: new ResolutionCache(),
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
						binding: undefined,
						expectedTokensUsed: [],
						token: strToken,
						generate: (): string => 'Hello',
						resolutionPath: [strToken],
					} satisfies CreateInstance<string>,
					{
						type: 'createClass',
						cache: undefined,
						binding: undefined,
						expectedTokensUsed: [],
						token: numToken,
						generate: (): number => 1,
						resolutionPath: [numToken],
					} satisfies CreateInstance<number> as unknown as PlanStep<string>,
					{
						type: 'createClass',
						cache: undefined,
						binding: undefined,
						expectedTokensUsed: [],
						token: strToken,
						generate: (): string => 'world',
						resolutionPath: [strToken],
					} satisfies CreateInstance<string>,
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
						binding: undefined,
						expectedTokensUsed: [],
						token: strToken,
						generate: (): string => 'Hello world!',
						resolutionPath: [strToken],
					} satisfies CreateInstance<string>,
					{
						type: 'aggregateMultiple',
						count: 2,
						token: strToken,
						resolutionPath: [strToken],
					},
				],
				basicRequest(strToken),
			),
		).rejects.toMatchObject({
			cause: {
				message: 'Unexpected number of services: 1 !== 2',
			},
			message: 'Unable to load injected services',
			resolutionPath: [strToken],
		});
	});
});
