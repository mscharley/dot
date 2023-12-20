import type * as interfaces from '../interfaces/index.js';
import type {
	ConstructorParameterInjection,
	Injection,
	PropertyInjection,
	UnmanagedConstructorParameterInjection,
} from '../models/Injection.js';
import { InvalidOperationError } from '../Error.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';

/**
 * Provides a context for autobound classes
 */
export class Context implements interfaces.Context {
	readonly #registry = new Map<interfaces.Constructor<unknown>, Array<Injection<unknown>>>();

	public constructor(public readonly name: string) {}

	public toString(): string {
		return `Context<${this.name}>`;
	}

	public ensureRegistration = <T>(klass: interfaces.Constructor<T>): void => {
		this.#registry.set(klass, this.#registry.get(klass) ?? []);
	};

	public registerInjection = <T>(klass: interfaces.Constructor<T>, injection: Injection<unknown>): void => {
		const injections = this.#registry.get(klass) ?? [];
		injections.push(injection);

		this.#registry.set(klass, injections);
	};

	public getInjections = <T>(klass: interfaces.Constructor<T>): Array<Injection<unknown>> => {
		const injections = this.#registry.get(klass);
		if (injections == null) {
			throw new InvalidOperationError(`No @injectable() decorator for class: ${stringifyIdentifier(klass)}`);
		}

		return [...injections];
	};

	public getPropertyInjections = <T>(klass: interfaces.Constructor<T>): PropertyInjection[] => {
		const injections = this.#registry.get(klass);
		if (injections == null) {
			throw new InvalidOperationError(`No @injectable() decorator for class: ${stringifyIdentifier(klass)}`);
		}

		return [...injections].filter((i): i is PropertyInjection => i.type === 'property');
	};

	public getConstructorParameterInjections = <T>(
		klass: interfaces.Constructor<T>,
	): Array<ConstructorParameterInjection | UnmanagedConstructorParameterInjection> => {
		const injections = this.#registry.get(klass);
		if (injections == null) {
			throw new InvalidOperationError(`No @injectable() decorator for class: ${stringifyIdentifier(klass)}`);
		}

		return [...injections].filter(
			(i): i is ConstructorParameterInjection | UnmanagedConstructorParameterInjection =>
				i.type === 'constructorParameter' || i.type === 'unmanagedConstructorParameter',
		);
	};

	public get registry(): ReadonlyMap<interfaces.Constructor<unknown>, Array<Injection<unknown>>> {
		return this.#registry;
	}
}
