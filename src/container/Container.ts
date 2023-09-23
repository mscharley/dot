import type * as interfaces from '../interfaces/index.js';
import { InvalidOperationError, TokenResolutionError } from '../Error.js';
import type { Binding } from '../models/Binding.js';
import type { BindingBuilder } from './BindingBuilder.js';
import { calculatePlan } from '../planner/calculatePlan.js';
import { ClassBindingBuilder } from './BindingBuilder.js';
import { executePlan } from '../planner/executePlan.js';
import { getConstructorParameterInjections } from '../decorators/registry.js';
import type { Injection } from '../models/Injection.js';
import { isNever } from '../util/isNever.js';
import { noop } from '../util/noop.js';
import type { Request } from '../models/Request.js';
import { ResolutionCache } from './ResolutionCache.js';
import type { Token } from '../Token.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

export class Container implements interfaces.Container {
	static #currentRequest: Request<unknown> | undefined;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly #incompleteBindings = new Set<BindingBuilder<any>>();

	#bindings: Array<Binding<unknown>> = [];
	readonly #log: interfaces.LoggerFn;
	readonly #warn: interfaces.LoggerFn;
	readonly #singletonCache = new ResolutionCache();
	public readonly config: Readonly<interfaces.ContainerConfiguration>;

	public constructor(config?: Partial<interfaces.ContainerConfiguration>) {
		this.config = {
			defaultScope: 'transient',
			logLevel: 'debug',
			logger: { debug: noop, info: noop, trace: noop, warn: noop },
			...config,
		};
		this.#log = this.config.logger[this.config.logLevel].bind(this.config.logger);
		this.#warn = this.config.logger.warn.bind(this.config.logger);
	}

	/**
	 * Attempt to resolve a token using the currently executing request
	 *
	 * @remarks
	 *
	 * There is only a brief window where this is valid, while synchronously constructing a class. Because this relies on
	 * only synchronous processing there is no chance of a race condition in JavaScript despite this relying on some
	 * static shenanigans.
	 */
	public static resolvePropertyInjection<T>(token: Token<T>, resolutionPath: Array<Token<unknown>>): T {
		if (this.#currentRequest == null) {
			throw new InvalidOperationError(
				`Unable to resolve token as no container is currently making a request: ${token.identifier.toString()}`,
			);
		}

		return (this.#currentRequest.container as Container).resolve(token, this.#currentRequest, resolutionPath);
	}

	public resolve<T>(token: Token<T>, request: Request<unknown>, resolutionPath: Array<Token<unknown>>): T {
		if (!(token.identifier in request.stack)) {
			throw new TokenResolutionError(
				'Unable to find a value to inject',
				resolutionPath,
				new InvalidOperationError(`Token hasn't been created yet: ${token.identifier.toString()}`),
			);
		}
		const tokenStack = request.stack[token.identifier] as T[];
		const [value] = tokenStack.splice(0, 1);
		if (tokenStack.length === 0) {
			delete request.stack[token.identifier];
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return value!;
	}

	#validateBindings = (): void => {
		const values = [...this.#incompleteBindings.values()];
		if (values.length > 0) {
			throw new InvalidOperationError(
				`Some bindings were started but not completed: ${values.map((v) => v.token.identifier.toString()).join(', ')}`,
			);
		}
	};

	public bind = (<T>(id: interfaces.ServiceIdentifier<T>): interfaces.BindingBuilder<T> => {
		const binding = new ClassBindingBuilder(
			id as interfaces.ServiceIdentifier<object>,
			this.config,
			this.#warn,
			this.addBinding,
		) as unknown as BindingBuilder<T>;
		this.#incompleteBindings.add(binding);

		return binding;
	}) as interfaces.BindFunction;

	public unbind: interfaces.UnbindFunction = (id) => {
		const token = tokenForIdentifier(id);
		this.#singletonCache.flushToken(token);
		const bindings = this.#bindings.flatMap((b) => (b.token.identifier === token.identifier ? [token.identifier] : []));
		if (bindings.length === 0) {
			throw new Error(`Unable to unbind token because it is not bound: ${token.identifier.toString()}`);
		}

		this.#bindings = this.#bindings.filter((b) => !bindings.includes(b.token.identifier));
	};

	public rebind: interfaces.RebindFunction = (<T>(id: interfaces.ServiceIdentifier<T>) => {
		this.unbind(id);
		return this.bind(id);
	}) as interfaces.RebindFunction;

	public load = ((module): void | Promise<void> => {
		return module(this.bind, this.unbind, this.has, this.rebind);
	}) as interfaces.Container['load'];

	public createChild: interfaces.Container['createChild'] = (options) => {
		return new Container({ ...options, parent: this });
	};

	public addBinding = <T>(builder: BindingBuilder<T>, binding: Binding<T>): void => {
		this.#incompleteBindings.delete(builder);
		this.#bindings.push(binding as Binding<unknown>);
	};

	#resolveBinding =
		(request: Request<unknown>) =>
		<T>(binding: Binding<T>, resolutionPath: Array<Token<unknown>>): T | Promise<T> => {
			const getArgsForParameterInjections = (injections: Array<Injection<unknown>>): unknown[] =>
				injections
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers
					.sort((a, b) => ('index' in a && 'index' in b ? (a.index < b.index ? -1 : 1) : 0))
					.map((i) =>
						i.type === 'unmanagedConstructorParameter'
							? i.value.generator()
							: this.resolve(i.token, request, resolutionPath),
					);

			switch (binding.type) {
				case 'static':
					return binding.value;
				case 'dynamic': {
					const args = getArgsForParameterInjections(binding.injections);
					return binding.generator(...args);
				}
				case 'constructor': {
					const args = getArgsForParameterInjections(getConstructorParameterInjections(binding.ctr));

					Container.#currentRequest = request;
					try {
						return new binding.ctr(...args);
					} finally {
						Container.#currentRequest = undefined;
					}
				}
				default:
					return isNever(binding, 'Unknown binding found');
			}
		};

	public get = async <T>(
		id: interfaces.ServiceIdentifier<T>,
		options?: Partial<interfaces.InjectOptions>,
	): Promise<T> => {
		this.#validateBindings();
		const token = tokenForIdentifier(id);

		const request: Request<T> = {
			container: this,
			stack: {},
			singletonCache: this.#singletonCache,
			token,
		};
		const plan = calculatePlan<T>(
			this.#bindings,
			this.#resolveBinding(request),
			{
				type: 'request',
				options: {
					multiple: false,
					optional: false,
					...options,
				},
				token,
			},
			[],
			this.config.parent,
		);
		this.#log({ id, options, plan }, 'Processing request');

		return executePlan(plan, request);
	};

	public has: interfaces.IsBoundFunction = (id) => {
		const token = tokenForIdentifier(id);
		return this.#bindings.find((b) => b.token.identifier === token.identifier) != null;
	};
}
