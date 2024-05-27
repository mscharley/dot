/* eslint-disable @typescript-eslint/no-type-alias */

import type * as interfaces from '../interfaces/index.js';
import type { AggregateMultiple, CreateInstance, FetchFromCache, Plan } from '../models/Plan.js';
import { InvalidOperationError, TokenResolutionError } from '../Error.js';
import type { Binding } from '../models/Binding.js';
import { isNever } from '../util/isNever.js';
import type { MutexInterface } from 'async-mutex';
import type { Request } from '../models/Request.js';
import { ResolutionCache } from '../container/ResolutionCache.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';

type Releasers = Map<Binding<unknown, interfaces.MetadataObject>, MutexInterface.Releaser>;
type Caches = Record<'singleton' | 'request', ResolutionCache>;

const fetchFromCache = async (
	step: FetchFromCache<unknown>,
	stepStack: unknown[],
	caches: Caches,
	releasers: Releasers,
): Promise<number> => {
	const releaser = await caches[step.cache].lock(step.binding);
	releasers.set(step.binding, releaser);
	if (caches[step.cache].has(step.binding)) {
		stepStack.push(caches[step.cache].get(step.binding));
		releaser();
		releasers.delete(step.binding);
		return step.skipStepsIfFound;
	}

	return 0;
};

const createClass = async (
	step: CreateInstance<unknown>,
	stepStack: unknown[],
	caches: Caches,
	releasers: Releasers,
): Promise<void> => {
	try {
		const value = await step.generate();
		stepStack.push(value);
		if (step.cache != null && step.binding != null) {
			caches[step.cache].set(step.binding, value);
			const releaser = releasers.get(step.binding);
			if (releaser != null) {
				releaser();
				releasers.delete(step.binding);
			}
		}
	} catch (err: unknown) {
		throw new TokenResolutionError(
			'Encountered an error while creating a class',
			step.resolutionPath,
			err instanceof Error ? err : new Error(`${err}`),
		);
	}
};

const aggregateMultiple = (step: AggregateMultiple<unknown>, stepStack: unknown[]): void => {
	const value = stepStack.splice(-step.count);
	if (value.length !== step.count) {
		throw new TokenResolutionError(
			'Unable to load injected services',
			step.resolutionPath,
			new InvalidOperationError(`Unexpected number of services: ${value.length} !== ${step.count}`),
		);
	}
	stepStack.push(value.flat());
};

export const executePlan = async <T>(plan: Plan, { container, singletonCache, stack, token }: Request<T>): Promise<T> => {
	const caches: Caches = {
		singleton: singletonCache,
		request: new ResolutionCache(),
	};
	const releasers: Releasers = new Map();

	try {
		let skip = 0;
		for (const step of plan) {
			if (skip > 0) {
				skip--;
				continue;
			}

			const stepStack = stack[step.token.identifier] ?? [];
			switch (step.type) {
				case 'fetchFromCache':
					// eslint-disable-next-line no-await-in-loop
					skip = await fetchFromCache(step, stepStack, caches, releasers);
					break;
				case 'createClass': {
					// eslint-disable-next-line no-await-in-loop
					await createClass(step, stepStack, caches, releasers);
					break;
				}
				case 'aggregateMultiple': {
					aggregateMultiple(step, stepStack);
					break;
				}
				case 'requestFromParent':
					// eslint-disable-next-line no-await-in-loop
					stepStack.push(await step.parent.get(step.token, step.options));
					break;
				default:
					return isNever(step, 'Invalid plan step');
			}
			// eslint-disable-next-line require-atomic-updates
			stack[step.token.identifier] = stepStack;
		}
		// No error caused us to fail early, so warn about these issues.
		for (const [binding, r] of releasers.entries()) {
			container.config.logger.warn({ binding }, 'Releasing unreleased mutex, this is probably a bug in DOT.');
			r();
		}
		releasers.clear();
	}	finally {
		// If we hit this then we likely ran into an error above, so silently clean up behind ourselves.
		for (const r of releasers.values()) {
			r();
		}
	}

	if (!(token.identifier in stack)) {
		throw new InvalidOperationError(`Unable to resolve final request: ${stringifyIdentifier(token)}`);
	}
	const [returnValue] = (stack[token.identifier]?.splice(0, 1) ?? []) as T[];

	if (stack[token.identifier]?.length === 0) {
		delete stack[token.identifier];
	}

	const unresolved = Object.getOwnPropertySymbols(stack);
	if (unresolved.length > 0) {
		throw new InvalidOperationError(
			`Unresolved dependecies created, this is probably a bug. Please report this! Extra dependencies: ${unresolved
				.map((i) => i.toString())
				.join(', ')}`,
		);
	}
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return returnValue!;
};
