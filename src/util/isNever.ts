/* c8 ignore start */

/**
 * Helper for sufficiency testing of switch statements.
 */
export const isNever = (value: never, prefix: string): never => {
	throw new Error(`${prefix}: ${value}`);
};
