import { describe, expect, it } from '@jest/globals';
import { Context } from '../Context.js';
import { inContext } from '../../decorators/inContext.js';
import { inject } from '../../decorators/inject.js';
import { injectable } from '../../decorators/injectable.js';
import { Token } from '../Token.js';

const strToken = new Token<string>('registry.string');
const context = new Context('registry');

@injectable()
@inContext(context)
class TestClass {
	@inject(strToken)
	public str!: string;
}
context.registerInjection(TestClass, {
	type: 'request',
	options: { multiple: false, optional: false },
	id: new Token<TestClass>('registry.class'),
});

describe('registry', () => {
	describe('getInjections', () => {
		it('can get all injections registered', () => {
			expect(context.getInjections(TestClass)).toMatchSnapshot();
		});

		it('throws an error for a random class', () => {
			expect(() => context.getInjections(class FirstTest {})).toThrowError(
				'No @injectable() decorator for class: Constructor<FirstTest>',
			);
		});
	});

	describe('getPropertyInjections', () => {
		it('can get all property injections', () => {
			expect(context.getPropertyInjections(TestClass)).toMatchSnapshot();
		});

		it('throws an error for a random class', () => {
			expect(() => context.getInjections(class SecondTest {})).toThrowError(
				'No @injectable() decorator for class: Constructor<SecondTest>',
			);
		});
	});
});
