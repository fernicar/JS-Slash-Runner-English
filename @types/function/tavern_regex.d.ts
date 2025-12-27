type FormatAsTavernRegexedStringOption = {
  /** The depth where the text is located; if left blank, the Tavern regex "depth" option is ignored: it will take effect regardless of whether the depth is within the "minimum depth" and "maximum depth" range of the Tavern regex. */
  depth?: number;
  /** Character card name; if left blank, the current character card name is used. */
  character_name?: string;
}

/**
 * Apply Tavern regex to `text`
 *
 * @param text The text to apply Tavern regex to
 * @param source Text source, e.g., from user input or AI output. Corresponds to the Tavern regex "Scope" option.
 * @param destination How the text will be used, e.g., for display or as a prompt. Corresponds to the Tavern regex "Format Display Only" and "Format Prompt Only" options.
 * @param option Optional options
 *   - `depth?:number`: The depth where the text is located; if left blank, the Tavern regex "depth" option is ignored: it will take effect regardless of whether the depth is within the "minimum depth" and "maximum depth" range of the Tavern regex.
 *   - `character_name?:string`: Character card name; if left blank, the current character card name is used.
 *
 * @example
 * // Get the text of the last message, treat it as AI output for display, and apply Tavern regex to it.
 * const message = getChatMessages(-1)[0];
 * const result = formatAsTavernRegexedString(message.message, 'ai_output', 'display', { depth: 0 });
 */
declare function formatAsTavernRegexedString(
  text: string,
  source: 'user_input' | 'ai_output' | 'slash_command' | 'world_info' | 'reasoning',
  destination: 'display' | 'prompt',
  { depth, character_name }?: FormatAsTavernRegexedStringOption,
);

type TavernRegex = {
  id: string;
  script_name: string;
  enabled: boolean;
  run_on_edit: boolean;
  scope: 'global' | 'character';
  find_regex: string;
  replace_string: string;
  source: {
    user_input: boolean;
    ai_output: boolean;
    slash_command: boolean;
    world_info: boolean;
  };
  destination: {
    display: boolean;
    prompt: boolean;
  };
  min_depth: number | null;
  max_depth: number | null;
}

/**
 * Determine if local (character) regexes are enabled
 */
declare function isCharacterTavernRegexesEnabled(): boolean;

type GetTavernRegexesOption = {
  scope?: 'all' | 'global' | 'character';
  enable_state?: 'all' | 'enabled' | 'disabled';
}

/**
 * Get Tavern regexes
 *
 * @param option Optional options
 *   - `scope?:'all'|'global'|'character'`:         // Filter Tavern regexes by area; defaults to `'all'`
 *   - `enable_state?:'all'|'enabled'|'disabled'`:  // Filter Tavern regexes by whether they are enabled; defaults to `'all'`
 *
 * @returns An array where elements are `TavernRegex`. The array is sorted by the order in which the regexes are applied to the text, i.e., the order they appear from top to bottom in the Tavern UI.
 */
declare function getTavernRegexes({ scope, enable_state }?: GetTavernRegexesOption): TavernRegex[];

type ReplaceTavernRegexesOption = {
  scope?: 'all' | 'global' | 'character';
}

/**
 * Completely replace Tavern regexes with `regexes`.
 * - **This is a slow operation!** Try to perform all operations on regexes before calling replaceTavernRegexes once.
 * - **To re-apply regexes, it reloads the entire chat message history**, which triggers `tavern_events.CHAT_CHANGED` and reloads message blocks.
 *
 * This direct function is provided because you might need to reorder regexes, etc.
 *
 * @param regexes Tavern regexes to use for replacement
 * @param option Optional options
 *   - scope?: 'all' | 'global' | 'character';  // The portion of Tavern regexes to replace; defaults to 'all'
 */
declare function replaceTavernRegexes(regexes: TavernRegex[], { scope }: ReplaceTavernRegexesOption): Promise<void>;

type TavernRegexUpdater =
  | ((regexes: TavernRegex[]) => TavernRegex[])
  | ((regexes: TavernRegex[]) => Promise<TavernRegex[]>);

/**
 * Update Tavern regexes using the `updater` function
 *
 * @param updater Function used to update Tavern regexes. It should receive Tavern regexes as an argument and return the updated Tavern regexes.
 * @param option Optional options
 *   - scope?: 'all' | 'global' | 'character';  // The portion of Tavern regexes to replace; defaults to 'all'
 *
 * @returns Updated Tavern regexes
 *
 * @example
 * // Enable all regexes with "Stage Girl" in their name
 * await updateTavernRegexesWith(regexes => {
 *   regexes.forEach(regex => {
 *     if (regex.script_name.includes('Stage Girl')) {
 *       regex.enabled = true;
 *     }
 *   });
 *   return regexes;
 * });
 */
declare function updateTavernRegexesWith(
  updater: TavernRegexUpdater,
  option?: ReplaceTavernRegexesOption,
): Promise<TavernRegex[]>;
