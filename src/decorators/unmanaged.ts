import type * as interfaces from '../interfaces/index.js';
import { Token } from '../Token.js';

export const unmanaged = <T>(defaultValue: T, name?: string): interfaces.DirectInjection<T> => ({
	token: new Token(`unmanaged:${name ?? `${defaultValue}`}`),
	generator: () => defaultValue,
});
