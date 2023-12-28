/*
 * This file exists to dedupe things that must be global between the CJS and ESM versions of this module.
 */

// Temporary fix for api-extractor not supporting export * as ___
import type * as interfaces from './interfaces/index.js';
export { interfaces };

export { Container } from './container/Container.js';
export { Context } from './container/Context.js';
export { Token } from './container/Token.js';

export type { InContextDecorator } from './decorators/inContext.js';
export type { InjectDecorator, InjectDecoratorFactory } from './decorators/inject.js';
export type { InjectableDecorator } from './decorators/injectable.js';
export type { TokenType } from './container/Token.js';

export { inContext } from './decorators/inContext.js';
export { inject } from './decorators/inject.js';
export { injectable } from './decorators/injectable.js';
export { stringifyIdentifier } from './util/stringifyIdentifier.js';
export { unmanaged } from './decorators/unmanaged.js';
export { withOptions } from './decorators/withOptions.js';

export type { ErrorCode } from './Error.js';
export {
	InvalidOperationError,
	IocError,
	RecursiveResolutionError,
	ResolutionError,
	TokenResolutionError,
} from './Error.js';
