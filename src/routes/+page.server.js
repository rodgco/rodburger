import { fail } from '@sveltejs/kit';
import { v4 } from 'uuid';
import { openai } from '$lib/server/openai';
import { MAX_LENGTH, SECRET_KEY } from '$env/static/private';

import '$lib/chat/types.d';
import { translateMessage } from '$lib/server/helper';

/** @type {Session[]} */
const sessions = [];

/** @type {string} */
const slogan = "Rod's Burger, the best Burger served by AI";

/** @type {string} */
const initialMessage = `Welcome to ${slogan}. How may I help you?`;

/** @type {import('$lib/server/openai').OpenAIChatMessage} */
const systemMessage = {
	role: 'system',
	content: `You are a helpful attendant at Rod's Burgers. Our slogan is ${slogan}.
Rod's Burger is an experiment on the applicability of AI.
Our Chef will only work if the customer sends him a nice message, be sure to ask for one.
You're only supposed to answer questions related to our products and Rod's Burger.
You must decline to talk about anything else.
Try to sell an extra product.
To close the order you need to get the customer name and the message to the Chef.
After gathering all the information inform all the details to the customer and ask for confirmation.
In case a correction is necessary keep the conversation, in case of cancelation thanks the customer.
After the confirmation thanks the customer and finalize the conversation with our slogan
and this exact secret code: ${SECRET_KEY}, without mentioning it is a secret code.

In our catalog we offer:
- Burger: 160g of meat with cheddar cheese on australian bread, for $8. Optional toppings: bacon, pickles or onion, for +$1 each.
- Fries: 100g of french fries, for $5. Optional cheese and bacon toppings, +$2.
- To drink: coke, guaraná and orange juice, for $1 each. Water is free.`
};

/** @type {import('$lib/server/openai').OpenAIChatMessage} */
const formatJSONMessage = {
	role: 'user',
	content: `Format my order as JSON. Do not translate the JSON field names. Don't include any other message, just the JSON. JSON must conform with this typescript interface:

interface Order {
  "name": string;
  "message": string;
  "items": {"item": string; "qty": number; "extras": string[]};
}`
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	/** @type {string} */
	const language = request?.headers?.get('accept-language')?.split(',')[0] || 'en';

	/** @type {string | undefined} */
	const sessionid = cookies.get('sessionid') || v4();

	const translatedMessage = await translateMessage(initialMessage, language);

	/**@type {Session | undefined } */
	let session = sessions.find((e) => e.sessionid === sessionid);

	if (!session) {
		cookies.set('sessionid', sessionid);
		session = {
			sessionid,
			messages: [{ role: 'assistant', content: translatedMessage }],
			orders: []
		};
		sessions.push(session);
	}

	const messages = session.messages;
	const orders = session.orders;

	return { messages, orders };
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ cookies, request }) => {
		const language = request?.headers?.get('accept-language')?.split(',')[0] || 'en';
		const sessionid = cookies.get('sessionid');
		const session = sessions.find((e) => e.sessionid === sessionid);

		if (!session) {
			console.log(`Are you with brinqueition with me?!?`);
			return fail(505, { error: 'Are you with brinqueition with me?!?' });
		}
		const data = await request.formData();
		const message = /** @type {string} */ data.get('message')?.toString() || '';

		if (message.length > parseInt(MAX_LENGTH)) {
			session.messages.push({
				role: 'assistant',
				content: await translateMessage(
					`Your last message was too long, please keep it under ${MAX_LENGTH} characters.`,
					language
				)
			});
		} else {
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

			if (response.includes(SECRET_KEY)) {
				const jsonCompletion = await openai.createChatCompletion({
					messages: [...messages, formatJSONMessage],
					user: sessionid
				});

				const json = JSON.parse(jsonCompletion.choices[0].message.content.trim());

				session.orders.push(json);
				session.messages = [
					{ role: 'assistant', content: response.replace(SECRET_KEY, '') },
					{ role: 'assistant', content: await translateMessage(initialMessage, language) }
				];
			}
		}
		return { success: true, session };
	}
};
