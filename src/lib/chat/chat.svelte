<script>
	import Bubble from '$lib/components/bubble.svelte';
	import { assistant, support } from './attendant.svelte.js';
	import { settings } from '$lib/settings';

	/** @type {HTMLInputElement} */
	let input;

	/** @type {HTMLButtonElement} */
	let sendButton;

	/** @type {boolean} */
	let loading = $state(false);

	/** @type {import('svelte/elements').FormEventHandler<HTMLFormElement>} */
	async function sendMessage(e) {
		e.preventDefault();

		const form = /** @type {HTMLFormElement} */ (e.target);

		loading = true;

		await assistant.createUserMessage(input.value);
		await assistant.run();

		loading = false;

		form.reset();
	}

	$effect(() => {
		if (!settings.closed && !loading) {
			input.disabled = false;
			sendButton.disabled = false;
			input.focus();
		} else {
			input.disabled = true;
			sendButton.disabled = true;
		}
	});

  $effect(() => {
    settings.thread_id = assistant.thread.id;
  });

  let kitchenCount = $derived(support.kitchen.length);
  let suggestionCount = $derived(support.suggestions.length);;

  $effect(() => {
    console.log('kitchen', support.kitchen);
    console.log('suggestions', support.suggestions);
  });

	/**
	 * @param {number} index
	 */
	function remove(index) {
		// TODO: remove message from conversation
	}
</script>

<div id="chat">
  <div class="support">
    <div>Kitchen ({kitchenCount})</div>
    <div>Suggestions ({suggestionCount})</div>
  </div>
	<form on:submit={sendMessage}>
		<!-- svelte-ignore a11y-autofocus -->
		<input bind:this={input} type="text" name="message" required />

		<button bind:this={sendButton} type="submit">Send</button>
	</form>
	<div id="bubblebox">
		{#each assistant.messages as message}
			{#if message.content[0].type === 'text'}
				<Bubble role={message.role}>{@html message.content[0].text.value}</Bubble>
			{/if}
		{/each}
		{#if loading}
			<Bubble role="loading">Loading</Bubble>
		{/if}
	</div>
</div>

<style>
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
		overflow-y: scroll;
		padding-bottom: 5px;
		border: 1px solid var(--range-border-color);
		border-radius: var(--border-radius);
	}
	form {
		margin: 0;
	}
	input {
		margin: 0;
		border-radius: var(--border-radius);
	}
  .support {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--secondary);
  }
  .support > div {
    flex: 1 0 0;
    display: flex;
    justify-content: center;
  }
</style>
