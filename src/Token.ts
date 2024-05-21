import type * as interfaces from './interfaces/index.js';
import { stringifyIdentifier } from './util/stringifyIdentifier.js';

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
	 * This property exists to facilitate some compatibility across ESM and CommonJS in mixed environments. It is
	 * only here for the extra type information and this property is always undefined.
	 */
	public declare readonly _witness: T;

	/**
	 * Returns a stringified version of this token
	 */
	public toString(): string {
		return stringifyIdentifier(this);
	}

	/**
	 * Returns a simplified version of this token as a JSON blob
	 *
	 * @remarks
	 *
	 * This helps JSON loggers deal with tokens because the only property is a symbol so tokens would show up all tokens
	 * as `{}`.
	 */
	public toJSON(): object {
		return { tokenFor: this.identifier.toString() };
	}
}

/**
 * An identifier that specifies bindings should also have metadata attached to them
 *
 * @remarks
 *
 * See {@link Token} for basic usage guidelines. This is a token which also stipulates some metadata which should be
 * provided along with all bindings for this token.
 *
 * @public
 */
export class MetadataToken<out T, Metadata extends interfaces.MetadataObject> {
	/**
	 * The Symbol used as the unique identifier for this token
	 *
	 * @internal
	 */
	public readonly identifier: symbol;

	public constructor(name: string, public readonly guard: (o: unknown) => o is Metadata) {
		this.identifier = Symbol(name);
	}

	/**
	 * This is a dummy variable, it throws an error on access
	 *
	 * @remarks
	 *
	 * This property exists to facilitate some compatibility across ESM and CommonJS in mixed environments. It is
	 * only here for the extra type information and this property is always undefined.
	 */
	public declare readonly _witness: T;

	/**
	 * Returns a stringified version of this token
	 */
	public toString(): string {
		return stringifyIdentifier(this);
	}

	/**
	 * Returns a simplified version of this token as a JSON blob
	 *
	 * @remarks
	 *
	 * This helps JSON loggers deal with tokens because the only property is a symbol so tokens would show up all tokens
	 * as `{}`.
	 */
	public toJSON(): object {
		return { metadataTokenFor: this.identifier.toString() };
	}
}

/**
 * Helper token type for the common case of simple named bindings
 *
 * @public
 */
export class NamedToken<out T> extends MetadataToken<T, { name: string }> {
	public constructor(name: string) {
		super(name, (o): o is { name: string } => typeof o === 'object' && o != null && 'name' in o && typeof o.name === 'string');
	}
}

/**
 * An easy way to reference any kind of token
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-type-alias
export type AnyToken<T> = Token<T> | MetadataToken<T, interfaces.MetadataObject>;

/**
 * A helper type to extract the type that a token will inject
 *
 * @public
 */
export type TokenType<T extends { _witness: unknown }> = T extends { _witness: infer U } ? U : never;
