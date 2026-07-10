<script lang="ts">
	/**
	 * Favorites page — grid of favorited Pokémon from localStorage.
	 * Fetches details for each favorited name (cached), with loading skeletons.
	 */

	import { favorites } from '$lib/stores/favorites';
	import { fetchPokemonDetail } from '$lib/api/pokeapi';
	import type { PokemonDetail } from '$lib/api/schemas';
	import { base } from '$app/paths';
	import { fly, fade } from 'svelte/transition';
	import Heart from 'lucide-svelte/icons/heart';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';

	let details = $state<PokemonDetail[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	// Re-fetch when favorites change.
	$effect(() => {
		const names = [...$favorites];
		loadFavorites(names);
	});

	async function loadFavorites(names: string[]) {
		if (names.length === 0) {
			details = [];
			return;
		}
		loading = true;
		error = null;
		try {
			const results = await Promise.all(
				names.map((name) => fetchPokemonDetail(name).catch(() => null))
			);
			details = results.filter((p): p is PokemonDetail => p !== null);
		} catch (error) {
			error = error instanceof Error ? error.message : 'Failed to load favorites';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Favorites — Pokédex</title>
	<meta name="description" content="Your favorited Pokémon." />
</svelte:head>

<div class="favorites-page" in:fade={{ duration: 200 }}>
	<div class="page-header">
		<h1>
			<Heart size={28} fill="var(--accent-9)" strokeWidth={0} />
			Favorites
		</h1>
		<p class="page-subtitle">
			{$favorites.length} favorited {$favorites.length === 1 ? 'Pokémon' : 'Pokémon'}
		</p>
	</div>

	{#if error}
		<div class="error-state">
			<p>Failed to load favorites: {error}</p>
		</div>
	{:else if $favorites.length === 0}
		<div class="empty-state" in:fade={{ duration: 200 }}>
			<div class="empty-icon" aria-hidden="true">💔</div>
			<h2>No favorites yet</h2>
			<p>Tap the heart on any Pokémon to add it to your favorites.</p>
			<a href={base} class="btn btn-primary">Browse Pokémon</a>
		</div>
	{:else}
		<div
			class="grid grid-cols-2 gap-3 py-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		>
			{#each details as pokemon (pokemon.name)}
				<div in:fly={{ y: 12, duration: 250 }}>
					<PokemonCard {pokemon} />
				</div>
			{/each}

			{#if loading}
				{#each Array(3) as _, i (i)}
					<SkeletonCard />
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.page-header {
		margin-bottom: 1rem;
	}

	.page-header h1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 800;
	}

	.page-subtitle {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 3rem 1rem;
		text-align: center;
	}

	.empty-state h2 {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.empty-state p {
		color: var(--text-muted);
		max-width: 320px;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.error-state {
		padding: 2rem;
		text-align: center;
		color: var(--accent-9);
	}
</style>
