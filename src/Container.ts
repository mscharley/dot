import { BindingBuilder } from './BindingBuilder';
import type { interfaces } from '.';
import type { ScopeOptions } from './interfaces/ScopeOptions';
import type { Token } from './Token';

export class Container implements interfaces.Container {
	readonly #bindings: Record<
		symbol,
		{
			scope: ScopeOptions;
			generator: () => unknown;
		}
	> = {};
	static #currentRequest: Container | undefined;
	public readonly config: interfaces.ContainerConfiguration;
	readonly #singletonCache: Record<symbol, unknown> = {};

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
		return this.#currentRequest.get(token);
	}

	public bind<T>(token: Token<T>): interfaces.Binder<T> & interfaces.BindingScope<T> {
		return new BindingBuilder(this, token);
	}

	public inject<T>(token: Token<T>, scope: ScopeOptions, fn: () => T): void {
		this.#bindings[token.identifier] = {
			scope,
			generator: fn,
		};
	}

	private _resolve<T>(token: Token<T>): T {
		const binding = this.#bindings[token.identifier];
		if (binding == null) {
			throw new Error(`Unable to resolve token as no bindings exist: ${token.identifier.toString()}`);
		}
		const value = binding.generator() as T;
		if (binding.scope === 'singleton') {
			this.#singletonCache[token.identifier] = value;
		}

		return value;
	}

	public get<T>(token: Token<T>): T {
		if (this.#singletonCache[token.identifier] != null) {
			return this.#singletonCache[token.identifier] as T;
		}

		const lastRequest = Container.#currentRequest;
		Container.#currentRequest = this;
		const value = this._resolve(token);
		Container.#currentRequest = lastRequest;

		return value;
	}

	public has(token: Token<unknown>): boolean {
		return token.identifier in this.#bindings;
	}
}
