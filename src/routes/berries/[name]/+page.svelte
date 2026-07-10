<script lang="ts">
	/**
	 * Berry detail page — firmness, flavors, growth time, size, and more.
	 */

	import type { PageData } from './$types';
	import { base } from '$app/paths';
	import { fly, fade } from 'svelte/transition';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import { berrySpriteUrl, formatBerryName } from '$lib/api/pokeapi';
	import { getTypeInfo } from '$lib/api/types';
	import PokemonImage from '$lib/components/PokemonImage.svelte';

	const { data }: { data: PageData } = $props();

	const berry = $derived(data.berry);
	const displayName = $derived(formatBerryName(berry.name));
	const spriteUrl = $derived(berrySpriteUrl(berry.id));

	const formatName = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

	const stats = $derived([
		{ icon: '⏱️', label: 'Growth Time', value: `${berry.growth_time}h` },
		{ icon: '🌾', label: 'Max Harvest', value: berry.max_harvest },
		{ icon: '📏', label: 'Size', value: `${berry.size}mm` },
		{ icon: '✨', label: 'Smoothness', value: berry.smoothness },
		{ icon: '🤏', label: 'Firmness', value: formatName(berry.firmness.name) },
		{ icon: '🎁', label: 'Natural Gift Power', value: berry.natural_gift_power }
	]);

	// Flavor potency bars.
	const flavorMax = $derived(Math.max(...berry.flavors.map((f) => f.potency), 10));
</script>

<svelte:head>
	<title>{displayName} — Berries</title>
	<meta name="description" content={`${displayName} berry — growth time, firmness, flavors, and size.`} />
</svelte:head>

<div class="detail-page" in:fade={{ duration: 200 }}>
	<a href="{base}/berries" class="back-link" in:fly={{ x: -12, duration: 250 }}>
		<ArrowLeft size={18} />
		Back to Berries
	</a>

	<div class="berry-hero surface">
		<div class="berry-hero-sprite">
			<PokemonImage src={spriteUrl} alt={displayName} size="xl" />
		</div>
		<div class="berry-hero-info">
			<span class="berry-id tabular">#{berry.id.toString().padStart(2, '0')}</span>
			<h1>{displayName}</h1>
			<div class="berry-type">
				<span
					class="chip"
					style="background: {getTypeInfo(berry.natural_gift_type.name).color}; color: white;"
				>
					{getTypeInfo(berry.natural_gift_type.name).icon}
					{formatName(berry.natural_gift_type.name)} type
				</span>
			</div>
		</div>
	</div>

	<!-- Stats grid -->
	<div class="stats-grid">
		{#each stats as stat (stat.label)}
			<div class="stat-card surface">
				<span class="stat-icon" aria-hidden="true">{stat.icon}</span>
				<span class="stat-label">{stat.label}</span>
				<span class="stat-value tabular">{stat.value}</span>
			</div>
		{/each}
	</div>

	<!-- Flavors -->
	<section class="section">
		<h2>Flavor Profile</h2>
		<div class="flavors">
			{#each berry.flavors as flavor (flavor.flavor.name)}
				{@const potency = Math.max((flavor.potency / flavorMax) * 100, 2)}
				<div class="flavor-row">
					<span class="flavor-label">{formatName(flavor.flavor.name)}</span>
					<div class="flavor-bar-track">
						<div
							class="flavor-bar-fill"
							style="width: {potency}%; background: {getTypeInfo(
								flavor.flavor.name === 'spicy'
									? 'fire'
									: flavor.flavor.name === 'dry'
										? 'water'
										: flavor.flavor.name === 'sweet'
											? 'grass'
											: flavor.flavor.name === 'bitter'
												? 'grass'
												: 'electric'
							).color};"
						></div>
					</div>
					<span class="flavor-value tabular">{flavor.potency}</span>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.detail-page {
		max-width: 700px;
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

	.berry-hero {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem;
		border-radius: 24px;
		margin: 1rem 0;
	}

	.berry-hero-sprite {
		flex-shrink: 0;
		filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
	}

	.berry-hero-info {
		flex: 1;
	}

	.berry-id {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text-muted);
	}

	.berry-hero-info h1 {
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 800;
		margin: 0.25rem 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
		padding: 0.875rem 0.5rem;
		border-radius: 12px;
		text-align: center;
	}

	.stat-icon {
		font-size: 1.25rem;
	}

	.stat-label {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.stat-value {
		font-size: 0.95rem;
		font-weight: 700;
	}

	.section {
		margin: 1.5rem 0;
	}

	.section h2 {
		font-size: 1.1rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.flavors {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.flavor-row {
		display: grid;
		grid-template-columns: 80px 1fr 32px;
		align-items: center;
		gap: 0.75rem;
	}

	.flavor-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	.flavor-bar-track {
		height: 8px;
		border-radius: 999px;
		background: var(--gray-4);
		overflow: hidden;
	}

	.flavor-bar-fill {
		height: 100%;
		border-radius: 999px;
		transition: width 500ms var(--ease-out-quart);
	}

	.flavor-value {
		font-size: 0.8rem;
		font-weight: 700;
		text-align: right;
	}

	@media (max-width: 640px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.berry-hero {
			flex-direction: column;
			text-align: center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.flavor-bar-fill {
			transition: none;
		}
	}
</style>
