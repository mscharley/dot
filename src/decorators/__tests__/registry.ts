/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import { getConstructorParameterInjections, getInjections, getPropertyInjections, registerInjection } from '../registry.js';
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

	describe('registerInjection', () => {
		it('succeeds for an unseen class', () => {
			class Unseen {}
			registerInjection(Unseen, {
				type: 'request',
				options: { multiple: false, optional: false, metadata: {} },
				id: new Token('Unseen'),
			});
			expect(getInjections(Unseen)).toMatchSnapshot();
		});
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
			expect(() => getPropertyInjections(class SecondTest {})).toThrow(
				'No @injectable() decorator for class: Constructor<SecondTest>',
			);
		});
	});

	describe('getConstructorParameterInjections', () => {
		it('can get all property injections', () => {
			expect(getConstructorParameterInjections(TestClass)).toMatchSnapshot();
		});

		it('throws an error for a random class', () => {
			expect(() => getConstructorParameterInjections(class ThirdTest {})).toThrow(
				'No @injectable() decorator for class: Constructor<ThirdTest>',
			);
		});
	});
});
