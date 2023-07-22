import type * as interfaces from '../interfaces/index.js';

const handler = {
	construct: (): object => {
		return handler;
	},
};

/**
 * Determines if a value is a constructor.
 *
 * @privateRemarks
 *
 * Borrowed from https://stackoverflow.com/a/48036194
 *
 * This works by trying to actually construct the object, but relying on a Proxy to short circuit the operation safely
 * into a no-op.
 */
export const isConstructor = (o: unknown): o is interfaces.Constructor<object> => {
	try {
		const proxy = new Proxy<interfaces.Constructor<object>>(o as interfaces.Constructor<object>, handler);
		return Boolean(new proxy());
	} catch (_e: unknown) {
		return false;
	}
};
