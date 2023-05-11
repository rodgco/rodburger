<script>
	import { onMount } from "svelte";

  /** @type {"user" | "assistant" | "system" | "loading"} */
  export let role;

  /** @type {HTMLElement} */
  let bubble;

  onMount(() => {
    bubble.scrollIntoView(true);
    })
    
</script>

<pre
  bind:this={bubble}
	class="chat-bubble"
	class:sent={role === 'user'}
	aria-busy={role === 'loading'}
  on:dblclick><slot /></pre>

<style>
	.chat-bubble {
    flex: 0 0 auto;
		white-space: pre-wrap;
		overflow: auto;
		font-family: inherit;
		color: var(--secondary-inverse);
		padding: 10px 20px;
		border-radius: var(--border-radius);
		max-width: 20rem;
		margin: 5px 5px 0 5px;
		background-color: var(--secondary);
		align-self: flex-start;
	}
	.sent {
    margin-left: auto;
		color: var(--primary-inverse);
		background-color: var(--primary);
		align-self: flex-end;
	}
</style>
