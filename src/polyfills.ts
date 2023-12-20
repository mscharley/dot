/**
 * Polyfill for the metadata Symbol.
 *
 * This is used by the TypeScript decorator metadata implementation as if it already exists but many common runtimes
 * don't have a symbol defined here yet. The value of the symbol is largely irrelevant as long as it's unique, so
 * provide one ourself if it doesn't already exist.
 */
(Symbol as { metadata?: undefined | symbol }).metadata ??= Symbol('Symbol.metadata');
