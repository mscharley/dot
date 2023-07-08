import type { Token } from '../Token.js';

export interface Request<T> {
	stack: Record<symbol, unknown>;
	singletonCache: Record<symbol, unknown>;
	token: Token<T>;
}
