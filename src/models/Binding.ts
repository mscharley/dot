import type * as interfaces from '../interfaces/index.js';
import type { AnyToken } from '../Token.js';
import type { Injection } from './Injection.js';

export interface ConstructorBinding<out T, out Metadata extends interfaces.MetadataObject> {
	type: 'constructor';
	id: interfaces.ServiceIdentifier<T>;
	token: AnyToken<T>;
	scope: interfaces.ScopeOptions;
	metadata: Metadata;
	ctr: interfaces.Constructor<T>;
}

export interface StaticBinding<out T, out Metadata extends interfaces.MetadataObject> {
	type: 'static';
	id: interfaces.ServiceIdentifier<T>;
	token: AnyToken<T>;
	scope: interfaces.ScopeOptions;
	metadata: Metadata;
	value: T;
}

export interface DynamicBinding<out T, out Metadata extends interfaces.MetadataObject> {
	type: 'dynamic';
	id: interfaces.ServiceIdentifier<T>;
	token: AnyToken<T>;
	scope: interfaces.ScopeOptions;
	metadata: Metadata;
	injections: Array<Injection<unknown, interfaces.MetadataObject>>;
	generator: (...args: unknown[]) => T | Promise<T>;
}

export type Binding<T, Metadata extends interfaces.MetadataObject> =
	ConstructorBinding<T, Metadata> |
	StaticBinding<T, Metadata> |
	DynamicBinding<T, Metadata>;
