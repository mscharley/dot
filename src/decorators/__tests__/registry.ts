import { beforeEach, describe, expect, it } from '@jest/globals';
import { getInjections, getPropertyInjections, registerInjection } from '../registry.js';
import { Container } from '../../Container.js';
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
	options: { optional: false },
	token: new Token<TestClass>('registry.class'),
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

		it('gets an empty array for a random class', () => {
			expect(getInjections(class {})).toStrictEqual([]);
		});
	});

	describe('getPropertyInjections', () => {
		it('can get all property injections', () => {
			expect(getPropertyInjections(TestClass)).toMatchSnapshot();
		});

		it('gets an empty array for a random class', () => {
			expect(getPropertyInjections(class {})).toStrictEqual([]);
		});
	});
});
