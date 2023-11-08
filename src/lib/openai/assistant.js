import Svelegante from 'svelegante';
import { store as settings } from '$lib/settings';
import { get } from 'svelte/store'; 

/** @extends {Svelegante<OpenAIAssistant | null>} */
class OpenAIAssistant extends Svelegante {
	/**
	 * @param {string} api_key
	 * @param {string} assistantId
	 */
	constructor(api_key, assistantId) {
		super();
		this.base_url = 'https://api.openai.com/v1';
		this.bearer = 'Bearer ' + api_key;
		this.assistantId = assistantId;

		fetch(`${this.base_url}/assistants/${assistantId}`, {
			method: 'GET',
			headers: {
				Authorization: this.bearer,
				'OpenAI-Beta': 'assistants=v1',
				'Content-Type': 'application/json'
			}
		})
			.then((res) => res.json())
			.then((data) => {
				this.set(data);
			});
	}
}

const openAIAssistant = new OpenAIAssistant(get(settings).secret_key, 'asst_Llr1ORVU02JEc3e96Esn6LW7');

export default openAIAssistant;
