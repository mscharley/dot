import type * as interfaces from '../interfaces/index.js';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { IsInterface, isString } from 'generic-type-guard';
import { MetadataToken, NamedToken } from '../Token.js';
import { Container } from '../container/Container.js';
import type { GuardedType } from 'generic-type-guard';
import { injectable } from '../decorators/injectable.js';
import { named } from '../decorators/named.js';

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
});
