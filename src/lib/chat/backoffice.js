import Conversation from './store';
import { store as settings } from '$lib/settings';
import '$lib/openai/types.d';
import { get } from 'svelte/store';

const { secret_key } = get(settings);

/** @type {OpenAIChatMessage} */
const systemMessage = {
	role: 'system',
	content: `You are a helpful assistant that only responds in JSON format.
Extract the values from the conversation and format the order as a JSON.
Do not translate the JSON field names. 
Transform the message to the Chef into an imperative form.
A confirmed order must be complete and confirmed by the customer.

Don't include any other message, just the JSON. JSON must conform with this typescript interface:
If the order is not complete, set \`complete\` to \`false\`.
If the order is not confirmed, set \`confirmed\` to \`false\`.

interface Order {
  complete: boolean;
  confirmed: boolean;
  name?: string;
  message?: string;
  items?: {item: string; qty: number; extras?: string[]}[];
}

Example:
\`\`\`
{
  complete: true,
  confirmed: true,
  name: "Joaquim",
  message: "You're so beautiful",
  items: [
    { item: "burger", qty: 1, extras: ["bacon"] },
    { item: "coke", qty: 2}
  ]
}
\`\`\``
};

/**
 * @typedef {Object} CompletenessResponse
 * @property {boolean} complete
 * @property {boolean} confirmed
 * @property {string} [name]
 * @property {string} [message]
 * @property {Object[]} [items]
 * @property {string} items[].item
 * @property {number} items[].qty
 * @property {string[]} [items[].extras]
 */

/**
 * @param {'gpt-3.5-turbo'|'gpt-4'|'gpt-4-1106-preview'} model
 */
export default function createBackOffice(model = 'gpt-4-1106-preview') {
	/**
	 * @param {OpenAIChatMessage[]} messages
	 * @returns {Promise<CompletenessResponse>}
	 */
	async function checkCompleteness(messages) {
		const conversation = new Conversation({
			systemMessage: systemMessage,
			secretKey: secret_key,
			model,
			messages: [
				...messages,
				{ role: 'user', content: 'If this order is complete and confirmed, summarize it.' }
			],
			status: 'open'
		});

		const isComplete = await conversation.callAPI(null, { temperature: 0.1 });

		return JSON.parse(isComplete);
	}

	return { checkCompleteness };
}
