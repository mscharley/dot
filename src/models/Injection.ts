import type * as interfaces from '../interfaces/index.js';

export interface PropertyInjection<T, Metadata extends interfaces.MetadataObject> {
	readonly type: 'property';
	readonly name: string | symbol;
	readonly id: interfaces.ServiceIdentifier<T>;
	readonly options: interfaces.InjectOptions<Metadata>;
}

export interface UnmanagedConstructorParameterInjection<T, Metadata extends interfaces.MetadataObject> {
	readonly type: 'unmanagedConstructorParameter';
	readonly index: number;
	readonly id: interfaces.ServiceIdentifier<T>;
	readonly value: interfaces.DirectInjection<T>;
	readonly options: interfaces.InjectOptions<Metadata>;
}

export interface ConstructorParameterInjection<T, Metadata extends interfaces.MetadataObject> {
	readonly type: 'constructorParameter';
	readonly index: number;
	readonly id: interfaces.ServiceIdentifier<T>;
	readonly options: interfaces.InjectOptions<Metadata>;
}

export interface RequestInjection<T, Metadata extends interfaces.MetadataObject> {
	readonly type: 'request';
	readonly id: interfaces.ServiceIdentifier<T>;
	readonly options: interfaces.InjectOptions<Metadata>;
}

export type Injection<T, Metadata extends interfaces.MetadataObject> =
	| PropertyInjection<T, Metadata>
	| UnmanagedConstructorParameterInjection<T, Metadata>
	| ConstructorParameterInjection<T, Metadata>
	| RequestInjection<T, Metadata>;
