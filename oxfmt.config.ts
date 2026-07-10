import { defineConfig } from 'oxfmt';
import ultracite from 'ultracite/oxfmt';

export default defineConfig({
	...ultracite,
	ignorePatterns: [
		'.agents/**',
		'build/**',
		'.svelte-kit/**',
		'node_modules/**'
	]
});
