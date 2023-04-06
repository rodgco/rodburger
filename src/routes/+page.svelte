<script>
  import "$lib/chat/types.d";
  import Chat from '$lib/chat/chat.svelte';
  
  /** @type {Message[]} */
  let messages = [
    { sender: 'user', content: 'Hello' },
    { sender: 'assistant', content: 'Hi, how are you doing' },
    { sender: 'user', content: "I'm doing fine" },
  ];

</script>

<Chat bind:messages currentUser="user" />
<div id="orders"></div>

<style>
  #orders {
    flex: 0 1 auto;
    width: 15rem;
    border: 1px solid var(--range-border-color);
    border-radius: var(--border-radius);
  }
</style>
