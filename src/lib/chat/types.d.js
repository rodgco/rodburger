/**
* @typedef Item
* @property {string} item
* @property {number} qty
* @property {string[]} extras
*/

/**
* @typedef Order
* @property {string} name
* @property {string} message
* @property {Item[]} items
*/

/**
* @typedef Session
* @property {string} sessionid
* @property {import("$lib/server/openai").OpenAIChatMessage[]} messages
* @property {Order[]} orders
*/
