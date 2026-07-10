<script lang="ts">
	/**
	 * Error page — handles 404s and other errors gracefully.
	 */

	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { fade } from 'svelte/transition';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Unknown error');

	const is404 = $derived(status === 404);
</script>

<div class="error-page" in:fade={{ duration: 200 }}>
	<div class="pokeball-error" aria-hidden="true"></div>
	<h1>{is404 ? '404' : status}</h1>
	<p class="error-message">
		{is404 ? 'This Pokémon wandered off into the tall grass…' : message}
	</p>
	<a href={base} class="btn btn-primary">Return to Pokédex</a>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 4rem 1rem;
		text-align: center;
	}

	.pokeball-error {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 4px solid var(--text);
		overflow: hidden;
		position: relative;
		margin-bottom: 1rem;
		animation: wobble 2s ease-in-out infinite;
	}

	.pokeball-error::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 50%;
		background: var(--accent-9);
	}

	.pokeball-error::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--surface);
		border: 4px solid var(--text);
		transform: translate(-50%, -50%);
		z-index: 1;
	}

	@keyframes wobble {
		0%,
		100% {
			transform: rotate(-8deg);
		}
		50% {
			transform: rotate(8deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pokeball-error {
			animation: none;
		}
	}

	.error-page h1 {
		font-size: 3rem;
		font-weight: 800;
		color: var(--accent-9);
	}

	.error-message {
		color: var(--text-muted);
		max-width: 400px;
	}
</style>
