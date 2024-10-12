<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { parseCookies } from '$lib/fetchAPI';
	import { onDestroy, onMount } from 'svelte';
	import Chat from './_components/Chat.svelte';
	import MyStats from './_components/MyStats.svelte';
	import type { ChatMessage, Item, Player, Stats } from './types';
	import Bag from './_components/Bag.svelte';

	export let data;
	let ws: WebSocket;
	let players: Player[] = [];
	let gameStarted = true;
	let chatMessages: ChatMessage[] = [
		{
			isServer: true,
			id: '1',
			username: 'Server',
			message: 'Welcome to the chat!'
		},
		{
			isServer: false,
			id: '2',
			username: 'Player 1',
			message: 'Hello!'
		},
		{
			isServer: true,
			id: '3',
			username: 'Server',
			message: 'How are you?'
		}
	];
	let myStats: Stats = {
		username: 'Player 1',
		gold: 0,
		isSeeker: false
	};
	let currentPlayer: Player = {
		username: 'Player 1',
		id: '1'
	};
	let items: Item[] = [
		{
			id: '1',
			name: 'Item 1',
			description: 'Description 1',
			effect: 'Effect 1',
			photo: 'https://via.placeholder.com/150'
		},
		{
			id: '2',
			name: 'Item 2',
			description: 'Description 2',
			effect: 'Effect 2',
			photo: 'https://via.placeholder.com/150'
		}
	];

	onMount(async () => {
		const token = parseCookies(document.cookie).token;

		ws = new WebSocket(`ws://localhost:3000/ws/game?token=${token}&roomId=${data.roomId}`);
		ws.onopen = () => {
			console.log('Connected to the WS server');
		};

		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			switch (message.type) {
				case 'players':
					players = message.data;
					break;
				case 'startGame':
					gameStarted = true;
					break;
				default:
					break;
			}
		};
	});

	onDestroy(() => {
		if (ws) ws.close();
	});

	function startGame() {
		ws.send(
			JSON.stringify({
				type: 'startGame',
				data: {
					roomId: data.roomId
				}
			})
		);
	}
</script>

{#if gameStarted}
	<div class="grid grid-cols-12 gap-2 h-[calc(100vh_-_4rem)]">
		<div class="flex flex-col col-span-4 border p-2 h-[calc(100vh_-_4rem)]">
			<MyStats stats={myStats} />
			<hr class="mt-4" />
			<Chat messages={chatMessages} />
		</div>
		<div class="col-span-8 flex flex-col border p-2 h-[calc(100vh_-_4rem)]">
			<div class="flex flex-col h-32">
				<Bag {items} />
			</div>
			<hr class="mb-4" />
		</div>
	</div>
{:else}
	<div class="container mx-auto">
		<h1 class="flex items-center gap-2 text-2xl">
			<span>Room</span>
			<Badge>
				{data.roomId}
			</Badge>
		</h1>
		<hr class="my-4" />
		<div class="mt-4">
			<h2 class="text-xl">Players</h2>
			<ul class="mt-2">
				{#each players as player}
					<li>{player.username}</li>
				{/each}
			</ul>
		</div>
		<div class="mt-4">
			<Button on:click={startGame} class="w-full">Start Game</Button>
		</div>
	</div>
{/if}
