<script lang="ts">
	/**
	 * SkeletonCard — placeholder matching PokemonCard dimensions.
	 * Fixed dimensions to prevent layout shift (emil).
	 */
</script>

<div class="card skeleton-card">
	<div class="skeleton aspect-square w-full"></div>
	<div class="space-y-2 p-4">
		<div class="skeleton h-3 w-12 rounded-full"></div>
		<div class="skeleton h-4 w-2/3 rounded-full"></div>
		<div class="flex gap-2">
			<div class="skeleton h-5 w-16 rounded-full"></div>
			<div class="skeleton h-5 w-16 rounded-full"></div>
		</div>
	</div>
</div>

<style>
	.skeleton-card {
		overflow: hidden;
	}
</style>
