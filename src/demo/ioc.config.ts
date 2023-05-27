import { Katana, Ninja, Shuriken } from './entities';
import type { ThrowableWeapon, Warrior, Weapon } from './interfaces';
import { createContainer } from '..';
import { TYPES } from './types';

const myContainer = createContainer();
myContainer.bind<Warrior>(TYPES.Warrior).inSingletonScope().to(Ninja);
myContainer.bind<Weapon>(TYPES.Weapon).to(Katana);
myContainer.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);

export { myContainer };
