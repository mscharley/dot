import type * as interfaces from '../interfaces/index.js';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { IsInterface, isString } from 'generic-type-guard';
import { Container } from '../container/Container.js';
import type { GuardedType } from 'generic-type-guard';
import { MetadataToken } from '../Token.js';
import { withOptions } from '../decorators/withOptions.js';

const isMetadata = new IsInterface().withProperties({ name: isString, type: isString }).get();
const token = new MetadataToken<string, GuardedType<typeof isMetadata>>('MetadataTest', isMetadata);

describe('metadataBindings', () => {
	let c: interfaces.Container;

	beforeEach(async () => {
		c = new Container({ defaultScope: 'transient' });
		c.bind(token).withMetadata({ name: 'hello', type: 'greeter' }).toConstantValue('Hello');
		c.bind(token).withMetadata({ name: 'goodbye', type: 'greeter' }).toConstantValue('Goodbye');
	});

	it('supports setting metadata and filtering using that metadata', async () => {
		await expect(c.get(withOptions(token, { metadata: { name: 'hello' } }))).resolves.toBe('Hello');
	});
});
