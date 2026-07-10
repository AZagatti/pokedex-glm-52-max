import { defineConfig } from 'oxlint';
import core from 'ultracite/oxlint/core';
import svelte from 'ultracite/oxlint/svelte';

export default defineConfig({
	extends: [core, svelte],
	ignorePatterns: [
		...core.ignorePatterns,
		'.agents/**',
		'build/**',
		'.svelte-kit/**',
		'docs/**',
		'*.config.*',
		'tests/**'
	],
	rules: {
		// Svelte components use PascalCase filenames (framework convention).
		'unicorn/filename-case': 'off',
		// Allow function declarations.
		'func-style': 'off',
		// Don't require sorted object keys.
		'sort-keys': 'off',
		// Allow imports after exports (SvelteKit pattern: export const prerender before imports).
		'import/first': 'off',
		// Allow empty barrel files.
		'unicorn/no-empty-file': 'off',
		// Allow async without await (common in load functions that may add awaits).
		'eslint/require-await': 'off',
		// Allow inline comments (used for JSDoc annotations).
		'eslint/no-inline-comments': 'off',
		// Allow new Promise (needed for debouncing, IntersectionObserver patterns).
		'promise/avoid-new': 'off',
		'promise/prefer-await-to-then': 'off',
		// Allow use-before-define (Svelte store pattern: function defined after export).
		'eslint/no-use-before-define': 'off',
		// Allow Promise executor param naming.
		'promise/param-names': 'off',
		// Allow non-unicode regex (simple string matching).
		'eslint/require-unicode-regexp': 'off',
		// Allow shadowing in closures.
		'eslint/no-shadow': 'off',
		// Allow resolve/reject in promise executors.
		'eslint/no-promise-executor-return': 'off',
		// Allow catch reassignment.
		'eslint/no-ex-assign': 'off',
		// Allow ternaries over if/else.
		'unicorn/prefer-ternary': 'off',
		// Allow String.replace for dynamic patterns.
		'unicorn/prefer-string-replace-all': 'off',
		// Allow non-null assertions (common in Svelte 5 props).
		'typescript/no-non-null-assertion': 'off',
		// Allow nested ternaries.
		'eslint/no-nested-ternary': 'off',
		'unicorn/no-nested-ternary': 'off',
		// Allow empty catch blocks.
		'eslint/no-empty-function': 'off',
		// Allow onclick attributes.
		'unicorn/prefer-add-event-listener': 'off',
		// Allow ++ in loops.
		'eslint/no-plusplus': 'off'
	}
});
