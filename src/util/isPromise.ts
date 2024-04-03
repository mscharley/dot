/**
 * Checks if a value is a promise of a value.
 */
export const isPromise = <T = unknown>(v: T | Promise<T>): v is Promise<T> =>
	v != null
	&& (v instanceof Promise
	|| (typeof (v as unknown as Promise<T>).then === 'function'
	&& typeof (v as unknown as Promise<T>).catch === 'function'));
