<script>
	import { dispatch_dev, onMount } from 'svelte/internal';
	import './types.d';

	/** @type {Message[]} */
	export let messages = [];
	export let currentUser = '';

	/** @type {HTMLDivElement} */
	let bubblebox;

	/** @type {HTMLInputElement} */
	let input;

	/**
	 * @param {Message} message
	 */
	function isCurrentUser(message) {
		return message.sender === currentUser;
	}

	onMount(() => {
		bubblebox.scrollTop = bubblebox.scrollHeight;
	});

	function answer() {
		if (!input.value || input.value === '') return;
		messages = [
			...messages,
			{ sender: 'user', content: input.value || '???' },
			{ sender: 'assistant', loading: true, content: 'Working' }
		];
		input.value = '';
		input.focus({ focusVisible: true });
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
				{message.content}
			</div>
		{/each}
	</div>
	<form on:submit={answer}>
		<input bind:this={input} type="text" />
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
