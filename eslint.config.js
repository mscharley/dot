import { configs, disableTypeCheckedRules, withStyles } from '@mscharley/eslint-config';
import pluginDocusaurus from '@docusaurus/eslint-plugin';

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
			'docs/.docusaurus/',
			'docs/build/',
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
			'docs/**',
			'examples/**',
			'libs/*/*.config.js',
			'*.config.js',
		],
		rules: {
			'notice/notice': 'off',
		},
	},
	{
		files: [
			'docs/**',
		],
		plugins: {
			'@docusaurus': pluginDocusaurus,
		},
		rules: {
			...pluginDocusaurus.configs.recommended.rules,
			'import/no-unresolved': 'off',
		},
	},
];
