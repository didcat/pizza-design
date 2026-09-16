import type { Config } from 'prettier';

const config: Config = {
	printWidth: 100,
	endOfLine: 'lf',
	singleQuote: true,
	trailingComma: 'all',
	objectWrap: 'collapse',
	tabWidth: 4,
	useTabs: true,
	plugins: ['prettier-plugin-svelte'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
};

export default config;
