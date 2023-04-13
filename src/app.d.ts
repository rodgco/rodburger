// See https://kit.svelte.dev/docs/types#app

import type { OpenAIChatMessage } from "$lib/server/openai";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      messages: OpenAIChatMessage[];
    }
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
