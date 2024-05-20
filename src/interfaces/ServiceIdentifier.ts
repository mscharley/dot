import type { MetadataToken, Token } from '../Token.js';
import type { Constructor } from './Functions.js';
import type { MetadataObject } from './MetadataObject.js';

/**
 * A type which can act as an identifier for a specific type of object used for injection
 *
 * @remarks
 *
 * The most common identifier will be a {@link Token | Token }. You can also use classes directly as an identifier
 * there isn't a need to use an interface.
 *
 * @public
 */
export type ServiceIdentifier<T> = Token<T> | Constructor<T> | ServiceIdentifierWithMetadata<T, MetadataObject>;

/**
 * A {@link ServiceIdentifier} which allows for attaching metadata to bindings as well
 *
 * @public
 */
export type ServiceIdentifierWithMetadata<T, Metadata extends MetadataObject> = MetadataToken<T, Metadata>;

export type MetadataForIdentifier<Id extends ServiceIdentifier<unknown>> =
	Id extends ServiceIdentifierWithMetadata<unknown, infer Metadata> ? Metadata : MetadataObject;

export type IdentifiedType<T extends ServiceIdentifier<unknown>> = T extends ServiceIdentifier<infer U> ? U : never;
