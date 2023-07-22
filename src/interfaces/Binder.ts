import type { BindingContext } from './BindingContext.js';

/** @public */
export type FixedScopeBindingOptions = 'toConstantValue';

/**
 * @public
 */
export interface Binder<in out T> {
	toConstantValue: ((v: T) => void) & ((v: Promise<T>) => Promise<void>);
	toDynamicValue: (fn: (context: BindingContext<T>) => T | Promise<T>) => void;
}
