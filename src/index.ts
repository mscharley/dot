const injectable =
	() =>
	<T>(target: new () => T, _context: ClassDecoratorContext<new () => T>): new () => T => {
		console.log('@injectable', target);

		return target;
	};

const inject =
	<T>(defaultValue: T) =>
	(_target: undefined, context: ClassFieldDecoratorContext) =>
	(originalValue: T | undefined): T => {
		console.log('setting data', context, originalValue);
		return defaultValue;
	};

console.log('Class initialisation');
@injectable()
class TestClass {
	@inject('Hello world!')
	readonly #foo!: string;

	public constructor() {
		console.log('constructor:', this.#foo);
	}
}

console.log('Class initialisation');
@injectable()
class SubClass extends TestClass {
	@inject('Goodbye world!')
	readonly #bar!: string;

	public constructor() {
		super();
		console.log('subclass:', this.#bar);
	}
}

console.log('instantiation');
const foo = new TestClass();
console.log('data:', (foo as any).foo);

console.log('instantiation');
const bar = new SubClass();
console.log('data:', (bar as any).bar);
