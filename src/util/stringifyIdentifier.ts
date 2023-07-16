import type * as interfaces from '../interfaces/index.js';
import { Token } from '../Token.js';

export const stringifyIdentifier = <T>(id: interfaces.ServiceIdentifier<T>): string => {
	if (id instanceof Token) {
		return `Token<${id.identifier.toString()}>`;
	} else {
		return `Constructor<${id.name}>`;
	}
};
