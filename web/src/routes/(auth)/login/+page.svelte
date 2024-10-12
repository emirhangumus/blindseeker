<script>
	import LoginForm from './LoginForm.svelte';

	export let data;
</script>

<div class="container h-screen w-screen grid place-items-center">
	<div class="w-full max-w-md p-8 bg-zinc-900 rounded-lg">
		<h1 class="text-3xl font-bold">Login</h1>
		<hr class="my-4" />
		<LoginForm data={data.form} />
	</div>
</div>
