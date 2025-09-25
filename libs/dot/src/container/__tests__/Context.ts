/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import { Context } from '../Context.js';
import { inject } from '../../decorators/inject.js';
import { injectable } from '../../decorators/injectable.js';
import { Token } from '../../Token.js';

const strToken = new Token<string>('registry.string');

@injectable()
class TestClass {
	@inject(strToken)
	public str!: string;
}
Context.global.registerInjection(TestClass, {
	type: 'request',
	options: { multiple: false, optional: false, metadata: {} },
	id: new Token<TestClass>('registry.class'),
});

describe('registry', () => {
	let container: Container;

	beforeEach(() => {
		container = new Container();
		container.load((bind) => bind(strToken).toConstantValue('hello world'));
	});

	describe('registerInjection', () => {
		it('succeeds for an unseen class', () => {
			class Unseen {}
			Context.global.registerInjection(Unseen, {
				type: 'request',
				options: { multiple: false, optional: false, metadata: {} },
				id: new Token('Unseen'),
			});
			expect(Context.global.getInjections(Unseen)).toMatchSnapshot();
		});
	});

	describe('getInjections', () => {
		it('can get all injections registered', () => {
			expect(Context.global.getInjections(TestClass)).toMatchSnapshot();
		});

		it('throws an error for a random class', () => {
			expect(() => Context.global.getInjections(class FirstTest {})).toThrow(
				'No @injectable() decorator for class: Constructor<FirstTest>',
			);
		});
	});

	describe('getPropertyInjections', () => {
		it('can get all property injections', () => {
			expect(Context.global.getPropertyInjections(TestClass)).toMatchSnapshot();
		});

		it('throws an error for a random class', () => {
			expect(() => Context.global.getPropertyInjections(class SecondTest {})).toThrow(
				'No @injectable() decorator for class: Constructor<SecondTest>',
			);
		});
	});

	describe('getConstructorParameterInjections', () => {
		it('can get all property injections', () => {
			expect(Context.global.getConstructorParameterInjections(TestClass)).toMatchSnapshot();
		});

		it('throws an error for a random class', () => {
			expect(() => Context.global.getConstructorParameterInjections(class ThirdTest {})).toThrow(
				'No @injectable() decorator for class: Constructor<ThirdTest>',
			);
		});
	});
});
