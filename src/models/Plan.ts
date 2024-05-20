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
	id: interfaces.ServiceIdentifier<T>;
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

export interface ParentRequest<T = unknown, Metadata extends interfaces.MetadataObject = interfaces.MetadataObject> {
	type: 'requestFromParent';
	token: Token<T>;
	parent: interfaces.Container;
	options: interfaces.InjectOptions<Metadata>;
}

export type PlanStep<T = unknown, Metadata extends interfaces.MetadataObject = interfaces.MetadataObject> =
	AggregateMultiple<T> |
	CreateInstance<T> |
	FetchFromCache<T> |
	ParentRequest<T, Metadata>;

export type Plan = PlanStep[];
