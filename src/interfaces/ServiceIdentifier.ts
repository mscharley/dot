import type { Constructor } from './Functions.js';
import type { Token } from '../Token.js';

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
export type ServiceIdentifier<T> = Token<T> | Constructor<T>;
