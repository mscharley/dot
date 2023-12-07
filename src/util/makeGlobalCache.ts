// Override globalThis for just this file.
declare let globalThis: Record<symbol, Map<object, unknown>>;

export const makeGlobalCache = <K extends object, V>(identifier: symbol): Map<K, V> => {
	const cache = globalThis[identifier] ?? new Map<object, unknown>();
	globalThis[identifier] = cache;

	return cache as Map<K, V>;
};
