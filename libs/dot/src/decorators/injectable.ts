/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import { type ClassDecorator, MetadataContext } from './decorators.js';
import { Container } from '../container/Container.js';
import { Context } from '../container/Context.js';
import type { Injection } from '../models/Injection.js';
import { injectionFromIdentifier } from '../util/injectionFromIdentifier.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

export const injectableProcessed = Symbol('DOT.injectableProcessed');

const _injections: Array<Injection<unknown, interfaces.MetadataObject>> = [];
export const addInjection = <T>(injection: Injection<T, interfaces.MetadataObject>): void => {
	_injections.push(injection);
};

const _configureInjectable = <T extends object, Tokens extends Array<interfaces.InjectionIdentifier<unknown>>>(
	klass: interfaces.Constructor<T, interfaces.ArgsForInjectionIdentifiers<Tokens>>,
	contexts: Context[],
	constructorTokens: Tokens,
): void => {
	Context.all.ensureRegistration(klass);
	for (const c of contexts) {
		c.ensureRegistration(klass);
	}
	_injections.splice(0).forEach((injection) => {
		Context.all.registerInjection(klass, injection);
		for (const c of contexts) {
			c.registerInjection(klass, injection);
		}
	});
	constructorTokens.forEach((t, index) => {
		Context.all.registerInjection(klass, injectionFromIdentifier(t, index));
		for (const c of contexts) {
			c.registerInjection(klass, injectionFromIdentifier(t, index));
		}
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
		// Stryker disable all
		if (context == null) {
			// experimental
			// eslint-disable-next-line @stylistic/max-len
			const contexts = (target as unknown as Record<typeof MetadataContext, undefined | Context[]>)[MetadataContext] ?? [Context.global];
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
			delete (target as any)[MetadataContext];
			const klass = ((): typeof target =>
				// @ts-expect-error - TypeScript doesn't like this construct when using the generic interface types.
				class extends target {
					public constructor(...args: interfaces.ArgsForInjectionIdentifiers<Tokens>) {
						super(...(args as never));
						contexts[0]?.getPropertyInjections(klass).forEach(({ name, id }) => {
							const token = tokenForIdentifier(id);
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
							(this as any)[name] = Container.resolvePropertyInjection(token, [token]);
						});
					}
				})();
			(klass as unknown as Record<typeof MetadataContext, symbol>)[MetadataContext] = injectableProcessed;
			_configureInjectable(klass, contexts, constructorTokens);

			return klass;
			// Stryker restore all
			/* c8 ignore end */
		} else {
			// tc39
			const contexts = (context.metadata?.[MetadataContext] as Context[] | undefined) ?? [Context.global];
			// This will throw an error with any of the context decorators if this invariant is not met.
			if (context.metadata != null) {
				context.metadata[MetadataContext] = injectableProcessed;
			}

			_configureInjectable(target, contexts, constructorTokens);

			return undefined;
		}
	}) as ClassDecorator<T, interfaces.ArgsForInjectionIdentifiers<Tokens>>;
