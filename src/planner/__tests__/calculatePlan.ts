import type * as interfaces from '../../interfaces/index.js';
import type { Binding, DynamicBinding, StaticBinding } from '../../models/Binding.js';
import { describe, expect, it, jest } from '@jest/globals';
import { calculatePlan } from '../calculatePlan.js';
import { injectable } from '../../decorators/injectable.js';
import { Token } from '../../Token.js';

const strToken = new Token<string>('str');

@injectable(strToken)
class Test {
	public constructor(public readonly name: string) {}
}
const testToken = new Token<Test>('test');

describe('calculatePlan', () => {
	it('should return a single step for constantValue injections of classes with injections', () => {
		const bob = new Test('Bob');

		const plan = calculatePlan(
			<T, Meta extends interfaces.MetadataObject>(): Array<Binding<T, Meta>> =>
				[
					{
						type: 'static',
						token: testToken,
						id: Test,
						scope: 'request',
						metadata: {},
						value: bob,
					} satisfies StaticBinding<Test, interfaces.MetadataObject>,
				] as unknown as Array<Binding<T, Meta>>,
			() => bob as never,
			{
				type: 'request',
				id: testToken,
				options: {
					multiple: false,
					optional: false,
					metadata: {},
				},
			},
			[],
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
				resolutionPath: [testToken],
			},
		]);
	});

	it('should not call any functions to create elements in order to generate the plan', () => {
		const generator = jest.fn<() => Test>();
		const resolveBinding = jest.fn();

		calculatePlan(
			<T, Meta extends interfaces.MetadataObject>(): Array<Binding<T, Meta>> =>
				[
					{
						type: 'dynamic',
						generator,
						injections: [],
						id: testToken,
						token: testToken,
						scope: 'request',
						metadata: {},
					} satisfies DynamicBinding<Test, interfaces.MetadataObject>,
				] as unknown as Array<Binding<T, Meta>>,
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			resolveBinding as Parameters<typeof calculatePlan>[1],
			{
				type: 'request',
				id: testToken,
				options: {
					multiple: false,
					optional: false,
					metadata: {},
				},
			},
			[],
		);

		expect(generator).not.toHaveBeenCalled();
		expect(resolveBinding).not.toHaveBeenCalled();
	});
});
