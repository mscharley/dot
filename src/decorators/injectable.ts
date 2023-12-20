import type * as interfaces from '../interfaces/index.js';
import { Container, GlobalContext } from '../container/Container.js';
import { getMetadata } from './metadata.js';
import type { Injection } from '../models/Injection.js';
import { injectionFromIdentifier } from '../util/injectionFromIdentifier.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

/**
 * ConstructorTypesafe definition of a class decorator
 *
 * @remarks
 *
 * See {@link injectable | @injectable}
 *
 * @public
 */
export interface InjectableDecorator<Args extends unknown[]> {
	// TC39 definition
	<T extends object>(
		target: interfaces.Constructor<T, Args>,
		context: ClassDecoratorContext<interfaces.Constructor<T, Args>>,
	): undefined;
	// experimental decorators definition
	<T extends interfaces.Constructor<object, Args>>(target: T, context?: undefined): T;
}

const _injections: Array<Injection<unknown>> = [];
export const addInjection = <T>(injection: Injection<T>): void => {
	_injections.push(injection);
};

const _configureInjectable = <T extends object, Tokens extends Array<interfaces.InjectionIdentifier<unknown>>>(
	klass: interfaces.Constructor<T, interfaces.ArgsForInjectionIdentifiers<Tokens>>,
	constructorTokens: Tokens,
	metadata: DecoratorMetadataObject,
): void => {
	const contexts = getMetadata(metadata).contexts ?? [GlobalContext];
	contexts.forEach((ctx) => {
		ctx.ensureRegistration(klass);
		_injections.splice(0).forEach((injection) => {
			ctx.registerInjection(klass, injection);
		});
		constructorTokens.forEach((t, index) => {
			ctx.registerInjection(klass, injectionFromIdentifier(t, index));
		});
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
export const injectable = <Tokens extends Array<interfaces.InjectionIdentifier<unknown>>>(
	...constructorTokens: Tokens
): InjectableDecorator<interfaces.ArgsForInjectionIdentifiers<Tokens>> =>
	(<T extends object>(
		target: interfaces.Constructor<T, interfaces.ArgsForInjectionIdentifiers<Tokens>>,
		context?:
			| undefined
			| ClassDecoratorContext<interfaces.Constructor<T, interfaces.ArgsForInjectionIdentifiers<Tokens>>>,
	): undefined | interfaces.Constructor<T, interfaces.ArgsForInjectionIdentifiers<Tokens>> => {
		/* c8 ignore start */
		if (context == null) {
			// experimental

			const klass = ((): typeof target =>
				// @ts-expect-error - TypeScript doesn't like this construct when using the generic interface types.
				class extends target {
					public constructor(...args: interfaces.ArgsForInjectionIdentifiers<Tokens>) {
						super(...(args as never));
						const ctx = getMetadata(klass[Symbol.metadata] ?? {}).contexts ?? [GlobalContext];
						(ctx.map((c) => c.getPropertyInjections(klass)).find((v) => v.length > 0) ?? []).forEach(({ name, id }) => {
							const token = tokenForIdentifier(id);
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
							(this as any)[name] = Container.resolvePropertyInjection(token, [token]);
						});
					}
				})();
			_configureInjectable(klass, constructorTokens, klass[Symbol.metadata] ?? {});

			return klass;
			/* c8 ignore end */
		} else {
			// tc39
			_configureInjectable(target, constructorTokens, context.metadata);

			return undefined;
		}
	}) as InjectableDecorator<interfaces.ArgsForInjectionIdentifiers<Tokens>>;
