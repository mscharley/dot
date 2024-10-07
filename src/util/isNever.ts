/* c8 ignore start */

import { InvalidOperationError } from '../Error.js';

/**
 * Helper for sufficiency testing of switch statements.
 */
export const isNever = (value: never, prefix: string): never => {
	throw new InvalidOperationError(`${prefix}: ${value as string}`);
};
