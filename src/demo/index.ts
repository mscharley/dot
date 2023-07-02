// Only necessary for typescript experimental decorators
import 'reflect-metadata';

import { myContainer } from './ioc.config.js';
import { TYPES } from './types.js';

console.log('Fetching...');
const ninja = await myContainer.get(TYPES.Warrior);

console.log('fight', ninja.fight());
console.log('sneak', ninja.sneak());

const ninja2 = await myContainer.get(TYPES.Warrior);

console.log('ninja === ninja2:', ninja === ninja2);
