import { getPropertyInjections, registerInjection } from './registry.js';
import { Container } from '../Container.js';
import type { Injection } from '../models/Injection.js';

/** @public */
export interface InjectableDecorator<T> {
	(target: new () => T, context: ClassDecoratorContext<new () => T>): undefined;
	(target: new () => T, context?: undefined): undefined | (new () => T);
}

const _injections: Injection[] = [];
export const addInjection = (injection: Injection): void => {
	_injections.push(injection);
};

/**
 * @public
 */
export const injectable = <T>(): InjectableDecorator<T> =>
	((target, context?) => {
		/* c8 ignore start */
		if (context == null) {
			// experimental
			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
			const klass = (() =>
				class extends target {
					public constructor() {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-call
						super();
						getPropertyInjections(klass).forEach(({ name, token }) => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
							(this as any)[name] = Container.resolve(token);
						});
					}
				})();
			_injections.splice(0).forEach((injection) => {
				registerInjection(klass, injection);
			});

			return klass;
			/* c8 ignore end */
		} else {
			// tc39 - no op
			_injections.splice(0).forEach((injection) => {
				registerInjection(target, injection);
			});

			return undefined;
		}
	}) as InjectableDecorator<T>;
