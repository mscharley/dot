/**
 * Options that can be applied to an individual injection
 *
 * @public
 */
export interface InjectOptions {
	/**
	 * Inject this identifier if it is available, otherwise inject undefined
	 */
	optional: boolean;

	/**
	 * Inject this identifier, allowing for multiple values if there are many bindings
	 *
	 * @remarks
	 *
	 * This will always inject an array. If optional is also set to true then that array may be empty, otherwise it will
	 * always contain at least one value.
	 */
	multiple: boolean;
}
