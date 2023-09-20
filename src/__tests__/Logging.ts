import { describe, expect, it, jest } from '@jest/globals';
import type { Logger, LoggerLevel } from '../interfaces/Logger.js';
import { Container } from '../Container.js';
import { noop } from '../util/noop.js';
import { Token } from '../Token.js';

const token = new Token<string>('str');

describe('Logging', () => {
	it('can log things', async () => {
		const log = jest.fn<Logger[LoggerLevel]>();
		const logger = { info: noop, debug: noop, trace: log as unknown as Logger[LoggerLevel] };
		const c = new Container({ logger, logLevel: 'trace' });

		c.bind(token).toConstantValue('Hello world!');
		await expect(c.get(token)).resolves.toBe('Hello world!');

		expect(log.mock.calls).toMatchInlineSnapshot(`
		[
		  [
		    {
		      "id": Token {
		        "identifier": Symbol(str),
		      },
		      "options": undefined,
		      "plan": [
		        {
		          "cache": undefined,
		          "expectedTokensUsed": [],
		          "generate": [Function],
		          "resolutionPath": [
		            Token {
		              "identifier": Symbol(str),
		            },
		          ],
		          "token": Token {
		            "identifier": Symbol(str),
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
