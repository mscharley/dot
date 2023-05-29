import { Katana, Ninja, Shuriken } from './entities';
import type { ContainerModule } from '../interfaces';
import { createContainer } from '..';
import { TYPES } from './types';

const myContainer = createContainer();

const demoModule: ContainerModule = (bind) => {
	bind(TYPES.Warrior).inSingletonScope().to(Ninja);
	bind(TYPES.Weapon).to(Katana);
	bind(TYPES.ThrowableWeapon).to(Shuriken);
};
myContainer.load(demoModule);

export { myContainer };
