import type { ArgsForInjectionIdentifiers, InjectionIdentifier } from './InjectionIdentifier.js';
import type { FactoryContext } from './FactoryContext.js';
import type { Fn } from './Functions.js';
import type { MetadataObject } from './MetadataObject.js';

/**
 * Describes which {@link @mscharley/dot#interfaces.Binder | Binder} options are only available when not specifying a scope
 *
 * @public
 */
export type ImplicitScopeBindingOptions = 'toConstantValue';

/**
 * Partial interface which describes the final step of specifying a binding
 *
 * @public
 */
export interface Binder<in out T, in out Metadata extends MetadataObject> {
	/**
	 * Bind this identifier to a constant value
	 *
	 * @remarks
	 *
	 * Use this when you have a precalculated value which should always be used, eg. a database connection object.
	 */
	toConstantValue: ((v: T) => void) & ((v: Promise<T>) => Promise<void>);

	/**
	 * Bind this identifier to a function which can produce the required value later
	 *
	 * @remarks
	 *
	 * Use this when you need to perform some calculations to produce the required value. Be aware that this can be pretty
	 * performance intensive if scoping isn't applied appropriately and you make lots of requests from the container that
	 * include this binding.
	 */
	toDynamicValue: <Tokens extends Array<InjectionIdentifier<unknown>>>(
		dependencies: [...Tokens],
		fn: Fn<T | Promise<T>, ArgsForInjectionIdentifiers<Tokens>>,
	) => void;

	/**
	 * Bind this identifier to a dynamic value with access to some extra context from the container
	 *
	 * @remarks
	 *
	 * The context provided to factories includes access to a very cut down version of the container and this factory must
	 * resolve to a regular handler for toDynamicValue.
	 */
	toFactory: <Tokens extends Array<InjectionIdentifier<unknown>>>(
		dependencies: [...Tokens],
		fn: (context: FactoryContext<Metadata>) => Fn<T | Promise<T>, ArgsForInjectionIdentifiers<Tokens>>,
	) => void;
}
