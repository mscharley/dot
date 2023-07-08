/**
 * Checks if a value is a promise of a value.
 */
export const isPromise = <T = unknown>(v: T | Promise<T>): v is Promise<T> =>
	v != null && typeof (v as Promise<T>).then === 'function';
