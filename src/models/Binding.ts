/* eslint-disable @typescript-eslint/no-type-alias */
import type * as interfaces from '../interfaces/index.js';
import type { Token } from '../Token.js';

export interface ConstructorBinding<out T> {
	type: 'constructor';
	token: Token<T>;
	scope: interfaces.ScopeOptions;
	ctr: new () => T;
}

export interface StaticBinding<out T> {
	type: 'static';
	token: Token<T>;
	scope: interfaces.ScopeOptions;
	value: T;
}

export interface DynamicBinding<in out T> {
	type: 'dynamic';
	token: Token<T>;
	scope: interfaces.ScopeOptions;
	generator: (context: interfaces.BindingContext<T>) => T | Promise<T>;
}

export type Binding<T> = ConstructorBinding<T> | StaticBinding<T> | DynamicBinding<T>;
