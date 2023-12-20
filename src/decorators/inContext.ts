/* eslint-disable @typescript-eslint/no-type-alias */
import type * as interfaces from '../interfaces/index.js';
import { addMetadataContext } from './metadata.js';
import { Context } from '../container/Context.js';
import { InvalidOperationError } from '../Error.js';

/**
 * @public
 */
export type InContextDecorator = {
	// TC39 definition
	<T extends object>(
		target: interfaces.Constructor<T>,
		context: ClassDecoratorContext<interfaces.Constructor<T>>,
	): undefined;
	// experimental decorators definition
	<T extends interfaces.Constructor<object>>(target: T, context?: undefined): T;
};

/**
 * Restricts autobinding to a specific context
 *
 * @public
 */
export const inContext = (context: interfaces.Context): InContextDecorator =>
	(<T extends object>(
		target: interfaces.Constructor<T>,
		ctx?: undefined | ClassDecoratorContext<interfaces.Constructor<T>>,
	): undefined | interfaces.Constructor<T> => {
		if (!(context instanceof Context)) {
			throw new InvalidOperationError('Invalid context');
		}
		/* c8 ignore start */
		if (ctx == null) {
			// experimental
			const metadata = (target[Symbol.metadata] ??= {});
			addMetadataContext(metadata, context);

			return target;
		} else {
			// tc39
			addMetadataContext(ctx.metadata, context);

			return undefined;
		}
	}) as InContextDecorator;
