import type * as interfaces from './interfaces';
import { Container } from './Container';

/**
 * @public
 */
export const createContainer = (config?: interfaces.ContainerConfiguration): interfaces.Container =>
	new Container(config);

export type { interfaces };
export { Token } from './Token';
export { inject, injectable } from './decorators';
