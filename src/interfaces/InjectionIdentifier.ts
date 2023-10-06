import type { DirectInjection } from './DirectInjection.js';
import type { InjectOptions } from './InjectOptions.js';
import type { ServiceIdentifier } from './ServiceIdentifier.js';

/**
 * Valid options for parameters into the `@injectable` decorator
 *
 * @public
 */
export type InjectionIdentifier<T> =
	| ServiceIdentifier<T>
	| [ServiceIdentifier<T>, Partial<InjectOptions>]
	| DirectInjection<T>;

/**
 * Helper type which is used to map an {@link @mscharley/dot#interfaces.InjectionIdentifier | InjectionIdentifier} into the type that will be injected
 *
 * @public
 */
export type InjectedType<T extends InjectionIdentifier<unknown>> = T extends [
	ServiceIdentifier<infer U>,
	{ multiple: true },
]
	? U[]
	: T extends [ServiceIdentifier<infer U>, { optional: true }]
	? U | undefined
	: T extends [ServiceIdentifier<infer U>, object]
	? U
	: T extends ServiceIdentifier<infer U>
	? U
	: T extends DirectInjection<infer U>
	? U
	: never;

/**
 * Mapped type to convert a list of injection parameters into a list of injectable values
 *
 * @public
 */
export type ArgsForInjectionIdentifiers<Tokens extends [...Array<InjectionIdentifier<unknown>>]> = {
	[Index in keyof Tokens]: InjectedType<Tokens[Index]>;
} & { length: Tokens['length'] };
