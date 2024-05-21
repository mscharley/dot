import type { Binder } from './Binder.js';
import type { BindingMetadata } from './BindingMetadata.js';
import type { BindingScope } from './BindingScope.js';
import type { ClassBinder } from './ClassBinder.js';
import type { MetadataObject } from './MetadataObject.js';
import type { ObjectBinder } from './ObjectBinder.js';

/**
 * BindingBuilder used as a fallback for any generic type
 *
 * @public
 */
export interface BindingBuilder<in out T, in out Metadata extends MetadataObject>
	extends Binder<T>,
	BindingMetadata<T, Metadata, BindingBuilder<T, Metadata>>,
	BindingScope<T, BindingBuilder<T, Metadata>> {}

/**
 * BindingBuilder used for types which are objects
 *
 * @public
 */
export interface ObjectBindingBuilder<in out T extends object, in out Metadata extends MetadataObject>
	extends Binder<T>,
	BindingMetadata<T, Metadata, ObjectBindingBuilder<T, Metadata>>,
	BindingScope<T, ObjectBindingBuilder<T, Metadata>>,
	ObjectBinder<T> {}

/**
 * BindingBuilder used for types identified by a constructor directly
 *
 * @public
 */
export interface ClassBindingBuilder<in out T extends object, in out Metadata extends MetadataObject>
	extends Binder<T>,
	BindingMetadata<T, Metadata, ClassBindingBuilder<T, Metadata>>,
	BindingScope<T, ClassBindingBuilder<T, Metadata>>,
	ObjectBinder<T>,
	ClassBinder<T> {}
