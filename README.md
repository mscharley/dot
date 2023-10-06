# DOT: The Depend-o-tron

[![npm](https://img.shields.io/npm/v/@mscharley/dot.svg)](https://www.npmjs.com/package/@mscharley/dot)

**Source:** [https://github.com/mscharley/dot](https://github.com/mscharley/dot)  
**Author:** Matthew Scharley  
**Contributors:** [See contributors on GitHub][gh-contrib]  
**Bugs/Support:** [Github Issues][gh-issues]  
**License:** [MIT license][license]  
**Status:** Active

## Synopsis

A small, well-tested IOC framework for TypeScript and JavaScript with a focus on type safety and forward compatibility.

Support for TC39 standard decorators for use with both TypeScript and JavaScript as well as TypeScript's experimental decorators for projects who still use them.

[Read more about our goals here.](https://github.com/mscharley/dot/discussions/39)

## Installation

    npm i --save @mscharley/dot

This library should work out of the box with any TypeScript configuration if you are using TypeScript 5.0 or later. Read below for other versions.

### TypeScript support

This library is designed to work with either setting of the `experimentalDecorators` option in TypeScript 5.x or later. In TypeScript 4.x and earlier, you will need to enable experimental decorators as that is the only option for decorator support. In either case, the `emitDecoratorMetadata` is not required, and is not used for any functionality if enabled.

### JavaScript support

JavaScript should work out of the box with any JavaScript transpiler that supports TC39 decorators. For now you will need a transpiler until the standard gets implemented more widely.

Known implementations:

- [Babel](https://babeljs.io/docs/babel-plugin-proposal-decorators)

## Usage

[For usage examples, please see the documentation.](https://mscharley.github.io/dot/dot.html#example)

## Inspiration

The API design of this project is heavily inspired by InversifyJS.

[gh-contrib]: https://github.com/mscharley/dot/graphs/contributors
[gh-issues]: https://github.com/mscharley/dot/issues
[license]: https://github.com/mscharley/dot/blob/master/LICENSE
