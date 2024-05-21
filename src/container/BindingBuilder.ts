import type * as interfaces from '../interfaces/index.js';
import type { Binding, ConstructorBinding, DynamicBinding, StaticBinding } from '../models/Binding.js';
import { BindingError, InvalidOperationError } from '../Error.js';
import type { Container } from './Container.js';
import { injectionFromIdentifier } from '../util/injectionFromIdentifier.js';
import { isConstructor } from '../util/isConstructor.js';
import { isMetadataToken } from '../util/isToken.js';
import { isPromise } from '../util/isPromise.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';
import type { Token } from '../Token.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

export class BindingBuilder<in out T, Metadata extends interfaces.MetadataObject> implements interfaces.BindingBuilder<T, Metadata> {
	protected scope: interfaces.ScopeOptions;
	protected explicitScope = false;
	protected metadata: Metadata | undefined;

	public readonly token: Token<T>;

	public constructor(
		public readonly id: interfaces.ServiceIdentifier<T>,
		containerConfiguration: interfaces.ContainerConfiguration,
		protected readonly warn: interfaces.LoggerFn,
		private readonly container: Container,
	) {
		this.token = tokenForIdentifier(id);
		this.scope = containerConfiguration.defaultScope;
	}

	protected readonly finaliseBinding = (binding: Binding<T, Metadata>): void => {
		if (isMetadataToken(this.token) && this.metadata == null) {
			throw new BindingError('Bindings for metadata tokens require setting metadata');
		}

		this.container.addBinding(this, binding);
	};

	public withMetadata = (metadata: Metadata): this => {
		this.metadata = metadata;
		return this;
	};

	public toConstantValue = ((value): void | Promise<void> => {
		if (isPromise(value)) {
			return value.then((v) =>
				this.finaliseBinding({
					type: 'static',
					id: this.id,
					token: this.token,
					scope: this.scope,
					// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
					metadata: this.metadata ?? ({} as Metadata),
					value: v,
				} satisfies StaticBinding<T, Metadata>),
			);
		} else {
			return this.finaliseBinding({
				type: 'static',
				id: this.id,
				token: this.token,
				scope: this.scope,
				// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
				metadata: this.metadata ?? ({} as Metadata),
				value,
			} satisfies StaticBinding<T, Metadata>);
		}
	}) as interfaces.BindingBuilder<T, Metadata>['toConstantValue'];

	public toDynamicValue: interfaces.BindingBuilder<T, Metadata>['toDynamicValue'] = <
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

		const binding: DynamicBinding<T, Metadata> = {
			type: 'dynamic',
			id: this.id,
			token: this.token,
			scope: this.scope,
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			metadata: this.metadata ?? ({} as Metadata),
			injections: dependencies.map((dep, index) => injectionFromIdentifier(dep, index)),
			generator: factory as DynamicBinding<T, Metadata>['generator'],
		};
		this.finaliseBinding(binding);
	};

	public toFactory: interfaces.BindingBuilder<T, Metadata>['toFactory'] = (deps, fn) =>
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

export class ClassBindingBuilder<T extends object, Metadata extends interfaces.MetadataObject>
	extends BindingBuilder<T, Metadata>
	implements interfaces.ClassBindingBuilder<T, Metadata> {
	public to: interfaces.ClassBindingBuilder<T, Metadata>['to'] = (ctr) => {
		const binding: ConstructorBinding<T, Metadata> = {
			type: 'constructor',
			id: this.id,
			token: this.token,
			scope: this.scope,
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			metadata: this.metadata ?? ({} as Metadata),
			ctr,
		};
		this.finaliseBinding(binding);
	};

	public toSelf: interfaces.ClassBindingBuilder<T, Metadata>['toSelf'] = () => {
		if (!isConstructor(this.id)) {
			throw new InvalidOperationError(
				`Invalid call of toSelf(): identifier is not a constructor: ${stringifyIdentifier(this.id)}`,
			);
		}

		const binding: ConstructorBinding<T, Metadata> = {
			type: 'constructor',
			id: this.id,
			token: this.token,
			scope: this.scope,
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			metadata: this.metadata ?? ({} as Metadata),
			ctr: this.id,
		};
		this.finaliseBinding(binding);
	};
}
