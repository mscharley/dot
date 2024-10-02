import type { interfaces } from '@mscharley/dot';
import { mkdirp } from 'fs-extra/esm';
import { pathToFileURL } from 'node:url';
import { register } from 'node:module';
import { writeFile } from 'node:fs/promises';

await mkdirp('./dist/opt');

// Load the application.
register('@mscharley/dot/loader', pathToFileURL('./'));
const { generateContainer, main } = await import('./index.js');

const c = await generateContainer();
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
const deps = main.dependencies.map((d): interfaces.ContainerModuleMeta => (d as any)[Symbol.for('__dot_import_stats')]);
const modules = c.getRequiredContainerModules(main.dependencies);

await writeFile('./dist/opt/index.js', `import { createContainer } from "@mscharley/dot";
${modules.map(({ name, url }) => `import { ${name} } from "${url}";`).join('\n')}
${deps.map(({ name, url }) => `import { ${name} } from "${url}";`).join('\n')}

console.log("Code loaded.");

export const main = async () => {
    const c = createContainer();
${modules.map(({ name }) => `    await c.load(${name});`).join('\n')}

    const args = await Promise.all([${deps.map(({ name }, i) => `c.get(${name})`).join('\n')}]);

    (${main.handler.toString()})(...args);
};
`);
