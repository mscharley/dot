import type { Token } from './Token.js';

/**
 * The error codes used by the IOC container
 *
 * @public
 */
export type ErrorCode = 'RESOLUTION_ERROR' | 'INVALID_OPERATION';

/**
 * Superclass for all errors that are thrown by the IOC container
 *
 * @public
 */
export abstract class IocError extends Error {
	/**
	 * Upstream error that caused this one, if any
	 *
	 * @remarks
	 *
	 * This will always be an Error for any subclasses of IocError.
	 */
	public declare readonly cause?: Error;

	public constructor(msg: string, public readonly code: ErrorCode, originalError?: Error) {
		super(msg, { cause: originalError });
	}
}

/**
 * Error for wrapping issues with resolving dependencies
 *
 * @public
 */
export class ResolutionError extends IocError {
	public constructor(msg: string, public readonly resolutionPath: Array<Token<unknown>>, originalError?: Error) {
		super(msg, 'RESOLUTION_ERROR', originalError);
	}
}

/**
 * Error for operations which aren't allowed
 *
 * @public
 */
export class InvalidOperationError extends IocError {
	public constructor(msg: string, originalError?: Error) {
		super(msg, 'INVALID_OPERATION', originalError);
	}
}
