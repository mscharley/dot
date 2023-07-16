import type * as interfaces from '../interfaces/index.js';
import { Token } from '../Token.js';

const _mappings = new WeakMap<interfaces.Constructor<unknown>, Token<unknown>>();

export const tokenForIdentifier = <T>(id: interfaces.ServiceIdentifier<T>): Token<T> => {
	if (id instanceof Token) {
		return id;
	} else {
		if (!_mappings.has(id)) {
			_mappings.set(id, new Token(id.name));
		}

		return _mappings.get(id) as Token<T>;
	}
};
