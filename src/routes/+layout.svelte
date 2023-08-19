<script>
	import '@picocss/pico';
	import '../app.css';

  import conversation from '$lib/chat/store';

	import Settings from '$lib/settings';
</script>

<svelte:body data-theme="light" />

<div id="outter">
	<header>
		<h1><a href="/"><img src="rodburger.svg" alt="A burger" /></a></h1>
		<div>
			<nav>
				<ul>
					<li><a href="/about">about</a></li>
				</ul>
			</nav>
			<Settings />
    <button class="progressier-install-button reset" data-icons="false" data-install="Install" data-installed="Installed"></button>
		<button class="reset" type="button" on:click={() => conversation.reset()}>Reset</button>
		</div>
	</header>

	<slot />

	<footer>
		<nav>
			<ul>
				<li><a href="https://github.com/rodgco/rodburger" target="_blank">Github</a></li>
				<li><a href="https://twitter.com/rodg_co" target="_blank">Twitter</a></li>
				<li><a href="https://linkedin.com/in/rodgco" target="_blank">LinkedIn</a></li>
			</ul>
		</nav>
	</footer>
</div>

<style>
	#outter {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 2rem;
	}
	header h1 {
		color: var(--primary);
		margin: 0;
	}
	header img {
		height: 2rem;
	}
  header > div {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .reset {
		flex-grow: 0;
		padding: calc(var(--form-element-spacing-vertical) * 0.2)
			calc(var(--form-element-spacing-horizontal));
		margin: 0;
  }
	footer {
		width: 100%;
		text-align: center;
	}
	footer > nav {
    justify-content: center;
		margin: 0 auto;
	}
</style>
