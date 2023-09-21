import type { Binder } from './Binder.js';
import type { BindingScope } from './BindingScope.js';
import type { ClassBinder } from './ClassBinder.js';
import type { ObjectBinder } from './ObjectBinder.js';

/**
 * BindingBuilder used as a fallback for any generic type
 *
 * @public
 */
export interface BindingBuilder<in out T> extends Binder<T>, BindingScope<T, BindingBuilder<T>> {}

/**
 * BindingBuilder used for types which are objects
 *
 * @public
 */
export interface ObjectBindingBuilder<in out T extends object>
	extends Binder<T>,
		BindingScope<T, ObjectBindingBuilder<T>>,
		ObjectBinder<T> {}

/**
 * BindingBuilder used for types identified by a constructor directly
 *
 * @public
 */
export interface ClassBindingBuilder<in out T extends object>
	extends Binder<T>,
		BindingScope<T, ClassBindingBuilder<T>>,
		ObjectBinder<T>,
		ClassBinder<T> {}
