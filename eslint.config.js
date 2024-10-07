import { configs, withStyles } from '@mscharley/eslint-config';

export default [
	...configs.recommended,
	...configs.node,
	...withStyles(),
	{
		ignores: [
			'dist/',
			'docs/',
			'examples/',
			'reports/',
			'dot.*',
		],
	},
	{
		files: [
			'src/models/**',
			'src/interfaces/**',
		],
		rules: {
			'@typescript-eslint/no-type-alias': 'off',
		},
	},
];
