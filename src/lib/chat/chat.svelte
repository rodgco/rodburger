<script>
	import { onMount, tick } from 'svelte/internal';
	import './types.d';

	/** @type {import('$lib/server/openai').OpenAIChatMessage[]} */
	export let messages = [];

	/** @type {string} */
	export let currentUser = 'user';

	/** @type {HTMLDivElement} */
	let bubblebox;

	$: if (messages && bubblebox) {
		console.log('Scrolling');
		tick();
		bubblebox.scrollTop = bubblebox.scrollHeight;
	}

	/**
	 * @param {import('$lib/server/openai').OpenAIChatMessage} message
	 */
	function isCurrentUser(message) {
		return message.role === currentUser;
	}

	onMount(() => {
		bubblebox.scrollTop = bubblebox.scrollHeight;
	});
</script>

<div id="chatbox">
	<div id="bubblebox" bind:this={bubblebox}>
		{#each messages as message}
			<div
				class="chat-bubble"
				class:sent={isCurrentUser(message)}
				aria-busy={message.content === "Loading" ? 'true' : 'false'}
			>
				{@html message.content.replace('\n', '<br>')}
			</div>
		{/each}
	</div>
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
</style>
