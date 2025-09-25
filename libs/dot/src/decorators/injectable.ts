/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { Container } from '../container/Container.js';
import { Context } from '../container/Context.js';
import type { Injection } from '../models/Injection.js';
import { injectionFromIdentifier } from '../util/injectionFromIdentifier.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

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

const _injections: Array<Injection<unknown, interfaces.MetadataObject>> = [];
export const addInjection = <T>(injection: Injection<T, interfaces.MetadataObject>): void => {
	_injections.push(injection);
};

const _configureInjectable = <T extends object, Tokens extends Array<interfaces.InjectionIdentifier<unknown>>>(
	klass: interfaces.Constructor<T, interfaces.ArgsForInjectionIdentifiers<Tokens>>,
	constructorTokens: Tokens,
): void => {
	Context.global.ensureRegistration(klass);
	_injections.splice(0).forEach((injection) => {
		Context.global.registerInjection(klass, injection);
	});
	constructorTokens.forEach((t, index) => {
		Context.global.registerInjection(klass, injectionFromIdentifier(t, index));
	});
};

/**
 * Decorator for classes to flag them as being usable with this library
 *
 * @example
 *
 * ```typescript
 * const Name = new Token<string>("name");
 *
 * @injectable(Name)
 * class Greeter {
 *   public constructor(name: string) {
 *     console.log(`Hello, ${name}.`);
 *   }
 * }
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
export const injectable = <T extends object, Tokens extends Array<interfaces.InjectionIdentifier<unknown>>>(
	...constructorTokens: Tokens
): ClassDecorator<T, interfaces.ArgsForInjectionIdentifiers<Tokens>> =>
	((target, context) => {
		/* c8 ignore start */
		if (context == null) {
			// experimental
			const klass = ((): typeof target =>
			// @ts-expect-error - TypeScript doesn't like this construct when using the generic interface types.
				class extends target {
					public constructor(...args: interfaces.ArgsForInjectionIdentifiers<Tokens>) {
						super(...(args as never));
						Context.global.getPropertyInjections(klass).forEach(({ name, id }) => {
							const token = tokenForIdentifier(id);
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
							(this as any)[name] = Container.resolvePropertyInjection(token, [token]);
						});
					}
				})();
			_configureInjectable(klass, constructorTokens);

			return klass;
			/* c8 ignore end */
		} else {
			// tc39
			_configureInjectable(target, constructorTokens);

			return undefined;
		}
	}) as ClassDecorator<T, interfaces.ArgsForInjectionIdentifiers<Tokens>>;
