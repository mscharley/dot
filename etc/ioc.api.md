## API Report File for "@mscharley/ioc"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

// @public
type AsyncContainerModule = (bind: BindFunction, unbind: UnbindFunction, isBound: IsBoundFunction, rebind: RebindFunction) => Promise<void>;

// @public (undocumented)
interface Binder<in out T> {
    // (undocumented)
    to: (fn: Constructor<T>) => void;
    // (undocumented)
    toConstantValue: ((v: T) => void) & ((v: Promise<T>) => Promise<void>);
    // (undocumented)
    toDynamicValue: (fn: (context: BindingContext<T>) => T | Promise<T>) => void;
}

// @public (undocumented)
type BindFunction = {
    <T>(id: Constructor<T>): ClassBindingBuilder<T>;
    <T>(id: ServiceIdentifier<T>): BindingBuilder<T>;
};

// @public (undocumented)
interface BindingBuilder<in out T> extends Binder<T>, BindingScope<T, BindingBuilder<T>>, ClassBinder<T> {
}

// @public (undocumented)
interface BindingContext<out T> {
    // (undocumented)
    container: Container;
    // (undocumented)
    id: ServiceIdentifier<T>;
}

// @public (undocumented)
interface BindingScope<in T, out Builder> {
    // (undocumented)
    inRequestScope: () => Omit<Builder, FixedScopeBindingOptions | keyof BindingScope<T, unknown>>;
    // (undocumented)
    inSingletonScope: () => Omit<Builder, FixedScopeBindingOptions | keyof BindingScope<T, unknown>>;
    // (undocumented)
    inTransientScope: () => Omit<Builder, FixedScopeBindingOptions | keyof BindingScope<T, unknown>>;
}

// @public (undocumented)
interface ClassBinder<in T> {
    // (undocumented)
    toSelf: () => void;
}

// @public (undocumented)
interface ClassBindingBuilder<in out T> extends BindingBuilder<T>, ClassBinder<T> {
}

// @public
type Constructor<T> = new () => T;

// Warning: (ae-unresolved-link) The @link reference could not be resolved: This type of declaration is not supported yet by the resolver
//
// @public
interface Container {
    // (undocumented)
    bind: BindFunction;
    get: <T>(id: ServiceIdentifier<T>) => Promise<T>;
    // (undocumented)
    has: IsBoundFunction;
    // (undocumented)
    load: {
        (module: AsyncContainerModule): Promise<void>;
        (module: SyncContainerModule): void;
    };
    // (undocumented)
    rebind: RebindFunction;
    // (undocumented)
    unbind: UnbindFunction;
}

// @public
interface ContainerConfiguration {
    defaultScope: ScopeOptions;
}

// @public
type ContainerModule = AsyncContainerModule | SyncContainerModule;

// Warning: (ae-unresolved-link) The @link reference could not be resolved: This type of declaration is not supported yet by the resolver
//
// @public
export const createContainer: (config?: interfaces.ContainerConfiguration) => interfaces.Container;

// @public (undocumented)
type FixedScopeBindingOptions = 'toConstantValue';

// @public (undocumented)
export const inject: InjectDecoratorFactory;

// @public (undocumented)
export const injectable: <T>() => InjectableDecorator<T>;

// @public (undocumented)
export interface InjectableDecorator<T> {
    // (undocumented)
    (target: new () => T, context: ClassDecoratorContext<new () => T>): undefined;
    // (undocumented)
    (target: new () => T, context?: undefined): undefined | (new () => T);
}

// @public (undocumented)
export interface InjectDecorator<T> {
    // (undocumented)
    (target: undefined, context: ClassFieldDecoratorContext<unknown, T>): (originalValue: T | undefined) => T;
    // (undocumented)
    (target: {
        constructor: Function;
    }, propertyName: string | symbol): undefined;
}

// @public (undocumented)
export interface InjectDecoratorFactory {
    // (undocumented)
    <T>(token: Token<T>, options: Partial<interfaces.InjectOptions> & {
        multiple: true;
    }): InjectDecorator<T[]>;
    // (undocumented)
    <T>(token: Token<T>, options: Partial<interfaces.InjectOptions> & {
        optional: true;
    }): InjectDecorator<T | undefined>;
    // (undocumented)
    <T>(token: Token<T>, options?: Partial<interfaces.InjectOptions>): InjectDecorator<T>;
}

// @public (undocumented)
interface InjectOptions {
    // (undocumented)
    multiple: boolean;
    // (undocumented)
    optional: boolean;
}

declare namespace interfaces {
    export {
        Binder,
        FixedScopeBindingOptions,
        BindingBuilder,
        ClassBindingBuilder,
        BindingContext,
        BindingScope,
        ClassBinder,
        Constructor,
        Container,
        ContainerConfiguration,
        AsyncContainerModule,
        ContainerModule,
        SyncContainerModule,
        BindFunction,
        IsBoundFunction,
        RebindFunction,
        UnbindFunction,
        InjectOptions,
        ScopeOptions,
        ServiceIdentifier
    }
}
export { interfaces }

// @public (undocumented)
type IsBoundFunction = <T>(id: ServiceIdentifier<T>) => boolean;

// @public (undocumented)
type RebindFunction = BindFunction;

// @public (undocumented)
type ScopeOptions = 'transient' | 'request' | 'singleton';

// @public
type ServiceIdentifier<T> = (new () => T) | Token<T>;

// @public
type SyncContainerModule = (bind: BindFunction, unbind: UnbindFunction, isBound: IsBoundFunction, rebind: RebindFunction) => void;

// @public
export class Token<out T> {
    constructor(name: string);
    // @internal (undocumented)
    readonly identifier: symbol;
}

// @public
export type TokenType<T extends Token<unknown>> = T extends Token<infer U> ? U : never;

// @public (undocumented)
type UnbindFunction = <T>(id: ServiceIdentifier<T>) => void;

```