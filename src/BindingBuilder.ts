import type * as interfaces from './interfaces/index.js';
import type { Binding } from './models/Binding.js';
import { isPromise } from './util/isPromise.js';
import type { Token } from './Token.js';

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

	public to: interfaces.BindingBuilder<T>['to'] = (ctr) => {
		this.#addBinding(this, {
			type: 'constructor',
			token: this.token,
			scope: this.#scope,
			ctr,
		});
	};

	public toConstantValue = ((value): void | Promise<void> => {
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
	}) as interfaces.BindingBuilder<T>['toConstantValue'];

	public toDynamicValue: interfaces.BindingBuilder<T>['toDynamicValue'] = (factory) => {
		this.#addBinding(this, {
			type: 'dynamic',
			token: this.token,
			scope: this.#scope,
			generator: factory,
		});
	};

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
