import type * as interfaces from '../interfaces/index.js';
import { Token } from '../Token.js';

const _mappings = new WeakMap<interfaces.Constructor<unknown>, Token<unknown>>();

export const tokenForIdentifier = <T>(id: interfaces.ServiceIdentifier<T>): Token<T> => {
	if (id instanceof Token) {
		return id;
	} else {
		if (!_mappings.has(id)) {
			// Stryker disable all: Stryker only tests TC39, but this construct operates differently on experimental
			_mappings.set(
				id,
				new Token(id.name !== '' ? id.name : (Object.getPrototypeOf(id) as interfaces.Constructor<unknown>).name),
			);
			// Stryker enable all
		}

		return _mappings.get(id) as Token<T>;
	}
};
