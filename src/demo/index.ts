import { myContainer } from './ioc.config';
import { TYPES } from './types';

const ninja = myContainer.get(TYPES.Warrior);

console.log('fight', ninja.fight());
console.log('sneak', ninja.sneak());
