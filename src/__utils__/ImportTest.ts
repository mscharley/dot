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
