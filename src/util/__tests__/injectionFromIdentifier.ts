import type * as interfaces from '../../interfaces/index.js';
import { describe, expect, it } from '@jest/globals';
import type { Injection } from '../../models/Injection.js';
import { injectionFromIdentifier } from '../injectionFromIdentifier.js';
import { Token } from '../../Token.js';
import { unmanaged } from '../../decorators/unmanaged.js';
import { withOptions } from '../../decorators/withOptions.js';

const token = new Token<string>('test');

describe('injectionFromIdentifier', () => {
	it('generates for a token', () => {
		expect(injectionFromIdentifier(token, 0)).toEqual({
			type: 'constructorParameter',
			id: token,
			index: 0,
			options: { multiple: false, optional: false, metadata: {} },
		} satisfies Injection<string, interfaces.MetadataObject>);
	});

	it('generates for a token with options', () => {
		expect(injectionFromIdentifier(withOptions(token, { multiple: true }), 0)).toEqual({
			type: 'constructorParameter',
			id: token,
			index: 0,
			options: { multiple: true, optional: false, metadata: {} },
		} satisfies Injection<string, interfaces.MetadataObject>);
	});

	it('generates for a constructor', () => {
		class Test {}

		expect(injectionFromIdentifier(Test, 0)).toEqual({
			type: 'constructorParameter',
			id: Test,
			index: 0,
			options: { multiple: false, optional: false, metadata: {} },
		} satisfies Injection<Test, interfaces.MetadataObject>);
	});

	it('generates for a direct injection', () => {
		const id = unmanaged('foobar');
		expect(injectionFromIdentifier(id, 0)).toEqual({
			type: 'unmanagedConstructorParameter',
			id: id.token,
			index: 0,
			options: { multiple: false, optional: false, metadata: {} },
			value: id,
		} satisfies Injection<string, interfaces.MetadataObject>);
	});
});
