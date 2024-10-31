/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import type { Binding } from '../models/Binding.js';
import { Mutex } from 'async-mutex';
import type { MutexInterface } from 'async-mutex';
import type { Token } from '../Token.js';

export class ResolutionCache {
	readonly #mutexes = new Map<Binding<unknown, interfaces.MetadataObject>, Mutex>();
	readonly #cache = new Map<Binding<unknown, interfaces.MetadataObject>, unknown>();

	public readonly lock = async (key: Binding<unknown, interfaces.MetadataObject>): Promise<MutexInterface.Releaser> => {
		const mutex = this.#mutexes.get(key) ?? new Mutex();
		this.#mutexes.set(key, mutex);
		return mutex.acquire();
	};

	public readonly get = this.#cache.get.bind(this.#cache) as <T>(binding: Binding<T, interfaces.MetadataObject>) => T;
	public readonly set = this.#cache.set.bind(this.#cache) as <T>(binding: Binding<T, interfaces.MetadataObject>, value: T) => void;
	public readonly has = this.#cache.has.bind(this.#cache) as <T>(binding: Binding<T, interfaces.MetadataObject>) => boolean;
	public readonly delete = this.#cache.delete.bind(this.#cache) as <T>(binding: Binding<T, interfaces.MetadataObject>) => boolean;

	public readonly flushToken = <T>(token: Token<T>): void => {
		const keys = [...this.#cache.keys()];
		for (const key of keys) {
			if (key.token.identifier === token.identifier) {
				this.#mutexes.delete(key);
				this.#cache.delete(key);
			}
		}
	};
}
