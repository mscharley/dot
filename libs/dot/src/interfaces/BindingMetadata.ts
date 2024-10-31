/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Partial interface for building bindings which specify metadata
 *
 * @public
 */
export interface BindingMetadata<in out T, in out Metadata, out Builder> {
	withMetadata: (metadata: Metadata) => Omit<Builder, keyof BindingMetadata<T, Metadata, unknown>>;
}
