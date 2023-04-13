<script>
	import '@picocss/pico';
	import '../app.css';
</script>

<svelte:body data-theme='light' />

<div id="outter">
	<header>
		<h1><img src="rodburger.svg" alt="A burger"/></h1>
		<nav>
			<ul>
				<li><a href="/about">about</a></li>
			</ul>
		</nav>
	</header>

	<slot />

	<footer>
		<nav>
			<ul>
				<li><a href="https://github.com/rodgco">Github</a></li>
				<li><a href="https://twitter.com/rodg_co">Twitter</a></li>
				<li><a href="https://linkedin.com/in/rodgco">LinkedIn</a></li>
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
	footer {
		width: 100%;
		text-align: center;
	}
	footer > nav {
		margin: 0 auto;
	}
</style>
