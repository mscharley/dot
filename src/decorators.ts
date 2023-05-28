import { Container } from './Container';
import type { Token } from './Token';

/* eslint-disable @typescript-eslint/ban-types */
/** @public */
export interface InjectableDecorator<T> {
	(target: new () => T, context: ClassDecoratorContext<new () => T>): undefined;
	(target: new () => T): undefined | (new () => T);
}

/** @public */
export interface InjectDecorator<T> {
	(target: undefined, context: ClassFieldDecoratorContext<unknown, T>): (originalValue: T | undefined) => T;
	(target: { constructor: Function }, propertyName: string | symbol): undefined;
}
/* eslint-enable @typescript-eslint/ban-types */

const mappings = new WeakMap<new () => unknown, Record<string | symbol, Token<unknown>>>();

/**
 * @public
 */
export const injectable = <T>(): InjectableDecorator<T> =>
	((target, context?) => {
		if (context == null) {
			const map = Object.entries(mappings.get(target) ?? {});
			return class extends target {
				public constructor() {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					super();
					map.forEach(([prop, token]) => {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
						(this as any)[prop] = Container.resolve(token);
					});
				}
			};
		} else {
			/* tc39 - no op */
			return undefined;
		}
	}) as InjectableDecorator<T>;

/**
 * @public
 */
export const inject = <T>(token: Token<T>): InjectDecorator<T> =>
	((target, context) => {
		if (target != null) {
			const ctr = target.constructor as new () => T;
			const map = mappings.get(ctr) ?? {};
			map[context as Exclude<typeof context, ClassFieldDecoratorContext<unknown, T>>] = token;
			mappings.set(ctr, map);

			return undefined;
		} else {
			return (_originalValue: T | undefined): T => {
				const value = Container.resolve<T>(token);

				return value;
			};
		}
	}) as InjectDecorator<T>;
