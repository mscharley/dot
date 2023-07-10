import { createContainer, type interfaces } from '../index.js';
import { Katana, Ninja, Shuriken } from './entities.js';
import { TYPES } from './types.js';

const myContainer = createContainer();

const demoModule: interfaces.ContainerModule = (bind) => {
	bind(TYPES.Warrior).inSingletonScope().to(Ninja);
	bind(TYPES.Weapon).to(Katana);
	bind(TYPES.ThrowableWeapon).to(Shuriken);
};
myContainer.load(demoModule);

export { myContainer };
