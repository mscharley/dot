import { Container } from './Container';
import type { Token } from './Token';

export interface InjectDecorator<T> {
	(target: undefined, context: ClassFieldDecoratorContext<unknown, T>): (originalValue: T | undefined) => T;
	(target: object, propertyName: string | symbol): void;
}

/**
 * @public
 */
export const injectable =
	() =>
	<T>(_target: new () => T, context?: ClassDecoratorContext<new () => T>): void => {
		console.log('injectable:', _target, context);
		if (context == null) {
			/* experimental - no op */
			throw new Error('Typescript experimental decorators have not been implemented yet.');
		} else {
			/* tc39 - no op */
		}
	};

/**
 * @public
 */
export const inject = <T>(token: Token<T>): InjectDecorator<T> =>
	((target, context): undefined | ((originalValue: T | undefined) => T) => {
		console.log('inject:', target, context);
		if (target != null) {
			/* experimental - no op */
			throw new Error('Typescript experimental decorators have not been implemented yet.');

			return undefined;
		} else {
			return (_originalValue: T | undefined): T => {
				const value = Container.resolve<T>(token);

				return value;
			};
		}
	}) as InjectDecorator<T>;
