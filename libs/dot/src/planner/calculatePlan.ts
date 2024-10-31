/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import type { AggregateMultiple, CreateInstance, FetchFromCache, Plan } from '../models/Plan.js';
import { InvalidOperationError, RecursiveResolutionError, TokenResolutionError } from '../Error.js';
import type { Binding } from '../models/Binding.js';
import { getInjections } from '../decorators/registry.js';
import type { Injection } from '../models/Injection.js';
import { isNever } from '../util/isNever.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';
import type { Token } from '../Token.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

const resolveInjections = <T, Metadata extends interfaces.MetadataObject>(
	binding: Binding<T, Metadata>,
): Array<Injection<T, Metadata>> => {
	switch (binding.type) {
		case 'factory':
		case 'dynamic':
			return binding.injections;
		case 'constructor':
			return getInjections(binding.ctr) as Array<Injection<T, Metadata>>;
		case 'static':
			return [];
		default: return isNever(binding, 'Invalid binding');
	}
};

const planBinding = <T, Metadata extends interfaces.MetadataObject>(
	binding: Binding<T, Metadata>,
	input: Injection<T, Metadata>,
	resolutionPath: Array<Token<unknown>>,
	resolveBinding: <U, Meta extends interfaces.MetadataObject>(binding: Binding<U, Meta>, injection: Injection<U, Meta>, resolutionPath: Array<Token<unknown>>) => U | Promise<U>,
	resolveInjection: (injection: Injection<unknown, interfaces.MetadataObject>) => Plan,
): Plan => {
	const cache = binding.scope === 'transient' ? undefined : binding.scope;
	const injections = resolveInjections(binding);
	const injectionSteps: Plan = injections.flatMap(resolveInjection);
	const fetchFromCache: FetchFromCache<T> | null
		= cache == null
			? null
			: ({
					type: 'fetchFromCache',
					cache,
					binding: binding as Binding<T, interfaces.MetadataObject>,
					token: binding.token,
					skipStepsIfFound: injectionSteps.length + 1,
				} satisfies FetchFromCache<T>);

	return [
		...(fetchFromCache == null ? [] : [fetchFromCache]),
		...injectionSteps,
		{
			type: 'createClass',
			generate: async (): Promise<T> => {
				const value = await resolveBinding(binding, input, resolutionPath);
				return input.options.multiple ? ([value] as T) : value;
			},
			id: binding.id,
			token: binding.token,
			expectedTokensUsed: injections.map((i) => tokenForIdentifier(i.id)),
			cache,
			binding: binding as Binding<T, interfaces.MetadataObject>,
			resolutionPath,
		} satisfies CreateInstance<T>,
	];
};

export const calculatePlan = <T>(
	getBindings: <U, Meta extends interfaces.MetadataObject>(injection: Injection<U, Meta>) => Array<Binding<U, Meta>>,
	resolveBinding: <U, Meta extends interfaces.MetadataObject>(binding: Binding<U, Meta>, injection: Injection<U, Meta>, resolutionPath: Array<Token<unknown>>) => U | Promise<U>,
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

	const binds = getBindings(input);
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
		);
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
