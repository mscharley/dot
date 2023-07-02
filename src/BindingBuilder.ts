import type * as interfaces from './interfaces/index.js';
import type { Binding } from './models/Binding.js';
import type { Token } from './Token.js';

const isPromise = <T>(v: T | Promise<T>): v is Promise<T> => v != null && typeof (v as Promise<T>).then === 'function';

export class BindingBuilder<in out T> implements interfaces.BindingBuilder<T> {
	#scope: interfaces.ScopeOptions;
	readonly #addBinding: (builder: BindingBuilder<T>, binding: Binding<T>) => void;

	public constructor(
		public readonly token: Token<T>,
		containerConfiguration: interfaces.ContainerConfiguration,
		addBinding: (builder: BindingBuilder<T>, binding: Binding<T>) => void,
	) {
		this.#scope = containerConfiguration.defaultScope;
		this.#addBinding = addBinding;
	}

	public to(ctr: new () => T): void {
		this.#addBinding(this, {
			type: 'constructor',
			token: this.token,
			scope: this.#scope,
			ctr,
		});
	}

	public toConstantValue(value: T): void;
	public toConstantValue(value: Promise<T>): Promise<void>;
	public toConstantValue(value: T | Promise<T>): void | Promise<void> {
		if (isPromise(value)) {
			return value.then((v) =>
				this.#addBinding(this, {
					type: 'static',
					token: this.token,
					scope: this.#scope,
					value: v,
				}),
			);
		} else {
			return this.#addBinding(this, {
				type: 'static',
				token: this.token,
				scope: this.#scope,
				value,
			});
		}
	}

	public toDynamicValue(factory: (context: interfaces.BindingContext<T>) => T | Promise<T>): void {
		this.#addBinding(this, {
			type: 'dynamic',
			token: this.token,
			scope: this.#scope,
			generator: factory,
		});
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
