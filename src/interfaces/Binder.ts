import type { BindingContext } from './BindingContext';

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type FixedScopeBindingOptions = 'toConstantValue';

/**
 * @public
 */
export interface Binder<T> {
	to: (fn: new () => T) => void;
	toConstantValue: ((v: T) => void) & ((v: Promise<T>) => Promise<void>);
	toDynamicValue: (fn: (context: BindingContext) => T) => void;
}
