import { inject, injectable } from '../';
import type { ThrowableWeapon, Warrior, Weapon } from './interfaces';
import { TYPES } from './types';

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

	public fight(): string {
		return this.katana.hit();
	}
	public sneak(): string {
		return this.shuriken.throw();
	}
}

export { Ninja, Katana, Shuriken };
