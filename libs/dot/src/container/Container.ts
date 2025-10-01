/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import type { Binding, ConstructorBinding } from '../models/Binding.js';
import type { Injection, RequestInjection } from '../models/Injection.js';
import { InvalidOperationError, TokenResolutionError } from '../Error.js';
import type { BindingBuilder } from './BindingBuilder.js';
import { calculatePlan } from '../planner/calculatePlan.js';
import { ClassBindingBuilder } from './BindingBuilder.js';
import { Context } from './Context.js';
import { executePlan } from '../planner/executePlan.js';
import { isMetadataToken } from '../util/isToken.js';
import { isNever } from '../util/isNever.js';
import { isNotNullOrUndefined } from '../util/isNotNullOrUndefined.js';
import { noop } from '../util/noop.js';
import type { Request } from '../models/Request.js';
import { ResolutionCache } from './ResolutionCache.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';
import type { Token } from '../Token.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

export const autoboundContainerModule: interfaces.ContainerModule = () => {};

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
			contexts: [],
			defaultScope: 'transient',
			excludeGlobalContext: false,
			logLevel: 'debug',
			logger: { debug: noop, info: noop, trace: noop, warn: noop },
			...config,
		});
		this.#log = this.config.logger[this.config.logLevel].bind(this.config.logger);
		this.#warn = this.config.logger.warn.bind(this.config.logger);
	}

	private get contexts(): Context[] {
		if (this.config.excludeGlobalContext) {
			return this.config.contexts as Context[];
		} else {
			return [Context.global, ...(this.config.contexts as Context[])];
		}
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

	readonly #bind = (module: interfaces.ContainerModule): interfaces.BindFunction => (
		<Id extends interfaces.ServiceIdentifier<unknown>>(
			id: Id,
		): interfaces.BindingBuilder<interfaces.InjectedType<Id>, interfaces.MetadataForIdentifier<Id>> => {
			const binding = new ClassBindingBuilder(
				id as interfaces.ServiceIdentifier<object>,
				this.config,
				this.#warn,
				module,
				this,
			) as unknown as BindingBuilder<interfaces.InjectedType<Id>, interfaces.MetadataForIdentifier<Id>>;
			this.#incompleteBindings.add(binding);

			return binding;
		}
	) as interfaces.BindFunction;

	public readonly unbind: interfaces.UnbindFunction = (id) => {
		const token = tokenForIdentifier(id);
		const bindings
			= this.#bindings.flatMap((b) => (b.token.identifier === token.identifier ? [token.identifier] : []));
		if (bindings.length === 0 && !this.has(id)) {
			throw new Error(`Unable to unbind token because it is not bound: ${token.identifier.toString()}`);
		}

		this.#bindings = this.#bindings.filter((b) => !bindings.includes(b.token.identifier));
	};

	readonly #rebind = (module: interfaces.ContainerModule): interfaces.RebindFunction => (
		<T>(id: interfaces.ServiceIdentifier<T>) => {
			this.unbind(id);
			return this.#bind(module)(id);
		}
	) as interfaces.RebindFunction;

	public readonly load: interfaces.Container['load'] = <M extends interfaces.ContainerModule>(module: M): ReturnType<M> =>
		module(this.#bind(module), this.unbind, this.has, this.#rebind(module)) as ReturnType<typeof module>;

	public readonly createChild: interfaces.Container['createChild'] = (options) => {
		return new Container({ ...this.config, ...options, parent: this });
	};

	public readonly getInjectionMetadata: interfaces.Container['getInjectionMetadata'] = (services) => {
		this.#ensureBindingsCompleted();
		const defaultOptions: interfaces.InjectOptions<interfaces.MetadataObject> = {
			multiple: false,
			optional: false,
			metadata: {},
		};

		const plan = services.flatMap((id) => {
			const request: Request<unknown> = {
				container: this,
				stack: {},
				singletonCache: this.#singletonCache,
				id,
				token: tokenForIdentifier<unknown, interfaces.MetadataObject>(id),
			};
			return calculatePlan<unknown>(
				this.#getBindings,
				this.#resolveBinding(request),
				{
					type: 'request',
					options: defaultOptions,
					id,
				} satisfies RequestInjection<unknown, interfaces.MetadataObject>,
				[],
				this.config.parent,
			);
		});

		const entries = plan.flatMap((step): Array<[string, interfaces.ContainerModuleMeta]> => {
			switch (step.type) {
				case 'createClass':
					if (step.binding == null) {
						return [];
					} else {
						const meta = (step.binding.module as unknown as Record<symbol, undefined | interfaces.ContainerModuleMeta>)[Symbol.for('__dot_import_stats')];
						if (meta == null) {
							throw new Error('It appears you haven\'t used the custom loader.');
						}
						return [[`${meta.name}::${meta.url}`, meta]];
					}
				case 'fetchFromCache':
					return [];
				case 'aggregateMultiple':
					return [];
				case 'requestFromParent':
					return step.parent.getInjectionMetadata([step.token]).dependencies.map((m) => [`${m.name}::${m.url}`, m]);

				/* c8 ignore next */
				default: return isNever(step, 'Invalid step in plan');
			}
		});

		const injections = services
			.map((d): undefined | interfaces.ContainerModuleMeta => (d as unknown as Record<symbol, undefined | interfaces.ContainerModuleMeta>)[Symbol.for('__dot_import_stats')])
			.filter(isNotNullOrUndefined);
		if (injections.length !== services.length) {
			throw new Error('Unable to load metadata for some of your requested injections.');
		}

		return {
			injections,
			dependencies: Object.values(Object.fromEntries(entries)),
		};
	};

	public readonly addBinding = <T, Metadata extends interfaces.MetadataObject>(
		builder: BindingBuilder<T, Metadata>,
		binding: Binding<T, Metadata>,
	): void => {
		this.#incompleteBindings.delete(builder);
		this.#bindings.push(binding as Binding<unknown, interfaces.MetadataObject>);
	};

	readonly #generateAutoBinding = <T, Metadata extends interfaces.MetadataObject>(
		context: Context,
		ctr: interfaces.Constructor<T>,
		token: Token<T>,
	): ConstructorBinding<T, Metadata> => ({
		type: 'constructor',
		ctr,
		context,
		id: ctr,
		token,
		scope: this.config.defaultScope,
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		metadata: {} as Metadata,
		module: autoboundContainerModule,
	});

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
				const filtersPassed
					= metadataFilters.map(([k, v]) => b.metadata?.[k] === v).reduce((acc, v) => acc && v, true);
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
			for (const c of this.contexts) {
				if (!c.has(id)) {
					continue;
				}

				const binding = this.#generateAutoBinding<T, Metadata>(c, id, token);

				// Save this binding to make sure that caches work for future attempts to get this class.
				this.#bindings.push(binding);

				return [binding];
			}
		}

		return [];
	};

	readonly #resolveBinding = (request: Request<unknown>) =>
		<T, Metadata extends interfaces.MetadataObject>(
			binding: Binding<T, Metadata>,
			injection: Injection<T, Metadata>,
			resolutionPath: Array<Token<unknown>>,
		): T | Promise<T> => {
			const getArgsForParameterInjections
				= (injections: Array<Injection<unknown, interfaces.MetadataObject>>): unknown[] =>
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
					const args
						= getArgsForParameterInjections(binding.context.getConstructorParameterInjections(binding.ctr));

					Container.#currentRequest = request;
					try {
						return new binding.ctr(...args);
					} finally {
						Container.#currentRequest = undefined;
					}
				}

				/* c8 ignore next 2 */
				default:
					return isNever(binding, 'Unknown binding found');
			}
		};

	public readonly get: interfaces.Container['get'] = async <
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

	public readonly has: interfaces.IsBoundFunction = (id) => {
		const token = tokenForIdentifier(id);
		const local = this.#bindings.find((b) => b.token.identifier === token.identifier) != null;
		const inParent = (this.config.parent?.has(id) ?? false);
		const canAutobind = typeof id === 'function' && this.config.autobindClasses && this.contexts.find((c) => c.has(id)) != null;
		return local || inParent || canAutobind;
	};

	readonly #validateInjections = (
		binding: Binding<unknown, interfaces.MetadataObject>,
		injections: Array<Injection<unknown, interfaces.MetadataObject>>,
		context?: Context,
	): Error[] => {
		return injections.flatMap((i) => {
			if (
				// Optional dependencies are always valid
				i.options.optional
				// Unmanaged injections are always valid since they contain the static value to use
				|| i.type === 'unmanagedConstructorParameter'
			) {
				return [];
			}

			if (!this.has(i.id)) {
				if (context != null) {
					return [new InvalidOperationError(
						`Unbound dependency (context: ${context.toString()}): ${stringifyIdentifier(binding.id)} => ${stringifyIdentifier(i.id)}`,
					)];
				} else {
					const bindingNote = binding.module === autoboundContainerModule ? '(autobound)' : binding.module.name === '' ? `(bound in anonymous module)` : `(bound in ${binding.module.name})`;
					return [new InvalidOperationError(
						`Unbound dependency ${bindingNote}: ${stringifyIdentifier(binding.id)} => ${stringifyIdentifier(i.id)}`,
					)];
				}
			}

			return [];
		});
	};

	public readonly validate: interfaces.Container['validate'] = (validateAutobindings = true): void => {
		const errors: Error[] = [];

		for (const binding of this.#bindings) {
			switch (binding.type) {
				case 'static':
					// These are always valid, the value is in the binding and has no dependencies
					continue;
				case 'dynamic':
				case 'factory': {
					errors.push(...this.#validateInjections(binding, binding.injections));
					continue;
				}
				case 'constructor': {
					errors.push(...this.#validateInjections(binding, Context.all.getInjections(binding.ctr)));
					continue;
				}

				/* c8 ignore next 2 */
				default:
					return isNever(binding, 'Invalid binding');
			}
		}

		if (this.config.autobindClasses && validateAutobindings) {
			for (const context of this.contexts) {
				context.registry.forEach((injections, id) => {
					errors.push(...this.#validateInjections(
						this.#generateAutoBinding(context, id, tokenForIdentifier(id)),
						injections,
						context,
					));
				});
			}
		}

		if (errors.length > 0) {
			throw new AggregateError(errors);
		}

		this.config.parent?.validate(validateAutobindings);
		return undefined;
	};
}
