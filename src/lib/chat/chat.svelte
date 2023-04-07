<script>
  import { onMount, tick } from 'svelte/internal';
  import { enhance, applyAction } from '$app/forms';
  import './types.d';

  /** @type {OpenAIChatMessage[]} */
  export let messages = [];

  /** @type {string} */
  export let currentUser = 'user';

  /** @type {HTMLDivElement} */
  let bubblebox;

  /** @type {HTMLInputElement} */
  let input;

  $: if (messages && input) {
    console.log('Scrolling');
    tick();
    bubblebox.scrollTop = bubblebox.scrollHeight;
  }

  /**
  * @param {OpenAIChatMessage} message
  */
  function isCurrentUser(message) {
    return message.role === currentUser;
  }

  onMount(() => {
    bubblebox.scrollTop = bubblebox.scrollHeight;
    input.focus();
  });

  function enhancer({ form, data }) {
    form.children['message'].value = "";
    form.children['message'].disabled = true;

    const message = /** @type {string} */ data.get('message')?.toString() || "";
    messages = [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', loading: true, content: 'Loading' }
    ];

    return async ({ result }) => {
      messages = result.data.session.messages;

      form.children['message'].disabled = false;
      form.children['message'].focus();
      // `result` is an `ActionResult` object
      if (result.type === 'error') {
        await applyAction(result);
      }
    };
  }
</script>

<div id="chatbox">
	<div id="bubblebox" bind:this={bubblebox}>
		{#each messages as message}
			<div
				class="chat-bubble"
				class:sent={isCurrentUser(message)}
				aria-busy={message.loading ? 'true' : 'false'}
			>
				{@html message.content.replace('\n', '<br>')}
			</div>
		{/each}
	</div>
	<form method="POST" use:enhance={enhancer}>
		<input bind:this={input} type="text" name="message" />
	</form>
</div>

<style>
	#chatbox {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		justify-content: flex-end;
		border: 1px solid var(--range-border-color);
		border-radius: var(--border-radius);
	}
	#bubblebox {
		flex-grow: 0;
		display: flex;
		overflow: auto;
		flex-direction: column;
		padding-bottom: 5px;
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
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		border-bottom-left-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
	}
</style>
