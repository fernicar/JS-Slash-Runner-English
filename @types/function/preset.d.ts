type Preset = {
  settings: {
    /** Maximum context tokens */
    max_context: number;
    /** Maximum completion tokens */
    max_completion_tokens: number;
    /** Number of responses per generation */
    reply_count: number;

    /** Whether to use streaming */
    should_stream: boolean;

    /** Temperature */
    temperature: number;
    /** Frequency penalty */
    frequency_penalty: number;
    /** Presence penalty */
    presence_penalty: number;
    top_p: number;
    /** Repetition penalty */
    repetition_penalty: number;
    min_p: number;
    top_k: number;
    top_a: number;

    /** Seed, -1 for random */
    seed: number;

    /** Squash system messages: Merge consecutive system messages into a single message */
    squash_system_messages: boolean;

    /** Reasoning effort, i.e., the depth of the built-in Chain of Thought (CoT). For example, if SillyTavern is directly connected to gemini-2.5-flash, `min` will disable the built-in CoT */
    reasoning_effort: 'auto' | 'min' | 'low' | 'medium' | 'high' | 'max';
    /** Request thoughts: Allow the model to return the thinking process of the built-in CoT; Note that this only affects whether the CoT is displayed, not whether the model uses it */
    request_thoughts: boolean;
    /** Request images: Allow the model to return images in responses */
    request_images: boolean;
    /** Enable function calling: Allow the model to use function calling features; e.g., Cursor uses this to read/write files or run commands in responses */
    enable_function_calling: boolean;
    /** Enable web search: Allow the model to use web search features */
    enable_web_search: boolean;

    /** Whether to allow sending images as prompts */
    allow_sending_images: 'disabled' | 'auto' | 'low' | 'high';
    /** Whether to allow sending videos as prompts */
    allow_sending_videos: boolean;

    /**
     * Character name prefix: Whether and how to add a character name prefix to messages
     * - `none`: Do not add
     * - `default`: Add the character name prefix to messages that have a different name than the character card, added to the start of the `content` field (i.e., the message content sent is `Character Name: Message Content`)
     * - `content`: Add the character name prefix to all messages, added to the start of the `content` field (i.e., the message content sent is `Character Name: Message Content`)
     * - `completion`: Write the character name into the `name` field when sending to the model; only supports alphanumeric characters and underscores, not applicable to models like Claude or Google
     */
    character_name_prefix: 'none' | 'default' | 'content' | 'completion';
    /** Wrap user messages in quotes: Wrap all user messages in quotes before sending to the model */
    wrap_user_messages_in_quotes: boolean;
  };

  /** Prompts already added to the prompt list */
  prompts: PresetPrompt[];
  /** Prompts in the dropdown list that have not been added to the prompt list */
  prompts_unused: PresetPrompt[];

  /** Extra fields for binding additional data to the preset */
  extensions: Record<string, any>;
};

type PresetPrompt = {
  /**
   * According to the id, preset prompts are divided into the following three categories:
   * - Normal prompts (`isPresetNormalPrompt`): Prompts that can be manually added on the preset interface
   * - System prompts (`isPresetSystemPrompt`): System prompts set by SillyTavern, which actually have no advantage over manually added prompts, divided into `main`, `nsfw`, `jailbreak`, `enhance_definitions`
   * - Placeholder prompts (`isPresetPlaceholderPrompt`): Used to indicate the insertion position of prompts such as World Info entries, character cards, player characters, chat history, etc., divided into `world_info_before`, `persona_description`, `char_description`, `char_personality`, `scenario`, `world_info_after`, `dialogue_examples`, `chat_history`
   */
  id: LiteralUnion<
    | 'main'
    | 'nsfw'
    | 'jailbreak'
    | 'enhanceDefinitions'
    | 'worldInfoBefore'
    | 'personaDescription'
    | 'charDescription'
    | 'charPersonality'
    | 'scenario'
    | 'worldInfoAfter'
    | 'dialogueExamples'
    | 'chatHistory',
    string
  >;
  name: string;
  enabled: boolean;

  /**
   * Insertion position, only used for normal and placeholder prompts
   *   - `'relative'`: Insert by the relative position of the prompt
   *   - `'in_chat'`: Insert at the corresponding depth of the chat history, requires setting the corresponding `depth` and `order`
   */
  position:
    | {
        type: 'relative';
        depth?: never;
        order?: never;
      }
    | { type: 'in_chat'; depth: number; order: number };
  role: 'system' | 'user' | 'assistant';
  /** Only used for normal and system prompts */
  content?: string;

  /** Extra fields for binding additional data to the preset prompt */
  extra?: Record<string, any>;
};
type PresetNormalPrompt = SetRequired<{ id: string } & Omit<PresetPrompt, 'id'>, 'position' | 'content'>;
type PresetSystemPrompt = SetRequired<
  { id: 'main' | 'nsfw' | 'jailbreak' | 'enhanceDefinitions' } & Omit<PresetPrompt, 'id'>,
  'content'
>;
type PresetPlaceholderPrompt = SetRequired<
  {
    id:
      | 'worldInfoBefore'
      | 'personaDescription'
      | 'charDescription'
      | 'charPersonality'
      | 'scenario'
      | 'worldInfoAfter'
      | 'dialogueExamples'
      | 'chatHistory';
  } & Omit<PresetPrompt, 'id'>,
  'position'
>;
declare function isPresetNormalPrompt(prompt: PresetPrompt): prompt is PresetNormalPrompt;
declare function isPresetSystemPrompt(prompt: PresetPrompt): prompt is PresetSystemPrompt;
declare function isPresetPlaceholderPrompt(prompt: PresetPrompt): prompt is PresetPlaceholderPrompt;

declare const default_preset: Preset;

/**
 * Get the list of preset names
 *
 * @returns List of preset names
 */
declare function getPresetNames(): string[];

/**
 * Get which preset the currently used preset (`'in_use'`) was loaded from.
 *
 * Please note that while the `'in_use'` preset is loaded from the `getLoadedPresetName()` preset, its content may differ.
 *   Recall: After editing a preset in SillyTavern, the changes take effect immediately in the chat (the `'in_use'` preset is updated),
 *   but if we don't click the save button (to save the `'in_use'` content back to the `getLoadedPresetName()` preset), the edits will be lost upon switching presets.
 *
 * @returns Preset name
 */
declare function getLoadedPresetName(): string;

/**
 * Load the `preset_name` preset as the one currently in use (`'in_use'`)
 *
 * @param preset_name Preset name
 * @returns Whether the switch was successful; may fail if the preset does not exist
 */
declare function loadPreset(preset_name: Exclude<string, 'in_use'>): boolean;

/**
 * Create a new `preset_name` preset with the content of `preset`
 *
 * @param preset_name Preset name
 * @param preset Preset content; if not provided, default content will be used
 *
 * @returns Whether the creation was successful; will fail if a preset with the same name already exists or if attempting to create a preset named `'in_use'`
 *
 * @throws An exception will be thrown if duplicate system/placeholder prompts exist in the created preset content
 */
declare function createPreset(preset_name: Exclude<string, 'in_use'>, preset?: Preset): Promise<boolean>;

/**
 * Create or replace a preset named `preset_name` with the content of `preset`
 *
 * @param preset_name Preset name
 * @param preset Preset content; if not provided, default content will be used
 * @param options Optional settings
 *   - `render:'debounced'|'immediate'`: If operating on the `'in_use'` preset, should the UI be re-rendered with debouncing (better performance) or immediately?
 *
 * @returns Returns `true` if created; returns `false` if replaced
 */
declare function createOrReplacePreset(
  preset_name: LiteralUnion<'in_use', string>,
  preset?: Preset,
  { render }?: ReplacePresetOptions,
): Promise<boolean>;

/**
 * Delete the `preset_name` preset
 *
 * @param preset_name Preset name
 *
 * @returns Whether the deletion was successful; may fail if the preset does not exist
 */
declare function deletePreset(preset_name: Exclude<string, 'in_use'>): Promise<boolean>;

/**
 * Rename the `preset_name` preset to `new_name`
 *
 * @param preset_name Preset name
 * @param new_name New name
 *
 * @returns Whether the renaming was successful; may fail if the preset does not exist
 */
declare function renamePreset(preset_name: Exclude<string, 'in_use'>, new_name: string): Promise<boolean>;

/**
 * Get the content of the `preset_name` preset
 *
 * @param preset_name Preset name
 *
 * @returns Preset content
 *
 * @throws An exception will be thrown if the preset does not exist
 */
declare function getPreset(preset_name: LiteralUnion<'in_use', string>): Preset;

type ReplacePresetOptions = {
  /** If operating on the `'in_use'` preset, should the UI be re-rendered with debouncing (better performance) or immediately? */
  render?: 'debounced' | 'immediate';
};
/**
 * Completely replace the content of the `preset_name` preset with `preset`
 *
 * @param preset_name Preset name
 * @param preset Preset content
 * @param options Optional settings
 *   - `render:'debounced'|'immediate'`: If operating on the `'in_use'` preset, should the UI be re-rendered with debouncing (better performance) or immediately?
 *
 * @throws An exception will be thrown if the preset does not exist
 * @throws An exception will be thrown if duplicate system/placeholder prompts exist in the replaced preset content
 *
 * @example
 * // Enable streaming for the preset currently in use
 * const preset = getPreset('in_use');
 * preset.settings.should_stream = true;
 * await replacePreset('in_use', preset);
 *
 * @example
 * // Add a prompt entry to the preset currently in use
 * const preset = getPreset('in_use');
 * preset.prompts.push({
 *   id: 'new_prompt',
 *   name: 'New Prompt',
 *   enabled: true,
 *   position: { type: 'relative' },
 *   role: 'user',
 *   content: 'New prompt content',
 * });
 * await replacePreset('in_use', preset);
 *
 * @example
 * // Copy entries from 'Preset A' to the beginning of 'Preset B' in order
 * const preset_a = getPreset('Preset A');
 * const preset_b = getPreset('Preset B');
 * preset_b.prompts = [...preset_a.prompts, ...preset_b.prompts];
 * await replacePreset('Preset B', preset_b);
 */
declare function replacePreset(
  preset_name: LiteralUnion<'in_use', string>,
  preset: Preset,
  { render }?: ReplacePresetOptions,
): Promise<void>;

type PresetUpdater = ((preset: Preset) => Preset) | ((preset: Preset) => Promise<Preset>);
/**
 * Update the `preset_name` preset using the `updater` function
 *
 * @param preset_name Preset name
 * @param updater Function to update the preset. It should receive the preset content as an argument and return the updated content.
 * @param options Optional settings
 *   - `render:'debounced'|'immediate'`: If operating on the `'in_use'` preset, should the UI be re-rendered with debouncing (better performance) or immediately?
 *
 * @returns Updated preset content
 *
 * @throws An exception will be thrown if the preset does not exist
 * @throws An exception will be thrown if duplicate system/placeholder prompts exist in the replaced preset content
 *
 * @example
 * // Enable streaming for the preset currently in use
 * await updatePresetWith('in_use', preset => {
 *   preset.settings.should_stream = true;
 *   return preset;
 * });
 *
 * @example
 * // Add a prompt entry to the preset currently in use
 * await updatePresetWith('in_use', preset => {
 *   preset.prompts.push({
 *     id: 'new_prompt',
 *     name: 'New Prompt',
 *     enabled: true,
 *     position: { type: 'relative' },
 *     role: 'user',
 *     content: 'New prompt content',
 *   });
 *   return preset;
 * });
 *
 * @example
 * // Copy entries from 'Preset A' to the beginning of 'Preset B' in order
 * await updatePresetWith('Preset B', preset => {
 *   const another_preset = getPreset('Preset A');
 *   preset.prompts = [...another_preset.prompts, ...preset.prompts];
 *   return preset;
 * });
 */
declare function updatePresetWith(
  preset_name: LiteralUnion<'in_use', string>,
  updater: PresetUpdater,
  { render }?: ReplacePresetOptions,
): Promise<Preset>;

/**
 * Patch the preset content back into the preset; if a certain content does not exist, the original value will be used
 *
 * @param preset_name Preset name
 * @param preset Preset content
 * @param options Optional settings
 *   - `render:'debounced'|'immediate'`: If operating on the `'in_use'` preset, should the UI be re-rendered with debouncing (better performance) or immediately?
 *
 * @returns Updated preset content
 *
 * @throws An exception will be thrown if the preset does not exist
 * @throws An exception will be thrown if duplicate system/placeholder prompts exist in the replaced preset content
 *
 * @example
 * // Enable streaming for the preset currently in use
 * await setPreset('in_use', { settings: { should_stream: true } });
 *
 * @example
 * // Copy entries from 'Preset A' to the beginning of 'Preset B' in order
 * await setPreset('Preset B', {
 *   prompts: [...getPreset('Preset A').prompts, ...getPreset('Preset B').prompts],
 * });
 */
declare function setPreset(
  preset_name: LiteralUnion<'in_use', string>,
  preset: PartialDeep<Preset>,
  { render }?: ReplacePresetOptions,
): Promise<Preset>;
