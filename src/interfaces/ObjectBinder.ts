import type { Constructor } from './Constructor.js';

/** @public */
export interface ObjectBinder<in out T extends object> {
	to: (fn: Constructor<T>) => void;
}
