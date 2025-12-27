/**
 * Custom API configuration
 */
type CustomApiConfig = {
  /** Custom API URL */
  apiurl: string;
  /** API Key */
  key?: string;
  /** Model Name */
  model: string;
  /** API Source, defaults to 'openai' */
  source?: string;

  /** Maximum response tokens length */
  max_tokens?: 'same_as_preset' | 'unset' | number;
  /** Temperature */
  temperature?: 'same_as_preset' | 'unset' | number;
  /** Frequency penalty */
  frequency_penalty?: 'same_as_preset' | 'unset' | number;
  /** Presence penalty */
  presence_penalty?: 'same_as_preset' | 'unset' | number;
  top_p?: 'same_as_preset' | 'unset' | number;
  top_k?: 'same_as_preset' | 'unset' | number;
};

type GenerateConfig = {
  /** User input */
  user_input?: string;

  /**
   * Image input, supports the following formats:
   * - File object: File object obtained via input[type="file"]
   * - Base64 string: Base64 encoding of the image
   * - URL string: Online address of the image
   */
  image?: File | string | (File | string)[];

  /**
   * Whether to enable streaming; defaults to `false`.
   *
   * If streaming is enabled, the function will emit events every time a streaming result is received:
   * - `iframe_events.STREAM_TOKEN_RECEIVED_FULLY`: Listen to it to get the current full text of the stream ("This", "This is", "This is a stream")
   * - `iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY`: Listen to it to get the current incremental text of the stream ("This", " is", " a stream")
   *
   * @example
   * eventOn(iframe_events.STREAM_TOKEN_RECEIVED_FULLY, text => console.info(text));
   */
  should_stream?: boolean;

  /**
   * Override options. If set, the fields provided in `overrides` will overwrite the corresponding prompts.
   *   e.g., `overrides.char_description = 'overridden character description';` will overwrite the character description.
   */
  overrides?: Overrides;

  /** Prompts to be additionally injected */
  injects?: Omit<InjectionPrompt, 'id'>[];

  /** Maximum number of chat history entries to use; defaults to 'all' */
  max_chat_history?: 'all' | number;

  /** Custom API configuration */
  custom_api?: CustomApiConfig;

  /**
   * Unique ID
   *
   * Allows concurrent generations and specific generation can be stopped via stopGenerateById. Defaults to a UUID if not set. This ID will also be returned in emitted events.
   */
  generation_id?: string;
};

type GenerateRawConfig = {
  /**
   * User input.
   *
   * If set, the user input prompt will be added regardless of whether 'user_input' is in ordered_prompts; by default, it is added at the end of 'chat_history'.
   */
  user_input?: string;

  /**
   * Image input, supports the following formats:
   * - File object: File object obtained via input[type="file"]
   * - Base64 string: Base64 encoding of the image
   * - URL string: Online address of the image
   */
  image?: File | string | (File | string)[];

  /**
   * Whether to enable streaming; defaults to `false`.
   *
   * If streaming is enabled, the function will emit events every time a streaming result is received:
   * - `ifraem_events.STREAM_TOKEN_RECEIVED_FULLY`: Listen to it to get the current full text of the stream ("This", "This is", "This is a stream")
   * - `iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY`: Listen to it to get the current incremental text of the stream ("This", " is", " a stream")
   *
   * @example
   * eventOn(iframe_events.STREAM_TOKEN_RECEIVED_FULLY, text => console.info(text));
   */
  should_stream?: boolean;

  /**
   * Override options. If set, the fields provided in `overrides` will overwrite the corresponding prompts.
   *   e.g., `overrides.char_description = 'overridden character description';` will overwrite the prompts
   */
  overrides?: Overrides;

  injects?: Omit<InjectionPrompt, 'id'>[];

  /**
   * A prompt array where elements are sent to the AI in order, serving as a custom preset. This array allows two types:
   * - `BuiltinPrompt`: Built-in prompts. Since no preset is used, you must manually specify which ones to use (e.g., "character description") and their order.
   *                      If you don't want to specify manually, you can get the order used by the Tavern's default preset via `builtin_prompt_default_order` (though in that case, you might prefer using `generate`).
   * - `RolePrompt`: Additionally provided prompts.
   */
  ordered_prompts?: (BuiltinPrompt | RolePrompt)[];

  /** Maximum number of chat history entries to use; defaults to 'all' */
  max_chat_history?: 'all' | number;

  /** Custom API configuration */
  custom_api?: CustomApiConfig;

  /**
   * Unique ID
   *
   * Allows concurrent generations and specific generation can be stopped via stopGenerateById. Defaults to a UUID if not set. This ID will also be returned in emitted events.
   */
  generation_id?: string;
};

type RolePrompt = {
  role: 'system' | 'assistant' | 'user';
  content: string;
  image?: File | string | (File | string)[];
};

type Overrides = {
  world_info_before?: string;
  persona_description?: string;
  char_description?: string;
  char_personality?: string;
  scenario?: string;
  world_info_after?: string;
  dialogue_examples?: string;

  /**
   * Chat History
   * - `with_depth_entries`: Whether to enable world info entries inserted by depth; defaults to `true`
   * - `author_note`: If set, overrides "Author's Note" with the given string
   * - `prompts`: If set, overrides "Chat History" with the given prompts
   */
  chat_history?: {
    with_depth_entries?: boolean;
    author_note?: string;
    prompts?: RolePrompt[];
  };
};

/**
 * Default order of built-in prompts set by the preset
 */
declare const builtin_prompt_default_order: BuiltinPrompt[];

type BuiltinPrompt =
  | 'world_info_before'
  | 'persona_description'
  | 'char_description'
  | 'char_personality'
  | 'scenario'
  | 'world_info_after'
  | 'dialogue_examples'
  | 'chat_history'
  | 'user_input';

/**
 * Uses the currently enabled Tavern preset to let the AI generate a text segment.
 *
 * During execution, this function will emit the following events:
 * - `iframe_events.GENERATION_STARTED`: Generation started
 * - If streaming is enabled, `iframe_events.STREAM_TOKEN_RECEIVED_FULLY`: Listen to it to get the current full text of the stream ("This", "This is", "This is a stream")
 * - If streaming is enabled, `iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY`: Listen to it to get the current incremental text of the stream ("This", " is", " a stream")
 * - `iframe_events.GENERATION_ENDED`: Generation ended. Listen to it to get the final generated text (also available via the function's return value)
 *
 * @param config Prompt and generation method settings
 *   - `user_input?:string`: User input
 *   - `should_stream?:boolean`: Whether to enable streaming; defaults to 'false'
 *   - `image?:File|string`: Image input
 *   - `overrides?:Overrides`: Override options. If set, the fields provided in `overrides` will overwrite the corresponding prompts. e.g., `overrides.char_description = 'overridden character description';` will overwrite the character description
 *   - `injects?:Omit<InjectionPrompt, 'id'>[]`: Prompts to be additionally injected
 *   - `max_chat_history?:'all'|number`: Maximum number of chat history entries to use
 * @returns The final generated text
 *
 * @example
 * // Streaming generation
 * const result = await generate({ user_input: 'Hello', should_stream: true });
 *
 * @example
 * // Image input
 * const result = await generate({ user_input: 'Hello', image: 'https://example.com/image.jpg' });
 *
 * @example
 * // Inject and override prompts
 * const result = await generate({
 *   user_input: 'Hello',
 *   injects: [{ role: 'system', content: 'Chain of thought...', position: 'in_chat', depth: 0, should_scan: true, }]
 *   overrides: {
 *     char_personality: 'Gentle',
 *     world_info_before: '',
 *     chat_history: {
 *       prompts: [],
 *     }
 *   }
 * });
 *
 * @example
 * // Use custom API
 * const result = await generate({
 *   user_input: 'Hello',
 *   custom_api: {
 *     apiurl: 'https://your-proxy-url.com',
 *     key: 'your-api-key',
 *     model: 'gpt-4',
 *     source: 'openai'
 *   }
 * });
 */
declare function generate(config: GenerateConfig): Promise<string>;

/**
 * Generates a text segment via AI without using the current Tavern preset.
 *
 * During execution, this function will emit the following events:
 * - `iframe_events.GENERATION_STARTED`: Generation started
 * - If streaming is enabled, `iframe_events.STREAM_TOKEN_RECEIVED_FULLY`: Listen to it to get the current full text of the stream ("This", "This is", "This is a stream")
 * - If streaming is enabled, `iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY`: Listen to it to get the current incremental text of the stream ("This", " is", " a stream")
 * - `iframe_events.GENERATION_ENDED`: Generation ended. Listen to it to get the final generated text (also available via the function's return value)
 *
 * @param config Prompt and generation method settings
 *   - `user_input?:string`: User input
 *   - `should_stream?:boolean`: Whether to enable streaming; defaults to 'false'
 *   - `image?:File|string`: Image input
 *   - `overrides?:Overrides`: Override options. If set, the fields provided in `overrides` will overwrite the corresponding prompts. e.g., `overrides.char_description = 'overridden character description';` will overwrite the character description
 *   - `injects?:Omit<InjectionPrompt, 'id'>[]`: Prompts to be additionally injected
 *   - `max_chat_history?:'all'|number`: Maximum number of chat history entries to use
 *   - `ordered_prompts?:(BuiltinPrompt|RolePrompt)[]`: A prompt array where elements are sent to the AI in order, serving as a custom preset
 * @returns The final generated text
 *
 * @example
 * // Custom built-in prompt order; prompts not given in ordered_prompts will not be used
 * const result = await generateRaw({
 *   user_input: 'Hello',
 *   ordered_prompts: [
 *     'char_description',
 *     { role: 'system', content: 'System prompt' },
 *     'chat_history',
 *     'user_input',
 *   ]
 * })
 *
 * @example
 * // Use custom API and custom prompt order
 * const result = await generateRaw({
 *   user_input: 'Hello',
 *   custom_api: {
 *     apiurl: 'https://your-proxy-url.com',
 *     key: 'your-api-key',
 *     model: 'gpt-4',
 *     source: 'openai'
 *   },
 *   ordered_prompts: [
 *     'char_description',
 *     'chat_history',
 *     'user_input',
 *   ]
 * })
 */
declare function generateRaw(config: GenerateRawConfig): Promise<string>;

/**
 * Stops a specific generation process based on the generation ID
 *
 * @param generationId The generation ID used to identify the process to stop
 * @returns Promise<boolean> Returns whether the generation was successfully stopped
 */
declare function stopGenerationById(generationId: string): Promise<boolean>;

/**
 * Stops all ongoing generation processes
 *
 * @returns Promise<boolean> Returns whether all generations were successfully stopped
 */
declare function stopAllGeneration(): Promise<boolean>;
