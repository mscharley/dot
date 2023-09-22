import type * as interfaces from '../interfaces/index.js';
import type { Binding } from './Binding.js';
import type { Token } from '../Token.js';

export interface FetchFromCache<T = unknown> {
	type: 'fetchFromCache';
	cache: 'singleton' | 'request';
	token: Token<T>;
	binding: Binding<T>;
	skipStepsIfFound: number;
}

export interface CreateInstance<T = unknown> {
	type: 'createClass';
	cache: 'singleton' | 'request' | undefined;
	generate: () => T | Promise<T>;
	token: Token<T>;
	binding: Binding<T> | undefined;
	expectedTokensUsed: Array<Token<unknown>>;
	resolutionPath: Array<Token<unknown>>;
}

export interface AggregateMultiple<T = unknown> {
	type: 'aggregateMultiple';
	token: Token<T>;
	count: number;
	resolutionPath: Array<Token<unknown>>;
}

export interface ParentRequest<T = unknown> {
	type: 'requestFromParent';
	token: Token<T>;
	parent: interfaces.Container;
	options: interfaces.InjectOptions;
}

export type PlanStep<T = unknown> = AggregateMultiple<T> | CreateInstance<T> | FetchFromCache<T> | ParentRequest<T>;

export type Plan<T> = Array<PlanStep<T>>;
