import Conversation from './store';
import BackOffice from './backoffice';
import { initialMessage, systemMessage, resetMessage, missingKeyMessage } from './messages';
import { store as settings } from '$lib/settings';
import { get } from 'svelte/store';

const backOffice = BackOffice('gpt-4-1106-preview');

/** @extends{Conversation} */
class Attendant extends Conversation {
	close() {
		this.update((current) => ({ ...current, status: 'closed' }));
	}

	reset() {
    const { secret_key, model } = get(settings);
    if (this.secretKey === '' && secret_key === '') {
      this.replaceMessages([missingKeyMessage]);
      this.close();
    } else {
      this.secretKey = secret_key;
      this.model = model;
  		this.update((current) => ({ ...current, status: 'open', messages: [initialMessage] }));
    }
	}

  async callAssistant() {
    await this.callAPI()
      .then(async (/** @type {string} */ response) => {
        this.addMessage({ role: 'assistant', content: response });

        const isComplete = await backOffice.checkCompleteness(this.messages);
        console.log('isComplete', isComplete);
        const { complete, confirmed, name, message, items } = isComplete;

        if (complete && confirmed) {
          this.addMessage({
            role: 'assistant',
            content: `JSON: ${JSON.stringify({ name, message, items })}`
          });
          this.addMessage(resetMessage);
          this.close();
        }
      })
    .catch((e) => {
      console.log('error', e);
      this.addMessage(missingKeyMessage);
      this.close();
    });
  }
}

const { secret_key, model } = get(settings);

const attendant = new Attendant(
	{
		systemMessage,
		secretKey: secret_key,
		model,
		messages: [initialMessage],
		status: 'open'
	},
	{ storage: 'localStorage', key: 'conversation', load: true }
);

export default attendant;
