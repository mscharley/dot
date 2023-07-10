/* eslint-disable @typescript-eslint/no-type-alias */

import type { Token } from '../Token.js';

export interface FetchFromCache<T = unknown> {
	type: 'fetchFromCache';
	cache: 'singleton' | 'request';
	token: Token<T>;
	skipStepsIfFound: number;
}

export interface CreateInstance<T = unknown> {
	type: 'createClass';
	cache: 'singleton' | 'request' | undefined;
	generate: () => T | Promise<T>;
	token: Token<T>;
	expectedTokensUsed: Array<Token<unknown>>;
}

export type PlanStep = CreateInstance | FetchFromCache;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Plan<T> = PlanStep[];
