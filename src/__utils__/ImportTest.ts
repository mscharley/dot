/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @typescript-eslint/no-type-alias */
import { injectable } from '../decorators/injectable.js';
import { Token } from '../Token.js';
import type { TokenType } from '../Token.js';

export const ImportTestDependency = new Token<string>('dep');
export type ImportTestDependency = TokenType<typeof ImportTestDependency>;

@injectable(ImportTestDependency)
export class ImportTest {
	public constructor(public readonly dep: ImportTestDependency) {}

	public id = 10;
}
