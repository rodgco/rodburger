import { OPENAI_API_KEY } from '$env/static/private';
import { createParser } from 'eventsource-parser';

/**
 * Represents a completion request for the OpenAI API.
 *
 * @typedef {Object} OpenAICompletionRequest
 * @property {string} model - The name of the language model to use.
 * @property {string} prompt - The input prompt to generate completions for.
 * @property {string} [suffix] - The text to append to the prompt before generating completions.
 * @property {number} [max_tokens] - The maximum number of tokens to generate in the completion.
 * @property {number} [temperature] - Controls the "creativity" of the generated text, with higher values resulting in more creative output.
 * @property {number} [top_p] - Controls the diversity of the generated text by generating completions with a cumulative probability of up to `top_p`.
 * @property {number} [n] - The number of completions to generate.
 * @property {boolean} [stream] - Whether to stream the results back as they are generated, rather than waiting for all completions to be generated.
 * @property {number} [logprobs] - Controls the amount of log probability data returned with the response.
 * @property {boolean} [echo] - Whether to include the input prompt in the response.
 * @property {string|string[]} stop - A string or an array of strings indicating tokens that should prompt the model to stop generating completions.
 * @property {number} [presence_penalty] - Controls the degree to which the model considers whether a token has already been generated in previous tokens.
 * @property {number} [frequency_penalty] - Controls the degree to which the model considers the frequency of a token in the training data when generating completions.
 * @property {number} [best_of] - The number of candidates to generate completions from, with the highest log probabilities.
 * @property {*} [logit_bias] - A bias vector to use when generating completions.
 * @property {string} [user] - An optional identifier for the user making the request.
 */

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

/**
 * Represents a response from the OpenAI chat endpoint.
 *
 * @typedef {Object} OpenAIChatCompletionResponse
 * @property {string} id - The identifier of the completion request.
 * @property {string} object - The object type, which is always 'chat.completion'.
 * @property {number} created - The Unix timestamp (in seconds) when the request was created.
 * @property {string} model - The name of the model used for the request.
 * @property {Object} usage - The number of tokens used for the prompt, completion, and total.
 * @property {number} usage.prompt_tokens - The number of tokens used for the prompt.
 * @property {number} usage.completion_tokens - The number of tokens used for the completion.
 * @property {number} usage.total_tokens - The total number of tokens used.
 * @property {Object[]} choices - An array of possible completions, each containing a message and finish reason.
 * @property {OpenAIChatMessage} choices[].message - The message object containing the bot's response.
 * @property {string} choices[].finish_reason - The reason why the completion finished, e.g. 'stop' or 'max_tokens'.
 * @property {number} choices[].index - The index of the choice in the array.
 */

function openaiAPI() {
	const base_url = 'https://api.openai.com/v1';
	const bearer = 'Bearer ' + OPENAI_API_KEY;
	return {
		/**
		 * @param {Partial<OpenAICompletionRequest>} request
		 */
		createCompletion: async (request) => {
			const body = JSON.stringify({
				prompt: 'Once upon a time',
				model: 'text-davinci-003',
				max_tokens: 100,
				temperature: 0.6,
				...request
			});

			const res = await fetch(`${base_url}/completions`, {
				method: 'POST',
				headers: {
					Authorization: bearer,
					'Content-Type': 'application/json'
				},
				body
			});

			if (!res.ok) {
				const err = await res.text();
				console.log(err);
				return "Something went wrong at OpenAI's endpoint";
			}

			const data = await res.json();
			return data;
		},
		/**
		 * @param { Partial<OpenAIChatCompletionRequest> } request
		 * @returns {Promise<OpenAIChatCompletionResponse>}
		 */
		createChatCompletion: async (request) => {
			const body = JSON.stringify({
				model: 'gpt-4',
				messages: [{ role: 'user', content: 'Hello!' }],
				max_tokens: 300,
				...request
			});

			const res = await fetch(`${base_url}/chat/completions`, {
				method: 'POST',
				headers: {
					Authorization: bearer,
					'Content-Type': 'application/json'
				},
				body
			});

			if (!res.ok) {
				const err = await res.text();
				console.log(err);
				return {
					id: 'chat-no-completion',
					object: 'chat.completion',
					created: 1677649420,
					model: request.model || 'gpt-4',
					usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
					choices: [
						{
							message: {
								role: 'assistant',
								content: "It seems we're busy at the kitchen right now, please try again later."
							},
							finish_reason: 'null',
							index: 0
						}
					]
				};
			}

			const data = await res.json();
			console.log('tokens:', data.usage.total_tokens);
			return data;
		},
		/** @param { Partial<OpenAIChatCompletionRequest> } request */
		createChatCompletionStream: async (request) => {
			const body = JSON.stringify({
				model: 'gpt-4',
				messages: [{ role: 'user', content: 'Hello!' }],
				max_tokens: 300,
				top_p: 1.0,
				frequency_penalty: 0.0,
				presence_penalty: 0.0,
				...request,
				stream: true
			});

			const encoder = new TextEncoder();
			const decoder = new TextDecoder();

			let counter = 0;

			const res = await fetch(`${base_url}/chat/completions`, {
				method: 'POST',
				headers: {
					Authorization: bearer,
					'Content-Type': 'application/json'
				},
				body
			});

			/** @type { ReadableStream } */
			const stream = new ReadableStream({
				async start(controller) {
          /** @param {any} event */
					function onParse(event) {
						if (event.type === 'event') {
							const { data } = event;
							// https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
							if (data === '[DONE]') {
								controller.close();
								return;
							}
							try {
								const json = JSON.parse(data);
								const text = json.choices[0].delta.content || '';

								if (counter < 2 && (text.match(/\n/) || []).length) {
									// this is a prefix character (i.e., "\n\n"), do nothing
									return;
								}
								const queue = encoder.encode(text);
								controller.enqueue(queue);
								counter++;
							} catch (e) {
								controller.error(e);
							}
						}
					}

					// stream response (SSE) from OpenAI may be fragmented into multiple chunks
					// this ensures we properly read chunks and invoke an event for each SSE event stream
					const parser = createParser(onParse);
					// https://web.dev/streams/#asynchronous-iteration
					for await (const chunk of res?.body) {
						parser.feed(decoder.decode(chunk));
					}
				}
			});
			return stream;
		}
	};
}

export const openai = openaiAPI();
