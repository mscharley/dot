import type * as interfaces from '../interfaces/index.js';
import type { AggregateMultiple, CreateInstance, FetchFromCache, Plan } from '../models/Plan.js';
import { InvalidOperationError, RecursiveResolutionError, TokenResolutionError } from '../Error.js';
import type { Binding } from '../models/Binding.js';
import { getInjections } from '../decorators/registry.js';
import type { Injection } from '../models/Injection.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';
import type { Token } from '../Token.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

const planBinding = <T, Metadata extends interfaces.MetadataObject>(
	binding: Binding<T>,
	input: Injection<T, Metadata>,
	resolutionPath: Array<Token<unknown>>,
	resolveBinding: <U>(binding: Binding<U>, resolutionPath: Array<Token<unknown>>) => U | Promise<U>,
	resolveInjection: (injection: Injection<unknown, interfaces.MetadataObject>) => Plan,
): Plan => {
	const cache = binding.scope === 'transient' ? undefined : binding.scope;
	const injections: Array<Injection<unknown, interfaces.MetadataObject>>
		= binding.type === 'constructor' ? getInjections(binding.ctr) : binding.type === 'dynamic' ? binding.injections : [];
	const injectionSteps: Plan = injections.flatMap(resolveInjection);
	const fetchFromCache: FetchFromCache<T> | null
		= cache == null
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
			id: binding.id,
			token: binding.token,
			expectedTokensUsed: injections.map((i) => tokenForIdentifier(i.id)),
			cache,
			binding,
			resolutionPath,
		} satisfies CreateInstance<T>,
	];
};

export const calculatePlan = <T>(
	getBindings: <U>(id: interfaces.ServiceIdentifier<U>) => Array<Binding<U>>,
	resolveBinding: <U>(binding: Binding<U>, resolutionPath: Array<Token<unknown>>) => U | Promise<U>,
	input: Injection<T, interfaces.MetadataObject>,
	resolutionPath: Array<Token<unknown>>,
	parent?: interfaces.Container,
): Plan => {
	if (input.type === 'unmanagedConstructorParameter') {
		// Unmanaged constructor parameters are dealt with as static values and don't need any plan to resolve them.
		return [];
	}
	const id = input.id;
	const token = tokenForIdentifier(id);
	if (resolutionPath.includes(token)) {
		throw new RecursiveResolutionError('Recursive binding detected', [...resolutionPath, token]);
	}

	const binds = getBindings(id);
	if (!input.options.multiple && binds.length > 1) {
		throw new TokenResolutionError(
			'Unable to resolve token',
			[...resolutionPath, token],
			new InvalidOperationError('Multiple bindings exist for this token but multiple injection was not allowed'),
		);
	}

	if (binds.length === 0) {
		if (parent != null) {
			return [{ type: 'requestFromParent', token, parent, options: input.options }];
		} else if (input.options.optional) {
			return [
				{
					type: 'createClass',
					generate: () => (input.options.multiple ? [] : undefined) as T,
					id,
					token,
					binding: undefined,
					expectedTokensUsed: [],
					cache: undefined,
					resolutionPath: [...resolutionPath, token],
				},
			];
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
			calculatePlan(getBindings, resolveBinding, i, [...resolutionPath, token], parent),
		) as Plan;
	} else {
		return [
			...(binds.flatMap((b) =>
				planBinding(b, input, [...resolutionPath, token], resolveBinding, (i) =>
					calculatePlan(getBindings, resolveBinding, i, [...resolutionPath, token], parent),
				),
			) as Plan),
			{
				type: 'aggregateMultiple',
				count: binds.length,
				token,
				resolutionPath: [...resolutionPath, token],
			} satisfies AggregateMultiple,
		];
	}
};
