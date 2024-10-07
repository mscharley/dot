/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it, jest } from '@jest/globals';
import type { Logger, LoggerLevel } from '../interfaces/Logger.js';
import { Container } from '../container/Container.js';
import { noop } from '../util/noop.js';
import { Token } from '../Token.js';

const token = new Token<string>('str');

describe('logging', () => {
	it('can log things', async () => {
		const log = jest.fn<Logger[LoggerLevel]>();
		const logger = { info: noop, debug: noop, trace: log as unknown as Logger[LoggerLevel], warn: noop };
		const c = new Container({ logger, logLevel: 'trace' });

		c.bind(token).toConstantValue('Hello world!');
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
