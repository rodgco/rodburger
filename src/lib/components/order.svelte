<script>
	import { onMount } from 'svelte';

	/**
	 * @typedef Order
	 * @property {string} name
	 * @property {string} message
	 * @property {object[]} items
	 * @property {string} items.qty
	 * @property {string} items.item
	 * @property {string[]} [items.extras]
	 */

	/** @type {string} */
	export let order;

	/** @type {Order} */
	let jsonOrder = {
		name: 'Rodrigo',
		message: 'Tá ralando',
		items: []
	};

	onMount(() => {
		const start = order.indexOf('{');
		const end = order.lastIndexOf('}');

		try {
			jsonOrder = JSON.parse(order.substring(start, end + 1));
		} catch (/** @type {any} */ err) {
			jsonOrder = {
				name: 'Error',
				message: 'Something went wrong at the kitchen, try again later',
				items: []
			};
		}
	});
</script>

<div class="order" on:dblclick>
	<code>
		<header>{jsonOrder.name}</header>
		{#each jsonOrder.items as item}
			<div>
				{`${item.qty} - ${item.item} ${
					item.extras && item.extras.length > 0 ? `[${item.extras}]` : ''
				}`}
			</div>
		{/each}
		<footer>"{jsonOrder.message}"</footer>
	</code>
</div>

<style>
	.order {
		width: 60%;
		color: var(--code-color);
		background-color: #f2cd5d;
		align-self: center;
		border-top: 4px dotted orange;
		border-bottom: 4px dotted orange;
		border-left: 4px solid orange;
		border-right: 4px solid orange;
		padding: 0.75rem 0.25rem;
		margin: 0.25rem auto;
	}
	code {
		background: none;
		width: 100%;
	}
	header,
	footer {
		text-align: center;
		font-weight: bold;
	}
	header {
		margin-bottom: 0.25rem;
	}
	footer {
		margin-top: 0.25rem;
	}
</style>
