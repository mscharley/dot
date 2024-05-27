import { describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import type { Request } from '../../models/Request.js';
import { ResolutionCache } from '../ResolutionCache.js';
import { Token } from '../../Token.js';

describe('container', () => {
	describe('#resolve', () => {
		it('fails if the requested token hasn\'t been created yet', () => {
			const c = new Container({ });
			const id = new Token<unknown>('resolve-test');
			const request: Request<unknown> = {
				container: c,
				id,
				singletonCache: new ResolutionCache(),
				stack: {},
				token: id,
			};
			expect(() => c.resolve<unknown>(id, request, [])).toThrow('Unable to find a value to inject');
		});
	});
});
