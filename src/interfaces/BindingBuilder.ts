/* eslint-disable @typescript-eslint/no-type-alias */

import type { Binder } from './Binder';
import type { BindingScope } from './BindingScope';

/**
 * @public
 */
export type BindingBuilder<T> = Binder<T> & BindingScope<T, BindingBuilder<T>>;
