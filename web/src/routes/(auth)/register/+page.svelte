<script>
	import RegisterForm from './RegisterForm.svelte';

	export let data;
</script>

<div class="container h-screen w-screen grid place-items-center">
	<div class="w-full max-w-md p-8 bg-zinc-900 rounded-lg">
		<h1 class="text-3xl font-bold">Register</h1>
		<hr class="my-4" />
		<RegisterForm data={data.form} />
	</div>
</div>
