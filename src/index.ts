const injectable = () => (target: any, context: any) => target;

const inject = () => (target: any, context: any) => {
	return (): string => {
		console.log('setting data', context);
		return 'Hello world!';
	};
};

console.log('Class initialisation');
@injectable()
class TestClass {
	@inject()
	public foo: string;

	public constructor() {
		console.log('constructor:', this.foo);
	}
}

class SubClass extends TestClass {
	@inject()
	public bar!: string;

	public constructor() {
		super();
		console.log('subclass', this.bar);
	}
}

console.log('instantiation');
const foo = new TestClass();
console.log('data:', foo.foo);

console.log('instantiation');
const bar = new SubClass();
console.log('data:', bar.bar);
