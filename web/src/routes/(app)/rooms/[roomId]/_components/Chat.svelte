<script lang="ts">
	export let messages: {
		isServer: boolean;
		id: string;
		username: string;
		message: string;
	}[] = [];
</script>

<div class="text-xs flex flex-col-reverse gap-1 h-full overflow-y-scroll">
	{#each messages as message (message.id)}
		<div>
			{#if message.isServer}
				<span class="font-bold text-red-500">{message.username}:</span>
			{:else}
				<span class="font-bold text-blue-500">{message.username}:</span>
			{/if}
			<span class:text-red-500={message.isServer}>{message.message}</span>
		</div>
	{/each}
</div>
