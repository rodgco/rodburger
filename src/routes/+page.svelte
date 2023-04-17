<script>
	import '$lib/chat/types.d';
  import { onMount } from 'svelte';
	import { enhance, applyAction } from '$app/forms';
  import Conversation from '$lib/chat/store';

  import Order from '$lib/components/order.svelte';
  import Bubble from '$lib/components/bubble.svelte';

	/** @type {import('./$types').PageData} */
	export let data;

  const conversation = new Conversation({
    session_id: "",
    messages: data.messages,
    status: "open"
  }, { storage: "localStorage", key: "conversation", load: true })

	/** @type {HTMLInputElement} */
	let input;

	onMount(() => {
		input.focus();
	});

	/** @type {import('./$types').SubmitFunction} */
	function enhancer({ data }) {
		input.value = '';
		input.disabled = true;

    /** @type {string} */
		const message =  data.get('message')?.toString() || '';
    conversation.addMessage({ role: 'user', content: message });
    conversation.addMessage({ role: 'assistant', content: 'Loading' });

		return async ({ result }) => {
			// `result` is an `ActionResult` object
			if (result.type === 'error') {
				await applyAction(result);
			} else if (result.type === 'success') {
        console.log("Result", result);
        conversation.replaceMessages(result.data.messages);

				input.disabled = false;
				input.focus();
			}
		};
	}
</script>

<main>
	<div id="chat">
    <form method="POST" use:enhance={enhancer}>
      <input type="hidden" name="conversation" value={JSON.stringify($conversation.messages)} />
      <input bind:this={input} type="text" name="message" />
    </form>
		<div id="bubblebox">
			{#each $conversation.messages as message}
        {#if message.content.startsWith('JSON:')}
          {@const order = JSON.parse(message.content.substring(6))}
          <Order {order} />
        {:else}
          <Bubble {message} />
        {/if}
			{/each}
		</div>
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
    overflow-y: scroll;
		padding-bottom: 5px;
		border: 1px solid var(--range-border-color);
		border-radius: var(--border-radius);
	}
	#bubblebox > :first-child {
		margin-top: max(auto, 5px);
	}
  form {
    margin: 0;
  }
  input {
    margin: 0;
    border-radius: var(--border-radius);
  }
</style>
