import type * as interfaces from '../interfaces/index.js';

export interface PropertyInjection<T = unknown> {
	readonly type: 'property';
	readonly name: string | symbol;
	readonly id: interfaces.ServiceIdentifier<T>;
	readonly options: interfaces.InjectOptions;
}

export interface UnmanagedConstructorParameterInjection<T = unknown> {
	readonly type: 'unmanagedConstructorParameter';
	readonly index: number;
	readonly id: interfaces.ServiceIdentifier<T>;
	readonly value: interfaces.DirectInjection<T>;
	readonly options: interfaces.InjectOptions;
}

export interface ConstructorParameterInjection<T = unknown> {
	readonly type: 'constructorParameter';
	readonly index: number;
	readonly id: interfaces.ServiceIdentifier<T>;
	readonly options: interfaces.InjectOptions;
}

export interface RequestInjection<T = unknown> {
	readonly type: 'request';
	readonly id: interfaces.ServiceIdentifier<T>;
	readonly options: interfaces.InjectOptions;
}

export type Injection<T> =
	| PropertyInjection<T>
	| UnmanagedConstructorParameterInjection<T>
	| ConstructorParameterInjection<T>
	| RequestInjection<T>;
