import Store from 'svelegante';
import openaiAPI from '$lib/openai';

/** @extends{Store<import('./types.d').FrontendData>} */
export default class Conversation extends Store {
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

  /** @type {OpenAIChatMessage} */
  get systemMessage() {
    return this.current().systemMessage;
  }

  /** @type {OpenAIChatMessage[]} */
  get messages() {
    return this.current().messages;
  }

  /** @type {string} */
  get secretKey() {
    return this.current().secretKey;
  }

  /** @param {string} secretKey */
  set secretKey(secretKey) {
    this.update((data) => ({ ...data, secretKey }));
  }

  /** @type {'gpt-3.5-turbo'|'gpt-4'|'gpt-4-1106-preview'} */
  get model() {
    return this.current().model;
  }

  /** @param {'gpt-3.5-turbo'|'gpt-4'|'gpt-4-1106-preview'} model */
  set model(model) {
    this.update((data) => ({ ...data, model }));
  }

  /**
   * @param {'gpt-3.5-turbo'|'gpt-4'|'gpt-4-1106-preview'|null} model
   * @param {Partial<OpenAIChatCompletionRequest>} config
   * @returns {Promise<string>}
   */
  async callAPI(model = null, config = {}) {
    config = {
      temperature: 0.5,
      ...config,
      messages: [this.systemMessage, ...this.messages]
    };

    const openai = openaiAPI(this.secretKey, model || this.model);

		/** @type {OpenAIChatCompletionResponse} */
		const completion = await openai.createChatCompletion(config);

		/** @type {string} */
		const response = completion.choices[0].message.content.trim();

    return response;
  }
}

