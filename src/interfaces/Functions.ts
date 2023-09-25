import type { BindingBuilder, ClassBindingBuilder, ObjectBindingBuilder } from './BindingBuilder.js';
import type { ServiceIdentifier } from './ServiceIdentifier.js';

/**
 * A constructor for a class
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<out T, in Args extends unknown[] = any> = new (...args: Args) => T;

/**
 * Helper for defining functions
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Fn<out T, in Args extends unknown[] = any> = (...args: Args) => T;

/**
 * A function that allows for creating new bindings in a container
 *
 * @public
 */
export type BindFunction = {
	<T extends object>(id: Constructor<T>): ClassBindingBuilder<T>;
	<T extends object>(id: ServiceIdentifier<T>): ObjectBindingBuilder<T>;
	<T>(id: ServiceIdentifier<T>): BindingBuilder<T>;
};

/**
 * Checks if a binding for a given identifier already exists in a container
 *
 * @public
 */
export type IsBoundFunction = <T>(id: ServiceIdentifier<T>) => boolean;

/**
 * Unbinds any existing bindings for an identifier and replaces them with a new one
 *
 * @remarks
 *
 * This is a convenience method for unbinding and binding, as a result this function will also fail if no existing
 * binding already exist.
 *
 * @public
 */
export type RebindFunction = BindFunction;

/**
 * Unbinds any existing bindings for an identifier
 *
 * @remarks
 *
 * Note: as a safety mechanism, this function will fail if no existing bindings already exist.
 *
 * @public
 */
export type UnbindFunction = <T>(id: ServiceIdentifier<T>) => void;
