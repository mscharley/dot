## API Report File for "@mscharley/dot"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

// @public
type ArgsForInjectionIdentifiers<Tokens extends [...Array<InjectionIdentifier<unknown>>]> = {
    [Index in keyof Tokens]: InjectedType<Tokens[Index]>;
} & {
    length: Tokens['length'];
};

// @public
type AsyncContainerModule = (bind: BindFunction, unbind: UnbindFunction, isBound: IsBoundFunction, rebind: RebindFunction) => Promise<void>;

// @public
interface Binder<in out T> {
    toConstantValue: ((v: T) => void) & ((v: Promise<T>) => Promise<void>);
    toDynamicValue: <Tokens extends Array<InjectionIdentifier<unknown>>>(dependencies: [...Tokens], fn: Fn<T | Promise<T>, ArgsForInjectionIdentifiers<Tokens>>) => void;
    toFactory: <Tokens extends Array<InjectionIdentifier<unknown>>>(dependencies: [...Tokens], fn: (context: FactoryContext) => Fn<T | Promise<T>, ArgsForInjectionIdentifiers<Tokens>>) => void;
}

// @public
type BindFunction = {
    <T extends object>(id: Constructor<T, any>): ClassBindingBuilder<T>;
    <T extends object>(id: Exclude<ServiceIdentifier<T>, Constructor<T, any>>): ObjectBindingBuilder<T>;
    <T>(id: ServiceIdentifier<T>): BindingBuilder<T>;
};

// @public
interface BindingBuilder<in out T> extends Binder<T>, BindingScope<T, BindingBuilder<T>> {
}

// @public
interface BindingScope<in T, out Builder> {
    // (undocumented)
    inRequestScope: () => Omit<Builder, ImplicitScopeBindingOptions | keyof BindingScope<T, unknown>>;
    // (undocumented)
    inSingletonScope: () => Omit<Builder, ImplicitScopeBindingOptions | keyof BindingScope<T, unknown>>;
    // (undocumented)
    inTransientScope: () => Omit<Builder, ImplicitScopeBindingOptions | keyof BindingScope<T, unknown>>;
}

// @public
interface ClassBinder<in T> {
    toSelf: () => void;
}

// @public
interface ClassBindingBuilder<in out T extends object> extends Binder<T>, BindingScope<T, ClassBindingBuilder<T>>, ObjectBinder<T>, ClassBinder<T> {
}

// @public
type Constructor<out T, in Args extends unknown[] = any> = new (...args: Args) => T;

// Warning: (ae-unresolved-link) The @link reference could not be resolved: This type of declaration is not supported yet by the resolver
//
// @public
interface Container {
    // Warning: (ae-unresolved-inheritdoc-reference) The @inheritDoc reference could not be resolved: This type of declaration is not supported yet by the resolver
    //
    // (undocumented)
    bind: BindFunction;
    readonly config: ContainerConfiguration;
    createChild: ContainerFactory;
    get: {
        <T>(id: ServiceIdentifier<T>, options: Partial<InjectOptions> & {
            multiple: true;
        }): Promise<T[]>;
        <T>(id: ServiceIdentifier<T>, options: Partial<InjectOptions> & {
            optional: true;
        }): Promise<T | undefined>;
        <T>(id: ServiceIdentifier<T>, options?: Partial<InjectOptions>): Promise<T>;
    };
    // Warning: (ae-unresolved-inheritdoc-reference) The @inheritDoc reference could not be resolved: This type of declaration is not supported yet by the resolver
    //
    // (undocumented)
    has: IsBoundFunction;
    load: <M extends ContainerModule>(module: M) => ReturnType<M>;
    // Warning: (ae-unresolved-inheritdoc-reference) The @inheritDoc reference could not be resolved: This type of declaration is not supported yet by the resolver
    //
    // (undocumented)
    rebind: RebindFunction;
    // Warning: (ae-unresolved-inheritdoc-reference) The @inheritDoc reference could not be resolved: This type of declaration is not supported yet by the resolver
    //
    // (undocumented)
    unbind: UnbindFunction;
    validate: () => void;
}

// @public
interface ContainerConfiguration {
    readonly autobindClasses: boolean;
    readonly defaultScope: ScopeOptions;
    readonly logger: Logger;
    readonly logLevel: LoggerLevel;
    // @internal
    readonly parent?: Container;
}

// @public
type ContainerFactory = (options?: Partial<ContainerConfiguration>) => Container;

// @public
type ContainerModule = AsyncContainerModule | SyncContainerModule;

// Warning: (ae-unresolved-link) The @link reference could not be resolved: This type of declaration is not supported yet by the resolver
//
// @public
export const createContainer: interfaces.ContainerFactory;

// @public
type DirectInjection<T> = {
    token: Token<T>;
    generator: () => T;
};

// @public
export type ErrorCode = 'RECURSIVE_RESOLUTION' | 'TOKEN_RESOLUTION' | 'INVALID_OPERATION';

// @public
interface FactoryContext {
    container: Pick<Container, 'createChild' | 'config'>;
}

// @public
type Fn<out T, in Args extends unknown[] = any> = (...args: Args) => T;

// Warning: (ae-unresolved-link) The @link reference could not be resolved: This type of declaration is not supported yet by the resolver
//
// @public
type ImplicitScopeBindingOptions = 'toConstantValue';

// @public
export const inject: InjectDecoratorFactory;

// @public
export const injectable: <Tokens extends interfaces.InjectionIdentifier<unknown>[]>(...constructorTokens: Tokens) => InjectableDecorator<interfaces.ArgsForInjectionIdentifiers<Tokens>>;

// @public
export interface InjectableDecorator<Args extends unknown[]> {
    // (undocumented)
    <T extends object>(target: interfaces.Constructor<T, Args>, context: ClassDecoratorContext<interfaces.Constructor<T, Args>>): undefined;
    // (undocumented)
    <T extends interfaces.Constructor<object, Args>>(target: T, context?: undefined): T;
}

// @public
export interface InjectDecorator<T> {
    // (undocumented)
    (target: undefined, context: ClassFieldDecoratorContext<unknown, T>): (originalValue: T | undefined) => T;
    // (undocumented)
    (target: object, propertyName: string | symbol): undefined;
}

// @public
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

// Warning: (ae-unresolved-link) The @link reference could not be resolved: This type of declaration is not supported yet by the resolver
//
// @public
type InjectedType<T extends InjectionIdentifier<unknown>> = T extends [
ServiceIdentifier<infer U>,
    {
    multiple: true;
}
] ? U[] : T extends [ServiceIdentifier<infer U>, {
    optional: true;
}] ? U | undefined : T extends [ServiceIdentifier<infer U>, object] ? U : T extends ServiceIdentifier<infer U> ? U : T extends DirectInjection<infer U> ? U : never;

// @public
type InjectionIdentifier<T> = ServiceIdentifier<T> | [ServiceIdentifier<T>, Partial<InjectOptions>] | DirectInjection<T>;

// @public
interface InjectOptions {
    multiple: boolean;
    optional: boolean;
}

declare namespace interfaces {
    export {
        Binder,
        ImplicitScopeBindingOptions,
        BindingBuilder,
        ClassBindingBuilder,
        ObjectBindingBuilder,
        BindingScope,
        ClassBinder,
        Container,
        ContainerConfiguration,
        ContainerFactory,
        AsyncContainerModule,
        ContainerModule,
        SyncContainerModule,
        DirectInjection,
        FactoryContext,
        Constructor,
        Fn,
        BindFunction,
        IsBoundFunction,
        RebindFunction,
        UnbindFunction,
        ArgsForInjectionIdentifiers,
        InjectedType,
        InjectionIdentifier,
        InjectOptions,
        Logger,
        LoggerFn,
        LoggerLevel,
        ObjectBinder,
        ScopeOptions,
        ServiceIdentifier
    }
}
export { interfaces }

// @public
export class InvalidOperationError extends IocError {
    constructor(msg: string, originalError?: Error);
}

// @public
export abstract class IocError extends Error {
    constructor(msg: string, code: ErrorCode, originalError?: Error);
    readonly cause?: Error;
    readonly code: ErrorCode;
}

// @public
type IsBoundFunction = <T>(id: ServiceIdentifier<T>) => boolean;

// @public
type Logger = Record<LoggerLevel, LoggerFn>;

// @public
type LoggerFn = {
    (obj: Record<string, unknown>, message?: string): void;
    (message: string): void;
};

// @public
type LoggerLevel = 'warn' | 'info' | 'debug' | 'trace';

// @public
interface ObjectBinder<in out T extends object> {
    to: (fn: Constructor<T>) => void;
}

// @public
interface ObjectBindingBuilder<in out T extends object> extends Binder<T>, BindingScope<T, ObjectBindingBuilder<T>>, ObjectBinder<T> {
}

// @public
type RebindFunction = BindFunction;

// @public
export class RecursiveResolutionError extends ResolutionError {
    constructor(msg: string, resolutionPath: Array<Token<unknown>>);
}

// @public
export abstract class ResolutionError extends IocError {
    constructor(msg: string, code: ErrorCode, resolutionPath: Array<Token<unknown>>, originalError?: Error);
    readonly resolutionPath: Array<Token<unknown>>;
}

// Warning: (ae-unresolved-link) The @link reference could not be resolved: This type of declaration is not supported yet by the resolver
//
// @public
type ScopeOptions = 'transient' | 'request' | 'singleton';

// @public
type ServiceIdentifier<T> = Token<T> | Constructor<T>;

// @public
export const stringifyIdentifier: <T>(id: interfaces.ServiceIdentifier<T>) => string;

// @public
type SyncContainerModule = (bind: BindFunction, unbind: UnbindFunction, isBound: IsBoundFunction, rebind: RebindFunction) => void;

// @public
export class Token<out T> {
    constructor(name: string);
    readonly identifier: symbol;
}

// @public
export class TokenResolutionError extends ResolutionError {
    constructor(msg: string, resolutionPath: Array<Token<unknown>>, originalError: Error);
    readonly cause: Error;
}

// @public
export type TokenType<T extends Token<unknown>> = T extends Token<infer U> ? U : never;

// @public
type UnbindFunction = <T>(id: ServiceIdentifier<T>) => void;

// @public
export const unmanaged: <T>(defaultValue: T, name?: string) => interfaces.DirectInjection<T>;

// @public
export const withOptions: <T, Options extends Partial<interfaces.InjectOptions>>(id: interfaces.ServiceIdentifier<T>, options: Options) => [interfaces.ServiceIdentifier<T>, Options];

```