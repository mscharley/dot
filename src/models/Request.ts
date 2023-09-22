import type { Container } from '../interfaces/Container.js';
import type { ResolutionCache } from '../container/ResolutionCache.js';
import type { Token } from '../Token.js';

export interface Request<T> {
	container: Container;
	stack: Record<symbol, unknown[]>;
	singletonCache: ResolutionCache;
	token: Token<T>;
}
