<script>
	import { goto } from '$app/navigation';
	import { PUBLIC_API_URL } from '$env/static/public';
	import Input from '$lib/components/ui/input/input.svelte';
	import { fetchAPI } from '$lib/fetchAPI';

	let roomName = '';
	let roomDescription = '';

	const createRoom = async () => {
		const response = await fetchAPI(`${PUBLIC_API_URL}/room/create`, {
			method: 'POST',
			body: JSON.stringify({
				name: roomName,
				description: roomDescription
			})
		});

		if (response.status) {
			goto(`/rooms/${response.data.id}`);
		}
	};
</script>

<h1 class="text-4xl font-bold text-center">Create a Room</h1>
<div class="flex flex-col items-center gap-4 mt-8">
	<Input bind:value={roomName} placeholder="Room Name" class="w-64" />
	<Input bind:value={roomDescription} placeholder="Room Description" class="w-64" />
	<button on:click={createRoom}>Create Room</button>
</div>
