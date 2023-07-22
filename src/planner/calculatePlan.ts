import type { FetchFromCache, Plan, PlanStep } from '../models/Plan.js';
import type { Binding } from '../models/Binding.js';
import { getInjections } from '../decorators/registry.js';
import type { Injection } from '../models/Injection.js';

const planBinding = <T>(
	binding: Binding<T>,
	input: Injection<T>,
	resolveBinding: <U>(binding: Binding<U>) => U | Promise<U>,
	resolveInjection: (injection: Injection<unknown>) => PlanStep[],
): Plan<T> => {
	const cache = binding.scope === 'transient' ? undefined : binding.scope;
	const injections = binding.type === 'constructor' ? getInjections(binding.ctr) : [];
	const injectionSteps = injections.flatMap(resolveInjection);
	const fetchFromCache: FetchFromCache | null =
		cache == null
			? null
			: {
					type: 'fetchFromCache',
					cache,
					token: binding.token,
					skipStepsIfFound: injectionSteps.length + 1,
			  };

	return [
		...(fetchFromCache == null ? [] : [fetchFromCache]),
		...injectionSteps,
		{
			type: 'createClass',
			generate: async (): Promise<unknown> => {
				const value = await resolveBinding(binding);
				return input.options.multiple ? [value] : value;
			},
			token: binding.token,
			expectedTokensUsed: injections.map((i) => i.token),
			cache,
		},
	];
};

export const calculatePlan = <T>(
	bindings: Array<Binding<unknown>>,
	resolveBinding: <U>(binding: Binding<U>) => U | Promise<U>,
	input: Injection<unknown>,
): Plan<T> => {
	const token = input.token;
	const binds = bindings.filter((v) => v.token === token);
	if (!input.options.multiple && binds.length > 1) {
		throw new Error(`Multiple bindings exist for token: ${token.identifier.toString()}`);
	}

	if (binds.length === 0) {
		if (input.options.optional) {
			return [
				{
					type: 'createClass',
					generate: () => (input.options.multiple ? [] : undefined),
					token,
					expectedTokensUsed: [],
					cache: undefined,
				},
			];
		} else {
			throw new Error(`Unable to resolve token as no bindings exist: ${token.identifier.toString()}`);
		}
	} else if (binds.length === 1) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const binding = binds[0]!;
		return planBinding(binding, input, resolveBinding, (i) => calculatePlan(bindings, resolveBinding, i));
	} else {
		return [
			...binds.flatMap((b) => planBinding(b, input, resolveBinding, (i) => calculatePlan(bindings, resolveBinding, i))),
			{
				type: 'aggregateMultiple',
				count: binds.length,
				token,
			},
		];
	}
};
