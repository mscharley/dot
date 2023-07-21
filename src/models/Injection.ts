import type * as interfaces from '../interfaces/index.js';
import type { Token } from '../Token.js';

export interface PropertyInjection<T = unknown> {
	type: 'property';
	name: string | symbol;
	token: Token<T>;
	options: interfaces.InjectOptions;
}

export interface ConstructorParamaterInjection<T = unknown> {
	type: 'constructorParameter';
	index: number;
	token: Token<T>;
	options: interfaces.InjectOptions;
}

export interface RequestInjection<T = unknown> {
	type: 'request';
	token: Token<T>;
	options: interfaces.InjectOptions;
}

export type Injection<T> = PropertyInjection<T> | ConstructorParamaterInjection<T> | RequestInjection<T>;

export type InjectionRegistry = WeakMap<interfaces.Constructor<object, unknown[]>, Array<Injection<unknown>>>;
