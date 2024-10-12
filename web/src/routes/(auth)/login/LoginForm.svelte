<script>
	import { applyAction } from '$app/forms';
	import { goto } from '$app/navigation';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema } from './schema';

	export let data;

	const form = superForm(data, {
		validators: zodClient(formSchema),
		onResult: async ({ result }) => {
			if (result.type == 'success') {
				window.location.href = '/';
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="usernameOrEmail">
		<Form.Control let:attrs>
			<Form.Label>Username or Email</Form.Label>
			<Input {...attrs} bind:value={$formData.usernameOrEmail} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="password">
		<Form.Control let:attrs>
			<Form.Label>Password</Form.Label>
			<Input {...attrs} bind:value={$formData.password} type="password" />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
	<p class="mt-4">
		Dont have an account? <a href="/register" class="text-blue-400">Register</a>
	</p>
</form>
