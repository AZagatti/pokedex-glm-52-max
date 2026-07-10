<script lang="ts">
	/**
	 * Berries list page — grid of berry cards.
	 */

	import type { PageData } from './$types';
	import { base } from '$app/paths';
	import { fly, fade } from 'svelte/transition';
	import { formatBerryName, berrySpriteUrl } from '$lib/api/pokeapi';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';

	const { data }: { data: PageData } = $props();

	// Berry names sorted alphabetically for display.
	const sortedBerries = $derived(
		[...data.berries].toSorted((a, b) => a.name.localeCompare(b.name))
	);

	let search = $state('');
	const filtered = $derived(
		sortedBerries.filter((b) => b.name.includes(search.toLowerCase()))
	);
</script>

<svelte:head>
	<title>Berries — Pokédex</title>
	<meta name="description" content="Browse all berries — firmness, flavors, growth time, and size." />
</svelte:head>

<div class="berries-page">
	<div class="page-header" in:fade={{ duration: 200 }}>
		<h1>Berries</h1>
		<p class="page-subtitle">Explore all {data.totalCount} berries from the Pokémon world.</p>
	</div>

	<input
		type="search"
		class="berry-search"
		placeholder="Search berries…"
		aria-label="Search berries"
		bind:value={search}
	/>

	<div
		class="grid grid-cols-2 gap-3 py-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
	>
		{#each filtered as berry, i (berry.name)}
			<a
				href="{base}/berries/{berry.name}"
				class="card berry-card"
				in:fly={{ y: 12, duration: 250, delay: Math.min(i * 20, 400) }}
			>
				<div class="berry-sprite">
					<PokemonImage
						src={berrySpriteUrl(i + 1)}
						alt={formatBerryName(berry.name)}
						size="md"
					/>
				</div>
				<p class="berry-name">{formatBerryName(berry.name)}</p>
			</a>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="empty-state">
			<p>No berries found matching "{search}".</p>
		</div>
	{/if}
</div>

<style>
	.page-header {
		margin-bottom: 1rem;
	}

	.page-header h1 {
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 800;
	}

	.page-subtitle {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.berry-search {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border-radius: 10px;
		background: var(--surface);
		box-shadow: var(--ring);
		color: var(--text);
	}

	.berry-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem 1rem;
		transition:
			transform 200ms var(--ease-out-quart),
			box-shadow 200ms var(--ease-out-quart);
	}

	@media (hover: hover) and (pointer: fine) {
		.berry-card:hover {
			transform: translateY(-3px);
			box-shadow: var(--shadow-lg);
		}
	}

	.berry-sprite {
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
	}

	.berry-name {
		font-size: 0.85rem;
		font-weight: 600;
		text-align: center;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: var(--text-muted);
	}
</style>
