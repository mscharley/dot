import { describe, expect, it } from '@jest/globals';
import type { Binding } from '../../models/Binding.js';
import { calculatePlan } from '../calculatePlan.js';
import { injectable } from '../../index.js';
import { Token } from '../../Token.js';

const strToken = new Token<string>('str');

@injectable(strToken)
class Test {
	public constructor(public readonly name: string) {}
}

describe('calculatePlan', () => {
	it('should return a single step for constantValue injections of classes with injections', () => {
		const testToken = new Token<Test>('test');
		const bob = new Test('Bob');

		const plan = calculatePlan(
			[
				{
					type: 'static',
					token: testToken,
					id: Test,
					scope: 'request',
					value: bob,
				} satisfies Binding<Test> as unknown as Binding<unknown>,
			],
			() => bob as never,
			{
				type: 'request',
				token: testToken,
				options: {
					multiple: false,
					optional: false,
				},
			},
		);

		expect(plan).toMatchObject([
			{
				cache: 'request',
				skipStepsIfFound: 1,
				token: testToken,
				type: 'fetchFromCache',
			},
			{
				cache: 'request',
				expectedTokensUsed: [],
				token: testToken,
				type: 'createClass',
			},
		]);
	});
});
