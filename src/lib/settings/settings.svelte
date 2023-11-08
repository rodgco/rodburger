<script>
	import { store as settings, value } from '$lib/settings';
  import '$lib/settings/types.d';

	/** @type {SettingsData} */
	let tempSettings = Object.assign(value);

	/** @type {string} */
	let defacedKey = '';

	/** @type {boolean} */
	let changeFlag = false;

	/** @type {HTMLDialogElement} */
	let modal;

	/** @type {boolean} */
	let show = false;

  /** @type {string} */ 
  let pattern = 'sk-[a-zA-Z0-9]{48}|sk-\\.{3}[a-zA-Z0-9]{4}';

	/**
	 * @param {string} key
	 * @returns {string}
	 */
	function defaceKey(key) {
		return key.length > 0 ? `sk-...${key.slice(-4)}` : key;
	}

	function openDialog() {
		changeFlag = false;
		tempSettings = { ...$settings };
		defacedKey = defaceKey(tempSettings.secret_key);
		show = true;
		modal.showModal();
	}

	function closeDialog() {
		modal.close();
		show = false;
	}

	/** @type {import('svelte/elements').EventHandler<Event, HTMLFormElement>} */
	function handleSubmit() {
    // 51 is the length of a key
		if (changeFlag && defacedKey.length === 51) $settings.secret_key = defacedKey;
		$settings.model = tempSettings.model;
	}

	function toggleChange() {
		changeFlag = true;
	}
</script>

<button
	class="trigger"
	type="button"
	data-target="modal-example"
	on:click={openDialog}
	title="Settings"><i class="fnt-engine" /></button
>

<dialog id="modal-example" bind:this={modal} on:toggle={(e) => console.log(e)}>
	<form method="dialog" on:submit={handleSubmit}>
		<article>
			<button
				type="button"
				value="cancel"
				aria-label="Close"
				class="close outline"
				data-target="modal-example"
				on:click={closeDialog}
			/>
			<h3>Settings</h3>
			<!-- svelte-ignore a11y-autofocus -->
			<input type="hidden" bind:value={tempSettings.secret_key} autofocus />
			<label
				>OpenAI API Secret Key (<a
					href="https://platform.openai.com/account/api-keys"
					target="_blank">get yours!</a
				>)
				<input
					type="text"
					name="key"
					bind:value={defacedKey}
					on:change={toggleChange}
          {pattern}
          required
					title="Must be a valid OpenAI API Key"
				/>
			</label>
			<label
				>Model
				<select name="model" bind:value={tempSettings.model}>
					<option value="gpt-3.5-turbo">GPT-3.5-Turbo</option>
					<option value="gpt-4">GPT-4</option>
					<option value="gpt-4-1106-preview">GPT-4-Turbo (1106-Preview)</option>
				</select>
			</label>
			<footer>
				<button
					type="button"
					value="cancel"
					class="secondary"
					data-target="modal-example"
					on:click={closeDialog}
				>
					Cancel
				</button>
				<button type="submit" data-target="modal-example">Confirm</button>
			</footer>
		</article>
	</form>
</dialog>

<style>
	.trigger {
		flex-grow: 0;
		padding: calc(var(--form-element-spacing-vertical) * 0.2)
			calc(var(--form-element-spacing-horizontal));
		margin: 0;
	}
	footer > button {
		display: inline;
		width: auto;
	}
</style>
