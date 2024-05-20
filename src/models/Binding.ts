import type * as interfaces from '../interfaces/index.js';
import type { AnyToken } from '../Token.js';
import type { Injection } from './Injection.js';

export interface ConstructorBinding<out T> {
	type: 'constructor';
	id: interfaces.ServiceIdentifier<T>;
	token: AnyToken<T>;
	scope: interfaces.ScopeOptions;
	ctr: interfaces.Constructor<T>;
}

export interface StaticBinding<out T> {
	type: 'static';
	id: interfaces.ServiceIdentifier<T>;
	token: AnyToken<T>;
	scope: interfaces.ScopeOptions;
	value: T;
}

export interface DynamicBinding<out T> {
	type: 'dynamic';
	id: interfaces.ServiceIdentifier<T>;
	token: AnyToken<T>;
	scope: interfaces.ScopeOptions;
	injections: Array<Injection<unknown, interfaces.MetadataObject>>;
	generator: (...args: unknown[]) => T | Promise<T>;
}

export type Binding<T> =
	ConstructorBinding<T> |
	StaticBinding<T> |
	DynamicBinding<T>;
