import type { Context } from '../container/Context.js';

export interface DotMetadata {
	contexts?: Context[] | undefined;
}

const metadataIndex = Symbol('@mscharley/dot/metadata');

export const addMetadataContext = (metadata: DecoratorMetadataObject, context: Context): void => {
	metadata[metadataIndex] ??= {};
	const meta = metadata[metadataIndex] as DotMetadata;
	meta.contexts ??= [];
	meta.contexts.push(context);
};

export const getMetadata = (metadata: DecoratorMetadataObject): DotMetadata => metadata[metadataIndex] ?? {};
