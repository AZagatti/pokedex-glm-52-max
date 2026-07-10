<script lang="ts">
	/**
	 * Header — sticky top navigation with logo, nav links, theme toggle, and
	 * favorites count badge. Responsive: collapses nav on small screens.
	 */

	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import Heart from 'lucide-svelte/icons/heart';
	import Menu from 'lucide-svelte/icons/menu';
	import X from 'lucide-svelte/icons/x';
	import { theme } from '$lib/stores/theme';
	import { favorites } from '$lib/stores/favorites';

	let menuOpen = $state(false);

	const navLinks = [
		{ href: `${base}/`, icon: null, label: 'Pokédex' },
		{ href: `${base}/berries`, icon: null, label: 'Berries' },
		{ href: `${base}/favorites`, icon: Heart, label: 'Favorites' }
	];

	function isActive(href: string): boolean {
		if (href === `${base}/`) {
			return page.url.pathname === `${base}/` || page.url.pathname === `${base}`;
		}
		return page.url.pathname.startsWith(href);
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<header
	style="position: sticky; top: 0; z-index: var(--z-header); background: color-mix(in srgb, var(--surface) 85%, transparent); backdrop-filter: blur(12px); box-shadow: var(--ring);"
>
	<nav class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
		<a href={base} class="flex items-center gap-2 font-extrabold text-lg" onclick={closeMenu}>
			<span class="pokeball-logo" aria-hidden="true"></span>
			<span>Pokédex</span>
		</a>

		<div class="hidden items-center gap-1 md:flex">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					class="nav-link {isActive(link.href) ? 'active' : ''}"
					onclick={closeMenu}
				>
					{#if link.icon}
						<link.icon size={16} />
						{link.label}
						{#if link.href === `${base}/favorites` && $favorites.length > 0}
							<span class="count-badge tabular">{$favorites.length}</span>
						{/if}
					{:else}
						{link.label}
					{/if}
				</a>
			{/each}
		</div>

		<div class="flex items-center gap-1">
			<button
				type="button"
				class="icon-btn"
				aria-label="Toggle {$theme === 'dark' ? 'light' : 'dark'} theme"
				onclick={() => theme.toggle()}
			>
				{#if $theme === 'dark'}
					<Sun size={20} />
				{:else}
					<Moon size={20} />
				{/if}
			</button>

			<button
				type="button"
				class="icon-btn md:hidden"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				{#if menuOpen}
					<X size={20} />
				{:else}
					<Menu size={20} />
				{/if}
			</button>
		</div>
	</nav>

	{#if menuOpen}
		<div class="border-t md:hidden" style="border-color: var(--border);">
			<div class="flex flex-col gap-1 p-3">
				{#each navLinks as link (link.href)}
					<a
						href={link.href}
						class="nav-link {isActive(link.href) ? 'active' : ''}"
						onclick={closeMenu}
					>
						{#if link.icon}
							<link.icon size={16} />
						{/if}
						{link.label}
						{#if link.href === `${base}/favorites` && $favorites.length > 0}
							<span class="count-badge tabular">{$favorites.length}</span>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</header>

<style>
	.pokeball-logo {
		position: relative;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2.5px solid var(--text);
		overflow: hidden;
		flex-shrink: 0;
	}

	.pokeball-logo::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 50%;
		background: var(--accent-9);
	}

	.pokeball-logo::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--surface);
		border: 2.5px solid var(--text);
		transform: translate(-50%, -50%);
		z-index: 1;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		border-radius: 10px;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-muted);
		transition: background-color 150ms ease, color 150ms ease;
	}

	.nav-link:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	/* Active uses color change, NOT font-weight (emil: avoids layout shift) */
	.nav-link.active {
		color: var(--accent-9);
	}

	.count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: 999px;
		background: var(--accent-9);
		color: white;
		font-size: 0.7rem;
		font-weight: 700;
	}

	@media (max-width: 767px) {
		.nav-link {
			justify-content: flex-start;
			padding: 0.75rem 1rem;
			font-size: 1rem;
		}
	}
</style>
