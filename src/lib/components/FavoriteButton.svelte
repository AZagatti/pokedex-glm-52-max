<script lang="ts">
	/**
	 * FavoriteButton — heart toggle for favoriting a Pokémon.
	 * Accessible: aria-label + aria-pressed. Min 44px tap target.
	 */

	import Heart from 'lucide-svelte/icons/heart';
	import { favorites } from '$lib/stores/favorites';

	interface Props {
		name: string;
		/** Visual variant — 'overlay' sits on cards, 'solid' is a standalone button. */
		variant?: 'overlay' | 'solid';
	}

	const { name, variant = 'solid' }: Props = $props();

	const isFav = $derived($favorites.includes(name));

	function toggle(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		favorites.toggle(name);
	}
</script>

{#if variant === 'overlay'}
	<button
		type="button"
		class="icon-btn fav-overlay"
		style="background: var(--surface); box-shadow: var(--shadow-sm); color: {isFav
			? 'var(--accent-9)'
			: 'var(--text-muted)'};"
		aria-label={isFav ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
		aria-pressed={isFav}
		onclick={toggle}
	>
		<Heart size={18} fill={isFav ? 'currentColor' : 'none'} strokeWidth={isFav ? 0 : 2} />
	</button>
{:else}
	<button
		type="button"
		class="btn {isFav ? 'btn-primary' : 'btn-ghost'}"
		aria-label={isFav ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
		aria-pressed={isFav}
		onclick={toggle}
	>
		<Heart size={18} fill={isFav ? 'currentColor' : 'none'} strokeWidth={isFav ? 0 : 2} />
		{isFav ? 'Favorited' : 'Favorite'}
	</button>
{/if}

<style>
	.fav-overlay {
		min-width: 36px;
		min-height: 36px;
	}
</style>
