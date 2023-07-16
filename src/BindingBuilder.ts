import type * as interfaces from './interfaces/index.js';
import type { Binding } from './models/Binding.js';
import { isPromise } from './util/isPromise.js';
import { stringifyIdentifier } from './util/stringifyIdentifier.js';
import type { Token } from './Token.js';
import { tokenForIdentifier } from './util/tokenForIdentifier.js';

export class BindingBuilder<in out T> implements interfaces.ClassBindingBuilder<T> {
	#scope: interfaces.ScopeOptions;
	readonly #addBinding: (builder: BindingBuilder<T>, binding: Binding<T>) => void;
	public readonly token: Token<T>;

	public constructor(
		public readonly id: interfaces.ServiceIdentifier<T>,
		containerConfiguration: interfaces.ContainerConfiguration,
		addBinding: (builder: BindingBuilder<T>, binding: Binding<T>) => void,
	) {
		this.token = tokenForIdentifier(id);
		this.#scope = containerConfiguration.defaultScope;
		this.#addBinding = addBinding;
	}

	public to: interfaces.BindingBuilder<T>['to'] = (ctr) => {
		this.#addBinding(this, {
			type: 'constructor',
			id: this.id,
			token: this.token,
			scope: this.#scope,
			ctr,
		});
	};

	public toSelf: interfaces.ClassBinder<T>['toSelf'] = () => {
		if (typeof this.id !== 'function') {
			throw new Error(`Invalid call of toSelf(): identifier is not a constructor: ${stringifyIdentifier(this.id)}`);
		}
		this.#addBinding(this, {
			type: 'constructor',
			id: this.id,
			token: this.token,
			scope: this.#scope,
			ctr: this.id,
		});
	};

	public toConstantValue = ((value): void | Promise<void> => {
		if (isPromise(value)) {
			return value.then((v) =>
				this.#addBinding(this, {
					type: 'static',
					id: this.id,
					token: this.token,
					scope: this.#scope,
					value: v,
				}),
			);
		} else {
			return this.#addBinding(this, {
				type: 'static',
				id: this.id,
				token: this.token,
				scope: this.#scope,
				value,
			});
		}
	}) as interfaces.BindingBuilder<T>['toConstantValue'];

	public toDynamicValue: interfaces.BindingBuilder<T>['toDynamicValue'] = (factory) => {
		this.#addBinding(this, {
			type: 'dynamic',
			id: this.id,
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
