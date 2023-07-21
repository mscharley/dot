import type { BindingBuilder, ClassBindingBuilder, ObjectBindingBuilder } from './BindingBuilder.js';
import type { Constructor } from './Constructor.js';
import type { ServiceIdentifier } from './ServiceIdentifier.js';

/** @public */
export type BindFunction = {
	<T extends object>(id: Constructor<T>): ClassBindingBuilder<T>;
	<T extends object>(id: ServiceIdentifier<T>): ObjectBindingBuilder<T>;
	<T>(id: ServiceIdentifier<T>): BindingBuilder<T>;
};
/** @public */
export type IsBoundFunction = <T>(id: ServiceIdentifier<T>) => boolean;
/** @public */
export type RebindFunction = BindFunction;
/** @public */
export type UnbindFunction = <T>(id: ServiceIdentifier<T>) => void;
