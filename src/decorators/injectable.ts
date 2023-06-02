import type * as interfaces from '../interfaces';
import { Container } from '../Container';
import type { Token } from '../Token';

/** @public */
export interface InjectableDecorator<T> {
	(target: new () => T, context: ClassDecoratorContext<new () => T>): undefined;
	(target: new () => T): undefined | (new () => T);
}

export const mappings = new WeakMap<
	new () => unknown,
	Record<string | symbol, { token: Token<unknown>; options: interfaces.InjectOptions }>
>();

/**
 * @public
 */
export const injectable = <T>(): InjectableDecorator<T> =>
	((target, context?) => {
		/* c8 ignore start */
		if (context == null) {
			// experimental
			const map = Object.entries(mappings.get(target) ?? {});
			return class extends target {
				public constructor() {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					super();
					map.forEach(([prop, { token, options }]) => {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
						(this as any)[prop] = Container.resolve(token, options);
					});
				}
			};
			/* c8 ignore end */
		} else {
			/* tc39 - no op */
			return undefined;
		}
	}) as InjectableDecorator<T>;
