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
export class Token<out T> {
	/**
	 * The Symbol used as the unique identifier for this token
	 */
	public readonly identifier: symbol;

	public constructor(name: string) {
		this.identifier = Symbol(name);
	}
}

/**
 * A helper type to extract the type that a token will inject
 *
 * @public
 */
export type TokenType<T extends Token<unknown>> = T extends Token<infer U> ? U : never;
