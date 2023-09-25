import type * as interfaces from '../interfaces/index.js';

export interface PropertyInjection<T = unknown> {
	type: 'property';
	name: string | symbol;
	id: interfaces.ServiceIdentifier<T>;
	options: interfaces.InjectOptions;
}

export interface UnmanagedConstructorParameterInjection<T = unknown> {
	type: 'unmanagedConstructorParameter';
	index: number;
	id: interfaces.ServiceIdentifier<T>;
	value: interfaces.DirectInjection<T>;
	options: interfaces.InjectOptions;
}

export interface ConstructorParameterInjection<T = unknown> {
	type: 'constructorParameter';
	index: number;
	id: interfaces.ServiceIdentifier<T>;
	options: interfaces.InjectOptions;
}

export interface RequestInjection<T = unknown> {
	type: 'request';
	id: interfaces.ServiceIdentifier<T>;
	options: interfaces.InjectOptions;
}

export type Injection<T> =
	| PropertyInjection<T>
	| UnmanagedConstructorParameterInjection<T>
	| ConstructorParameterInjection<T>
	| RequestInjection<T>;

export type InjectionRegistry = WeakMap<interfaces.Constructor<unknown, unknown[]>, Array<Injection<unknown>>>;
