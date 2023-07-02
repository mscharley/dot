import type { Binder } from './Binder.js';
import type { BindingScope } from './BindingScope.js';

/**
 * @public
 */
export interface BindingBuilder<in out T> extends Binder<T>, BindingScope<T, BindingBuilder<T>> {}
