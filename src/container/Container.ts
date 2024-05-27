import type * as interfaces from '../interfaces/index.js';
import type { Binding, ConstructorBinding } from '../models/Binding.js';
import { getConstructorParameterInjections, getInjections, getRegistry } from '../decorators/registry.js';
import type { Injection, RequestInjection } from '../models/Injection.js';
import { InvalidOperationError, TokenResolutionError } from '../Error.js';
import type { BindingBuilder } from './BindingBuilder.js';
import { calculatePlan } from '../planner/calculatePlan.js';
import { ClassBindingBuilder } from './BindingBuilder.js';
import { executePlan } from '../planner/executePlan.js';
import { isMetadataToken } from '../util/isToken.js';
import { isNever } from '../util/isNever.js';
import { noop } from '../util/noop.js';
import type { Request } from '../models/Request.js';
import { ResolutionCache } from './ResolutionCache.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';
import type { Token } from '../Token.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

export class Container implements interfaces.Container {
	static #currentRequest: Request<unknown> | undefined;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly #incompleteBindings = new Set<BindingBuilder<any, any>>();

	#bindings: Array<Binding<unknown, interfaces.MetadataObject>> = [];
	readonly #log: interfaces.LoggerFn;
	readonly #warn: interfaces.LoggerFn;
	readonly #singletonCache = new ResolutionCache();
	public readonly config: Readonly<interfaces.ContainerConfiguration>;

	public constructor(config?: Partial<interfaces.ContainerConfiguration>) {
		this.config = Object.freeze({
			autobindClasses: false,
			defaultScope: 'transient',
			logLevel: 'debug',
			logger: { debug: noop, info: noop, trace: noop, warn: noop },
			...config,
		});
		this.#log = this.config.logger[this.config.logLevel].bind(this.config.logger);
		this.#warn = this.config.logger.warn.bind(this.config.logger);
	}

	/**
	 * Attempt to resolve a token using the currently executing request
	 *
	 * @privateRemarks
	 *
	 * There is only a brief window where this is valid, while synchronously constructing a class. Because this relies on
	 * only synchronous processing there is no chance of a race condition in JavaScript despite this relying on some
	 * static shenanigans.
	 *
	 * See {@link Container##resolveBinding}
	 */
	public static resolvePropertyInjection<T>(token: Token<T>, resolutionPath: Array<Token<unknown>>): T {
		if (this.#currentRequest == null) {
			throw new InvalidOperationError(
				`Unable to resolve token as no container is currently making a request: ${stringifyIdentifier(token)}`,
			);
		}

		return (this.#currentRequest.container as Container).resolve(token, this.#currentRequest, resolutionPath);
	}

	public resolve<T>(token: Token<T>, request: Request<unknown>, resolutionPath: Array<Token<unknown>>): T {
		if (!(token.identifier in request.stack)) {
			throw new TokenResolutionError(
				'Unable to find a value to inject',
				resolutionPath,
				new InvalidOperationError(`Value for token hasn't been created yet: ${stringifyIdentifier(token)}`),
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

	readonly #ensureBindingsCompleted = (): void => {
		const values = [...this.#incompleteBindings.values()];
		if (values.length > 0) {
			throw new InvalidOperationError(
				`Some bindings were started but not completed: ${values.map((v) => v.token.identifier.toString()).join(', ')}`,
			);
		}
	};

	public bind = (<Id extends interfaces.ServiceIdentifier<unknown>>(
		id: Id,
	): interfaces.BindingBuilder<interfaces.InjectedType<Id>, interfaces.MetadataForIdentifier<Id>> => {
		const binding = new ClassBindingBuilder(
			id as interfaces.ServiceIdentifier<object>,
			this.config,
			this.#warn,
			this,
		) as unknown as BindingBuilder<interfaces.InjectedType<Id>, interfaces.MetadataForIdentifier<Id>>;
		this.#incompleteBindings.add(binding);

		return binding;
	}) as interfaces.BindFunction;

	public unbind: interfaces.UnbindFunction = (id) => {
		const token = tokenForIdentifier(id);
		this.#singletonCache.flushToken(token);
		const bindings = this.#bindings.flatMap((b) => (b.token.identifier === token.identifier ? [token.identifier] : []));
		if (bindings.length === 0 && !this.has(id)) {
			throw new Error(`Unable to unbind token because it is not bound: ${token.identifier.toString()}`);
		}

		this.#bindings = this.#bindings.filter((b) => !bindings.includes(b.token.identifier));
	};

	public rebind: interfaces.RebindFunction = (<T>(id: interfaces.ServiceIdentifier<T>) => {
		this.unbind(id);
		return this.bind(id);
	}) as interfaces.RebindFunction;

	public load: interfaces.Container['load'] = <M extends interfaces.ContainerModule>(module: M): ReturnType<M> =>
		module(this.bind, this.unbind, this.has, this.rebind) as ReturnType<typeof module>;

	public createChild: interfaces.Container['createChild'] = (options) => {
		return new Container({ ...this.config, ...options, parent: this });
	};

	public addBinding = <T, Metadata extends interfaces.MetadataObject>(
		builder: BindingBuilder<T, Metadata>,
		binding: Binding<T, Metadata>,
	): void => {
		this.#incompleteBindings.delete(builder);
		this.#bindings.push(binding as Binding<unknown, interfaces.MetadataObject>);
	};

	readonly #getBindings = <T, Metadata extends interfaces.MetadataObject>(
		{ id, options }: Injection<T, Metadata>,
	): Array<Binding<T, Metadata>> => {
		const metadataFilters = Object.entries(options.metadata);
		const token = tokenForIdentifier(id);
		const explicitBindings = (this.#bindings as Array<Binding<T, Metadata>>)
			.filter((b) => b.token.identifier === token.identifier)
			.filter((b) => {
				const hasRequestMetadata = metadataFilters.length > 0;
				const hasBindingMetadata = b.metadata != null;
				const transientMetadataFactory = b.type === 'factory' && b.scope === 'transient' && isMetadataToken(id);
				const filtersPassed = metadataFilters.map(([k, v]) => b.metadata?.[k] === v).reduce((acc, v) => acc && v, true);
				const matchesMetadataFilters = !transientMetadataFactory && filtersPassed;
				const validTransientMetadataFactory = transientMetadataFactory && (
					(hasBindingMetadata && hasRequestMetadata && filtersPassed)
					|| (!options.multiple && hasRequestMetadata && (!hasBindingMetadata || filtersPassed))
					|| (options.multiple && hasBindingMetadata && filtersPassed)
				);

				return validTransientMetadataFactory || matchesMetadataFilters;
			});

		if (explicitBindings.length > 0) {
			return explicitBindings;
		}

		if (
			this.config.autobindClasses
			&& metadataFilters.length === 0
			&& typeof id === 'function'
			&& !(this.config.parent?.has(id) ?? false)
		) {
			const binding = {
				type: 'constructor',
				ctr: id,
				id,
				token,
				scope: this.config.defaultScope,
				// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
				metadata: {} as Metadata,
			} satisfies ConstructorBinding<T, Metadata>;

			// Save this binding to make sure that caches work for future attempts to get this class.
			this.#bindings.push(binding);

			return [binding];
		}

		return [];
	};

	readonly #resolveBinding
		= (request: Request<unknown>) =>
		<T, Metadata extends interfaces.MetadataObject>(binding: Binding<T, Metadata>, injection: Injection<T, Metadata>, resolutionPath: Array<Token<unknown>>): T | Promise<T> => {
			const getArgsForParameterInjections = (injections: Array<Injection<unknown, interfaces.MetadataObject>>): unknown[] =>
				injections
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers
					.sort((a, b) => ('index' in a && 'index' in b ? (a.index < b.index ? -1 : 1) : 0))
					.map((i) =>
						i.type === 'unmanagedConstructorParameter'
							? i.value.generator()
							: this.resolve(tokenForIdentifier(i.id), request, resolutionPath),
					);

			switch (binding.type) {
				case 'static':
					return binding.value;
				case 'dynamic': {
					const args = getArgsForParameterInjections(binding.injections);
					return binding.generator(...args);
				}
				case 'factory': {
					const args = getArgsForParameterInjections(binding.injections);
					const ctx: interfaces.FactoryContext<Metadata> = {
						container: { config: this.config, createChild: this.createChild },
						metadata: {
							...binding.metadata,
							...injection.options.metadata,
						},
					};
					return binding.generator(ctx)(...args);
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

	public get: interfaces.Container['get'] = async <
		Id extends interfaces.ServiceIdentifier<unknown>,
		Options extends Partial<interfaces.InjectOptions<interfaces.MetadataForIdentifier<Id>>>,
	>(
		id: Id,
		options?: Options,
	): Promise<interfaces.InjectedType<[Id, Options]>> => {
		this.#ensureBindingsCompleted();

		/* eslint-disable @typescript-eslint/no-type-alias */
		type ReturnType = interfaces.InjectedType<[Id, Options]>;
		type Metadata = interfaces.MetadataForIdentifier<Id>;
		// Despite this being a reflective type, this isn't inferred properly by TypeScript currently.
		const idValid = id as interfaces.ServiceIdentifier<ReturnType>;
		/* eslint-enable @typescript-eslint/no-type-alias */

		const request: Request<ReturnType> = {
			container: this,
			stack: {},
			singletonCache: this.#singletonCache,
			id: idValid,
			token: tokenForIdentifier<ReturnType, Metadata>(idValid),
		};
		const plan = calculatePlan<ReturnType>(
			this.#getBindings,
			this.#resolveBinding(request),
			{
				type: 'request',
				options: {
					multiple: false,
					optional: false,
					metadata: {},
					...options,
				},
				id: idValid,
			} satisfies RequestInjection<ReturnType, Metadata>,
			[],
			this.config.parent,
		);
		this.#log({ id, options, plan }, 'Processing request');

		return executePlan(plan, request);
	};

	public has: interfaces.IsBoundFunction = (id) => {
		const token = tokenForIdentifier(id);
		const local = this.#bindings.find((b) => b.token.identifier === token.identifier) != null;
		return local || (this.config.parent?.has(id) ?? false) || (typeof id === 'function' && this.config.autobindClasses);
	};

	readonly #validateInjections = (
		binding: Binding<unknown, interfaces.MetadataObject>,
		injections: Array<Injection<unknown, interfaces.MetadataObject>>,
	): void => {
		for (const i of injections) {
			if (
				// Optional dependencies are always valid
				i.options.optional
				// Unmanaged injections are always valid since they contain the static value to use
				|| i.type === 'unmanagedConstructorParameter'
			) {
				continue;
			}

			if (!this.has(i.id)) {
				throw new InvalidOperationError(
					`Unbound dependency: ${stringifyIdentifier(binding.id)} => ${stringifyIdentifier(i.id)}`,
				);
			}
		}
	};

	public validate: interfaces.Container['validate'] = (validateAutobindings = true): void => {
		for (const binding of this.#bindings) {
			switch (binding.type) {
				case 'static':
					// These are always valid, the value is in the binding and has no dependencies
					continue;
				case 'dynamic':
				case 'factory': {
					this.#validateInjections(binding, binding.injections);
					continue;
				}
				case 'constructor': {
					this.#validateInjections(binding, getInjections(binding.ctr));
					continue;
				}
				default:
					return isNever(binding, 'Invalid binding');
			}
		}

		if (this.config.autobindClasses && validateAutobindings) {
			const registry = getRegistry();
			registry.forEach((injections, id) => {
				this.#validateInjections(
					{ type: 'constructor', id, ctr: id, scope: 'singleton', metadata: {}, token: tokenForIdentifier(id) },
					injections,
				);
			});
		}

		return this.config.parent?.validate(validateAutobindings);
	};
}
