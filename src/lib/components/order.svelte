<script>
	/**
	 * @typedef {Order}
	 * @property {string} name
	 * @property {string} message
	 * @property {string} items.qty
	 * @property {string} items.item
	 * @property {string[]} [items.extras]
	 */

	/** @type {Order} */
	export let order;
</script>

<div class="order">
  <code>
    <header>{order.name}</header>
    {#each order.items as item}
      <div>{`${item.qty} - ${item.item} ${item.extras?.length > 0 ? `[${item.extras}]` : ""}`}</div>
    {/each}
    <footer>"{order.message}"</footer>
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
		margin: 0.25rem 0;
	}
  code {
    background: none;
    width: 100%;
  }
  header, footer {
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
