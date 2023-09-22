import type { Binding } from '../models/Binding.js';
import type { Token } from '../Token.js';

export class ResolutionCache {
	readonly #cache = new Map<Binding<unknown>, unknown>();

	public readonly get = this.#cache.get.bind(this.#cache) as <T>(binding: Binding<T>) => T;
	public readonly set = this.#cache.set.bind(this.#cache) as <T>(binding: Binding<T>, value: T) => void;
	public readonly has = this.#cache.has.bind(this.#cache) as <T>(binding: Binding<T>) => boolean;
	public readonly delete = this.#cache.delete.bind(this.#cache) as <T>(binding: Binding<T>) => boolean;

	public readonly flushToken = <T>(token: Token<T>): void => {
		const keys = [...this.#cache.keys()];
		for (const key of keys) {
			if (key.token.identifier === token.identifier) {
				this.#cache.delete(key);
			}
		}
	};
}
