<script>
	import '@picocss/pico';
	import '../app.css';
	import { onMount } from 'svelte';

	/** @type {Boolean} */
	let dark_mode;

	onMount(() => {
		dark_mode = window.matchMedia('(prefers-color-scheme:dark)').matches;
		if (localStorage.getItem('invertMode') === 'true') dark_mode = !dark_mode;
	});

	/**
	 *   @param {HTMLBodyElement} node
	 *   @param { "dark" | "light" } mode
	 *   @import('@svelte/kit').action
	 */
	const darkModeSwitch = (node, mode) => {
		const html_element = /** @type HTMLHtmlElement */ (node.parentNode);
		html_element?.setAttribute('data-theme', mode);

		return {
			update(/** @type { "dark" | "light" } */ mode) {
				html_element.setAttribute('data-theme', mode);
				if (dark_mode !== window.matchMedia('(prefers-color-scheme:dark)').matches) {
					localStorage.setItem('invertMode', 'true');
				} else {
					localStorage.removeItem('invertMode');
				}
			},
			destroy() {}
		};
	};
</script>

<svelte:body use:darkModeSwitch={dark_mode ? 'dark' : 'light'} />

<div id="outter">
	<header>
		<h1><img src="rodburger.svg" alt="A burger"/></h1>
		<nav>
			<ul>
				<li><a href="/about">about</a></li>
				<li>
					<label for="switch">
						<input
							type="checkbox"
							id="switch"
							name="switch"
							role="switch"
							bind:checked={dark_mode}
						/>
						Dark mode
					</label>
				</li>
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
