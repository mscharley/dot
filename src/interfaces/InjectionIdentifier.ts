/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ServiceIdentifier, ServiceIdentifierWithMetadata } from './ServiceIdentifier.js';
import type { DirectInjection } from './DirectInjection.js';
import type { InjectOptions } from './InjectOptions.js';
import type { MetadataObject } from './MetadataObject.js';

/**
 * Valid options for parameters into the `@injectable` decorator
 *
 * @public
 */
export type InjectionIdentifier<T> =
	| ServiceIdentifier<T>
	| [ServiceIdentifier<T>, Partial<InjectOptions<MetadataObject>> | undefined]
	| DirectInjection<T>;

/**
 * Helper type which is used to map an {@link @mscharley/dot#interfaces.InjectionIdentifier | InjectionIdentifier} into the type that will be injected
 *
 * @public
 */
export type InjectedType<T extends InjectionIdentifier<unknown>> =
	T extends [ ServiceIdentifier<infer U>, { multiple: true } ] ? U[]
		: T extends [ServiceIdentifier<infer U>, { optional: true }] ? U | undefined
			: T extends [ServiceIdentifier<infer U>, unknown] ? U
				: T extends ServiceIdentifier<infer U> ? U
					: T extends DirectInjection<infer U> ? U
						: never;

/**
 * Helper type which is used to map an {@link @mscharley/dot#interfaces.InjectionIdentifier | InjectionIdentifier} into the type of any metadata that might be requested
 *
 * @public
 */
export type InjectedMetadata<T extends InjectionIdentifier<unknown>> =
	T extends [ServiceIdentifierWithMetadata<unknown, infer U>, unknown] ? U
		: T extends ServiceIdentifierWithMetadata<unknown, infer U> ? U
			: MetadataObject;

/**
 * Mapped type to convert a list of injection parameters into a list of injectable values
 *
 * @public
 */
export type ArgsForInjectionIdentifiers<Tokens extends [...Array<InjectionIdentifier<unknown>>]> = {
	[Index in keyof Tokens]: InjectedType<Tokens[Index]>;
} & { length: Tokens['length'] };
