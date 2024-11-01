/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Container } from './Container.js';
import type { MetadataObject } from './MetadataObject.js';

/**
 * Extra context passed to factory bindings
 *
 * @public
 */
export interface FactoryContext<Metadata extends MetadataObject> {
	/**
	 * A partial container which can only be used for a few read-only operations
	 */
	container: Pick<Container, 'createChild' | 'config'>;

	/**
	 * The metadata provided with the get request
	 */
	metadata: Partial<Metadata>;
}
