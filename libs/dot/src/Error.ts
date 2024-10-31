/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Token } from './Token.js';

/**
 * The error codes used by the IOC container
 *
 * @public
 */
export type ErrorCode = 'RECURSIVE_RESOLUTION' | 'BINDING_ERROR' | 'TOKEN_RESOLUTION' | 'INVALID_OPERATION';

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

	/**
	 * An error code that represents the general type of error that occurred
	 */
	public readonly code: ErrorCode;

	public constructor(msg: string, code: ErrorCode, originalError?: Error) {
		super(msg, { cause: originalError });
		this.code = code;
	}
}

/**
 * An error occurred while trying to configure a binding
 *
 * @public
 */
export class BindingError extends IocError {
	public constructor(msg: string, originalError?: Error) {
		super(msg, 'BINDING_ERROR', originalError);
	}
}

/**
 * An error occurred while trying to resolve a request
 *
 * @public
 */
export abstract class ResolutionError extends IocError {
	/**
	 * The dependency path traversed to the point where the error occurred
	 *
	 * @remarks
	 *
	 * The first element of this array is the token that was directly requested from the container.
	 *
	 * The last element of this array is the token that caused the failure contained in the
	 * {@link IocError.cause | cause} property.
	 */
	public readonly resolutionPath: Array<Token<unknown>>;

	public constructor(msg: string, code: ErrorCode, resolutionPath: Array<Token<unknown>>, originalError?: Error) {
		super(msg, code, originalError);
		this.resolutionPath = resolutionPath;
	}
}

/**
 * A recursion was detected while trying to resolve a dependency
 *
 * @remarks
 *
 * Attempting to resolve dependencies recursively isn't something this library can deal with, however caching via scopes
 * can sometimes break dependency cycles that would normally fail with no caching.
 *
 * @public
 */
export class RecursiveResolutionError extends ResolutionError {
	public constructor(msg: string, resolutionPath: Array<Token<unknown>>) {
		super(msg, 'RECURSIVE_RESOLUTION', resolutionPath);
	}
}

/**
 * Error for wrapping issues with resolving dependencies
 *
 * @remarks
 *
 * Token resolution errors will always have a cause attached to them and it is possible for resolution errors to end up
 * nested inside each other in the case of subrequests from parent containers or because of dynamic bindings.
 *
 * @public
 */
export class TokenResolutionError extends ResolutionError {
	/** {@inheritdoc IocError.cause} */
	public declare readonly cause: Error;

	public constructor(msg: string, resolutionPath: Array<Token<unknown>>, originalError: Error) {
		super(msg, 'TOKEN_RESOLUTION', resolutionPath, originalError);
	}
}

/**
 * Error for operations which aren't allowed
 *
 * @privateRemarks
 *
 * This isn't necessarily a given, but most of the instances of this error showing up indicate a bug in either the
 * library or in the configuration of the container in client code.
 *
 * @public
 */
export class InvalidOperationError extends IocError {
	public constructor(msg: string, originalError?: Error) {
		super(msg, 'INVALID_OPERATION', originalError);
	}
}
