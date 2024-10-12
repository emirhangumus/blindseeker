<script lang="ts">
	import type { Stats } from '../types';

	export let stats: Stats;
</script>

<div class="flex flex-col h-32">
	<div class="flex items-center gap-2">
		<span class="font-bold">Username:</span>
		<span>{stats.username}</span>
	</div>
	<div class="flex items-center gap-2">
		<span class="font-bold">Gold:</span>
		<span>{stats.gold} g</span>
	</div>
	<div class="flex items-center gap-2">
		<span class="font-bold">Role:</span>
		<span>{stats.isSeeker ? 'Seeker' : 'Hider'}</span>
	</div>
</div>
