import type * as interfaces from '../interfaces/index.js';
import type { AggregateMultiple, CreateInstance, FetchFromCache, Plan, PlanStep } from '../models/Plan.js';
import { InvalidOperationError, RecursiveResolutionError, TokenResolutionError } from '../Error.js';
import type { Binding } from '../models/Binding.js';
import { getInjections } from '../decorators/registry.js';
import type { Injection } from '../models/Injection.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';
import type { Token } from '../Token.js';

const planBinding = <T>(
	binding: Binding<T>,
	input: Injection<T>,
	resolutionPath: Array<Token<unknown>>,
	resolveBinding: <U>(binding: Binding<U>, resolutionPath: Array<Token<unknown>>) => U | Promise<U>,
	resolveInjection: (injection: Injection<unknown>) => PlanStep[],
): Plan<T> => {
	const cache = binding.scope === 'transient' ? undefined : binding.scope;
	const injections: Array<Injection<unknown>> =
		binding.type === 'constructor' ? getInjections(binding.ctr) : binding.type === 'dynamic' ? binding.injections : [];
	const injectionSteps = injections.flatMap(resolveInjection) as Plan<T>;
	const fetchFromCache: FetchFromCache<T> | null =
		cache == null
			? null
			: ({
					type: 'fetchFromCache',
					cache,
					binding: binding,
					token: binding.token,
					skipStepsIfFound: injectionSteps.length + 1,
			  } satisfies FetchFromCache<T>);

	return [
		...(fetchFromCache == null ? [] : [fetchFromCache]),
		...injectionSteps,
		{
			type: 'createClass',
			generate: async (): Promise<T> => {
				const value = await resolveBinding(binding, resolutionPath);
				return input.options.multiple ? ([value] as T) : value;
			},
			token: binding.token,
			expectedTokensUsed: injections.map((i) => i.token),
			cache,
			binding,
			resolutionPath,
		} satisfies CreateInstance<T>,
	];
};

export const calculatePlan = <T>(
	bindings: Array<Binding<unknown>>,
	resolveBinding: <U>(binding: Binding<U>, resolutionPath: Array<Token<unknown>>) => U | Promise<U>,
	input: Injection<T>,
	resolutionPath: Array<Token<unknown>>,
	parent?: interfaces.Container,
): Plan<T> => {
	if (input.type === 'unmanagedConstructorParameter') {
		// Unmanaged constructor parameters are dealt with as static values and don't need any plan to resolve them.
		return [];
	}
	const token = input.token;
	if (resolutionPath.includes(token)) {
		throw new RecursiveResolutionError('Recursive binding detected', [...resolutionPath, token]);
	}

	const binds = bindings.filter((v) => v.token === token);
	if (!input.options.multiple && binds.length > 1) {
		throw new RecursiveResolutionError('Multiple bindings exist for token', [...resolutionPath, token]);
	}

	if (binds.length === 0) {
		if (input.options.optional) {
			return [
				{
					type: 'createClass',
					generate: () => (input.options.multiple ? [] : undefined) as T,
					token,
					binding: undefined,
					expectedTokensUsed: [],
					cache: undefined,
					resolutionPath: [...resolutionPath, token],
				},
			];
		} else if (parent != null) {
			return [{ type: 'requestFromParent', token, parent, options: input.options }];
		} else {
			throw new TokenResolutionError(
				'Unable to resolve token',
				[...resolutionPath, token],
				new InvalidOperationError(`No bindings exist for token: ${stringifyIdentifier(token)}`),
			);
		}
	} else if (binds.length === 1) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const binding = binds[0]!;
		return planBinding(binding, input, [...resolutionPath, token], resolveBinding, (i) =>
			calculatePlan(bindings, resolveBinding, i, [...resolutionPath, token]),
		) as Plan<T>;
	} else {
		return [
			...(binds.flatMap((b) =>
				planBinding(b, input, [...resolutionPath, token], resolveBinding, (i) =>
					calculatePlan(bindings, resolveBinding, i, [...resolutionPath, token]),
				),
			) as Plan<T>),
			{
				type: 'aggregateMultiple',
				count: binds.length,
				token,
				resolutionPath: [...resolutionPath, token],
			} satisfies AggregateMultiple<T>,
		];
	}
};
