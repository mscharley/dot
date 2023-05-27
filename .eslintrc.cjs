module.exports = {
	root: true,
	extends: [
		'@mscharley', // Baseline rules for any TS or JS project.
		'@mscharley/eslint-config/node', // For projects running on NodeJS.
		// '@mscharley/eslint-config/react', // For projects running React.
	],
};
