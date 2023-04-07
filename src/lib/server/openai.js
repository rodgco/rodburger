import { OPENAI_API_KEY } from '$env/static/private';
import { createParser } from 'eventsource-parser';

import '$lib/chat/types.d';

function openaiAPI() {
	var base_url = 'https://api.openai.com/v1';
	var bearer = 'Bearer ' + OPENAI_API_KEY;
	return {
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
				return "Something went wrong at OpenAI's endpoint";
			}

			const data = await res.json();
      console.log('tokens:', data.usage.total_tokens);
			return data;
		},
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

      const stream = new ReadableStream({
        async start(controller) {
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
                const text = json.choices[0].delta.content || "";

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
          for await (const chunk of res.body) {
            parser.feed(decoder.decode(chunk));
          }
        }
      });
      return stream;
    }
    };
}

export const openai = openaiAPI();
