# CommonJS / TypeScript 4 example

## CommonJS notes

To use CommonJS, you will need to use `module: "commonjs"` and `moduleResolution: "node"`. For whatever reason, TypeScript can't deal with requires in exports that have both import and require available. If anyone has any better information or a way to work around this, I'd love to know more. It would be good to be able to support `Node16` module resolution and CommonJS together. DOT already supports being either required or imported from pure JavaScript projects.
