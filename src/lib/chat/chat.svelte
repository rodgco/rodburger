<script>
  import Order from '$lib/components/order.svelte';
  import Bubble from '$lib/components/bubble.svelte';

  import conversation from './store';
  import './types.d';

  /** @type {HTMLInputElement} */
  let input;

  /** @type {HTMLButtonElement} */
  let sendButton;

  /** @type {boolean} */
  let loading = false;

  $: if (input && sendButton && ($conversation.status === 'closed' || loading)) {
      input.disabled = true;
      sendButton.disabled = true;
    }
  $: if (input && sendButton && $conversation.status === 'open' && !loading) {
      input.disabled = false;
      sendButton.disabled = false;
    }

  /** @type {import('svelte/elements').FormEventHandler<HTMLFormElement>} */
  async function sendMessage() {
    input.disabled = true;
    sendButton.disabled = true;
    loading = true;

    conversation.addMessage({ role: 'user', content: input.value });

    input.value = '';

    await conversation.callAssistant();

    loading = false;

    if ($conversation.status === 'open') {
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  /**
   * @param {number} index
   */
  function remove(index) {
    conversation.removeMessage(index);
  }
</script>

<div id="chat">
	<form on:submit|preventDefault={sendMessage}>
		<!-- svelte-ignore a11y-autofocus -->
		<input bind:this={input} type="text" name="message" autofocus required />

		<button bind:this={sendButton} type="submit">Send</button>
	</form>
	<div id="bubblebox">
		{#each $conversation.messages as message, index}
			{#if message.content.startsWith('JSON:')}
				<Order order={message.content} on:dblclick={() => remove(index)} />
			{:else}
				<Bubble role={message.role} on:dblclick={() => remove(index)}
					>{@html message.content.replaceAll('\n', '<br>')}</Bubble
				>
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
</style>
