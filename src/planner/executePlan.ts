import { InvalidOperationError, TokenResolutionError } from '../Error.js';
import { isNever } from '../util/isNever.js';
import type { Plan } from '../models/Plan.js';
import type { Request } from '../models/Request.js';
import { ResolutionCache } from '../container/ResolutionCache.js';

export const executePlan = async <T>(plan: Plan<T>, { singletonCache, stack, token }: Request<T>): Promise<T> => {
	const caches: Record<'singleton' | 'request', ResolutionCache> = {
		singleton: singletonCache,
		request: new ResolutionCache(),
	};

	let skip = 0;
	for (const step of plan) {
		if (skip > 0) {
			skip--;
			continue;
		}

		const stepStack = stack[step.token.identifier] ?? [];
		switch (step.type) {
			case 'fetchFromCache':
				if (caches[step.cache].has(step.binding)) {
					stepStack.push(caches[step.cache].get(step.binding));
					skip = step.skipStepsIfFound;
				}
				break;
			case 'createClass': {
				try {
					// eslint-disable-next-line no-await-in-loop
					const value = await step.generate();
					stepStack.push(value);
					if (step.cache != null && step.binding != null) {
						caches[step.cache].set(step.binding, value);
					}
				} catch (err: unknown) {
					throw new TokenResolutionError(
						'Encountered an error while creating a class',
						step.resolutionPath,
						err instanceof Error ? err : new Error(`${err}`),
					);
				}
				break;
			}
			case 'aggregateMultiple': {
				const value = stepStack.splice(-step.count);
				if (value.length !== step.count) {
					throw new TokenResolutionError(
						'Unable to load injected services',
						step.resolutionPath,
						new InvalidOperationError(`Unexpected number of services: ${value.length} !== ${step.count}`),
					);
				}
				stepStack.push(value.flat());
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

	if (!(token.identifier in stack)) {
		throw new InvalidOperationError(`Unable to resolve final request: ${token.identifier.toString()}`);
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
