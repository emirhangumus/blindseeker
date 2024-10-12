<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { fetchAPI } from '$lib/fetchAPI';
	import { onMount } from 'svelte';

	type Room = {
		id: string;
		name: string;
		description: string;
		status: 'OPEN' | 'CLOSED';
		created_at: string;
	};

	let rooms: Room[] = [];
	let error = '';
	let loading = true;

	onMount(async () => {
		loading = true;
		const response = await fetchAPI<Room[]>('/room');
		if (response.status) {
			rooms = response.data || [];
		} else {
			error = response.message;
		}
		loading = false;
	});
</script>

<div>
	<div class="flex items-center justify-between gap-8">
		<div class="flex items-center gap-4">
			<Input placeholder="Join a room..." class="w-64" />
			<Button>Join</Button>
		</div>
		<div>
			<a href="/rooms/create">
				<Button>Create a room</Button>
			</a>
		</div>
	</div>
	<div class="mt-8">
		{#if loading}
			<p>Loading...</p>
		{:else if error}
			<p>{error}</p>
		{:else if rooms.length === 0}
			<p>No rooms found</p>
		{:else}
			<ul class="mt-4 space-y-4">
				{#each rooms as room}
					<li>
						<a href={`/rooms/${room.id}`}>
							<div
								class="flex items-center justify-between gap-4 px-4 py-2 border border-zinc-800 rounded-lg"
							>
								<div>
									<h3 class="text-lg font-semibold flex items-center gap-2">
										<span>{room.name}</span>
										<Badge class="text-xs">{room.id}</Badge>
									</h3>
									<p class="text-sm text-gray-500">{room.description}</p>
								</div>
								<div>
									<p class="text-sm text-gray-500">
										{new Date(room.created_at).toLocaleDateString()}
									</p>
									<p class="text-sm text-gray-500" class:text-green-500={room.status === 'OPEN'}>
										{room.status}
									</p>
								</div>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
