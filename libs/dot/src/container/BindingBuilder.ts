/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import type { Binding, ConstructorBinding, DynamicBinding, FactoryBinding, StaticBinding } from '../models/Binding.js';
import { BindingError, InvalidOperationError } from '../Error.js';
import type { Container } from './Container.js';
import { Context } from './Context.js';
import type { Injection } from '../models/Injection.js';
import { injectionFromIdentifier } from '../util/injectionFromIdentifier.js';
import { isConstructor } from '../util/isConstructor.js';
import { isMetadataToken } from '../util/isToken.js';
import { isPromise } from '../util/isPromise.js';
import { stringifyIdentifier } from '../util/stringifyIdentifier.js';
import type { Token } from '../Token.js';
import { tokenForIdentifier } from '../util/tokenForIdentifier.js';

export class BindingBuilder<in out T, Metadata extends interfaces.MetadataObject>
implements interfaces.BindingBuilder<T, Metadata> {
	protected scope: interfaces.ScopeOptions;
	protected explicitScope = false;
	protected metadata: Metadata | undefined;

	public readonly token: Token<T>;

	public constructor(
		public readonly id: interfaces.ServiceIdentifier<T>,
		containerConfiguration: interfaces.ContainerConfiguration,
		protected readonly warn: interfaces.LoggerFn,
		protected readonly module: interfaces.ContainerModule,
		private readonly container: Pick<Container, 'addBinding'>,
	) {
		this.token = tokenForIdentifier(id);
		this.scope = containerConfiguration.defaultScope;
	}

	protected readonly finaliseBinding = (binding: Binding<T, Metadata>): void => {
		if (isMetadataToken(this.token) && this.metadata == null && !(binding.type === 'factory' && this.scope === 'transient')) {
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
					module: this.module,
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
				module: this.module,
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
			module: this.module,
			injections: dependencies.map((dep, index) => injectionFromIdentifier(dep, index) as Injection<T, Metadata>),
			generator: factory as DynamicBinding<T, Metadata>['generator'],
		};
		this.finaliseBinding(binding);
	};

	public toFactory: interfaces.BindingBuilder<T, Metadata>['toFactory'] = (deps, fn) => {
		if (!this.explicitScope) {
			this.warn(
				{ id: stringifyIdentifier(this.id) },
				'Using toDynamicValue() or toFactory() without an explicit scope can lead to performance issues. See https://github.com/mscharley/dot/discussions/80 for details.',
			);
		}

		const binding: FactoryBinding<T, Metadata> = {
			type: 'factory',
			id: this.id,
			token: this.token,
			scope: this.scope,
			metadata: this.metadata,
			module: this.module,
			injections: deps.map((dep, index) => injectionFromIdentifier(dep, index)) as Array<Injection<T, Metadata>>,
			generator: fn as FactoryBinding<T, Metadata>['generator'],
		};
		this.finaliseBinding(binding);
	};

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
			module: this.module,
			ctr,
			context: Context.all,
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
			module: this.module,
			ctr: this.id,
			context: Context.all,
		};
		this.finaliseBinding(binding);
	};
}
