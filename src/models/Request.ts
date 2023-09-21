import type { Container } from '../interfaces/Container.js';
import type { Token } from '../Token.js';

export interface Request<T> {
	container: Container;
	stack: Record<symbol, unknown[]>;
	singletonCache: Record<symbol, unknown>;
	token: Token<T>;
}
