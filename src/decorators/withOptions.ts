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
export const withOptions = <Id extends interfaces.ServiceIdentifier<unknown>, Options extends Partial<interfaces.InjectOptions<interfaces.MetadataForIdentifier<Id>>>>(
	id: Id,
	options: Options,
): [Id, Options] => [id, options];
