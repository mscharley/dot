import type * as interfaces from '../interfaces/index.js';
import type {
	ConstructorParameterInjection,
	Injection,
	PropertyInjection,
	UnmanagedConstructorParameterInjection,
} from '../models/Injection.js';
import { InvalidOperationError } from '../Error.js';
import { makeGlobalCache } from '../util/makeGlobalCache.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';

const registryCache = Symbol.for('@mscharley/dot:registry-cache');
const registry = makeGlobalCache<interfaces.Constructor<unknown, unknown[]>, Array<Injection<unknown, interfaces.MetadataObject>>>(registryCache);

export const ensureRegistration = <T>(klass: interfaces.Constructor<T>): void => {
	registry.set(klass, registry.get(klass) ?? []);
};

export const registerInjection = <T>(klass: interfaces.Constructor<T>, injection: Injection<unknown, interfaces.MetadataObject>): void => {
	const injections = registry.get(klass) ?? [];
	injections.push(injection);

	registry.set(klass, injections);
};

export const getInjections = <T>(klass: interfaces.Constructor<T>): Array<Injection<unknown, interfaces.MetadataObject>> => {
	const injections = registry.get(klass);
	if (injections == null) {
		throw new InvalidOperationError(`No @injectable() decorator for class: ${stringifyIdentifier(klass)}`);
	}

	return [...injections];
};

export const getPropertyInjections = <T>(klass: interfaces.Constructor<T>): Array<PropertyInjection<unknown, interfaces.MetadataObject>> => {
	const injections = registry.get(klass);
	if (injections == null) {
		throw new InvalidOperationError(`No @injectable() decorator for class: ${stringifyIdentifier(klass)}`);
	}

	return [...injections].filter((i): i is PropertyInjection<unknown, interfaces.MetadataObject> => i.type === 'property');
};

export const getConstructorParameterInjections = <T>(
	klass: interfaces.Constructor<T>,
): Array<ConstructorParameterInjection<unknown, interfaces.MetadataObject> | UnmanagedConstructorParameterInjection<unknown, interfaces.MetadataObject>> => {
	const injections = registry.get(klass);
	if (injections == null) {
		throw new InvalidOperationError(`No @injectable() decorator for class: ${stringifyIdentifier(klass)}`);
	}

	return [...injections].filter(
		(i): i is ConstructorParameterInjection<unknown, interfaces.MetadataObject> | UnmanagedConstructorParameterInjection<unknown, interfaces.MetadataObject> =>
			i.type === 'constructorParameter' || i.type === 'unmanagedConstructorParameter',
	);
};

export const getRegistry = (): ReadonlyMap<interfaces.Constructor<unknown, unknown[]>, Array<Injection<unknown, interfaces.MetadataObject>>> =>
	registry;
