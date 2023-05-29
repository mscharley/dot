import type { BindingBuilder } from './BindingBuilder';
import type { Token } from '..';

/** @public */
export type BindFunction = <T>(token: Token<T>) => BindingBuilder<T>;
/** @public */
export type IsBoundFunction = (token: Token<unknown>) => boolean;
/** @public */
export type RebindFunction = <T>(token: Token<T>) => BindingBuilder<T>;
/** @public */
export type UnbindFunction = (token: Token<unknown>) => void;
