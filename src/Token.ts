/**
 * A simple identifier that has a reference to a type which can be injected
 *
 * @remarks
 *
 * Tokens are generated in such a way that each token refers to a unique binding, even if the token is given the same
 * string name. If you use the same name in multiple places then some logs may become a little more confusing but this
 * design prevents name collisions between two potential codebases which may not necessarily know about each other.
 * This allows for libraries which export a ContainerModule and set of tokens as the primary way to interact with the
 * library.
 *
 * @public
 */

import { InvalidOperationError } from './Error.js';

export class Token<out T> {
	/**
	 * The Symbol used as the unique identifier for this token
	 *
	 * @internal
	 */
	public readonly identifier: symbol;

	public constructor(name: string) {
		this.identifier = Symbol(name);
	}

	/**
	 * This is a dummy variable, it throws an error on access
	 *
	 * @remarks
	 *
	 * This property mainly exists to facilitate some compatibility across ESM and CommonJS in mixed environments. It is
	 * only here for the extra type information and accessing the value of this property is an error.
	 */
	public get _witness(): T {
		throw new InvalidOperationError("Don't access the token witness, this isn't a real variable");
	}
}

/**
 * A helper type to extract the type that a token will inject
 *
 * @public
 */
export type TokenType<T extends { _witness: unknown }> = T extends { _witness: infer U } ? U : never;
