/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// @ts-ignore
const dotCjs = require('../../dot.cjs') as typeof import('../index.js');
// @ts-ignore
const dotEsm = (await import('../../dot.js')) as typeof import('../index.js');

const context = dotEsm.createContext('esm/cjs test');

@dotCjs.injectable()
@dotCjs.inContext(context)
class A {}

@dotEsm.injectable()
@dotEsm.inContext(context)
class B {}

const container = dotEsm.createContainer();
container.bind(A).toSelf();
container.bind(B).toSelf();
container.validate();
