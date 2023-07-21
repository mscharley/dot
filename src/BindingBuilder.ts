import type * as interfaces from './interfaces/index.js';
import type { Binding, ConstructorBinding } from './models/Binding.js';
import { isPromise } from './util/isPromise.js';
import { stringifyIdentifier } from './util/stringifyIdentifier.js';
import type { Token } from './Token.js';
import { tokenForIdentifier } from './util/tokenForIdentifier.js';

export class BindingBuilder<in out T> implements interfaces.BindingBuilder<T> {
	protected scope: interfaces.ScopeOptions;
	protected readonly addBinding: (builder: BindingBuilder<T>, binding: Binding<T>) => void;
	public readonly token: Token<T>;

	public constructor(
		public readonly id: interfaces.ServiceIdentifier<T>,
		containerConfiguration: interfaces.ContainerConfiguration,
		addBinding: (builder: BindingBuilder<T>, binding: Binding<T>) => void,
	) {
		this.token = tokenForIdentifier(id);
		this.scope = containerConfiguration.defaultScope;
		this.addBinding = addBinding;
	}

	public toConstantValue = ((value): void | Promise<void> => {
		if (isPromise(value)) {
			return value.then((v) =>
				this.addBinding(this, {
					type: 'static',
					id: this.id,
					token: this.token,
					scope: this.scope,
					value: v,
				}),
			);
		} else {
			return this.addBinding(this, {
				type: 'static',
				id: this.id,
				token: this.token,
				scope: this.scope,
				value,
			});
		}
	}) as interfaces.BindingBuilder<T>['toConstantValue'];

	public toDynamicValue: interfaces.BindingBuilder<T>['toDynamicValue'] = (factory) => {
		this.addBinding(this, {
			type: 'dynamic',
			id: this.id,
			token: this.token,
			scope: this.scope,
			generator: factory,
		});
	};

	public inSingletonScope: interfaces.BindingBuilder<T>['inSingletonScope'] = () => {
		this.scope = 'singleton';
		return this;
	};

	public inTransientScope: interfaces.BindingBuilder<T>['inTransientScope'] = () => {
		this.scope = 'transient';
		return this;
	};

	public inRequestScope: interfaces.BindingBuilder<T>['inRequestScope'] = () => {
		this.scope = 'request';
		return this;
	};
}

export class ClassBindingBuilder<T extends object>
	extends BindingBuilder<T>
	implements interfaces.ClassBindingBuilder<T>
{
	public to: interfaces.ClassBindingBuilder<T>['to'] = (ctr: interfaces.Constructor<T>) => {
		const binding: ConstructorBinding<T> = {
			type: 'constructor',
			id: this.id,
			token: this.token,
			scope: this.scope,
			ctr,
		};
		this.addBinding(this, binding as Binding<T>);
	};

	public toSelf: interfaces.ClassBindingBuilder<T>['toSelf'] = () => {
		if (typeof this.id !== 'function') {
			throw new Error(`Invalid call of toSelf(): identifier is not a constructor: ${stringifyIdentifier(this.id)}`);
		}

		const binding: ConstructorBinding<T> = {
			type: 'constructor',
			id: this.id,
			token: this.token,
			scope: this.scope,
			ctr: this.id,
		};
		this.addBinding(this, binding as Binding<T>);
	};

	public override inSingletonScope: interfaces.ClassBindingBuilder<T>['inSingletonScope'] = () => {
		this.scope = 'singleton';
		return this;
	};

	public override inTransientScope: interfaces.ClassBindingBuilder<T>['inTransientScope'] = () => {
		this.scope = 'transient';
		return this;
	};

	public override inRequestScope: interfaces.ClassBindingBuilder<T>['inRequestScope'] = () => {
		this.scope = 'request';
		return this;
	};
}
