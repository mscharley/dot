import type { Container } from './Container.js';
import type { ContainerConfiguration } from './ContainerConfiguration.js';

/**
 * Shared type used for functions which create new containers
 *
 * @public
 */
export type ContainerFactory = (options?: Partial<ContainerConfiguration>) => Container;
