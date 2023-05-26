import { inject, injectable } from './decorators';
import { Container } from './Container';
import { Token } from './Token';

const weapon = new Token<Katana>('weapon');
const ninja = new Token<Ninja>('ninja');

@injectable()
class Katana {
	public foo = 'Hello world!';
}

@injectable()
class Ninja {
	@inject(weapon)
	readonly #left!: Katana;
	@inject(weapon)
	readonly #right!: Katana;

	public constructor() {
		this.#left.foo = 'Left hand';
		this.#right.foo = 'Right hand';
		console.log('weapon:', this.#left, this.#right);
	}
}

const container = new Container();
container.bind(weapon).toSelf(Katana);
container.bind(ninja).toSelf(Ninja);
console.log('ninja', container.get(ninja));
