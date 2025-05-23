/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable no-console */
/* eslint-disable n/no-unpublished-import */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { AssignmentProperty, ModuleDeclaration, Statement, VariableDeclarator } from 'acorn';
import type { ContainerModuleMeta } from '../interfaces/ContainerModule.js';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let Parser: typeof import('acorn').Parser | undefined;
try {
	Parser = (await import('acorn')).Parser;
/* c8 ignore next 3 */
} catch (_e) {
	console.error('ERROR: Unable to use the dot loader without installing the acorn library, it is not installed automatically. Running `npm i acorn` will resolve this issue.');
}

// TODO: TypeScript itself doesn't seem to provide typing for these things, but ts-node has some types that may be worth investigating.
// https://github.com/TypeStrong/ts-node/blob/main/src/esm.ts

// export async function resolve(specifier: string, context: any, next: (specifier: string, context: any) => Promise<any>): Promise<any> {
// 	return next(specifier, context);
// }

const generateMetadataAssignment = (meta: ContainerModuleMeta): string =>
	`if (${meta.name} != null && ['function', 'object'].includes(typeof ${meta.name})) ${meta.name}[Symbol.for('__dot_import_stats')] = ${JSON.stringify(meta)};`;

const variableDeclaratorEntries = (url: string) => (d: VariableDeclarator): ContainerModuleMeta[] => {
	switch (d.id.type) {
		case 'Identifier':
			return [{ url, name: d.id.name }];

		case 'ObjectPattern':
			return d.id.properties
				.filter((prop): prop is AssignmentProperty => prop.type === 'Property')
				.flatMap((prop) => prop.value.type === 'Identifier' ? [{ url, name: prop.value.name }] : []);

		case 'ArrayPattern':
			return d.id.elements
				.flatMap((prop) => (prop != null && prop.type === 'Identifier') ? [{ url, name: prop.name }] : []);

		case 'RestElement':
		case 'MemberExpression':
		case 'AssignmentPattern':
		default:
			console.warn(url, 'Unknown variable declaration in named export:', JSON.stringify(d, undefined, 2));
			return [];
	}
};

// eslint-disable-next-line complexity
const exportEntries = (url: string) => (node: Statement | ModuleDeclaration): ContainerModuleMeta[] => {
	switch (node.type) {
		case 'ExportNamedDeclaration':
			switch (node.declaration?.type) {
				case 'FunctionDeclaration':
					return [{ url, name: node.declaration.id.name }];

				case 'VariableDeclaration':
					return node.declaration.declarations.flatMap(variableDeclaratorEntries(url));

				case 'ClassDeclaration':
					return [{ url, name: node.declaration.id.name }];

				/* c8 ignore next */ case undefined:
				/* c8 ignore next */ default:
					return [];
			}

		case 'ExportDefaultDeclaration':
			switch (node.declaration.type) {
				case 'Identifier':
					return [{ url, name: node.declaration.name }];

				case 'FunctionDeclaration':
					if (node.declaration.id == null) {
						return [];
					} else {
						return [{ url, name: node.declaration.id.name }];
					}

				case 'Literal':
				case 'TemplateLiteral':
				case 'ObjectExpression':
				case 'ArrayExpression':
				case 'FunctionExpression':
					return [];

				/* c8 ignore next */ case 'MemberExpression':
				/* c8 ignore next */ case 'MetaProperty':
				/* c8 ignore next */ case 'NewExpression':
				/* c8 ignore next */ case 'ThisExpression':
				/* c8 ignore next */ case 'CallExpression':
				/* c8 ignore next */ case 'UnaryExpression':
				/* c8 ignore next */ case 'YieldExpression':
				/* c8 ignore next */ case 'ClassExpression':
				/* c8 ignore next */ case 'AwaitExpression':
				/* c8 ignore next */ case 'ChainExpression':
				/* c8 ignore next */ case 'ClassDeclaration':
				/* c8 ignore next */ case 'UpdateExpression':
				/* c8 ignore next */ case 'BinaryExpression':
				/* c8 ignore next */ case 'ImportExpression':
				/* c8 ignore next */ case 'LogicalExpression':
				/* c8 ignore next */ case 'SequenceExpression':
				/* c8 ignore next */ case 'AssignmentExpression':
				/* c8 ignore next */ case 'ConditionalExpression':
				/* c8 ignore next */ case 'ArrowFunctionExpression':
				/* c8 ignore next */ case 'ParenthesizedExpression':
				/* c8 ignore next */ case 'TaggedTemplateExpression':
				default:
					console.warn(url, 'Unknown default declaration type:', JSON.stringify(node, undefined, 2));
					return [];
			}

		/* c8 ignore next */ case 'ClassDeclaration':
		/* c8 ignore next */ case 'ExportAllDeclaration':
		/* c8 ignore next */ case 'IfStatement':
		/* c8 ignore next */ case 'TryStatement':
		/* c8 ignore next */ case 'ForStatement':
		/* c8 ignore next */ case 'WithStatement':
		/* c8 ignore next */ case 'BlockStatement':
		/* c8 ignore next */ case 'EmptyStatement':
		/* c8 ignore next */ case 'BreakStatement':
		/* c8 ignore next */ case 'ThrowStatement':
		/* c8 ignore next */ case 'WhileStatement':
		/* c8 ignore next */ case 'ForInStatement':
		/* c8 ignore next */ case 'ForOfStatement':
		/* c8 ignore next */ case 'ReturnStatement':
		/* c8 ignore next */ case 'SwitchStatement':
		/* c8 ignore next */ case 'LabeledStatement':
		/* c8 ignore next */ case 'DoWhileStatement':
		/* c8 ignore next */ case 'DebuggerStatement':
		/* c8 ignore next */ case 'ContinueStatement':
		/* c8 ignore next */ case 'ImportDeclaration':
		/* c8 ignore next */ case 'ExpressionStatement':
		/* c8 ignore next */ case 'FunctionDeclaration':
		/* c8 ignore next */ case 'VariableDeclaration':
		default:
			return [];
	}
};

export interface LoadContext {
	format: string;
}

export interface LoadResult {
	source: Buffer;
}

export async function load(
	url: string,
	context: LoadContext,
	next: (url: string, context: LoadContext) => Promise<LoadResult>,
): Promise<LoadResult> {
	const result = await next(url, context);
	if (Parser == null || context.format !== 'module') {
		return result;
	}

	const parsed = Parser.parse(result.source.toString('utf8'), {
		sourceType: 'module',
		ecmaVersion: 'latest',
	});

	const exports = parsed.body.flatMap(exportEntries(url)).map(generateMetadataAssignment);

	const source = Buffer.concat([
		result.source,
		Buffer.from('\n'),
		Buffer.from(exports.join('\n'), 'utf8'),
	]);
	return {
		...result,
		source,
	};
}
