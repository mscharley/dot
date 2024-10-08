/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it } from '@jest/globals';
import { Container } from '../Container.js';
import type { SyncContainerModule } from '../../interfaces/ContainerModule.js';
import { Token } from '../../Token.js';
import { withOptions } from '../../decorators/withOptions.js';

describe('injectionMetadata', () => {
	it('can return metadata', () => {
		const c = new Container();
		const t = new Token<number>('test');
		const t2 = new Token<number>('test2');
		(t as any)[Symbol.for('__dot_import_stats')] = { name: 'token' };
		const module: SyncContainerModule = (bind) => {
			bind(t).inRequestScope().toDynamicValue([withOptions(t2, { multiple: true })], () => 10);
		};
		(module as any)[Symbol.for('__dot_import_stats')] = { name: 'module' };
		const module2: SyncContainerModule = (bind) => {
			bind(t2).inRequestScope().toDynamicValue([], () => 10);
		};
		(module2 as any)[Symbol.for('__dot_import_stats')] = { name: 'module2' };
		c.load(module);
		c.load(module2);

		expect(c.getInjectionMetadata([t])).toMatchObject({
			injections: [{ name: 'token' }],
			dependencies: [{ name: 'module2' }, { name: 'module' }],
		});
	});

	it('can return metadata across containers', () => {
		const c = new Container();
		const t = new Token<number>('test');
		const t2 = new Token<number>('test2');
		(t as any)[Symbol.for('__dot_import_stats')] = { name: 'token' };
		(t2 as any)[Symbol.for('__dot_import_stats')] = { name: 'token2' };
		const module2: SyncContainerModule = (bind) => {
			bind(t2).inRequestScope().toDynamicValue([], () => 10);
		};
		(module2 as any)[Symbol.for('__dot_import_stats')] = { name: 'module2' };
		c.load(module2);
		const module: SyncContainerModule = (bind) => {
			bind(t).inRequestScope().toDynamicValue([withOptions(t2, { multiple: true })], () => 10);
		};
		(module as any)[Symbol.for('__dot_import_stats')] = { name: 'module' };
		const c2 = c.createChild();
		c2.load(module);

		process.stdout.write('<<<<< HERE\n');
		expect(c2.getInjectionMetadata([t])).toMatchObject({
			injections: [{ name: 'token' }],
			dependencies: [{ name: 'module2' }, { name: 'module' }],
		});
	});

	it('throws an error if a container module is missing metadata', () => {
		const c = new Container();
		const t = new Token<number>('test');
		(t as any)[Symbol.for('__dot_import_stats')] = { name: 'token' };
		const module: SyncContainerModule = (bind) => {
			bind(t).toConstantValue(10);
		};
		c.load(module);

		expect(() => c.getInjectionMetadata([t])).toThrow('It appears you haven\'t used the custom loader.');
	});

	it('throws an error if a token is missing metadata', () => {
		const c = new Container();
		const t = new Token<number>('test');
		const module: SyncContainerModule = (bind) => {
			bind(t).toConstantValue(10);
		};
		c.load(module);
		(module as any)[Symbol.for('__dot_import_stats')] = { name: 'module' };

		expect(() => c.getInjectionMetadata([t])).toThrow('Unable to load metadata for some of your requested injections.');
	});
});
