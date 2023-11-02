import '$lib/openai/types.d'

/**
* @typedef {Object} Item
* @property {string} item
* @property {number} qty
* @property {string[]} extras
*/

/**
* @typedef {Object} Order
* @property {string} name
* @property {string} message
* @property {Item[]} items
*/

/**
* @typedef {Object} Session
* @property {string} sessionid
* @property {OpenAIChatMessage[]} messages
* @property {Order[]} orders
*/

/**
 * @typedef {Object} FrontendData
 * @property {'open' | 'closed'} status
 * @property {OpenAIChatMessage} systemMessage
 * @property {OpenAIChatMessage[]} messages
 * @property {string} secretKey
 * @property {'gpt-3.5-turbo'|'gpt-4'} model
 */

