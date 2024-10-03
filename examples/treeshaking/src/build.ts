import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { interfaces } from '@mscharley/dot';
import { mkdirp } from 'fs-extra/esm';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { register } from 'node:module';
import { rollup } from 'rollup';
import { writeFile } from 'node:fs/promises';

await mkdirp('./dist/opt');

// Load the application.
register('@mscharley/dot/loader', pathToFileURL('./'));
const { generateContainer, main } = await import('./index.js');

const c = await generateContainer();
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
const deps = main.dependencies.map((d): interfaces.ContainerModuleMeta => (d as any)[Symbol.for('__dot_import_stats')]);
const modules = c.getRequiredContainerModules(main.dependencies);

const optimisedOutputFile = './dist/opt/index.js';
await writeFile(optimisedOutputFile, `import { createContainer } from "@mscharley/dot";

${modules.map(({ name, url }) => `import { ${name} } from "${relative(dirname(optimisedOutputFile), fileURLToPath(url))}";`).join('\n')}
${deps.map(({ name, url }) => `import { ${name} } from "${relative(dirname(optimisedOutputFile), fileURLToPath(url))}";`).join('\n')}

console.log("Code loaded.");

export const main = async () => {
    const c = createContainer();
${modules.map(({ name }) => `    await c.load(${name});`).join('\n')}

    const args = await Promise.all([${deps.map(({ name }) => `c.get(${name})`).join('\n')}]);

    (${main.handler.toString()})(...args);
};
`);

async function rollupOutput(input: string, outputDir: string): Promise<void> {
	const bundle = await rollup({
		treeshake: true,
		input,
		plugins: [nodeResolve({
			exportConditions: ['node'],
		})],
	});

	await mkdirp(outputDir);
	const { output } = await bundle.generate({
		dir: outputDir,
		format: 'esm',
	});

	for (const chunk of output) {
		if (chunk.type === 'asset') {
			// eslint-disable-next-line no-await-in-loop
			await writeFile(join(outputDir, chunk.fileName), chunk.source);
		} else {
			// eslint-disable-next-line no-await-in-loop
			await writeFile(join(outputDir, chunk.fileName), chunk.code);
		}
	}

	await bundle.close();
}

await rollupOutput('dist/index.js', 'dist/bundled');
await rollupOutput('dist/opt/index.js', 'dist/bundled.opt');
