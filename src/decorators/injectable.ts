import { getPropertyInjections, registerInjection } from './registry.js';
import { Container } from '../Container.js';
import type { Injection } from '../models/Injection.js';

/** @public */
export interface InjectableDecorator<T> {
	(target: new () => T, context: ClassDecoratorContext<new () => T>): undefined;
	(target: new () => T, context?: undefined): undefined | (new () => T);
}

const _tc39Injections: Injection[] = [];
export const addTc39Injection = (injection: Injection): void => {
	_tc39Injections.push(injection);
};

/**
 * @public
 */
export const injectable = <T>(): InjectableDecorator<T> =>
	((target, context?) => {
		/* c8 ignore start */
		if (context == null) {
			// experimental
			const map = getPropertyInjections(target);
			return class extends target {
				public constructor() {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					super();
					map.forEach(({ name, token }) => {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
						(this as any)[name] = Container.resolve(token);
					});
				}
			};
			/* c8 ignore end */
		} else {
			// tc39 - no op
			_tc39Injections.splice(0).forEach((injection) => {
				registerInjection(target, injection);
			});

			return undefined;
		}
	}) as InjectableDecorator<T>;
