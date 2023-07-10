import type { ThrowableWeapon, Warrior, Weapon } from './interfaces.js';
import { Token } from '../index.js';

const TYPES = {
	Warrior: new Token<Warrior>('Warrior'),
	Weapon: new Token<Weapon>('Weapon'),
	ThrowableWeapon: new Token<ThrowableWeapon>('ThrowableWeapon'),
};

export { TYPES };
