import type { BindingBuilder, ClassBindingBuilder } from './BindingBuilder.js';
import type { Constructor } from './Constructor.js';
import type { ServiceIdentifier } from './ServiceIdentifier.js';

/** @public */
export type BindFunction = {
	<T>(id: Constructor<T>): ClassBindingBuilder<T>;
	<T>(id: ServiceIdentifier<T>): BindingBuilder<T>;
};
/** @public */
export type IsBoundFunction = <T>(id: ServiceIdentifier<T>) => boolean;
/** @public */
export type RebindFunction = BindFunction;
/** @public */
export type UnbindFunction = <T>(id: ServiceIdentifier<T>) => void;
