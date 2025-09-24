/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type * as interfaces from '../interfaces/index.js';
import type { AnyToken } from '../Token.js';
import type { Injection } from './Injection.js';

export interface ConstructorBinding<out T, in out Metadata extends interfaces.MetadataObject> {
	type: 'constructor';
	id: interfaces.ServiceIdentifier<T>;
	token: AnyToken<T>;
	scope: interfaces.ScopeOptions;
	metadata: Metadata;
	module: interfaces.ContainerModule;
	ctr: interfaces.Constructor<T>;
}

export interface StaticBinding<out T, in out Metadata extends interfaces.MetadataObject> {
	type: 'static';
	id: interfaces.ServiceIdentifier<T>;
	token: AnyToken<T>;
	scope: interfaces.ScopeOptions;
	metadata: Metadata;
	module: interfaces.ContainerModule;
	value: T;
}

export interface DynamicBinding<out T, in out Metadata extends interfaces.MetadataObject> {
	type: 'dynamic';
	id: interfaces.ServiceIdentifier<T>;
	token: AnyToken<T>;
	scope: interfaces.ScopeOptions;
	metadata: Metadata;
	module: interfaces.ContainerModule;
	injections: Array<Injection<T, Metadata>>;
	generator: (...args: unknown[]) => T | Promise<T>;
}

export interface FactoryBinding<out T, in out Metadata extends interfaces.MetadataObject> {
	type: 'factory';
	id: interfaces.ServiceIdentifier<T>;
	token: AnyToken<T>;
	scope: interfaces.ScopeOptions;
	metadata?: Metadata | undefined;
	module: interfaces.ContainerModule;
	injections: Array<Injection<T, Metadata>>;
	generator: (ctx: interfaces.FactoryContext<Metadata>) => (...args: unknown[]) => T | Promise<T>;
}

export type Binding<T, Metadata extends interfaces.MetadataObject>
	= ConstructorBinding<T, Metadata>
		| StaticBinding<T, Metadata>
		| DynamicBinding<T, Metadata>
		| FactoryBinding<T, Metadata>;
