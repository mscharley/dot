/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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

	describe('#resolvePropertyInjection', () => {
		const token = new Token<{ id: number }>('test');
		it('fails if attempting a resolution outside a request', () => {
			expect(() => Container.resolvePropertyInjection(token, [])).toThrowErrorMatchingInlineSnapshot(
				'"Unable to resolve token as no container is currently making a request: Token<Symbol(test)>"',
			);
		});
	});
});
