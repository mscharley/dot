/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { BindingBuilder, ClassBindingBuilder, ObjectBindingBuilder } from './BindingBuilder.js';
import type { MetadataForIdentifier, ServiceIdentifier } from './ServiceIdentifier.js';
import type { InjectedType } from './InjectionIdentifier.js';
import type { MetadataObject } from './MetadataObject.js';

/**
 * A constructor for a class
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<out T, in Args extends unknown[] = any> = new (...args: Args) => T;

/**
 * Helper for defining functions
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Fn<out T, in Args extends unknown[] = any> = (...args: Args) => T;

/**
 * A function that allows for creating new bindings in a container
 *
 * @public
 */
export type BindFunction = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	<Id extends Constructor<any, any>>(id: Id): ClassBindingBuilder<InjectedType<Id>, MetadataObject>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	<Id extends Exclude<ServiceIdentifier<object>, Constructor<any, any>>>(id: Id): ObjectBindingBuilder<InjectedType<Id>, MetadataForIdentifier<Id>>;
	<Id extends ServiceIdentifier<unknown>>(id: Id): BindingBuilder<InjectedType<Id>, MetadataForIdentifier<Id>>;
};

/**
 * Checks if a binding for a given identifier already exists in a container
 *
 * @public
 */
export type IsBoundFunction = <T>(id: ServiceIdentifier<T>) => boolean;

/**
 * Unbinds any existing bindings for an identifier and replaces them with a new one
 *
 * @remarks
 *
 * This is a convenience method for unbinding and binding, as a result this function will also fail if no existing
 * binding already exist.
 *
 * @public
 */
export type RebindFunction = BindFunction;

/**
 * Unbinds any existing bindings for an identifier
 *
 * @remarks
 *
 * Note: as a safety mechanism, this function will fail if no existing bindings already exist.
 *
 * @public
 */
export type UnbindFunction = <T>(id: ServiceIdentifier<T>) => void;
