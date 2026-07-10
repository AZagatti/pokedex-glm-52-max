<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';

	const { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
	<a
		href="#main-content"
		class="skip-link"
	>Skip to content</a
	>
	<Header />
	<main id="main-content" class="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
		{@render children?.()}
	</main>
	<footer class="border-t" style="border-color: var(--border);">
		<div class="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-center">
			<p class="text-sm" style="color: var(--text-muted);">
				Data from
				<a
					href="https://pokeapi.co"
					class="font-semibold underline-offset-2 hover:underline"
					style="color: var(--accent-9);">PokeAPI</a
				>. Built with SvelteKit + Tailwind CSS.
			</p>
			<p class="text-xs" style="color: var(--text-muted);">
				Pokémon and Pokémon character names are trademarks of Nintendo.
			</p>
		</div>
	</footer>
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	/* Skip link — visible only when focused (emil: keyboard nav) */
	.skip-link {
		position: absolute;
		top: -100px;
		left: 1rem;
		z-index: 999;
		padding: 0.75rem 1.25rem;
		border-radius: 10px;
		background: var(--accent-9);
		color: white;
		font-weight: 600;
		font-size: 0.875rem;
		transition: top 150ms var(--ease-out);
	}

	.skip-link:focus {
		top: 1rem;
	}

	/* Skip link for keyboard user */
	@media (prefers-reduced-motion: no-preference) {
		main {
			view-transition-name: main-content;
		}
	}
</style>
