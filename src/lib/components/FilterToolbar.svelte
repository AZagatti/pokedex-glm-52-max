<script lang="ts">
	/**
	 * FilterToolbar — sticky toolbar with search, generation filter, type filter,
	 * sort, and clear controls. Emits filter changes via a callback.
	 */

	import Search from 'lucide-svelte/icons/search';
	import X from 'lucide-svelte/icons/x';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import ArrowDownUp from 'lucide-svelte/icons/arrow-down-up';
	import { ALL_TYPES, getTypeInfo } from '$lib/api/types';
	import { generations, GENERATION_LABELS } from '$lib/api/generations';

	interface Props {
		search: string;
		selectedGen: number | null;
		selectedTypes: string[];
		sortBy: 'id' | 'total';
		totalResults: number;
		onSearch: (value: string) => void;
		onGenChange: (gen: number | null) => void;
		onTypeToggle: (type: string) => void;
		onSortChange: (sort: 'id' | 'total') => void;
		onClear: () => void;
	}

	const {
		search,
		selectedGen,
		selectedTypes,
		sortBy,
		totalResults,
		onSearch,
		onGenChange,
		onTypeToggle,
		onSortChange,
		onClear
	}: Props = $props();

	// Local copy of search input; the effect below syncs external → local on resets.
	let localSearch = $state(search);

	// Sync external → local when parent resets (e.g., clear).
	$effect(() => {
		localSearch = search;
	});

	// Debounce search by 250ms (spec requirement).
	let debounceTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		const value = localSearch;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (value !== search) {onSearch(value);}
		}, 250);
	});

	const hasFilters = $derived(
		search !== '' || selectedGen !== null || selectedTypes.length > 0 || sortBy !== 'id'
	);
</script>

<div
	class="toolbar"
	style="position: sticky; top: 64px; z-index: 50; background: color-mix(in srgb, var(--surface) 90%, transparent); backdrop-filter: blur(12px);"
>
	<div class="toolbar-inner mx-auto max-w-7xl px-4 py-3">
		<!-- Search row -->
		<div class="search-wrapper">
			<Search size={18} class="search-icon" aria-hidden="true" />
			<input
				type="search"
				class="search-input"
				placeholder="Search Pokémon by name…"
				aria-label="Search Pokémon by name"
				spellcheck="false"
				autocomplete="off"
				bind:value={localSearch}
			/>
			{#if localSearch}
				<button
					type="button"
					class="icon-btn clear-btn"
					aria-label="Clear search"
					onclick={() => (localSearch = '')}
				>
					<X size={16} />
				</button>
			{/if}
		</div>

		<!-- Filters row -->
		<div class="filters-row">
			<!-- Generation filter -->
			<div class="select-wrapper">
				<label for="gen-filter" class="sr-only">Filter by generation</label>
				<select
					id="gen-filter"
					class="select"
					value={selectedGen ?? ''}
					onchange={(e) => onGenChange(e.currentTarget.value ? Number(e.currentTarget.value) : null)}
				>
					<option value="">All generations</option>
					{#each generations as gen (gen)}
						<option value={gen}>{GENERATION_LABELS[gen]}</option>
					{/each}
				</select>
				<ChevronDown size={16} class="select-icon" aria-hidden="true" />
			</div>

			<!-- Sort -->
			<div class="select-wrapper">
				<label for="sort-filter" class="sr-only">Sort Pokémon</label>
				<select
					id="sort-filter"
					class="select"
					value={sortBy}
					onchange={(e) => onSortChange(e.currentTarget.value as 'id' | 'total')}
				>
					<option value="id">Sort: Pokédex №</option>
					<option value="total">Sort: Stat total</option>
				</select>
				<ArrowDownUp size={16} class="select-icon" aria-hidden="true" />
			</div>

			{#if hasFilters}
				<button type="button" class="btn btn-ghost clear-all" onclick={onClear}>
					<X size={16} />
					Clear filters
				</button>
			{/if}
		</div>

		<!-- Type multi-select chips -->
		<div class="type-chips" role="group" aria-label="Filter by type">
			{#each ALL_TYPES as type (type)}
				{@const active = selectedTypes.includes(type)}
				{@const info = getTypeInfo(type)}
				<button
					type="button"
					class="type-chip {active ? 'active' : ''}"
					style={active
						? `background: ${info.color}; color: white; border-color: ${info.color};`
						: ''}
					aria-pressed={active}
					onclick={() => onTypeToggle(type)}
				>
					<span aria-hidden="true">{info.icon}</span>
					{type.charAt(0).toUpperCase() + type.slice(1)}
				</button>
			{/each}
		</div>

		<!-- Result count -->
		<p class="result-count tabular">
			{totalResults.toLocaleString()} Pokémon
		</p>
	</div>
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.search-input {
		width: 100%;
		padding: 0.625rem 2.75rem 0.625rem 2.75rem;
		border-radius: 10px;
		background: var(--bg-subtle);
		box-shadow: var(--ring);
		color: var(--text);
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	:global(.search-icon) {
		position: absolute;
		left: 0.75rem;
		color: var(--text-muted);
		pointer-events: none;
		z-index: 1;
	}

	.clear-btn {
		position: absolute;
		right: 0.25rem;
		min-width: 32px;
		min-height: 32px;
		z-index: 1;
	}

	.filters-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.75rem;
		flex-wrap: wrap;
	}

	.select-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.select {
		appearance: none;
		padding: 0.5rem 2.25rem 0.5rem 0.875rem;
		border-radius: 10px;
		background: var(--bg-subtle);
		box-shadow: var(--ring);
		color: var(--text);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
	}

	:global(.select-icon) {
		position: absolute;
		right: 0.625rem;
		color: var(--text-muted);
		pointer-events: none;
	}

	.type-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-top: 0.75rem;
	}

	.type-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.375rem 0.75rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		background: var(--bg-subtle);
		box-shadow: var(--ring);
		color: var(--text);
		cursor: pointer;
		transition:
			transform 120ms var(--ease-out),
			background-color 150ms ease;
	}

	.type-chip:active {
		transform: scale(0.95);
	}

	.clear-all {
		margin-left: auto;
		font-size: 0.8rem;
	}

	.result-count {
		margin-top: 0.75rem;
		font-size: 0.8rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	@media (min-width: 640px) {
		.filters-row {
			gap: 0.75rem;
		}
	}
</style>
