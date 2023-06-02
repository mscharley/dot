import type * as interfaces from './interfaces';
import { Container } from './Container';

/**
 * @public
 */
export const createContainer = (config?: interfaces.ContainerConfiguration): interfaces.Container =>
	new Container(config);

export default createContainer;

export type { interfaces };
export type { InjectDecorator, InjectDecoratorFactory } from './decorators/inject';
export type { InjectableDecorator } from './decorators/injectable';
export type { TokenType } from './Token';
export { inject } from './decorators/inject';
export { injectable } from './decorators/injectable';
export { Token } from './Token';
