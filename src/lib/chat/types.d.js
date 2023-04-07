/**
 * Represents a chat message.
 *
 * @typedef {Object} OpenAIChatMessage
 * @property {('system'|'user'|'assistant')} role - The role of the message sender, which can be "system", "user", or "assistant".
 * @property {string} content - The content of the message.
 */


/**
 * Represents a request for OpenAI chat completion.
 *
 * @typedef {Object} OpenAIChatCompletionRequest
 * @property {string} model - The name of the model to use for completion.
 * @property {OpenAIChatMessage[]} messages - The list of chat messages to use as prompt.
 * @property {number} [temperature] - Controls the randomness of the generated text.
 * @property {number} [top_p] - Controls the diversity of the generated text.
 * @property {number} [n] - How many completions to generate for each prompt.
 * @property {boolean} [stream] - Whether to stream back partial messages as they are generated.
 * @property {string|string[]} [stop] - Up to 4 sequences where the API will stop generating further tokens.
 * @property {number} [max_tokens] - The maximum number of tokens to generate in the completion.
 * @property {number} [presence_penalty] - Controls the degree to which model should favor generating tokens that are similar to the context.
 * @property {number} [frequency_penalty] - Controls the degree to which model should favor generating tokens that are less common in the training data.
 * @property {*} [logit_bias] - Controls the likelihood of generating tokens that match a given prompt.
 * @property {string} [user] - The ID of the user.
 */

