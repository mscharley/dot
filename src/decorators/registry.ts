import type { Injection, InjectionRegistry, PropertyInjection } from '../models/Injection.js';

const registry: InjectionRegistry = new WeakMap();

export const registerInjection = <T>(klass: new () => T, injection: Injection): void => {
	const injections = registry.get(klass) ?? [];
	injections.push(injection);

	registry.set(klass, injections);
};

export const getInjections = <T>(klass: new () => T): Injection[] => {
	return [...(registry.get(klass) ?? [])];
};

export const getPropertyInjections = <T>(klass: new () => T): PropertyInjection[] => {
	return [...(registry.get(klass) ?? [])].filter((i): i is PropertyInjection => i.type === 'property');
};
