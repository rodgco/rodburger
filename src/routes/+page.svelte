<script>
	import '$lib/chat/types.d';
  import { onMount } from 'svelte';
	import { enhance, applyAction } from '$app/forms';
  import Conversation from '$lib/chat/store';

	/** @type {import('./$types').PageData} */
	export let data;

  const conversation = new Conversation({
    session_id: "",
    messages: data.messages,
    status: "open"
  })

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
          <div class="order">
            <title>{order.name}</title>
            {#each order.items as item}
              <p>{item.qty} - {item.item} [{item.extras}]</p>
            {/each}
            <footer>{order.message}</footer>
          </div>
        {:else}
          <div
					  class="chat-bubble"
					  class:sent={message.role === 'user'}
					  aria-busy={message.content === 'Loading' ? 'true' : 'false'}
  				>
	  				{@html message.content.replace('\n', '<br>')}
		  		</div>
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
  .order {
    color: var(--primary-inverse);
    background-color: yellow;
    align-self: center;
    border-top: 4px dotted orange;
    border-bottom: 4px dotted orange;
    border-left: 4px solid orange;
    border-right: 4px solid orange;
    padding: 0.75rem 1.25rem;
    margin: 0.25rem 0; 
  }
  form {
    margin: 0;
  }
  input {
    margin: 0;
    border-radius: var(--border-radius);
  }
</style>
