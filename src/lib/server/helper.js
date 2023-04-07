import { openai } from "./openai";

/**
* @async
* @param {string} message - The message to be translated
* @param {string} language - The target language
* @returns {Promise<string>}
* @description Use OpenAIChatCompletion to translate a message to the desired language
* @example translaMessage('Hello World', 'pt-BR') => 'Olá Mundo'
*/
export async function translateMessage(message, language) {
	return language.includes('en')
		? message
		: await openai
				.createChatCompletion({
					messages: [
						{
							role: 'user',
							content: `Translate "${message}" to ${language}.`
						}
					]
				})
				.then((c) => c.choices[0].message.content.trim());
}
