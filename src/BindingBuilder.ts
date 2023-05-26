import type { Container } from './Container';
import type { Token } from './Token';

export class BindingBuilder<T> {
	readonly #container: Container;
	readonly #token: Token<T>;

	public constructor(container: Container, private readonly token: Token<T>) {
		this.#container = container;
		this.#token = token;
	}

	public toSelf(fn: new () => T): void {
		this.#container.inject(this.#token, () => new fn());
	}

	public toConstantValue(v: T): void;
	public toConstantValue(v: Promise<T>): Promise<void>;
	public toConstantValue(v: T | Promise<T>): void | Promise<void> {
		if (v instanceof Promise) {
			return v.then((value) => this.#container.inject(this.#token, () => value));
		} else {
			return this.#container.inject(this.#token, () => v);
		}
	}

	public toDynamicValue(fn: () => T): void {
		this.#container.inject(this.#token, fn);
	}
}
