import { configs, disableTypeCheckedRules, withStyles } from '@mscharley/eslint-config';

export default [
	...configs.recommended,
	...configs.node,
	...withStyles(),
	...configs.license['MPL-2.0'](),
	disableTypeCheckedRules('libs/*/*.config.js'),
	{
		ignores: [
			'examples/*/dist/',
			'examples/*/reports/',
			'libs/*/dist/',
			'libs/*/reports/',
			'docs/',
			'libs/dot/dot.*',
		],
	},
	{
		files: [
			'libs/dot/src/models/**',
			'libs/dot/src/interfaces/**',
		],
		rules: {
			'@typescript-eslint/no-type-alias': 'off',
		},
	},
	{
		files: [
			'examples/**',
			'libs/*/*.config.js',
			'*.config.js',
		],
		rules: {
			'notice/notice': 'off',
		},
	},
];
