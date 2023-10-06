import type * as interfaces from '../interfaces/index.js';
import type { Binding, ConstructorBinding, DynamicBinding } from '../models/Binding.js';
import type { Container } from './Container.js';
import { injectionFromIdentifier } from '../util/injectionFromIdentifier.js';
import { InvalidOperationError } from '../Error.js';
import { isConstructor } from '../util/isConstructor.js';
import { isPromise } from '../util/isPromise.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';
import type { Token } from '../Token.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

export class BindingBuilder<in out T> implements interfaces.BindingBuilder<T> {
	protected scope: interfaces.ScopeOptions;
	protected explicitScope = false;
	public readonly token: Token<T>;

	public constructor(
		public readonly id: interfaces.ServiceIdentifier<T>,
		containerConfiguration: interfaces.ContainerConfiguration,
		protected readonly warn: interfaces.LoggerFn,
		protected readonly container: Container,
	) {
		this.token = tokenForIdentifier(id);
		this.scope = containerConfiguration.defaultScope;
	}

	public toConstantValue = ((value): void | Promise<void> => {
		if (isPromise(value)) {
			return value.then((v) =>
				this.container.addBinding(this, {
					type: 'static',
					id: this.id,
					token: this.token,
					scope: this.scope,
					value: v,
				}),
			);
		} else {
			return this.container.addBinding(this, {
				type: 'static',
				id: this.id,
				token: this.token,
				scope: this.scope,
				value,
			});
		}
	}) as interfaces.BindingBuilder<T>['toConstantValue'];

	public toDynamicValue: interfaces.BindingBuilder<T>['toDynamicValue'] = <
		Tokens extends Array<interfaces.InjectionIdentifier<unknown>>,
	>(
		dependencies: Tokens,
		factory: (...args: interfaces.ArgsForInjectionIdentifiers<Tokens>) => T | Promise<T>,
	) => {
		if (!this.explicitScope) {
			this.warn(
				{ id: stringifyIdentifier(this.id) },
				'Using toDynamicValue() or toFactory() without an explicit scope can lead to performance issues. See https://github.com/mscharley/dot/discussions/80 for details.',
			);
		}

		this.container.addBinding(this, {
			type: 'dynamic',
			id: this.id,
			token: this.token,
			scope: this.scope,
			injections: dependencies.map((dep, index) => injectionFromIdentifier(dep, index)),
			generator: factory as DynamicBinding<T>['generator'],
		} satisfies DynamicBinding<T>);
	};

	public toFactory: interfaces.BindingBuilder<T>['toFactory'] = (deps, fn) =>
		this.toDynamicValue(
			deps,
			fn({ container: { config: this.container.config, createChild: this.container.createChild } }),
		);

	public inSingletonScope = (): this => {
		this.scope = 'singleton';
		this.explicitScope = true;
		return this;
	};

	public inTransientScope = (): this => {
		this.scope = 'transient';
		this.explicitScope = true;
		return this;
	};

	public inRequestScope = (): this => {
		this.scope = 'request';
		this.explicitScope = true;
		return this;
	};
}

export class ClassBindingBuilder<T extends object>
	extends BindingBuilder<T>
	implements interfaces.ClassBindingBuilder<T>
{
	public to: interfaces.ClassBindingBuilder<T>['to'] = (ctr) => {
		const binding: ConstructorBinding<T> = {
			type: 'constructor',
			id: this.id,
			token: this.token,
			scope: this.scope,
			ctr,
		};
		this.container.addBinding(this, binding as Binding<T>);
	};

	public toSelf: interfaces.ClassBindingBuilder<T>['toSelf'] = () => {
		if (!isConstructor(this.id)) {
			throw new InvalidOperationError(
				`Invalid call of toSelf(): identifier is not a constructor: ${stringifyIdentifier(this.id)}`,
			);
		}

		const binding: ConstructorBinding<T> = {
			type: 'constructor',
			id: this.id,
			token: this.token,
			scope: this.scope,
			ctr: this.id,
		};
		this.container.addBinding(this, binding as Binding<T>);
	};
}
