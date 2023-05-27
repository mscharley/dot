/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Token<T> {
	/** @internal */
	public readonly identifier: symbol;

	public constructor(name: string) {
		this.identifier = Symbol(name);
	}
}

export type TokenType<T extends Token<unknown>> = T extends Token<infer U> ? U : never;
