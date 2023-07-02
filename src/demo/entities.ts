import { inject, injectable } from '../index.js';
import type { ThrowableWeapon, Warrior, Weapon } from './interfaces.js';
import { TYPES } from './types.js';

@injectable()
class Katana implements Weapon {
	public hit(): string {
		return 'cut!';
	}
}

@injectable()
class Shuriken implements ThrowableWeapon {
	public throw(): string {
		return 'hit!';
	}
}

@injectable()
class Ninja implements Warrior {
	@inject(TYPES.Weapon)
	private readonly katana!: Weapon;
	@inject(TYPES.ThrowableWeapon)
	private readonly shuriken!: ThrowableWeapon;

	public constructor() {
		console.log('constructing:', this.katana, this.shuriken);
	}

	public fight(): string {
		return this.katana.hit();
	}
	public sneak(): string {
		return this.shuriken.throw();
	}
}

export { Ninja, Katana, Shuriken };
