/**
 * A lightweight inversion of control framework for JavaScript and TypeScript
 *
 * @remarks
 *
 * For a discussion of the project goals, please see {@link https://github.com/mscharley/dot/discussions/39 | Github Discussions }.
 *
 * @example
 *
 * ```typescript
 * import { createContainer, injectable, inject, type interfaces } from "@mscharley/dot";
 *
 * export interface Warrior {
 *   fight: () => string;
 *   sneak: () => string;
 * }
 *
 * export interface Weapon {
 *   hit: () => string;
 * }
 *
 * export interface ThrowableWeapon {
 *   throw: () => string;
 * }
 *
 * const TYPES = {
 *   Warrior: new Token<Warrior>('Warrior'),
 *   Weapon: new Token<Weapon>('Weapon'),
 *   ThrowableWeapon: new Token<ThrowableWeapon>('ThrowableWeapon'),
 * };
 *
 * @injectable()
 * class Katana implements Weapon {
 *   public hit(): string {
 *     return 'cut!';
 *   }
 * }
 *
 * @injectable()
 * class Shuriken implements ThrowableWeapon {
 *   public throw(): string {
 *     return 'hit!';
 *   }
 * }
 *
 * @injectable(TYPES.Weapon, TYPES.ThrowableWeapon)
 * class Ninja implements Warrior {
 *   public constructor(
 *     private readonly katana: Weapon,
 *     private readonly shuriken: ThrowableWeapon,
 *   ) {
 *     console.log('constructing:', this.katana, this.shuriken);
 *   }
 *
 *   public fight(): string {
 *     return this.katana.hit();
 *   }
 *   public sneak(): string {
 *     return this.shuriken.throw();
 *   }
 * }
 *
 * const myContainer = createContainer();
 *
 * const demoModule: interfaces.ContainerModule = (bind) => {
 *   bind(TYPES.Warrior).inSingletonScope().to(Ninja);
 *   bind(TYPES.Weapon).to(Katana);
 *   bind(TYPES.ThrowableWeapon).to(Shuriken);
 * };
 * myContainer.load(demoModule);
 *
 * const ninja = await myContainer.get(TYPES.Warrior);
 *
 * console.log('fight', ninja.fight()); // cut!
 * console.log('sneak', ninja.sneak()); // hit!
 *
 * const ninja2 = await myContainer.get(TYPES.Warrior);
 *
 * console.log('ninja === ninja2:', ninja === ninja2); // true
 * ```
 *
 * @packageDocumentation
 */

import type * as interfaces from './interfaces/index.js';
import { Container } from './container/Container.js';

/**
 * Create a new empty container
 *
 * @remarks
 *
 * Use this function to create new top-level containers.
 *
 * See {@link @mscharley/dot#interfaces.ContainerConfiguration } for options.
 *
 * @public
 */
export const createContainer: interfaces.ContainerFactory = (config) => new Container(config);

export type { interfaces };

export type { ClassDecorator, ClassFieldDecorator } from './decorators/decorators.js';
export type { InjectDecoratorFactory } from './decorators/inject.js';
export type { TokenType } from './Token.js';

export { inject } from './decorators/inject.js';
export { injectable } from './decorators/injectable.js';
export { stringifyIdentifier } from './util/stringifyIdentifier.js';
export type { AnyToken } from './Token.js';
export { MetadataToken, NamedToken, Token } from './Token.js';
export { isToken, isMetadataToken } from './util/isToken.js';
export { named } from './decorators/named.js';
export { unmanaged } from './decorators/unmanaged.js';
export { withOptions } from './decorators/withOptions.js';

export type { ErrorCode } from './Error.js';
export {
	InvalidOperationError,
	IocError,
	RecursiveResolutionError,
	ResolutionError,
	TokenResolutionError,
} from './Error.js';
