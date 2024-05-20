import { beforeEach, describe, expect, it } from '@jest/globals';
import { getInjections, getPropertyInjections, registerInjection } from '../registry.js';
import { Container } from '../../container/Container.js';
import { inject } from '../inject.js';
import { injectable } from '../injectable.js';
import { Token } from '../../Token.js';

const strToken = new Token<string>('registry.string');

@injectable()
class TestClass {
	@inject(strToken)
	public str!: string;
}
registerInjection(TestClass, {
	type: 'request',
	options: { multiple: false, optional: false, metadata: {} },
	id: new Token<TestClass>('registry.class'),
});

describe('registry', () => {
	let container: Container;

	beforeEach(() => {
		container = new Container();
		container.bind(strToken).toConstantValue('hello world');
	});

	describe('getInjections', () => {
		it('can get all injections registered', () => {
			expect(getInjections(TestClass)).toMatchSnapshot();
		});

		it('throws an error for a random class', () => {
			expect(() => getInjections(class FirstTest {})).toThrow(
				'No @injectable() decorator for class: Constructor<FirstTest>',
			);
		});
	});

	describe('getPropertyInjections', () => {
		it('can get all property injections', () => {
			expect(getPropertyInjections(TestClass)).toMatchSnapshot();
		});

		it('throws an error for a random class', () => {
			expect(() => getInjections(class SecondTest {})).toThrow(
				'No @injectable() decorator for class: Constructor<SecondTest>',
			);
		});
	});
});
