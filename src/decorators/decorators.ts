import type * as interfaces from '../interfaces/index.js';

/**
 * Typesafe definition of a class decorator
 *
 * @public
 */
export interface ClassDecorator<T, Args extends unknown[]> {
	// TC39 definition
	<Ctr extends interfaces.Constructor<T, Args>>(target: Ctr, context: ClassDecoratorContext<Ctr>): undefined;
	// experimental decorators definition
	<Ctr extends interfaces.Constructor<T, Args>>(target: Ctr, context?: undefined): Ctr | undefined;
}

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
