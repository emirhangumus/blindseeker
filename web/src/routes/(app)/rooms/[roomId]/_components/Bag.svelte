<script lang="ts">
	import type { Item } from '../types';

	const MAX_ITEMS = 4;
	export let items: Item[] = [];

	let placeholder = [
		...items,
		...Array.from({ length: MAX_ITEMS - items.length })
	] as (Item | null)[];
</script>

<div class="flex gap-8 text-xs">
	{#each placeholder as item, index}
		{#if item}
			<div class="flex flex-col items-center gap-1">
				<img src={item.photo} alt={item.name} class="w-16 h-16" />
				<span>{item.name}</span>
				<span>{item.description}</span>
				<span>{item.effect}</span>
			</div>
		{:else}
			<div class="w-16 h-16 bg-gray-200"></div>
		{/if}
	{/each}
</div>
