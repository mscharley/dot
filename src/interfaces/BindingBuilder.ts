import type { Binder } from './Binder.js';
import type { BindingScope } from './BindingScope.js';
import type { ClassBinder } from './ClassBinder.js';

/**
 * @public
 */
export interface BindingBuilder<in out T> extends Binder<T>, BindingScope<T, BindingBuilder<T>>, ClassBinder<T> {}

/**
 * @public
 */
export interface ClassBindingBuilder<in out T> extends Binder<T>, BindingScope<T, BindingBuilder<T>>, ClassBinder<T> {}
