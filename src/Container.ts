import { BindingBuilder } from './BindingBuilder';
import type { Token } from './Token';

export class Container {
	readonly #klasses: Record<symbol, () => unknown> = {};
	static #currentRequest: Container | undefined;

	public static resolve<T>(token: Token<T>): T {
		if (this.#currentRequest == null) {
			throw new Error(
				`Unable to resolve token as no container is currently making a request: ${token.identifier.toString()}`,
			);
		}
		return this.#currentRequest.get(token);
	}

	public bind<T>(token: Token<T>): BindingBuilder<T> {
		return new BindingBuilder(this, token);
	}

	/** @internal */
	public inject<T>(token: Token<T>, fn: () => T): void {
		this.#klasses[token.identifier] = fn;
	}

	public get<T>(token: Token<T>): T {
		const lastRequest = Container.#currentRequest;
		Container.#currentRequest = this;
		const value = this.#klasses[token.identifier]() as T;
		Container.#currentRequest = lastRequest;

		return value;
	}

	public has(token: Token<unknown>): boolean {
		return token.identifier in this.#klasses;
	}
}
