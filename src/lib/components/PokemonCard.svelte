<script lang="ts">
	/**
	 * PokemonCard — the list/grid card for a Pokémon.
	 * Type-colored gradient background, sprite, dex number, name, type badges,
	 * favorite overlay, and a hover micro-animation.
	 *
	 * The entire card is a link to the detail page. The favorite button stops
	 * propagation so it doesn't navigate.
	 */

	import type { PokemonDetail } from '$lib/api/schemas';
	import { getTypeInfo, typeGradient } from '$lib/api/types';
	import { base } from '$app/paths';
	import PokemonImage from './PokemonImage.svelte';
	import TypeBadge from './TypeBadge.svelte';
	import FavoriteButton from './FavoriteButton.svelte';

	interface Props {
		pokemon: PokemonDetail;
	}

	const { pokemon }: Props = $props();

	const types = $derived(pokemon.types.map((t) => t.type.name));
	const gradient = $derived(typeGradient(types));
	const primaryColor = $derived(getTypeInfo(types[0] ?? 'normal').color);
	const displayName = $derived(
		pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
	);
	const dexNumber = $derived(`#${  pokemon.id.toString().padStart(4, '0')}`);
</script>

<a
	href="{base}/pokemon/{pokemon.name}"
	class="card pokemon-card group"
	style="background-image: {gradient};"
	aria-label="View details for {displayName}"
>
	<!-- Decorative pokeball watermark -->
	<div
		class="pokeball-bg"
		style="--type-color: {primaryColor};"
		aria-hidden="true"
	></div>

	<FavoriteButton name={pokemon.name} variant="overlay" />

	<div class="sprite-area">
		<PokemonImage
			src={pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default}
			alt={displayName}
			size="lg"
		/>
	</div>

	<div class="info">
		<span class="dex-number tabular">{dexNumber}</span>
		<h3 class="name">{displayName}</h3>
		<div class="badges">
			{#each types as type (type)}
				<TypeBadge {type} />
			{/each}
		</div>
	</div>
</a>

<style>
	.pokemon-card {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		isolation: isolate;
		transition:
			transform 200ms var(--ease-out-quart),
			box-shadow 200ms var(--ease-out-quart);
	}

	/* Hover only on devices that support it (emil) */
	@media (hover: hover) and (pointer: fine) {
		.pokemon-card:hover {
			transform: translateY(-4px);
			box-shadow: var(--shadow-lg);
		}
	}

	/* Decorative pokeball background — pointer-events disabled (emil) */
	.pokeball-bg {
		position: absolute;
		top: -30px;
		right: -30px;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		border: 4px solid var(--type-color);
		opacity: 0.12;
		pointer-events: none;
		z-index: 0;
		transition: transform 400ms var(--ease-out-quart);
	}

	.pokeball-bg::before {
		content: '';
		position: absolute;
		top: 50%;
		left: -4px;
		right: -4px;
		height: 4px;
		background: var(--type-color);
		transform: translateY(-50%);
	}

	.pokeball-bg::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 4px solid var(--type-color);
		background: var(--surface);
		transform: translate(-50%, -50%);
	}

	@media (hover: hover) and (pointer: fine) {
		.pokemon-card:hover .pokeball-bg {
			transform: rotate(45deg) scale(1.1);
		}
	}

	.pokemon-card :global(.fav-overlay) {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		z-index: 20;
	}

	.sprite-area {
		position: relative;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
	}

	.info {
		position: relative;
		z-index: 5;
		margin-top: 0.25rem;
	}

	.dex-number {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-muted);
		letter-spacing: 0.05em;
	}

	.name {
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--text);
		margin: 0.1rem 0 0.5rem;
		line-height: 1.2;
	}

	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}
</style>
