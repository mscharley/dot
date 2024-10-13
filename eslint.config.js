import { configs, withStyles } from '@mscharley/eslint-config';

export default [
	...configs.recommended,
	...configs.node,
	...withStyles(),
	...configs.license['MPL-2.0'](),
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
	{
		files: ['*.config.js'],
		rules: {
			'notice/notice': 'off',
		},
	},
];
