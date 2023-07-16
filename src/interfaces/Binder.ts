import type { BindingContext } from './BindingContext.js';
import type { Constructor } from './Constructor.js';

/** @public */
export type FixedScopeBindingOptions = 'toConstantValue';

/**
 * @public
 */
export interface Binder<in out T> {
	to: (fn: Constructor<T>) => void;
	toConstantValue: ((v: T) => void) & ((v: Promise<T>) => Promise<void>);
	toDynamicValue: (fn: (context: BindingContext<T>) => T | Promise<T>) => void;
}
