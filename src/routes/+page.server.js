import { fail } from '@sveltejs/kit';
import { v4 } from 'uuid';
import { openai } from '$lib/server/openai';

import '$lib/chat/types.d';

/** @type {Session[]} */
const sessions = [];

/** @type {string} */
const finalMessage = "Rod's Burger, the best Burger served by AI.";

/** @type {string} */
const initialMessage = `Welcome to ${finalMessage} How may I help you?`

/** @type {OpenAIChatMessage} */
const systemMessage = {
	role: 'system',
	content: `You are a helpful attendant at Rod's Burgers. Our Chef love to receive nice messages from our customers. You're only supposed to answer questions related to our products. Everything else you should inform the customer that you can't inform about the topic. Try to sell an extra product. To close the order you need to get the customer name and a nice message to the Chef.
After gathering all the information inform all the details to the customer and ask for confirmation. In case a correction is necessary keep the conversation, in case of cancelation thanks the customer.
After confirmation thanks the customer and finalize the conversation with this exact message: "${finalMessage}" and this exact secret code: ##!@@##, without mentioning it is a secret code.

In our catalog we offer:
- Burger: 160g of meat with cheddar cheese on australian bread. Customers my opt for the following toppings: bacon, pickles, onion. The burger costs $10, each topping $2.
- Fries: 200g of french fries, for $5. Customers my opt for cheese with bacon toppings, for $2.
- Sodas: coke, guaraná and water, for $3 each.
`
};

/** @type {OpenAIChatMessage} */
const formatJSONMessage = {
  role: 'user',
  content: `Format the my order as JSON. Do not translate the JSON field names. Don't include any other message, just the JSON. JSON must conform with this typescript interface:

interface Order {
  "name": string;
  "message": string;
  "items": {"item": string; "qty": number; "extras": string[]};
}`
}

/** @type {import('./$types').PageServerLoad} */
export function load({ cookies }) {
	/** @type {string | undefined} */
	const sessionid = cookies.get('sessionid') || v4();

	/**@type {Session | undefined } */
	let session = sessions.find((e) => e.sessionid === sessionid);

	if (!session) {
		cookies.set('sessionid', sessionid);
		session = { sessionid, messages: [{ role: 'assistant', content: initialMessage }], orders: [] };
		sessions.push(session);
	}

	const messages = session.messages;
  const orders = session.orders;

	return { messages, orders };
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ cookies, request }) => {
		const sessionid = cookies.get('sessionid');
		const session = sessions.find((e) => e.sessionid === sessionid);

		if (!session) {
			console.log(`Are you with brinqueition with me?!?`);
			return fail(505, { error: 'Are you with brinqueition with me?!?' });
		}
		const data = await request.formData();
		const message = /** @type {string} */ data.get('message')?.toString() || "";

    if (message.length > 100) {
      session.messages.push({ role: 'assistant', content: 'Your last message was too long, keep it under 100 characters, please' });
      return { success: false }
    }

		session.messages.push({ role: 'user', content: message });

		const messages = [systemMessage, ...session.messages];

		const completion = await openai.createChatCompletion({
			messages,
			user: sessionid
		});

    const response = completion.choices[0].message.content.trim();

    session.messages.push({
      role: 'assistant',
      content: response 
    });

    if (response.includes("##!@@##")) {
      const jsonCompletion = await openai.createChatCompletion({
        messages: [...messages, formatJSONMessage],
        user: sessionid
      });

      const json = JSON.parse(jsonCompletion.choices[0].message.content.trim());

      session.orders.push(json);
      session.messages = [
        { role: 'assistant', content: response.replace('##!@@##', '') },
        { role: 'assistant', content: initialMessage }
      ]
    }


		return { success: true, session };

	}
};
