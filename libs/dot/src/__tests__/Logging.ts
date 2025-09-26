/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContainer, Token } from '../index.js';
import { describe, expect, it, jest } from '@jest/globals';
import type { interfaces } from '../index.js';
import { noop } from '../util/noop.js';

const token = new Token<string>('str');

describe('logging', () => {
	it('can log things', async () => {
		const log = jest.fn<interfaces.Logger[interfaces.LoggerLevel]>();
		const logger = {
			info: noop,
			debug: noop,
			trace: log as unknown as interfaces.Logger[interfaces.LoggerLevel],
			warn: noop,
		};
		const c = createContainer({ logger, logLevel: 'trace' });

		c.load((bind) => bind(token).toConstantValue('Hello world!'));
		await expect(c.get(token)).resolves.toBe('Hello world!');

		expect(log.mock.calls).toMatchInlineSnapshot(`
[
  [
    {
      "id": {
        "tokenFor": "Symbol(str)",
      },
      "options": undefined,
      "plan": [
        {
          "binding": {
            "id": {
              "tokenFor": "Symbol(str)",
            },
            "metadata": {},
            "module": [Function],
            "scope": "transient",
            "token": {
              "tokenFor": "Symbol(str)",
            },
            "type": "static",
            "value": "Hello world!",
          },
          "cache": undefined,
          "expectedTokensUsed": [],
          "generate": [Function],
          "id": {
            "tokenFor": "Symbol(str)",
          },
          "resolutionPath": [
            {
              "tokenFor": "Symbol(str)",
            },
          ],
          "token": {
            "tokenFor": "Symbol(str)",
          },
          "type": "createClass",
        },
      ],
    },
    "Processing request",
  ],
]
`);
	});
});
