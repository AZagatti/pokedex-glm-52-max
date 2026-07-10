<script lang="ts">
	/**
	 * Home page — Pokédex card grid with infinite scroll, search, and filters.
	 *
	 * Data flow:
	 * - Initial page loaded via +page.ts (SSR/prerendered) + infinite scroll for more.
	 * - Search filters the currently-loaded Pokémon client-side (fast, no extra fetches).
	 * - Type filter uses the preloaded type lists (from +page.ts) to get names → details.
	 * - Generation filter fetches the generation's Pokémon list.
	 * - Sort applies to the current display set.
	 */

	import type { PageData } from './$types';
	import { fetchPokemonPage, fetchPokemonDetail, fetchGeneration } from '$lib/api/pokeapi';
	import type { PokemonDetail, TypeResponse } from '$lib/api/schemas';
	import { GENERATION_RANGES } from '$lib/api/generations';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';
	import FilterToolbar from '$lib/components/FilterToolbar.svelte';
	import { fly, fade } from 'svelte/transition';

	const { data }: { data: PageData } = $props();

	// ---- Filter state ----
	let search = $state('');
	let selectedGen = $state<number | null>(null);
	let selectedTypes = $state<string[]>([]);
	let sortBy = $state<'id' | 'total'>('id');

	// ---- Pokémon state ----
	let allPokemon = $state<PokemonDetail[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let hasMore = $state(true);
	let sentinel = $state<HTMLElement | null>(null);

	// ---- Filtered mode (type/gen filters fetch a dedicated set) ----
	let filteredPokemon = $state<PokemonDetail[] | null>(null);
	let filteredLoading = $state(false);

	const PAGE_SIZE = 30;

	// Load initial page's details.
	$effect(() => {
		loadInitial();
	});

	async function loadInitial() {
		loading = true;
		error = null;
		try {
			allPokemon = await fetchDetails(data.firstPage.results.map((r) => r.name));
			hasMore = data.firstPage.next !== null;
		} catch (error) {
			error = error instanceof Error ? error.message : 'Failed to load Pokémon';
		} finally {
			loading = false;
		}
	}

	/** Fetch details for a list of Pokémon names (cached, parallel). */
	async function fetchDetails(names: string[]): Promise<PokemonDetail[]> {
		const results = await Promise.all(
			names.map((name) => fetchPokemonDetail(name).catch(() => null))
		);
		return results.filter((p): p is PokemonDetail => p !== null);
	}

	// ---- Infinite scroll (IntersectionObserver) ----
	$effect(() => {
		if (!sentinel) {return;}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && !loading && hasMore) {
					loadMore();
				}
			},
			{ rootMargin: '200px' }
		);
		observer.observe(sentinel);

		return () => observer.disconnect();
	});

	async function loadMore() {
		if (loading || !hasMore) {return;}
		loading = true;
		try {
			const next = await fetchPokemonPage(allPokemon.length, PAGE_SIZE);
			const details = await fetchDetails(next.results.map((r) => r.name));
			allPokemon = [...allPokemon, ...details];
			hasMore = next.next !== null;
		} catch (error) {
			error = error instanceof Error ? error.message : 'Failed to load more Pokémon';
		} finally {
			loading = false;
		}
	}

	// ---- Type filter: when types are selected, fetch their Pokémon ----
	const hasTypeFilter = $derived(selectedTypes.length > 0);
	const hasGenFilter = $derived(selectedGen !== null);
	const isFiltered = $derived(hasTypeFilter || hasGenFilter || search !== '');

	// Run type/gen fetch when those filters change.
	$effect(() => {
		if (hasTypeFilter || hasGenFilter) {
			runFilteredFetch();
		} else {
			filteredPokemon = null;
		}
	});

	async function runFilteredFetch() {
		filteredLoading = true;
		error = null;
		try {
			let names: string[] = [];

			if (hasGenFilter && selectedGen) {
				const genResp = await fetchGeneration(selectedGen);
				names = genResp.pokemon_species.map((s) => s.name);
			}

			if (hasTypeFilter) {
				// Intersect with type lists.
				const typeSets = selectedTypes.map((t) => {
					const typeData = data.types.find((tp: TypeResponse) => tp.name === t);
					return new Set(typeData?.pokemon.map((p) => p.pokemon.name));
				});
				// OR: union of all selected types' Pokémon.
				const union = new Set<string>();
				for (const set of typeSets) {
					for (const name of set) {union.add(name);}
				}
				names = names.length > 0
					? names.filter((n) => union.has(n))
					: [...union];
			}

			// Sort by dex number for consistent detail fetching.
			names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

			// Fetch details (limit to first 90 for performance — covers most use cases).
			const limited = names.slice(0, 90);
			filteredPokemon = await fetchDetails(limited);
		} catch (error) {
			error = error instanceof Error ? error.message : 'Filter failed';
		} finally {
			filteredLoading = false;
		}
	}

	function totalStats(p: PokemonDetail): number {
		return p.stats.reduce((sum, s) => sum + s.base_stat, 0);
	}

	// ---- Display data: apply search + sort to either filtered set or scroll list ----
	const displayPokemon = $derived.by(() => {
		let base: PokemonDetail[];

		if (filteredPokemon) {
			base = filteredPokemon;
		} else {
			base = allPokemon;
		}

		// Apply search filter.
		if (search) {
			const q = search.toLowerCase();
			base = base.filter((p) => p.name.includes(q));
		}

		// Sort.
		if (sortBy === 'total') {
			base = [...base].toSorted((a, b) => totalStats(b) - totalStats(a) || a.id - b.id);
		} else {
			base = [...base].toSorted((a, b) => a.id - b.id);
		}

		return base;
	});

	const isLoading = $derived(loading || filteredLoading);

	// ---- Filter handlers ----
	function handleSearch(value: string) {
		search = value;
	}
	function handleGenChange(gen: number | null) {
		selectedGen = gen;
	}
	function handleTypeToggle(type: string) {
		if (selectedTypes.includes(type)) {
			selectedTypes = selectedTypes.filter((t) => t !== type);
		} else {
			selectedTypes = [...selectedTypes, type];
		}
	}
	function handleSortChange(sort: 'id' | 'total') {
		sortBy = sort;
	}
	function handleClear() {
		search = '';
		selectedGen = null;
		selectedTypes = [];
		sortBy = 'id';
		filteredPokemon = null;
	}
</script>

<svelte:head>
	<title>Pokédex — Explore Every Pokémon</title>
	<meta
		name="description"
		content="Browse, search, and filter all 1000+ Pokémon. Filter by type and generation, sort by stats, and build your favorites."
	/>
</svelte:head>

<FilterToolbar
	{search}
	{selectedGen}
	{selectedTypes}
	{sortBy}
	totalResults={displayPokemon.length}
	onSearch={handleSearch}
	onGenChange={handleGenChange}
	onTypeToggle={handleTypeToggle}
	onSortChange={handleSortChange}
	onClear={handleClear}
/>

{#if error}
	<div class="error-state" in:fade={{ duration: 200 }}>
		<p>Something went wrong</p>
		<p class="error-detail">{error}</p>
		<button type="button" class="btn btn-primary" onclick={() => location.reload()}>
			Try again
		</button>
	</div>
{:else}
	<div
		class="grid grid-cols-2 gap-3 py-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
	>
		{#each displayPokemon as pokemon (pokemon.id)}
			<div in:fly={{ y: 12, duration: 250 }}>
				<PokemonCard {pokemon} />
			</div>
		{/each}

		{#if isLoading}
			{#each Array(6) as _, i (i)}
				<SkeletonCard />
			{/each}
		{/if}
	</div>

	<!-- Empty state -->
	{#if !isLoading && displayPokemon.length === 0}
		<div class="empty-state" in:fade={{ duration: 200 }}>
			<div class="empty-icon" aria-hidden="true">🔍</div>
			<h2>No Pokémon found</h2>
			<p>Try adjusting your search or filters.</p>
			<button type="button" class="btn btn-primary" onclick={handleClear}>
				Clear filters
			</button>
		</div>
	{/if}

	<!-- Infinite scroll sentinel (only in unfiltered browse mode) -->
	{#if !isFiltered && hasMore}
		<div bind:this={sentinel} class="h-4 w-full" aria-hidden="true"></div>
	{/if}

	<!-- End of list -->
	{#if !hasMore && !isFiltered && displayPokemon.length > 0}
		<p class="end-text">You've caught 'em all! 🎉</p>
	{/if}
{/if}

<style>
	.error-state,
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

	.error-state p,
	.empty-state p {
		color: var(--text-muted);
	}

	.error-detail {
		font-family: monospace;
		font-size: 0.8rem;
		background: var(--bg-subtle);
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.end-text {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	.btn {
		margin-top: 0.5rem;
	}
</style>
