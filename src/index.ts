import type * as interfaces from './interfaces';
import { Container } from './Container';

/**
 * @public
 */
export const createContainer = (config?: interfaces.ContainerConfiguration): interfaces.Container =>
	new Container(config);

export default createContainer;

export type { interfaces };
export type { InjectDecorator, InjectableDecorator } from './decorators';
export type { TokenType } from './Token';
export { inject, injectable } from './decorators';
export { Token } from './Token';
