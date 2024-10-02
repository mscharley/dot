/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { BindFunction, IsBoundFunction, RebindFunction, UnbindFunction } from './Functions.js';

/**
 * Metadata about where an object was loaded from
 *
 * @remarks
 *
 * This is still an evolving API. It also requires the code to be loaded with the `@mscharley/dot/loader` custom ESM loader under NodeJS.
 *
 * @beta
 */
export interface ContainerModuleMeta {
	name: string;
	url: string;
}

/**
 * Loadable module which contains asynchronous bindings
 *
 * @public
 */
export type AsyncContainerModule = (
	bind: BindFunction,
	unbind: UnbindFunction,
	isBound: IsBoundFunction,
	rebind: RebindFunction,
) => Promise<void>;

/**
 * Loadable module which contains synchronous bindings
 *
 * @public
 */
export type SyncContainerModule = (
	bind: BindFunction,
	unbind: UnbindFunction,
	isBound: IsBoundFunction,
	rebind: RebindFunction,
) => void;

/**
 * A generic module which contains bindings for a container
 *
 * @public
 */
export type ContainerModule = AsyncContainerModule | SyncContainerModule;
