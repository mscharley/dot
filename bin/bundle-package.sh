#/usr/bin/env bash

COMMON_ESBUILD=(--packages=external --external:./globals.js --sourcemap=linked)
PS4='> '
set -x

# Bundle into an ESM and CommonJS entrypoint with a shared CommonJS implementation
esbuild dist/globals.js --bundle --sourcemap=linked --outfile=globals.cjs --platform=node --packages=external
esbuild dist/index.js --bundle --outfile=dot.js --platform=neutral "${COMMON_ESBUILD[@]}"
esbuild dist/index.js --bundle --outfile=dot.cjs --platform=node "${COMMON_ESBUILD[@]}"
# Fix the reference to the implementation file
sed -i 's@./globals.js@./globals.cjs@g' dot.js dot.cjs

# Prepare a version compatible with TypeScript v4
grep -v 'DecoratorContext' dot.d.ts > dot.v4.d.ts

# Create separate copies of the type information for the CommonJS imports to satisfy TypeScript
cp dot.d.ts dot.d.cts
cp dot.v4.d.ts dot.v4.d.cts
