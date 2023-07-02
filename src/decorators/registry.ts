/* eslint-disable @typescript-eslint/no-type-alias */
import type * as interfaces from '../interfaces/index.js';
import type { Token } from '../Token.js';

export interface PropertyInjection<T = unknown> {
	type: 'property';
	name: string | symbol;
	token: Token<T>;
	options: interfaces.InjectOptions;
}

export type Injection = PropertyInjection;

const registry = new WeakMap<new () => unknown, Injection[]>();

export const registerInjection = <T>(klass: new () => T, injection: Injection): void => {
	const injections = registry.get(klass) ?? [];
	injections.push(injection);

	registry.set(klass, injections);
};

export const getPropertyInjections = <T>(klass: new () => T): PropertyInjection[] => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (registry.get(klass) ?? []).filter((i) => i.type === 'property');
};
