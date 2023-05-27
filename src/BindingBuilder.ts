import type { Binder } from './Binder';
import type { BindingScope } from './BindingScope';
import type { Container } from './Container';
import type { ScopeOptions } from './ScopeOptions';
import type { Token } from './Token';

export interface Context {
	container: Container;
}

export class BindingBuilder<T> implements Binder<T>, BindingScope<T> {
	readonly #container: Container;
	readonly #token: Token<T>;
	#scope: ScopeOptions;

	public constructor(container: Container, private readonly token: Token<T>) {
		this.#container = container;
		this.#token = token;
		this.#scope = container.config.defaultScope;
	}

	public to(fn: new () => T): void {
		this.#container.inject(this.#token, this.#scope, () => new fn());
	}

	public toConstantValue(v: T): void;
	public toConstantValue(v: Promise<T>): Promise<void>;
	public toConstantValue(v: T | Promise<T>): void | Promise<void> {
		if (v instanceof Promise) {
			return v.then((value) => this.#container.inject(this.#token, this.#scope, () => value));
		} else {
			return this.#container.inject(this.#token, this.#scope, () => v);
		}
	}

	public toDynamicValue(fn: (context: Context) => T): void {
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
