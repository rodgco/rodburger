import Store from 'svelegante';

import openaiAPI from '$lib/openai';
import { translateMessage } from '$lib/helper';
import {
	initialMessage,
	systemMessage,
	formatJSONMessage,
	missingKeyMessage,
	resetMessage
} from './messages';

import { store as settings } from '$lib/settings';

import '$lib/openai/types.d';
import { get } from 'svelte/store';
import { PUBLIC_SECRET_KEY } from '$env/static/public';

/** @extends{Store<import('./types.d').FrontendData>} */
class Conversation extends Store {
	/**
	 * @param {OpenAIChatMessage} message
	 */
	addMessage(message) {
		this.update((data) => ({ ...data, messages: [...data.messages, message] }));
	}

	/**
	 * @param {OpenAIChatMessage[]} messages
	 */
	replaceMessages(messages) {
		this.update((data) => ({ ...data, messages }));
	}

	/**
	 * @param {number} index
	 */
	removeMessage(index) {
		this.update((data) => ({ ...data, messages: data.messages.toSpliced(index, 1) }));
	}

	reset() {
		this.update((current) => ({ ...current, status: 'open', messages: [initialMessage] }));
	}

	async callAssistant() {
		/** @type {string} */
		const language = 'en';
		/** @type {OpenAIChatMessage[]} */
		const messages = [systemMessage, ...this.current().messages];
		const { secret_key: openai_api_key, model } = get(settings);

		if (openai_api_key === '') {
			conversation.addMessage(missingKeyMessage);
			return { success: true, messages };
		}

		const openai = openaiAPI(openai_api_key, model);

		/** @type {OpenAIChatCompletionResponse} */
		const completion = await openai.createChatCompletion({
			messages,
			temperature: 0.7
		});

		/** @type {string} */
		const response = completion.choices[0].message.content.trim();

		if (response.includes(PUBLIC_SECRET_KEY)) {
			this.addMessage({ role: 'assistant', content: response.replace(PUBLIC_SECRET_KEY, '') });

			/** @type {OpenAIChatCompletionResponse} */
			const jsonCompletion = await openai.createChatCompletion({
				messages: [
					formatJSONMessage,
					...this.current().messages,
					{ role: 'user', content: 'Summarize my order in JSON format.' }
				]
			});

			const json = jsonCompletion?.choices[0].message.content.trim();

			this.addMessage({ role: 'assistant', content: `JSON: ${json}` });
			this.addMessage(resetMessage);
			this.update((current) => ({ ...current, status: 'closed' }));
		} else {
			this.addMessage({ role: 'assistant', content: response });
		}
	}
}

const conversation = new Conversation(
	{
		session_id: '',
		messages: [initialMessage],
		status: 'open'
	},
	{ storage: 'localStorage', key: 'conversation', load: true }
);

export default conversation;
