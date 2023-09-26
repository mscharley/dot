import type { Container } from './Container.js';

export interface FactoryContext {
	container: Pick<Container, 'createChild' | 'config'>;
}
