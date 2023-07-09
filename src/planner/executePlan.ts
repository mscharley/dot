import { isNever } from '../util/isNever.js';
import type { Plan } from '../models/Plan.js';
import type { Request } from '../models/Request.js';

export const executePlan = async <T>(plan: Plan<T>, { singletonCache, stack, token }: Request<T>): Promise<T> => {
	const caches: Record<'singleton' | 'request', Record<symbol, unknown>> = {
		singleton: singletonCache,
		request: {},
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
				if (step.token.identifier in caches[step.cache]) {
					stepStack.push(caches[step.cache][step.token.identifier]);
					skip = step.skipStepsIfFound;
				}
				break;
			case 'createClass': {
				// eslint-disable-next-line no-await-in-loop
				const value = await step.generate();
				stepStack.push(value);
				if (step.cache != null) {
					caches[step.cache][step.token.identifier] = value;
				}
				break;
			}
			default:
				isNever(step, 'Invalid plan step');
		}
		// eslint-disable-next-line require-atomic-updates
		stack[step.token.identifier] = stepStack;
	}

	if (!(token.identifier in stack)) {
		throw new Error(`Unable to resolve final request: ${token.identifier.toString()}`);
	}
	const [returnValue] = (stack[token.identifier]?.splice(0, 1) ?? []) as T[];

	if (stack[token.identifier]?.length === 0) {
		delete stack[token.identifier];
	}

	const unresolved = Object.keys(stack);
	if (unresolved.length > 0) {
		throw new Error(
			`Unresolved dependecies created. This implies a missing @injectable somewhere in your application. Extra dependencies: ${unresolved
				.map((i) => i.toString())
				.join(', ')}`,
		);
	}
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return returnValue!;
};
