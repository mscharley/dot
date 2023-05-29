import type * as interfaces from './interfaces';
import type { Container } from './Container';
import type { Token } from './Token';

export class BindingBuilder<T> implements interfaces.BindingBuilder<T> {
	readonly #container: Container;
	readonly #token: Token<T>;
	#scope: interfaces.ScopeOptions;
	static readonly #registry = new Set<BindingBuilder<unknown>>();

	public constructor(container: Container, private readonly token: Token<T>) {
		this.#container = container;
		this.#token = token;
		this.#scope = container.config.defaultScope;
		BindingBuilder.#registry.add(this);
	}

	public static validateBindings(container: Container): void {
		const invalidBindings = [...BindingBuilder.#registry.values()].filter((v) => v.#container === container);

		if (invalidBindings.length > 0) {
			throw new Error(
				`Some bindings were started but not completed: ${invalidBindings
					.map((v) => v.#token.identifier.toString())
					.join(', ')}`,
			);
		}
	}

	public to(fn: new () => T): void {
		BindingBuilder.#registry.delete(this);
		this.#container.inject(this.#token, this.#scope, () => new fn());
	}

	public toConstantValue(v: T): void;
	public toConstantValue(v: Promise<T>): Promise<void>;
	public toConstantValue(v: T | Promise<T>): void | Promise<void> {
		BindingBuilder.#registry.delete(this);
		if (v instanceof Promise) {
			return v.then((value) => this.#container.inject(this.#token, this.#scope, () => value));
		} else {
			return this.#container.inject(this.#token, this.#scope, () => v);
		}
	}

	public toDynamicValue(fn: (context: interfaces.BindingContext) => T): void {
		BindingBuilder.#registry.delete(this);
		this.#container.inject(this.#token, this.#scope, () => fn({ container: this.#container }));
	}

	public inSingletonScope(): this {
		this.#scope = 'singleton';
		return this;
	}

	public inTransientScope(): this {
		this.#scope = 'transient';
		return this;
	}

	public inRequestScope(): this {
		this.#scope = 'request';
		return this;
	}
}
