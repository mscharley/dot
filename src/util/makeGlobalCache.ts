// Override globalThis for just this file.
declare let globalThis: Record<symbol, WeakMap<object, unknown>>;

export const makeGlobalCache = <K extends object, V>(identifier: symbol): WeakMap<K, V> => {
	const cache = globalThis[identifier] ?? new WeakMap();
	globalThis[identifier] = cache;

	return cache as WeakMap<K, V>;
};
