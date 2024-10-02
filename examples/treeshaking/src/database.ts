/* eslint-disable @typescript-eslint/no-type-alias */

import type { interfaces, TokenType } from '@mscharley/dot';
import { Token } from '@mscharley/dot';

export const DatabaseConnection = new Token<{ migrate: () => void | Promise<void> }>('db.connection');
export type DatabaseConnection = TokenType<typeof DatabaseConnection>;

export const DatabaseModule: interfaces.ContainerModule = (bind) => {
	bind(DatabaseConnection).toConstantValue({
		migrate: () => {
			// eslint-disable-next-line no-console
			console.log('Running database migrations!');
		},
	});
};
