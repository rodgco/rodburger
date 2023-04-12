import Store from 'svelegante';
import './types.d';

/**
 * @typedef RodBurgerChatMessage
 * @property {'order' | 'user' | 'assistant'} role
 * @property {string} content
 */

/**
 * @typedef FrontendData
 * @property {string} session_id
 * @property {'open' | 'closed'} status
 * @property {RodBurgerChatMessage[]} messages
 */

/** @extends{Store<FrontendData>} */
class Conversation extends Store {
	/**
	 * @param {RodBurgerChatMessage} message
	 */
	addMessage(message) {
		this.update((data) => ({ ...data, messages: { ...data.messages, message } }));
	}
}

export default Conversation;
