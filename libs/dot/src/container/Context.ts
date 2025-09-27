/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import type {
	ConstructorParameterInjection,
	Injection,
	PropertyInjection,
	UnmanagedConstructorParameterInjection,
} from '../models/Injection.js';
import { InvalidOperationError } from '../Error.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';

export class Context implements interfaces.Context {
	public constructor(public readonly name: string) {}

	public static readonly all = new Context('AllContexts');
	public static readonly global = new Context('Global');

	readonly #registry
		= new Map<interfaces.Constructor<unknown, unknown[]>, Array<Injection<unknown, interfaces.MetadataObject>>>();

	public get registry(): ReadonlyMap<
		interfaces.Constructor<unknown, unknown[]>,
		Array<Injection<unknown, interfaces.MetadataObject>>
	> {
		return this.#registry;
	}

	public get classesRegistered(): number {
		return this.#registry.size;
	}

	public has = <T>(klass: interfaces.Constructor<T>): boolean => {
		return this.#registry.has(klass);
	};

	public ensureRegistration = <T>(klass: interfaces.Constructor<T>): void => {
		this.#registry.set(klass, this.#registry.get(klass) ?? []);
	};

	public registerInjection = <T>(
		klass: interfaces.Constructor<T>,
		injection: Injection<unknown, interfaces.MetadataObject>,
	): void => {
		const injections = this.#registry.get(klass) ?? [];
		injections.push(injection);

		this.#registry.set(klass, injections);
	};

	public getInjections = <T>(
		klass: interfaces.Constructor<T>,
	): Array<Injection<unknown, interfaces.MetadataObject>> => {
		const injections = this.#registry.get(klass);
		if (injections == null) {
			throw new InvalidOperationError(`No @injectable() decorator for class: ${stringifyIdentifier(klass)}`);
		}

		return [...injections];
	};

	public getPropertyInjections = <T>(
		klass: interfaces.Constructor<T>,
	): Array<PropertyInjection<unknown, interfaces.MetadataObject>> => {
		const injections = this.#registry.get(klass);
		if (injections == null) {
			throw new InvalidOperationError(`No @injectable() decorator for class: ${stringifyIdentifier(klass)}`);
		}

		return [...injections].filter((i): i is PropertyInjection<unknown, interfaces.MetadataObject> => i.type === 'property');
	};

	public getConstructorParameterInjections = <T>(
		klass: interfaces.Constructor<T>,
	): Array<
		ConstructorParameterInjection<unknown, interfaces.MetadataObject>
		| UnmanagedConstructorParameterInjection<unknown, interfaces.MetadataObject>
	> => {
		const injections = this.#registry.get(klass);
		if (injections == null) {
			throw new InvalidOperationError(`No @injectable() decorator for class: ${stringifyIdentifier(klass)}`);
		}

		return [...injections].filter(
			(i): i is
			ConstructorParameterInjection<unknown, interfaces.MetadataObject>
			| UnmanagedConstructorParameterInjection<unknown, interfaces.MetadataObject> =>
				i.type === 'constructorParameter' || i.type === 'unmanagedConstructorParameter',
		);
	};

	public toString(): string {
		return `Context<${this.name}:${this.classesRegistered}>`;
	}

	public toJSON(): object {
		return {
			name: this.name,
			classesRegistered: this.classesRegistered,
		};
	}
}
