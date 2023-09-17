/**
 * Helper to check if a value is not null or undefined.
 */
export const isNotNullOrUndefined = <T>(v: T | null | undefined): v is T => v != null;
