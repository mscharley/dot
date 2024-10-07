/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// @ts-ignore
const dotCjs = require('../../dot.cjs') as typeof import('../index.js');
// @ts-ignore
const dotEsm = (await import('../../dot.js')) as typeof import('../index.js');

@dotCjs.injectable()
class A {}

@dotEsm.injectable()
class B {}

const container = dotEsm.createContainer();
container.bind(A).toSelf();
container.bind(B).toSelf();
container.validate();
