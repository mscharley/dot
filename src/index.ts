import type * as interfaces from './interfaces/index.js';
import { Container } from './Container.js';

/**
 * @public
 */
export const createContainer = (config?: interfaces.ContainerConfiguration): interfaces.Container =>
	new Container(config);

export type { interfaces };
export type { InjectDecorator, InjectDecoratorFactory } from './decorators/inject.js';
export type { InjectableDecorator } from './decorators/injectable.js';
export type { TokenType } from './Token.js';
export { inject } from './decorators/inject.js';
export { injectable } from './decorators/injectable.js';
export { Token } from './Token.js';
