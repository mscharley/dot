# @mscharley/dot

## 2.1.1

### Patch Changes

- 8674207: fix(deps): update dependency typescript to v5.7.2

## 2.1.0

### Minor Changes

- a9bbf68: Remove some extraneous peer dependencies

## 2.0.2

### Patch Changes

- 44bd077: Attempt to fix the release tags

## 2.0.1

### Patch Changes

- 39fcd74: Remove support for CommonJS
- 39fcd74: Remove support for TypeScript 4.x
- 75f9a98: Beta support for treeshaking containers.

  This isn't a breaking change for existing code.

## 2.0.0

### Major Changes

- 3e3cf60: Remove support for node 16.x
- d7cb139: Changed license from MIT to MPL-2.0

### Patch Changes

- 233c01e: fix(deps): update dependency typescript to v5.5.2
- c56d8f5: fix(deps): update dependency typescript to v5.6.2

## 1.6.1

### Patch Changes

- b9351f3: Fix a race condition with caching and concurrent requests to the container
- e22307b: Fix a bug relating to creating dependencies for factories

## 1.6.0

### Minor Changes

- 204d484: Add support for metadata in bindings and injections

### Patch Changes

- 8d73334: fix(deps): update dependency typescript to v5.4.2

## 1.5.3

### Patch Changes

- 8a6060b: Allows Tokens to be logged better by supporting serialisation to JSON

## 1.5.2

### Patch Changes

- 0ced86d: Fix a bug around how autobound classes are scoped

## 1.5.1

### Patch Changes

- 8fe2687: Allow for not validating autobindings as it can be troublesome in some situations

## 1.5.0

### Minor Changes

- 7f90cd4: Validating a container will check autobound classes

## 1.4.12

### Patch Changes

- 7dfbdc9: fix(deps): update dependency typescript to v5.3.2
- e0bce28: Fix an issue with injecting optional dependencies from child containers

## 1.4.11

### Patch Changes

- 383e72e: instanceof is unreliable in mixed cjs/esm environments

## 1.4.10

### Patch Changes

- 2cde33e: Fix an issue with tokens in mixed CJS/ESM environments

## 1.4.9

### Patch Changes

- dce0234: Fix CommonJS imports in node16 resolution mode
- 1247f6c: Fix a bug with mixed CommonJS/ESM projects
- 98519b9: Fix reporting of class names again

## 1.4.8

### Patch Changes

- 9057001: Deploy with provenance enabled again

## 1.4.7

### Patch Changes

- a2c07fe: Use changesets to manage releases
