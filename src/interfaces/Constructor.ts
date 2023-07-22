/**
 * A constructor for a class
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<out T extends object, in Args extends unknown[] = any> = new (...args: Args) => T;
