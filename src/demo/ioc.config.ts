import { Katana, Ninja, Shuriken } from './entities';
import type { ThrowableWeapon, Warrior, Weapon } from './interfaces';
import { Container } from '..';
import { TYPES } from './types';

const myContainer = new Container();
myContainer.bind<Warrior>(TYPES.Warrior).inSingletonScope().to(Ninja);
myContainer.bind<Weapon>(TYPES.Weapon).to(Katana);
myContainer.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);

export { myContainer };
