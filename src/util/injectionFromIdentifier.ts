import type * as interfaces from '../interfaces/index.js';
import type { Injection } from '../models/Injection.js';

export const injectionFromIdentifier = <T>(
	id: interfaces.InjectionIdentifier<T>,
	index: number,
): Injection<T, interfaces.InjectedMetadata<typeof id>> => {
	const token = Array.isArray(id) ? id[0] : id as Exclude<typeof id, unknown[]>;
	const partialOpts = Array.isArray(id) ? id[1] : {};
	if (typeof token === 'function' || 'identifier' in token) {
		return {
			type: 'constructorParameter',
			index,
			id: token,
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			options: {
				multiple: false,
				optional: false,
				metadata: {},
				...partialOpts,
			} as interfaces.InjectOptions<interfaces.InjectedMetadata<typeof id>>,
		};
	} else {
		return {
			type: 'unmanagedConstructorParameter',
			index,
			id: token.token,
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			options: {
				multiple: false,
				optional: false,
				metadata: {},
				...partialOpts,
			} as interfaces.InjectOptions<interfaces.InjectedMetadata<typeof id>>,
			value: token,
		};
	}
};
