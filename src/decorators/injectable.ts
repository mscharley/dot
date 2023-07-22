/* eslint-disable @typescript-eslint/no-type-alias */
import type * as interfaces from '../interfaces/index.js';
import { getPropertyInjections, registerInjection } from './registry.js';
import { Container } from '../Container.js';
import type { Injection } from '../models/Injection.js';

/** @public */
export type ConstructorInjection<T> =
	| interfaces.ServiceIdentifier<T>
	| [interfaces.ServiceIdentifier<T>, Partial<interfaces.InjectOptions>];

/** @public */
export type ConstructorInjectedType<T extends ConstructorInjection<unknown>> = T extends interfaces.ServiceIdentifier<
	infer U
>
	? U
	: T extends [interfaces.ServiceIdentifier<infer U>]
	? U
	: never;

/** @public */
export type ArgsForTokens<Tokens extends [...Array<ConstructorInjection<unknown>>]> = {
	[Index in keyof Tokens]: ConstructorInjectedType<Tokens[Index]>;
} & { length: Tokens['length'] };

/** @public */
export interface InjectableDecorator<Args extends unknown[]> {
	<T extends object>(
		target: interfaces.Constructor<T, Args>,
		context: ClassDecoratorContext<interfaces.Constructor<T, Args>>,
	): undefined;
	<T extends object>(target: interfaces.Constructor<T, Args>, context?: undefined):
		| undefined
		| interfaces.Constructor<T, Args>;
}

const _injections: Array<Injection<unknown>> = [];
export const addInjection = (injection: Injection<unknown>): void => {
	_injections.push(injection);
};

/**
 * @public
 */
export const injectable = <Tokens extends [...Array<ConstructorInjection<unknown>>]>(
	...constructorTokens: Tokens
): InjectableDecorator<ArgsForTokens<Tokens>> =>
	(<T extends object>(
		target: interfaces.Constructor<T, ArgsForTokens<Tokens>>,
		context?: undefined | ClassDecoratorContext<interfaces.Constructor<T, ArgsForTokens<Tokens>>>,
	): undefined | interfaces.Constructor<T, ArgsForTokens<Tokens>> => {
		/* c8 ignore start */
		if (context == null) {
			// experimental

			const klass = ((): typeof target =>
				// @ts-expect-error - TypeScript doesn't like this construct when using the generic interface types.
				class extends target {
					public constructor(...args: ArgsForTokens<Tokens>) {
						super(...(args as never));
						getPropertyInjections(klass).forEach(({ name, token }) => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
							(this as any)[name] = Container.resolve(token);
						});
					}
				})();
			_injections.splice(0).forEach((injection) => {
				registerInjection(klass, injection);
			});
			constructorTokens.forEach((t, index) => {
				const token = Array.isArray(t) ? t[0] : t;
				const partialOpts = Array.isArray(t) ? t[1] : {};
				registerInjection(klass, {
					type: 'constructorParameter',
					index,
					token,
					options: {
						multiple: false,
						optional: false,
						...partialOpts,
					},
				});
			});

			return klass;
			/* c8 ignore end */
		} else {
			// tc39 - no op
			_injections.splice(0).forEach((injection) => {
				registerInjection(target, injection);
			});
			constructorTokens.forEach((t, index) => {
				const token = Array.isArray(t) ? t[0] : t;
				const partialOpts = Array.isArray(t) ? t[1] : {};
				registerInjection(target, {
					type: 'constructorParameter',
					index,
					token,
					options: {
						multiple: false,
						optional: false,
						...partialOpts,
					},
				});
			});

			return undefined;
		}
	}) as InjectableDecorator<ArgsForTokens<Tokens>>;
