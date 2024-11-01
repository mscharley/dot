/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Container } from './Container.js';
import type { ContainerConfiguration } from './ContainerConfiguration.js';

/**
 * Shared type used for functions which create new containers
 *
 * @public
 */
export type ContainerFactory = (options?: Partial<ContainerConfiguration>) => Container;
