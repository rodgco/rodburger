/**
 * @param {import('openai').OpenAI} openai - The openai client
 * @param {Partial<import('openai').OpenAI.Beta.Assistant> | string} assistant - The AssistantObject or id of an existing assistant
 * @param {string | undefined} threadId - The id of an existing thread
 */
async function Assistant(openai, assistant, threadId) {
  /** @type {Record<string, Function>} */
  const functions = {};

  /** @type {string} */
  let id = '';

  /** @type {number} */
  let created_at = 0;

  /** @type {string | null} */
  let description = '';

  /** @type {Array<string>} */
  let file_ids = [];

  /** @type {string | null} */
  let instructions = '';

  /** @type {unknown | null} */
  let metadata = null;

  /** @type {string} */
  let model = 'gpt-4-1106-preview';

  /** @type {string | null} */
  let name = '';

  /**
   * @typedef {Array<
   *  import('openai').OpenAI.Beta.Assistant.CodeInterpreter |
   *  import('openai').OpenAI.Beta.Assistant.Retrieval |
   *  import('openai').OpenAI.Beta.Assistant.Function
   *  >} Tools
   */

  /** @type {Tools} */
  let tools = [];

  /** @type {'assistant'} */
  let object = 'assistant';

  /** @type {Thread | undefined} */
  let thread = $state();

  /** @type {Array<import('openai').OpenAI.Beta.Threads.ThreadMessage>} */
  let messages = $state([]);

  /** @type {Array<string>} */
  let runs = [];

  await Promise.all([
    Promise.resolve().then(() => {
      // Retrieve or create the assistant
      if (typeof assistant === 'string') {
        openai.beta.assistants.retrieve(assistant).then((a) => {
          id = a.id;
          created_at = a.created_at;
          description = a.description;
          file_ids = a.file_ids;
          instructions = a.instructions;
          metadata = a.metadata;
          model = a.model;
          name = a.name;
          tools = a.tools;
        });
      } else {
        const newAssistant = {
          model: 'gpt-4-1106-preview',
          description: 'You are a helpful assistant.',
          name: 'Unnamed Assistant',
          ...assistant
        };
        openai.beta.assistants.create(newAssistant).then((a) => {
          id = a.id;
          created_at = a.created_at;
          description = a.description;
          file_ids = a.file_ids;
          instructions = a.instructions;
          metadata = a.metadata;
          model = a.model;
          name = a.name;
          tools = a.tools;
        });
      }
    }),

    // Retrieve or create the thread
    await Thread.threadFactory(openai, threadId)
      .then((t) => {
        thread = t;
        return t;
      })
      .then((t) => {
        Promise.all([
          openai.beta.threads.messages.list(t.id).then((m) => {
            messages = m.data.reverse();
          }),
          openai.beta.threads.runs.list(t.id).then(async (activeRuns) => {
            for (const run of activeRuns.data) {
              if (run.status === 'requires_action') {
                monitorRun(run);
              }
            }
          })
        ]);
      })
  ]);

  /**
   * @param {import('openai').OpenAI.Beta.Threads.Run} run
   * @returns {Promise<void>}
   */
  async function monitorRun(run) {
    if (runs.includes(run.id)) return;
    runs.push(run.id);
    // @ts-ignore
    await openai.beta.threads.runs.retrieve(thread.id, run.id).then(async ({ status }) => {
      if (status === 'requires_action') {
        await stepSerializer(run);
      }
    });
    runs = runs.filter((r) => r !== run.id);
  }

  /**
   * @param {import('openai').OpenAI.Beta.Threads.Run} run
   * @returns {Promise<void>}
   */
  async function stepSerializer(run) {
    // @ts-ignore
    await openai.beta.threads.runs.steps.list(thread.id, run.id).then(async ({ data }) => {
      for (const step of data) {
        if (step.type === 'tool_calls') {
          // @ts-ignore
          for (const tool of step.step_details.tool_calls) {
            if (tool.type === 'function') {
              const {
                id,
                function: { name: funcName, arguments: args }
              } = tool;

              if (step.status !== 'completed') {
                // Run the respective function (if registered)
                const func = functions[funcName];

                const outputs =
                  typeof func === 'function'
                    ? func(JSON.parse(args))
                    : { error: `Function ${funcName} Not Found` };

                await openai.beta.threads.runs
                  // @ts-ignore
                  .submitToolOutputs(thread.id, run.id, {
                    tool_outputs: [{ tool_call_id: id, output: JSON.stringify(outputs) }]
                  })
                  .then(async () => {
                    // After submitting the tool outputs, we need to start monitoring the run again
                    await monitorRun(run);
                  });
              }
            }
          }
        }
      }
    });
  }

  /**
   * @param {string} runId
   * @returns {Promise<import('openai').OpenAI.Beta.Threads.Run>}
   */
  async function getRun(runId) {
    // @ts-ignore
    const run = await openai.beta.threads.runs.retrieve(thread.id, runId);
    return run;
  }

  /**
   * @param {import('openai').OpenAI.Beta.Threads.MessageListParams} query
   * @returns {Promise<Array<import('openai').OpenAI.Beta.Threads.ThreadMessage>>}
   */
  async function getMessages(query = {}) {
    // @ts-ignore
    return await openai.beta.threads.messages.list(thread.id, query).then((m) => m.data);
  }

  /**
   * @param {string} messageId
   * @returns {Promise<import('openai').OpenAI.Beta.Threads.ThreadMessage>}
   */
  async function getMessage(messageId) {
    // @ts-ignore
    const message = await openai.beta.threads.messages.retrieve(thread.id, messageId);
    return message;
  }

  /**
   * The poller is a static function that will poll the server Can youfCan youor new messages.
   * It will return the messages when the status of the last message is completed.
   *
   * @param {string} runId - The id of the run to poll
   * @param {string} last_message_id - The id of the last message received
   * @returns {Promise<import('openai').OpenAI.Beta.Threads.ThreadMessage[]>}
   */
  async function poller(runId, last_message_id) {
    /** @type{Array<import('openai').OpenAI.Beta.Threads.ThreadMessage>} */
    let messages = [];
    do {
      // @ts-ignore
      const runs = await openai.beta.threads.runs.list(thread.id);
      for (const run of runs.data) {
        if (run.status === 'requires_action') {
          await monitorRun(run);
        }
      }

      const run = await getRun(runId);

      if (!run) return [];
      if (run.status === 'completed') {
        const messagesRefs = await getMessages({
          order: 'asc',
          after: last_message_id
        });

        for (const messageRef of messagesRefs) {
          const message = await getMessage(messageRef.id);
          messages = [...messages, message];
        }

        break;
      }
      await new Promise((res) => setTimeout(res, 2000));
    } while (true);
    return messages;
  }

  /**
   * @param {import('openai').OpenAI.Beta.Threads.MessageCreateParams} newMessage
   * @returns {Promise<void>}
   */
  async function createMessage(newMessage) {
    // @ts-ignore
    const message = await openai.beta.threads.messages.create(thread.id, newMessage);
    messages = [...messages, message];
  }

  return {
    id,
    created_at,
    description,
    file_ids,
    instructions,
    metadata,
    model,
    name,
    object,
    tools,

    /**
     * @returns {import('openai').OpenAI.Beta.Assistant}
     */
    get assistant() {
      return {
        id,
        created_at,
        description,
        file_ids,
        instructions,
        metadata,
        model,
        name,
        object,
        tools
      };
    },

    /**
     * @returns {import('openai').OpenAI.Beta.Thread}
     */
    get thread() {
      // @ts-ignore
      return thread;
    },

    /**
     * @returns {Array<import('openai').OpenAI.Beta.Threads.ThreadMessage>}
     */
    get messages() {
      return messages;
    },

    /**
     * @returns {Array<string>}
     */
    get runs() {
      return runs;
    },

    /**
     * @param {string} name
     * @param {Function} fn
     */
    addFunction: (name, fn) => {
      functions[name] = fn;
    },

    /**
     * @param {string} content
     * @returns {Promise<void>}
     */
    createUserMessage: async (content) => {
      await createMessage({
        role: 'user',
        content
      });
    },

    /**
     * @returns {Promise<void>}
     */
    async run() {
      // @ts-ignore
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: id
      });
      await monitorRun(run);
      const msgs = await poller(run.id, messages[messages.length - 1]?.id);
      messages = [...messages, ...msgs];
    },

    async reset() {
      // @ts-ignore
      await openai.beta.threads.del(thread.id);
      await openai.beta.threads.create().then((t) => {
        messages = [];
        thread = new Thread(t.id, t.created_at, t.metadata);
      });
    }
  };
}

class Thread {
  /** @type {import('openai').OpenAI */
  static openai;

  /** @type {string} */
  _id = '';

  /** @type {string} */
  _object = 'thread';

  /** @type {number} */
  _created_at = 0;

  /** @type {unknown} */
  _metadata = {};

  /**
   * @param {import('openai').OpenAI} openai
   * @param {string | undefined} id
   */
  static async threadFactory(openai, id) {
    // Retrieve or create the thread
    if (id) {
      return await openai.beta.threads
        .retrieve(id)
        .then(async (thread) => {
          return new Thread(thread.id, thread.created_at, thread.metadata);
        })
        .catch(async () => {
          return await openai.beta.threads.create().then((thread) => {
            return new Thread(thread.id, thread.created_at, thread.metadata);
          });
        });
    } else {
      return await openai.beta.threads.create().then((thread) => {
        return new Thread(thread.id, thread.created_at, thread.metadata);
      });
    }
  }

  /**
   * @constructor
   * @param {string} id
   * @param {number} created_at
   * @param {unknown} metadata
   */
  constructor(id, created_at, metadata) {
    this._id = id;
    this._created_at = created_at;
    this._metadata = metadata;
  }

  /**
   * @returns {string}
   */
  get id() {
    return this._id;
  }
}

export default Assistant;
