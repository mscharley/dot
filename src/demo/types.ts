import type { ThrowableWeapon, Warrior, Weapon } from './interfaces';
import { Token } from '../';

const TYPES = {
	Warrior: new Token<Warrior>('Warrior'),
	Weapon: new Token<Weapon>('Weapon'),
	ThrowableWeapon: new Token<ThrowableWeapon>('ThrowableWeapon'),
};

export { TYPES };
