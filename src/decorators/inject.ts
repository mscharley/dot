import { Container } from '../Container';
import { mappings } from './injectable';
import type { Token } from '../Token';

/* eslint-disable @typescript-eslint/ban-types */
/** @public */
export interface InjectDecorator<T> {
	(target: undefined, context: ClassFieldDecoratorContext<unknown, T>): (originalValue: T | undefined) => T;
	(target: { constructor: Function }, propertyName: string | symbol): undefined;
}
/* eslint-enable @typescript-eslint/ban-types */

/**
 * @public
 */
export const inject = <T>(token: Token<T>): InjectDecorator<T> =>
	((target, context) => {
		/* c8 ignore start */
		if (target != null) {
			// experimental
			const ctr = target.constructor as new () => T;
			const map = mappings.get(ctr) ?? {};
			map[context as Exclude<typeof context, ClassFieldDecoratorContext<unknown, T>>] = token;
			mappings.set(ctr, map);

			return undefined;
			/* c8 ignore end */
		} else {
			// tc39
			return (_originalValue: T | undefined): T => {
				const value = Container.resolve<T>(token);

				return value;
			};
		}
	}) as InjectDecorator<T>;
