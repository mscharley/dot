import type { Token } from '../Token.js';

/** @public */
export type ServiceIdentifier<T> = (new () => T) | Token<T>;
