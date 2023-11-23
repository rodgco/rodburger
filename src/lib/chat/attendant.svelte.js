import OpenAIAPI from 'openai';
import AssistantRunes from '$lib/openai/assistant_runes.svelte.js';
import { settings } from '$lib/settings';

/**
 * @typedef {Object} Feedback
 * @property {string} text
 */

/** @type {Feedback[]} */
let suggestions = $state([]);

/**
 * @typedef {Object} Order
 * @property {boolean} complete
 * @property {boolean} confirmed
 * @property {string} name
 * @property {string} messages
 * @property {Object[]} items
 * @property {string} items[].item
 * @property {number} items[].qty
 * @property {string} [items[].extras]
 */

/** @type {Order[]} */
let kitchen = $state([]);

const openai = new OpenAIAPI({ apiKey: settings.api_key, dangerouslyAllowBrowser: true });
const assistant = await AssistantRunes(
	openai,
	'asst_Llr1ORVU02JEc3e96Esn6LW7',
	settings.thread_id
).then((a) => {
	// @ts-ignore
	settings.thread_id = a.thread.id;
	a.addFunction('expedite_order', expediteOrder);
	a.addFunction('send_feedback', sendFeedback);
	return a;
});

/** @type {'open' | 'closed'} */
let status = $state('open');

/**
 * @param {Order} params
 */
function expediteOrder(params) {
	kitchen = [...kitchen, params];
	status = 'closed';
	return { success: true };
}

/**
 * @param {Feedback} params
 */
function sendFeedback(params) {
	suggestions = [...suggestions, params];
  console.log(suggestions);
	return { success: true };
}

const support = {
	suggestions,
	kitchen,
	status
};

export { assistant, support };
