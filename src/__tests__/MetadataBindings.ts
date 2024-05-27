/* eslint-disable jest/no-conditional-in-test */
import type * as interfaces from '../interfaces/index.js';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { IsInterface, isString } from 'generic-type-guard';
import { MetadataToken, NamedToken, Token } from '../Token.js';
import { Container } from '../container/Container.js';
import type { GuardedType } from 'generic-type-guard';
import { injectable } from '../decorators/injectable.js';
import { named } from '../decorators/named.js';
import { withOptions } from '../decorators/withOptions.js';

const isMetadata = new IsInterface().withProperties({ name: isString, type: isString }).get();
// eslint-disable-next-line @typescript-eslint/no-type-alias
type Metadata = GuardedType<typeof isMetadata>;

describe('metadata bindings', () => {
	let c: interfaces.Container;

	describe('withMetadata', () => {
		const token = new MetadataToken<string, Metadata>('MetadataTest', isMetadata);

		beforeEach(() => {
			c = new Container({ autobindClasses: true, defaultScope: 'transient' });
			c.bind(token).withMetadata({ name: 'hello', type: 'greeter' }).toConstantValue('Hello');
			c.bind(token).withMetadata({ name: 'goodbye', type: 'greeter' }).toConstantValue('Goodbye');
		});

		it('sets metadata and filters using that metadata', async () => {
			await expect(c.get(token, { metadata: { name: 'hello' } })).resolves.toBe('Hello');
		});

		it('requires metadata for metadata tokens', async () => {
			await expect(Promise.resolve(c).then((_) => _.bind(token).toConstantValue('Hello'))).rejects.toMatchObject({
				message: 'Bindings for metadata tokens require setting metadata',
			});
		});

		it("shouldn't allow autobound classes when fetching with metadata", async () => {
			@injectable()
			class Test {}

			await expect(c.get(Test, { metadata: { name: 'foo' } })).rejects.toMatchObject({
				message: 'Unable to resolve token',
				cause: {
					message: 'No bindings exist for token: Token<Symbol(Test)>',
				},
			});
		});

		it('fetches lists based on a metadata value', async () => {
			await expect(c.get(token, { multiple: true, metadata: { type: 'greeter' } })).resolves.toStrictEqual([
				'Hello',
				'Goodbye',
			]);
		});

		it('fetches lists of all values if no metadata is provided', async () => {
			await expect(c.get(token, { multiple: true })).resolves.toStrictEqual(['Hello', 'Goodbye']);
		});

		it('fetches transitive dependencies correctly', async () => {
			@injectable(withOptions(token, { metadata: { name: 'hello' } }))
			class Test {
				public constructor(public readonly name: string) {}
			}
			c.bind(Test).toSelf();

			await expect(c.get(Test)).resolves.toMatchObject({ name: 'Hello' });
		});
	});

	describe('named', () => {
		const token = new NamedToken<string>('name');

		beforeEach(() => {
			c = new Container({ autobindClasses: true, defaultScope: 'transient' });
			c.bind(token).withMetadata({ name: 'hello' }).toConstantValue('Hello');
		});

		it('sets metadata and filters using that metadata', async () => {
			await expect(c.get(token, { metadata: { name: 'hello' } })).resolves.toBe('Hello');
		});

		it('requires metadata for metadata tokens', async () => {
			await expect(Promise.resolve(c).then((_) => _.bind(token).toConstantValue('Hello'))).rejects.toMatchObject({
				message: 'Bindings for metadata tokens require setting metadata',
			});
		});

		it('can fetch using the helper', async () => {
			@injectable(named(token, 'hello'))
			class Test {
				public constructor(public readonly name: string) {}
			}

			await expect(c.get(Test)).resolves.toMatchObject({ name: 'Hello' });
		});
	});

	describe('factories', () => {
		const token = new MetadataToken<string, Metadata>('factory', isMetadata);

		beforeEach(() => {
			c = new Container({ defaultScope: 'transient' });
		});

		it('provides metadata to the factory function', async () => {
			const factory = jest.fn(({ metadata }: interfaces.FactoryContext<Metadata>) => (): string => metadata.name ?? 'fallback');

			c.bind(token).inSingletonScope().withMetadata({ name: 'Hello', type: 'world' }).toFactory([], factory);
			await c.get(token, { metadata: { name: 'Hello' } });
			await expect(c.get(token, { metadata: { name: 'Hello' } })).resolves.toBe('Hello');
			await expect(c.get(token, { metadata: { name: 'Hello' } })).resolves.toBe('Hello');
			expect(factory).toHaveBeenCalledTimes(1);
		});

		it('allows metadata for transient bindings', async () => {
			const factory = jest.fn(({ metadata }: interfaces.FactoryContext<Metadata>) => (): string => metadata.name ?? 'fallback');

			c.bind(token).inTransientScope().withMetadata({ name: 'Hello', type: 'world' }).toFactory([], factory);
			await expect(c.get(token, { metadata: { name: 'Hello' } })).resolves.toBe('Hello');
			await expect(c.get(token, { metadata: { name: 'Goodbye' } })).rejects.toMatchObject({ message: 'Unable to resolve token' });
		});

		it("doesn't require metadata for transient bindings", async () => {
			const factory = jest.fn(({ metadata }: interfaces.FactoryContext<Metadata>) => (): string => metadata.name ?? 'fallback');

			c.bind(token).inTransientScope().toFactory([], factory);
			await expect(c.get(token, { metadata: { name: 'Hello' } })).resolves.toBe('Hello');
			await expect(c.get(token, { metadata: { name: 'Goodbye' } })).resolves.toBe('Goodbye');
		});

		it('fetches transitive dependencies correctly', async () => {
			const factory = jest.fn(({ metadata }: interfaces.FactoryContext<Metadata>) => (): string => metadata.name ?? 'fallback');

			@injectable(withOptions(token, { metadata: { name: 'Hello' } }))
			class Test {
				public constructor(public readonly name: string) {}
			}

			c.bind(token).inSingletonScope().withMetadata({ name: 'Hello', type: 'world' }).toFactory([], factory);
			c.bind(Test).toSelf();

			await expect(c.get(Test)).resolves.toMatchObject({ name: 'Hello' });
		});

		it('fetches transitive transient dependencies correctly', async () => {
			const factory = jest.fn(({ metadata }: interfaces.FactoryContext<Metadata>) => (): string => metadata.name ?? 'fallback');

			@injectable(withOptions(token, { metadata: { name: 'Hello' } }))
			class Test {
				public constructor(public readonly name: string) {}
			}

			c.bind(token).inTransientScope().toFactory([], factory);
			c.bind(Test).toSelf();

			await expect(c.get(Test)).resolves.toMatchObject({ name: 'Hello' });
		});

		describe('multiple request', () => {
			it('will not return factories with no metadata in the binding', async () => {
				const factory = jest.fn(({ metadata }: interfaces.FactoryContext<Metadata>) => (): string => metadata.name ?? 'fallback');

				c.bind(token).inTransientScope().toFactory([], factory);
				await expect(c.get(token, { multiple: true })).rejects.toMatchObject({
					message: 'Unable to resolve token',
				});
			});

			it('will return factories with metadata in the binding', async () => {
				const factory = jest.fn(({ metadata }: interfaces.FactoryContext<Metadata>) => (): string => metadata.name ?? 'fallback');

				c.bind(token).inTransientScope().withMetadata({ name: 'Hello', type: 'greeter' }).toFactory([], factory);
				await expect(c.get(token, { multiple: true })).resolves.toStrictEqual(['Hello']);
			});
		});
	});

	describe('optional metadata', () => {
		const isOptionalMetadata = new IsInterface().withOptionalProperties({ name: isString }).get();
		// eslint-disable-next-line @typescript-eslint/no-type-alias
		type OptionalMetadata = { name?: string | undefined };
		const token = new MetadataToken<string, OptionalMetadata>('optionalMetadata', isOptionalMetadata);

		beforeEach(() => {
			c = new Container({ defaultScope: 'transient' });
		});

		it('requires metadata for metadata tokens', async () => {
			await expect(Promise.resolve(c).then((_) => _.bind(token).toConstantValue('Hello'))).rejects.toMatchObject({
				message: 'Bindings for metadata tokens require setting metadata',
			});
		});

		it('will return unset metadata when requested', async () => {
			c.bind(token).withMetadata({}).toConstantValue('Hello');

			await expect(c.get(token)).resolves.toBe('Hello');
		});

		it('will filter based on explicitly undefined metadata', async () => {
			c.bind(token).withMetadata({ name: 'greeter' }).toConstantValue('Hello');
			c.bind(token).withMetadata({}).toConstantValue('Goodbye');

			await expect(c.get(token, { multiple: true })).resolves.toStrictEqual(['Hello', 'Goodbye']);
			await expect(c.get(token, { multiple: true, metadata: { name: undefined } })).resolves.toStrictEqual(['Goodbye']);
		});
	});
});
