/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { addInjection } from './injectable.js';
import { Container } from '../container/Container.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

/**
 * Typesafe definition of a class field decorator
 *
 * @public
 */
export interface ClassFieldDecorator<T extends object, Property> {
	// TC39 definition
	(target: undefined, context: ClassFieldDecoratorContext<T, Property>): (originalValue: Property | undefined) => Property;
	// experimental decorators definition
	(target: T, propertyName: string | symbol): undefined;
}

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
	<T>(id: interfaces.ServiceIdentifier<T>, options: Partial<interfaces.InjectOptions<interfaces.MetadataForIdentifier<typeof id>>> & { multiple: true }): ClassFieldDecorator<object, T[]>;
	<T>(id: interfaces.ServiceIdentifier<T>, options: Partial<interfaces.InjectOptions<interfaces.MetadataForIdentifier<typeof id>>> & { optional: true }): ClassFieldDecorator<object, T | undefined>;
	<T>(id: interfaces.ServiceIdentifier<T>, options?: Partial<interfaces.InjectOptions<interfaces.MetadataForIdentifier<typeof id>>>): ClassFieldDecorator<object, T>;
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
	options?: Partial<interfaces.InjectOptions<interfaces.MetadataForIdentifier<typeof id>>>,
): ClassFieldDecorator<object, T> => {
	const opts: interfaces.InjectOptions<interfaces.MetadataForIdentifier<typeof id>> = {
		multiple: false,
		optional: false,
		metadata: {},
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
				id: id,
				options: opts,
			});

			return undefined;
			/* c8 ignore end */
		} else {
			// tc39
			addInjection({
				type: 'property',
				name: (context as ClassFieldDecoratorContext<unknown, T>).name,
				id: id,
				options: opts,
			});

			return (_originalValue: T | undefined): T => {
				const value = Container.resolvePropertyInjection<T>(token, [token]);

				return value;
			};
		}
	}) as ClassFieldDecorator<object, T>;
};
