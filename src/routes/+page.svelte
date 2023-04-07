<script>
	import '$lib/chat/types.d';
	import Chat from '$lib/chat/chat.svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	$: ({ messages } = data);
	$: ({ orders } = data);
</script>

<Chat {messages} currentUser="user" />
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

<style>
	#orders {
		flex: 0 1 auto;
		width: 15rem;
		border: 1px solid var(--range-border-color);
		border-radius: var(--border-radius);
	}
	.order {
		margin: 0.25rem;
    padding: 0.25rem;
		background-color: var(--primary);
    color: var(--primary-inverse)
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
