/**
 * Partial interface for building bindings which specify metadata
 *
 * @public
 */
export interface BindingMetadata<in out T, in out Metadata, out Builder> {
	withMetadata: (metadata: Metadata) => Omit<Builder, keyof BindingMetadata<T, Metadata, unknown>>;
}
