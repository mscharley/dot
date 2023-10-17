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
