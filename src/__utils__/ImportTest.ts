/* eslint-disable @typescript-eslint/no-type-alias */
import { injectable } from '../decorators/injectable.js';
import { Token } from '../container/Token.js';
import type { TokenType } from '../container/Token.js';

export const ImportTestDependency = new Token<string>('dep');
export type ImportTestDependency = TokenType<typeof ImportTestDependency>;

@injectable(ImportTestDependency)
export class ImportTest {
	public constructor(public readonly dep: ImportTestDependency) {}

	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	public id = 10;
}
