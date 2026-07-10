<script lang="ts">
	/**
	 * Pokémon detail page — artwork, animated stat bars, abilities, moves,
	 * evolution chain, sprite switcher, and cry playback.
	 */

	import type { PageData } from './$types';
	import type { EvolutionChain } from '$lib/api/schemas';
	import { base } from '$app/paths';
	import { fly, fade } from 'svelte/transition';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import Volume2 from 'lucide-svelte/icons/volume-2';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Eye from 'lucide-svelte/icons/eye';
	import Repeat from 'lucide-svelte/icons/repeat';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { getTypeInfo } from '$lib/api/types';
	import { idToGeneration } from '$lib/api/generations';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';

	const { data }: { data: PageData } = $props();

	const detail = $derived(data.detail);
	const species = $derived(data.species);
	const evolution = $derived(data.evolution);

	const displayName = $derived(detail.name.charAt(0).toUpperCase() + detail.name.slice(1));
	const types = $derived(detail.types.map((t) => t.type.name));
	const primaryColor = $derived(getTypeInfo(types[0] ?? 'normal').color);
	const dexNumber = $derived(`#${  detail.id.toString().padStart(4, '0')}`);
	const gen = $derived(idToGeneration(detail.id));

	// Height (decimetres → metres) and weight (hectograms → kilograms).
	const heightM = $derived((detail.height / 10).toFixed(1));
	const weightKg = $derived((detail.weight / 10).toFixed(1));

	// Sprite switcher state.
	type SpriteVariant = 'front' | 'back' | 'front-shiny' | 'back-shiny';
	let spriteVariant = $state<SpriteVariant>('front');
	let showShiny = $state(false);

	const currentSprite = $derived(
		spriteVariant === 'front'
			? detail.sprites.front_default
			: spriteVariant === 'back'
				? detail.sprites.back_default
				: spriteVariant === 'front-shiny'
					? detail.sprites.front_shiny
					: detail.sprites.back_shiny
	);

	const artwork = $derived(
		showShiny
			? detail.sprites.other?.['official-artwork']?.front_shiny ??
				detail.sprites.other?.['official-artwork']?.front_default
			: detail.sprites.other?.['official-artwork']?.front_default
	);

	// Stat bar animation trigger.
	let statBarsVisible = $state(false);
	$effect(() => {
		// Trigger animation on mount / navigation.
		statBarsVisible = false;
		const id = requestAnimationFrame(() => (statBarsVisible = true));
		return () => cancelAnimationFrame(id);
	});

	const stats = $derived(detail.stats);
	const totalStats = $derived(stats.reduce((sum, s) => sum + s.base_stat, 0));

	// Stat display config — max value for bar width scaling.
	const STAT_MAX = 255;
	const statLabels: Record<string, string> = {
		attack: 'Attack',
		defense: 'Defense',
		hp: 'HP',
		'special-attack': 'Sp. Atk',
		'special-defense': 'Sp. Def',
		speed: 'Speed'
	};

	const statColors: Record<string, string> = {
		attack: '#ee8130',
		defense: '#f7d02c',
		hp: '#dc2626',
		'special-attack': '#614090',
		'special-defense': '#e2bf65',
		speed: '#7ac74c'
	};

	// Abilities — sort by slot, mark hidden.
	const abilities = $derived(
		[...detail.abilities].toSorted((a, b) => a.slot - b.slot)
	);

	// Moves — take a few examples.
	const moves = $derived((detail.moves ?? []).slice(0, 8));
	const formatName = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

	// Flavor text — first English entry.
	const flavorText = $derived(
		species?.flavor_text_entries?.find((f) => f.language.name === 'en')?.flavor_text
			?.replaceAll(/\f/g, ' ')
			?.replaceAll(/\n/g, ' ')
			?.trim()
	);

	const genus = $derived(
		species?.genera?.find((g) => g.language.name === 'en')?.genus
	);

	// Evolution chain — flatten the tree into a list.
	type EvoLink = EvolutionChain['chain'];
	interface EvoNode {
		name: string;
		details: { min_level?: number | null; item?: string | null; trigger?: string | null };
	}
	function flattenEvolution(
		node: EvoLink | null | undefined,
		acc: EvoNode[] = [],
		details?: { min_level?: number | null; item?: string | null; trigger?: string | null }
	): EvoNode[] {
		if (!node) {return acc;}
		acc.push({ details: details ?? {}, name: node.species.name });
		for (const evo of node.evolves_to) {
			flattenEvolution(
				evo,
				acc,
				{
					item: evo.evolution_details?.[0]?.item?.name,
					min_level: evo.evolution_details?.[0]?.min_level,
					trigger: evo.evolution_details?.[0]?.trigger?.name
				}
			);
		}
		return acc;
	}
	const evoChain = $derived(flattenEvolution(evolution?.chain));

	// Cry playback.
	let cryAudio: HTMLAudioElement | null = null;
	let isPlayingCry = $state(false);

	function playCry() {
		const url = detail.cries?.latest ?? detail.cries?.legacy;
		if (!url) {return;}
		if (!cryAudio) {cryAudio = new Audio(url);}
		cryAudio.src = url;
		cryAudio.play().then(() => {
			isPlayingCry = true;
			cryAudio!.onended = () => (isPlayingCry = false);
		}).catch(() => {});
	}
</script>

<svelte:head>
	<title>{displayName} #{detail.id} — Pokédex</title>
	<meta name="description" content="{flavorText ?? `${displayName} — type, stats, abilities, evolution chain, and more.`}" />
</svelte:head>

<div class="detail-page" in:fade={{ duration: 200 }}>
	<!-- Back nav -->
	<a href={base} class="back-link" in:fly={{ x: -12, duration: 250 }}>
		<ArrowLeft size={18} />
		Back to Pokédex
	</a>

	<!-- Hero section -->
	<div class="hero" style="--type-color: {primaryColor};">
		<div class="hero-bg" aria-hidden="true"></div>
		<div class="hero-content">
			<div class="hero-left">
				<div class="dex-num tabular">{dexNumber}</div>
				<h1>{displayName}</h1>
				{#if genus}
					<p class="genus">{genus}</p>
				{/if}
				<div class="hero-badges">
					{#each types as type (type)}
						<TypeBadge {type} size="md" />
					{/each}
				</div>
				{#if gen}
					<p class="gen-info">Generation {gen}</p>
				{/if}
				<div class="hero-actions">
					<FavoriteButton name={detail.name} />
					{#if detail.cries?.latest || detail.cries?.legacy}
						<button
							type="button"
							class="btn btn-ghost"
							onclick={playCry}
							aria-label="Play {displayName}'s cry"
						>
							<Volume2 size={18} />
							{isPlayingCry ? 'Playing…' : 'Play Cry'}
						</button>
					{/if}
				</div>
			</div>
			<div class="hero-right">
				<div class="artwork-wrapper">
					{#key artwork}
						<div in:fly={{ y: 20, duration: 400 }}>
							<PokemonImage src={artwork} alt={displayName} size="xl" class="detail-artwork" />
						</div>
					{/key}
				</div>
				{#if showShiny}
					<span class="shiny-tag chip" style="background: #f7d02c; color: #7a5c00;">
						<Sparkles size={12} /> Shiny
					</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Physical stats -->
	<div class="info-grid">
		<div class="info-card surface">
			<span class="info-label">Height</span>
			<span class="info-value tabular">{heightM} m</span>
		</div>
		<div class="info-card surface">
			<span class="info-label">Weight</span>
			<span class="info-value tabular">{weightKg} kg</span>
		</div>
		<div class="info-card surface">
			<span class="info-label">Base XP</span>
			<span class="info-value tabular">{detail.base_experience ?? '—'}</span>
		</div>
		<div class="info-card surface">
			<span class="info-label">Type</span>
			<span class="info-value">{types.length === 1 ? 'Single' : 'Dual'}</span>
		</div>
	</div>

	{#if flavorText}
		<p class="flavor-text" in:fade={{ duration: 300, delay: 150 }}>{flavorText}</p>
	{/if}

	<!-- Base stats with animated bars -->
	<section class="section">
		<h2>Base Stats</h2>
		<div class="stats-container">
			{#each stats as stat, i (stat.stat.name)}
				<div class="stat-row">
					<span class="stat-label">{statLabels[stat.stat.name] ?? formatName(stat.stat.name)}</span>
					<span class="stat-value tabular">{stat.base_stat}</span>
					<div class="stat-bar-track">
						<div
							class="stat-bar-fill"
							style="background: {statColors[stat.stat.name] ?? primaryColor}; width: {statBarsVisible
								? Math.min((stat.base_stat / STAT_MAX) * 100, 100)
								: 0}%; transition-delay: {i * 80}ms;"
						></div>
					</div>
				</div>
			{/each}
			<div class="stat-row total-row">
				<span class="stat-label">Total</span>
				<span class="stat-value tabular">{totalStats}</span>
				<div class="stat-bar-track">
					<div
						class="stat-bar-fill"
						style="background: var(--text); width: {statBarsVisible
							? Math.min((totalStats / (STAT_MAX * 6)) * 100, 100)
							: 0}%;"
					></div>
				</div>
			</div>
		</div>
	</section>

	<!-- Two-column: Abilities + Sprite variants -->
	<div class="two-col">
		<!-- Abilities -->
		<section class="section">
			<h2>Abilities</h2>
			<div class="abilities-list">
				{#each abilities as ability (ability.ability.name)}
					<div class="ability-row surface">
						<span class="ability-name">{formatName(ability.ability.name)}</span>
						{#if ability.is_hidden}
							<span class="chip hidden-tag">Hidden</span>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<!-- Sprite switcher -->
		<section class="section">
			<h2>Sprites</h2>
			<div class="sprite-switcher">
				<div class="sprite-display surface">
					{#key currentSprite}
						<PokemonImage src={currentSprite} alt={`${displayName} ${spriteVariant} sprite`} size="lg" />
					{/key}
				</div>
				<div class="sprite-buttons">
					<button
						type="button"
						class="sprite-btn {spriteVariant === 'front' ? 'active' : ''}"
						onclick={() => (spriteVariant = 'front')}
					>Front</button>
					<button
						type="button"
						class="sprite-btn {spriteVariant === 'back' ? 'active' : ''}"
						onclick={() => (spriteVariant = 'back')}
					>Back</button>
					<button
						type="button"
						class="sprite-btn {spriteVariant === 'front-shiny' ? 'active' : ''}"
						onclick={() => (spriteVariant = 'front-shiny')}
					>
						<Sparkles size={14} /> Shiny Front
					</button>
					<button
						type="button"
						class="sprite-btn {spriteVariant === 'back-shiny' ? 'active' : ''}"
						onclick={() => (spriteVariant = 'back-shiny')}
					>
						<Sparkles size={14} /> Shiny Back
					</button>
					<button
						type="button"
						class="sprite-btn artwork-toggle {showShiny ? 'active' : ''}"
						onclick={() => (showShiny = !showShiny)}
					>
						<Eye size={14} /> {showShiny ? 'Normal Artwork' : 'Shiny Artwork'}
					</button>
				</div>
			</div>
		</section>
	</div>

	<!-- Evolution chain -->
	{#if evoChain.length > 1}
		<section class="section">
			<h2>Evolution Chain</h2>
			<div class="evo-chain">
				{#each evoChain as node, i (node.name)}
					{#if i > 0}
						<div class="evo-arrow">
							<ChevronRight size={28} />
							{#if node.details.min_level}
								<span class="evo-condition">Lv. {node.details.min_level}</span>
							{:else if node.details.item}
								<span class="evo-condition">{formatName(node.details.item)}</span>
							{:else if node.details.trigger}
								<span class="evo-condition">{formatName(node.details.trigger)}</span>
							{/if}
						</div>
					{/if}
					<a class="evo-node" href="{base}/pokemon/{node.name}">
						<PokemonImage
							src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${node.name === detail.name ? '' : ''}${node.name}.png`}
							alt={formatName(node.name)}
							size="md"
						/>
						<span class="evo-name">{formatName(node.name)}</span>
					</a>
				{/each}
			</div>
		</section>
	{:else if evoChain.length === 1}
		<section class="section">
			<h2>Evolution Chain</h2>
			<p class="muted-text">This Pokémon does not evolve.</p>
		</section>
	{/if}

	<!-- Moves -->
	{#if moves.length > 0}
		<section class="section">
			<h2>Example Moves</h2>
			<div class="moves-grid">
				{#each moves as move (move.move.name)}
					<span class="move-chip surface">
						<Repeat size={12} />
						{formatName(move.move.name)}
					</span>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.detail-page {
		max-width: 900px;
		margin: 0 auto;
		padding-bottom: 2rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		border-radius: 10px;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--text-muted);
		transition: background-color 150ms ease, color 150ms ease;
	}

	.back-link:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	/* Hero */
	.hero {
		position: relative;
		overflow: hidden;
		border-radius: 24px;
		padding: 2rem;
		margin: 1rem 0;
		isolation: isolate;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--type-color) 18%, transparent) 0%,
			color-mix(in srgb, var(--type-color) 8%, transparent) 50%,
			transparent 100%
		);
		z-index: 0;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.hero-left {
		flex: 1 1 280px;
	}

	.dex-num {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text-muted);
		letter-spacing: 0.05em;
	}

	.hero h1 {
		font-size: clamp(1.75rem, 5vw, 2.5rem);
		font-weight: 800;
		margin: 0.25rem 0 0;
	}

	.genus {
		font-size: 0.95rem;
		color: var(--text-muted);
		margin: 0.25rem 0 0.75rem;
		font-style: italic;
	}

	.hero-badges {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 0.5rem;
	}

	.gen-info {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-weight: 600;
		margin: 0.25rem 0 0.75rem;
	}

	.hero-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}

	.hero-right {
		position: relative;
		flex: 0 1 auto;
	}

	.artwork-wrapper {
		filter: drop-shadow(0 8px 24px color-mix(in srgb, var(--type-color) 30%, transparent));
	}

	.shiny-tag {
		position: absolute;
		top: 0;
		right: 0;
	}

	/* Info grid */
	.info-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.info-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.875rem 0.5rem;
		border-radius: 12px;
		text-align: center;
	}

	.info-label {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.info-value {
		font-size: 1.1rem;
		font-weight: 700;
	}

	.flavor-text {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--text-muted);
		text-align: center;
		padding: 1rem 1.5rem;
		font-style: italic;
		max-width: 650px;
		margin: 0 auto 1.5rem;
	}

	/* Sections */
	.section {
		margin: 1.5rem 0;
	}

	.section h2 {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	/* Stats */
	.stats-container {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.stat-row {
		display: grid;
		grid-template-columns: 90px 40px 1fr;
		align-items: center;
		gap: 0.75rem;
	}

	.stat-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	.stat-value {
		font-size: 0.9rem;
		font-weight: 700;
		text-align: right;
	}

	.stat-bar-track {
		height: 10px;
		border-radius: 999px;
		background: var(--gray-4);
		overflow: hidden;
	}

	.stat-bar-fill {
		height: 100%;
		border-radius: 999px;
		width: 0;
		transition: width 600ms var(--ease-out-quart);
	}

	.total-row .stat-label {
		font-weight: 700;
		color: var(--text);
	}

	/* Two column */
	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	/* Abilities */
	.abilities-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.ability-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.625rem 0.875rem;
		border-radius: 10px;
	}

	.ability-name {
		font-weight: 600;
		font-size: 0.9rem;
	}

	.hidden-tag {
		background: var(--accent-9);
		color: white;
		font-size: 0.65rem;
	}

	/* Sprite switcher */
	.sprite-switcher {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.sprite-display {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		border-radius: 12px;
		min-height: 160px;
	}

	.sprite-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.sprite-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.375rem 0.625rem;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 600;
		background: var(--bg-subtle);
		box-shadow: var(--ring);
		color: var(--text-muted);
		cursor: pointer;
		transition: background-color 150ms ease, color 150ms ease;
	}

	.sprite-btn:hover {
		color: var(--text);
	}

	.sprite-btn.active {
		background: var(--accent-9);
		color: white;
		box-shadow: none;
	}

	/* Evolution chain */
	.evo-chain {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.evo-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		border-radius: 12px;
		transition: background-color 150ms ease;
	}

	.evo-node:hover {
		background: var(--surface-hover);
	}

	.evo-name {
		font-size: 0.8rem;
		font-weight: 600;
	}

	.evo-arrow {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: var(--text-muted);
		position: relative;
	}

	.evo-condition {
		position: absolute;
		bottom: -1.25rem;
		white-space: nowrap;
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--text-muted);
		background: var(--surface);
		padding: 1px 4px;
		border-radius: 4px;
	}

	.muted-text {
		color: var(--text-muted);
		font-style: italic;
	}

	/* Moves */
	.moves-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.move-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	@media (max-width: 640px) {
		.info-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.two-col {
			grid-template-columns: 1fr;
		}
		.hero {
			padding: 1.25rem;
		}
		.stat-row {
			grid-template-columns: 80px 36px 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stat-bar-fill {
			transition: none;
		}
	}
</style>
