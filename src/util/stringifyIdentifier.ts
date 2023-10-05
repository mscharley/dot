import type * as interfaces from '../interfaces/index.js';
import { Token } from '../Token.js';

/**
 * Turn a service identifier into a string
 *
 * @public
 */
export const stringifyIdentifier = <T>(id: interfaces.ServiceIdentifier<T>): string => {
	if (id instanceof Token) {
		return `Token<${id.identifier.toString()}>`;
	} else {
		// Stryker disable all: Stryker only tests TC39, but this construct operates differently on experimental
		return `Constructor<${
			id.name !== '' ? id.name : (Object.getPrototypeOf(id) as interfaces.Constructor<unknown>).name
		}>`;
		// Stryker enable all
	}
};
