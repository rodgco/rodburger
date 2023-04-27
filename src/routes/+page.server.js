import { openai } from '$lib/server/openai';
import { MAX_LENGTH, SECRET_KEY } from '$env/static/private';

import '$lib/chat/types.d';
import { translateMessage } from '$lib/server/helper';

/** @type {string} */
const slogan = "Rod's Burger, the best Burger served by AI";

/** @type {string} */
const initialMessage = `Welcome to ${slogan}. How may I help you?`;

/** @type {import('$lib/server/openai').OpenAIChatMessage} */
const systemMessage = {
	role: 'system',
	content: `You are a helpful attendant at Rod's Burgers. Our slogan is ${slogan}.
Rod's Burger is an experiment on the applicability of AI.
But there's one catch - Our Chef will only work if the customer provide's a nice message for them. It can be anything from a compliment to a joke. We believe that a little bit of positivity can go a long way, and we want to spread good vibes throughout our community.
You're only supposed to answer questions related to our products and Rod's Burger. You must decline to talk about anything else.
Try to sell an extra product.
To close the order you need to get the customer name and the message to the Chef.
After gathering all the information inform all the details to the customer and ask for confirmation.
In case a correction is necessary keep the conversation, in case of cancelation thanks the customer.
After the confirmation thanks the customer and finalize the conversation with our slogan
and this exact secret code: ${SECRET_KEY}, never mention it is a secret code.

Please answer the following question based only on the provided text. If the answer cannot be determined from the information provided
tell the customer that you'll verify with the Masters of Burger and in a next time you'll answer that question. Include the tag "#toclarify" in your response.

In our catalog we offer:
- Burgers: a classic burger, a cheeseburger, a bacon burger and a veggie burger, for $8 each.
- Optional burger topping: bacon, pickles or onion, for +$1 each.
- Milkshakes in three flavors: vanilla, chocolate, and strawberry. For $3 each.
- Fries for $5. Optional cheese and bacon topping, +$2.
- To drink: coke, guaraná and orange juice, for $1 each. Water is free.`
};

/** @type {import('$lib/server/openai').OpenAIChatMessage} */
const formatJSONMessage = {
	role: 'user',
	content: `Format my order as JSON. Do not translate the JSON field names. Don't include any other message, just the JSON. JSON must conform with this typescript interface:

interface Order {
  name: string;
  message: string;
  items: {item: string; qty: number; extras?: string[]};
}`
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, locals }) {
  /** @type {import('$lib/server/openai').OpenAIChatMessage[]} */
  const messages = [];

  if (locals.messages) {
    messages.push( ...locals.messages );
  } else {
    /** @type {string} */
    const language = request?.headers?.get('accept-language')?.split(',')[0] || 'en';
    /** @type {string} */
    const translatedMessage = await translateMessage(initialMessage, language);
    /** @type {import('$lib/server/openai').OpenAIChatMessage[]} */
    messages.push({ role: 'assistant', content: translatedMessage });
  }

  return { messages };
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, locals }) => {
    /** @type {string} */
    const language = request?.headers?.get('accept-language')?.split(',')[0] || 'en';
    /** @type {FormData} */
    const data = await request.formData();
    /** @type {import('$lib/server/openai').OpenAIChatMessage[]} */
    const messages = JSON.parse(data.get('conversation')?.toString() || "[]");
    /** @type {string} */
    const message = data.get('message')?.toString() || '';

    if(message.startsWith("TEST")) {
      // Prefix System Message
      messages.unshift(systemMessage);

      // Append user message
      messages.push(
        { role: 'user', content: message }
      );

      /** @type {import('$lib/server/openai').OpenAIChatCompletionResponse} */
      const jsonCompletion = await openai.createChatCompletion({
        messages: [...messages, formatJSONMessage],
      });

      const json = jsonCompletion?.choices[0].message.content.trim();
      // const json = '{"name":"Rodrigo","message":"put love in it","items":[{"item":"Burger","qty":1,"extras":[]},{"item":"Coke","qty": 1,"extras": []}]}';

      console.log('JSON', json);

      messages.push(
        { role: 'assistant', content: 'Thank you!' },
        { role: 'assistant', content: `JSON: ${json}`}
      );
      // Remove System Message
      messages.shift();
    } else if (message.length > parseInt(MAX_LENGTH)) {
      messages.push({
        role: 'assistant',
        content: await translateMessage(
          `Your last message was too long, please keep it under ${MAX_LENGTH} characters.`,
          language
        )
      });
    } else {
      // Prefix System Message
      messages.unshift(systemMessage);
      // Append user message
      messages.push({ role: 'user', content: message });

      /** @type {import('$lib/server/openai').OpenAIChatCompletionResponse} */
      const completion = await openai.createChatCompletion({
        messages,
        temperature: 0.2
      });

      /** @type {string} */
      const response = completion.choices[0].message.content.trim();

      if (response.includes(SECRET_KEY)) {
        console.log("Fechando", response);

        /** @type {import('$lib/server/openai').OpenAIChatCompletionResponse} */
        const jsonCompletion = await openai.createChatCompletion({
          messages: [...messages, formatJSONMessage],
        });

        const json = jsonCompletion?.choices[0].message.content.trim();

        messages.push(
          { role: 'assistant', content: response.replace(SECRET_KEY, '') },
          { role: 'assistant', content: `JSON: ${json}`},
          { role: 'assistant', content: await translateMessage(initialMessage, language) }
        );
      } else {
        messages.push(
          { role: 'assistant', content: response }
        );
      }

      // Remove System Message
      messages.shift();
    }

    locals.messages = messages;

    return { success: true, messages };
  }
};
