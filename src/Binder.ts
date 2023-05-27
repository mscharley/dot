import type { Context } from './BindingBuilder';

export interface Binder<T> {
	to: (fn: new () => T) => void;
	toConstantValue: ((v: T) => void) & ((v: Promise<T>) => Promise<void>);
	toDynamicValue: (fn: (context: Context) => T) => void;
}
