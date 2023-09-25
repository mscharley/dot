import type * as interfaces from '../interfaces/index.js';
import type {
	ConstructorParameterInjection,
	Injection,
	InjectionRegistry,
	PropertyInjection,
	UnmanagedConstructorParameterInjection,
} from '../models/Injection.js';
import { InvalidOperationError } from '../Error.js';

const registry: InjectionRegistry = new WeakMap();

export const ensureRegistration = <T>(klass: interfaces.Constructor<T>): void => {
	registry.set(klass, registry.get(klass) ?? []);
};

export const registerInjection = <T>(klass: interfaces.Constructor<T>, injection: Injection<unknown>): void => {
	const injections = registry.get(klass) ?? [];
	injections.push(injection);

	registry.set(klass, injections);
};

export const getInjections = <T>(klass: interfaces.Constructor<T>): Array<Injection<unknown>> => {
	const injections = registry.get(klass);
	if (injections == null) {
		throw new InvalidOperationError(`No @injectable() decorator for class: ${klass.name}`);
	}

	return [...injections];
};

export const getPropertyInjections = <T>(klass: interfaces.Constructor<T>): PropertyInjection[] => {
	const injections = registry.get(klass);
	if (injections == null) {
		throw new InvalidOperationError(`No @injectable() decorator for class: ${klass.name}`);
	}

	return [...injections].filter((i): i is PropertyInjection => i.type === 'property');
};

export const getConstructorParameterInjections = <T>(
	klass: interfaces.Constructor<T>,
): Array<ConstructorParameterInjection | UnmanagedConstructorParameterInjection> => {
	const injections = registry.get(klass);
	if (injections == null) {
		throw new InvalidOperationError(`No @injectable() decorator for class: ${klass.name}`);
	}

	return [...injections].filter(
		(i): i is ConstructorParameterInjection | UnmanagedConstructorParameterInjection =>
			i.type === 'constructorParameter' || i.type === 'unmanagedConstructorParameter',
	);
};
