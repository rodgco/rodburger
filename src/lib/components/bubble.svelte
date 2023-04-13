<script>

 /** @type {import('$lib/server/openai').OpenAIChatMessage} */
  export let message;
</script>

<div
  class="chat-bubble"
  class:sent={message.role === 'user'}
  aria-busy={message.content === 'Loading' ? 'true' : 'false'}
  >
  {@html message.content.replace('\n', '<br>')}
</div>

<style>
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
</style>
