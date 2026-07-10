<script lang="ts">
	/**
	 * TypeBadge — colored pill for a Pokémon type.
	 * Colors come from the TYPE_COLORS map; text is white on saturated backgrounds.
	 */

	import { getTypeInfo } from '$lib/api/types';

	interface Props {
		type: string;
		size?: 'sm' | 'md';
	}

	const { type, size = 'sm' }: Props = $props();

	const info = $derived(getTypeInfo(type));
	const label = $derived(type.charAt(0).toUpperCase() + type.slice(1));
</script>

<span
	class="chip {size === 'sm' ? 'text-xs' : 'text-sm'}"
	style="background: {info.color}; color: white; box-shadow: 0 1px 3px {info.color}55;"
>
	<span aria-hidden="true">{info.icon}</span>
	{label}
</span>
