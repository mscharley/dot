import type * as interfaces from '../interfaces/index.js';
import { addInjection } from './injectable.js';
import { Container } from '../container/Container.js';
import type { Token } from '../Token.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

/**
 * Type for the `@inject` decorator itself
 *
 * @remarks
 *
 * See {@link inject | @inject}
 *
 * @public
 */
export interface InjectDecoratorFactory {
	<T>(token: Token<T>, options: Partial<interfaces.InjectOptions> & { multiple: true }): InjectDecorator<T[]>;
	<T>(token: Token<T>, options: Partial<interfaces.InjectOptions> & { optional: true }): InjectDecorator<T | undefined>;
	<T>(token: Token<T>, options?: Partial<interfaces.InjectOptions>): InjectDecorator<T>;
}

/**
 * Typesafe definition of a class field decorator
 *
 * @remarks
 *
 * See {@link inject | @inject}
 *
 * @public
 */
export interface InjectDecorator<T> {
	// TC39 definition
	(target: undefined, context: ClassFieldDecoratorContext<unknown, T>): (originalValue: T | undefined) => T;
	// experimental decorators definition
	(target: { constructor: () => unknown }, propertyName: string | symbol): undefined;
}

/**
 * Decorator for property injections
 *
 * @example
 *
 * ```typescript
 * const Name = new Token<string>("name");
 *
 * @injectable()
 * class Greeter {
 *   @inject(Name)
 *   public readonly name: string;
 *
 *   public hello() {
 *     console.log(`Hello, ${name}.`);
 *   }
 * }
 * ```
 *
 * @public
 */
export const inject: InjectDecoratorFactory = <T>(
	id: interfaces.ServiceIdentifier<T>,
	options?: Partial<interfaces.InjectOptions>,
): InjectDecorator<T> => {
	const opts: interfaces.InjectOptions = {
		multiple: false,
		optional: false,
		...options,
	};
	const token = tokenForIdentifier(id);

	return ((target, context) => {
		/* c8 ignore start */
		if (target != null) {
			// experimental
			addInjection({
				type: 'property',
				name: context as Exclude<typeof context, ClassFieldDecoratorContext<unknown, T>>,
				token,
				options: opts,
			});

			return undefined;
			/* c8 ignore end */
		} else {
			// tc39
			addInjection({
				type: 'property',
				name: (context as ClassFieldDecoratorContext<unknown, T>).name,
				token,
				options: opts,
			});

			return (_originalValue: T | undefined): T => {
				const value = Container.resolvePropertyInjection<T>(token, [token]);

				return value;
			};
		}
	}) as InjectDecorator<T>;
};
