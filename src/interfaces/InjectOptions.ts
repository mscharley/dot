/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { MetadataObject } from './MetadataObject.js';

/**
 * Options that can be applied to an individual injection
 *
 * @public
 */
export interface InjectOptions<Metadata extends MetadataObject> {
	/**
	 * Inject this identifier if it is available, otherwise inject undefined
	 */
	optional: boolean;

	/**
	 * Inject this identifier, allowing for multiple values if there are many bindings
	 *
	 * @remarks
	 *
	 * This will always inject an array. If optional is also set to true then that array may be empty, otherwise it will
	 * always contain at least one value.
	 */
	multiple: boolean;

	/**
	 * Metadata to filter by for this injection
	 */
	metadata: Partial<Metadata>;
}
