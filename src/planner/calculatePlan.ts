import type { FetchFromCache, Plan } from '../models/Plan.js';
import type { Binding } from '../models/Binding.js';
import { getInjections } from '../decorators/registry.js';
import type { Injection } from '../models/Injection.js';

export const calculatePlan = <T>(
	bindings: Array<Binding<unknown>>,
	resolveBinding: <U>(binding: Binding<U>) => U | Promise<U>,
	input: Injection,
): Plan<T> => {
	const token = input.token;
	const binds = bindings.filter((v) => v.token === token);
	if (binds.length > 1) {
		throw new Error(`Multiple bindings exist for token: ${token.identifier.toString()}`);
	}

	const binding = binds[0];
	if (binding == null) {
		if (input.options.optional) {
			return [
				{
					type: 'createClass',
					generate: () => undefined as T,
					token,
					expectedTokensUsed: [],
					cache: undefined,
				},
			];
		} else {
			throw new Error(`Unable to resolve token as no bindings exist: ${token.identifier.toString()}`);
		}
	}

	const cache = binding.scope === 'transient' ? undefined : binding.scope;
	const injections = binding.type === 'constructor' ? getInjections(binding.ctr) : [];
	const injectionSteps = injections.flatMap((i) => calculatePlan(bindings, resolveBinding, i));
	const fetchFromCache: FetchFromCache | null =
		cache == null
			? null
			: {
					type: 'fetchFromCache',
					cache,
					token,
					skipStepsIfFound: injectionSteps.length + 1,
			  };

	return [
		...(fetchFromCache == null ? [] : [fetchFromCache]),
		...injectionSteps,
		{
			type: 'createClass',
			generate: () => resolveBinding(binding),
			token,
			expectedTokensUsed: injections.map((i) => i.token),
			cache,
		},
	];
};
