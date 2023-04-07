<script>
	import '$lib/chat/types.d';
	import { enhance, applyAction } from '$app/forms';
	import Chat from '$lib/chat/chat.svelte';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	$: ({ messages } = data);
	$: ({ orders } = data);

	/** @type {HTMLInputElement} */
	let input;

	onMount(() => {
		input.focus();
	});

	/** @type {import('./$types').SubmitFunction} */
	function enhancer({ data }) {
		input.value = '';
		input.disabled = true;

		const message = /** @type {string} */ data.get('message')?.toString() || '';
		messages = [
			...messages,
			{ role: 'user', content: message },
			{ role: 'assistant', content: 'Loading' }
		];

		return async ({ result }) => {
			// `result` is an `ActionResult` object
			if (result.type === 'error') {
				await applyAction(result);
			} else if (result.type === 'success') {
				messages = result.data?.session?.messages || [];
				orders = result.data?.session?.orders || [];

				input.disabled = false;
				input.focus();
			}
		};
	}
</script>

<main>
	<form method="POST" use:enhance={enhancer}>
		<input bind:this={input} type="text" name="message" />
	</form>
	<Chat {messages} currentUser="user" />
	<div id="orders">
		{#each orders as order}
			<div class="order">
				<p>Customer: <span>{order.name}</span></p>
				{#each order.items as item}
					<p>{item.qty} - {item.item} {item.extras}</p>
				{/each}
				<div>{order.message}</div>
			</div>
		{/each}
	</div>
</main>

<style>
	main {
		display: flex;
		gap: 0.5rem;
		align-items: stretch;
		padding: 0.5rem;
		min-height: 0;
	}
	#orders {
		flex: 0 1 auto;
		width: 15rem;
		border: 1px solid var(--range-border-color);
		border-radius: var(--border-radius);
	}
	.order {
		margin: 0.25rem;
		padding: 0.25rem;
		background-color: var(--primary);
		color: var(--primary-inverse);
	}

	.order p {
		font-size: small;
		font-family: monospace;
		margin: 0;
	}

	.order p span {
		font-weight: bold;
	}
	.order div {
		font-size: medium;
		text-align: center;
	}
	form {
		margin: 0;
	}
	input {
		margin: 0;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		border-bottom-left-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
	}
</style>
