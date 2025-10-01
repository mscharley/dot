/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Context } from '../container/Context.js';

export const IsInjectableSubclass = Symbol('DOT.IsInjectableSubclass');

export const MetadataContextKey = Symbol('DOT.Metadata.Context');
export const MetadataContextProcessed = Symbol('DOT.Metadata.Context.Processed');
export type Metadata = Context[] | typeof MetadataContextProcessed;

// eslint-disable-next-line @typescript-eslint/no-type-alias
type MetadataObject = Record<typeof MetadataContextKey, undefined | WeakMap<object, undefined | Metadata>>;

export const getContextsFromMetadata = (
	metadata: DecoratorMetadataObject,
	target: object,
	defaultValue: Metadata = [],
): Metadata => {
	const meta = (metadata as MetadataObject)[MetadataContextKey] ??= new WeakMap();
	if (!meta.has(target)) {
		meta.set(target, defaultValue);
		return defaultValue;
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return meta.get(target)!;
};

export const setContextsProcessed = (metadata: DecoratorMetadataObject, target: object): void => {
	const meta = (metadata as MetadataObject)[MetadataContextKey] ??= new WeakMap();
	meta.set(target, MetadataContextProcessed);
};
