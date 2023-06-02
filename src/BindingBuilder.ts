import type * as interfaces from './interfaces';
import type { Token } from './Token';

const isPromise = <T>(v: T | Promise<T>): v is Promise<T> => v != null && typeof (v as Promise<T>).then === 'function';

export class BindingBuilder<in out T> implements interfaces.BindingBuilder<T> {
	#scope?: interfaces.ScopeOptions;

	public constructor(
		public readonly token: Token<T>,
		private readonly addBinding: (
			token: Token<T>,
			scope: undefined | interfaces.ScopeOptions,
			builder: BindingBuilder<T>,
			fn: (context: interfaces.BindingContext) => T,
		) => void,
	) {}

	public to(fn: new () => T): void {
		this.addBinding(this.token, this.#scope, this, () => new fn());
	}

	public toConstantValue(v: T): void;
	public toConstantValue(v: Promise<T>): Promise<void>;
	public toConstantValue(v: T | Promise<T>): void | Promise<void> {
		if (isPromise(v)) {
			return v.then((value) => this.addBinding(this.token, this.#scope, this, () => value));
		} else {
			return this.addBinding(this.token, this.#scope, this, () => v);
		}
	}

	public toDynamicValue(fn: (context: interfaces.BindingContext) => T): void {
		this.addBinding(this.token, this.#scope, this, fn);
	}

	public inSingletonScope: interfaces.BindingBuilder<T>['inSingletonScope'] = () => {
		this.#scope = 'singleton';
		return this;
	};

	public inTransientScope: interfaces.BindingBuilder<T>['inTransientScope'] = () => {
		this.#scope = 'transient';
		return this;
	};

	public inRequestScope: interfaces.BindingBuilder<T>['inRequestScope'] = () => {
		this.#scope = 'request';
		return this;
	};
}
