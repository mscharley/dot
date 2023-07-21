import type { Binder } from './Binder.js';
import type { BindingScope } from './BindingScope.js';
import type { ClassBinder } from './ClassBinder.js';
import type { ObjectBinder } from './ObjectBinder.js';

/**
 * @public
 */
export interface BindingBuilder<in out T> extends Binder<T>, BindingScope<T, BindingBuilder<T>> {}

/**
 * @public
 */
export interface ObjectBindingBuilder<in out T extends object>
	extends Binder<T>,
		BindingScope<T, ObjectBindingBuilder<T>>,
		ObjectBinder<T> {}

/**
 * @public
 */
export interface ClassBindingBuilder<in out T extends object>
	extends Binder<T>,
		BindingScope<T, ClassBindingBuilder<T>>,
		ObjectBinder<T>,
		ClassBinder<T> {}
