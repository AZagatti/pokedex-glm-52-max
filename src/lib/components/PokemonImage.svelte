<script lang="ts">
	/**
	 * PokemonImage — lazy-loaded Pokémon sprite/artwork with a skeleton placeholder
	 * and graceful fallback. Uses the official artwork when available, falling back
	 * to the default sprite.
	 *
	 * Accessibility: alt text describes the Pokémon by name.
	 */

	interface Props {
		src: string | null | undefined;
		alt: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		/** Optional class override for sizing. */
		class?: string;
	}

	const { src, alt, size = 'md', class: className = '' }: Props = $props();

	let loaded = $state(false);
	let errored = $state(false);

	// Reset on src change (important for detail page sprite switcher).
	$effect(() => {
		const _src = src;
		loaded = false;
		errored = false;
		void _src;
	});

	const sizeClasses: Record<string, string> = {
		lg: 'w-48 h-48',
		md: 'w-24 h-24',
		sm: 'w-16 h-16',
		xl: 'w-64 h-64'
	};

	const fallbackSrc = `data:image/svg+xml,${  encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#e4e4e7"/><circle cx="50" cy="50" r="45" fill="none" stroke="#a1a1aa" stroke-width="2"/><text x="50" y="58" text-anchor="middle" font-size="10" fill="#71717a" font-family="sans-serif">?</text></svg>'
	)}`;
</script>

<div class="relative {sizeClasses[size]} {className}" style="display:flex;align-items:center;justify-content:center;">
	{#if !loaded && !errored}
		<div class="skeleton absolute inset-0 rounded-full"></div>
	{/if}
	<img
		src={errored ? fallbackSrc : src ?? fallbackSrc}
		{alt}
		loading="lazy"
		decoding="async"
		class="relative z-10 h-full w-full object-contain transition-opacity duration-300"
		style="opacity: {loaded ? 1 : 0};"
		onload={() => (loaded = true)}
		onerror={() => (errored = true)}
	/>
</div>
