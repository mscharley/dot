import type * as interfaces from '../interfaces/index.js';
import type { Injection } from '../models/Injection.js';
import { Token } from '../Token.js';
import { tokenForIdentifier } from './tokenForIdentifier.js';

export const injectionFromIdentifier = <T>(id: interfaces.InjectionIdentifier<T>, index: number): Injection<T> => {
	const token = Array.isArray(id) ? id[0] : id;
	const partialOpts = Array.isArray(id) ? id[1] : {};
	if (typeof token === 'function' || token instanceof Token) {
		return {
			type: 'constructorParameter',
			index,
			token: tokenForIdentifier(token),
			options: {
				multiple: false,
				optional: false,
				...partialOpts,
			},
		};
	} else {
		return {
			type: 'unmanagedConstructorParameter',
			index,
			token: token.token,
			options: {
				multiple: false,
				optional: false,
			},
			value: token,
		};
	}
};
