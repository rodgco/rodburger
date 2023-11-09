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
A complete order has the name of the customer, the message to the chef and at least one item.
A confirmed order must be complete and confirmed by the customer.

Don't include any other message, not even markdown annotation, just pure JSON. JSON must conform with this JSN schema:

{
  "name": "expedite_order",
  "description": "Expedite an order",
  "parameters": {
    "type": "object",
    "properties": {
      "complete": {
        "type": "boolean",
        "description": "Is the order complete?"
      },
      "confirmed": {
        "type": "boolean",
        "description": "The customer confirmed the order?"
      },
      "name": {
        "type": "string",
        "description": "The customer name"
      },
      "message": {
        "type": "string",
        "description": "The nice message to the Chef"
      },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "item": {
              "type": "string",
              "description": "Item name"
            },
            "qty": {
              "type": "integer",
              "description": "Quantity of the item"
            },
            "extras": {
              "type": "array",
              "items": {
                "type": "string",
                "description": "Extras to the item"
              }
            }
          },
          "required": [
            "item",
            "qty"
          ]
        }
      }
    },
    "required": [
      "complete",
      "confirmed",
      "name",
      "message",
      "items"
    ]
  }
}
`
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
    console.log('Backoffice',isComplete);

		return JSON.parse(isComplete);
	}

	return { checkCompleteness };
}
