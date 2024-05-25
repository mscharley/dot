/**
 * Metadata object for bindings that support it
 *
 * @remarks
 *
 * There are no restrictions on what types properties can contain, but comparisons are always done shallowly so if
 * metadata properties contain objects then the exact same object must be used on the binding and injection side as
 * determined by the `===` operator.
 *
 * @public
 */
export type MetadataObject = Record<string, unknown>;
