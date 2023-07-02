import type * as interfaces from './interfaces/index.js';
import type { Binding } from './models/Binding.js';
import { BindingBuilder } from './BindingBuilder.js';
import { isNever } from './util/isNever.js';
import type { Token } from './Token.js';

export class Container implements interfaces.Container {
	static #currentRequest: Container | undefined;

	public static get isProcessingRequest(): boolean {
		return this.#currentRequest != null;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly #incompleteBindings = new Set<BindingBuilder<any>>();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	#bindings: Array<Binding<any>> = [];
	readonly #singletonCache: Record<symbol, unknown> = {};
	#requestCache: Record<symbol, unknown> = {};
	public readonly config: Readonly<interfaces.ContainerConfiguration>;

	public constructor(config?: Partial<interfaces.ContainerConfiguration>) {
		this.config = {
			defaultScope: 'transient',
			...config,
		};
	}

	public static resolve<T>(token: Token<T>, options: interfaces.InjectOptions): T {
		if (this.#currentRequest == null) {
			throw new Error(
				`Unable to resolve token as no container is currently making a request: ${token.identifier.toString()}`,
			);
		}
		return this.#currentRequest.#resolve(token, options);
	}

	#validateBindings = (): void => {
		const values = [...this.#incompleteBindings.values()];
		if (values.length > 0) {
			throw new Error(
				`Some bindings were started but not completed: ${values.map((v) => v.token.identifier.toString()).join(', ')}`,
			);
		}
	};

	public bind: interfaces.BindFunction = <T>(token: Token<T>): interfaces.BindingBuilder<T> => {
		const binding = new BindingBuilder(token, this.config, this.addBinding);
		this.#incompleteBindings.add(binding);

		return binding;
	};

	public unbind: interfaces.UnbindFunction = (token: Token<unknown>): void => {
		const bindings = this.#bindings.flatMap((b) => (b.token.identifier === token.identifier ? [token.identifier] : []));
		if (bindings.length === 0) {
			throw new Error(`Unable to unbind token because it is not bound: ${token.identifier.toString()}`);
		}

		this.#bindings = this.#bindings.filter((b) => !bindings.includes(b.token.identifier));
	};

	public rebind: interfaces.RebindFunction = <T>(token: Token<T>): interfaces.BindingBuilder<T> => {
		this.unbind(token);
		return this.bind(token);
	};

	public load(module: interfaces.AsyncContainerModule): Promise<void>;
	public load(module: interfaces.SyncContainerModule): void;
	// eslint-disable-next-line @typescript-eslint/promise-function-async
	public load(module: interfaces.ContainerModule): void | Promise<void> {
		return module(this.bind, this.unbind, this.has, this.rebind);
	}

	public addBinding = <T>(builder: BindingBuilder<T>, binding: Binding<T>): void => {
		this.#incompleteBindings.delete(builder);
		this.#bindings.push(binding);
	};

	#resolve = <T>(token: Token<T>, options: interfaces.InjectOptions): T => {
		if (this.#singletonCache[token.identifier] != null) {
			return this.#singletonCache[token.identifier] as T;
		} else if (this.#requestCache[token.identifier] != null) {
			return this.#requestCache[token.identifier] as T;
		}

		const bindings = this.#bindings.filter((b): b is Binding<T> => b.token.identifier === token.identifier);

		if (bindings.length > 1) {
			throw new Error(`Multiple bindings exist for token: ${token.identifier.toString()}`);
		}

		const binding = bindings[0];
		if (binding == null) {
			if (options.optional) {
				return undefined as T;
			} else {
				throw new Error(`Unable to resolve token as no bindings exist: ${token.identifier.toString()}`);
			}
		}

		const value = this.#resolveBinding(binding) as T;
		this.#cacheBinding(binding, value);

		return value;
	};

	#cacheBinding = <T>({ scope, token }: Binding<T>, value: T): void => {
		switch (scope) {
			case 'singleton':
				this.#singletonCache[token.identifier] = value;
				break;
			case 'request':
				this.#requestCache[token.identifier] = value;
				break;
			case 'transient':
				break;
			default:
				isNever(scope, 'Invalid scope for binding');
		}
	};

	#resolveBinding = <T>(binding: Binding<T>): T | Promise<T> => {
		switch (binding.type) {
			case 'static':
				return binding.value;
			case 'dynamic':
				return binding.generator({ container: this, token: binding.token });
			case 'constructor':
				return new binding.ctr();
			default:
				return isNever(binding, 'Unknown binding found');
		}
	};

	// eslint-disable-next-line @typescript-eslint/require-await
	public get = async <T>(token: Token<T>): Promise<T> => {
		this.#validateBindings();
		this.#requestCache = {};

		const lastRequest = Container.#currentRequest;
		try {
			Container.#currentRequest = this;
			return this.#resolve(token, { optional: false });
		} finally {
			Container.#currentRequest = lastRequest;
		}
	};

	public has: interfaces.IsBoundFunction = (token) => {
		return this.#bindings.find((b) => b.token.identifier === token.identifier) != null;
	};
}
