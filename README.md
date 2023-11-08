# RodBurger

Welcome to Rod's Burger, where we serve up the juiciest, most delicious burgers in town! We are an experiment using the OpenAI ChatCompletion API to create a virtual assistant that can take your orders and answer any questions you may have about our menu.

Our menu is simple, but it packs a flavorful punch. We have a classic burger, a cheeseburger, a bacon burger, and a veggie burger for our vegetarian friends. Our mennu also includes side of fries and drinks. We also have milkshakes in three flavors: vanilla, chocolate, and strawberry. Just ask our virtual assistant to learn more!

Our virtual assistant is here to make your ordering process smooth and easy. Just tell us what you'd like to order, and we'll take care of the rest. We can also help answer any questions you may have about our menu or ingredients.

But there's one catch - before we can send your order to the chef, we ask that you provide a nice message for them. It can be anything from a compliment to a joke. We believe that a little bit of positivity can go a long way, and we want to spread good vibes throughout our community.

So come on in and give us a try! Our virtual assistant is ready and waiting to take your order and make your day a little bit brighter. Thank you for choosing Rod's Burger!

## Technicalities

Rod's Burger was built with [Svelte](https://svelte.dev) & [SvelteKit](https://kit.svelte.dev), and is configured to run at [Vercel](https://vercel.com).

Once you've cloned the project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

There is other configuration required to run the server.

## The Only Requirement

Rod's Burger uses the Chat Completion API from OpenAI, the same one used by ChatGPT. Costs for using it can explode if used by too many people, but it is very cheap when used responsibly by a single person. That's why we decided that anyone who wants to experiment our burgers must bring their own [OpenAI API Secret Key](https://platform.openai.com/account/api-keys). Your key will be stored in your browser local storage, and kept safe as long as the source of code of this app remains original.

Go grab your [OpenAI API Secret Key](https://platform.openai.com/account/api-keys) and experiment our Burgers.
