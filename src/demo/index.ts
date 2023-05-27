import { myContainer } from './ioc.config';
import { TYPES } from './types';

const ninja = myContainer.get(TYPES.Warrior);

console.log('fight', ninja.fight());
console.log('sneak', ninja.sneak());

const ninja2 = myContainer.get(TYPES.Warrior);

console.log('ninja == ninja2:', ninja === ninja2);
