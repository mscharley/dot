import type { DirectInjection } from './DirectInjection.js';
import type { InjectOptions } from './InjectOptions.js';
import type { ServiceIdentifier } from './ServiceIdentifier.js';

/**
 * Valid options for parameters into the `@injectable` decorator
 *
 * @public
 */
export type InjectionIdentifier<T> =
	| DirectInjection<T>
	| ServiceIdentifier<T>
	| [ServiceIdentifier<T>, Partial<InjectOptions>];

/**
 * Helper type which is used to map an {@link interfaces.InjectionIdentifier | InjectionIdentifier} into the type that will be injected
 *
 * @public
 */
export type InjectedType<T extends InjectionIdentifier<unknown>> = T extends ServiceIdentifier<infer U>
	? U
	: T extends [ServiceIdentifier<infer U>]
	? U
	: T extends DirectInjection<infer U>
	? U
	: never;

/**
 * Mapped type to convert the parameters to the `@injectable` decorator into the parameters for the constructor
 *
 * @public
 */
export type ArgsForInjectionIdentifiers<Tokens extends Array<InjectionIdentifier<unknown>>> = {
	[Index in keyof Tokens]: InjectedType<Tokens[Index]>;
};
