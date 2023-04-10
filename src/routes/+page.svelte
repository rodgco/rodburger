<script>
	import '$lib/chat/types.d';
	import { enhance, applyAction } from '$app/forms';
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
	<div id="chat">
    <form method="POST" use:enhance={enhancer}>
      <input bind:this={input} type="text" name="message" />
    </form>
		<div id="bubblebox">
			{#each messages as message}
				<div
					class="chat-bubble"
					class:sent={message.role === 'user'}
					aria-busy={message.content === 'Loading' ? 'true' : 'false'}
				>
					{@html message.content.replace('\n', '<br>')}
				</div>
			{/each}
		</div>
	</div>
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
		flex: 1 0 auto;
		display: flex;
    flex-wrap: wrap;
		gap: 0.5rem;
		align-items: stretch;
		padding: 0.5rem;
    height: 300px;
	}
	#chat {
		flex: 1 0 auto;
		align-self: stretch;
		display: flex;
    flex-direction: column-reverse;
    overflow: hidden;
    gap: 0.25rem;
	}
	#bubblebox {
    flex: 1 0 0; 
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
    overflow-y: auto;
		padding-bottom: 5px;
		border: 1px solid var(--range-border-color);
		border-radius: var(--border-radius);
	}
	#bubblebox > :first-child {
		margin-top: max(auto, 5px);
	}
	.chat-bubble {
		font-size: small;
		color: var(--secondary-inverse);
		padding: 10px 20px;
		border-radius: var(--border-radius);
		max-width: 20rem;
		margin: 5px 5px 0 5px;
		background-color: var(--secondary);
		align-self: flex-start;
	}
	.sent {
		color: var(--primary-inverse);
		background-color: var(--primary);
		align-self: flex-end;
	}
  form {
    margin: 0;
  }
  input {
    margin: 0;
    border-radius: var(--border-radius);
  }
	#orders {
		flex: 1 1 auto;
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
</style>
