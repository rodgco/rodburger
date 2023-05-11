import { createParser } from 'eventsource-parser';

/**
 * @param {string} api_key
 * @param {string} [model]
 */
function openaiAPI(api_key, model = 'gpt-3.5-turbo') {
	const base_url = 'https://api.openai.com/v1';
	const bearer = 'Bearer ' + api_key;
	return {
		/**
		 * @param { Partial<OpenAIChatCompletionRequest> } request
		 * @returns {Promise<OpenAIChatCompletionResponse>}
		 */
		createChatCompletion: async (request) => {
			const body = JSON.stringify({
				model,
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
					model: request.model || 'gpt-3.5-turbo',
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
				model,
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

export default openaiAPI;
