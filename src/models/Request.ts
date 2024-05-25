import type * as interfaces from '../interfaces/index.js';
import type { AnyToken } from '../Token.js';
import type { Container } from '../interfaces/Container.js';
import type { ResolutionCache } from '../container/ResolutionCache.js';

export interface Request<T> {
	container: Container;
	stack: Record<symbol, unknown[]>;
	singletonCache: ResolutionCache;
	token: AnyToken<T>;
	id: interfaces.ServiceIdentifier<T>;
}
