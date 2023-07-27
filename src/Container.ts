import type * as interfaces from './interfaces/index.js';
import type { Binding } from './models/Binding.js';
import type { BindingBuilder } from './BindingBuilder.js';
import { calculatePlan } from './planner/calculatePlan.js';
import { ClassBindingBuilder } from './BindingBuilder.js';
import { executePlan } from './planner/executePlan.js';
import { getConstructorParameterInjections } from './decorators/registry.js';
import { isNever } from './util/isNever.js';
import { noop } from './util/noop.js';
import type { Request } from './models/Request.js';
import type { Token } from './Token.js';
import { tokenForIdentifier } from './util/tokenForIdentifier.js';

export class Container implements interfaces.Container {
	static #currentRequest: Request<unknown> | undefined;

	public static get isProcessingRequest(): boolean {
		return this.#currentRequest != null;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly #incompleteBindings = new Set<BindingBuilder<any>>();

	#bindings: Array<Binding<unknown>> = [];
	readonly #log: interfaces.Logger[interfaces.LoggerLevel];
	readonly #singletonCache: Record<symbol, unknown> = {};
	public readonly config: Readonly<interfaces.ContainerConfiguration>;

	public constructor(config?: Partial<interfaces.ContainerConfiguration>) {
		this.config = {
			defaultScope: 'transient',
			logLevel: 'debug',
			logger: { info: noop, debug: noop, trace: noop },
			...config,
		};
		this.#log = this.config.logger[this.config.logLevel];
	}

	public static resolve<T>(token: Token<T>): T {
		if (this.#currentRequest == null) {
			throw new Error(
				`Unable to resolve token as no container is currently making a request: ${token.identifier.toString()}`,
			);
		}

		if (!(token.identifier in this.#currentRequest.stack)) {
			throw new Error(`Token hasn't been created yet: ${token.identifier.toString()}`);
		}
		const tokenStack = this.#currentRequest.stack[token.identifier] as T[];
		const [value] = tokenStack.splice(0, 1);
		if (tokenStack.length === 0) {
			delete this.#currentRequest.stack[token.identifier];
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return value!;
	}

	#validateBindings = (): void => {
		const values = [...this.#incompleteBindings.values()];
		if (values.length > 0) {
			throw new Error(
				`Some bindings were started but not completed: ${values.map((v) => v.token.identifier.toString()).join(', ')}`,
			);
		}
	};

	public bind = (<T>(id: interfaces.ServiceIdentifier<T>): interfaces.BindingBuilder<T> => {
		const binding = new ClassBindingBuilder(
			id as interfaces.ServiceIdentifier<object>,
			this.config,
			this.addBinding,
		) as unknown as BindingBuilder<T>;
		this.#incompleteBindings.add(binding);

		return binding;
	}) as interfaces.BindFunction;

	public unbind: interfaces.UnbindFunction = (id) => {
		const token = tokenForIdentifier(id);
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

	#resolveBinding = <T>(binding: Binding<T>): T | Promise<T> => {
		switch (binding.type) {
			case 'static':
				return binding.value;
			case 'dynamic':
				return binding.generator({ container: this, id: binding.id });
			case 'constructor': {
				const args = getConstructorParameterInjections(binding.ctr)
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers
					.sort((a, b) => (a.index < b.index ? -1 : 1))
					.map(({ token }) => Container.resolve(token));

				return new binding.ctr(...args);
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

		const plan = calculatePlan<T>(
			this.#bindings,
			this.#resolveBinding,
			{
				type: 'request',
				options: {
					multiple: false,
					optional: false,
					...options,
				},
				token,
			},
			this.config.parent,
		);
		this.#log({ id, options, plan }, 'Processing request');
		const request: Request<T> = {
			stack: {},
			singletonCache: this.#singletonCache,
			token,
		};

		const lastRequest = Container.#currentRequest;
		try {
			Container.#currentRequest = request;
			return await executePlan(plan, request);
		} finally {
			// eslint-disable-next-line require-atomic-updates
			Container.#currentRequest = lastRequest;
		}
	};

	public has: interfaces.IsBoundFunction = (id) => {
		const token = tokenForIdentifier(id);
		return this.#bindings.find((b) => b.token.identifier === token.identifier) != null;
	};
}
