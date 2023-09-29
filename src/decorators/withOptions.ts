import type * as interfaces from '../interfaces/index.js';

/**
 * Helper to provide a nicer interface for injecting with options
 *
 * @example
 *
 * ```typescript
 * @injectable(withOptions(MyToken, { multiple: true }))
 * class Test {
 *   public constructor(private tokens: MyToken[]) {}
 * }
 * ```
 *
 * @public
 */
export const withOptions = <T, Options extends Partial<interfaces.InjectOptions>>(
	id: interfaces.ServiceIdentifier<T>,
	options: Options,
): [interfaces.ServiceIdentifier<T>, Options] => [id, options];
