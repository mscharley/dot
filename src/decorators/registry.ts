import type * as interfaces from '../interfaces/index.js';
import type {
	ConstructorParamaterInjection,
	Injection,
	InjectionRegistry,
	PropertyInjection,
} from '../models/Injection.js';

const registry: InjectionRegistry = new WeakMap();

export const registerInjection = <T extends object>(
	klass: interfaces.Constructor<T>,
	injection: Injection<unknown>,
): void => {
	const injections = registry.get(klass) ?? [];
	injections.push(injection);

	registry.set(klass, injections);
};

export const getInjections = <T extends object>(klass: interfaces.Constructor<T>): Array<Injection<unknown>> => {
	const injections: Array<Injection<unknown>> = registry.get(klass) ?? [];
	return [...injections];
};

export const getPropertyInjections = <T extends object>(klass: interfaces.Constructor<T>): PropertyInjection[] => {
	const injections: Array<Injection<unknown>> = registry.get(klass) ?? [];
	return [...injections].filter((i): i is PropertyInjection => i.type === 'property');
};

export const getConstructorParameterInjections = <T extends object>(
	klass: interfaces.Constructor<T>,
): ConstructorParamaterInjection[] => {
	const injections: Array<Injection<unknown>> = registry.get(klass) ?? [];
	return [...injections].filter((i): i is ConstructorParamaterInjection => i.type === 'constructorParameter');
};
