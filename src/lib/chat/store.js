import Store from 'svelegante';
import './types.d';

/**
 * @typedef FrontendData
 * @property {string} session_id
 * @property {'open' | 'closed'} status
 * @property {import('$lib/server/openai').OpenAIChatMessage[]} messages
 */

/** @extends{Store<FrontendData>} */
class Conversation extends Store {
	/**
	 * @param {import('$lib/server/openai').OpenAIChatMessage} message
	 */
	addMessage(message) {
		this.update((data) => ({ ...data, messages: [ ...data.messages, message ] }));
	}

  /**
   * @param {import('$lib/server/openai').OpenAIChatMessage[]} messages
   */
  replaceMessages(messages) {
		this.update((data) => ({ ...data, messages}));
  }
}

export default Conversation;
