import type * as interfaces from './interfaces';
import { BindingBuilder } from './BindingBuilder';
import type { ScopeOptions } from './interfaces/ScopeOptions';
import type { Token } from './Token';

interface Binding {
	scope: ScopeOptions;
	generator: () => unknown;
}

export class Container implements interfaces.Container {
	static #currentRequest: Container | undefined;

	public static get isProcessingRequest(): boolean {
		return this.#currentRequest != null;
	}

	readonly #bindings: Record<symbol, Binding> = {};
	readonly #singletonCache: Record<symbol, unknown> = {};
	#requestCache: Record<symbol, unknown> = {};
	public readonly config: Readonly<interfaces.ContainerConfiguration>;

	public constructor(config?: Partial<interfaces.ContainerConfiguration>) {
		this.config = {
			...config,
			defaultScope: 'transient',
		};
	}

	public static resolve<T>(token: Token<T>): T {
		if (this.#currentRequest == null) {
			throw new Error(
				`Unable to resolve token as no container is currently making a request: ${token.identifier.toString()}`,
			);
		}
		return this.#currentRequest._resolve(token);
	}

	public bind: interfaces.BindFunction = <T>(token: Token<T>): interfaces.BindingBuilder<T> => {
		return new BindingBuilder(this, token);
	};

	public unbind: interfaces.UnbindFunction = (token: Token<unknown>): void => {
		if (this.#bindings[token.identifier] == null) {
			throw new Error(`Unable to unbind token because it is not bound: ${token.identifier.toString()}`);
		}

		delete this.#bindings[token.identifier];
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

	public addBinding<T>(token: Token<T>, scope: ScopeOptions, fn: () => T): void {
		this.#bindings[token.identifier] = {
			scope,
			generator: fn,
		};
	}

	private _resolve<T>(token: Token<T>): T {
		if (this.#singletonCache[token.identifier] != null) {
			return this.#singletonCache[token.identifier] as T;
		} else if (this.#requestCache[token.identifier] != null) {
			return this.#requestCache[token.identifier] as T;
		}

		const binding = this.#bindings[token.identifier];
		if (binding == null) {
			throw new Error(`Unable to resolve token as no bindings exist: ${token.identifier.toString()}`);
		}
		const value = binding.generator() as T;
		switch (binding.scope) {
			case 'singleton':
				this.#singletonCache[token.identifier] = value;
				break;
			case 'request':
				this.#requestCache[token.identifier] = value;
				break;
			case 'transient':
				break;
			default:
				throw new Error(`Invalid scope for binding: ${binding.scope}`);
		}

		return value;
	}

	public get<T>(token: Token<T>): T {
		BindingBuilder.validateBindings(this);
		this.#requestCache = {};

		const lastRequest = Container.#currentRequest;
		try {
			Container.#currentRequest = this;
			return this._resolve(token);
		} finally {
			Container.#currentRequest = lastRequest;
		}
	}

	public has: interfaces.IsBoundFunction = (token) => {
		return token.identifier in this.#bindings;
	};
}
